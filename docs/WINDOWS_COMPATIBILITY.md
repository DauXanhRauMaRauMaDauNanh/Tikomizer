# Windows Compatibility Matrix
**Made by Mtienn**

Tikomizer is engineered specifically for modern 64-bit Windows environments.

| Operating System | Architecture | Build / Version | Compatibility Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Windows 11** | x86_64 (x64) | 21H2, 22H2, 23H2, 24H2 | **Fully Supported** | Tested with modern scheduler topology and WDDM 3.0+ |
| **Windows 10** | x86_64 (x64) | 21H2, 22H2 | **Fully Supported** | Verified with Win32 timer and power management API |
| **Windows 10/11** | ARM64 | Any | *Emulated x64* | Runs under Windows x64 emulation layer |
| **Windows Server** | x86_64 (x64) | 2019, 2022, 2025 | Supported | Desktop Experience feature required for GUI |
| **Windows 7 / 8.1**| x86 / x64 | Any | *Unsupported* | Microsoft end-of-life; modern WebView2 and APIs required |

## Minimum Hardware Requirements
- **Processor**: Any x86_64 CPU (SSE2 support minimum, AVX2 recommended for native SIMD acceleration).
- **Memory**: 4 GB RAM (Low-end hardware optimized).
- **Disk Space**: 120 MB free storage.
- **Display**: 1280x720 minimum screen resolution.
