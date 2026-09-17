import React from 'react';
import { BookOpen, Target, Cpu, HelpCircle, Briefcase, Award, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  const vivaQuestions = [
    {
      q: "What is ARIMA and what do (p, d, q) represent?",
      a: "ARIMA stands for AutoRegressive Integrated Moving Average. 'p' is the order of AutoRegression (lag terms), 'd' is the degree of differencing to ensure stationarity, and 'q' is the order of Moving Average (residual error terms)."
    },
    {
      q: "Why do we use SHAP (SHapley Additive exPlanations) for Explainable AI?",
      a: "SHAP is based on cooperative game theory (Shapley values). It provides consistent and locally accurate feature attribution values that quantify how much each lag/rolling feature contributes to pushing the model's prediction away from the baseline mean."
    },
    {
      q: "What are Lag features and why are they necessary for Random Forest regression on time series?",
      a: "Random Forest lacks inherent sequential memory. Lag features (lag_1, lag_2, lag_7) convert time-series sequence data into a tabular feature matrix (X), allowing standard supervised tree regressors to learn temporal dependencies."
    },
    {
      q: "How do you evaluate time-series forecasting models?",
      a: "We evaluate models on a chronological 80/20 train/test split using MAE (Mean Absolute Error), RMSE (Root Mean Squared Error), and MAPE (Mean Absolute Percentage Error). Time series data is never randomly shuffled to avoid data leakage from future observations."
    }
  ];

  const applications = [
    { title: "Retail & Sales Forecasting", desc: "Predicting daily product demand to optimize inventory management and reduce stockouts." },
    { title: "Energy Demand Prediction", desc: "Estimating grid load requirements to balance power distribution and renewable energy storage." },
    { title: "Weather & Climate Modeling", desc: "Monitoring temperature and precipitation trends over temporal windows." },
    { title: "Traffic Flow Prediction", desc: "Analyzing urban congestion cycles for intelligent transportation systems." },
    { title: "Financial & Business Planning", desc: "Projecting revenue, cash flow, and resource allocation requirements." }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>B.Tech AIML Final Year Project</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Explainable Time Series Forecasting
        </h1>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs md:text-sm text-slate-700">
          <div className="flex items-start space-x-2">
            <Target className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900">Project Aim:</strong> Develop a forecasting model and use explainability methods to understand prediction trends over time.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <span>Technology Stack</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500 uppercase block text-[10px]">Frontend Framework</span>
            <span className="font-bold text-slate-900 text-sm block">React (Vite)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500 uppercase block text-[10px]">UI & Charting</span>
            <span className="font-bold text-slate-900 text-sm block">Tailwind CSS + Recharts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500 uppercase block text-[10px]">Backend Server</span>
            <span className="font-bold text-slate-900 text-sm block">FastAPI (Uvicorn)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-500 uppercase block text-[10px]">ML & XAI Engine</span>
            <span className="font-bold text-slate-900 text-sm block">Statsmodels + SHAP</span>
          </div>
        </div>
      </div>

      {/* Theoretical Core Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">What is Time Series Forecasting?</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Time series forecasting uses historical data ordered chronologically to predict future values. Models analyze stationarity, auto-correlation, moving averages, and seasonality patterns.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">What is Explainable AI (XAI)?</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Explainable AI provides methods to interpret and explain black-box machine learning predictions. It clarifies which features influenced specific predictions and builds trust in AI systems.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">Why Explainability Matters</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            In business and engineering, stakeholders need to know *why* a forecast changed. XAI identifies whether a spike is driven by immediate 1-day momentum (Lag 1) or a 7-day weekly cycle (Lag 7).
          </p>
        </div>
      </div>

      {/* Viva Voce Reference Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <span>Viva Voce Preparation & Key Questions</span>
        </h3>

        <div className="space-y-4">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 text-sm">Q{idx + 1}: {item.q}</p>
              <p className="text-slate-700 leading-relaxed pl-2 border-l-2 border-blue-500">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-World Applications */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          <span>Practical Applications</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {applications.map((app, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">{app.title}</span>
              <span className="text-slate-600 block leading-normal">{app.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
