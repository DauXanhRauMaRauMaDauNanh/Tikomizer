import React from "react";
import { Sparkles, Gamepad2, Briefcase, BatteryCharging, CheckCircle2, Shield, ArrowRight, RotateCcw } from "lucide-react";
import { OptimizationProfile, SessionStatus } from "../types";

interface OneClickPageProps {
  sessionStatus: SessionStatus;
  profiles: OptimizationProfile[];
  onStartSession: (profile: OptimizationProfile) => void;
  onEndSession: () => void;
}

export const OneClickPage: React.FC<OneClickPageProps> = ({
  sessionStatus,
  profiles,
  onStartSession,
  onEndSession,
}) => {
  const isSessionActive = sessionStatus.state === "Active";

  const gamingProfile = profiles.find((p) => p.id === "gaming-performance") || profiles[1];
  const creationProfile = profiles.find((p) => p.id === "content-creation") || profiles[4];
  const batteryProfile = profiles.find((p) => p.id === "battery-saver") || profiles[5];

  const presets = [
    {
      title: "One-Click Gaming Boost",
      badge: "Most Popular",
      icon: Gamepad2,
      profile: gamingProfile,
      color: "from-cyan-500 to-blue-600",
      border: "border-cyan-500/30",
      description: "Applies high-performance power policy, multimedia 1ms timer resolution, linear mouse input curve, and prioritizes authorized game processes.",
      actions: [
        "Switch active scheme to High Performance (GUID 8c5e7fda)",
        "Request 1ms high-precision multimedia timer period",
        "Elevate foreground game process priority to Above Normal",
        "Enforce 1:1 hardware linear pointer acceleration",
      ],
    },
    {
      title: "One-Click Creative Flow",
      badge: "Productivity",
      icon: Briefcase,
      profile: creationProfile,
      color: "from-violet-500 to-purple-600",
      border: "border-violet-500/30",
      description: "Balances processor threads and working sets for smooth video editing, 3D viewport rendering, and multi-track audio digital workstations.",
      actions: [
        "Unleash maximum multi-threaded CPU processor affinity",
        "Prevent background search indexing from starving render threads",
        "Keep display sleep timeout active during render tasks",
      ],
    },
    {
      title: "One-Click Battery Saver",
      badge: "Mobile & Laptop",
      icon: BatteryCharging,
      profile: batteryProfile,
      color: "from-emerald-500 to-teal-600",
      border: "border-emerald-500/30",
      description: "Engages Windows Power Saver scheme and reduces sensor sampling frequency to extend laptop battery life without degrading core usability.",
      actions: [
        "Switch active scheme to Power Saver (GUID a1841308)",
        "Reduce sensor polling frequency from 1s to 5s",
        "Throttle idle background diagnostic routines",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>One-Click System Optimization</span>
        </h2>
        <p className="text-xs text-slate-400">
          Curated, fully reversible optimization profiles engineered for instant application.
        </p>
      </div>

      {isSessionActive && (
        <div className="p-4 rounded-xl glass-panel border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-emerald-300">
                Session Active: {sessionStatus.active_profile}
              </p>
              <p className="text-[11px] text-emerald-400/80">
                Uptime: {Math.floor(sessionStatus.uptime_seconds / 60)} minutes • {sessionStatus.active_optimizations_count} settings active
              </p>
            </div>
          </div>
          <button
            onClick={onEndSession}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Restore Original State</span>
          </button>
        </div>
      )}

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {presets.map((preset, idx) => {
          const Icon = preset.icon;
          const isThisActive = isSessionActive && sessionStatus.active_profile === preset.profile?.name;

          return (
            <div
              key={idx}
              className={`glass-panel p-6 rounded-2xl border ${preset.border} flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-tr ${preset.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {preset.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{preset.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Actions Executed:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {preset.actions.map((act, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400 text-[11px] mt-0.5">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                {isThisActive ? (
                  <button
                    onClick={onEndSession}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Deactivate Session</span>
                  </button>
                ) : (
                  <button
                    onClick={() => preset.profile && onStartSession(preset.profile)}
                    disabled={isSessionActive}
                    className={`w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 bg-gradient-to-r ${preset.color} hover:opacity-90 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <span>Activate Preset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
