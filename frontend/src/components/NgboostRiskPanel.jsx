import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Play,
  RefreshCw,
  AlertTriangle,
  Database,
  ShieldAlert,
  BarChart3,
  Info,
} from 'lucide-react';
import missionApi from '../services/api';

function extractInitialFeatures(mission, debrisResult) {
  const details = debrisResult?.details || {};
  const lead =
    (details.encounters && details.encounters[0]) ||
    (details.closest_screened_objects && details.closest_screened_objects[0]) ||
    null;

  return {
    closest_approach_distance: lead?.minimum_separation_km != null ? Number(lead.minimum_separation_km).toFixed(2) : '2.50',
    relative_velocity: lead?.relative_velocity_kms != null ? Number(lead.relative_velocity_kms).toFixed(2) : '10.20',
    orbital_altitude:
      lead?.altitude_km != null
        ? Number(lead.altitude_km).toFixed(1)
        : mission?.orbit?.altitude_km != null
        ? Number(mission.orbit.altitude_km).toFixed(1)
        : '550.0',
    orbital_inclination:
      mission?.orbit?.inclination_deg != null
        ? Number(mission.orbit.inclination_deg).toFixed(2)
        : lead?.inclination_deg != null
        ? Number(lead.inclination_deg).toFixed(2)
        : '53.0',
  };
}

