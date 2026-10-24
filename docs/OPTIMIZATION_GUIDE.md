# Tikomizer Optimization Guide
**Made by Mtienn**

This guide outlines the principles, evidence, and configuration choices behind Tikomizer's performance profiles.

## Predefined Profiles

### 1. Safe Default
- **Intended Audience**: Standard desktop, office, browsing.
- **Power Policy**: Balanced scheme (`GUID 381b4222-f694-41f0-9685-ff5bb260df2e`).
- **Scheduling**: Windows standard thread priorities.
- **Timer Resolution**: Default 15.6ms Windows tick rate.
- **Safety**: 100% conservative.

### 2. Gaming Performance
- **Intended Audience**: Competitive and AAA PC gaming.
- **Power Policy**: High Performance scheme (`GUID 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c`).
- **Foreground Scheduling**: Automatically boosts foreground authorized game process to `Above Normal`.
- **Timer Resolution**: Requests 1.0ms timer resolution via `timeBeginPeriod(1)`.
- **Pointer Latency**: Enforces raw 1:1 mouse acceleration curve via `SPI_SETMOUSE`.

### 3. Low Latency & Competitive Gaming
- **Intended Audience**: Esports titles requiring minimum input-to-render variance.
- **Power Policy**: Ultimate Performance (`GUID e9a42b02-d5df-448d-aa00-03f14749eb61`).
- **Scheduling**: Priority set to `High` for verified game processes. Realtime priority is intentionally disallowed to prevent system lockups.

### 4. Streaming & Capture
- **Intended Audience**: Gamers streaming to Twitch/YouTube while playing.
- **Scheduling**: Balances game threads and encoder threads (e.g., `obs64.exe`).

### 5. Content Creation
- **Intended Audience**: 3D viewports (Blender), video editing (Premiere, Resolve).
- **Affinity**: Unlocks all physical and logical CPU cores for sustained multithreaded rendering.

### 6. Battery Saver
- **Intended Audience**: Laptops running on DC battery power.
- **Power Policy**: Power Saver (`GUID a1841308-3541-4fab-bc81-f71556f20b4a`).
- **Overhead**: Reduces background telemetry polling frequency from 1000ms to 2500ms.
