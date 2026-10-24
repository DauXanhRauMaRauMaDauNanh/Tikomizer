use std::collections::HashSet;
use std::process::Command;

pub struct SecurityManager {
    protected_system_processes: HashSet<String>,
    anti_cheat_processes: HashSet<String>,
}

impl Default for SecurityManager {
    fn default() -> Self {
        let mut protected = HashSet::new();
        for p in &[
            "system",
            "registry",
            "smss.exe",
            "csrss.exe",
            "wininit.exe",
            "services.exe",
            "lsass.exe",
            "svchost.exe",
            "fontdrvhost.exe",
            "winlogon.exe",
            "dwm.exe",
            "explorer.exe",
            "spoolsv.exe",
            "msmpeng.exe",
            "nissrv.exe",
            "securityhealthservice.exe",
        ] {
            protected.insert(p.to_lowercase());
        }

        let mut anticheat = HashSet::new();
        for ac in &[
            "easyanticheat.exe",
            "easyanticheat_eos.exe",
            "beservice.exe",
            "vgc.exe",
            "faceit.exe",
            "ricochet.exe",
        ] {
            anticheat.insert(ac.to_lowercase());
        }

        Self {
            protected_system_processes: protected,
            anti_cheat_processes: anticheat,
        }
    }
}

impl SecurityManager {
    pub fn is_process_safe_to_modify(&self, process_name: &str) -> Result<(), String> {
        let name_lower = process_name.to_lowercase();
        if self.protected_system_processes.contains(&name_lower) {
            return Err(format!(
                "Process '{}' is a critical Windows system process and cannot be modified.",
                process_name
            ));
        }

        if self.anti_cheat_processes.contains(&name_lower) {
            return Err(format!(
                "Process '{}' is an anti-cheat security service and is strictly protected from interference.",
                process_name
            ));
        }

        Ok(())
    }

    /// Check if the current process is running with Administrator / elevated privileges
    pub fn is_running_as_admin() -> bool {
        // Safe check using standard Windows `net session` check without elevation prompts
        Command::new("net")
            .arg("session")
            .output()
            .map(|out| out.status.success())
            .unwrap_or(false)
    }
}
