use std::fs;
use chrono::Utc;
use serde::{Deserialize, Serialize};

use crate::platform::windows_api::query_memory_status;
use crate::security::SecurityManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TempFileItem {
    pub path: String,
    pub file_name: String,
    pub size_bytes: u64,
    pub size_formatted: String,
    pub is_directory: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupScanResult {
    pub total_files: usize,
    pub total_size_bytes: u64,
    pub total_size_mb: f64,
    pub files: Vec<TempFileItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupExecutionReport {
    pub deleted_files_count: usize,
    pub freed_bytes: u64,
    pub freed_mb: f64,
    pub locked_or_skipped_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthReport {
    pub os_name: String,
    pub is_admin: bool,
    pub memory_load_pct: u32,
    pub memory_status: String, // "Optimal", "Moderate Pressure", "High Pressure"
    pub timer_resolution_status: String,
    pub timestamp: String,
}

pub struct DiagnosticsManager;

impl DiagnosticsManager {
    /// Format bytes into human readable format (KB, MB, GB)
    pub fn format_bytes(bytes: u64) -> String {
        if bytes >= 1024 * 1024 * 1024 {
            format!("{:.2} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0))
        } else if bytes >= 1024 * 1024 {
            format!("{:.2} MB", bytes as f64 / (1024.0 * 1024.0))
        } else if bytes >= 1024 {
            format!("{:.1} KB", bytes as f64 / 1024.0)
        } else {
            format!("{} B", bytes)
        }
    }

    /// Scan eligible safe temporary directories (%TEMP%)
    pub fn scan_temporary_files() -> CleanupScanResult {
        let mut items = Vec::new();
        let mut total_bytes = 0u64;

        let temp_dir = std::env::temp_dir();
        if let Ok(entries) = fs::read_dir(&temp_dir) {
            for entry in entries.flatten() {
                if let Ok(meta) = entry.metadata() {
                    let size = if meta.is_file() { meta.len() } else { 0 };
                    total_bytes += size;

                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let path = entry.path().to_string_lossy().to_string();

                    // Only preview up to 50 items to keep IPC snappy
                    if items.len() < 50 {
                        items.push(TempFileItem {
                            path,
                            file_name,
                            size_bytes: size,
                            size_formatted: Self::format_bytes(size),
                            is_directory: meta.is_dir(),
                        });
                    }
                }
            }
        }

        CleanupScanResult {
            total_files: items.len(),
            total_size_bytes: total_bytes,
            total_size_mb: (total_bytes as f64 / (1024.0 * 1024.0) * 10.0).round() / 10.0,
            files: items,
        }
    }

    /// Execute safe temporary file cleanup (skips locked or active files)
    pub fn execute_cleanup() -> CleanupExecutionReport {
        let temp_dir = std::env::temp_dir();
        let mut deleted_count = 0usize;
        let mut freed_bytes = 0u64;
        let mut skipped_count = 0usize;

        if let Ok(entries) = fs::read_dir(&temp_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                // Never delete tikomizer directories or files
                if path.to_string_lossy().to_lowercase().contains("tikomizer") {
                    continue;
                }

                if let Ok(meta) = entry.metadata() {
                    let size = meta.len();
                    if meta.is_file() {
                        if fs::remove_file(&path).is_ok() {
                            deleted_count += 1;
                            freed_bytes += size;
                        } else {
                            skipped_count += 1; // Locked by another running app
                        }
                    } else if meta.is_dir() {
                        if fs::remove_dir_all(&path).is_ok() {
                            deleted_count += 1;
                        } else {
                            skipped_count += 1;
                        }
                    }
                }
            }
        }

        CleanupExecutionReport {
            deleted_files_count: deleted_count,
            freed_bytes,
            freed_mb: (freed_bytes as f64 / (1024.0 * 1024.0) * 10.0).round() / 10.0,
            locked_or_skipped_count: skipped_count,
        }
    }

    /// Produce a system health report
    pub fn check_system_health() -> SystemHealthReport {
        let is_admin = SecurityManager::is_running_as_admin();
        let mem = query_memory_status().ok();

        let (mem_pct, mem_status) = if let Some(m) = mem {
            let status = if m.memory_load_pct < 70 {
                "Optimal".to_string()
            } else if m.memory_load_pct < 85 {
                "Moderate Pressure".to_string()
            } else {
                "High Pressure".to_string()
            };
            (m.memory_load_pct, status)
        } else {
            (0, "Unknown".to_string())
        };

        SystemHealthReport {
            os_name: "Windows (x64 Architecture)".to_string(),
            is_admin,
            memory_load_pct: mem_pct,
            memory_status: mem_status,
            timer_resolution_status: "Standard / Optimized on Session".to_string(),
            timestamp: Utc::now().to_rfc3339(),
        }
    }
}
