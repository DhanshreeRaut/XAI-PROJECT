# Explainable Time Series Forecasting

A complete, full-stack academic web application developed for **B.Tech Artificial Intelligence & Machine Learning (AIML)** final-year / project-based learning demonstrations.

The application allows users to upload a time-series CSV dataset (or try a synthetic sales sample dataset), analyze historical trends and moving averages, train an **ARIMA** forecasting model with chronological 80/20 train/test evaluation, multi-step future predictions, and interpret predictions using **Explainable AI (XAI)** powered by lag feature engineering and **SHAP (SHapley Additive exPlanations)**.

---

## 🎯 Aim & Objectives

- **Aim:** Develop a time-series forecasting model and use explainability methods to understand prediction trends over time.
- **Objectives:**
  1. Auto-detect date/time and numerical target columns from uploaded CSV files.
  2. Perform data cleaning (linear interpolation of missing values, chronological sorting, deduplication).
  3. Conduct Exploratory Data Analysis (EDA) with 7-day and 14-day moving average overlays and trend direction classification.
  4. Train an ARIMA(1,1,1) model with 80/20 chronological split evaluation (MAE, RMSE, MAPE).
  5. Feature-engineer temporal lag features (`lag_1`, `lag_2`, `lag_3`, `lag_7`, `rolling_mean_7`, `rolling_mean_14`).
  6. Train an auxiliary Random Forest regressor and compute SHAP TreeExplainer feature attributions.
  7. Generate dynamic textual narrative explanations ("Why did the forecast change?") based on current data trends.
  8. Provide interactive Recharts visualization and merged CSV export of historical actuals, test predictions, and future forecasts.

---

## 💻 Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4, Recharts, Axios, Lucide React Icons.
- **Backend:** Python 3.13, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Statsmodels, SHAP.
- **Database:** None (Operates in-memory and handles local CSV files).

---

## 📂 Project Structure

```
explainable-time-series/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── WorkflowDiagram.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   ├── AnalysisPage.jsx
│   │   │   ├── ForecastPage.jsx
│   │   │   ├── ExplainabilityPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── forecasting.py
│   ├── explainability.py
│   ├── preprocessing.py
│   ├── requirements.txt
│   └── sample_data.csv
│
└── README.md
```

---

## 🚀 How to Run locally

### 1. Running the Backend (FastAPI)

Navigate to the `backend/` directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows (Command Prompt / PowerShell):**
  ```cmd
  venv\Scripts\activate
  ```
- **Linux / macOS:**
  ```bash
  source venv/bin/activate
  ```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend server:

```bash
uvicorn main:app --reload --port 8000
```

The backend server will run at: `http://127.0.0.1:8000`  
Swagger API Docs will be available at: `http://127.0.0.1:8000/docs`

---

### 2. Running the Frontend (React + Vite)

Open a new terminal window and navigate to the `frontend/` directory:

```bash
cd frontend
```

Install Node dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend application will open at: `http://localhost:5173`

---

## 🌐 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and root info |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/sample-data` | Returns built-in synthetic sales dataset (`sample_data.csv`) |
| `POST` | `/upload` | Upload custom CSV file with auto column detection & cleaning summary |
| `POST` | `/analyze` | Computes EDA stats, trend direction, and 7/14-day moving averages |
| `POST` | `/forecast` | Fits ARIMA model (80/20 train/test metrics + multi-step horizon forecast) |
| `POST` | `/explain` | Computes lag features, Random Forest SHAP TreeExplainer, & dynamic text explanation |
| `GET` | `/download-forecast` | Downloads merged forecast CSV containing Date, Actual, Predicted, & Forecast |

---

## 🔬 ML & Explainability Methodology

### 1. Forecasting Methodology
- **Train / Test Split:** Time-series data is split chronologically into 80% training set and 20% testing set (never randomly shuffled to prevent data leakage).
- **Model:** Primary model is `ARIMA(p=1, d=1, q=1)` from `statsmodels`. In case of stationarity or numerical issues, a Linear Trend Regression fallback is automatically executed.
- **Metrics:** Evaluated using Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Mean Absolute Percentage Error (MAPE).

### 2. Explainability (XAI) Methodology
- **Lag Features:** Temporal dependencies are extracted via:
  - `lag_1`: Previous 1-day observation
  - `lag_2`: Previous 2-day observation
  - `lag_3`: Previous 3-day observation
  - `lag_7`: Previous 7-day observation (captures weekly cycles)
  - `rolling_mean_7`: 7-day moving average
  - `rolling_mean_14`: 14-day moving average
- **SHAP (SHapley Additive exPlanations):** An auxiliary `RandomForestRegressor` is trained on the lag feature matrix. `shap.TreeExplainer` calculates exact additive feature attribution values.
- **Dynamic Text Narrative:** A rule-based text synthesis engine analyzes recent values, moving average crossovers, and top SHAP feature drivers to generate human-readable explanations ("Why did the forecast change?").

> **Note on Synthetic Sample Dataset:** `backend/sample_data.csv` contains 130 rows of synthetic daily sales data generated with baseline upward trend, weekly seasonality, and Gaussian noise. It is explicitly synthetic for demonstration purposes.

---

## 🎓 Viva Voce Explanation Guide

- **Q: What is ARIMA(p,d,q)?**  
  *A:* AutoRegressive Integrated Moving Average. `p` is autoregressor lag count, `d` is differencing degree to establish stationarity, and `q` is residual error moving average order.
- **Q: How does SHAP explain time series forecasts?**  
  *A:* SHAP measures feature importance by computing Shapley values from cooperative game theory. It quantifies how much each lag feature (e.g. `lag_1` vs `rolling_mean_7`) pushes a prediction above or below the baseline mean.
- **Q: Why use lag features?**  
  *A:* Standard tree-based models like Random Forest are non-sequential. Lag features transform time-series sequences into tabular features ($X$), allowing regressors to learn temporal patterns.

---

## 🔮 Limitations & Future Scope

- **Limitations:** ARIMA assumes linear stationarity after differencing; complex non-linear seasonal interactions benefit from hybrid models.
- **Future Scope:** Integrating Deep Learning architectures (LSTM / Temporal Fusion Transformers) alongside Integrated Gradients for deep XAI explanations.
