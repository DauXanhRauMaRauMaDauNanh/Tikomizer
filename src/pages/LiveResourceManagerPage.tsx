import React from "react";
import { BarChart2, Cpu, HardDrive, Wifi, Activity, Database } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";

interface LiveResourceManagerPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const LiveResourceManagerPage: React.FC<LiveResourceManagerPageProps> = ({
  telemetry,
}) => {
  const cores = telemetry?.cpu_cores_usage || [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          <span>Live Resource Manager</span>
        </h2>
        <p className="text-xs text-slate-400">
          Deterministic per-core scheduling inspection and memory topology telemetry.
        </p>
      </div>

      {/* Per-Core CPU Topology */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Logical Core Utilization ({cores.length} Cores)
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            Average: {telemetry ? telemetry.cpu_usage_total : 0}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {cores.map((usage, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>C#{idx}</span>
                <span className="font-bold text-white">{usage.toFixed(0)}%</span>
              </div>

              {/* Core bar */}
              <div className="h-16 w-full bg-slate-950 rounded-lg p-1 flex items-end">
                <div
                  className={`w-full rounded transition-all duration-300 ${
                    usage > 80
                      ? "bg-rose-500"
                      : usage > 50
                      ? "bg-amber-400"
                      : "bg-cyan-500"
                  }`}
                  style={{ height: `${Math.max(4, Math.min(100, usage))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dual Column: Memory Topology & Disk / Network */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Topology */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Memory Topology Breakdown
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Physical RAM in Use</span>
                <span className="font-mono text-white font-semibold">
                  {telemetry ? (telemetry.memory.used_phys_mb / 1024).toFixed(1) : 0} /{" "}
                  {telemetry ? (telemetry.memory.total_phys_mb / 1024).toFixed(1) : 0} GB
                </span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${telemetry?.memory.memory_load_pct || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Available Physical RAM</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {telemetry ? (telemetry.memory.avail_phys_mb / 1024).toFixed(1) : 0} GB
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Pagefile Commit Allocation</span>
                <span className="font-mono text-slate-300">
                  {telemetry ? (telemetry.memory.avail_page_mb / 1024).toFixed(1) : 0} /{" "}
                  {telemetry ? (telemetry.memory.total_page_mb / 1024).toFixed(1) : 0} GB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disk & I/O Telemetry */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Mounted Storage Partitions
            </h3>
          </div>

          <div className="space-y-3">
            {telemetry?.disks.map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white font-mono">{d.name} ({d.mount_point})</span>
                  <span className="text-slate-400 font-mono">
                    {d.available_space_gb} GB free / {d.total_space_gb} GB
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500"
                    style={{ width: `${d.used_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
