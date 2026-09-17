import React from 'react';
import { LineChart, BarChart2, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
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

const AnalysisPage = ({ edaData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-slate-200">
        <div className="text-center space-y-3">
          <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-medium">Computing exploratory data analysis & moving averages...</p>
        </div>
      </div>
    );
  }

  if (!edaData) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <LineChart className="w-10 h-10 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Dataset Available for Analysis</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please upload a dataset or click "Use Sample Data" in the header to view historical trends and moving averages.
        </p>
      </div>
    );
  }

  const { mean, std_dev, min, max, trend_direction, total_count, chart_data } = edaData;

  const getTrendBadge = (trend) => {
    if (trend === 'Increasing') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
          <ArrowUpRight className="w-4 h-4" />
          <span>Increasing Trend</span>
        </span>
      );
    } else if (trend === 'Decreasing') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
          <ArrowDownRight className="w-4 h-4" />
          <span>Decreasing Trend</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
        <Minus className="w-4 h-4" />
        <span>Stable Trend</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Exploratory Data Analysis (EDA)</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Statistical breakdown of historical values, moving average smoothing, and trend direction.
          </p>
        </div>
        <div>{getTrendBadge(trend_direction)}</div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Trend Direction" 
          value={trend_direction} 
          subtitle="Linear regression slope"
          icon={TrendingUp}
          trend={trend_direction}
          color="emerald"
        />

        <StatCard 
          title="Mean Value" 
          value={mean} 
          subtitle="Average across timeline"
          icon={Activity}
          color="blue"
        />

        <StatCard 
          title="Standard Deviation" 
          value={std_dev} 
          subtitle="Volatility indicator"
          icon={BarChart2}
          color="indigo"
        />

        <StatCard 
          title="Minimum Value" 
          value={min} 
          subtitle="Lowest observation"
          color="amber"
        />

        <StatCard 
          title="Maximum Value" 
          value={max} 
          subtitle="Peak observation"
          color="purple"
        />
      </div>

      {/* Trend & Moving Averages Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Historical Trend & Moving Averages</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing raw actual values against 7-day and 14-day rolling averages to reveal underlying momentum.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center space-x-1.5 text-blue-600">
              <span className="w-3 h-0.5 bg-blue-600 rounded-full"></span>
              <span>Actual</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-500">
              <span className="w-3 h-0.5 bg-amber-500 rounded-full"></span>
              <span>7-Day MA</span>
            </span>
            <span className="flex items-center space-x-1.5 text-indigo-500">
              <span className="w-3 h-0.5 bg-indigo-500 rounded-full"></span>
              <span>14-Day MA</span>
            </span>
          </div>
        </div>

        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chart_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Value" 
                stroke="#2563eb" 
                strokeWidth={1.5} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="ma7" 
                name="7-Day Moving Avg" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={false} 
              />
              <Line 
                type="monotone" 
                dataKey="ma14" 
                name="14-Day Moving Avg" 
                stroke="#6366f1" 
                strokeWidth={2} 
                dot={false} 
              />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytical Interpretation Card */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
        <h4 className="font-bold text-slate-900 text-sm">Statistical Interpretation Summary</h4>
        <p className="leading-relaxed">
          The dataset comprises <span className="font-semibold text-slate-900">{total_count}</span> observations. 
          The overall trend is evaluated as <span className="font-semibold text-slate-900">{trend_direction}</span> based on linear regression slope across the timeline. 
          Moving averages smooth short-term variance to highlight true directional momentum for ARIMA parameter selection.
        </p>
      </div>
    </div>
  );
};

export default AnalysisPage;
