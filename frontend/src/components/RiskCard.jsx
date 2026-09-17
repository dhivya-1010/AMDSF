import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';

export default function RiskCard({ title, value, subtitle, level = 'low', icon: Icon }) {
  const getColors = () => {
    const l = (level || '').toLowerCase();
    if (l.includes('high') || l.includes('crit') || l.includes('over')) {
      return {
        badge: 'text-rose-400 bg-rose-950/80 border-rose-500/50',
        valColor: 'text-rose-400',
        dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
        borderHover: 'hover:border-rose-500/50'
      };
    }
    if (l.includes('med') || l.includes('mod') || l.includes('warn')) {
      return {
        badge: 'text-amber-400 bg-amber-950/80 border-amber-500/50',
        valColor: 'text-amber-400',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
        borderHover: 'hover:border-amber-500/50'
      };
    }
    return {
      badge: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50',
      valColor: 'text-emerald-400',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      borderHover: 'hover:border-emerald-500/50'
    };
  };

  const style = getColors();

  return (
    <div className={`hud-glass hud-corner-ticks p-4 flex flex-col justify-between transition-all duration-300 ${style.borderHover}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-slate-300">
            <Icon className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        )}
      </div>

      <div className="my-1 font-mono">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight block ${style.valColor}`}>
          {value}
        </span>
      </div>

      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-300 truncate max-w-[150px]">{subtitle}</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-white uppercase font-bold tracking-wider">
            {level}
          </span>
        </div>
      </div>
    </div>
  );
}
