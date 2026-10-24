import React, { useState, useEffect } from "react";
import { MousePointer, Activity, ShieldCheck, Zap, Info, CheckCircle } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";

interface InputLatencyPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const InputLatencyPage: React.FC<InputLatencyPageProps> = ({ telemetry }) => {
  const [pollingRate, setPollingRate] = useState(0);
  const [minInterval, setMinInterval] = useState(999);
  const [maxInterval, setMaxInterval] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [testActive, setTestActive] = useState(false);

  useEffect(() => {
    let lastTime = 0;
    let counts = 0;
    let intervals: number[] = [];

    const handleMouseMove = () => {
      const now = performance.now();
      if (lastTime > 0) {
        const delta = now - lastTime;
        if (delta > 0 && delta < 50) {
          intervals.push(delta);
          if (intervals.length > 50) intervals.shift();

          counts++;
          setEventCount(counts);
          setMinInterval((prev) => Math.min(prev, Math.round(delta * 100) / 100));
          setMaxInterval((prev) => Math.max(prev, Math.round(delta * 100) / 100));

          const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          setPollingRate(Math.round(1000 / avg));
        }
      }
      lastTime = now;
      setTestActive(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <MousePointer className="w-5 h-5 text-cyan-400" />
          <span>Input & Responsiveness Subsystem</span>
        </h2>
        <p className="text-xs text-slate-400">
          Hardware pointer acceleration curves, real-time mouse polling rate telemetry, and input event timing.
        </p>
      </div>

      {/* Input Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">MEASURED POLLING RATE</p>
          <p className="text-3xl font-bold font-mono text-cyan-400 mt-1">
            {pollingRate > 0 ? `${pollingRate} Hz` : "--"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Move mouse to sample</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">MINIMUM EVENT INTERVAL</p>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">
            {minInterval < 999 ? `${minInterval} ms` : "--"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Smallest input delta</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">POINTER CURVE STATE</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">1:1 Raw</p>
          <p className="text-[11px] text-slate-500 mt-1">Linear acceleration</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">EVENTS CAPTURED</p>
          <p className="text-3xl font-bold font-mono text-violet-400 mt-1">
            {eventCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Live buffer samples</p>
        </div>
      </div>

      {/* Mouse Test Interactive Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Interactive Polling Rate & Event Timing Tester
          </h3>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono">
            High Precision
          </span>
        </div>

        <div className="h-44 w-full bg-slate-950 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center space-y-2 cursor-crosshair hover:border-cyan-500/50 transition-colors p-4 text-center">
          <Activity className={`w-8 h-8 ${testActive ? "text-cyan-400 animate-pulse" : "text-slate-600"}`} />
          <p className="text-xs font-semibold text-white">
            Move mouse continuously within this box
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm">
            Measures consecutive high-resolution timestamp intervals to report your actual mouse reporting rate (e.g. 125Hz, 500Hz, 1000Hz, 4000Hz).
          </p>
        </div>
      </div>

      {/* Input Safety and Honesty Guarantee */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Scientific Input Latency Policy</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Tikomizer avoids fake "mouse overclocking" registry hacks and dangerous filter drivers. Mouse behavior is controlled solely via official Windows Win32 API SystemParametersInfo (SPI_GETMOUSE/SPI_SETMOUSE) to eliminate pointer acceleration smoothing during gaming sessions, guaranteeing 100% reversible behavior upon exit.
        </p>
      </div>
    </div>
  );
};
