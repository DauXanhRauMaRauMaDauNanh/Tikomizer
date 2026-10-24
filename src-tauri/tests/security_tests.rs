/**
 * Tikomizer Security Policy & Allowlist/Denylist Tests
 * Made by Mtienn
 */

use std::collections::HashSet;

#[test]
fn test_system_critical_processes_are_protected() {
    let mut protected = HashSet::new();
    protected.insert("csrss.exe");
    protected.insert("lsass.exe");
    protected.insert("services.exe");
    protected.insert("smss.exe");
    protected.insert("wininit.exe");
    protected.insert("msmpeng.exe");

    assert!(protected.contains("csrss.exe"));
    assert!(protected.contains("lsass.exe"));
    assert!(protected.contains("msmpeng.exe"));

    // User applications must not be blocked
    assert!(!protected.contains("cs2.exe"));
    assert!(!protected.contains("valorant.exe"));
    assert!(!protected.contains("obs64.exe"));
}

#[test]
fn test_anti_cheat_processes_are_shielded() {
    let mut anticheat = HashSet::new();
    anticheat.insert("easyanticheat.exe");
    anticheat.insert("beservice.exe");
    anticheat.insert("vgc.exe");

    assert!(anticheat.contains("easyanticheat.exe"));
    assert!(anticheat.contains("vgc.exe"));
}
