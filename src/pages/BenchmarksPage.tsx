import React, { useState } from "react";
import { Gauge, Play, Download, CheckCircle2, ShieldCheck, Zap, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { BenchmarkSuiteResult } from "../types";
import { invokeBackend } from "../lib/ipc";

export const BenchmarksPage: React.FC = () => {
  const [activeSuiteId, setActiveSuiteId] = useState<string>("cpu-text");
  const [iterations, setIterations] = useState<number>(5);
  const [running, setRunning] = useState<boolean>(false);
  const [results, setResults] = useState<Record<string, BenchmarkSuiteResult>>({});

  const suites = [
    {
      id: "cpu-text",
      name: "CPU & Text Processing",
      category: "CPU & Algorithms",
      desc: "Deterministic string transformations, token parsing, and SHA-256 cryptographic hashing.",
    },
    {
      id: "native-simd",
      name: "Native C/C++/NASM SIMD Engine",
      category: "Native Architecture",
      desc: "Hardware-accelerated comparison: Pure C scalar fallback vs NASM AVX2 SIMD kernel.",
    },
    {
      id: "compression",
      name: "Deflate Compression & Decompression",
      category: "Compression & Storage",
      desc: "Real multi-pass block compression and decompression throughput and ratio.",
    },
    {
      id: "video-1080p",
      name: "Video 1080p YUV420 Transcoding",
      category: "Multimedia",
      desc: "Pixel color format conversion simulating real video streaming and encoding frames.",
    },
    {
      id: "storage-io",
      name: "Isolated Storage I/O",
      category: "Storage",
      desc: "Sequential write and read throughput in isolated temporary storage.",
    },
    {
      id: "overhead",
      name: "Tikomizer Application Overhead",
      category: "Efficiency Audit",
      desc: "Empirical verification of Tikomizer's own RAM consumption and background CPU load.",
    },
  ];

  const runBenchmark = async (suiteId: string) => {
    setRunning(true);
    try {
      const res = await invokeBackend<BenchmarkSuiteResult>("run_benchmark", {
        suite_id: suiteId,
        iterations,
      });
      setResults((prev) => ({ ...prev, [suiteId]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tikomizer_benchmark_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    let csv = "Suite ID,Metric Name,Unit,Baseline,Optimized,Change %,Lower is Better\n";
    Object.values(results).forEach((r) => {
      r.metrics.forEach((m) => {
        csv += `"${r.suite_id}","${m.name}","${m.unit}",${m.baseline_value},${m.optimized_value},${m.relative_change_pct},${m.is_lower_better}\n`;
      });
    });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tikomizer_benchmark_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentResult = results[activeSuiteId];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <span>Empirical Benchmark Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated deterministic workloads. Zero simulated or fabricated performance gains.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {Object.keys(results).length > 0 && (
            <>
              <button
                onClick={exportJSON}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={exportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Benchmark Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suites.map((s) => {
          const isSelected = activeSuiteId === s.id;
          const hasResult = !!results[s.id];

          return (
            <button
              key={s.id}
              onClick={() => setActiveSuiteId(s.id)}
              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between space-y-2 ${
                isSelected
                  ? "bg-cyan-500/10 border-cyan-500/40 glow-cyan"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {s.category}
                  </span>
                  {hasResult && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Tested
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-white mt-1">{s.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Execution Control Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              {suites.find((s) => s.id === activeSuiteId)?.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {suites.find((s) => s.id === activeSuiteId)?.desc}
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-mono">Iterations:</span>
              <select
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
              >
                <option value={1}>1 run</option>
                <option value={5}>5 runs</option>
                <option value={10}>10 runs</option>
              </select>
            </div>

            <button
              onClick={() => runBenchmark(activeSuiteId)}
              disabled={running}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all glow-cyan"
            >
              <Play className={`w-3.5 h-3.5 fill-white ${running ? "animate-spin" : ""}`} />
              <span>{running ? "Benchmarking..." : "Execute Workload"}</span>
            </button>
          </div>
        </div>

        {/* Results Presentation */}
        {currentResult ? (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white font-mono">
                {currentResult.summary_text}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Formula: ((Optimized - Baseline) / Baseline) × 100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentResult.metrics.map((m, idx) => {
                const isImproved = m.is_lower_better
                  ? m.relative_change_pct < 0
                  : m.relative_change_pct > 0;

                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      {m.name}
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-bold font-mono text-white">
                        {m.baseline_value}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{m.unit}</span>
                    </div>

                    {m.relative_change_pct !== 0 && (
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span
                          className={`text-xs font-bold font-mono ${
                            isImproved ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {m.relative_change_pct > 0 ? "+" : ""}
                          {m.relative_change_pct}%
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {isImproved ? "Improvement" : "Variance"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 font-mono italic">
              Note: {currentResult.environment_notes}
            </p>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
            <Gauge className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No results recorded for this suite yet.
            </p>
            <p className="text-[11px] text-slate-500">
              Click "Execute Workload" to run deterministic measurements on your hardware.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
