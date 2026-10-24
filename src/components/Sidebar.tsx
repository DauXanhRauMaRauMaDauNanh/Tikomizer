import React from "react";
import {
  Activity,
  Zap,
  Gamepad2,
  Cpu,
  BarChart2,
  HardDrive,
  Monitor,
  Wifi,
  MousePointer,
  Database,
  Layers,
  Trash2,
  Gauge,
  Sliders,
  Settings,
  Info,
  Clock,
  Sparkles,
  FileText
} from "lucide-react";

export type NavPageId =
  | "dashboard"
  | "one-click"
  | "gaming"
  | "live-resources"
  | "cpu"
  | "memory"
  | "gpu"
  | "display"
  | "network"
  | "input"
  | "storage"
  | "processes"
  | "debloat"
  | "benchmarks"
  | "profiles"
  | "automation"
  | "logs"
  | "settings"
  | "about";

interface SidebarProps {
  activePage: NavPageId;
  onSelectPage: (id: NavPageId) => void;
  compact: boolean;
  onToggleCompact: () => void;
}

interface NavItem {
  id: NavPageId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", icon: Activity },
      { id: "one-click", label: "One-Click Boost", icon: Sparkles, badge: "Quick" },
    ],
  },
  {
    title: "PERFORMANCE ENGINES",
    items: [
      { id: "gaming", label: "Gaming Engine", icon: Gamepad2 },
      { id: "live-resources", label: "Live Resource Monitor", icon: BarChart2 },
      { id: "cpu", label: "CPU & Scheduling", icon: Cpu },
      { id: "memory", label: "Memory Telemetry", icon: HardDrive },
      { id: "gpu", label: "GPU & Graphics", icon: Monitor },
      { id: "display", label: "Display & Monitor", icon: Monitor },
      { id: "network", label: "Network & Ping", icon: Wifi },
      { id: "input", label: "Input & Latency", icon: MousePointer },
    ],
  },
  {
    title: "SYSTEM & STORAGE",
    items: [
      { id: "storage", label: "Storage & I/O", icon: Database },
      { id: "processes", label: "Background Workloads", icon: Layers },
      { id: "debloat", label: "Debloat & Cleanup", icon: Trash2 },
    ],
  },
  {
    title: "BENCHMARKS & PROFILES",
    items: [
      { id: "benchmarks", label: "Benchmark Suite", icon: Gauge, badge: "No Fake" },
      { id: "profiles", label: "Optimization Profiles", icon: Sliders },
      { id: "automation", label: "Automation Rules", icon: Clock },
      { id: "logs", label: "Logs & Diagnostics", icon: FileText },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { id: "settings", label: "Advanced Settings", icon: Settings },
      { id: "about", label: "About Tikomizer", icon: Info },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  compact,
}) => {
  return (
    <aside
      className={`h-full border-r border-slate-800 bg-[#0c1222] flex flex-col justify-between shrink-0 select-none transition-all duration-200 z-20 ${
        compact ? "w-16" : "w-64"
      }`}
    >
      {/* Scrollable Nav Item List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!compact && (
              <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id)}
                  title={compact ? item.label : undefined}
                  className={`w-full flex items-center ${
                    compact ? "justify-center px-0" : "justify-between px-3"
                  } py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-cyan-400" : "text-slate-400"
                      }`}
                    />
                    {!compact && <span>{item.label}</span>}
                  </div>

                  {!compact && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        isActive
                          ? "bg-cyan-500/30 text-cyan-200"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Attribution Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        {!compact ? (
          <div className="text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Made by <span className="text-cyan-400 font-semibold">Mtienn</span>
            </p>
            <p className="text-[9px] text-slate-600 font-mono mt-0.5">
              MIT License • Windows x64
            </p>
          </div>
        ) : (
          <div className="text-center text-[10px] font-bold text-cyan-400">
            M
          </div>
        )}
      </div>
    </aside>
  );
};
