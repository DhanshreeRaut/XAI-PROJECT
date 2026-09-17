import React from 'react';
import { Database, Calendar, Server, RefreshCw } from 'lucide-react';

const Header = ({ datasetSummary, onReloadSample }) => {
  const isLoaded = Boolean(datasetSummary);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Explainable Time Series Forecasting
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Forecast future trends and understand why the model makes its predictions.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Status Badge */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          isLoaded 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <Database className="w-3.5 h-3.5" />
          <span>{isLoaded ? `Dataset Loaded (${datasetSummary.clean_records} Rows)` : 'No Dataset Loaded'}</span>
        </div>

        {/* Load Sample Data Button */}
        <button
          onClick={onReloadSample}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
          title="Reload Synthetic Sample Dataset"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span>Use Sample Data</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
