# Security & Safety Specifications
**Made by Mtienn**

Tikomizer is designed to be a safe, transparent, and trustworthy Windows desktop utility.

## Mandatory Safety Constraints

1. **Least Privilege Principle**:
   - The application runs under standard user privileges by default.
   - Elevation is requested only if a specific user-configured operation requires administrative tokens.
   - No UAC bypass techniques are implemented or permitted.

2. **System-Critical Process Denylist**:
   Tikomizer strictly refuses to terminate or deprioritize critical Windows OS components:
   - `csrss.exe`, `lsass.exe`, `services.exe`, `smss.exe`, `wininit.exe`, `winlogon.exe`, `dwm.exe`, `explorer.exe`.

3. **Anti-Cheat Non-Interference**:
   - Zero DLL injection.
   - Zero memory hooking or process patching.
   - Verified safe for EasyAntiCheat, BattlEye, Vanguard, and Valve Anti-Cheat.

4. **Security Subsystems Integrity**:
   - Windows Defender is never disabled or impaired.
   - Windows Firewall rules remain intact.
   - Windows Update services are never stripped.

5. **Local-Only Operation**:
   - Telemetry is disabled by default.
   - No silent cloud uploads of user data, file paths, or credentials.

6. **Crash-Proof Recovery Journal**:
   - Persisted at `%LOCALAPPDATA%\Tikomizer\recovery_journal.json`.
   - Protects against power outages and unexpected crashes by restoring original settings on subsequent launch.
