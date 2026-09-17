import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings

# Ignore non-critical statsmodels warnings
warnings.filterwarnings('ignore')

def calculate_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculates Mean Absolute Percentage Error cleanly avoiding division by zero."""
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero_mask = y_true != 0
    if not np.any(non_zero_mask):
        return 0.0
    return float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100)

def train_and_forecast(
    df: pd.DataFrame, 
    horizon: int = 14
) -> Dict[str, Any]:
    """
    Fits time series forecasting model (ARIMA primary, Linear Regression fallback).
    Evaluates on 80/20 chronological split and produces multi-step future forecasts.
    """
    if len(df) < 10:
        raise ValueError("Dataset requires at least 10 observations for time-series forecasting.")

    series = df['Value'].values
    dates = pd.to_datetime(df['Date']).values

    # Chronological 80/20 Train/Test split
    train_size = int(len(series) * 0.8)
    if train_size < 5 or (len(series) - train_size) < 2:
        train_size = len(series) - 2

    train_data = series[:train_size]
    test_data = series[train_size:]
    test_dates = dates[train_size:]

    model_used = "ARIMA(1,1,1)"
    is_fallback = False
    error_msg = None

    test_predictions = []
    future_forecast = []

    # 1. Primary Attempt: ARIMA
    try:
        from statsmodels.tsa.arima.model import ARIMA
        
        # Fit model on training set to evaluate test set predictions
        arima_train = ARIMA(train_data, order=(1, 1, 1))
        arima_train_fit = arima_train.fit()
        test_predictions = arima_train_fit.forecast(steps=len(test_data))

        # Fit model on full dataset for future forecasting
        arima_full = ARIMA(series, order=(1, 1, 1))
        arima_full_fit = arima_full.fit()
        future_forecast = arima_full_fit.forecast(steps=horizon)

    except Exception as e:
        # 2. Fallback Attempt: Linear Trend Regression
        model_used = "Linear Trend (Fallback)"
        is_fallback = True
        error_msg = f"ARIMA convergence error ({str(e)}). Used Linear Trend fallback model."
        
        # Fit linear trend model
        x_train = np.arange(len(train_data)).reshape(-1, 1)
        x_test = np.arange(len(train_data), len(series)).reshape(-1, 1)
        x_full = np.arange(len(series)).reshape(-1, 1)
        x_future = np.arange(len(series), len(series) + horizon).reshape(-1, 1)

        from sklearn.linear_model import LinearRegression
        lr = LinearRegression()
        lr.fit(x_train, train_data)
        test_predictions = lr.predict(x_test)

        lr_full = LinearRegression()
        lr_full.fit(x_full, series)
        future_forecast = lr_full.predict(x_future)

    # Convert predictions to clean numpy arrays
    test_predictions = np.array(test_predictions)
    future_forecast = np.array(future_forecast)

    # Compute Train/Test Evaluation Metrics
    mae = float(mean_absolute_error(test_data, test_predictions))
    rmse = float(np.sqrt(mean_squared_error(test_data, test_predictions)))
    mape = float(calculate_mape(test_data, test_predictions))

    # Generate future dates
    last_date = pd.to_datetime(df['Date'].iloc[-1])
    future_dates = [last_date + pd.Timedelta(days=i+1) for i in range(horizon)]
    future_date_strs = [d.strftime('%Y-%m-%d') for d in future_dates]

    # Build Visualization chart data combining Historical, Test Predictions, and Future Forecast
    chart_series = []
    
    # Historical & Test predictions overlay
    for i, row in df.iterrows():
        d_str = row['Date_Str']
        val = round(float(row['Value']), 2)
        item = {
            "date": d_str,
            "actual": val,
            "predicted": None,
            "forecast": None
        }
        # Fill test predicted value if in test set
        if i >= train_size:
            test_idx = i - train_size
            if test_idx < len(test_predictions):
                item["predicted"] = round(float(test_predictions[test_idx]), 2)
        
        chart_series.append(item)

    # Bridge connection: add last historical point as starting forecast point for visual continuity
    if chart_series:
        chart_series[-1]["forecast"] = chart_series[-1]["actual"]

    # Append Future Forecast points
    for d_str, f_val in zip(future_date_strs, future_forecast):
        chart_series.append({
            "date": d_str,
            "actual": None,
            "predicted": None,
            "forecast": round(float(f_val), 2)
        })

    # Summary Stats of the Future Forecast
    avg_forecast = float(np.mean(future_forecast))
    max_forecast = float(np.max(future_forecast))
    min_forecast = float(np.min(future_forecast))
    
    # Overall trend of future forecast
    if horizon > 1:
        if future_forecast[-1] > future_forecast[0] + 0.5:
            forecast_trend = "Increasing"
        elif future_forecast[-1] < future_forecast[0] - 0.5:
            forecast_trend = "Decreasing"
        else:
            forecast_trend = "Stable"
    else:
        forecast_trend = "Stable"

    return {
        "model_used": model_used,
        "is_fallback": is_fallback,
        "error_message": error_msg,
        "horizon": horizon,
        "metrics": {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2)
        },
        "forecast_summary": {
            "start_date": future_date_strs[0] if future_date_strs else "N/A",
            "end_date": future_date_strs[-1] if future_date_strs else "N/A",
            "average_forecast": round(avg_forecast, 2),
            "highest_forecast": round(max_forecast, 2),
            "lowest_forecast": round(min_forecast, 2),
            "overall_trend": forecast_trend
        },
        "chart_series": chart_series,
        "train_size": train_size,
        "test_size": len(test_data)
    }
