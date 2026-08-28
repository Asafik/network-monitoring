$releaseDir = "F:\network-monitor\release-package"
if (Test-Path $releaseDir) { Remove-Item $releaseDir -Recurse -Force }
New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

Copy-Item "F:\network-monitor\NetSpeedX.exe" -Destination "$releaseDir\NetSpeedX.exe" -Force

$readmeContent = @"
========================================================================
   NETSPEEDX - WINDOWS NETWORK MONITOR & TASKBAR SPEED METER (v1.0.0)
========================================================================

Aplikasi pemantau kecepatan internet desktop Windows, meteran kecepatan
taskbar (TrafficMonitor Style), dan pemutus internet aplikasi (Kill Switch).

CARA MENGGUNAKAN (SANGAT MUDAH):
--------------------------------
1. Cukup KLIK GANDA file 'NetSpeedX.exe' untuk langsung menjalankan aplikasi!
2. Kecepatan internet (Upload & Download) akan langsung muncul di taskbar
   sebelah kanan di samping jam.
3. Klik ganda pada angka kecepatan di taskbar untuk membuka Dashboard utama.
4. Di menu Settings, Anda bisa mengatur jarak offset taskbar (Kompak/Standar/Lebar)
   agar pas dan tidak menimpa ikon tray laptop/PC Anda!
5. (Opsional) Untuk menggunakan fitur Blokir Internet Aplikasi & intip password Wi-Fi,
   klik kanan 'NetSpeedX.exe' lalu pilih 'Run as administrator'.

FITUR UTAMA:
------------
- Taskbar Speed Meter (Menempel di samping jam seperti TrafficMonitor)
- Dynamic Taskbar Offset (Bisa disesuaikan untuk laptop & PC apa pun)
- Multi-Vector Internet Kill Switch (Blokir internet Chrome, Steam, Game, dll)
- Speed Test & Diagnostik Jaringan 1-Klik
- Web Dashboard di browser PC / HP (http://localhost:9090)
- Catatan Riwayat Kuota Offline di database lokal SQLite
- Super Ringan (Hanya ~10 MB RAM, <0.3% CPU)

Pengembang: Asafik Daroini
Repository: https://github.com/Asafik/network-monitoring
Lisensi: MIT License
"@

Set-Content -Path "$releaseDir\PANDUAN_CARA_PAKAI.txt" -Value $readmeContent -Encoding UTF8

$zipPath = "F:\network-monitor\NetSpeedX-v1.0.0-Portable-x64.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path "$releaseDir\*" -DestinationPath $zipPath -Force
Remove-Item $releaseDir -Recurse -Force
Write-Host "Portable ZIP created successfully at: $zipPath"
