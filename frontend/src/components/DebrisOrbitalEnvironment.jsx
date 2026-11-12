import React from 'react';

export default function DebrisOrbitalEnvironment({ debris = {}, status = 'NOT_RUN' }) {
  const details = debris?.details || {};
  const encounters = details.encounters || [];
  const closestScreened = details.closest_screened_objects || [];
  const available = status !== 'NOT_RUN' && status !== 'RUNNING' && debris?.risk_level && debris.risk_level !== 'INSUFFICIENT_DATA';

  const modeBadge = debris?.data_mode || details.data_mode || 'UNAVAILABLE';
  const modeClass =
    modeBadge === 'LIVE DATA'
      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
      : modeBadge === 'CACHED DATA'
      ? 'bg-sky-950/70 border-sky-500/40 text-sky-300'
      : modeBadge === 'DEMONSTRATION DATA'
      ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
      : 'bg-rose-950/70 border-rose-500/40 text-rose-300';

  const rowsToDisplay = encounters.length > 0 ? encounters : closestScreened;

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="bg-slate-950/85 border border-rose-500/30 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-rose-300 font-bold uppercase">PRELIMINARY SGP4 CONJUNCTION SCREENING</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${modeClass}`}>{modeBadge}</span>
          </div>
          <span className="text-slate-400 text-[11px]">{debris?.data_source || 'CelesTrak GP Catalog'}</span>
        </div>

        {debris?.summary && (
          <p className="text-xs text-slate-200 leading-relaxed">{debris.summary}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2 text-xs">
          <Metric label="Propagated Catalog" value={debris?.objects_analyzed ?? '—'} />
          <Metric label="Encounters (< Thresh)" value={debris?.nearby_objects ?? '—'} />
          <Metric label="Risk Classification" value={debris?.risk_level || '—'} />
          <Metric label="Threshold Radius" value={details.screening_threshold_km != null ? `${details.screening_threshold_km} km` : '—'} />
          <Metric label="OMM / TLE / >5-digit" value={`${details.omm_count ?? 0} / ${details.tle_count ?? 0} / ${details.extended_catalog_id_count ?? 0}`} />
        </div>
      </div>

      {!available ? (
        <Unavailable
          message={
            status === 'NOT_RUN'
              ? 'Click "Run Debris Analysis" or "Run Offline Demo" to screen mission orbital trajectories against CelesTrak active + debris catalogs.'
              : 'No validated mission/catalog conjunction data is available. Supply a valid NORAD ID / TLE / OMM or run Demonstration mode.'
          }
        />
      ) : (
        <div className="bg-black/75 border border-rose-500/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {encounters.length > 0
                ? `Measured Encounters Within ${details.screening_threshold_km} km (${encounters.length})`
                : `Closest Screened Catalog Objects (${closestScreened.length} nearest approaches outside ${details.screening_threshold_km} km threshold)`}
            </h3>
            <span className="text-[10px] text-slate-400">
              Orbit Source: {details.mission_orbital_source || '—'}
            </span>
          </div>

          {rowsToDisplay.length === 0 ? (
            <p className="text-xs text-slate-400">No catalog objects fell within the configured orbital shell band.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-2 text-[10px] uppercase text-slate-400 border-b border-white/15 pb-2 min-w-[640px]">
                <span>Object (ID)</span>
                <span>TCA (UTC)</span>
                <span>Miss Dist (km)</span>
                <span>Rel Vel (km/s)</span>
                <span>Format / Group</span>
                <span>Classification</span>
              </div>
              <div className="divide-y divide-white/10 min-w-[640px]">
                {rowsToDisplay.map((event, idx) => {
                  const sep = event.minimum_separation_km;
                  const within = sep <= (details.screening_threshold_km || 25);
                  return (
                    <div key={`${event.catalog_identifier || event.norad_id}-${idx}`} className="grid grid-cols-6 gap-2 text-xs text-slate-200 py-2 items-center">
                      <span className="truncate font-semibold" title={event.name}>
                        {event.name || 'Unknown'}{' '}
                        <span className="text-slate-400 text-[10px]">({event.catalog_identifier || event.norad_id || '—'})</span>
                      </span>
                      <span className="text-[11px] text-slate-300">{event.tca || '—'}</span>
                      <span className={within ? 'text-rose-300 font-bold' : 'text-emerald-300'}>
                        {sep != null ? `${Number(sep).toFixed(2)} km` : '—'}
                      </span>
                      <span>{event.relative_velocity_kms != null ? `${Number(event.relative_velocity_kms).toFixed(2)} km/s` : '—'}</span>
                      <span className="text-[10px] text-slate-400">
                        {event.format || 'OMM'} / {event.catalog_group || 'catalog'}
                      </span>
                      <span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sep <= 5
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                              : within
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {sep <= 5 ? 'HIGH' : within ? 'MEDIUM' : 'CLEAR'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] text-slate-400 bg-black/40 border border-white/10 rounded-lg p-3">
        {details.assessment_disclaimer ||
          'Preliminary SGP4 GP element screening (TEME -> ITRS via Astropy) is NOT a substitute for validated operational Conjunction Data Messages (CDMs) with state covariance or Pc collision probability.'}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/50 p-3">
      <div className="text-slate-400 text-[10px] uppercase">{label}</div>
      <div className="text-white font-bold mt-1">{value}</div>
    </div>
  );
}

function Unavailable({ message }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center text-sm text-amber-200">
      {message}
    </div>
  );
}