export default function NgboostRiskPanel({ mission = null, analysisResults = null }) {
  const debrisResult = analysisResults?.debris || null;
  const integratedMl =
    analysisResults?.ml_encounter_risk ||
    analysisResults?.recommendation?.ml_encounter_risk ||
    debrisResult?.ml_encounter_risk ||
    null;

  const [features, setFeatures] = useState(() => extractInitialFeatures(mission, debrisResult));
  const [modelInfo, setModelInfo] = useState(null);
  const [predictionResult, setPredictionResult] = useState(
    integratedMl?.status === 'completed' ? integratedMl : null
  );
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [mlError, setMlError] = useState(null);

  // Sync form inputs & integrated ML result when a new mission / debris screening finishes
  useEffect(() => {
    setFeatures(extractInitialFeatures(mission, debrisResult));
    if (integratedMl?.status === 'completed') {
      setPredictionResult(integratedMl);
      setMlError(null);
    }
  }, [mission?.mission_id, debrisResult?.timestamp, integratedMl]);

  // Fetch live NGBoost evaluation metrics & model metadata from FastAPI
  useEffect(() => {
    let active = true;
    const loadInfo = async () => {
      setLoadingInfo(true);
      try {
        const info = await missionApi.getMlModelInfo();
        if (active) setModelInfo(info);
      } catch (err) {
        if (active) {
          setMlError(err?.response?.data?.detail || 'Unable to load NGBoost model evaluation metrics from backend.');
        }
      } finally {
        if (active) setLoadingInfo(false);
      }
    };
    loadInfo();
    return () => {
      active = false;
    };
  }, []);

  const handleFieldChange = (field, value) => {
    setFeatures((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunPrediction = async (e) => {
    if (e) e.preventDefault();
    setPredicting(true);
    setMlError(null);

    const payload = {
      closest_approach_distance: Number(features.closest_approach_distance),
      relative_velocity: Number(features.relative_velocity),
      orbital_altitude: Number(features.orbital_altitude),
      orbital_inclination: Number(features.orbital_inclination),
    };

    if (
      !Number.isFinite(payload.closest_approach_distance) ||
      payload.closest_approach_distance <= 0 ||
      !Number.isFinite(payload.relative_velocity) ||
      payload.relative_velocity < 0 ||
      !Number.isFinite(payload.orbital_altitude) ||
      payload.orbital_altitude < 120 ||
      !Number.isFinite(payload.orbital_inclination) ||
      payload.orbital_inclination < 0 ||
      payload.orbital_inclination > 180
    ) {
      setPredicting(false);
      setMlError(
        'Enter valid finite encounter features: distance > 0 km, velocity >= 0 km/s, altitude >= 120 km, inclination 0-180 deg.'
      );
      return;
    }

    try {
      const result = await missionApi.predictEncounterRisk(payload);
      setPredictionResult(result);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setMlError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => `${d.loc?.slice(-1)[0] || 'input'}: ${d.msg}`).join('; ')
          : err?.message || 'NGBoost prediction request failed.'
      );
    } finally {
      setPredicting(false);
    }
  };

  const activeMetrics = predictionResult?.evaluation_metrics || modelInfo?.evaluation_metrics || null;
  const activeMeta = modelInfo || predictionResult?.model_info || null;
  const limitations =
    modelInfo?.limitations ||
    predictionResult?.model_info?.limitations ||
    [];
  const predClass = predictionResult?.prediction;

  const predBadgeClass =
    predClass === 'HIGH RISK'
      ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
      : predClass === 'MEDIUM RISK'
      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
      : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';

  const probsPct = predictionResult?.probabilities_percent || null;
  const uncertainty = predictionResult?.uncertainty || null;

  return (
    <section
      aria-label="NGBoost – Probabilistic Encounter Intelligence"
      className="bg-slate-950/90 border border-indigo-500/35 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl font-mono space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-indigo-400 text-xs">
            <BrainCircuit className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider">
              {predictionResult?.module_name || modelInfo?.module_name || 'Probabilistic Satellite Encounter Risk Prediction'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
            NGBoost – Probabilistic Encounter Intelligence
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Model: <strong className="text-indigo-300">{predictionResult?.model || modelInfo?.model || 'NGBoost'}</strong>{' '}
            ({activeMeta?.estimator || 'NGBClassifier'} • {activeMeta?.distribution || 'k_categorical(3)'} •{' '}
            {activeMeta?.scoring_rule || 'LogScore'}) — Secondary decision support alongside primary SGP4 screening
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>DATA MODE: {predictionResult?.data_mode || modelInfo?.data_mode || 'DEMONSTRATION'}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Input Controls + Prediction Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Input Features Form */}
        <form onSubmit={handleRunPrediction} className="lg:col-span-5 bg-black/50 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Encounter Input Parameters
            </span>
            {integratedMl?.screened_object_name && (
              <span className="text-[10px] text-cyan-300">
                Target: {integratedMl.screened_object_name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Closest Approach Distance (km)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="50000"
                required
                value={features.closest_approach_distance}
                onChange={(e) => handleFieldChange('closest_approach_distance', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-400"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Relative Velocity (km/s)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="25"
                required
                value={features.relative_velocity}
                onChange={(e) => handleFieldChange('relative_velocity', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-400"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Orbital Altitude (km)</span>
              <input
                type="number"
                step="0.1"
                min="120"
                max="42000"
                required
                value={features.orbital_altitude}
                onChange={(e) => handleFieldChange('orbital_altitude', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-400"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Orbital Inclination (deg)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="180"
                required
                value={features.orbital_inclination}
                onChange={(e) => handleFieldChange('orbital_inclination', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-400"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={predicting}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-50"
          >
            {predicting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running NGBoost Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run ML Risk Prediction</span>
              </>
            )}
          </button>

          {integratedMl?.status === 'unavailable' && !predictionResult && (
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{integratedMl.reason}</span>
            </div>
          )}

          {mlError && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{mlError}</span>
            </div>
          )}
        </form>

        {/* Probabilistic Prediction & Distribution */}
        <div className="lg:col-span-7 bg-black/50 border border-white/10 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>Predicted Encounter Risk & Class Probabilities</span>
            </span>
            {predClass && (
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${predBadgeClass}`}>
                {predClass}
              </span>
            )}
          </div>

          {!predictionResult ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Click <strong className="text-indigo-300">"Run ML Risk Prediction"</strong> or execute mission debris screening to generate probabilistic encounter risk outputs from the trained NGBoost classifier.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Probability Distribution Bars */}
              <div className="space-y-2.5 text-xs">
                {[
                  { key: 'low', label: 'LOW RISK', bar: 'bg-emerald-500', text: 'text-emerald-300' },
                  { key: 'medium', label: 'MEDIUM RISK', bar: 'bg-amber-500', text: 'text-amber-300' },
                  { key: 'high', label: 'HIGH RISK', bar: 'bg-rose-500', text: 'text-rose-300' },
                ].map((cls) => {
                  const pct = probsPct ? probsPct[cls.key] : 0;
                  return (
                    <div key={cls.key} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className={cls.text}>{cls.label}</span>
                        <span className="text-white font-bold">{pct.toFixed(2)}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                        <div
                          className={`h-full ${cls.bar} transition-all duration-300`}
                          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Echoed Inputs + Uncertainty Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">Miss Distance</span>
                  <strong className="text-white">{predictionResult.input_features?.closest_approach_distance} km</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">Rel. Velocity</span>
                  <strong className="text-white">{predictionResult.input_features?.relative_velocity} km/s</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">Uncertainty (Entropy)</span>
                  <strong className="text-indigo-300">
                    {uncertainty ? `${uncertainty.normalized_entropy} (${uncertainty.level})` : '—'}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">Top-Class Confidence</span>
                  <strong className="text-cyan-300">
                    {uncertainty ? `${(uncertainty.confidence * 100).toFixed(1)}%` : '—'}
                  </strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/70 p-2.5 rounded-lg border border-white/5">
                {predictionResult.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Model Evaluation Metrics & Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 border-t border-white/10">
        <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Held-Out Prototype Evaluation Metrics</span>
            </span>
            {loadingInfo && <span className="text-[10px] text-slate-400">Loading metrics...</span>}
            {activeMetrics && (
              <span className="text-[10px] text-slate-400">
                Split: {activeMetrics.train_samples} train / {activeMetrics.test_samples} test
              </span>
            )}
          </div>

          {activeMetrics ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {[
                  { label: 'Accuracy', val: `${(activeMetrics.accuracy * 100).toFixed(2)}%` },
                  { label: 'Precision', val: `${(activeMetrics.precision * 100).toFixed(2)}%` },
                  { label: 'Recall', val: `${(activeMetrics.recall * 100).toFixed(2)}%` },
                  { label: 'F1-Score', val: `${(activeMetrics.f1_score * 100).toFixed(2)}%` },
                  { label: 'Log Loss', val: activeMetrics.log_loss.toFixed(4) },
                ].map((m) => (
                  <div key={m.label} className="p-2 rounded-lg bg-slate-900 border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase block">{m.label}</span>
                    <strong className="text-sm text-cyan-300">{m.val}</strong>
                  </div>
                ))}
              </div>

              {activeMetrics.confusion_matrix && (
                <div className="overflow-x-auto">
                  <div className="text-[10px] text-slate-400 mb-1">Confusion Matrix (Rows = Actual, Cols = Predicted):</div>
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="text-slate-400 border-b border-white/10">
                        <th className="text-left py-1 pr-2">Actual \ Pred</th>
                        {(activeMetrics.confusion_matrix_labels || ['LOW', 'MED', 'HIGH']).map((lbl) => (
                          <th key={lbl} className="text-right py-1 px-2">{lbl}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeMetrics.confusion_matrix.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-white/5 text-slate-200">
                          <td className="py-1 pr-2 text-slate-400">
                            {(activeMetrics.confusion_matrix_labels || [])[rIdx] || `Class ${rIdx}`}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`text-right py-1 px-2 ${
                                rIdx === cIdx ? 'text-emerald-300 font-bold' : 'text-slate-400'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-[10px] text-amber-300/90">
                {activeMetrics.evaluation_disclaimer}
              </p>
            </>
          ) : (
            <div className="text-xs text-slate-400">Evaluation metrics pending backend connection.</div>
          )}
        </div>

        {/* Data Provenance & Limitations */}
        <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-xl p-4 space-y-2.5 text-[11px]">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Data Provenance & Model Limitations</span>
          </div>
          <div className="text-slate-300">
            Data Source:{' '}
            <strong className="text-amber-300">
              {modelInfo?.dataset_metadata?.dataset_name || 'AMDSF Synthetic Orbital Encounter Demonstration Dataset'}
            </strong>
          </div>
          <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
            {(limitations.length
              ? limitations
              : [
                  'Trained on a synthetic heuristic encounter dataset, not real empirical collision observations.',
                  'Class probabilities are not calibrated physical collision probabilities (Pc).',
                  'Deterministic SGP4 geometry remains primary orbital evidence inside AMDSF.',
                ]
            ).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

