import React, { useState } from "react";
import { Clock, Zap, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";

interface AutomationPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

interface AutoRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({ telemetry }) => {
  const [rules, setRules] = useState<AutoRule[]>([
    {
      id: "auto-game",
      name: "Automatic Game Detection",
      description: "When an authorized game becomes the active foreground window, immediately apply the Gaming Performance profile.",
      trigger: "Game in foreground window",
      action: "Engage Gaming Profile",
      enabled: true,
    },
    {
      id: "auto-restore",
      name: "Auto-Restore on Exit",
      description: "When the foreground game process exits or loses focus, automatically restore pre-session Windows state.",
      trigger: "Game process terminated",
      action: "Restore Default Balanced State",
      enabled: true,
    },
    {
      id: "laptop-battery",
      name: "Mobile Battery Conservation",
      description: "Automatically switch to Battery Saver profile when disconnected from AC power.",
      trigger: "DC battery power active",
      action: "Engage Battery Saver Profile",
      enabled: false,
    },
    {
      id: "mem-pressure",
      name: "Memory Pressure Warning",
      description: "Issue a subtle notification when physical memory commit exceeds 85% without aggressive forced trimming.",
      trigger: "RAM load > 85%",
      action: "Alert Diagnostics",
      enabled: true,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span>Automation Rules Engine</span>
        </h2>
        <p className="text-xs text-slate-400">
          State-aware background triggers that engage and restore profiles based on real window focus.
        </p>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 transition-all hover:border-slate-700"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">{rule.name}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  {rule.trigger}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">{rule.description}</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                Action: <span className="text-slate-300 font-semibold">{rule.action}</span>
              </div>
            </div>

            <button
              onClick={() => toggleRule(rule.id)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              {rule.enabled ? (
                <ToggleRight className="w-8 h-8 text-cyan-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
