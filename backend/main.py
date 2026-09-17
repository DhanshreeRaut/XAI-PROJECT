import io
import os
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, Dict, Any

from preprocessing import preprocess_dataset, compute_eda_summary
from forecasting import train_and_forecast
from explainability import generate_explainability

app = FastAPI(
    title="Explainable Time Series Forecasting API",
    description="Academic B.Tech AIML API for Time-Series ARIMA Forecasting & SHAP Explainability",
    version="1.0.0"
)

# Enable CORS for React frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory dataset store for easy workflow execution
CURRENT_DATASET: Dict[str, Any] = {
    "df": None,
    "summary": None,
    "forecast_res": None
}


@app.get("/")
def read_root():
    return {
        "title": "Explainable Time Series Forecasting API",
        "status": "active",
        "documentation": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Explainable Time Series Forecasting Backend"}


@app.get("/sample-data")
def get_sample_data():
    """Returns the built-in synthetic sales dataset for immediate demonstration."""
    try:
        sample_path = os.path.join(os.path.dirname(__file__), "sample_data.csv")
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail="sample_data.csv file not found.")

        df_raw = pd.read_csv(sample_path)
        clean_df, summary = preprocess_dataset(df_raw, date_col="Date", target_col="Sales")

        CURRENT_DATASET["df"] = clean_df
        CURRENT_DATASET["summary"] = summary
        CURRENT_DATASET["forecast_res"] = None

        preview_records = clean_df[['Date_Str', 'Value']].head(20).to_dict(orient="records")

        return {
            "status": "success",
            "message": "Sample dataset loaded successfully.",
            "summary": summary,
            "preview": preview_records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading sample dataset: {str(e)}")


@app.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    date_col: Optional[str] = Form(None),
    target_col: Optional[str] = Form(None)
):
    """
    Upload custom CSV file, auto-detect columns, parse dates, clean missing values,
    and return dataset summary stats.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a valid CSV file.")

    try:
        contents = await file.read()
        df_raw = pd.read_csv(io.BytesIO(contents))

        if df_raw.empty:
            raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

        if len(df_raw.columns) < 2:
            raise HTTPException(status_code=400, detail="CSV file must have at least 2 columns (Date and Target value).")

        clean_df, summary = preprocess_dataset(df_raw, date_col=date_col, target_col=target_col)

        if len(clean_df) < 10:
            raise HTTPException(status_code=400, detail="Dataset has too few records after cleaning (minimum 10 rows required).")

        CURRENT_DATASET["df"] = clean_df
        CURRENT_DATASET["summary"] = summary
        CURRENT_DATASET["forecast_res"] = None

        preview_records = clean_df[['Date_Str', 'Value']].head(20).to_dict(orient="records")

        return {
            "status": "success",
            "message": "Dataset uploaded and cleaned successfully.",
            "summary": summary,
            "preview": preview_records
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")


@app.post("/analyze")
def analyze_data():
    """Computes EDA stats, trend direction, and 7/14-day moving averages."""
    df = CURRENT_DATASET.get("df")
    if df is None or df.empty:
        # Fallback to load sample dataset if not loaded
        get_sample_data()
        df = CURRENT_DATASET["df"]

    try:
        eda_res = compute_eda_summary(df)
        summary = CURRENT_DATASET.get("summary", {})
        return {
            "status": "success",
            "summary": summary,
            "eda": eda_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EDA calculation failed: {str(e)}")


@app.post("/forecast")
def run_forecast(horizon: int = Form(14)):
    """Trains ARIMA model (with fallbacks), computes evaluation metrics, and generates multi-step predictions."""
    df = CURRENT_DATASET.get("df")
    if df is None or df.empty:
        get_sample_data()
        df = CURRENT_DATASET["df"]

    try:
        forecast_res = train_and_forecast(df, horizon=horizon)
        CURRENT_DATASET["forecast_res"] = forecast_res
        return {
            "status": "success",
            "results": forecast_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting model execution failed: {str(e)}")


@app.post("/explain")
def run_explainability():
    """Computes lag features, trains RF, calculates SHAP values, and generates dynamic narrative explanations."""
    df = CURRENT_DATASET.get("df")
    if df is None or df.empty:
        get_sample_data()
        df = CURRENT_DATASET["df"]

    try:
        explain_res = generate_explainability(df)
        if "error" in explain_res:
            raise HTTPException(status_code=400, detail=explain_res["error"])
        
        return {
            "status": "success",
            "explainability": explain_res
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explainability model failed: {str(e)}")


@app.get("/download-forecast")
def download_forecast_csv():
    """Generates and downloads merged CSV containing Date, Actual, Predicted, and Forecast."""
    forecast_res = CURRENT_DATASET.get("forecast_res")
    df = CURRENT_DATASET.get("df")

    if forecast_res is None or df is None:
        # Auto-run forecast if user directly hits download
        get_sample_data()
        df = CURRENT_DATASET["df"]
        forecast_res = train_and_forecast(df, horizon=14)
        CURRENT_DATASET["forecast_res"] = forecast_res

    chart_series = forecast_res.get("chart_series", [])
    export_df = pd.DataFrame(chart_series)

    # Clean header titles
    export_df.rename(columns={
        "date": "Date",
        "actual": "Actual",
        "predicted": "Predicted",
        "forecast": "Forecast"
    }, inplace=True)

    stream = io.StringIO()
    export_df.to_csv(stream, index=False)
    stream.seek(0)

    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=forecast_results.csv"
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
