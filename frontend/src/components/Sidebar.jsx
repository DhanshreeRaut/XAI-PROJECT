import React from 'react';
import { 
  LayoutDashboard, 
  Upload, 
  LineChart, 
  TrendingUp, 
  BrainCircuit, 
  BookOpen
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Dataset Upload', icon: Upload },
    { id: 'analysis', label: 'Data Analysis', icon: LineChart },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'explainability', label: 'Explainability', icon: BrainCircuit },
    { id: 'about', label: 'About Project', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">XAI Time Series</h1>
            <p className="text-xs text-slate-400 font-medium">B.Tech AIML Project</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info badge */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">Explainable AI Model</p>
        <p className="mt-0.5">ARIMA + SHAP Regressor</p>
        <p className="mt-2 text-[11px] text-slate-600">Academic Demo v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
