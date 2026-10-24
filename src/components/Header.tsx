import React from "react";
import { AlertTriangle, Moon, Sun, Shield, ShieldCheck, Zap } from "lucide-react";
import { SessionStatus } from "../types";

interface HeaderProps {
  sessionStatus: SessionStatus;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onEmergencyRestore: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionStatus,
  theme,
  onToggleTheme,
  onEmergencyRestore,
}) => {
  const isSessionActive = sessionStatus.state === "Active";

  const formatUptime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? "0" : ""}${s}s`;
  };

  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Branding & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Tikomizer
            </h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase font-medium">
              Native Platform
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-2" />

        {/* Live Session State Badge */}
        <div className="flex items-center space-x-2">
          {isSessionActive ? (
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">
                Session Active: {sessionStatus.active_profile || "Custom"}
              </span>
              <span className="text-[11px] text-emerald-500/80 font-mono">
                ({formatUptime(sessionStatus.uptime_seconds)})
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-xs font-medium text-slate-400">
                Optimization Layer Idle
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Recovery / Emergency Restore Button */}
        <button
          onClick={onEmergencyRestore}
          title="Emergency Restore: Immediately revert all modified Windows settings to their original state"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isSessionActive
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 glow-rose"
              : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Emergency Restore</span>
        </button>

        {/* Reversibility Status Icon */}
        <div
          title="Tikomizer Guarantee: All changes are reversible and tracked in a persistent recovery journal"
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">Reversible 100%</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </header>
  );
};
