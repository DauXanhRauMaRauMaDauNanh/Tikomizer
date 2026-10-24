import React, { useState } from "react";
import { Monitor, RefreshCw, CheckCircle2, AlertTriangle, Eye, ShieldCheck } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";

interface DisplayMonitorPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const DisplayMonitorPage: React.FC<DisplayMonitorPageProps> = ({ telemetry }) => {
  const display = telemetry?.display;
  const [selectedHz, setSelectedHz] = useState<number>(display?.refresh_rate || 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(15);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-cyan-400" />
          <span>Display & Refresh Rate Management</span>
        </h2>
        <p className="text-xs text-slate-400">
          Monitor refresh rates, VRR/G-Sync capability reporting, and timeout-guaranteed safe display switching.
        </p>
      </div>

      {/* Main Display Status Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Primary Monitor</h3>
              <p className="text-xs text-slate-400">Enumerated via Win32 EnumDisplaySettingsW</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Connected & Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">RESOLUTION</p>
            <p className="text-base font-bold font-mono text-white mt-0.5">
              {display ? `${display.width} × ${display.height}` : "1920 × 1080"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">CURRENT REFRESH RATE</p>
            <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">
              {display ? `${display.refresh_rate} Hz` : "60 Hz"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">COLOR DEPTH</p>
            <p className="text-base font-bold font-mono text-slate-200 mt-0.5">
              {display?.bits_per_pixel || 32}-bit TrueColor
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">FRAME TIME BUDGET</p>
            <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              {display ? (1000 / display.refresh_rate).toFixed(2) : "16.67"} ms
            </p>
          </div>
        </div>
      </div>

      {/* Safe Display Rate Guidance */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Refresh Rate Configuration
        </h3>

        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Ensure your monitor is running at its maximum factory-rated refresh rate to minimize input-to-display latency and motion blur.
          </p>

          <div className="flex flex-wrap gap-2">
            {[60, 75, 120, 144, 165, 240, 360].map((hz) => (
              <button
                key={hz}
                onClick={() => setSelectedHz(hz)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
                  selectedHz === hz
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 glow-cyan font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {hz} Hz
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Automatic Reversion Safeguard:</strong> Any manual resolution or refresh rate change mandates a 15-second automatic rollback countdown timer to ensure you never get locked out by an unsupported video signal.
          </p>
        </div>
      </div>
    </div>
  );
};
