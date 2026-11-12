import React from 'react';

export default function SolarWeatherEnvironment({ weather = {}, status = 'NOT_RUN' }) {
  const details = weather?.details || {};
  const available = status !== 'NOT_RUN' && status !== 'RUNNING' && weather?.status !== 'unavailable' && weather?.kp_index != null;
  const modeBadge = weather?.data_mode || details.data_mode || 'UNAVAILABLE';

  const modeClass =
    modeBadge === 'LIVE DATA'
      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
      : modeBadge === 'CACHED DATA'
      ? 'bg-sky-950/70 border-sky-500/40 text-sky-300'
      : modeBadge === 'DEMONSTRATION DATA'
      ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
      : 'bg-rose-950/70 border-rose-500/40 text-rose-300';

  const scales = details.noaa_scales || {};
  const alerts = details.alerts || [];
  const cmeList = weather?.recent_events || [];
  const flareList = details.flare_events || [];

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="bg-slate-950/85 border border-amber-500/30 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-bold uppercase">SPACE WEATHER OBSERVATIONS</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${modeClass}`}>{modeBadge}</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {available ? (weather?.data_sources || []).join(' • ') : 'Feeds not yet retrieved or unavailable'}
          </span>
        </div>

        {available ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-2 text-xs">
              <Metric label="Kp Index" value={weather.kp_index} />
              <Metric label="Risk Class" value={weather.risk_level} />
              <Metric label="F10.7 Solar Flux" value={details.solar_flux_f107 != null ? `${details.solar_flux_f107} sfu` : '—'} />
              <Metric label="Solar Wind" value={details.solar_wind_speed_kms != null ? `${details.solar_wind_speed_kms} km/s` : '—'} />
              <Metric label="IMF Bz (GSM)" value={details.solar_wind_bz_gsm != null ? `${details.solar_wind_bz_gsm} nT` : '—'} />
              <Metric label="Storm Flag" value={weather.geomagnetic_storm ? 'ACTIVE' : 'NO'} />
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[11px] pt-1">
              <ScaleBadge code="R" label="Radio" entry={scales.R} />
              <ScaleBadge code="S" label="Radiation" entry={scales.S} />
              <ScaleBadge code="G" label="Geomagnetic" entry={scales.G} />
              <Metric label="DONKI CMEs (7d)" value={details.cme_count ?? 'Unavail.'} />
              <Metric label="Solar Flares (7d)" value={details.flare_count ?? 'Unavail.'} />
              <Metric label="Storm Events (7d)" value={details.gst_count ?? 'Unavail.'} />
            </div>
          </>
        ) : (
          <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-5 text-center text-sm text-amber-200">
            {status === 'NOT_RUN'
              ? 'Click "Run Weather Analysis" or "Run Offline Demo" to fetch NOAA SWPC and NASA DONKI observations.'
              : 'NOAA SWPC and/or NASA DONKI telemetry is currently UNAVAILABLE. Space weather is NOT marked as NOMINAL without observed telemetry.'}
          </div>
        )}
      </div>

      {available && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/75 border border-white/10 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-amber-300 uppercase">NOAA SWPC Advisories & Alerts ({alerts.length})</h3>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400">No active SWPC alerts reported in current buffer.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {alerts.map((al, i) => (
                  <div key={i} className="text-[11px] border-b border-white/10 pb-2 text-slate-300">
                    <div className="text-amber-200 font-semibold">{al.product_id || 'SWPC Alert'} • {al.issue_datetime || ''}</div>
                    <div className="text-slate-400 mt-0.5 line-clamp-3">{al.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black/75 border border-white/10 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-cyan-300 uppercase">
              NASA DONKI Heliophysics Events (CMEs: {cmeList.length} • Flares: {flareList.length})
            </h3>
            {cmeList.length === 0 && flareList.length === 0 ? (
              <p className="text-xs text-slate-400">
                {details.donki_status === 'unavailable'
                  ? 'NASA DONKI feed was unavailable during this run (NOAA SWPC telemetry remains valid).'
                  : 'No CME or significant solar flare events recorded in the 7-day DONKI query window.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-[11px] text-slate-300">
                {cmeList.map((ev, i) => (
                  <div key={`cme-${i}`} className="border-b border-white/10 pb-1.5">
                    <div className="text-cyan-300 font-semibold">{ev.activityID || 'CME Event'} • {ev.startTime || ''}</div>
                    <div className="text-slate-400">{ev.note || ev.sourceLocation || 'CME recorded by DONKI'}</div>
                  </div>
                ))}
                {flareList.map((fl, i) => (
                  <div key={`flr-${i}`} className="border-b border-white/10 pb-1.5">
                    <div className="text-amber-300 font-semibold">Flare {fl.classType || ''} ({fl.flrID || ''}) • {fl.beginTime || ''}</div>
                    <div className="text-slate-400">Region location: {fl.sourceLocation || '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {weather?.summary && (
        <div className="text-xs text-slate-300 bg-black/50 border border-white/10 rounded-lg p-3 space-y-1">
          <p>{weather.summary}</p>
          <p className="text-[10px] text-slate-400">
            SWPC Observed: {details.swpc_source_timestamp || '—'} | Retrieved: {details.swpc_retrieved_at || '—'} | DONKI Retrieved: {details.donki_retrieved_at || '—'}
          </p>
        </div>
      )}
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

function ScaleBadge({ code, label, entry }) {
  const scaleVal = entry?.Scale ?? '—';
  const textVal = entry?.Text ?? '';
  return (
    <div className="rounded-lg border border-white/10 bg-black/50 p-3">
      <div className="text-slate-400 text-[10px] uppercase">NOAA {code} ({label})</div>
      <div className="text-amber-300 font-bold mt-1">
        {code}{scaleVal} <span className="text-slate-400 font-normal text-[10px]">{textVal}</span>
      </div>
    </div>
  );
}
