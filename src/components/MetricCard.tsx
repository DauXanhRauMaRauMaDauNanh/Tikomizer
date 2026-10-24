import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  subtitle?: string;
  badge?: string;
  trend?: "up" | "down" | "neutral";
  progress?: number; // 0 to 100
  colorScheme?: "cyan" | "emerald" | "amber" | "violet" | "rose";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  subtitle,
  badge,
  progress,
  colorScheme = "cyan",
}) => {
  const colorMap = {
    cyan: {
      border: "border-cyan-500/20",
      glow: "hover:border-cyan-500/40 hover:shadow-cyan-500/5",
      iconBg: "bg-cyan-500/10 text-cyan-400",
      progressBg: "bg-cyan-500",
    },
    emerald: {
      border: "border-emerald-500/20",
      glow: "hover:border-emerald-500/40 hover:shadow-emerald-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      progressBg: "bg-emerald-500",
    },
    amber: {
      border: "border-amber-500/20",
      glow: "hover:border-amber-500/40 hover:shadow-amber-500/5",
      iconBg: "bg-amber-500/10 text-amber-400",
      progressBg: "bg-amber-500",
    },
    violet: {
      border: "border-violet-500/20",
      glow: "hover:border-violet-500/40 hover:shadow-violet-500/5",
      iconBg: "bg-violet-500/10 text-violet-400",
      progressBg: "bg-violet-500",
    },
    rose: {
      border: "border-rose-500/20",
      glow: "hover:border-rose-500/40 hover:shadow-rose-500/5",
      iconBg: "bg-rose-500/10 text-rose-400",
      progressBg: "bg-rose-500",
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      className={`glass-panel p-4 rounded-xl border ${scheme.border} ${scheme.glow} transition-all duration-200 flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">{title}</span>
          <div className={`p-2 rounded-lg ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-slate-400 font-mono">
              {unit}
            </span>
          )}
          {badge && (
            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        {progress !== undefined && (
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden mb-1.5">
            <div
              className={`h-full ${scheme.progressBg} transition-all duration-300`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
        {subtitle && (
          <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
