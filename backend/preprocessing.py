import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, Optional

def auto_detect_columns(df: pd.DataFrame) -> Tuple[str, str]:
    """
    Automatically detects the date/time column and numerical target column.
    """
    date_col = None
    target_col = None

    # Common date keywords
    date_keywords = ['date', 'datetime', 'time', 'timestamp', 'day', 'dt', 'period']
    
    # 1. Search for matching column names for date
    for col in df.columns:
        clean_col = str(col).strip().lower()
        if any(kw in clean_col for kw in date_keywords):
            date_col = col
            break
            
    # If no date col found by keyword, try parsing columns as dates
    if not date_col:
        for col in df.columns:
            if df[col].dtype == 'object' or 'datetime' in str(df[col].dtype):
                try:
                    pd.to_datetime(df[col].iloc[:10], errors='raise')
                    date_col = col
                    break
                except Exception:
                    continue

    # Default date column to first column if still not found
    if not date_col:
        date_col = df.columns[0]

    # 2. Search for numerical target column (excluding date column)
    numeric_cols = []
    for col in df.columns:
        if col == date_col:
            continue
        # Check if convertible to numeric
        converted = pd.to_numeric(df[col], errors='coerce')
        if not converted.isna().all():
            numeric_cols.append(col)

    if numeric_cols:
        target_col = numeric_cols[0]
    else:
        # Fallback to second column or any non-date column
        remaining = [c for c in df.columns if c != date_col]
        target_col = remaining[0] if remaining else df.columns[0]

    return str(date_col), str(target_col)


def preprocess_dataset(
    df: pd.DataFrame, 
    date_col: Optional[str] = None, 
    target_col: Optional[str] = None
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Preprocesses the time series dataset:
    - Autodetects or validates columns
    - Parses dates & sorts chronologically
    - Removes duplicates
    - Converts target to numeric
    - Interpolates missing values
    - Calculates data cleaning summary statistics
    """
    original_records = len(df)
    
    # Autodetect columns if not provided
    if not date_col or date_col not in df.columns or not target_col or target_col not in df.columns:
        auto_date, auto_target = auto_detect_columns(df)
        if not date_col or date_col not in df.columns:
            date_col = auto_date
        if not target_col or target_col not in df.columns:
            target_col = auto_target

    # Create working copy
    clean_df = df[[date_col, target_col]].copy()
    
    # Standardize column names for downstream modules
    clean_df.columns = ['Date', 'Value']

    # Convert Date column to datetime
    clean_df['Date'] = pd.to_datetime(clean_df['Date'], errors='coerce')
    
    # Remove rows where Date is NaT
    clean_df = clean_df.dropna(subset=['Date'])
    
    # Convert Value column to float
    clean_df['Value'] = pd.to_numeric(clean_df['Value'], errors='coerce')

    # Calculate initial missing target values
    missing_values_count = int(clean_df['Value'].isna().sum())

    # Remove duplicates on Date (keep first occurrence)
    initial_len = len(clean_df)
    clean_df = clean_df.drop_duplicates(subset=['Date'], keep='first')
    duplicate_rows_removed = initial_len - len(clean_df)

    # Sort chronologically
    clean_df = clean_df.sort_values(by='Date').reset_index(drop=True)

    # Interpolate missing values in target
    if clean_df['Value'].isna().any():
        clean_df['Value'] = clean_df['Value'].interpolate(method='linear')
        clean_df['Value'] = clean_df['Value'].bfill().ffill()

    clean_records = len(clean_df)

    # Format Date back to string YYYY-MM-DD
    date_start = clean_df['Date'].min().strftime('%Y-%m-%d') if not clean_df.empty else 'N/A'
    date_end = clean_df['Date'].max().strftime('%Y-%m-%d') if not clean_df.empty else 'N/A'
    
    # Infer frequency
    inferred_freq = pd.infer_freq(clean_df['Date'])
    if inferred_freq is None:
        if len(clean_df) > 1:
            diff_days = (clean_df['Date'].iloc[1] - clean_df['Date'].iloc[0]).days
            if diff_days == 1:
                frequency_str = "Daily (1 Day)"
            elif diff_days == 7:
                frequency_str = "Weekly (7 Days)"
            elif 28 <= diff_days <= 31:
                frequency_str = "Monthly"
            else:
                frequency_str = f"Custom ({diff_days} Days)"
        else:
            frequency_str = "Unknown"
    else:
        frequency_str = f"Inferred ({inferred_freq})"

    clean_df['Date_Str'] = clean_df['Date'].dt.strftime('%Y-%m-%d')

    summary = {
        "original_records": original_records,
        "clean_records": clean_records,
        "missing_values_handled": missing_values_count,
        "duplicate_rows_removed": duplicate_rows_removed,
        "date_column": date_col,
        "target_column": target_col,
        "date_start": date_start,
        "date_end": date_end,
        "data_frequency": frequency_str,
        "num_columns": len(df.columns),
        "columns_list": list(df.columns)
    }

    return clean_df, summary


def compute_eda_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes statistical analysis and trend direction for EDA section.
    """
    values = df['Value'].values
    if len(values) == 0:
        return {}

    mean_val = float(np.mean(values))
    std_val = float(np.std(values))
    min_val = float(np.min(values))
    max_val = float(np.max(values))

    # Trend direction via simple linear regression slope or first/last quarter comparison
    if len(values) >= 5:
        x = np.arange(len(values))
        slope, _ = np.polyfit(x, values, 1)
        # Calculate percentage change over period
        pct_change = (values[-1] - values[0]) / max(abs(values[0]), 1e-5) * 100
        if slope > 0.05 and pct_change > 3:
            trend_direction = "Increasing"
        elif slope < -0.05 and pct_change < -3:
            trend_direction = "Decreasing"
        else:
            trend_direction = "Stable"
    else:
        trend_direction = "Stable"

    # Compute 7-day and 14-day moving averages for plotting
    df_copy = df.copy()
    df_copy['ma_7'] = df_copy['Value'].rolling(window=7, min_periods=1).mean()
    df_copy['ma_14'] = df_copy['Value'].rolling(window=14, min_periods=1).mean()

    chart_data = []
    for _, row in df_copy.iterrows():
        chart_data.append({
            "date": row['Date_Str'],
            "actual": round(float(row['Value']), 2),
            "ma7": round(float(row['ma_7']), 2),
            "ma14": round(float(row['ma_14']), 2)
        })

    return {
        "mean": round(mean_val, 2),
        "std_dev": round(std_val, 2),
        "min": round(min_val, 2),
        "max": round(max_val, 2),
        "trend_direction": trend_direction,
        "total_count": len(values),
        "chart_data": chart_data
    }
