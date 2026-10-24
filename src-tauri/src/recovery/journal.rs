use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum JournalSessionState {
    Preparing,
    Active,
    Restoring,
    Restored,
    Interrupted,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessStateRecord {
    pub pid: u32,
    pub process_name: String,
    pub original_priority: u32,
    pub original_affinity: usize,
    pub temporary_priority: Option<u32>,
    pub temporary_affinity: Option<usize>,
    pub restored: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppliedOptimizationRecord {
    pub key: String,
    pub category: String,
    pub description: String,
    pub original_value: String,
    pub temporary_value: String,
    pub timestamp: DateTime<Utc>,
    pub restored: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryJournal {
    pub session_id: String,
    pub profile_name: String,
    pub state: JournalSessionState,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub original_power_scheme: Option<String>,
    pub temporary_power_scheme: Option<String>,
    pub original_mouse_accel: Option<[i32; 3]>,
    pub timer_period_active: bool,
    pub processes: HashMap<u32, ProcessStateRecord>,
    pub applied_optimizations: Vec<AppliedOptimizationRecord>,
}

impl RecoveryJournal {
    pub fn new(session_id: String, profile_name: String) -> Self {
        let now = Utc::now();
        Self {
            session_id,
            profile_name,
            state: JournalSessionState::Preparing,
            created_at: now,
            updated_at: now,
            original_power_scheme: None,
            temporary_power_scheme: None,
            original_mouse_accel: None,
            timer_period_active: false,
            processes: HashMap::new(),
            applied_optimizations: Vec::new(),
        }
    }

    /// Path to journal: %LOCALAPPDATA%\Tikomizer\recovery_journal.json
    pub fn get_journal_path() -> PathBuf {
        let base_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("Tikomizer");
        let _ = fs::create_dir_all(&base_dir);
        base_dir.join("recovery_journal.json")
    }

    /// Atomically persist journal to disk
    pub fn save(&mut self) -> Result<(), String> {
        self.updated_at = Utc::now();
        let path = Self::get_journal_path();
        let temp_path = path.with_extension("tmp");

        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize journal: {}", e))?;

        let mut file = File::create(&temp_path)
            .map_err(|e| format!("Failed to create temp journal file: {}", e))?;

        file.write_all(json.as_bytes())
            .map_err(|e| format!("Failed to write temp journal file: {}", e))?;

        file.sync_all()
            .map_err(|e| format!("Failed to sync journal file: {}", e))?;

        fs::rename(&temp_path, &path)
            .map_err(|e| format!("Failed to commit journal rename: {}", e))?;

        Ok(())
    }

    /// Load existing recovery journal if present
    pub fn load() -> Option<Self> {
        let path = Self::get_journal_path();
        if !path.exists() {
            return None;
        }

        let content = fs::read_to_string(&path).ok()?;
        serde_json::from_str::<Self>(&content).ok()
    }

    /// Check if there was an unfinished optimization session from a crash or unexpected shutdown
    pub fn has_unrecovered_session() -> bool {
        if let Some(journal) = Self::load() {
            journal.state == JournalSessionState::Active
                || journal.state == JournalSessionState::Preparing
                || journal.state == JournalSessionState::Restoring
                || journal.state == JournalSessionState::Interrupted
        } else {
            false
        }
    }

    /// Clear journal file when session has been completely restored
    pub fn mark_restored_and_clear(&mut self) -> Result<(), String> {
        self.state = JournalSessionState::Restored;
        let _ = self.save();
        let path = Self::get_journal_path();
        if path.exists() {
            let _ = fs::remove_file(path);
        }
        Ok(())
    }
}
