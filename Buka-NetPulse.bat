@echo off
title NetPulse Windows Network Monitor
cd /d "%~dp0"

:: Jalankan langsung file executable release (.exe) standalone
if exist "src-tauri\target\release\network-monitor.exe" (
    start "" "src-tauri\target\release\network-monitor.exe"
    exit
)

if exist "src-tauri\target\debug\network-monitor.exe" (
    start "" "src-tauri\target\debug\network-monitor.exe"
    exit
)

echo File executable belum ditemukan. Silakan build terlebih dahulu.
pause
