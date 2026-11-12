import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function MissionCharts({ chartData }) {
  const riskBreakdown = (chartData?.risk_breakdown || []).map((item) => ({
    ...item,
    risk_index: item.risk_index ?? 0,
    isUnavailable: item.risk_index === null || item.risk_index === undefined,
  }));

  const windowComparison = chartData?.launch_window_comparison || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-space-900 border border-space-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-cyan-300 font-semibold mb-1">{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }} className="flex justify-between gap-4">
              <span>{item.name}:</span>
              <span className="font-bold">
                {item.payload?.isUnavailable ? 'Unavailable' : `${item.value}${item.name.includes('%') || item.name.includes('Coverage') ? '%' : ''}`}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart A: Mission Risk Breakdown */}
      <div className="bg-space-900/80 border border-space-700/70 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-space-700/50 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-rose-500" />
              DOMAIN RISK FACTOR BREAKDOWN
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Measured vulnerability index per agent domain (0 = Minimal, 100 = Critical)
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {riskBreakdown.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
              No risk breakdown calculated yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2b4c" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: '#e2e8f0', fontSize: 11 }} width={135} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="risk_index" name="Risk Index" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart B: Candidate Launch Window Comparison */}
      <div className="bg-space-900/80 border border-space-700/70 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-space-700/50 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-cyan-400" />
              CANDIDATE EPOCH COMPARISON
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic readiness, coverage & propagated risk across flexibility window
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {windowComparison.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-amber-200 font-mono text-center px-4">
              Candidate launch-window comparison unavailable until required domain telemetry is present.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={windowComparison} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2b4c" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="readiness" name="Readiness" fill="#10b981" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="coverage_score" name="Coverage %" fill="#00f2fe" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="debris_risk" name="Debris Risk" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={14} />
                <Bar dataKey="weather_risk" name="Weather Risk" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
