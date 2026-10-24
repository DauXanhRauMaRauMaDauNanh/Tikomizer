# Tikomizer
### Premium, Reversible, Native Windows Performance Platform
**Made by Mtienn**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011%20(x64)-0078D6.svg)](https://www.microsoft.com/windows)
[![Architecture](https://img.shields.io/badge/Architecture-Rust%20%2B%20C%2FC%2B%2B%20%2B%20NASM%20%2B%20Tauri%202-06b6d4.svg)](#technology-stack)

Tikomizer is an open-source, evidence-based Windows performance platform, gaming optimizer, real-time resource manager, and system diagnostics suite. 

Unlike radical "debloat" scripts that permanently rip out core Windows components, Tikomizer functions as a **temporary, intelligent optimization layer**. Every modification is understandable, empirically measured, and **guaranteed 100% reversible upon session exit or shutdown**.

---

## Key Principles & Guarantees

1. **Temporary Optimization Sessions**: No permanent debloating or damaging of operating system internals.
2. **Transactional State Handling**: Every setting records its original value in a persistent recovery journal (`%LOCALAPPDATA%\Tikomizer\recovery_journal.json`) *before* any change is made.
3. **Crash-Proof Disaster Recovery**: If Windows experiences an unexpected power loss or reboot while an optimization session is active, Tikomizer detects the journal upon startup and safely restores baseline settings.
4. **Empirical Benchmarks (No Fake Results)**: Workloads are deterministic and calibrated (JSON/text parsing, NASM AVX2 SIMD acceleration, Deflate compression, 1080p video format transcoding, sequential storage I/O).
5. **Anti-Cheat Safe**: Zero code injection, zero memory patching, and zero graphics DLL hooking. Verified safe for EasyAntiCheat, BattlEye, Vanguard, and Valve Anti-Cheat.
6. **No Tracing Garbage Collector in Systems Core**: Native Rust backend with C, C++, and NASM assembly kernels for ultra-low resource overhead (~38 MB RAM, <0.3% idle CPU).

---

## Implemented Feature Matrix

| Feature Module | Implementation Status | Technical Mechanism |
| :--- | :---: | :--- |
| **OptimizationSessionManager** | **Complete** | Transactional state machine (`Idle -> Preparing -> Active -> Restoring -> Idle`) |
| **Persistent Recovery Journal** | **Complete** | Atomic temp-file commit to `%LOCALAPPDATA%\Tikomizer\recovery_journal.json` |
| **Emergency Restore Engine** | **Complete** | One-click instant rollback of power plans, timer periods, and process states |
| **Live Telemetry & Dashboard** | **Complete** | Per-core CPU load, physical RAM, commit charge, network throughput, foreground PID |
| **One-Click Quick Boost** | **Complete** | Gaming, Creative Flow, and Mobile Battery Presets |
| **Gaming Performance Engine** | **Complete** | Game focus detection, 1ms timer resolution, linear pointer curves, AboveNormal priority |
| **Synthetic 3D Graphics Benchmark**| **Complete** | Real-time 3D polyhedron rendering measuring FPS, avg frame time, and 1% lows |
| **CPU Scheduling & Affinity** | **Complete** | Win32 `SetPriorityClass` and `SetProcessAffinityMask` with realtime priority lockout |
| **Memory Diagnostics** | **Complete** | GlobalMemoryStatusEx telemetry with honest explanations against counterproductive RAM flushing |
| **Network & Gaming Latency** | **Complete** | Real socket TCP ping, jitter calculation, and DNS lookup latency against configurable endpoints |
| **Input & Polling Rate Tester** | **Complete** | Real-time event interval capture calculating actual mouse polling rate (Hz) and jitter |
| **Storage & I/O Benchmark** | **Complete** | Non-destructive 16MB sequential read/write in isolated temporary directories |
| **Safe Windows Cleanup** | **Complete** | Scans `%TEMP%` cache files with full size preview and active file lock skipping |
| **Native SIMD Benchmark** | **Complete** | Compares pure C scalar baseline vs NASM AVX2 assembly kernel with CPUID detection |
| **Multi-Suite Export** | **Complete** | Benchmark comparison exports to JSON and CSV |
| **Comprehensive Settings** | **Complete** | Grouped configuration, reset to default, and privacy controls |

---

## Architecture & Technology Stack

- **Shell & Desktop Presentation**: Tauri 2 (Native Windows desktop window, WebView2 runtime).
- **User Interface**: React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Systems Backend**: Rust (safe resource management, Win32 API integration, session journal, monitoring).
- **Native High-Performance C/C++ Engine**:
  - `native/c/tikomizer_c.c`: Portable scalar reference baseline.
  - `native/cpp/tikomizer_cpp.cpp`: RAII memory entropy and stride latency analysis (zero exception leakage).
  - `native/asm/tikomizer_simd_x64.asm`: Handcrafted NASM x86_64 AVX2 SIMD kernel.
  - `native/asm/tikomizer_simd_fallback.c`: Runtime CPUID feature detection dispatcher.

---

## Prerequisites & Supported Environments

- **Operating System**: Windows 10 22H2 or Windows 11 (64-bit x64).
- **RAM**: Minimum 4 GB RAM.
- **Build Tools**:
  - Rust 1.80+ (`x86_64-pc-windows-gnu` or `x86_64-pc-windows-msvc`).
  - Node.js 18+ and npm.
  - NASM (Netwide Assembler) for AVX2 kernel assembly.
  - GCC / G++ (MinGW-w64 / MSYS2) or MSVC C++ build tools.

---

## Build & Launch Instructions

### 1. Clone Repository
```bash
git clone https://github.com/DauXanhRauMaRauMaDauNanh/Tikomizer.git
cd Tikomizer
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Build Web UI
```bash
npm run build
```

### 4. Run Desktop Application (Dev Mode)
```bash
npm run tauri dev
```

### 5. Build Standalone Production Release Binary
```bash
cd src-tauri
cargo build --release
```
The compiled native executable will be located at:
`src-tauri/target/release/tikomizer.exe`

---

## Performance Targets & Disclosures

- **Overhead Target**: Idle CPU usage < 0.3%, Working Set RAM < 45 MB.
- **Performance Disclaimer**: Performance improvements depend entirely on hardware specifications, workload bottlenecks, and existing system configuration. Tikomizer does not fabricate 5x FPS gains or promise universal acceleration on hardware already performing at its physical limit.

---

## Authorship & License

Developed with precision by **Mtienn**.

Licensed under the [MIT License](LICENSE). Copyright © 2026 Mtienn.
