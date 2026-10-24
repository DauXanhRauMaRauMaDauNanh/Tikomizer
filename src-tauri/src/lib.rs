pub mod api;
pub mod benchmarks;
pub mod diagnostics;
pub mod monitoring;
pub mod native_ffi;
pub mod platform;
pub mod profiles;
pub mod recovery;
pub mod security;
pub mod session;

use tauri::WindowEvent;

use crate::api::AppState;
use crate::monitoring::SystemMonitor;
use crate::session::manager::OptimizationSessionManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let session_manager = OptimizationSessionManager::new();
    let monitor = SystemMonitor::new();

    // Check for crash recovery from prior run
    if let Some(report) = session_manager.check_startup_recovery() {
        println!(
            "[Tikomizer] Automatic startup recovery executed: {} items restored",
            report.restored_items.len()
        );
    }

    let sm_clone_for_window = session_manager.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            session_manager: session_manager.clone(),
            monitor,
        })
        .on_window_event(move |_window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                println!("[Tikomizer] Window close requested. Safely restoring any active optimization session...");
                let status = sm_clone_for_window.get_status();
                if status.state == session::manager::SessionState::Active {
                    let _ = sm_clone_for_window.end_session();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            api::get_telemetry,
            api::get_session_status,
            api::start_session,
            api::end_session,
            api::emergency_restore,
            api::check_startup_recovery,
            api::get_profiles,
            api::run_benchmark,
            api::scan_temporary_files,
            api::execute_cleanup,
            api::get_system_health,
            api::get_native_simd_info,
            api::set_process_priority_cmd,
            api::set_process_affinity_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tikomizer application");
}
