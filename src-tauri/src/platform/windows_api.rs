use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;
use std::path::PathBuf;
use std::process::Command;
use windows_sys::Win32::Foundation::{CloseHandle, HANDLE, HWND};
use windows_sys::Win32::Graphics::Gdi::{
    DEVMODEW, EnumDisplaySettingsW, ENUM_CURRENT_SETTINGS,
};
use windows_sys::Win32::Media::{timeBeginPeriod, timeEndPeriod};
use windows_sys::Win32::System::ProcessStatus::{
    GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS,
};
use windows_sys::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
use windows_sys::Win32::System::Threading::{
    GetPriorityClass, GetProcessAffinityMask, OpenProcess, SetPriorityClass,
    SetProcessAffinityMask, ABOVE_NORMAL_PRIORITY_CLASS, BELOW_NORMAL_PRIORITY_CLASS,
    HIGH_PRIORITY_CLASS, IDLE_PRIORITY_CLASS, NORMAL_PRIORITY_CLASS,
    PROCESS_QUERY_INFORMATION, PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_SET_INFORMATION,
};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId,
    SystemParametersInfoW, SPI_GETMOUSE, SPI_SETMOUSE, SPIF_SENDCHANGE,
};

// Power Scheme Well-Known GUIDs
pub const GUID_BALANCED: &str = "381b4222-f694-41f0-9685-ff5bb260df2e";
pub const GUID_HIGH_PERFORMANCE: &str = "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c";
pub const GUID_POWER_SAVER: &str = "a1841308-3541-4fab-bc81-f71556f20b4a";
pub const GUID_ULTIMATE_PERFORMANCE: &str = "e9a42b02-d5df-448d-aa00-03f14749eb61";

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ProcessPriorityAffinity {
    pub pid: u32,
    pub priority_class: u32,
    pub priority_label: String,
    pub affinity_mask: usize,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MemoryTelemetry {
    pub total_phys_mb: u64,
    pub avail_phys_mb: u64,
    pub used_phys_mb: u64,
    pub memory_load_pct: u32,
    pub total_page_mb: u64,
    pub avail_page_mb: u64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DisplayInfo {
    pub width: u32,
    pub height: u32,
    pub refresh_rate: u32,
    pub bits_per_pixel: u32,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ForegroundProcessInfo {
    pub pid: u32,
    pub name: String,
    pub title: String,
    pub exe_path: String,
}

/// Helper to convert priority class constant to human-readable label
pub fn priority_class_to_label(p: u32) -> String {
    match p {
        IDLE_PRIORITY_CLASS => "Idle".to_string(),
        BELOW_NORMAL_PRIORITY_CLASS => "BelowNormal".to_string(),
        NORMAL_PRIORITY_CLASS => "Normal".to_string(),
        ABOVE_NORMAL_PRIORITY_CLASS => "AboveNormal".to_string(),
        HIGH_PRIORITY_CLASS => "High".to_string(),
        _ => format!("Custom({})", p),
    }
}

/// Helper to convert label to Win32 priority class
pub fn label_to_priority_class(label: &str) -> Option<u32> {
    match label.to_lowercase().as_str() {
        "idle" => Some(IDLE_PRIORITY_CLASS),
        "belownormal" | "below_normal" => Some(BELOW_NORMAL_PRIORITY_CLASS),
        "normal" => Some(NORMAL_PRIORITY_CLASS),
        "abovenormal" | "above_normal" => Some(ABOVE_NORMAL_PRIORITY_CLASS),
        "high" => Some(HIGH_PRIORITY_CLASS),
        _ => None,
    }
}

/// Query active Windows power scheme GUID
pub fn get_active_power_scheme() -> Result<String, String> {
    let output = Command::new("powercfg")
        .args(["/getactivescheme"])
        .output()
        .map_err(|e| format!("Failed to execute powercfg: {}", e))?;

    if !output.status.success() {
        return Err("powercfg /getactivescheme returned error".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    // Format: "Power Scheme GUID: 381b4222-f694-41f0-9685-ff5bb260df2e  (Balanced)"
    for line in stdout.lines() {
        if line.contains("Power Scheme GUID:") || line.contains("GUID") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            for part in parts {
                if part.len() == 36 && part.contains('-') {
                    return Ok(part.to_string());
                }
            }
        }
    }
    // Fallback default
    Ok(GUID_BALANCED.to_string())
}

/// Set active Windows power scheme GUID
pub fn set_active_power_scheme(scheme_guid: &str) -> Result<(), String> {
    let output = Command::new("powercfg")
        .args(["/setactive", scheme_guid])
        .output()
        .map_err(|e| format!("Failed to execute powercfg /setactive: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Failed to set power scheme: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    Ok(())
}

/// Query original process priority and affinity mask
pub fn get_process_priority_and_affinity(pid: u32) -> Result<ProcessPriorityAffinity, String> {
    unsafe {
        let handle: HANDLE = OpenProcess(
            PROCESS_QUERY_INFORMATION | PROCESS_QUERY_LIMITED_INFORMATION,
            0,
            pid,
        );
        if handle.is_null() {
            return Err(format!("Could not open process {} with query access", pid));
        }

        let priority = GetPriorityClass(handle);
        let mut process_affinity: usize = 0;
        let mut system_affinity: usize = 0;
        let aff_ok = GetProcessAffinityMask(handle, &mut process_affinity, &mut system_affinity);

        CloseHandle(handle);

        if priority == 0 || aff_ok == 0 {
            return Err(format!("Failed to retrieve priority/affinity for PID {}", pid));
        }

        Ok(ProcessPriorityAffinity {
            pid,
            priority_class: priority,
            priority_label: priority_class_to_label(priority),
            affinity_mask: process_affinity,
        })
    }
}

/// Set process priority class
pub fn set_process_priority(pid: u32, priority_class: u32) -> Result<(), String> {
    // Safety check: Never allow real-time priority as instructed in safety rules
    const REALTIME_PRIORITY_CLASS: u32 = 0x00000100;
    if priority_class == REALTIME_PRIORITY_CLASS {
        return Err("Realtime priority class is prohibited by Tikomizer safety policy".to_string());
    }

    unsafe {
        let handle: HANDLE = OpenProcess(PROCESS_SET_INFORMATION | PROCESS_QUERY_INFORMATION, 0, pid);
        if handle.is_null() {
            return Err(format!("Could not open PID {} with set information rights", pid));
        }

        let res = SetPriorityClass(handle, priority_class);
        CloseHandle(handle);

        if res == 0 {
            Err(format!("SetPriorityClass failed for PID {}", pid))
        } else {
            Ok(())
        }
    }
}

/// Set process affinity mask
pub fn set_process_affinity(pid: u32, affinity_mask: usize) -> Result<(), String> {
    if affinity_mask == 0 {
        return Err("Affinity mask cannot be zero".to_string());
    }
    unsafe {
        let handle: HANDLE = OpenProcess(PROCESS_SET_INFORMATION | PROCESS_QUERY_INFORMATION, 0, pid);
        if handle.is_null() {
            return Err(format!("Could not open PID {} with set information rights", pid));
        }

        let res = SetProcessAffinityMask(handle, affinity_mask);
        CloseHandle(handle);

        if res == 0 {
            Err(format!("SetProcessAffinityMask failed for PID {}", pid))
        } else {
            Ok(())
        }
    }
}

/// Query system memory telemetry via GlobalMemoryStatusEx
pub fn query_memory_status() -> Result<MemoryTelemetry, String> {
    unsafe {
        let mut mem_status: MEMORYSTATUSEX = std::mem::zeroed();
        mem_status.dwLength = std::mem::size_of::<MEMORYSTATUSEX>() as u32;

        if GlobalMemoryStatusEx(&mut mem_status) == 0 {
            return Err("GlobalMemoryStatusEx call failed".to_string());
        }

        let total_phys = mem_status.ullTotalPhys / (1024 * 1024);
        let avail_phys = mem_status.ullAvailPhys / (1024 * 1024);
        let used_phys = total_phys.saturating_sub(avail_phys);
        let total_page = mem_status.ullTotalPageFile / (1024 * 1024);
        let avail_page = mem_status.ullAvailPageFile / (1024 * 1024);

        Ok(MemoryTelemetry {
            total_phys_mb: total_phys,
            avail_phys_mb: avail_phys,
            used_phys_mb: used_phys,
            memory_load_pct: mem_status.dwMemoryLoad,
            total_page_mb: total_page,
            avail_page_mb: avail_page,
        })
    }
}

/// Query primary display resolution and refresh rate via EnumDisplaySettingsW
pub fn query_primary_display() -> Result<DisplayInfo, String> {
    unsafe {
        let mut devmode: DEVMODEW = std::mem::zeroed();
        devmode.dmSize = std::mem::size_of::<DEVMODEW>() as u16;

        if EnumDisplaySettingsW(std::ptr::null(), ENUM_CURRENT_SETTINGS, &mut devmode) == 0 {
            return Err("EnumDisplaySettingsW failed to query display".to_string());
        }

        Ok(DisplayInfo {
            width: devmode.dmPelsWidth,
            height: devmode.dmPelsHeight,
            refresh_rate: devmode.dmDisplayFrequency,
            bits_per_pixel: devmode.dmBitsPerPel,
        })
    }
}

/// Query current foreground window information
pub fn query_foreground_window() -> Option<ForegroundProcessInfo> {
    unsafe {
        let hwnd: HWND = GetForegroundWindow();
        if hwnd.is_null() {
            return None;
        }

        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == 0 {
            return None;
        }

        let mut title_buf = [0u16; 512];
        let len = GetWindowTextW(hwnd, title_buf.as_mut_ptr(), 512);
        let title = if len > 0 {
            OsString::from_wide(&title_buf[..len as usize])
                .to_string_lossy()
                .to_string()
        } else {
            String::new()
        };

        // Query image name via OpenProcess
        let handle: HANDLE = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
        let mut exe_path = String::new();
        let mut name = String::new();

        if !handle.is_null() {
            let mut path_buf = [0u16; 1024];
            let mut size: u32 = 1024;
            // QueryFullProcessImageNameW is loaded dynamically or through kernel32
            use windows_sys::Win32::System::Threading::QueryFullProcessImageNameW;
            if QueryFullProcessImageNameW(handle, 0, path_buf.as_mut_ptr(), &mut size) != 0 {
                let full_path = OsString::from_wide(&path_buf[..size as usize])
                    .to_string_lossy()
                    .to_string();
                if let Some(file_name) = PathBuf::from(&full_path).file_name() {
                    name = file_name.to_string_lossy().to_string();
                }
                exe_path = full_path;
            }
            CloseHandle(handle);
        }

        Some(ForegroundProcessInfo {
            pid,
            name,
            title,
            exe_path,
        })
    }
}

/// Query mouse acceleration settings (threshold1, threshold2, acceleration)
pub fn query_mouse_acceleration() -> Result<[i32; 3], String> {
    unsafe {
        let mut mouse_params = [0i32; 3];
        if SystemParametersInfoW(
            SPI_GETMOUSE,
            0,
            mouse_params.as_mut_ptr() as *mut _,
            0,
        ) == 0 {
            Err("SystemParametersInfoW SPI_GETMOUSE failed".to_string())
        } else {
            Ok(mouse_params)
        }
    }
}

/// Restore mouse acceleration settings
pub fn set_mouse_acceleration(params: [i32; 3]) -> Result<(), String> {
    unsafe {
        let mut p = params;
        if SystemParametersInfoW(
            SPI_SETMOUSE,
            0,
            p.as_mut_ptr() as *mut _,
            SPIF_SENDCHANGE,
        ) == 0 {
            Err("SystemParametersInfoW SPI_SETMOUSE failed".to_string())
        } else {
            Ok(())
        }
    }
}

/// Request 1ms timer resolution during session
pub fn request_high_resolution_timer() {
    unsafe {
        timeBeginPeriod(1);
    }
}

/// Restore default timer resolution
pub fn release_high_resolution_timer() {
    unsafe {
        timeEndPeriod(1);
    }
}

/// Query Tikomizer's own process memory working set in MB
pub fn query_current_process_memory_mb() -> (f64, u32) {
    unsafe {
        use windows_sys::Win32::System::Threading::GetCurrentProcess;
        let handle = GetCurrentProcess();
        let mut counters: PROCESS_MEMORY_COUNTERS = std::mem::zeroed();
        counters.cb = std::mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32;

        if GetProcessMemoryInfo(handle, &mut counters, counters.cb) != 0 {
            let working_set_mb = counters.WorkingSetSize as f64 / (1024.0 * 1024.0);
            (working_set_mb, 0)
        } else {
            (0.0, 0)
        }
    }
}
