import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';

export default function RiskCard({ title, value, subtitle, level = 'low', icon: Icon }) {
  const getColors = () => {
    const l = (level || '').toLowerCase();
    if (l.includes('high') || l.includes('crit')) {
      return {
        badge: 'text-rose-400 bg-rose-950/80 border-rose-500/40',
        valColor: 'text-rose-400',
        dot: 'bg-rose-400'
      };
    }
    if (l.includes('med') || l.includes('mod') || l.includes('warn')) {
      return {
        badge: 'text-amber-400 bg-amber-950/80 border-amber-500/40',
        valColor: 'text-amber-400',
        dot: 'bg-amber-400'
      };
    }
    return {
      badge: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40',
      valColor: 'text-emerald-400',
      dot: 'bg-emerald-400'
    };
  };

  const style = getColors();

  return (
    <div className="hud-card hud-corner-ticks p-4 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded bg-space-850 border border-space-700 text-slate-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-1 font-mono">
        <span className={`text-2xl font-bold tracking-tight block ${style.valColor}`}>
          {value}
        </span>
      </div>

      <div className="pt-2 border-t border-space-800 flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400 truncate max-w-[150px]">{subtitle}</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
          <span className="text-slate-300 uppercase font-semibold">
            {level}
          </span>
        </div>
      </div>
    </div>
  );
}
