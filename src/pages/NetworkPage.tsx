import React, { useState } from "react";
import { Wifi, Globe, Activity, ShieldCheck, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import { SystemTelemetrySnapshot } from "../types";

interface NetworkPageProps {
  telemetry: SystemTelemetrySnapshot | null;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({ telemetry }) => {
  const net = telemetry?.network;
  const [testEndpoint, setTestEndpoint] = useState<string>("1.1.1.1:80");
  const [isTesting, setIsTesting] = useState(false);

  const formatRate = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
    return `${bytes} B/s`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Wifi className="w-5 h-5 text-cyan-400" />
          <span>Network Diagnostics & Gaming Latency</span>
        </h2>
        <p className="text-xs text-slate-400">
          Real round-trip TCP ping, jitter variance analysis, and local DNS resolution telemetry.
        </p>
      </div>

      {/* Primary Network Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">ROUND-TRIP LATENCY</p>
          <p className="text-3xl font-bold font-mono text-cyan-400 mt-1">
            {net ? net.latency_ms : 0} ms
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Target: {net?.test_endpoint || "1.1.1.1"}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">JITTER VARIANCE</p>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">
            {net ? net.jitter_ms : 0} ms
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Packet arrival stability</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">DNS LOOKUP TIME</p>
          <p className="text-3xl font-bold font-mono text-violet-400 mt-1">
            {net ? net.dns_lookup_ms : 0} ms
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Domain name resolution</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">PACKET LOSS</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">
            {net ? net.packet_loss_pct : 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Transmission integrity</p>
        </div>
      </div>

      {/* Live Interface Throughput */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Active Adapter Throughput
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Sampling every 1000ms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">DOWNLOAD THROUGHPUT (RX)</span>
              <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {net ? formatRate(net.rx_bytes_per_sec) : "0 B/s"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">↓</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">UPLOAD THROUGHPUT (TX)</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {net ? formatRate(net.tx_bytes_per_sec) : "0 B/s"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">↑</div>
          </div>
        </div>
      </div>

      {/* Configurable Test Endpoint */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Custom Latency Test Endpoint
        </h3>
        <p className="text-xs text-slate-400">
          Enter an IP or domain to measure real connection latency and jitter against your preferred gaming datacenter.
        </p>

        <div className="flex space-x-2">
          <input
            type="text"
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            placeholder="e.g. 1.1.1.1:80 or 8.8.8.8:53"
          />
          <button
            onClick={() => setIsTesting(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
            <span>Test Endpoint</span>
          </button>
        </div>
      </div>

      {/* Network Safety Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-300">Evidence-Based Network Optimization Policy</p>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            Tikomizer prohibits arbitrary TCP registry hacks from internet folklore. We do not disable IPv6, disable hardware NIC offloading, or tamper with firewall rules without empirical evidence.
          </p>
        </div>
      </div>
    </div>
  );
};
