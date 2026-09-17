import React from 'react';
import { BrainCircuit, Sparkles, HelpCircle, Activity, Info, CheckCircle2 } from 'lucide-react';
import StatCard from '../components/StatCard';

const ExplainabilityPage = ({ explainData, isLoading, onRunExplain }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-slate-200">
        <div className="text-center space-y-3">
          <BrainCircuit className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-medium">Computing Random Forest SHAP TreeExplainer feature contributions...</p>
        </div>
      </div>
    );
  }

  if (!explainData) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Explainability Analysis Pending</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Click below to train Random Forest auxiliary regressor and compute SHAP values for lag features.
        </p>
        <button
          onClick={onRunExplain}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm"
        >
          Compute SHAP Feature Contributions
        </button>
      </div>
    );
  }

  const { 
    most_influential_feature, 
    positive_influence, 
    negative_influence, 
    trend_driver, 
    feature_importance_chart, 
    dynamic_explanation, 
    feature_explanations,
    latest_observation,
    shap_available
  } = explainData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-slate-900">Explainable AI (XAI) & SHAP Analysis</h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            shap_available ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {shap_available ? 'SHAP TreeExplainer' : 'RF Feature Importances'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Understanding feature contributions over time using temporal lag windows and rolling window statistics.
        </p>
      </div>

      {/* Explainability Dashboard Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Most Influential Feature" 
          value={most_influential_feature} 
          subtitle="Highest global SHAP attribution"
          icon={BrainCircuit}
          color="amber"
        />

        <StatCard 
          title="Positive Influence" 
          value={positive_influence} 
          subtitle="Recent momentum driver"
          color="emerald"
        />

        <StatCard 
          title="Negative Influence" 
          value={negative_influence} 
          subtitle="Variance & fluctuations"
          color="blue"
        />

        <StatCard 
          title="Trend Driver" 
          value={trend_driver} 
          subtitle="Secondary feature weight"
          color="indigo"
        />
      </div>

      {/* Feature Importance Horizontal Bar Chart & Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horizontal Bar Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Global Feature Importance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Relative influence score of lag and rolling window features on prediction output.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-4 pt-2">
            {feature_importance_chart.map((item) => (
              <div key={item.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <span className="font-mono text-slate-500 font-semibold">{item.score} ({item.percentage}%)</span>
                </div>
                
                {/* Horizontal Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Observation Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Latest Observation State</h3>
            <p className="text-xs text-slate-500 mb-4">Input values used for next-step prediction</p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-medium">Recent Value:</span>
                <span className="font-bold text-slate-900">{latest_observation.recent_value}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-amber-800 font-medium">7-Day Moving Avg:</span>
                <span className="font-bold text-amber-900">{latest_observation.ma_7}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-indigo-800 font-medium">14-Day Moving Avg:</span>
                <span className="font-bold text-indigo-900">{latest_observation.ma_14}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 font-bold">Predicted Next Step:</span>
                <span className="font-bold text-emerald-900 text-sm">{latest_observation.predicted_next}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Lag features encode recent memory, enabling standard regressors to predict sequential time series trends.</span>
          </div>
        </div>
      </div>

      {/* Dynamic Explanation Section: "Why did the forecast change?" */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Why Did the Forecast Change? (Dynamic Narrative)</h3>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-800 text-xs md:text-sm leading-relaxed">
          {dynamic_explanation}
        </div>
      </div>

      {/* Feature Contributions Breakdown & Viva Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Feature Definition & Viva Reference Guide</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {Object.entries(feature_explanations).map(([key, desc]) => (
            <div key={key} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 uppercase font-mono">{key}</span>
              </div>
              <p className="text-slate-600 leading-normal pl-6">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPage;
