import React from 'react';
import {
  FileText, Database, Cpu, Activity, Scale,
  Award, UserCheck, ArrowRight, CheckCircle2
} from 'lucide-react';

/**
 * AMDSF Research Architecture Pipeline
 * Compact aerospace workflow visualization suitable for IEEE research paper figures.
 * MISSION PROFILE -> DATA INGESTION -> DOMAIN AGENTS -> STRUCTURED EVIDENCE -> PARETO-BASED ORCHESTRATION -> RECOMMENDATION -> HUMAN APPROVAL
 */
export default function ResearchPipeline({ currentStep = 'all', compact = false }) {
  const steps = [
    {
      id: 'profile',
      label: 'Mission Profile',
      sub: 'Orbit, Target, Constraints',
      icon: FileText,
      tag: 'INPUT'
    },
    {
      id: 'ingestion',
      label: 'Data Ingestion',
      sub: 'CelesTrak, NOAA, DONKI',
      icon: Database,
      tag: 'FEEDS'
    },
    {
      id: 'agents',
      label: 'Domain Agents',
      sub: 'Debris, Wx, Feas, Cov',
      icon: Cpu,
      tag: 'EVAL'
    },
    {
      id: 'evidence',
      label: 'Structured Evidence',
      sub: 'Normalized Risk Vectors',
      icon: Activity,
      tag: 'TELEMETRY'
    },
    {
      id: 'orchestration',
      label: 'Pareto Orchestration',
      sub: 'Multi-Objective Arbitration',
      icon: Scale,
      tag: 'SOLVER'
    },
    {
      id: 'recommendation',
      label: 'Recommendation',
      sub: 'Non-Dominated Windows',
      icon: Award,
      tag: 'SYNTHESIS'
    },
    {
      id: 'human',
      label: 'Human Approval',
      sub: 'Flight Director Authority',
      icon: UserCheck,
      tag: 'DECISION'
    },
  ];

  return (
    <div className={`w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3 sm:p-4 backdrop-blur-xl ${compact ? 'py-2.5' : 'py-3.5'}`}>
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-bold uppercase tracking-wider">
            AMDSF DECISION PIPELINE ARCHITECTURE
          </span>
          <span className="text-slate-400 hidden sm:inline">• Traceable Multi-Agent Flow</span>
        </div>
        <span className="text-slate-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-black/50 border border-white/10">
          ISO/IEEE 42010 Architecture Flow
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === 'all' || currentStep === step.id;
          const isDone = true;

          return (
            <div
              key={step.id}
              className={`relative flex flex-col justify-between p-2.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'bg-black/40 border-white/10 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono text-cyan-400/90 font-semibold px-1 rounded bg-black/60 border border-cyan-500/20">
                  {step.tag}
                </span>
                <span className="text-[9px] font-mono text-slate-400">0{idx + 1}</span>
              </div>

              <div className="flex items-center gap-2 my-1">
                <div className="w-7 h-7 rounded-md bg-black/60 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-mono font-bold text-white leading-tight truncate">
                    {step.label}
                  </span>
                  <span className="block text-[9px] font-mono text-slate-400 leading-tight truncate">
                    {step.sub}
                  </span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-cyan-500/50">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
