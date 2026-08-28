@echo off
title NetPulse Windows Network Monitor
cd /d "%~dp0"

:: 1. Cek file NetPulse.exe utama di folder root
if exist "NetPulse.exe" (
    start "" "NetPulse.exe"
    exit
)

:: 2. Fallback ke target release / debug jika ada
if exist "src-tauri\target\release\network-monitor.exe" (
    start "" "src-tauri\target\release\network-monitor.exe"
    exit
)

if exist "src-tauri\target\debug\network-monitor.exe" (
    start "" "src-tauri\target\debug\network-monitor.exe"
    exit
)

echo File NetPulse.exe belum ditemukan.
pause

