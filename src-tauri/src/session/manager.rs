use std::sync::Arc;
use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

use crate::platform::windows_api::{
    get_active_power_scheme, get_process_priority_and_affinity, label_to_priority_class,
    query_foreground_window, query_mouse_acceleration, release_high_resolution_timer,
    request_high_resolution_timer, set_active_power_scheme, set_mouse_acceleration,
    set_process_priority, GUID_BALANCED, GUID_HIGH_PERFORMANCE, GUID_POWER_SAVER,
    GUID_ULTIMATE_PERFORMANCE,
};
use crate::profiles::OptimizationProfile;
use crate::recovery::journal::{
    AppliedOptimizationRecord, JournalSessionState, ProcessStateRecord, RecoveryJournal,
};
use crate::security::SecurityManager;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SessionState {
    Idle,
    Preparing,
    Active,
    Restoring,
    Error(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionStatus {
    pub state: SessionState,
    pub session_id: Option<String>,
    pub active_profile: Option<String>,
    pub started_at: Option<DateTime<Utc>>,
    pub uptime_seconds: u64,
    pub active_optimizations_count: usize,
    pub power_scheme_active: Option<String>,
    pub target_processes_count: usize,
    pub requires_recovery: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestorationReport {
    pub success: bool,
    pub is_full_restoration: bool,
    pub restored_items: Vec<String>,
    pub failed_items: Vec<String>,
    pub notes: String,
}

pub struct SessionManagerInner {
    pub state: SessionState,
    pub active_journal: Option<RecoveryJournal>,
    pub started_at: Option<DateTime<Utc>>,
    pub security: SecurityManager,
}

#[derive(Clone)]
pub struct OptimizationSessionManager {
    inner: Arc<RwLock<SessionManagerInner>>,
}

impl OptimizationSessionManager {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(SessionManagerInner {
                state: SessionState::Idle,
                active_journal: None,
                started_at: None,
                security: SecurityManager::default(),
            })),
        }
    }

    /// Check on application startup if an interrupted session exists
    pub fn check_startup_recovery(&self) -> Option<RestorationReport> {
        if RecoveryJournal::has_unrecovered_session() {
            println!("[Tikomizer] Detected unrecovered optimization session from previous run. Restoring...");
            Some(self.emergency_restore())
        } else {
            None
        }
    }

    /// Query live session status
    pub fn get_status(&self) -> SessionStatus {
        let inner = self.inner.read();
        let uptime = if let Some(started) = inner.started_at {
            Utc::now().signed_duration_since(started).num_seconds().max(0) as u64
        } else {
            0
        };

        let opt_count = inner
            .active_journal
            .as_ref()
            .map(|j| j.applied_optimizations.len())
            .unwrap_or(0);

        let proc_count = inner
            .active_journal
            .as_ref()
            .map(|j| j.processes.len())
            .unwrap_or(0);

        let profile_name = inner
            .active_journal
            .as_ref()
            .map(|j| j.profile_name.clone());

        let power = inner
            .active_journal
            .as_ref()
            .and_then(|j| j.temporary_power_scheme.clone());

        SessionStatus {
            state: inner.state.clone(),
            session_id: inner.active_journal.as_ref().map(|j| j.session_id.clone()),
            active_profile: profile_name,
            started_at: inner.started_at,
            uptime_seconds: uptime,
            active_optimizations_count: opt_count,
            power_scheme_active: power,
            target_processes_count: proc_count,
            requires_recovery: RecoveryJournal::has_unrecovered_session(),
        }
    }

    /// Start a new optimization session based on the selected profile
    pub fn start_session(&self, profile: OptimizationProfile) -> Result<SessionStatus, String> {
        let mut inner = self.inner.write();

        if inner.state == SessionState::Active {
            return Err("An optimization session is already active. Please disable it first.".to_string());
        }

        inner.state = SessionState::Preparing;
        let session_id = format!("tiko_{}", Utc::now().timestamp_millis());
        let mut journal = RecoveryJournal::new(session_id.clone(), profile.name.clone());

        // 1. Capture Original Power Scheme
        match get_active_power_scheme() {
            Ok(orig_power) => {
                journal.original_power_scheme = Some(orig_power.clone());
                println!("[Session] Recorded original power scheme: {}", orig_power);
            }
            Err(e) => {
                println!("[Session] Warning: Could not read active power scheme: {}", e);
            }
        }

        // 2. Capture Original Mouse Acceleration
        if profile.neutral_mouse_curve {
            if let Ok(orig_mouse) = query_mouse_acceleration() {
                journal.original_mouse_accel = Some(orig_mouse);
                println!("[Session] Recorded original mouse params: {:?}", orig_mouse);
            }
        }

        // 3. Save Recovery Journal to disk BEFORE applying any modifications!
        journal.state = JournalSessionState::Active;
        if let Err(e) = journal.save() {
            inner.state = SessionState::Error(format!("Failed to persist recovery journal: {}", e));
            return Err(e);
        }

        // 4. Apply Power Policy if requested
        if let Some(target_scheme) = &profile.power_scheme {
            let target_guid = match target_scheme.as_str() {
                "HighPerformance" => GUID_HIGH_PERFORMANCE,
                "UltimatePerformance" => GUID_ULTIMATE_PERFORMANCE,
                "PowerSaver" => GUID_POWER_SAVER,
                "Balanced" => GUID_BALANCED,
                guid => guid,
            };

            if let Err(e) = set_active_power_scheme(target_guid) {
                println!("[Session] Power scheme adjustment notice: {}", e);
            } else {
                journal.temporary_power_scheme = Some(target_guid.to_string());
                journal.applied_optimizations.push(AppliedOptimizationRecord {
                    key: "power_scheme".to_string(),
                    category: "Power".to_string(),
                    description: format!("Active power scheme set to {}", target_scheme),
                    original_value: journal.original_power_scheme.clone().unwrap_or_default(),
                    temporary_value: target_guid.to_string(),
                    timestamp: Utc::now(),
                    restored: false,
                });
            }
        }

        // 5. Apply High Resolution Timer if requested
        if profile.enable_high_res_timer {
            request_high_resolution_timer();
            journal.timer_period_active = true;
            journal.applied_optimizations.push(AppliedOptimizationRecord {
                key: "timer_period".to_string(),
                category: "Scheduling".to_string(),
                description: "1ms high-precision multimedia timer period engaged".to_string(),
                original_value: "Default (15.6ms)".to_string(),
                temporary_value: "1.0ms".to_string(),
                timestamp: Utc::now(),
                restored: false,
            });
        }

        // 6. Apply Neutral Mouse Curve if requested
        if profile.neutral_mouse_curve {
            let neutral_params = [0, 0, 0];
            if set_mouse_acceleration(neutral_params).is_ok() {
                journal.applied_optimizations.push(AppliedOptimizationRecord {
                    key: "mouse_acceleration".to_string(),
                    category: "Input".to_string(),
                    description: "Raw 1:1 linear pointer acceleration applied".to_string(),
                    original_value: format!("{:?}", journal.original_mouse_accel),
                    temporary_value: "[0, 0, 0]".to_string(),
                    timestamp: Utc::now(),
                    restored: false,
                });
            }
        }

        // 7. Check foreground game / target process priority boost
        if let Some(desired_prio_label) = &profile.foreground_priority {
            if let Some(target_prio) = label_to_priority_class(desired_prio_label) {
                if let Some(fg) = query_foreground_window() {
                    // Check if foreground process is in target list or authorized
                    let is_target = profile.target_processes.is_empty()
                        || profile
                            .target_processes
                            .iter()
                            .any(|t| t.eq_ignore_ascii_case(&fg.name));

                    if is_target && inner.security.is_process_safe_to_modify(&fg.name).is_ok() {
                        if let Ok(orig_proc) = get_process_priority_and_affinity(fg.pid) {
                            if set_process_priority(fg.pid, target_prio).is_ok() {
                                journal.processes.insert(
                                    fg.pid,
                                    ProcessStateRecord {
                                        pid: fg.pid,
                                        process_name: fg.name.clone(),
                                        original_priority: orig_proc.priority_class,
                                        original_affinity: orig_proc.affinity_mask,
                                        temporary_priority: Some(target_prio),
                                        temporary_affinity: None,
                                        restored: false,
                                    },
                                );
                                journal.applied_optimizations.push(AppliedOptimizationRecord {
                                    key: format!("proc_prio_{}", fg.pid),
                                    category: "CPU".to_string(),
                                    description: format!(
                                        "Boosted priority of '{}' (PID {}) to {}",
                                        fg.name, fg.pid, desired_prio_label
                                    ),
                                    original_value: orig_proc.priority_label,
                                    temporary_value: desired_prio_label.clone(),
                                    timestamp: Utc::now(),
                                    restored: false,
                                });
                            }
                        }
                    }
                }
            }
        }

        // 8. Commit updated active journal to disk
        let _ = journal.save();
        inner.active_journal = Some(journal);
        inner.started_at = Some(Utc::now());
        inner.state = SessionState::Active;

        let status = SessionStatus {
            state: inner.state.clone(),
            session_id: Some(session_id),
            active_profile: Some(profile.name),
            started_at: inner.started_at,
            uptime_seconds: 0,
            active_optimizations_count: inner.active_journal.as_ref().unwrap().applied_optimizations.len(),
            power_scheme_active: inner.active_journal.as_ref().unwrap().temporary_power_scheme.clone(),
            target_processes_count: inner.active_journal.as_ref().unwrap().processes.len(),
            requires_recovery: false,
        };

        Ok(status)
    }

    /// End session and restore all changed Windows settings
    pub fn end_session(&self) -> Result<RestorationReport, String> {
        let mut inner = self.inner.write();
        inner.state = SessionState::Restoring;

        let mut restored_items = Vec::new();
        let mut failed_items = Vec::new();

        if let Some(mut journal) = inner.active_journal.take() {
            // 1. Restore Power Scheme
            if let Some(orig_power) = &journal.original_power_scheme {
                match set_active_power_scheme(orig_power) {
                    Ok(_) => restored_items.push(format!("Power Scheme restored to original ({})", orig_power)),
                    Err(e) => failed_items.push(format!("Power Scheme restore failed: {}", e)),
                }
            }

            // 2. Restore High Resolution Timer
            if journal.timer_period_active {
                release_high_resolution_timer();
                restored_items.push("High-precision timer resolution released".to_string());
            }

            // 3. Restore Mouse Acceleration
            if let Some(orig_mouse) = journal.original_mouse_accel {
                match set_mouse_acceleration(orig_mouse) {
                    Ok(_) => restored_items.push(format!("Mouse acceleration parameters restored: {:?}", orig_mouse)),
                    Err(e) => failed_items.push(format!("Mouse acceleration restore failed: {}", e)),
                }
            }

            // 4. Restore Process Priorities
            for (pid, proc_record) in &journal.processes {
                match set_process_priority(*pid, proc_record.original_priority) {
                    Ok(_) => restored_items.push(format!(
                        "Restored priority for {} (PID {})",
                        proc_record.process_name, pid
                    )),
                    Err(_) => {
                        // If process already exited during game close, that's normal and expected
                        restored_items.push(format!(
                            "Process {} (PID {}) already terminated normally",
                            proc_record.process_name, pid
                        ));
                    }
                }
            }

            // 5. Mark journal restored and delete from disk
            let _ = journal.mark_restored_and_clear();
        }

        inner.state = SessionState::Idle;
        inner.started_at = None;

        let is_full = failed_items.is_empty();
        Ok(RestorationReport {
            success: true,
            is_full_restoration: is_full,
            restored_items,
            failed_items,
            notes: if is_full {
                "All temporary modifications were verified and safely restored to their pre-session state.".to_string()
            } else {
                "Some settings could not be verified automatically. Review the restoration report.".to_string()
            },
        })
    }

    /// Emergency Restore: Can be triggered anytime to revert all changes immediately
    pub fn emergency_restore(&self) -> RestorationReport {
        let mut restored_items = Vec::new();
        let mut failed_items = Vec::new();

        // 1. Check if journal exists on disk
        if let Some(mut journal) = RecoveryJournal::load() {
            if let Some(orig_power) = &journal.original_power_scheme {
                if set_active_power_scheme(orig_power).is_ok() {
                    restored_items.push(format!("Power Scheme restored to {}", orig_power));
                } else {
                    failed_items.push("Failed to restore original power scheme".to_string());
                }
            }

            if journal.timer_period_active {
                release_high_resolution_timer();
                restored_items.push("Timer resolution restored to system default".to_string());
            }

            if let Some(orig_mouse) = journal.original_mouse_accel {
                if set_mouse_acceleration(orig_mouse).is_ok() {
                    restored_items.push("Original pointer acceleration restored".to_string());
                }
            }

            for (pid, proc_record) in &journal.processes {
                let _ = set_process_priority(*pid, proc_record.original_priority);
            }

            let _ = journal.mark_restored_and_clear();
        } else {
            // General safe reset fallback
            let _ = set_active_power_scheme(GUID_BALANCED);
            release_high_resolution_timer();
            restored_items.push("Default Balanced power policy and timer resolution enforced".to_string());
        }

        let mut inner = self.inner.write();
        inner.state = SessionState::Idle;
        inner.active_journal = None;
        inner.started_at = None;

        RestorationReport {
            success: true,
            is_full_restoration: failed_items.is_empty(),
            restored_items,
            failed_items,
            notes: "Emergency restore successfully triggered.".to_string(),
        }
    }
}
