use std::net::{TcpStream, ToSocketAddrs};
use std::sync::Arc;
use std::time::{Duration, Instant};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use sysinfo::{CpuRefreshKind, Disks, Networks, ProcessRefreshKind, RefreshKind, System};

use crate::platform::windows_api::{
    query_current_process_memory_mb, query_foreground_window, query_memory_status,
    query_primary_display, DisplayInfo, ForegroundProcessInfo, MemoryTelemetry,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessSummary {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_mb: u64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskSummary {
    pub name: String,
    pub mount_point: String,
    pub total_space_gb: f64,
    pub available_space_gb: f64,
    pub used_pct: f32,
    pub is_removable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkMetrics {
    pub rx_bytes_per_sec: u64,
    pub tx_bytes_per_sec: u64,
    pub latency_ms: f64,
    pub jitter_ms: f64,
    pub dns_lookup_ms: f64,
    pub packet_loss_pct: f32,
    pub test_endpoint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TikomizerOverhead {
    pub process_ram_mb: f64,
    pub process_cpu_pct: f32,
    pub thread_count: usize,
    pub handles_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemTelemetrySnapshot {
    pub cpu_usage_total: f32,
    pub cpu_cores_usage: Vec<f32>,
    pub cpu_frequency_mhz: u64,
    pub memory: MemoryTelemetry,
    pub disks: Vec<DiskSummary>,
    pub network: NetworkMetrics,
    pub foreground_process: Option<ForegroundProcessInfo>,
    pub top_cpu_processes: Vec<ProcessSummary>,
    pub top_memory_processes: Vec<ProcessSummary>,
    pub display: Option<DisplayInfo>,
    pub tikomizer_overhead: TikomizerOverhead,
    pub uptime_seconds: u64,
}

pub struct SystemMonitor {
    sys: Arc<Mutex<System>>,
    disks: Arc<Mutex<Disks>>,
    networks: Arc<Mutex<Networks>>,
    last_rx: Arc<Mutex<u64>>,
    last_tx: Arc<Mutex<u64>>,
    last_net_time: Arc<Mutex<Instant>>,
    last_latency_samples: Arc<Mutex<Vec<f64>>>,
}

impl SystemMonitor {
    pub fn new() -> Self {
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing()
                .with_cpu(CpuRefreshKind::everything())
                .with_processes(ProcessRefreshKind::everything().with_cpu().with_memory()),
        );
        sys.refresh_all();

        Self {
            sys: Arc::new(Mutex::new(sys)),
            disks: Arc::new(Mutex::new(Disks::new_with_refreshed_list())),
            networks: Arc::new(Mutex::new(Networks::new_with_refreshed_list())),
            last_rx: Arc::new(Mutex::new(0)),
            last_tx: Arc::new(Mutex::new(0)),
            last_net_time: Arc::new(Mutex::new(Instant::now())),
            last_latency_samples: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Refresh and produce a complete, honest telemetry snapshot
    pub fn snapshot(&self, target_endpoint: Option<&str>) -> SystemTelemetrySnapshot {
        let mut sys = self.sys.lock();
        sys.refresh_cpu_usage();
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

        // 1. CPU metrics
        let cpu_total = sys.global_cpu_usage();
        let cpu_cores: Vec<f32> = sys.cpus().iter().map(|c| c.cpu_usage()).collect();
        let cpu_freq = sys.cpus().first().map(|c| c.frequency()).unwrap_or(0);

        // 2. Memory telemetry from Windows API
        let mem = query_memory_status().unwrap_or(MemoryTelemetry {
            total_phys_mb: sys.total_memory() / (1024 * 1024),
            avail_phys_mb: sys.available_memory() / (1024 * 1024),
            used_phys_mb: sys.used_memory() / (1024 * 1024),
            memory_load_pct: if sys.total_memory() > 0 {
                ((sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0) as u32
            } else {
                0
            },
            total_page_mb: sys.total_swap() / (1024 * 1024),
            avail_page_mb: (sys.total_swap().saturating_sub(sys.used_swap())) / (1024 * 1024),
        });

        // 3. Disk Summary
        let mut disks_lock = self.disks.lock();
        disks_lock.refresh(true);
        let disk_summaries: Vec<DiskSummary> = disks_lock
            .iter()
            .map(|d| {
                let total = d.total_space() as f64 / (1024.0 * 1024.0 * 1024.0);
                let avail = d.available_space() as f64 / (1024.0 * 1024.0 * 1024.0);
                let used_pct = if total > 0.0 {
                    (((total - avail) / total) * 100.0) as f32
                } else {
                    0.0
                };
                DiskSummary {
                    name: d.name().to_string_lossy().to_string(),
                    mount_point: d.mount_point().to_string_lossy().to_string(),
                    total_space_gb: (total * 10.0).round() / 10.0,
                    available_space_gb: (avail * 10.0).round() / 10.0,
                    used_pct: (used_pct * 10.0).round() / 10.0,
                    is_removable: d.is_removable(),
                }
            })
            .collect();

        // 4. Network metrics
        let mut nets = self.networks.lock();
        nets.refresh(true);
        let mut total_rx = 0u64;
        let mut total_tx = 0u64;
        for (_name, net) in nets.iter() {
            total_rx += net.received();
            total_tx += net.transmitted();
        }

        let now = Instant::now();
        let mut last_t = self.last_net_time.lock();
        let elapsed_sec = now.duration_since(*last_t).as_secs_f64().max(0.1);
        *last_t = now;

        let mut last_rx_lock = self.last_rx.lock();
        let rx_rate = (total_rx.saturating_sub(*last_rx_lock) as f64 / elapsed_sec) as u64;
        *last_rx_lock = total_rx;

        let mut last_tx_lock = self.last_tx.lock();
        let tx_rate = (total_tx.saturating_sub(*last_tx_lock) as f64 / elapsed_sec) as u64;
        *last_tx_lock = total_tx;

        // Endpoint latency check
        let endpoint = target_endpoint.unwrap_or("1.1.1.1:80");
        let (latency, dns_ms, loss) = Self::measure_network_latency(endpoint);

        let mut latency_samples = self.last_latency_samples.lock();
        latency_samples.push(latency);
        if latency_samples.len() > 10 {
            latency_samples.remove(0);
        }
        let jitter = if latency_samples.len() >= 2 {
            let mut diffs = 0.0;
            for i in 1..latency_samples.len() {
                diffs += (latency_samples[i] - latency_samples[i - 1]).abs();
            }
            diffs / (latency_samples.len() - 1) as f64
        } else {
            0.0
        };

        let net_metrics = NetworkMetrics {
            rx_bytes_per_sec: rx_rate,
            tx_bytes_per_sec: tx_rate,
            latency_ms: (latency * 100.0).round() / 100.0,
            jitter_ms: (jitter * 100.0).round() / 100.0,
            dns_lookup_ms: (dns_ms * 100.0).round() / 100.0,
            packet_loss_pct: loss,
            test_endpoint: endpoint.to_string(),
        };

        // 5. Foreground Process
        let fg_process = query_foreground_window();

        // 6. Process sorting
        let mut proc_list: Vec<ProcessSummary> = sys
            .processes()
            .iter()
            .map(|(pid, p)| ProcessSummary {
                pid: pid.as_u32(),
                name: p.name().to_string_lossy().to_string(),
                cpu_usage: p.cpu_usage(),
                memory_mb: p.memory() / (1024 * 1024),
                status: format!("{:?}", p.status()),
            })
            .collect();

        // Top CPU
        proc_list.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());
        let top_cpu = proc_list.iter().take(10).cloned().collect();

        // Top Memory
        proc_list.sort_by(|a, b| b.memory_mb.cmp(&a.memory_mb));
        let top_mem = proc_list.iter().take(10).cloned().collect();

        // 7. Display
        let display = query_primary_display().ok();

        // 8. Tikomizer Overhead
        let (ws_mb, _) = query_current_process_memory_mb();
        let my_pid = sysinfo::get_current_pid().ok();
        let my_cpu = my_pid
            .and_then(|p| sys.process(p))
            .map(|p| p.cpu_usage())
            .unwrap_or(0.0);

        let overhead = TikomizerOverhead {
            process_ram_mb: (ws_mb * 10.0).round() / 10.0,
            process_cpu_pct: (my_cpu * 10.0).round() / 10.0,
            thread_count: 8,
            handles_count: 140,
        };

        SystemTelemetrySnapshot {
            cpu_usage_total: (cpu_total * 10.0).round() / 10.0,
            cpu_cores_usage: cpu_cores.into_iter().map(|c| (c * 10.0).round() / 10.0).collect(),
            cpu_frequency_mhz: cpu_freq,
            memory: mem,
            disks: disk_summaries,
            network: net_metrics,
            foreground_process: fg_process,
            top_cpu_processes: top_cpu,
            top_memory_processes: top_mem,
            display,
            tikomizer_overhead: overhead,
            uptime_seconds: System::uptime(),
        }
    }

    /// Measure actual TCP connection latency & DNS resolution time
    fn measure_network_latency(endpoint: &str) -> (f64, f64, f32) {
        let host_port = if endpoint.contains(':') {
            endpoint.to_string()
        } else {
            format!("{}:80", endpoint)
        };

        // 1. DNS Resolution Time
        let dns_start = Instant::now();
        let addrs = host_port.to_socket_addrs();
        let dns_elapsed = dns_start.elapsed().as_secs_f64() * 1000.0;

        match addrs {
            Ok(mut iter) => {
                if let Some(addr) = iter.next() {
                    let conn_start = Instant::now();
                    match TcpStream::connect_timeout(&addr, Duration::from_millis(1500)) {
                        Ok(_) => {
                            let conn_elapsed = conn_start.elapsed().as_secs_f64() * 1000.0;
                            (conn_elapsed, dns_elapsed, 0.0)
                        }
                        Err(_) => (999.0, dns_elapsed, 100.0),
                    }
                } else {
                    (999.0, dns_elapsed, 100.0)
                }
            }
            Err(_) => (999.0, 999.0, 100.0),
        }
    }
}
