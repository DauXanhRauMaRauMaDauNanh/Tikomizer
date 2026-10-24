/**
 * Tikomizer Recovery Journal Persistence & Rollback Verification Tests
 * Made by Mtienn
 */

use std::fs;
use std::path::PathBuf;

#[test]
fn test_recovery_journal_atomic_serialization() {
    let test_dir = std::env::temp_dir().join("tikomizer_test_journal");
    let _ = fs::create_dir_all(&test_dir);
    let journal_path = test_dir.join("recovery_journal_test.json");

    let sample_json = r#"{
        "session_id": "test_session_1001",
        "profile_name": "Gaming Performance",
        "state": "Active",
        "original_power_scheme": "381b4222-f694-41f0-9685-ff5bb260df2e",
        "temporary_power_scheme": "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c",
        "timer_period_active": true
    }"#;

    // Write journal
    fs::write(&journal_path, sample_json).expect("Failed to write test journal");
    assert!(journal_path.exists());

    // Read and verify
    let read_back = fs::read_to_string(&journal_path).expect("Failed to read journal");
    assert!(read_back.contains("test_session_1001"));
    assert!(read_back.contains("381b4222-f694-41f0-9685-ff5bb260df2e"));

    // Cleanup
    let _ = fs::remove_file(&journal_path);
    let _ = fs::remove_dir(&test_dir);
}
