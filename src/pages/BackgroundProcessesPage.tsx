import React, { useState } from "react";
import { Layers, Search, Shield, Filter, AlertCircle, ArrowDownCircle } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";
import { invokeBackend } from "../lib/ipc";

interface BackgroundProcessesPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const BackgroundProcessesPage: React.FC<BackgroundProcessesPageProps> = ({
  telemetry,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"cpu" | "memory">("cpu");

  const processes = telemetry ? [...telemetry.top_cpu_processes] : [];

  const filtered = processes.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.pid.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Background Processes & Workloads</span>
        </h2>
        <p className="text-xs text-slate-400">
          Inspect, evaluate, and mitigate resource-hungry background services.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by process name or PID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setSortBy("cpu")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              sortBy === "cpu"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            Sort by CPU
          </button>
          <button
            onClick={() => setSortBy("memory")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              sortBy === "memory"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            Sort by Memory
          </button>
        </div>
      </div>

      {/* Processes Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-500 font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">PROCESS NAME</th>
                <th className="py-3 px-4">PID</th>
                <th className="py-3 px-4">CPU LOAD</th>
                <th className="py-3 px-4">WORKING SET RAM</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {filtered.map((proc) => (
                <tr key={proc.pid} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-sans font-medium text-white flex items-center space-x-2">
                    <span className="truncate max-w-[200px]">{proc.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{proc.pid}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">
                    {proc.cpu_usage.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-slate-300">{proc.memory_mb} MB</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{proc.status}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        invokeBackend("set_process_priority_cmd", {
                          pid: proc.pid,
                          priority: "BelowNormal",
                        })
                      }
                      title="Throttle background priority to Below Normal"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 hover:text-cyan-400 inline-flex items-center space-x-1"
                    >
                      <ArrowDownCircle className="w-3 h-3" />
                      <span>Throttle</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
