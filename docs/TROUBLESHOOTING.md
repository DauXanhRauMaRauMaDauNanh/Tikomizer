# Troubleshooting & Disaster Recovery
**Made by Mtienn**

## Emergency Recovery Procedure

If your PC experiences a sudden power outage, BSOD from unrelated hardware issues, or an unexpected shutdown while an optimization session was active:

1. Launch Tikomizer normally.
2. Tikomizer's startup recovery engine automatically detects the persistent journal at:
   `%LOCALAPPDATA%\Tikomizer\recovery_journal.json`
3. A recovery dialog will appear confirming that the baseline Windows power scheme, timer resolution, and process priority configurations have been safely restored.
4. If you wish to trigger an immediate manual reset at any time, click the **Emergency Restore** button located in the top-right corner of the application header.

## Common Diagnostic Situations

### "powercfg returned an error"
- **Cause**: Some OEM Windows laptop images restrict power scheme switching via group policy.
- **Resolution**: Run Tikomizer once as Administrator to allow schema switching, or keep default Balanced profile.

### "Micro-stutters detected in specific game"
- **Cause**: Background game asset streaming or disk thrashing.
- **Resolution**: Check the Live Resource Monitor for memory pressure. Avoid running third-party "RAM flusher" tools simultaneously.

### "Cannot adjust priority for a process"
- **Cause**: The process is protected by Windows kernel access control (e.g., anti-cheat service or system service).
- **Behavior**: This is an intentional safety feature. Tikomizer never tampers with anti-cheat or protected system processes.
