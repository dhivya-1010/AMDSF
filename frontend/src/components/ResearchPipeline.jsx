import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Database, Cpu, Activity, Scale,
  Award, UserCheck, ArrowRight, ArrowDown, ChevronRight,
  ChevronDown, ChevronUp, Layers, CheckCircle2, Sparkles,
  Maximize2, Minimize2, ExternalLink, Target, Compass,
  Download, Upload, Cog, Code2, X, ShieldCheck
} from 'lucide-react';
import { PIPELINE_STAGES, PIPELINE_METADATA } from '../data/pipelineArchitectureData';

const ICON_MAP = {
  FileText,
  Database,
  Cpu,
  Activity,
  Scale,
  Award,
  UserCheck
};

/**
 * AMDSF DECISION PIPELINE ARCHITECTURE COMPONENT
 * ISO/IEEE 42010 Architecture Flow • Traceable Multi-Agent Flow
 *
 * Suggested interaction behavior:
 * - Collapsed view: Show only the stage number, title (with visual flow arrows connecting all 7 stages).
 * - On click: Expand the stage to reveal its purpose, inputs, processing, outputs, and relevant algorithms.
 * - Visual flow: Connect all seven stages with arrows to show the decision pipeline.
 */
export default function ResearchPipeline({
  currentStep = 'all',
  compact = false,
  theme = 'surveillance',
  initiallyExpanded = null
}) {
  const isLab = theme === 'laboratory';

  // State: which stage is currently expanded (null if collapsed view)
  const [expandedStageId, setExpandedStageId] = useState(
    initiallyExpanded || (currentStep !== 'all' ? null : null)
  );

  // State: whether all stages are expanded simultaneously
  const [expandAll, setExpandAll] = useState(false);

  // Toggle or select an expanded stage
  const handleStageClick = (stageId) => {
    if (expandAll) {
      setExpandAll(false);
      setExpandedStageId(stageId);
      return;
    }
    if (expandedStageId === stageId) {
      setExpandedStageId(null); // collapse back
    } else {
      setExpandedStageId(stageId);
    }
  };

  // Navigate to previous or next stage
  const handlePrevStage = () => {
    const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === expandedStageId);
    if (currentIndex > 0) {
      setExpandedStageId(PIPELINE_STAGES[currentIndex - 1].id);
    } else {
      setExpandedStageId(PIPELINE_STAGES[PIPELINE_STAGES.length - 1].id);
    }
  };

  const handleNextStage = () => {
    const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === expandedStageId);
    if (currentIndex < PIPELINE_STAGES.length - 1) {
      setExpandedStageId(PIPELINE_STAGES[currentIndex + 1].id);
    } else {
      setExpandedStageId(PIPELINE_STAGES[0].id);
    }
  };

  const activeExpandedStage = PIPELINE_STAGES.find(s => s.id === expandedStageId);

  return (
    <div className={`w-full rounded-2xl transition-all duration-300 relative ${
      isLab
        ? 'bg-[#0a0f18]/95 border border-slate-700/60 shadow-2xl'
        : 'bg-black/85 border border-cyan-500/35 shadow-[0_15px_40px_rgba(0,0,0,0.7)]'
    } ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>

      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-white/10 gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLab ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse shadow-[0_0_8px_#00f2fe]`} />
            <span className={`font-bold tracking-wider uppercase text-sm ${isLab ? 'text-slate-100' : 'text-white'}`}>
              {PIPELINE_METADATA.title}
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">• {PIPELINE_METADATA.subtitle}</span>
          <span className="text-[10px] text-cyan-400/90 font-mono px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
            {PIPELINE_METADATA.standard}
          </span>
        </div>

        {/* Action Controls: Expand All / Collapse View / Helper Hint */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => {
              if (expandAll) {
                setExpandAll(false);
                setExpandedStageId(null);
              } else {
                setExpandAll(true);
                setExpandedStageId(null);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition border bg-black/50 hover:bg-white/10 text-slate-300 hover:text-white border-white/15"
            title={expandAll ? "Collapse all stages to pipeline flow" : "Expand all 7 stages simultaneously"}
          >
            {expandAll ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Collapse to Minimal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Expand All Stages</span>
              </>
            )}
          </button>

          <Link
            to="/architecture"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/40"
            title="Open dedicated ISO/IEEE 42010 Architecture Blueprint"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Full Blueprint</span>
          </Link>
        </div>
      </div>

      {/* SUB-HEADER HINT / STATUS */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400">💡</span>
          <span>Click any stage to expand its Purpose, Inputs, Processing, Outputs & Algorithms</span>
        </div>
        {expandedStageId && !expandAll && (
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-bold">
              Inspecting Stage {activeExpandedStage?.num}: {activeExpandedStage?.title}
            </span>
            <button
              onClick={() => setExpandedStageId(null)}
              className="text-slate-400 hover:text-white underline text-[10px]"
            >
              [Collapse]
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          COLLAPSED VIEW: VISUAL FLOW CONNECTING ALL 7 STAGES WITH ARROWS
          Shows only the stage number, title, tag, and subtitle.
          ========================================================================= */}
      <div className="relative">
        {/* Horizontal Pipeline Grid for Desktop / Flex for Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-1.5 relative items-stretch">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = ICON_MAP[stage.iconName] || FileText;
            const isContextActive = currentStep === 'all' || currentStep === stage.id;
            const isCurrentlyExpanded = expandAll || expandedStageId === stage.id;

            // Visual styling based on state
            let cardClasses = 'bg-black/50 border-white/10 hover:border-cyan-400/60 text-slate-300 hover:text-white';
            let iconContainer = 'bg-black/60 border-white/15 text-slate-300';
            let tagBadge = stage.badgeClass;

            if (isCurrentlyExpanded) {
              cardClasses = 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(0,242,254,0.3)] text-white scale-[1.02] z-20';
              iconContainer = 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_#00f2fe]';
            } else if (isContextActive && currentStep !== 'all') {
              cardClasses = 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(0,242,254,0.2)] text-white';
              iconContainer = 'bg-cyan-950/70 border-cyan-400/60 text-cyan-300';
            }

            return (
              <div key={stage.id} className="relative flex flex-col justify-between group">
                {/* STAGE CARD (COLLAPSED HEADER) */}
                <button
                  type="button"
                  onClick={() => handleStageClick(stage.id)}
                  className={`w-full h-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between backdrop-blur-md cursor-pointer relative overflow-hidden ${cardClasses}`}
                  aria-expanded={isCurrentlyExpanded}
                  aria-label={`Stage ${stage.num}: ${stage.title}`}
                >
                  {/* Active Indicator Strip */}
                  {isCurrentlyExpanded && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 animate-pulse" />
                  )}

                  {/* Stage Top Bar: Tag & Stage Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${tagBadge}`}>
                      {stage.tag}
                    </span>
                    <span className="text-[11px] font-mono font-extrabold text-cyan-300/90 group-hover:text-cyan-300 transition">
                      {stage.num}
                    </span>
                  </div>

                  {/* Stage Body: Icon + Title */}
                  <div className="flex items-center gap-2.5 my-1">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition ${iconContainer}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition leading-tight truncate">
                        {stage.title}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 leading-tight truncate mt-0.5">
                        {stage.sub}
                      </span>
                    </div>
                  </div>

                  {/* Stage Card Bottom Action Hint */}
                  <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="group-hover:text-cyan-300 transition flex items-center gap-1">
                      {isCurrentlyExpanded ? 'Hide Specs' : 'Inspect'}
                    </span>
                    {isCurrentlyExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                    )}
                  </div>
                </button>

                {/* DESKTOP VISUAL FLOW ARROW CONNECTING STAGES */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div
                    className={`hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-30 pointer-events-none items-center justify-center w-4 h-4 rounded-full bg-slate-950 border ${
                      isCurrentlyExpanded || expandedStageId === PIPELINE_STAGES[idx + 1].id
                        ? 'border-cyan-400 text-cyan-300 shadow-[0_0_8px_#00f2fe]'
                        : 'border-white/20 text-slate-500'
                    }`}
                  >
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                )}

                {/* MOBILE / TABLET VISUAL CONNECTOR ARROW */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className="flex lg:hidden items-center justify-center py-1 text-slate-500">
                    <ArrowDown className="w-3 h-3 text-cyan-500/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          EXPANDED VIEW (ON CLICK): DETAILED ARCHITECTURAL BREAKDOWN
          Reveals: Purpose, Inputs, Processing, Outputs, and Relevant Algorithms
          ========================================================================= */}
      {activeExpandedStage && !expandAll && (
        <div className="mt-4 pt-4 border-t border-cyan-500/30 animate-fadeIn relative">
          <StageDetailCard
            stage={activeExpandedStage}
            isLab={isLab}
            onClose={() => setExpandedStageId(null)}
            onPrev={handlePrevStage}
            onNext={handleNextStage}
          />
        </div>
      )}

      {/* =========================================================================
          EXPAND ALL VIEW: ALL 7 STAGES DISPLAYED SIMULTANEOUSLY
          ========================================================================= */}
      {expandAll && (
        <div className="mt-6 pt-5 border-t border-cyan-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 text-xs font-mono text-cyan-300">
            <span className="font-bold uppercase tracking-wider">
              FULL DEEP DIVE: ALL 7 PIPELINE STAGES SPECIFIED
            </span>
            <span className="text-slate-400 text-[11px]">ISO/IEEE 42010 Architectural View</span>
          </div>

          <div className="space-y-4">
            {PIPELINE_STAGES.map((stage) => (
              <StageDetailCard
                key={stage.id}
                stage={stage}
                isLab={isLab}
                hideNav={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* FOOTER BAR: SUMMARY & TRACEABILITY BADGE */}
      <div className="mt-3.5 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            Bidirectional Traceability: <span className="text-slate-200">Profile (01) ➔ Feeds (02) ➔ Agents (03) ➔ Evidence (04) ➔ Solver (05) ➔ Synthesis (06) ➔ HITL Flight Authority (07)</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Autonomous Decision Support Standard</span>
          <span className="text-cyan-400 font-bold">7 / 7 STAGES ACTIVE</span>
        </div>
      </div>

    </div>
  );
}

/**
 * StageDetailCard Component
 * Renders the 5 detailed sections for an expanded stage:
 * 1. Purpose
 * 2. Inputs
 * 3. Processing
 * 4. Outputs
 * 5. Relevant Algorithms
 */
function StageDetailCard({
  stage,
  isLab = false,
  onClose,
  onPrev,
  onNext,
  hideNav = false
}) {
  const Icon = ICON_MAP[stage.iconName] || FileText;

  return (
    <div className={`w-full rounded-xl border p-4 sm:p-5 backdrop-blur-xl relative transition-all ${
      isLab
        ? 'bg-slate-900/90 border-slate-700/80 shadow-xl'
        : 'bg-black/90 border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
    }`}>
      {/* CORNER ACCENTS */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-xl pointer-events-none" />

      {/* STAGE HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)] shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                STAGE {stage.num}
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${stage.badgeClass}`}>
                {stage.tag}
              </span>
              <span className="text-sm sm:text-base font-mono font-extrabold text-white">
                {stage.title}
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-300/80 mt-0.5">
              {stage.sub} — <span className="text-slate-400">{stage.summary}</span>
            </p>
          </div>
        </div>

        {/* STAGE CONTROLS */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {!hideNav && onPrev && onNext && (
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={onPrev}
                className="px-2 py-1 rounded text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Go to previous stage"
              >
                ◀ Prev
              </button>
              <span className="text-white/20">|</span>
              <button
                type="button"
                onClick={onNext}
                className="px-2 py-1 rounded text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Go to next stage"
              >
                Next ▶
              </button>
            </div>
          )}

          {stage.route && (
            <Link
              to={stage.route}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 transition font-semibold"
            >
              <span>{stage.routeLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg bg-black/60 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
              title="Close stage details"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 5 MAIN PILLARS GRID */}
      <div className="space-y-4 font-mono text-xs">

        {/* 1. PURPOSE */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1.5 text-xs uppercase tracking-wider">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Purpose & Architectural Intent</span>
          </div>
          <p className="text-slate-200 leading-relaxed text-xs">
            {stage.purpose}
          </p>
        </div>

        {/* 2-COLUMN GRID: INPUTS & PROCESSING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

          {/* 2. INPUTS */}
          <div className="bg-black/40 border border-sky-500/25 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-2 text-xs uppercase tracking-wider">
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Inputs & Telemetry Ingested</span>
              </div>
              <ul className="space-y-2">
                {stage.inputs.map((inp, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <span className="text-sky-400 mt-0.5">•</span>
                    <div>
                      <span className="font-semibold text-white">{inp.name}: </span>
                      <span className="text-slate-300">{inp.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. PROCESSING */}
          <div className="bg-black/40 border border-purple-500/25 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-2 text-xs uppercase tracking-wider">
                <Cog className="w-3.5 h-3.5 text-purple-400" />
                <span>Processing & Transformations</span>
              </div>
              <ul className="space-y-2">
                {stage.processing.map((proc, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <span className="text-purple-400 mt-0.5">{i + 1}.</span>
                    <div>
                      <span className="font-semibold text-white">{proc.step}: </span>
                      <span className="text-slate-300">{proc.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* 2-COLUMN GRID: OUTPUTS & RELEVANT ALGORITHMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

          {/* 4. OUTPUTS */}
          <div className="bg-black/40 border border-emerald-500/25 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2 text-xs uppercase tracking-wider">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Outputs & Structured Artifacts</span>
              </div>
              <ul className="space-y-2">
                {stage.outputs.map((out, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <span className="text-emerald-400 mt-0.5">✔</span>
                    <div>
                      <span className="font-semibold text-emerald-300">{out.name}: </span>
                      <span className="text-slate-300">{out.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. RELEVANT ALGORITHMS */}
          <div className="bg-black/40 border border-amber-500/25 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-2 text-xs uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Relevant Algorithms & Formulations</span>
              </div>
              <ul className="space-y-2.5">
                {stage.algorithms.map((algo, i) => (
                  <li key={i} className="border-b border-white/5 pb-1.5 last:border-b-0 last:pb-0 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-amber-300">{algo.name}</span>
                      {algo.formula && (
                        <span className="px-1.5 py-0.5 rounded bg-black/70 text-amber-200 border border-amber-500/30 text-[10px] font-mono">
                          {algo.formula}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[10px] mt-0.5">{algo.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
