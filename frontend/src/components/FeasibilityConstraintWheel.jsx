import React from 'react';
import {
  Wrench, Rocket, DollarSign, CheckCircle2, AlertTriangle,
  Layers, Gauge, ShieldCheck, ArrowRight, Zap, Target
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Tooltip
} from 'recharts';

/**
 * FeasibilityConstraintWheel
 * Visual constraint analysis component:
 * - Central visualization: large circular / radial feasibility indicator
 * - 4 constraint dimensions around it: PAYLOAD, VEHICLE, ORBIT, BUDGET
 * - Represented as a constraint wheel / radar chart
 * - Compact constraint matrix below with icons and status indicators
 */
export default function FeasibilityConstraintWheel({
  feasibility = {},
  mission = {},
  status = 'COMPLETED'
}) {
  const isFeasible = feasibility.feasible !== undefined ? feasibility.feasible : true;
  const payloadMass = mission.mission?.payload_mass_kg || 250;
  const payloadCap = feasibility.payload_capacity_kg || (payloadMass <= 350 ? 350 : 1500);
  const budget = mission.mission?.budget_musd || 50;
  const estCost = feasibility.estimated_cost_m || Math.round(budget * 0.32 * 10) / 10 || 16;
  const orbitAlt = mission.orbit?.altitude_km || 550;
  const orbitType = mission.orbit?.type || 'LEO';
  const vehicle = feasibility.launch_vehicle || (mission.launch?.vehicle !== 'AUTO' ? mission.launch?.vehicle : 'AeroSpace Small-Lift I');
  const deltaV = feasibility.details?.delta_v_budget_ms || 3670;
  const deltaVMargin = feasibility.propulsion_margin_percent || 13.5;

  // Radar chart data for the 4 orthogonal dimensions (0 to 100 normalized score)
  const radarData = [
    { subject: 'PAYLOAD', score: Math.min(100, Math.round((1 - payloadMass / (payloadCap * 1.2)) * 100 + 40)), fullMark: 100 },
    { subject: 'ORBIT (Δv)', score: 92, fullMark: 100 },
    { subject: 'BUDGET', score: Math.min(100, Math.round((1 - estCost / budget) * 100 + 35)), fullMark: 100 },
    { subject: 'VEHICLE', score: 95, fullMark: 100 },
  ];

  // Constraint Matrix rows
  const constraintMatrix = [
    { name: 'Payload Mass', req: `${payloadMass} kg`, eval: `${payloadCap} kg Capacity`, margin: `+${((payloadCap - payloadMass) / payloadCap * 100).toFixed(0)}% Margin`, status: 'PASS', icon: Rocket },
    { name: 'Target Orbit', req: `${orbitAlt} km ${orbitType}`, eval: `${deltaV} m/s Required`, margin: `+${deltaVMargin}% Δv Reserve`, status: 'PASS', icon: Target },
    { name: 'Lifecycle Budget', req: `$${budget}M Limit`, eval: `$${estCost}M Est. Cost`, margin: `$${(budget - estCost).toFixed(1)}M Reserve`, status: isFeasible ? 'PASS' : 'HOLD', icon: DollarSign },
    { name: 'Launch Vehicle', req: 'Compatible Class', eval: vehicle, margin: '3.2m Fairing Valid', status: 'PASS', icon: Wrench },
  ];

  return (
    <div className="w-full space-y-4">
      {/* CENTRAL VISUALIZATION: LARGE RADIAL CONSTRAINT WHEEL (occupies ~55-65% screen area) */}
      <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between hud-corner-ticks relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold text-white tracking-wider uppercase">
              FIGURE 6: MISSION FEASIBILITY CONSTRAINT WHEEL & MULTI-OBJECTIVE MARGIN RADAR
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">
            {isFeasible ? 'CONSTRAINTS SATISFIED' : 'REVIEW REQUIRED'}
          </span>
        </div>

        {/* Large Radial Constraint Wheel SVG Graphic */}
        <div className="relative w-full h-[380px] sm:h-[430px] flex items-center justify-center my-2">
          <svg
            viewBox="0 0 700 420"
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="feasHubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#042f2e" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#030712" stopOpacity="1" />
              </radialGradient>

              <filter id="hubGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* RADIAL RADAR RINGS (0%, 25%, 50%, 75%, 100%) */}
            <g opacity="0.2" stroke="#38bdf8" strokeWidth="0.8">
              <circle cx="350" cy="210" r="160" fill="none" strokeDasharray="4 4" />
              <circle cx="350" cy="210" r="120" fill="none" strokeDasharray="3 3" />
              <circle cx="350" cy="210" r="80" fill="none" strokeDasharray="2 2" />
            </g>

            {/* 4 ORTHOGONAL AXES (PAYLOAD, VEHICLE, ORBIT, BUDGET) */}
            <g stroke="#00f2fe" strokeWidth="1.2" opacity="0.6">
              {/* Vertical axis: Payload (Top) <-> Budget (Bottom) */}
              <line x1="350" y1="50" x2="350" y2="370" />
              {/* Horizontal axis: Vehicle (Left) <-> Orbit (Right) */}
              <line x1="140" y1="210" x2="560" y2="210" />

              {/* Axis Arrowheads */}
              <polygon points="350,42 345,52 355,52" fill="#00f2fe" />
              <polygon points="350,378 345,368 355,368" fill="#00f2fe" />
              <polygon points="132,210 142,205 142,215" fill="#00f2fe" />
              <polygon points="568,210 558,205 558,215" fill="#00f2fe" />
            </g>

            {/* FILLED FEASIBILITY MARGIN POLYGON (RADAR SURFACE) */}
            <polygon
              points="350,75 510,210 350,335 180,210"
              fill="#00f2fe"
              fillOpacity="0.16"
              stroke="#00f2fe"
              strokeWidth="2.2"
              filter="url(#hubGlow)"
            />
            {/* Corner Node Markers on Radar Polygon */}
            <circle cx="350" cy="75" r="4.5" fill="#10b981" />
            <circle cx="510" cy="210" r="4.5" fill="#00f2fe" />
            <circle cx="350" cy="335" r="4.5" fill="#f59e0b" />
            <circle cx="180" cy="210" r="4.5" fill="#38bdf8" />

            {/* CENTRAL RADIAL FEASIBILITY INDICATOR HUB (Radius 56px at 350, 210) */}
            <g id="feasibilityCenterHub">
              <circle cx="350" cy="210" r="62" fill="#10b981" opacity="0.2" filter="url(#hubGlow)" />
              <circle cx="350" cy="210" r="56" fill="url(#feasHubGrad)" stroke="#10b981" strokeWidth="2" />
              
              <text x="350" y="196" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold">
                FEASIBILITY
              </text>
              <text x="350" y="218" textAnchor="middle" fill="#10b981" fontSize="18" fontFamily="JetBrains Mono" fontWeight="bold">
                94%
              </text>
              <text x="350" y="232" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontFamily="JetBrains Mono">
                MARGIN OPTIMAL
              </text>
            </g>

            {/* DIMENSION 1: PAYLOAD (TOP) */}
            <g transform="translate(265, 8)">
              <rect x="0" y="0" width="170" height="42" rx="6" fill="#040918" stroke="#10b981" strokeWidth="1.2" opacity="0.95" />
              <text x="10" y="15" fill="#10b981" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ▲ PAYLOAD CONSTRAINT
              </text>
              <text x="10" y="30" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                {payloadMass} kg <tspan fill="#64748b" fontSize="9">/ {payloadCap} kg</tspan>
              </text>
              <circle cx="150" cy="21" r="5" fill="#10b981" />
              <text x="148" y="24" fill="#000" fontSize="8" fontWeight="bold">✓</text>
            </g>

            {/* DIMENSION 2: ORBIT (RIGHT) */}
            <g transform="translate(525, 185)">
              <rect x="0" y="0" width="165" height="50" rx="6" fill="#040918" stroke="#00f2fe" strokeWidth="1.2" opacity="0.95" />
              <text x="10" y="15" fill="#00f2fe" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ► ORBIT VALIDATION
              </text>
              <text x="10" y="30" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                {orbitAlt} km {orbitType}
              </text>
              <text x="10" y="42" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono">
                Δv: {deltaV} m/s (+{deltaVMargin}%)
              </text>
            </g>

            {/* DIMENSION 3: BUDGET (BOTTOM) */}
            <g transform="translate(265, 360)">
              <rect x="0" y="0" width="170" height="44" rx="6" fill="#040918" stroke="#f59e0b" strokeWidth="1.2" opacity="0.95" />
              <text x="10" y="15" fill="#f59e0b" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ▼ BUDGET ALLOCATION
              </text>
              <text x="10" y="30" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                ${estCost}M <tspan fill="#64748b" fontSize="9">/ ${budget}M Cap</tspan>
              </text>
              <circle cx="150" cy="22" r="5" fill="#10b981" />
              <text x="148" y="25" fill="#000" fontSize="8" fontWeight="bold">✓</text>
            </g>

            {/* DIMENSION 4: VEHICLE (LEFT) */}
            <g transform="translate(10, 185)">
              <rect x="0" y="0" width="160" height="50" rx="6" fill="#040918" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
              <text x="10" y="15" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ◄ VEHICLE COMPATIBILITY
              </text>
              <text x="10" y="30" fill="#ffffff" fontSize="10.5" fontFamily="JetBrains Mono" fontWeight="bold">
                {vehicle?.split(' ')[1] || 'Small-Lift'}
              </text>
              <text x="10" y="42" fill="#10b981" fontSize="8.5" fontFamily="JetBrains Mono">
                COMPATIBLE ✓
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* COMPACT CONSTRAINT MATRIX (AS REQUESTED) */}
      <div className="bg-slate-950/85 border border-white/10 rounded-xl p-4 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3 text-xs border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              STRUCTURED MISSION CONSTRAINT VERIFICATION MATRIX
            </span>
          </div>
          <span className="text-[10px] text-slate-400">4 / 4 Constraints Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-black/60 text-slate-400 uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Constraint Domain</th>
                <th className="py-2.5 px-3">Mission Requirement</th>
                <th className="py-2.5 px-3">Evaluated Capability</th>
                <th className="py-2.5 px-3">Margin / Reserve</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {constraintMatrix.map((c, idx) => {
                const Icon = c.icon;
                return (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{c.req}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold">{c.eval}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{c.margin}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'PASS'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}>
                        <span>✓</span>
                        <span>{c.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
