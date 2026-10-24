import React from "react";
import { Info, ShieldCheck, Zap, Heart, Terminal, Code2, Globe } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Info className="w-5 h-5 text-cyan-400" />
          <span>About Tikomizer</span>
        </h2>
        <p className="text-xs text-slate-400">
          Product architecture, licensing specifications, and engineering principles.
        </p>
      </div>

      {/* Main Branding Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-cyan-950/20">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Tikomizer</h3>
            <p className="text-xs text-cyan-400 font-mono font-medium">
              Version 1.0.0 • Made by Mtienn
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Tikomizer is a native Windows performance platform engineered for gamers, power users, and creators. Unlike dangerous "debloat" scripts that permanently rip apart the operating system, Tikomizer operates as an intelligent, temporary optimization layer: every modification is transparent, calibrated, and guaranteed 100% reversible upon exit.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            MIT Licensed
          </span>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Windows 10 / 11 (x64)
          </span>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Rust + C/C++ + NASM + Tauri 2
          </span>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Zero Tracing Garbage Collection in Backend
          </span>
        </div>
      </div>

      {/* Core Design Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
              Temporary Optimization Guarantee
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every supported setting captures its original value into an atomic recovery journal before modification. On session termination, application close, or emergency restore, Windows returns cleanly to its exact pre-session state.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Code2 className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
              Scientific Measurement (No Fake FPS)
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never advertise impossible 5x universal FPS boosts or fake RAM flushes. Improvements are verified against repeatable workloads with disclosed formulas and exportable JSON/CSV audit reports.
          </p>
        </div>
      </div>

      {/* Developer Credit & License */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-semibold text-white">Project Authorship & Attribution</span>
          <span className="font-mono text-cyan-400">Made by Mtienn</span>
        </div>
        <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
          Copyright © 2026 Mtienn. Released under the open-source MIT License.
          Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to use, copy, modify, and distribute without restriction.
        </p>
      </div>
    </div>
  );
};
