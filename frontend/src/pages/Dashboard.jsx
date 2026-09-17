import React from 'react';
import { 
  Database, 
  Layers, 
  Clock, 
  Cpu, 
  TrendingUp, 
  Upload, 
  Play, 
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
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
import WorkflowDiagram from '../components/WorkflowDiagram';

const Dashboard = ({ 
  datasetSummary, 
  edaData, 
  forecastData, 
  setActiveTab, 
  onLoadSample 
}) => {
  const isDatasetLoaded = Boolean(datasetSummary);
  const chartData = forecastData?.chart_series || edaData?.chart_data || [];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Academic Demonstration Platform</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Explainable Time Series Forecasting
          </h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Forecast future values from historical time-series data and understand the model's prediction behavior using explainable AI (ARIMA + SHAP).
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Dataset</span>
            </button>

            <button
              onClick={onLoadSample}
              className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2.5 rounded-lg text-sm border border-slate-300 transition-colors"
            >
              <Play className="w-4 h-4 text-slate-600" />
              <span>Try Sample Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Dataset Status" 
          value={isDatasetLoaded ? 'Ready' : 'Not Loaded'} 
          subtitle={isDatasetLoaded ? datasetSummary.data_frequency : 'Upload CSV'}
          icon={Database}
          color={isDatasetLoaded ? 'emerald' : 'amber'}
        />

        <StatCard 
          title="Number of Records" 
          value={datasetSummary?.clean_records || 0} 
          subtitle={datasetSummary ? `Date range: ${datasetSummary.date_start}` : 'Total clean rows'}
          icon={Layers}
          color="blue"
        />

        <StatCard 
          title="Forecast Horizon" 
          value={forecastData ? `${forecastData.horizon} Days` : '14 Days (Default)'} 
          subtitle={forecastData ? `End: ${forecastData.forecast_summary.end_date}` : 'Select in Forecast tab'}
          icon={Clock}
          color="indigo"
        />

        <StatCard 
          title="Model Used" 
          value={forecastData?.model_used || 'ARIMA(1,1,1)'} 
          subtitle={forecastData?.is_fallback ? 'Fallback active' : 'Primary statsmodel'}
          icon={Cpu}
          color="purple"
        />

        <StatCard 
          title="Forecast Trend" 
          value={forecastData?.forecast_summary.overall_trend || edaData?.trend_direction || 'Pending'} 
          subtitle="Model slope direction"
          icon={TrendingUp}
          trend={forecastData?.forecast_summary.overall_trend || edaData?.trend_direction}
          color="emerald"
        />
      </div>

      {/* Main Historical & Forecast Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Historical & Forecast Timeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing historical series data {forecastData ? 'and generated future predictions' : '(Run forecast to view future horizon)'}
            </p>
          </div>
          
          <button 
            onClick={() => setActiveTab('forecast')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Forecast Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {chartData.length > 0 ? (
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                
                {/* Historical Line */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="Historical Value" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 5 }} 
                />

                {/* Forecast Line */}
                {forecastData && (
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    name="Future Forecast" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    strokeDasharray="5 5" 
                    dot={{ r: 3 }} 
                  />
                )}
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
            <Database className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No Dataset Loaded</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click "Try Sample Dataset" or upload your own CSV file to visualize historical trends and future predictions.
            </p>
            <button
              onClick={onLoadSample}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
            >
              Load Sample Dataset Now
            </button>
          </div>
        )}
      </div>

      {/* Pipeline Architecture Diagram */}
      <WorkflowDiagram />
    </div>
  );
};

export default Dashboard;
