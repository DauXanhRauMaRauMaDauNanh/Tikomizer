import React, { useState } from "react";
import { Sliders, CheckCircle2, Shield, Play, Plus, Download, Upload, Trash2, ArrowRight } from "lucide-react";
import { OptimizationProfile, SessionStatus } from "../types";

interface OptimizationProfilesPageProps {
  profiles: OptimizationProfile[];
  sessionStatus: SessionStatus;
  onStartSession: (profile: OptimizationProfile) => void;
  onEndSession: () => void;
}

export const OptimizationProfilesPage: React.FC<OptimizationProfilesPageProps> = ({
  profiles,
  sessionStatus,
  onStartSession,
  onEndSession,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<OptimizationProfile>(profiles[0]);
  const [customList, setCustomList] = useState<OptimizationProfile[]>([]);
  const isSessionActive = sessionStatus.state === "Active";

  const allProfiles = [...profiles, ...customList];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Optimization Profiles</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent profiles with disclosed system modifications and transactional recovery.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isSessionActive && sessionStatus.active_profile === selectedProfile?.name ? (
            <button
              onClick={onEndSession}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold border border-slate-700"
            >
              Deactivate Active Profile
            </button>
          ) : (
            <button
              onClick={() => onStartSession(selectedProfile)}
              disabled={isSessionActive}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 glow-cyan"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Engage Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile List */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2">
            SELECT PROFILE
          </span>
          <div className="space-y-1.5 pt-1">
            {allProfiles.map((p) => {
              const isSelected = selectedProfile?.id === p.id;
              const isActiveInSession = isSessionActive && sessionStatus.active_profile === p.name;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProfile(p)}
                  className={`w-full p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate">{p.name}</span>
                    {isActiveInSession && (
                      <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    {p.category} • Safety: {p.safety_rating}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Profile Inspector */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 md:col-span-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                {selectedProfile.category}
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Safety: {selectedProfile.safety_rating}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {selectedProfile.requires_admin ? "Requires Admin" : "Standard User Access"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-2">{selectedProfile.name}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {selectedProfile.description}
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Profile Modifications Blueprint:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">POWER SCHEME</span>
                <span className="text-white font-bold mt-1 block">
                  {selectedProfile.power_scheme || "Unmodified"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">FOREGROUND PRIORITY BOOST</span>
                <span className="text-cyan-400 font-bold mt-1 block">
                  {selectedProfile.foreground_priority || "Normal (Default)"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">1MS HIGH-PRECISION TIMER</span>
                <span className="text-white font-bold mt-1 block">
                  {selectedProfile.enable_high_res_timer ? "Enabled (1.0ms)" : "Disabled (15.6ms)"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">LINEAR POINTER CURVE</span>
                <span className="text-white font-bold mt-1 block">
                  {selectedProfile.neutral_mouse_curve ? "Raw 1:1 Enforced" : "System Default"}
                </span>
              </div>
            </div>

            {selectedProfile.target_processes.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-500 font-mono block mb-1">
                  PRE-CONFIGURED TARGET PROCESSES:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfile.target_processes.map((proc, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {proc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
