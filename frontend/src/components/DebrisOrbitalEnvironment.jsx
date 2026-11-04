import React from 'react';

export default function DebrisOrbitalEnvironment({ debris = {}, mission = {}, status = 'NOT_RUN' }) {
  const details = debris.details || {};
  const encounters = details.encounters || [];
  const available = status === 'COMPLETED' && debris.status !== 'unavailable' && debris.risk_level !== 'INSUFFICIENT_DATA';

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-rose-300 font-bold uppercase">PRELIMINARY CONJUNCTION SCREENING</span>
          <span className="text-slate-400">{available ? 'Measured result' : 'Awaiting orbital data'}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          <Metric label="Catalog records" value={debris.objects_analyzed ?? '—'} />
          <Metric label="Candidates" value={debris.nearby_objects ?? '—'} />
          <Metric label="Risk class" value={debris.risk_level || '—'} />
          <Metric label="Threshold" value={details.screening_threshold_km != null ? `${details.screening_threshold_km} km` : '—'} />
        </div>
      </div>
      {!available ? (
        <Unavailable message="No propagated mission/catalog encounter data is available. Supply a valid mission TLE and a current catalog snapshot." />
      ) : (
        <div className="bg-black/75 border border-rose-500/40 rounded-2xl p-4">
          <h3 className="text-sm text-white mb-3">Measured candidate encounters</h3>
          <div className="space-y-2">
            {encounters.map((event) => (
              <div key={`${event.norad_id}-${event.tca}`} className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-slate-300 border-b border-white/10 py-2">
                <span>{event.name || event.norad_id}</span>
                <span>{event.tca || '—'}</span>
                <span>{event.minimum_separation_km != null ? `${event.minimum_separation_km} km` : '—'}</span>
                <span>{event.relative_velocity_kms != null ? `${event.relative_velocity_kms} km/s` : '—'}</span>
                <span>{event.refinement_method || 'sampled'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="text-[10px] text-slate-400">
        SGP4 states are transformed from TEME to ITRS with Astropy. Results are preliminary screening only; no covariance or collision probability is calculated.
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-lg border border-white/10 bg-black/50 p-3"><div className="text-slate-400">{label}</div><div className="text-white font-bold mt-1">{value}</div></div>;
}

function Unavailable({ message }) {
  return <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center text-sm text-amber-200">{message}</div>;
}
