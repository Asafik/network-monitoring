@echo off
title NetPulse Windows Network Monitor - Admin Launcher

:: 1. Explicitly switch to drive F: and project directory
f:
cd "F:\network-monitor"

echo ========================================================
echo   NetPulse Windows Network Monitor (Administrator Mode)
echo ========================================================
echo Direktori Aktif: %CD%
echo.

:: 2. Auto-whitelist folder & Auto-sign executable
echo [1/2] Menyiapkan izin keamanan Windows Security...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-MpPreference -ExclusionPath 'F:\network-monitor' -ErrorAction SilentlyContinue; & 'F:\network-monitor\sign-bin.ps1' -ErrorAction SilentlyContinue"

:: 3. Execute Tauri Dev with CALL so the window stays open
echo [2/2] Menjalankan NetPulse Desktop App...
echo.
call npm run tauri dev

echo.
echo ========================================================
echo   Aplikasi telah berhenti.
echo ========================================================
pause
