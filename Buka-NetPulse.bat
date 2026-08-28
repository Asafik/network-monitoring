@echo off
title NetPulse Windows Network Monitor
cd /d "%~dp0"

:: 1. Jalankan versi rilis terbaru
if exist "src-tauri\target\release\network-monitor.exe" (
    start "" "src-tauri\target\release\network-monitor.exe"
    exit
)

:: 2. Cek file NetPulse.exe jika ada
if exist "NetPulse.exe" (
    start "" "NetPulse.exe"
    exit
)

if exist "src-tauri\target\debug\network-monitor.exe" (
    start "" "src-tauri\target\debug\network-monitor.exe"
    exit
)

echo File NetPulse belum ditemukan.
pause


