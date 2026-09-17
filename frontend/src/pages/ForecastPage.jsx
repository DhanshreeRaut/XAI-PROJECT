import React, { useState } from 'react';
import { TrendingUp, Calendar, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import StatCard from '../components/StatCard';
import { getDownloadUrl } from '../api';

const ForecastPage = ({ forecastData, onRunForecast, isLoading }) => {
  const [horizon, setHorizon] = useState(14);
  const [customHorizon, setCustomHorizon] = useState('');

  const handleHorizonChange = (val) => {
    setHorizon(val);
    onRunForecast(val);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customHorizon, 10);
    if (val && val > 0 && val <= 90) {
      setHorizon(val);
      onRunForecast(val);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-slate-200">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-medium">Fitting ARIMA model & generating multi-step forecast...</p>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Forecast Model Not Executed</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Click below to fit ARIMA forecasting model on the current dataset.
        </p>
        <button
          onClick={() => onRunForecast(14)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Run ARIMA Forecast Now (14 Days)
        </button>
      </div>
    );
  }

  const { model_used, is_fallback, error_message, metrics, forecast_summary, chart_series, train_size, test_size } = forecastData;

  return (
    <div className="space-y-6">
      {/* Title & Horizon Selector Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">ARIMA Time Series Forecasting</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {model_used}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Model trained on chronological 80/20 train/test split. Select multi-step prediction horizon below.
          </p>
        </div>

        {/* Forecast Horizon Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Horizon:</span>
          {[7, 14, 30].map((h) => (
            <button
              key={h}
              onClick={() => handleHorizonChange(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                horizon === h
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {h} Days
            </button>
          ))}

          <form onSubmit={handleCustomSubmit} className="flex items-center space-x-1">
            <input
              type="number"
              placeholder="Custom"
              min="1"
              max="90"
              value={customHorizon}
              onChange={(e) => setCustomHorizon(e.target.value)}
              className="w-20 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors"
            >
              Set
            </button>
          </form>
        </div>
      </div>

      {/* Fallback Warning Alert if applicable */}
      {is_fallback && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">Model Fallback Notification</span>
            <span>{error_message}</span>
          </div>
        </div>
      )}

      {/* Train/Test Evaluation Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Model Evaluation Metrics (80% Train / 20% Test Split)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Train Records: {train_size} | Test Records: {test_size}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="MAE (Mean Absolute Error)" 
            value={metrics.mae} 
            subtitle="Average absolute error magnitude"
            color="blue"
          />

          <StatCard 
            title="RMSE (Root Mean Squared Error)" 
            value={metrics.rmse} 
            subtitle="Penalizes larger forecast errors"
            color="indigo"
          />

          <StatCard 
            title="MAPE (Mean Absolute % Error)" 
            value={`${metrics.mape}%`} 
            subtitle="Relative error percentage"
            color="purple"
          />
        </div>
      </div>

      {/* Recharts Interactive Visualization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Historical, Predicted & Future Forecast</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Solid line represents ground truth actuals; Dotted lines represent test model predictions and multi-step future forecasts.
            </p>
          </div>

          <a
            href={getDownloadUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Forecast CSV</span>
          </a>
        </div>

        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chart_series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

              {/* Actual Line */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Data" 
                stroke="#1e293b" 
                strokeWidth={2} 
                dot={false} 
              />

              {/* Predicted Test Line */}
              <Line 
                type="monotone" 
                dataKey="predicted" 
                name="Test Predicted" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={false} 
              />

              {/* Future Forecast Line */}
              <Line 
                type="monotone" 
                dataKey="forecast" 
                name={`Future Forecast (${horizon} Days)`} 
                stroke="#10b981" 
                strokeWidth={2.5} 
                strokeDasharray="6 6" 
                dot={{ r: 3 }} 
              />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Summary Metrics Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Forecast Summary Metrics</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Forecast Start Date</span>
            <span className="font-bold text-slate-900 text-sm mt-1 block">{forecast_summary.start_date}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Forecast End Date</span>
            <span className="font-bold text-slate-900 text-sm mt-1 block">{forecast_summary.end_date}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-blue-700 block">Average Forecast</span>
            <span className="font-bold text-blue-900 text-sm mt-1 block">{forecast_summary.average_forecast}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-700 block">Highest Forecast</span>
            <span className="font-bold text-emerald-900 text-sm mt-1 block">{forecast_summary.highest_forecast}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-amber-700 block">Lowest Forecast</span>
            <span className="font-bold text-amber-900 text-sm mt-1 block">{forecast_summary.lowest_forecast}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-purple-700 block">Overall Trend</span>
            <span className="font-bold text-purple-900 text-sm mt-1 block">{forecast_summary.overall_trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
