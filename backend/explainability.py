import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import RandomForestRegressor

def build_lag_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, List[str]]:
    """
    Constructs lag and rolling window features for time series explainability.
    Features: lag_1, lag_2, lag_3, lag_7, rolling_mean_7, rolling_mean_14
    """
    feature_df = pd.DataFrame(index=df.index)
    series = df['Value']

    # Lag features
    feature_df['lag_1'] = series.shift(1)
    feature_df['lag_2'] = series.shift(2)
    feature_df['lag_3'] = series.shift(3)
    feature_df['lag_7'] = series.shift(7)

    # Rolling average features
    feature_df['rolling_mean_7'] = series.shift(1).rolling(window=7, min_periods=1).mean()
    feature_df['rolling_mean_14'] = series.shift(1).rolling(window=14, min_periods=1).mean()

    # Target variable
    y = series.copy()

    # Feature names
    feature_names = ['lag_1', 'lag_2', 'lag_3', 'lag_7', 'rolling_mean_7', 'rolling_mean_14']

    # Drop initial NaN rows caused by shifting
    valid_idx = feature_df.dropna().index
    X_clean = feature_df.loc[valid_idx]
    y_clean = y.loc[valid_idx]

    return X_clean, y_clean, feature_names


def generate_explainability(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Trains a Random Forest regressor on lag features and computes SHAP values / feature importance.
    Generates dynamic explanations suitable for viva presentation.
    """
    if len(df) < 15:
        return {
            "error": "Dataset requires at least 15 rows for feature engineering and SHAP explainability."
        }

    X, y, feature_names = build_lag_features(df)
    
    if len(X) < 5:
        return {
            "error": "Insufficient clean observations after creating 7-day lag features."
        }

    # Train Random Forest Regressor auxiliary model
    rf = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=6)
    rf.fit(X, y)

    # Calculate SHAP values or feature importances fallback
    shap_available = True
    shap_importance = {}
    
    try:
        import shap
        explainer = shap.TreeExplainer(rf)
        shap_values = explainer.shap_values(X)
        
        # Mean absolute SHAP value for each feature (Global Feature Importance)
        if isinstance(shap_values, list):
            shap_abs_mean = np.mean(np.abs(shap_values[0]), axis=0)
        else:
            shap_abs_mean = np.mean(np.abs(shap_values), axis=0)

        for name, val in zip(feature_names, shap_abs_mean):
            shap_importance[name] = float(val)

    except Exception as e:
        shap_available = False
        # Fallback to Random Forest feature importances
        for name, val in zip(feature_names, rf.feature_importances_):
            shap_importance[name] = float(val)

    # Friendly human-readable feature labels
    label_map = {
        "lag_1": "1-Day Previous Value (Lag 1)",
        "lag_2": "2-Day Previous Value (Lag 2)",
        "lag_3": "3-Day Previous Value (Lag 3)",
        "lag_7": "7-Day Previous Value (Lag 7)",
        "rolling_mean_7": "7-Day Moving Average",
        "rolling_mean_14": "14-Day Moving Average"
    }

    # Format global feature importance list sorted by magnitude
    sorted_features = sorted(shap_importance.items(), key=lambda x: x[1], reverse=True)
    
    global_importance_chart = []
    max_score = max(shap_importance.values()) if shap_importance.values() else 1.0
    
    for feat, score in sorted_features:
        pct = (score / max_score) * 100 if max_score > 0 else 0
        global_importance_chart.append({
            "feature": feat,
            "label": label_map.get(feat, feat),
            "score": round(float(score), 4),
            "percentage": round(float(pct), 1)
        })

    most_influential_key = sorted_features[0][0]
    most_influential_label = label_map.get(most_influential_key, most_influential_key)

    # Analyze local contribution of latest row
    latest_X = X.iloc[-1:]
    latest_pred = float(rf.predict(latest_X)[0])
    recent_val = float(df['Value'].iloc[-1])
    prev_val = float(df['Value'].iloc[-2]) if len(df) >= 2 else recent_val
    ma7_val = float(df['Value'].tail(7).mean())
    ma14_val = float(df['Value'].tail(14).mean())

    # Build dynamic textual narrative explaining why forecast changed
    narrative_lines = []
    
    if recent_val > prev_val:
        trend_obs = "an upward momentum in recent observations"
    elif recent_val < prev_val:
        trend_obs = "a downward momentum in recent observations"
    else:
        trend_obs = "a steady pattern in recent observations"

    narrative_lines.append(
        f"The recent historical values show {trend_obs}, with the latest observation recorded at {round(recent_val, 2)}."
    )

    narrative_lines.append(
        f"The model's strongest prediction factor is '{most_influential_label}', which heavily guides the direction of upcoming predicted values."
    )

    if ma7_val > ma14_val:
        narrative_lines.append(
            f"The 7-day moving average ({round(ma7_val, 2)}) is currently above the 14-day moving average ({round(ma14_val, 2)}), indicating a short-term bullish trend."
        )
    else:
        narrative_lines.append(
            f"The 7-day moving average ({round(ma7_val, 2)}) is currently below the 14-day moving average ({round(ma14_val, 2)}), indicating short-term moderation."
        )

    narrative_lines.append(
        "Notice: Feature influence indicates statistical model attribution based on historical correlations, not direct causal relationships."
    )

    dynamic_text_explanation = " ".join(narrative_lines)

    # Feature descriptions dictionary for beginner-friendly viva explanations
    feature_explanations = {
        "lag_1": "Lag 1 measures the immediate prior day's value. High contribution means short-term memory is dominant.",
        "lag_2": "Lag 2 measures the value 2 days ago, providing short-range historical baseline.",
        "lag_3": "Lag 3 captures 3-day recency context to smooth out single-day spikes.",
        "lag_7": "Lag 7 captures weekly periodicity (e.g. same day of the week correlation).",
        "rolling_mean_7": "7-day moving average captures smooth weekly trend and filters out day-to-day noise.",
        "rolling_mean_14": "14-day moving average captures medium-term baseline trend stability."
    }

    return {
        "shap_available": shap_available,
        "most_influential_feature": most_influential_label,
        "most_influential_raw": most_influential_key,
        "positive_influence": f"Recent values ({round(recent_val, 2)}) & {most_influential_label}",
        "negative_influence": "Historical variance and unexpected day-to-day fluctuations",
        "trend_driver": label_map.get(sorted_features[1][0], sorted_features[1][0]) if len(sorted_features) > 1 else most_influential_label,
        "feature_importance_chart": global_importance_chart,
        "dynamic_explanation": dynamic_text_explanation,
        "feature_explanations": feature_explanations,
        "latest_observation": {
            "recent_value": round(recent_val, 2),
            "ma_7": round(ma7_val, 2),
            "ma_14": round(ma14_val, 2),
            "predicted_next": round(latest_pred, 2)
        }
    }
