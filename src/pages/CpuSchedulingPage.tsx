import React, { useState } from "react";
import { Cpu, ShieldCheck, Zap, Sliders, CheckCircle2, AlertCircle } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";
import { invokeBackend } from "../lib/ipc";

interface CpuSchedulingPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const CpuSchedulingPage: React.FC<CpuSchedulingPageProps> = ({ telemetry }) => {
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [targetPriority, setTargetPriority] = useState<string>("AboveNormal");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const applyPriority = async () => {
    if (!selectedPid) return;
    try {
      await invokeBackend("set_process_priority_cmd", {
        pid: selectedPid,
        priority: targetPriority,
      });
      setFeedbackMsg({ text: `Successfully updated PID ${selectedPid} priority to ${targetPriority}.` });
    } catch (err) {
      setFeedbackMsg({ text: `Failed to set priority: ${err}`, error: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>CPU & Process Scheduling Subsystem</span>
        </h2>
        <p className="text-xs text-slate-400">
          Documented Windows scheduler prioritization and logical core affinity management.
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            feedbackMsg.error
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          {feedbackMsg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* CPU Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">LOGICAL PROCESSORS</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {telemetry?.cpu_cores_usage.length || 0} Cores
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Hardware Threads</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">NOMINAL FREQUENCY</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {telemetry?.cpu_frequency_mhz || 0} MHz
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active Clock State</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">TIMER RESOLUTION</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">1.0 ms</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Session Target</p>
        </div>
      </div>

      {/* Dynamic Process Priority Management */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Adjust Process Scheduling Priority
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Select Active Process:</label>
            <select
              value={selectedPid || ""}
              onChange={(e) => setSelectedPid(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">-- Choose Process --</option>
              {telemetry?.top_cpu_processes.map((p) => (
                <option key={p.pid} value={p.pid}>
                  {p.name} (PID {p.pid}) - {p.cpu_usage.toFixed(1)}% CPU
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Priority Class:</label>
            <select
              value={targetPriority}
              onChange={(e) => setTargetPriority(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Normal">Normal</option>
              <option value="AboveNormal">Above Normal (Recommended for Games)</option>
              <option value="High">High (Competitive Titles)</option>
              <option value="BelowNormal">Below Normal (Background Tasks)</option>
              <option value="Idle">Idle (Lowest)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={applyPriority}
              disabled={!selectedPid}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-all"
            >
              Apply Priority Class
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Safety Policy:</strong> Real-time priority class is explicitly disabled by Tikomizer to prevent OS thread starvation and keyboard/mouse driver freeze.
          </p>
        </div>
      </div>
    </div>
  );
};
