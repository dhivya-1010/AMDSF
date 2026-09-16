import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

export default function MissionCharts({ chartData }) {
  const riskBreakdown = chartData?.risk_breakdown || [
    { name: 'Debris Conjunction', risk_index: 26, domain: 'SSA' },
    { name: 'Space Weather', risk_index: 15, domain: 'Heliophysics' },
    { name: 'Feasibility Constraint', risk_index: 10, domain: 'Propulsion' },
    { name: 'Coverage Gap', risk_index: 7, domain: 'Constellation' }
  ];

  const windowComparison = chartData?.launch_window_comparison || [
    { window: 'Monday', risk: 68, cost: 39, coverage: 89, safety: 32 },
    { window: 'Tuesday (Recommended)', risk: 24, cost: 42, coverage: 93, safety: 88 },
    { window: 'Wednesday', risk: 45, cost: 46, coverage: 91, safety: 72 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-space-900 border border-space-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-cyan-300 font-semibold mb-1">{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }} className="flex justify-between gap-4">
              <span>{item.name}:</span>
              <span className="font-bold">{item.value}{item.name.includes('cost') ? '$M' : (item.name.includes('coverage') ? '%' : '')}</span>
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
              <span className="w-2 h-2 rounded-sm bg-rose-500"></span>
              DOMAIN RISK FACTOR BREAKDOWN
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Normalized vulnerability index per agent domain (0 = Minimal, 100 = Critical)</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={riskBreakdown}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2b4c" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="risk_index"
                name="Risk Index"
                fill="#f43f5e"
                radius={[0, 4, 4, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart B: Launch Window Comparison */}
      <div className="bg-space-900/80 border border-space-700/70 rounded-xl p-5 shadow-lg backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-space-700/50 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-cyan-400"></span>
              LAUNCH WINDOW TRADE-OFF COMPARISON
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Multi-objective evaluation across candidate launch epochs</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={windowComparison}
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2b4c" vertical={false} />
              <XAxis dataKey="window" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 capitalize">{value}</span>}
              />
              <Bar dataKey="safety" name="Safety Score" fill="#10b981" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="coverage" name="Coverage %" fill="#00f2fe" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="risk" name="Conjunction Risk" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="cost" name="Cost ($M)" fill="#f6ad55" radius={[3, 3, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
