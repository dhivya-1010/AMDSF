import React from 'react';
import { Wrench, Rocket, DollarSign, CheckCircle2, Target } from 'lucide-react';

export default function FeasibilityConstraintWheel({
  feasibility = {},
  mission = {},
  status = 'NOT_RUN',
}) {
  const hasResult = Boolean(feasibility && feasibility.budget_status);
  const isFeasible = feasibility?.feasible === true;
  const payloadMass = Number(mission?.mission?.payload_mass_kg ?? 0);
  const payloadCap = Number(feasibility?.payload_capacity_kg ?? 0);
  const budget = Number(mission?.mission?.budget_musd ?? 0);
  const estCost = Number(feasibility?.estimated_cost_m ?? 0);
  const orbitAlt = Number(mission?.orbit?.altitude_km ?? 0);
  const orbitType = mission?.orbit?.type || 'LEO';
  const vehicle = feasibility?.launch_vehicle || '—';
  const deltaV = feasibility?.details?.delta_v_budget_ms ?? '—';
  const deltaVMargin = Number(feasibility?.propulsion_margin_percent ?? 0);
  const breakdown = feasibility?.details?.cost_breakdown_musd || null;
  const orbMech = feasibility?.details?.orbital_mechanics || {};

  const payloadMarginPct = payloadCap > 0 ? Math.round(((payloadCap - payloadMass) / payloadCap) * 100) : null;
  const vehicleCompatible = Boolean(feasibility?.launch_vehicle && feasibility.launch_vehicle !== 'UNAVAILABLE');
  const budgetReserve = hasResult ? Number((budget - estCost).toFixed(1)) : null;

  const constraintMatrix = [
    {
      name: 'Payload Mass',
      req: `${payloadMass} kg`,
      eval: payloadCap > 0 ? `${payloadCap} kg Capacity` : 'No Compatible Vehicle',
      margin: payloadMarginPct !== null ? `${payloadMarginPct >= 0 ? '+' : ''}${payloadMarginPct}% Margin` : '—',
      status: hasResult ? (payloadCap >= payloadMass && payloadCap > 0 ? 'PASS' : 'HOLD') : 'PENDING',
      icon: Rocket,
    },
    {
      name: 'Target Orbit',
      req: `${orbitAlt} km ${orbitType}`,
      eval: orbMech.circular_velocity_kms ? `${orbMech.circular_velocity_kms} km/s • T=${orbMech.orbital_period_minutes}m` : `${deltaV} m/s`,
      margin: hasResult ? `+${deltaVMargin}% Δv Reserve` : '—',
      status: hasResult && vehicleCompatible ? 'PASS' : (hasResult ? 'HOLD' : 'PENDING'),
      icon: Target,
    },
    {
      name: 'Lifecycle Budget',
      req: `$${budget}M Limit`,
      eval: hasResult ? `$${estCost}M Est. Cost` : '—',
      margin: budgetReserve !== null ? `${budgetReserve >= 0 ? '+' : ''}$${budgetReserve}M Reserve` : '—',
      status: hasResult ? (isFeasible ? 'PASS' : 'HOLD') : 'PENDING',
      icon: DollarSign,
    },
    {
      name: 'Launch Vehicle',
      req: mission?.launch?.launch_site_code || 'Configured Site',
      eval: vehicle,
      margin: feasibility?.details?.fairing_static_envelope || 'Catalog Match',
      status: hasResult ? (vehicleCompatible ? 'PASS' : 'HOLD') : 'PENDING',
      icon: Wrench,
    },
  ];

  const passCount = constraintMatrix.filter((c) => c.status === 'PASS').length;
  const overallScore = hasResult
    ? Math.max(15, Math.min(99, Math.round((passCount / constraintMatrix.length) * 80 + (isFeasible ? Math.min(19, deltaVMargin / 2) : 0))))
    : 0;

  // Dynamic radar polygon coordinates inside SVG (center 350,210, max radius 155)
  const rTop = hasResult && payloadCap > 0 ? 60 + 95 * Math.min(1, payloadMass / payloadCap) : 40;
  const rRight = hasResult && vehicleCompatible ? 125 : 35;
  const rBottom = hasResult && budget > 0 ? Math.max(35, Math.min(155, 145 * Math.min(1.1, budget / Math.max(estCost, 0.1)))) : 40;
  const rLeft = hasResult && vehicleCompatible ? 140 : 30;
  const polyPoints = `350,${210 - rTop} ${350 + rRight},210 350,${210 + rBottom} ${350 - rLeft},210`;

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white tracking-wider uppercase">
              ENGINEERING & ECONOMIC FEASIBILITY MATRIX
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded font-bold text-[10px] border ${
              !hasResult
                ? 'bg-slate-900 border-slate-700 text-slate-300'
                : isFeasible
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
            }`}
          >
            {!hasResult ? 'PENDING ANALYSIS' : feasibility.budget_status}
          </span>
        </div>

        <div className="relative w-full h-[340px] sm:h-[380px] flex items-center justify-center my-2">
          <svg viewBox="0 0 700 420" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
            <g opacity="0.2" stroke="#38bdf8" strokeWidth="0.8">
              <circle cx="350" cy="210" r="155" fill="none" strokeDasharray="4 4" />
              <circle cx="350" cy="210" r="110" fill="none" strokeDasharray="3 3" />
              <circle cx="350" cy="210" r="70" fill="none" strokeDasharray="2 2" />
            </g>
            <g stroke="#00f2fe" strokeWidth="1.2" opacity="0.55">
              <line x1="350" y1="50" x2="350" y2="370" />
              <line x1="140" y1="210" x2="560" y2="210" />
            </g>
            <polygon
              points={polyPoints}
              fill={isFeasible ? '#10b981' : '#f43f5e'}
              fillOpacity="0.16"
              stroke={isFeasible ? '#10b981' : '#f43f5e'}
              strokeWidth="2.2"
            />
            <circle cx="350" cy="210" r="56" fill="#061224" stroke={isFeasible ? '#10b981' : '#f43f5e'} strokeWidth="2" />
            <text x="350" y="196" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontWeight="bold">VIABILITY</text>
            <text x="350" y="218" textAnchor="middle" fill={isFeasible ? '#10b981' : '#f43f5e'} fontSize="18" fontWeight="bold">
              {hasResult ? `${overallScore}%` : '—'}
            </text>
            <text x="350" y="232" textAnchor="middle" fill="#38bdf8" fontSize="8.5">
              {!hasResult ? 'NOT RUN' : isFeasible ? 'FEASIBLE' : 'CONSTRAINED'}
            </text>

            <g transform="translate(265, 8)">
              <rect x="0" y="0" width="170" height="42" rx="6" fill="#040918" stroke="#10b981" strokeWidth="1.2" />
              <text x="10" y="15" fill="#10b981" fontSize="9" fontWeight="bold">PAYLOAD LIMIT</text>
              <text x="10" y="30" fill="#fff" fontSize="10.5" fontWeight="bold">
                {payloadMass} kg <tspan fill="#64748b">/ {payloadCap || '—'} kg</tspan>
              </text>
            </g>

            <g transform="translate(520, 185)">
              <rect x="0" y="0" width="170" height="50" rx="6" fill="#040918" stroke="#00f2fe" strokeWidth="1.2" />
              <text x="10" y="15" fill="#00f2fe" fontSize="9" fontWeight="bold">ORBITAL MECHANICS</text>
              <text x="10" y="30" fill="#fff" fontSize="10.5" fontWeight="bold">{orbitAlt} km {orbitType}</text>
              <text x="10" y="42" fill="#94a3b8" fontSize="8.5">
                {orbMech.circular_velocity_kms ? `V=${orbMech.circular_velocity_kms} km/s` : `Δv ${deltaV} m/s`}
              </text>
            </g>

            <g transform="translate(265, 360)">
              <rect x="0" y="0" width="170" height="44" rx="6" fill="#040918" stroke="#f59e0b" strokeWidth="1.2" />
              <text x="10" y="15" fill="#f59e0b" fontSize="9" fontWeight="bold">BUDGET ENVELOPE</text>
              <text x="10" y="30" fill="#fff" fontSize="10.5" fontWeight="bold">
                {hasResult ? `$${estCost}M` : '—'} <tspan fill="#64748b">/ ${budget}M</tspan>
              </text>
            </g>

            <g transform="translate(10, 185)">
              <rect x="0" y="0" width="165" height="50" rx="6" fill="#040918" stroke="#38bdf8" strokeWidth="1.2" />
              <text x="10" y="15" fill="#38bdf8" fontSize="9" fontWeight="bold">LAUNCH VEHICLE</text>
              <text x="10" y="30" fill="#fff" fontSize="9.5" fontWeight="bold">
                {vehicle.length > 22 ? `${vehicle.slice(0, 22)}...` : vehicle}
              </text>
              <text x="10" y="42" fill={vehicleCompatible ? '#10b981' : '#f43f5e'} fontSize="8.5">
                {!hasResult ? 'PENDING' : vehicleCompatible ? 'COMPATIBLE' : 'NONE MATCHED'}
              </text>
            </g>
          </svg>
        </div>

        {breakdown && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
            <CostTile label="Launch Vehicle Cost" value={`$${breakdown.launch}M`} source={breakdown.launch_source} />
            <CostTile label="Satellite Manufacturing" value={`$${breakdown.satellite_manufacturing}M`} source={breakdown.manufacturing_source} />
            <CostTile label="Lifecycle Operations" value={`$${breakdown.operations_total}M`} source={breakdown.operations_source} />
            <CostTile label="Total Mission Cost" value={`$${breakdown.total}M`} source={`Budget: $${budget}M`} />
          </div>
        )}
      </div>

      {/* Verification Matrix */}
      <div className="bg-slate-950/85 border border-white/10 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 text-xs border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white uppercase tracking-wider">CONSTRAINT VERIFICATION MATRIX</span>
          </div>
          <span className="text-[10px] text-slate-400">{passCount} / {constraintMatrix.length} Constraints Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-black/60 text-slate-400 uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Constraint Domain</th>
                <th className="py-2.5 px-3">Mission Requirement</th>
                <th className="py-2.5 px-3">Evaluated Capability</th>
                <th className="py-2.5 px-3">Margin / Notes</th>
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
                    <td className="py-2.5 px-3">{c.req}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold">{c.eval}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{c.margin}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          c.status === 'PASS'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : c.status === 'HOLD'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {feasibility?.summary && (
          <p className="mt-3 text-[11px] text-slate-400">{feasibility.summary}</p>
        )}
      </div>
    </div>
  );
}

function CostTile({ label, value, source }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/50 p-2.5">
      <div className="text-[10px] text-slate-400 uppercase">{label}</div>
      <div className="text-white font-bold mt-0.5">{value}</div>
      <div className="text-[9px] text-slate-500 mt-0.5 truncate">{source}</div>
    </div>
  );
}
