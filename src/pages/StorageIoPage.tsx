import React, { useState } from "react";
import { Database, HardDrive, Play, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { BenchmarkSuiteResult, SystemTelemetrySnapshot } from "../types";
import { invokeBackend } from "../lib/ipc";

interface StorageIoPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const StorageIoPage: React.FC<StorageIoPageProps> = ({ telemetry }) => {
  const [isRunningBench, setIsRunningBench] = useState(false);
  const [benchResult, setBenchResult] = useState<BenchmarkSuiteResult | null>(null);

  const runStorageBench = async () => {
    setIsRunningBench(true);
    try {
      const res = await invokeBackend<BenchmarkSuiteResult>("run_benchmark", {
        suite_id: "storage-io",
        iterations: 2,
      });
      setBenchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningBench(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Database className="w-5 h-5 text-violet-400" />
          <span>Storage & I/O Subsystem</span>
        </h2>
        <p className="text-xs text-slate-400">
          Partition capacity telemetry and non-destructive isolated disk throughput benchmarking.
        </p>
      </div>

      {/* Partitions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {telemetry?.disks.map((d, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <HardDrive className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{d.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Mount: {d.mount_point}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {d.is_removable ? "Removable" : "Fixed SSD/HDD"}
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Capacity Used</span>
                <span className="text-white font-bold">{d.used_pct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${d.used_pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span>Free: {d.available_space_gb} GB</span>
                <span>Total: {d.total_space_gb} GB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Safe Storage I/O Benchmark Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span>Isolated Non-Destructive Storage Benchmark</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Executes controlled sequential read/write operations in temporary isolated storage.
            </p>
          </div>

          <button
            onClick={runStorageBench}
            disabled={isRunningBench}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isRunningBench ? "animate-spin" : ""}`} />
            <span>{isRunningBench ? "Running Disk I/O..." : "Run Storage Benchmark"}</span>
          </button>
        </div>

        {benchResult && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-white font-mono">{benchResult.summary_text}</p>
            <div className="grid grid-cols-2 gap-3 font-mono">
              {benchResult.metrics.map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block uppercase">{m.name}</span>
                  <span className="text-lg font-bold text-violet-400 mt-1 block">
                    {m.baseline_value} {m.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Non-Destructive Guarantee:</strong> Test files are created exclusively within the application's isolated temp directory and fully deleted immediately upon test conclusion.
          </p>
        </div>
      </div>
    </div>
  );
};
