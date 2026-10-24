import React from "react";
import { HardDrive, AlertCircle, Info, Sparkles, RefreshCw } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";

interface MemoryPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const MemoryPage: React.FC<MemoryPageProps> = ({ telemetry }) => {
  const mem = telemetry?.memory;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <span>Physical & Commit Memory Subsystem</span>
        </h2>
        <p className="text-xs text-slate-400">
          Accurate memory counters, working set diagnostics, and honest reclamation analysis.
        </p>
      </div>

      {/* Memory Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">PHYSICAL MEMORY LOAD</p>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">
            {mem ? mem.memory_load_pct : 0}%
          </p>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${mem?.memory_load_pct || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Used: {mem ? (mem.used_phys_mb / 1024).toFixed(1) : 0} GB / {mem ? (mem.total_phys_mb / 1024).toFixed(1) : 0} GB
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">AVAILABLE FOR ALLOCATION</p>
          <p className="text-3xl font-bold font-mono text-cyan-400 mt-1">
            {mem ? (mem.avail_phys_mb / 1024).toFixed(1) : 0} GB
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Ready for game and application memory requests
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">PAGEFILE COMMIT CHARGE</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">
            {mem ? (mem.avail_page_mb / 1024).toFixed(1) : 0} GB
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Total backing store: {mem ? (mem.total_page_mb / 1024).toFixed(1) : 0} GB
          </p>
        </div>
      </div>

      {/* Top Memory Consumers Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Top Memory Consuming Processes
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
                <th className="pb-2">PROCESS NAME</th>
                <th className="pb-2">PID</th>
                <th className="pb-2">WORKING SET RAM</th>
                <th className="pb-2">SHARE OF RAM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {telemetry?.top_memory_processes.map((p) => {
                const totalMb = mem ? mem.total_phys_mb : 16384;
                const pct = ((p.memory_mb / totalMb) * 100).toFixed(1);

                return (
                  <tr key={p.pid} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-sans font-medium text-white">{p.name}</td>
                    <td className="py-2.5 text-slate-400">{p.pid}</td>
                    <td className="py-2.5 text-cyan-400 font-semibold">{p.memory_mb} MB</td>
                    <td className="py-2.5 text-slate-300">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Honesty Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
          <Info className="w-4 h-4" />
          <span>Engineering Note on Memory Management</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Tikomizer adheres to modern Windows memory management principles: "Free memory is wasted memory." Windows uses standby RAM to cache frequently accessed files and shaders. Repeatedly flushing the standby list or aggressively truncating working sets causes immediate hard page faults and micro-stutters when games need to re-read assets from disk.
        </p>
      </div>
    </div>
  );
};
