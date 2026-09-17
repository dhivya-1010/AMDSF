import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Database, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function AgentCard({
  icon: Icon,
  title,
  domain,
  status,
  metricLabel,
  metricValue,
  metricColor = 'emerald',
  summary,
  linkTo,
  tag,
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>COMPLETED</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 animate-pulse shadow-[0_0_10px_rgba(0,242,254,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>ANALYZING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>DATA UNAVAILABLE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/50 text-slate-400 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>READY</span>
          </span>
        );
    }
  };

  return (
    <div className="hud-glass hud-corner-ticks p-5 flex flex-col justify-between group hover:border-cyan-400/60 transition-all duration-300">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-cyan-400 group-hover:border-cyan-500/60 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition shadow-inner">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            {tag && (
              <span className="text-[9px] font-mono uppercase text-slate-400">
                SOURCE: {tag}
              </span>
            )}
          </div>
        </div>

        {/* Title & Domain */}
        <div className="space-y-0.5 mb-3">
          <h3 className="text-sm font-bold font-mono text-white group-hover:text-cyan-300 transition">
            {title}
          </h3>
          <p className="text-[11px] font-mono text-cyan-400/80">
            {domain}
          </p>
        </div>

        {/* Metric Box */}
        <div className="bg-black/50 border border-white/10 rounded-lg p-2.5 mb-3 font-mono">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
            {metricLabel || 'CURRENT EVALUATION'}
          </span>
          <span className={`text-base font-bold tracking-tight block ${
            metricColor === 'emerald' ? 'text-emerald-400' :
            metricColor === 'amber' || metricColor === 'yellow' ? 'text-amber-400' :
            metricColor === 'rose' || metricColor === 'red' ? 'text-rose-400' :
            'text-cyan-300'
          }`}>
            {metricValue || 'Nominal'}
          </span>
        </div>

        {/* Summary Description */}
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-mono text-[11px]">
          {summary}
        </p>
      </div>

      {/* Footer Link */}
      {linkTo && (
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            TELEMETRY NODE
          </span>
          <Link
            to={linkTo}
            className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>Open Terminal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      )}
    </div>
  );
}
