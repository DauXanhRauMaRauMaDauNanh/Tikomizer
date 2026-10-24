import React from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Shield,
  Layers,
  Clock,
  Sparkles,
  CheckCircle,
  Play,
  Square,
  AlertCircle
} from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { OptimizationProfile, SessionStatus, SystemTelemetrySnapshot } from "../types";

interface DashboardPageProps {
  telemetry: SystemTelemetrySnapshot | null;
  sessionStatus: SessionStatus;
  profiles: OptimizationProfile[];
  onStartSession: (profile: OptimizationProfile) => void;
  onEndSession: () => void;
  onNavigate: (page: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  telemetry,
  sessionStatus,
  profiles,
  onStartSession,
  onEndSession,
  onNavigate,
}) => {
  const isSessionActive = sessionStatus.state === "Active";
  const defaultProfile = profiles.find((p) => p.id === "gaming-performance") || profiles[0];

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
    return `${bytes} B/s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Session State & Quick Action */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSessionActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isSessionActive
                ? `Active Session: ${sessionStatus.active_profile}`
                : "Windows Operating System - Default State"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            {isSessionActive
              ? "Optimization layer is active. All temporary adjustments are isolated and guaranteed reversible upon session exit or shutdown."
              : "Tikomizer is standing by in low-overhead monitoring mode. Zero system modifications are active."}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {isSessionActive ? (
            <button
              onClick={onEndSession}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Square className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Disable & Restore State</span>
            </button>
          ) : (
            <button
              onClick={() => defaultProfile && onStartSession(defaultProfile)}
              className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all glow-cyan"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enable Gaming Session</span>
            </button>
          )}

          <button
            onClick={() => onNavigate("profiles")}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Profiles
          </button>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Utilization"
          value={telemetry ? telemetry.cpu_usage_total : 0}
          unit="%"
          icon={Cpu}
          progress={telemetry ? telemetry.cpu_usage_total : 0}
          subtitle={
            telemetry
              ? `${telemetry.cpu_cores_usage.length} Logical Cores @ ${telemetry.cpu_frequency_mhz} MHz`
              : "Reading counters..."
          }
          colorScheme="cyan"
        />

        <MetricCard
          title="Physical Memory"
          value={telemetry ? (telemetry.memory.used_phys_mb / 1024).toFixed(1) : 0}
          unit={`/ ${telemetry ? (telemetry.memory.total_phys_mb / 1024).toFixed(1) : 0} GB`}
          icon={HardDrive}
          progress={telemetry ? telemetry.memory.memory_load_pct : 0}
          subtitle={
            telemetry
              ? `Available: ${(telemetry.memory.avail_phys_mb / 1024).toFixed(1)} GB (${telemetry.memory.memory_load_pct}% Load)`
              : "Reading memory..."
          }
          colorScheme="emerald"
        />

        <MetricCard
          title="Network Latency"
          value={telemetry ? telemetry.network.latency_ms : 0}
          unit="ms"
          icon={Wifi}
          subtitle={
            telemetry
              ? `Jitter: ${telemetry.network.jitter_ms} ms • Loss: ${telemetry.network.packet_loss_pct}%`
              : "Testing endpoint..."
          }
          colorScheme="violet"
        />

        <MetricCard
          title="Tikomizer Overhead"
          value={telemetry ? telemetry.tikomizer_overhead.process_ram_mb : 0}
          unit="MB RAM"
          icon={Zap}
          subtitle={
            telemetry
              ? `CPU: ${telemetry.tikomizer_overhead.process_cpu_pct}% • ${telemetry.tikomizer_overhead.thread_count} Native Threads`
              : "Measuring self..."
          }
          colorScheme="amber"
        />
      </div>

      {/* Foreground Process & System Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Foreground Application */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Foreground Target
            </h3>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono">
              Live Window
            </span>
          </div>

          {telemetry?.foreground_process ? (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white truncate max-w-[200px]">
                  {telemetry.foreground_process.name}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  PID {telemetry.foreground_process.pid}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {telemetry.foreground_process.title || "Untitled Application Window"}
              </p>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {telemetry.foreground_process.exe_path}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-500">
              No active foreground window detected.
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Display Configuration</span>
            <span className="text-xs font-mono text-white">
              {telemetry?.display
                ? `${telemetry.display.width}x${telemetry.display.height} @ ${telemetry.display.refresh_rate}Hz`
                : "Standard Display"}
            </span>
          </div>
        </div>

        {/* Top CPU Consumer Processes */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Resource-Intensive Processes
            </h3>
            <button
              onClick={() => onNavigate("processes")}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              View All Processes →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
                  <th className="pb-2">PROCESS</th>
                  <th className="pb-2">PID</th>
                  <th className="pb-2">CPU USAGE</th>
                  <th className="pb-2">MEMORY</th>
                  <th className="pb-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {telemetry?.top_cpu_processes.slice(0, 4).map((proc) => (
                  <tr key={proc.pid} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-medium text-white flex items-center space-x-2">
                      <span className="truncate max-w-[160px]">{proc.name}</span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-400">{proc.pid}</td>
                    <td className="py-2.5 font-mono text-cyan-400 font-semibold">
                      {proc.cpu_usage.toFixed(1)}%
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">
                      {proc.memory_mb} MB
                    </td>
                    <td className="py-2.5 text-right font-mono text-[11px] text-slate-400">
                      {proc.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Safety & Design Principles Footer Card */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Shield className="w-4 h-4" />
          <span className="font-semibold">Safe Native Operation:</span>
          <span className="text-slate-400">
            No kernel drivers • No Windows Defender disabling • Fully Reversible
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Uptime: {telemetry ? Math.floor(telemetry.uptime_seconds / 3600) : 0}h{" "}
          {telemetry ? Math.floor((telemetry.uptime_seconds % 3600) / 60) : 0}m
        </div>
      </div>
    </div>
  );
};
