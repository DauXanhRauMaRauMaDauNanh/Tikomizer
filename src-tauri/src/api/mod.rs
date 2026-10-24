use tauri::State;
use serde_json::json;

use crate::benchmarks::{BenchmarkRunner, BenchmarkSuiteResult};
use crate::diagnostics::{CleanupExecutionReport, CleanupScanResult, DiagnosticsManager, SystemHealthReport};
use crate::monitoring::{SystemMonitor, SystemTelemetrySnapshot};
use crate::native_ffi::detect_cpu_features;
use crate::platform::windows_api::{label_to_priority_class, set_process_affinity, set_process_priority};
use crate::profiles::{get_predefined_profiles, OptimizationProfile};
use crate::session::manager::{OptimizationSessionManager, RestorationReport, SessionStatus};

pub struct AppState {
    pub session_manager: OptimizationSessionManager,
    pub monitor: SystemMonitor,
}

#[tauri::command]
pub fn get_telemetry(state: State<'_, AppState>, endpoint: Option<String>) -> SystemTelemetrySnapshot {
    state.monitor.snapshot(endpoint.as_deref())
}

#[tauri::command]
pub fn get_session_status(state: State<'_, AppState>) -> SessionStatus {
    state.session_manager.get_status()
}

#[tauri::command]
pub fn start_session(
    state: State<'_, AppState>,
    profile: OptimizationProfile,
) -> Result<SessionStatus, String> {
    state.session_manager.start_session(profile)
}

#[tauri::command]
pub fn end_session(state: State<'_, AppState>) -> Result<RestorationReport, String> {
    state.session_manager.end_session()
}

#[tauri::command]
pub fn emergency_restore(state: State<'_, AppState>) -> RestorationReport {
    state.session_manager.emergency_restore()
}

#[tauri::command]
pub fn check_startup_recovery(state: State<'_, AppState>) -> Option<RestorationReport> {
    state.session_manager.check_startup_recovery()
}

#[tauri::command]
pub fn get_profiles() -> Vec<OptimizationProfile> {
    get_predefined_profiles()
}

#[tauri::command]
pub fn run_benchmark(suite_id: String, iterations: usize) -> Result<BenchmarkSuiteResult, String> {
    let iters = iterations.clamp(1, 100);
    match suite_id.as_str() {
        "cpu-text" => Ok(BenchmarkRunner::run_cpu_text_benchmark(iters)),
        "native-simd" => Ok(BenchmarkRunner::run_native_simd_benchmark(iters)),
        "compression" => Ok(BenchmarkRunner::run_compression_benchmark(iters)),
        "video-1080p" => Ok(BenchmarkRunner::run_video_multimedia_benchmark(iters)),
        "storage-io" => Ok(BenchmarkRunner::run_storage_benchmark(iters)),
        "overhead" => Ok(BenchmarkRunner::run_overhead_benchmark()),
        _ => Err(format!("Unknown benchmark suite id: {}", suite_id)),
    }
}

#[tauri::command]
pub fn scan_temporary_files() -> CleanupScanResult {
    DiagnosticsManager::scan_temporary_files()
}

#[tauri::command]
pub fn execute_cleanup() -> CleanupExecutionReport {
    DiagnosticsManager::execute_cleanup()
}

#[tauri::command]
pub fn get_system_health() -> SystemHealthReport {
    DiagnosticsManager::check_system_health()
}

#[tauri::command]
pub fn get_native_simd_info() -> serde_json::Value {
    let features = detect_cpu_features();
    json!({
        "features_raw": features,
        "sse2": (features & crate::native_ffi::TIKOMIZER_CPU_FEATURE_SSE2) != 0,
        "sse41": (features & crate::native_ffi::TIKOMIZER_CPU_FEATURE_SSE41) != 0,
        "avx": (features & crate::native_ffi::TIKOMIZER_CPU_FEATURE_AVX) != 0,
        "avx2": (features & crate::native_ffi::TIKOMIZER_CPU_FEATURE_AVX2) != 0,
        "nasm_compiled": true,
        "author": "Made by Mtienn"
    })
}

#[tauri::command]
pub fn set_process_priority_cmd(pid: u32, priority: String) -> Result<(), String> {
    let prio = label_to_priority_class(&priority)
        .ok_or_else(|| format!("Invalid priority label: {}", priority))?;
    set_process_priority(pid, prio)
}

#[tauri::command]
pub fn set_process_affinity_cmd(pid: u32, mask: usize) -> Result<(), String> {
    set_process_affinity(pid, mask)
}
