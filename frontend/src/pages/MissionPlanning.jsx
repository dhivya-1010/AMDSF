import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Play, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function MissionPlanning({ onRunAnalysis, loading, error }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    mission_name: 'AMDSF Demo Mission',
    payload_mass: 250,
    target_orbit: 550,
    mission_duration: 365,
    budget: 50,
    target_region: 'India',
    preferred_launch_date: '2026-10-15'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'payload_mass' || name === 'target_orbit' || name === 'mission_duration' || name === 'budget'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onRunAnalysis(form);
    if (success) {
      navigate('/recommendation');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Title */}
      <div className="pb-4 border-b border-space-700/80">
        <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide flex items-center gap-2">
          <Sliders className="w-6 h-6 text-cyan-400" />
          Mission Planning & Parameter Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Specify orbital mechanics parameters and budget constraints for automated multi-agent arbitration.
        </p>
      </div>

      {loading && <LoadingState message="Orchestrating Autonomous Agent Analysis..." />}
      {error && <ErrorState error={error} />}

      {/* Main Form Container */}
      <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-6 shadow-xl backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
              Mission Name
            </label>
            <input
              type="text"
              name="mission_name"
              value={form.mission_name}
              onChange={handleChange}
              required
              className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              placeholder="e.g. AMDSF Earth Observation Sentinel"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Payload Mass (kg)
              </label>
              <input
                type="number"
                name="payload_mass"
                min="10"
                max="10000"
                value={form.payload_mass}
                onChange={handleChange}
                required
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Wet mass including bus & instruments</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Target Orbit Altitude (km)
              </label>
              <input
                type="number"
                name="target_orbit"
                min="200"
                max="36000"
                value={form.target_orbit}
                onChange={handleChange}
                required
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Low Earth Orbit (LEO) insertion altitude</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Mission Duration (Days)
              </label>
              <input
                type="number"
                name="mission_duration"
                min="30"
                max="3650"
                value={form.mission_duration}
                onChange={handleChange}
                required
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Operational lifetime lifecycle</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Allocated Budget ($M USD)
              </label>
              <input
                type="number"
                name="budget"
                min="1"
                max="1000"
                value={form.budget}
                onChange={handleChange}
                required
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Total lifecycle allocation limit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Primary Target Region
              </label>
              <input
                type="text"
                name="target_region"
                value={form.target_region}
                onChange={handleChange}
                required
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                placeholder="e.g. India, Europe, Global"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Demographic coverage analysis target</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Preferred Launch Date
              </label>
              <input
                type="date"
                name="preferred_launch_date"
                value={form.preferred_launch_date}
                onChange={handleChange}
                required
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">Candidate epoch window</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-space-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Multi-agent reasoning will evaluate all 4 domains simultaneously.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Orchestrating Multi-Agent Workflow...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  <span>Run Mission Analysis</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
