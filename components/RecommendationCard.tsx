
import React, { useState } from 'react';
import { Recommendation } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface RecommendationCardProps {
  rec: Recommendation;
  onApply: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec, onApply }) => {
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isTerraformOpen, setIsTerraformOpen] = useState(false);

  const getEstimatedTime = (effort: string): string => {
    switch (effort.toLowerCase()) {
      case 'low':
        return '15 mins';
      case 'medium':
        return '2 hours';
      case 'high':
        return '1 day';
      default:
        return '30 mins';
    }
  };

  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-indigo-500/30 transition-all group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${CATEGORY_COLORS[rec.category]}`}>
            {rec.category}
          </span>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Apply Time</p>
              <p className="text-sm font-semibold text-indigo-400">{getEstimatedTime(rec.effort)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Effort</p>
              <p className="text-sm font-semibold text-slate-300">{rec.effort}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Risk</p>
              <p className={`text-sm font-semibold ${rec.risk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {rec.risk}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
          {rec.title}
        </h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {rec.description}
        </p>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-700/50 mb-6">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Est. Monthly Savings</p>
            <p className="text-2xl font-bold text-emerald-400">${rec.savings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Performance Uplift</p>
            <p className="text-2xl font-bold text-indigo-400">+{rec.performanceGain}%</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button 
              onClick={() => onApply(rec.id)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Auto-Refactor</span>
              <span className="text-xs bg-indigo-700 px-1.5 rounded">V2</span>
            </button>
            <button className="px-4 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-sm">
              Details
            </button>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {rec.codePatch && (
              <button 
                onClick={() => setIsDiffOpen(!isDiffOpen)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors self-start mt-1"
              >
                {isDiffOpen ? '▼ Hide' : '▶ View'} Suggested Diff
              </button>
            )}
            
            {rec.terraformUpdate && (
              <button 
                onClick={() => setIsTerraformOpen(!isTerraformOpen)}
                className="text-xs font-bold text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors self-start mt-1"
              >
                {isTerraformOpen ? '▼ Hide' : '▶ View'} Suggested IaC Update
              </button>
            )}
          </div>
        </div>
      </div>
      
      {rec.codePatch && isDiffOpen && (
        <div className="bg-slate-900/50 p-4 border-t border-slate-700/50 font-mono text-[11px] text-slate-400 animate-in slide-in-from-top duration-300">
          <p className="mb-2 text-indigo-400 font-bold uppercase tracking-wider">Suggested Diff:</p>
          <pre className="whitespace-pre-wrap bg-slate-950/50 p-3 rounded-lg border border-slate-800">{rec.codePatch}</pre>
        </div>
      )}

      {rec.terraformUpdate && isTerraformOpen && (
        <div className="bg-slate-900/50 p-4 border-t border-slate-700/50 font-mono text-[11px] text-slate-400 animate-in slide-in-from-top duration-300">
          <p className="mb-2 text-emerald-400 font-bold uppercase tracking-wider">Suggested IaC Update:</p>
          <pre className="whitespace-pre-wrap bg-slate-950/50 p-3 rounded-lg border border-slate-800">{rec.terraformUpdate}</pre>
        </div>
      )}
    </div>
  );
};
