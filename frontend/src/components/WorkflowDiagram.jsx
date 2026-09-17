import React from 'react';
import { Database, Sparkles, TrendingUp, BrainCircuit, CheckCircle2 } from 'lucide-react';

const WorkflowDiagram = () => {
  const steps = [
    { id: 1, title: 'Historical Data', desc: 'CSV Upload & Validation', icon: Database, color: 'border-blue-500 text-blue-600 bg-blue-50' },
    { id: 2, title: 'Preprocessing', desc: 'Deduplication & Interpolation', icon: Sparkles, color: 'border-indigo-500 text-indigo-600 bg-indigo-50' },
    { id: 3, title: 'Forecasting', desc: 'ARIMA (1,1,1) Model', icon: TrendingUp, color: 'border-teal-500 text-teal-600 bg-teal-50' },
    { id: 4, title: 'Explainability', desc: 'Lag Features & SHAP XAI', icon: BrainCircuit, color: 'border-amber-500 text-amber-600 bg-amber-50' },
    { id: 5, title: 'Prediction Insights', desc: 'Dynamic Narrative & Metrics', icon: CheckCircle2, color: 'border-emerald-500 text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
        System Workflow & Pipeline Architecture
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex flex-col items-center text-center p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className={`p-3 rounded-full border-2 ${step.color} mb-3 shadow-xs`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">{step.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{step.desc}</p>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400 font-bold">
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowDiagram;
