# Settings Reference Manual
**Made by Mtienn**

Comprehensive reference for all settings available within the Tikomizer configuration center.

| Setting | Default | Range / Options | Reversibility | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auto-Restore on Exit** | `true` | `true`, `false` | Automatic | Automatically restores pre-session settings when Tikomizer window closes. |
| **Startup Crash Recovery** | `true` | `true`, `false` | Automatic | Verifies recovery journal on application launch and rolls back any interrupted session. |
| **Sensor Refresh Interval** | `1000 ms` | `500 ms`, `1000 ms`, `2500 ms` | Immediate | Polling rate for CPU, memory, network, and disk metrics. |
| **Power Policy Scheme** | `Balanced` | Balanced, High Performance, Ultimate, Power Saver | Session-scoped | Target Windows ACPI power profile applied during active optimization sessions. |
| **High-Precision Timer** | `true` (Gaming) | `true`, `false` | Session-scoped | Invokes `timeBeginPeriod(1)` to request 1ms multimedia clock resolution. |
| **Neutral Mouse Acceleration** | `true` (Gaming) | `true`, `false` | Session-scoped | Sets `SPI_SETMOUSE` curve to `[0, 0, 0]` to eliminate pointer smoothing. |
| **Anonymous Telemetry** | `false` | `true`, `false` | Immediate | Opt-in anonymous crash diagnostic reporting. Local-only by default. |
| **Temporary File Scanning** | Safe `%TEMP%` | System Temp, User Temp | Immediate | Detects orphaned cache files with file lock verification. |
