export interface ProcessPriorityAffinity {
  pid: number;
  priority_class: number;
  priority_label: string;
  affinity_mask: number;
}

export interface MemoryTelemetry {
  total_phys_mb: number;
  avail_phys_mb: number;
  used_phys_mb: number;
  memory_load_pct: number;
  total_page_mb: number;
  avail_page_mb: number;
}

export interface DisplayInfo {
  width: number;
  height: number;
  refresh_rate: number;
  bits_per_pixel: number;
}

export interface ForegroundProcessInfo {
  pid: number;
  name: string;
  title: string;
  exe_path: string;
}

export interface ProcessSummary {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_mb: number;
  status: string;
}

export interface DiskSummary {
  name: string;
  mount_point: string;
  total_space_gb: number;
  available_space_gb: number;
  used_pct: number;
  is_removable: boolean;
}

export interface NetworkMetrics {
  rx_bytes_per_sec: number;
  tx_bytes_per_sec: number;
  latency_ms: number;
  jitter_ms: number;
  dns_lookup_ms: number;
  packet_loss_pct: number;
  test_endpoint: string;
}

export interface TikomizerOverhead {
  process_ram_mb: number;
  process_cpu_pct: number;
  thread_count: number;
  handles_count: number;
}

export interface SystemTelemetrySnapshot {
  cpu_usage_total: number;
  cpu_cores_usage: number[];
  cpu_frequency_mhz: number;
  memory: MemoryTelemetry;
  disks: DiskSummary[];
  network: NetworkMetrics;
  foreground_process: ForegroundProcessInfo | null;
  top_cpu_processes: ProcessSummary[];
  top_memory_processes: ProcessSummary[];
  display: DisplayInfo | null;
  tikomizer_overhead: TikomizerOverhead;
  uptime_seconds: number;
}

export type SessionState = "Idle" | "Preparing" | "Active" | "Restoring" | { Error: string };

export interface SessionStatus {
  state: SessionState;
  session_id: string | null;
  active_profile: string | null;
  started_at: string | null;
  uptime_seconds: number;
  active_optimizations_count: number;
  power_scheme_active: string | null;
  target_processes_count: number;
  requires_recovery: boolean;
}

export interface RestorationReport {
  success: boolean;
  is_full_restoration: boolean;
  restored_items: string[];
  failed_items: string[];
  notes: string;
}

export interface OptimizationProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  power_scheme: string | null;
  foreground_priority: string | null;
  enable_high_res_timer: boolean;
  neutral_mouse_curve: boolean;
  throttle_idle_background: boolean;
  target_processes: string[];
  requires_admin: boolean;
  is_custom: boolean;
  safety_rating: "High" | "Standard" | "Advanced";
}

export interface BenchmarkMetric {
  name: string;
  unit: string;
  baseline_value: number;
  optimized_value: number;
  relative_change_pct: number;
  is_lower_better: boolean;
  is_statistically_significant: boolean;
}

export interface BenchmarkSuiteResult {
  suite_id: string;
  suite_name: string;
  category: string;
  timestamp: string;
  iterations: number;
  metrics: BenchmarkMetric[];
  environment_notes: string;
  summary_text: string;
}

export interface TempFileItem {
  path: string;
  file_name: string;
  size_bytes: number;
  size_formatted: string;
  is_directory: boolean;
}

export interface CleanupScanResult {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  files: TempFileItem[];
}

export interface CleanupExecutionReport {
  deleted_files_count: number;
  freed_bytes: number;
  freed_mb: number;
  locked_or_skipped_count: number;
}

export interface SystemHealthReport {
  os_name: string;
  is_admin: boolean;
  memory_load_pct: number;
  memory_status: string;
  timer_resolution_status: string;
  timestamp: string;
}
