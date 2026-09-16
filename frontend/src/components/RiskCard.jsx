import React from 'react';
import { AlertTriangle, CheckCircle2, Shield, Activity } from 'lucide-react';

export default function RiskCard({ title, value, subtitle, level = 'low', icon: Icon = Activity }) {
  const getColors = () => {
    switch (level.toLowerCase()) {
      case 'low':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          glow: 'shadow-emerald-500/10'
        };
      case 'medium':
      case 'low-medium':
      case 'low–medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          glow: 'shadow-amber-500/10'
        };
      case 'high':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          glow: 'shadow-rose-500/10'
        };
      default:
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          text: 'text-cyan-400',
          glow: 'shadow-cyan-500/10'
        };
    }
  };

  const style = getColors();

  return (
    <div className={`bg-space-900/90 border border-space-700/80 rounded-xl p-4 shadow-lg backdrop-blur-sm flex flex-col justify-between ${style.glow}`}>
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
        <span className="uppercase tracking-wider font-semibold">{title}</span>
        <div className={`p-1.5 rounded-md ${style.bg} ${style.border} ${style.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-1">
        <div className={`text-2xl font-mono font-bold tracking-tight ${style.text}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
