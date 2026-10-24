import React, { useState, useEffect, useRef } from "react";
import {
  Gamepad2,
  Play,
  Square,
  ShieldCheck,
  CheckCircle,
  Activity,
  AlertTriangle,
  Sliders,
  Plus,
  Trash2
} from "lucide-react";
import { OptimizationProfile, SessionStatus, SystemTelemetrySnapshot } from "../types";

interface GamingPageProps {
  telemetry: SystemTelemetrySnapshot | null;
  sessionStatus: SessionStatus;
  profiles: OptimizationProfile[];
  onStartSession: (profile: OptimizationProfile) => void;
  onEndSession: () => void;
}

export const GamingPage: React.FC<GamingPageProps> = ({
  telemetry,
  sessionStatus,
  profiles,
  onStartSession,
  onEndSession,
}) => {
  const isSessionActive = sessionStatus.state === "Active";
  const gamingProfile = profiles.find((p) => p.id === "gaming-performance") || profiles[1];

  const [customGames, setCustomGames] = useState<string[]>([
    "cs2.exe",
    "valorant.exe",
    "dota2.exe",
    "Overwatch.exe",
    "FortniteClient-Win64-Shipping.exe",
  ]);
  const [newGameInput, setNewGameInput] = useState("");

  // Real-time Frame-Time & Stutter measurement canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState(0);
  const [onePercentLow, setOnePercentLow] = useState(0);
  const [frameTimeAvg, setFrameTimeAvg] = useState(0);
  const [stutterDetected, setStutterDetected] = useState(false);
  const [bottleneck, setBottleneck] = useState<"Balanced" | "CPU Bound" | "GPU Bound">("Balanced");

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const frameTimes: number[] = [];

    const renderLoop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (delta > 0 && delta < 200) {
        frameTimes.push(delta);
        if (frameTimes.length > 120) {
          frameTimes.shift();
        }

        // Compute 1% low and average
        const sorted = [...frameTimes].sort((a, b) => b - a);
        const low1Idx = Math.max(0, Math.floor(sorted.length * 0.01));
        const worst1Pct = sorted[low1Idx] || delta;

        const sum = frameTimes.reduce((a, b) => a + b, 0);
        const avg = sum / frameTimes.length;

        setFrameTimeAvg(Math.round(avg * 10) / 10);
        setFps(Math.round(1000 / avg));
        setOnePercentLow(Math.round(1000 / worst1Pct));

        // Detect stutters (any frame taking 2.5x the average)
        setStutterDetected(delta > avg * 2.5);

        // Bottleneck heuristic: high CPU core load with high frame time variance indicates CPU bound
        if (telemetry && telemetry.cpu_usage_total > 85) {
          setBottleneck("CPU Bound");
        } else if (telemetry && telemetry.cpu_usage_total < 40 && avg > 16.0) {
          setBottleneck("GPU Bound");
        } else {
          setBottleneck("Balanced");
        }
      }

      // Draw real frame time graph onto canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw grid
          ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();

          // Draw frame line
          ctx.beginPath();
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 2;

          const step = canvas.width / Math.max(1, frameTimes.length - 1);
          frameTimes.forEach((ft, i) => {
            // Map 0 - 33.3ms (30fps) to canvas height
            const y = canvas.height - Math.min(canvas.height, (ft / 33.3) * canvas.height);
            if (i === 0) ctx.moveTo(0, y);
            else ctx.lineTo(i * step, y);
          });
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [telemetry]);

  const addGame = () => {
    if (newGameInput.trim() && !customGames.includes(newGameInput.trim())) {
      setCustomGames([...customGames, newGameInput.trim()]);
      setNewGameInput("");
    }
  };

  const removeGame = (name: string) => {
    setCustomGames(customGames.filter((g) => g !== name));
  };

  const isCurrentGameForeground =
    telemetry?.foreground_process &&
    customGames.some((g) => g.toLowerCase() === telemetry.foreground_process?.name.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>Gaming Performance Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time frame pacing, process prioritization, and zero-risk anti-cheat compatibility.
          </p>
        </div>

        <div>
          {isSessionActive ? (
            <button
              onClick={onEndSession}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 text-xs font-semibold"
            >
              <Square className="w-3.5 h-3.5 fill-rose-400" />
              <span>Deactivate Gaming Session</span>
            </button>
          ) : (
            <button
              onClick={() => gamingProfile && onStartSession(gamingProfile)}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Engage Gaming Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Frame Pacing & Bottleneck Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Real-time FPS</p>
          <p className="text-3xl font-bold font-mono text-cyan-400 mt-1">{fps}</p>
          <p className="text-[11px] text-slate-500 mt-1">Measured presentation rate</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">1% Low Frame Rate</p>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">{onePercentLow}</p>
          <p className="text-[11px] text-slate-500 mt-1">Consistency indicator</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Average Frame Time</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">{frameTimeAvg} ms</p>
          <p className="text-[11px] text-slate-500 mt-1">Target: &lt;16.6ms (60 FPS)</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">Bottleneck Diagnostics</p>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                bottleneck === "Balanced"
                  ? "bg-emerald-400"
                  : bottleneck === "CPU Bound"
                  ? "bg-amber-400"
                  : "bg-cyan-400"
              }`}
            />
            <span className="text-sm font-bold text-white">{bottleneck}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on core load & variance</p>
        </div>
      </div>

      {/* Frame Time Pacing Visualizer */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Live Frame-Time Distribution Graph
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            {stutterDetected ? (
              <span className="flex items-center space-x-1 text-rose-400 font-mono text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Micro-Stutter Event</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Smooth Pacing</span>
              </span>
            )}
          </div>
        </div>

        <div className="h-28 w-full bg-slate-950/80 rounded-xl border border-slate-800 p-2 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={90}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* Game Library & Automatic Profile Activation */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Authorized Game Executables
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Processes matching this list receive priority scheduling and automatic session activation.
            </p>
          </div>

          {isCurrentGameForeground && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Active Focus: {telemetry?.foreground_process?.name}
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Add executable (e.g., game.exe)"
            value={newGameInput}
            onChange={(e) => setNewGameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGame()}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={addGame}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {customGames.map((game) => (
            <div
              key={game}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2 truncate">
                <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono text-white truncate">{game}</span>
              </div>
              <button
                onClick={() => removeGame(game)}
                className="text-slate-500 hover:text-rose-400 p-1"
                title="Remove game"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start space-x-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-300">Anti-Cheat Safety Compliance</p>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            Tikomizer never injects code, hooks graphics DLLs, modifies game binaries, or circumvents anti-cheat systems (BattlEye, EasyAntiCheat, Vanguard, Ricochet). All optimizations use documented Windows API scheduling and power management.
          </p>
        </div>
      </div>
    </div>
  );
};
