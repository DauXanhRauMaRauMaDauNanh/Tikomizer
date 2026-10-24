# Tikomizer System Architecture
**Made by Mtienn**

Tikomizer is designed as a native, low-overhead Windows performance platform prioritizing **reversibility, transparency, and safety**.

```
+-------------------------------------------------------------+
|             React + TypeScript Desktop UI (Tauri 2)         |
|   19 Nav Sections | Dark/Light Design System | Live Telemetry |
+-------------------------------------------------------------+
                              |
                     Bounded IPC Commands
                              |
+-------------------------------------------------------------+
|               Rust Native Systems Backend                   |
|  - OptimizationSessionManager (State Machine)              |
|  - RecoveryJournal (%LOCALAPPDATA%\Tikomizer\journal.json)  |
|  - SystemMonitor (sysinfo + Win32 API)                     |
|  - BenchmarkRunner (Calibrated Workloads)                   |
|  - SecurityManager (Allowlist / Denylist)                   |
+-------------------------------------------------------------+
           |                                  |
           | Win32 API                        | C ABI / FFI
           v                                  v
+--------------------------+    +-----------------------------+
|    Windows Subsystem     |    |   Native Acceleration       |
| - Power Scheme Policy    |    | - C Reference Baseline      |
| - Process Priority       |    | - C++ Memory Entropy        |
| - Process Affinity       |    | - NASM AVX2 SIMD Assembly   |
| - Multimedia Timer (1ms) |    | - Runtime CPUID Dispatch    |
| - Pointer Acceleration   |    +-----------------------------+
+--------------------------+
```

## Core Architectural Guarantees

1. **Transactional Session State Machine**:
   - `Idle -> Preparing -> Active -> Restoring -> Idle`
   - Every modified setting records its original value in memory and in the persistent recovery journal on disk *before* applying changes.
   - On exit, shutdown, or manual deactivation, settings are automatically restored to their baseline.

2. **No Tracing Garbage Collector in Backend**:
   - The systems layer is implemented in Rust, C, C++, and Assembly, guaranteeing deterministic resource management and low memory footprints (~38 MB RAM).

3. **Multi-Language Native Integration**:
   - **Rust**: Systems orchestration, safety boundary, IPC.
   - **C**: Portable scalar reference baseline.
   - **C++**: RAII memory entropy and stride latency analysis with strict zero-exception leakage across C ABI boundaries.
   - **NASM x86_64 Assembly**: AVX2 SIMD accelerated vector operations with runtime CPUID feature detection and safe portable fallback.
