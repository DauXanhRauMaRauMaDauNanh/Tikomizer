# Changelog
All notable changes to the Tikomizer project are documented here following Keep a Changelog format.

## [1.0.0] - 2026-10-24
### Added
- Initial public release of Tikomizer by Mtienn.
- Dedicated `OptimizationSessionManager` with transactional state machine and atomic rollback.
- Persistent `%LOCALAPPDATA%\Tikomizer\recovery_journal.json` with crash detection upon startup.
- Full Tauri 2 desktop application with React, TypeScript, and Tailwind CSS.
- 19 comprehensive navigation sections covering telemetry, gaming, CPU, memory, GPU, display, network, storage, debloat, benchmarks, profiles, and settings.
- Native C/C++ memory entropy and latency analyzer with zero exception boundary.
- Handcrafted NASM x86_64 AVX2 SIMD kernel with runtime CPUID detection and portable C fallback.
- Multi-suite deterministic benchmark subsystem (CPU & Text, Native SIMD, Deflate Compression, 1080p Video Transcoding, Storage I/O, App Overhead) with JSON/CSV export.
- Safe temporary file cleanup with lock detection and candidate preview.
- Complete documentation suite and GitHub Actions CI workflow.
