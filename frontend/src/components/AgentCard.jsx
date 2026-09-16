import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function AgentCard({
  icon: Icon,
  title,
  domain,
  status,
  metricLabel,
  metricValue,
  metricColor = 'cyan',
  summary,
  linkTo,
  tag
}) {
  const getBadgeClass = (color) => {
    switch (color) {
      case 'emerald':
      case 'low':
      case 'feasible':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'amber':
      case 'medium':
      case 'moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'rose':
      case 'high':
      case 'over_budget':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-space-900/90 border border-space-700/80 hover:border-cyan-500/40 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between transition group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-space-850 border border-space-700 group-hover:border-cyan-500/40 text-cyan-400 transition">
              {Icon && <Icon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">{domain}</p>
            </div>
          </div>
          {tag && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-850 border border-space-700 text-slate-300">
              {tag}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {summary}
        </p>
      </div>

      <div className="pt-3 border-t border-space-700/60 flex items-center justify-between font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">{metricLabel || 'Status'}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block mt-0.5 ${getBadgeClass(metricColor)}`}>
            {metricValue || status || 'Active'}
          </span>
        </div>

        {linkTo && (
          <Link
            to={linkTo}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition"
          >
            <span>View Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
