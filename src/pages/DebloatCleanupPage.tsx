import React, { useState, useEffect } from "react";
import { Trash2, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, FileText, Check } from "lucide-react";
import { CleanupExecutionReport, CleanupScanResult } from "../types";
import { invokeBackend } from "../lib/ipc";

export const DebloatCleanupPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<CleanupScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupReport, setCleanupReport] = useState<CleanupExecutionReport | null>(null);

  const scanFiles = async () => {
    setIsScanning(true);
    setCleanupReport(null);
    try {
      const res = await invokeBackend<CleanupScanResult>("scan_temporary_files");
      setScanResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const executeClean = async () => {
    setIsCleaning(true);
    try {
      const report = await invokeBackend<CleanupExecutionReport>("execute_cleanup");
      setCleanupReport(report);
      await scanFiles();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCleaning(false);
    }
  };

  useEffect(() => {
    scanFiles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <span>Windows Cleanup & Debloat Subsystem</span>
        </h2>
        <p className="text-xs text-slate-400">
          Transparent preview, locked-file safety filters, and zero destructive OS debloating.
        </p>
      </div>

      {/* Reclaimable Storage Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-mono">RECLAIMABLE TEMPORARY SPACE</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold font-mono text-cyan-400">
              {scanResult ? scanResult.total_size_mb : 0} MB
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({scanResult ? scanResult.total_files : 0} eligible cache files)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scans isolated Windows temp locations. Never touches user documents or desktop files.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={scanFiles}
            disabled={isScanning || isCleaning}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>Rescan</span>
          </button>

          <button
            onClick={executeClean}
            disabled={isCleaning || !scanResult || scanResult.total_files === 0}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 disabled:opacity-40 transition-all glow-rose"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isCleaning ? "Cleaning..." : "Purge Temporary Files"}</span>
          </button>
        </div>
      </div>

      {/* Cleanup Result Notification */}
      {cleanupReport && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Safely freed <strong>{cleanupReport.freed_mb} MB</strong> across {cleanupReport.deleted_files_count} files.
              {cleanupReport.locked_or_skipped_count > 0 && ` (${cleanupReport.locked_or_skipped_count} active files safely skipped)`}
            </span>
          </div>
        </div>
      )}

      {/* File Preview Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Candidate File Inspection List
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Previewing top {scanResult?.files.length || 0} entries
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">FILE / DIRECTORY</th>
                <th className="py-2.5 px-3">SIZE</th>
                <th className="py-2.5 px-3">PATH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {scanResult?.files.map((file, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="py-2 px-3 text-white truncate max-w-[180px]">
                    {file.file_name}
                  </td>
                  <td className="py-2 px-3 text-cyan-400 font-bold">
                    {file.size_formatted}
                  </td>
                  <td className="py-2 px-3 text-slate-500 truncate max-w-[280px]">
                    {file.path}
                  </td>
                </tr>
              ))}
              {(!scanResult || scanResult.files.length === 0) && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500 text-xs">
                    Temporary directories are clean. No candidates detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Policy */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Responsible Cleanup Policy</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Tikomizer avoids radical "OS debloat" scripts that permanently rip out Windows Store, delete Edge, break Windows Update, or disable Microsoft Defender. Such destructive modifications destabilize system dependencies and trigger game anti-cheat bans.
        </p>
      </div>
    </div>
  );
};
