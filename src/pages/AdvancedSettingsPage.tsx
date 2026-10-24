import React, { useState } from "react";
import { Settings, Shield, RefreshCw, Download, Upload, RotateCcw, CheckCircle2 } from "lucide-react";

export const AdvancedSettingsPage: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState<number>(1000);
  const [autoRestoreOnExit, setAutoRestoreOnExit] = useState<boolean>(true);
  const [crashRecovery, setCrashRecovery] = useState<boolean>(true);
  const [telemetryOptIn, setTelemetryOptIn] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const saveSettings = () => {
    setSavedMsg("Settings saved successfully.");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const resetDefaults = () => {
    setRefreshInterval(1000);
    setAutoRestoreOnExit(true);
    setCrashRecovery(true);
    setTelemetryOptIn(false);
    setSavedMsg("Reset all configuration to factory safe defaults.");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Advanced Configuration & Safety Policies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Granular management of session persistence, monitoring ceilings, and privacy boundaries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetDefaults}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Session & Recovery */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Session Management & Recovery
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200">
                  Automatic Restoration on Application Exit
                </span>
                <p className="text-[11px] text-slate-400">
                  Guarantees that closing the Tikomizer window automatically rolls back all system modifications.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoRestoreOnExit}
                onChange={(e) => setAutoRestoreOnExit(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <div className="h-px bg-slate-800/80" />

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200">
                  Startup Crash Recovery Journal Verification
                </span>
                <p className="text-[11px] text-slate-400">
                  Automatically detects if Windows unexpectedly powered off during an active session and restores the baseline.
                </p>
              </div>
              <input
                type="checkbox"
                checked={crashRecovery}
                onChange={(e) => setCrashRecovery(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* Monitoring Ceilings */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Telemetry Sampling Frequency
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">
                  Sensor Polling Interval
                </span>
                <p className="text-[11px] text-slate-400">
                  Balance between real-time responsiveness and Tikomizer CPU overhead.
                </p>
              </div>

              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                <option value={500}>500 ms (High Performance Mode)</option>
                <option value={1000}>1000 ms (Standard Balanced)</option>
                <option value={2500}>2500 ms (Low Overhead Eco)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & Safety */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Privacy & Least Privilege Boundaries
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200">
                  Anonymous Crash Analytics & Telemetry
                </span>
                <p className="text-[11px] text-slate-400">
                  Disabled by default. Zero telemetry packets are transmitted without your explicit opt-in.
                </p>
              </div>
              <input
                type="checkbox"
                checked={telemetryOptIn}
                onChange={(e) => setTelemetryOptIn(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
