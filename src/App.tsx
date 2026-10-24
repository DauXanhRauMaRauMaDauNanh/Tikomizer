import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar, NavPageId } from "./components/Sidebar";
import { EmergencyModal } from "./components/EmergencyModal";

// Pages
import { DashboardPage } from "./pages/DashboardPage";
import { OneClickPage } from "./pages/OneClickPage";
import { GamingPage } from "./pages/GamingPage";
import { LiveResourceManagerPage } from "./pages/LiveResourceManagerPage";
import { CpuSchedulingPage } from "./pages/CpuSchedulingPage";
import { MemoryPage } from "./pages/MemoryPage";
import { GpuGraphicsPage } from "./pages/GpuGraphicsPage";
import { DisplayMonitorPage } from "./pages/DisplayMonitorPage";
import { NetworkPage } from "./pages/NetworkPage";
import { InputLatencyPage } from "./pages/InputLatencyPage";
import { StorageIoPage } from "./pages/StorageIoPage";
import { BackgroundProcessesPage } from "./pages/BackgroundProcessesPage";
import { DebloatCleanupPage } from "./pages/DebloatCleanupPage";
import { BenchmarksPage } from "./pages/BenchmarksPage";
import { OptimizationProfilesPage } from "./pages/OptimizationProfilesPage";
import { AutomationPage } from "./pages/AutomationPage";
import { LogsDiagnosticsPage } from "./pages/LogsDiagnosticsPage";
import { AdvancedSettingsPage } from "./pages/AdvancedSettingsPage";
import { AboutPage } from "./pages/AboutPage";

// IPC and types
import { invokeBackend } from "./lib/ipc";
import { OptimizationProfile, RestorationReport, SessionStatus, SystemTelemetrySnapshot } from "./types";

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<NavPageId>("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [compactSidebar, setCompactSidebar] = useState<boolean>(false);

  const [telemetry, setTelemetry] = useState<SystemTelemetrySnapshot | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    state: "Idle",
    session_id: null,
    active_profile: null,
    started_at: null,
    uptime_seconds: 0,
    active_optimizations_count: 0,
    power_scheme_active: "Balanced",
    target_processes_count: 0,
    requires_recovery: false,
  });

  const [profiles, setProfiles] = useState<OptimizationProfile[]>([]);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [restorationReport, setRestorationReport] = useState<RestorationReport | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Initial load and polling
  useEffect(() => {
    // 1. Check startup recovery
    invokeBackend<RestorationReport | null>("check_startup_recovery")
      .then((rep) => {
        if (rep) {
          setRestorationReport(rep);
          setEmergencyModalOpen(true);
        }
      })
      .catch(console.error);

    // 2. Load profiles
    invokeBackend<OptimizationProfile[]>("get_profiles")
      .then(setProfiles)
      .catch(console.error);

    // 3. Telemetry and session status polling loop
    const fetchStatus = () => {
      invokeBackend<SystemTelemetrySnapshot>("get_telemetry")
        .then(setTelemetry)
        .catch(console.error);

      invokeBackend<SessionStatus>("get_session_status")
        .then(setSessionStatus)
        .catch(console.error);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSession = async (profile: OptimizationProfile) => {
    try {
      const status = await invokeBackend<SessionStatus>("start_session", { profile });
      setSessionStatus(status);
    } catch (err) {
      alert(`Failed to start optimization session: ${err}`);
    }
  };

  const handleEndSession = async () => {
    try {
      const report = await invokeBackend<RestorationReport>("end_session");
      setRestorationReport(report);
      setEmergencyModalOpen(true);
      const status = await invokeBackend<SessionStatus>("get_session_status");
      setSessionStatus(status);
    } catch (err) {
      alert(`Failed to end optimization session: ${err}`);
    }
  };

  const handleExecuteEmergencyRestore = async () => {
    setIsRestoring(true);
    try {
      const report = await invokeBackend<RestorationReport>("emergency_restore");
      setRestorationReport(report);
      const status = await invokeBackend<SessionStatus>("get_session_status");
      setSessionStatus(status);
    } catch (err) {
      alert(`Emergency restore failed: ${err}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className={`h-full w-full flex flex-col ${theme === "light" ? "light bg-slate-50 text-slate-900" : "dark bg-[#0b0f19] text-slate-100"}`}>
      {/* Header */}
      <Header
        sessionStatus={sessionStatus}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onEmergencyRestore={() => {
          setRestorationReport(null);
          setEmergencyModalOpen(true);
        }}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={setActivePage}
          compact={compactSidebar}
          onToggleCompact={() => setCompactSidebar(!compactSidebar)}
        />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0b0f19]/40 backdrop-blur-xs">
          <div className="max-w-6xl mx-auto pb-10">
            {activePage === "dashboard" && (
              <DashboardPage
                telemetry={telemetry}
                sessionStatus={sessionStatus}
                profiles={profiles}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
                onNavigate={setActivePage}
              />
            )}
            {activePage === "one-click" && (
              <OneClickPage
                sessionStatus={sessionStatus}
                profiles={profiles}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
              />
            )}
            {activePage === "gaming" && (
              <GamingPage
                telemetry={telemetry}
                sessionStatus={sessionStatus}
                profiles={profiles}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
              />
            )}
            {activePage === "live-resources" && (
              <LiveResourceManagerPage telemetry={telemetry} />
            )}
            {activePage === "cpu" && (
              <CpuSchedulingPage telemetry={telemetry} />
            )}
            {activePage === "memory" && (
              <MemoryPage telemetry={telemetry} />
            )}
            {activePage === "gpu" && (
              <GpuGraphicsPage telemetry={telemetry} />
            )}
            {activePage === "display" && (
              <DisplayMonitorPage telemetry={telemetry} />
            )}
            {activePage === "network" && (
              <NetworkPage telemetry={telemetry} />
            )}
            {activePage === "input" && (
              <InputLatencyPage telemetry={telemetry} />
            )}
            {activePage === "storage" && (
              <StorageIoPage telemetry={telemetry} />
            )}
            {activePage === "processes" && (
              <BackgroundProcessesPage telemetry={telemetry} />
            )}
            {activePage === "debloat" && (
              <DebloatCleanupPage />
            )}
            {activePage === "benchmarks" && (
              <BenchmarksPage />
            )}
            {activePage === "profiles" && (
              <OptimizationProfilesPage
                profiles={profiles}
                sessionStatus={sessionStatus}
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
              />
            )}
            {activePage === "automation" && (
              <AutomationPage telemetry={telemetry} />
            )}
            {activePage === "logs" && (
              <LogsDiagnosticsPage />
            )}
            {activePage === "settings" && (
              <AdvancedSettingsPage />
            )}
            {activePage === "about" && (
              <AboutPage />
            )}
          </div>
        </main>
      </div>

      {/* Emergency Restore Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onConfirm={handleExecuteEmergencyRestore}
        report={restorationReport}
        isRestoring={isRestoring}
      />
    </div>
  );
};
export default App;
