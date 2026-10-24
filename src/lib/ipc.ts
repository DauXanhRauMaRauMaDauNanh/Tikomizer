import {
  CleanupExecutionReport,
  CleanupScanResult,
  OptimizationProfile,
  RestorationReport,
  SessionStatus,
  SystemHealthReport,
  SystemTelemetrySnapshot,
  BenchmarkSuiteResult
} from "../types";

// Check if running inside Tauri window
export const isTauri = (): boolean => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

// Safe invoke function
export async function invokeBackend<T>(cmd: string, args: Record<string, unknown> = {}): Promise<T> {
  if (isTauri()) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      return await invoke<T>(cmd, args);
    } catch (err) {
      console.error(`[IPC Error] ${cmd}:`, err);
      throw err;
    }
  }

  // Realistic browser fallback for preview/testing
  return mockBackendResponse<T>(cmd, args);
}

// Fallback provider for browser testing
function mockBackendResponse<T>(cmd: string, args: Record<string, unknown>): T {
  switch (cmd) {
    case "get_telemetry": {
      const mockSnap: SystemTelemetrySnapshot = {
        cpu_usage_total: 14.5,
        cpu_cores_usage: [12.0, 18.2, 9.4, 15.6, 22.1, 8.9, 14.0, 16.3],
        cpu_frequency_mhz: 3800,
        memory: {
          total_phys_mb: 16384,
          avail_phys_mb: 9840,
          used_phys_mb: 6544,
          memory_load_pct: 40,
          total_page_mb: 18432,
          avail_page_mb: 11200,
        },
        disks: [
          {
            name: "C: (NVMe SSD)",
            mount_point: "C:\\",
            total_space_gb: 953.8,
            available_space_gb: 482.4,
            used_pct: 49.4,
            is_removable: false,
          },
        ],
        network: {
          rx_bytes_per_sec: 142050,
          tx_bytes_per_sec: 32180,
          latency_ms: 18.4,
          jitter_ms: 1.2,
          dns_lookup_ms: 4.8,
          packet_loss_pct: 0.0,
          test_endpoint: (args.endpoint as string) || "1.1.1.1:80",
        },
        foreground_process: {
          pid: 8412,
          name: "cs2.exe",
          title: "Counter-Strike 2",
          exe_path: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\bin\\win64\\cs2.exe",
        },
        top_cpu_processes: [
          { pid: 8412, name: "cs2.exe", cpu_usage: 38.4, memory_mb: 3120, status: "Running" },
          { pid: 1420, name: "discord.exe", cpu_usage: 4.2, memory_mb: 480, status: "Running" },
          { pid: 3290, name: "steam.exe", cpu_usage: 1.8, memory_mb: 310, status: "Running" },
        ],
        top_memory_processes: [
          { pid: 8412, name: "cs2.exe", cpu_usage: 38.4, memory_mb: 3120, status: "Running" },
          { pid: 4820, name: "chrome.exe", cpu_usage: 3.1, memory_mb: 1820, status: "Running" },
          { pid: 1420, name: "discord.exe", cpu_usage: 4.2, memory_mb: 480, status: "Running" },
        ],
        display: {
          width: 1920,
          height: 1080,
          refresh_rate: 165,
          bits_per_pixel: 32,
        },
        tikomizer_overhead: {
          process_ram_mb: 38.4,
          process_cpu_pct: 0.2,
          thread_count: 8,
          handles_count: 140,
        },
        uptime_seconds: 36400,
      };
      return mockSnap as unknown as T;
    }

    case "get_session_status": {
      const mockStatus: SessionStatus = {
        state: "Idle",
        session_id: null,
        active_profile: null,
        started_at: null,
        uptime_seconds: 0,
        active_optimizations_count: 0,
        power_scheme_active: "Balanced",
        target_processes_count: 0,
        requires_recovery: false,
      };
      return mockStatus as unknown as T;
    }

    case "start_session": {
      const profile = args.profile as OptimizationProfile;
      const startedStatus: SessionStatus = {
        state: "Active",
        session_id: "tiko_mock_session_123",
        active_profile: profile ? profile.name : "Gaming Performance",
        started_at: new Date().toISOString(),
        uptime_seconds: 1,
        active_optimizations_count: 4,
        power_scheme_active: "HighPerformance",
        target_processes_count: 1,
        requires_recovery: false,
      };
      return startedStatus as unknown as T;
    }

    case "end_session":
    case "emergency_restore": {
      const report: RestorationReport = {
        success: true,
        is_full_restoration: true,
        restored_items: [
          "Power Scheme reverted to original Balanced profile",
          "Timer resolution restored to system default (15.6ms)",
          "Mouse pointer acceleration reverted to original parameters",
          "Process priority for cs2.exe (PID 8412) restored to Normal",
        ],
        failed_items: [],
        notes: "All temporary modifications successfully restored to pre-session state.",
      };
      return report as unknown as T;
    }

    case "get_profiles": {
      const profiles: OptimizationProfile[] = [
        {
          id: "safe-default",
          name: "Safe Default",
          description: "Conservative low-risk optimizations. Prioritizes stability and default Windows power management.",
          category: "General",
          power_scheme: "Balanced",
          foreground_priority: "Normal",
          enable_high_res_timer: false,
          neutral_mouse_curve: false,
          throttle_idle_background: false,
          target_processes: [],
          requires_admin: false,
          is_custom: false,
          safety_rating: "High",
        },
        {
          id: "gaming-performance",
          name: "Gaming Performance",
          description: "Engages High Performance power plan, 1ms multimedia timer resolution, and elevates authorized foreground game process priority.",
          category: "Gaming",
          power_scheme: "HighPerformance",
          foreground_priority: "AboveNormal",
          enable_high_res_timer: true,
          neutral_mouse_curve: true,
          throttle_idle_background: true,
          target_processes: ["cs2.exe", "valorant.exe", "dota2.exe"],
          requires_admin: false,
          is_custom: false,
          safety_rating: "Standard",
        },
        {
          id: "low-latency",
          name: "Low Latency",
          description: "Optimized for raw responsiveness, frame-time consistency, and linear mouse acceleration curve.",
          category: "Competitive",
          power_scheme: "HighPerformance",
          foreground_priority: "High",
          enable_high_res_timer: true,
          neutral_mouse_curve: true,
          throttle_idle_background: true,
          target_processes: [],
          requires_admin: false,
          is_custom: false,
          safety_rating: "Standard",
        },
        {
          id: "competitive-gaming",
          name: "Competitive Gaming",
          description: "Ultimate Performance power scheme with dedicated priority scheduling for competitive esports titles.",
          category: "Competitive",
          power_scheme: "UltimatePerformance",
          foreground_priority: "High",
          enable_high_res_timer: true,
          neutral_mouse_curve: true,
          throttle_idle_background: true,
          target_processes: ["cs2.exe", "valorant.exe"],
          requires_admin: false,
          is_custom: false,
          safety_rating: "Advanced",
        },
        {
          id: "streaming",
          name: "Streaming & Capture",
          description: "Balances CPU resources between foreground game and streaming/recording software (OBS Studio).",
          category: "Creation",
          power_scheme: "HighPerformance",
          foreground_priority: "AboveNormal",
          enable_high_res_timer: true,
          neutral_mouse_curve: false,
          throttle_idle_background: false,
          target_processes: ["obs64.exe"],
          requires_admin: false,
          is_custom: false,
          safety_rating: "High",
        },
        {
          id: "content-creation",
          name: "Content Creation",
          description: "Unleashes full logical processor affinity for 3D rendering, video encoding, and audio DAW pipelines.",
          category: "Creation",
          power_scheme: "HighPerformance",
          foreground_priority: "AboveNormal",
          enable_high_res_timer: false,
          neutral_mouse_curve: false,
          throttle_idle_background: false,
          target_processes: ["blender.exe"],
          requires_admin: false,
          is_custom: false,
          safety_rating: "High",
        },
        {
          id: "battery-saver",
          name: "Battery Saver",
          description: "Engages Windows Power Saver scheme and minimizes background sensor polling to preserve battery life on laptops.",
          category: "Efficiency",
          power_scheme: "PowerSaver",
          foreground_priority: "Normal",
          enable_high_res_timer: false,
          neutral_mouse_curve: false,
          throttle_idle_background: true,
          target_processes: [],
          requires_admin: false,
          is_custom: false,
          safety_rating: "High",
        },
      ];
      return profiles as unknown as T;
    }

    case "run_benchmark": {
      const suite_id = args.suite_id as string;
      const res: BenchmarkSuiteResult = {
        suite_id,
        suite_name: suite_id.toUpperCase() + " Benchmark",
        category: "Performance",
        timestamp: new Date().toISOString(),
        iterations: (args.iterations as number) || 5,
        metrics: [
          {
            name: "Throughput",
            unit: "MB/s",
            baseline_value: 4820.5,
            optimized_value: 5914.2,
            relative_change_pct: 22.7,
            is_lower_better: false,
            is_statistically_significant: true,
          },
          {
            name: "Execution Latency",
            unit: "ms",
            baseline_value: 12.4,
            optimized_value: 9.8,
            relative_change_pct: -21.0,
            is_lower_better: true,
            is_statistically_significant: true,
          },
        ],
        environment_notes: "Deterministic calibrated benchmark workload",
        summary_text: "Benchmark completed with measurable performance improvement.",
      };
      return res as unknown as T;
    }

    case "scan_temporary_files": {
      const scan: CleanupScanResult = {
        total_files: 42,
        total_size_bytes: 428500120,
        total_size_mb: 408.6,
        files: [
          { path: "C:\\Users\\Temp\\crashpad.dmp", file_name: "crashpad.dmp", size_bytes: 14205000, size_formatted: "13.5 MB", is_directory: false },
          { path: "C:\\Users\\Temp\\gpu_shader_cache", file_name: "gpu_shader_cache", size_bytes: 124500000, size_formatted: "118.7 MB", is_directory: true },
          { path: "C:\\Users\\Temp\\vscode-update.tmp", file_name: "vscode-update.tmp", size_bytes: 84200000, size_formatted: "80.3 MB", is_directory: false },
        ],
      };
      return scan as unknown as T;
    }

    case "execute_cleanup": {
      const report: CleanupExecutionReport = {
        deleted_files_count: 38,
        freed_bytes: 412800000,
        freed_mb: 393.7,
        locked_or_skipped_count: 4,
      };
      return report as unknown as T;
    }

    case "get_system_health": {
      const health: SystemHealthReport = {
        os_name: "Windows 11 Pro 64-bit",
        is_admin: true,
        memory_load_pct: 42,
        memory_status: "Optimal",
        timer_resolution_status: "Standard (15.6ms) / Dynamic 1.0ms on Session",
        timestamp: new Date().toISOString(),
      };
      return health as unknown as T;
    }

    case "get_native_simd_info": {
      return {
        features_raw: 15,
        sse2: true,
        sse41: true,
        avx: true,
        avx2: true,
        nasm_compiled: true,
        author: "Made by Mtienn",
      } as unknown as T;
    }

    default:
      return {} as unknown as T;
  }
}
