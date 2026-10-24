import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, GitBranch, ArrowRight, ShieldCheck, CheckCircle2,
  Cpu, Activity, Scale, Award, UserCheck, Database,
  FileText, ExternalLink, Sparkles, BookOpen, ChevronRight,
  Maximize2, Minimize2, Info
} from 'lucide-react';
import ResearchPipeline from '../components/ResearchPipeline';
import { PIPELINE_STAGES, PIPELINE_METADATA } from '../data/pipelineArchitectureData';

export default function PipelineArchitecture() {
  const [selectedStageId, setSelectedStageId] = useState('profile');
  const [interactiveMode, setInteractiveMode] = useState('interactive');

  const selectedStage = PIPELINE_STAGES.find(s => s.id === selectedStageId) || PIPELINE_STAGES[0];

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8 font-sans">

      {/* PAGE HERO HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/90 via-slate-950/80 to-cyan-950/30 border border-cyan-500/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl hud-corner-ticks">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f2fe]" />
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                AEROSPACE MULTI-AGENT SPECIFICATION
              </span>
              <span className="text-xs font-mono text-slate-500">|</span>
              <span className="text-xs font-mono text-slate-300">ISO/IEEE 42010</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">
              Decision Pipeline Architecture
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Traceable multi-agent decision support framework decomposing complex space mission planning into
              seven sequentially connected, mathematically verified stages. From initial operator profile ingestion to
              final Human-in-the-Loop flight authorization.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono flex items-center justify-between gap-4">
              <span className="text-slate-400">Total Stages:</span>
              <span className="text-cyan-400 font-bold">07 Sequential</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono flex items-center justify-between gap-4">
              <span className="text-slate-400">Governance:</span>
              <span className="text-emerald-400 font-bold">HITL Flight Director</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono flex items-center justify-between gap-4">
              <span className="text-slate-400">Compliance:</span>
              <span className="text-cyan-300 font-bold">ISO/IEEE 42010</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE INTERACTIVE DECISION PIPELINE COMPONENT */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              INTERACTIVE PIPELINE FLOW (STAGES 01 – 07)
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any stage in the flow below to expand its technical dossier
          </span>
        </div>

        <ResearchPipeline currentStep="all" initiallyExpanded="profile" />
      </section>

      {/* STAGE-BY-STAGE DEEP DIVE DIRECTORY */}
      <section className="bg-black/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Architectural Stage Navigator</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Select any stage below to inspect its operational role, input feeds, and governing algorithms
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={selectedStage.route}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 transition font-semibold"
            >
              <span>Launch {selectedStage.title} Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* STAGE SELECTOR TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">{stage.num}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/50 border border-white/10 uppercase">
                    {stage.tag}
                  </span>
                </div>
                <span className="block text-xs font-mono font-bold truncate text-white">{stage.title}</span>
                <span className="block text-[10px] font-mono text-slate-400 truncate mt-0.5">{stage.sub}</span>
              </button>
            );
          })}
        </div>

        {/* SELECTED STAGE DEEP SPECIFICATION CARD */}
        <div className="rounded-xl border border-cyan-500/30 bg-black/60 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400/50">
                  STAGE {selectedStage.num}
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {selectedStage.title}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({selectedStage.sub})
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1">
                {selectedStage.summary}
              </p>
            </div>
            <Link
              to={selectedStage.route}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-center"
            >
              <span>{selectedStage.routeLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* PURPOSE */}
          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-3 text-xs font-mono">
            <span className="font-bold text-cyan-300 block mb-1">ARCHITECTURAL PURPOSE:</span>
            <p className="text-slate-200 leading-relaxed">{selectedStage.purpose}</p>
          </div>

          {/* 3-COLUMN METRICS: INPUTS, PROCESSING, OUTPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-black/50 border border-sky-500/20 rounded-lg p-3">
              <span className="font-bold text-sky-400 block mb-2 uppercase">Inputs Ingested:</span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {selectedStage.inputs.map((inp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-sky-400">▪</span>
                    <span><strong>{inp.name}:</strong> {inp.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/50 border border-purple-500/20 rounded-lg p-3">
              <span className="font-bold text-purple-400 block mb-2 uppercase">Transformations:</span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {selectedStage.processing.map((proc, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-400">{idx + 1}.</span>
                    <span><strong>{proc.step}:</strong> {proc.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/50 border border-emerald-500/20 rounded-lg p-3">
              <span className="font-bold text-emerald-400 block mb-2 uppercase">Outputs Generated:</span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {selectedStage.outputs.map((out, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">✔</span>
                    <span><strong>{out.name}:</strong> {out.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ALGORITHMS TABLE */}
          <div className="bg-black/50 border border-amber-500/20 rounded-lg p-3 font-mono text-xs">
            <span className="font-bold text-amber-400 block mb-2 uppercase">Relevant Mathematical Algorithms & Standards:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedStage.algorithms.map((algo, idx) => (
                <div key={idx} className="bg-black/60 border border-white/10 rounded-md p-2.5">
                  <div className="text-amber-300 font-bold text-xs">{algo.name}</div>
                  {algo.formula && (
                    <div className="mt-1 font-mono text-[10px] text-amber-200 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      {algo.formula}
                    </div>
                  )}
                  <p className="text-slate-400 text-[10px] mt-1.5">{algo.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ISO/IEEE 42010 TRACEABILITY MATRIX */}
      <section className="bg-black/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">ISO/IEEE 42010 Architecture Conformance</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            AUDIT VERIFIED
          </span>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">
          AMDSF conforms to the ISO/IEEE 42010 systems and software architecture standard by establishing bidirectional
          traceability between all architectural elements. Flight decisions synthesized by the Pareto solver can be audited
          back through the structured risk vectors to the raw telemetry ingested from external providers (CelesTrak, NOAA, DONKI).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-black/50 border border-white/10">
            <span className="text-cyan-400 font-bold block mb-1">Traceability Audit Trail</span>
            <p className="text-slate-400 text-[11px]">Every recommendation carries a cryptographically signed SHA-256 evidence token anchoring inputs and agent outputs.</p>
          </div>
          <div className="p-3 rounded-lg bg-black/50 border border-white/10">
            <span className="text-emerald-400 font-bold block mb-1">Human-in-the-Loop Safety</span>
            <p className="text-slate-400 text-[11px]">No autonomous agent possesses flight hardware firing authority; recommendations remain decision support only.</p>
          </div>
          <div className="p-3 rounded-lg bg-black/50 border border-white/10">
            <span className="text-purple-400 font-bold block mb-1">Pareto Multi-Objective Frontier</span>
            <p className="text-slate-400 text-[11px]">Strict mathematical dominance filtering guarantees no trade-off is concealed from the flight operations team.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
