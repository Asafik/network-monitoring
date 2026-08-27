# 🌐 NetPulse - Windows Network Monitor & Taskbar Speed Meter

<p align="center">
  <b>Ultra-Lightweight, Real-Time Windows Network Monitor, Native Taskbar Speed Meter & Wi-Fi Management Tool</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-0078D6?style=for-the-badge&logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/Backend-Rust%20%2B%20Tauri%20v2-orange?style=for-the-badge&logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Database-SQLite%20(Local%20Offline)-003B57?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Style-TrafficMonitor%20Taskbar%20Dock-10B981?style=for-the-badge" alt="TrafficMonitor" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 📑 Daftar Isi / Table of Contents
- [📖 Penjelasan Aplikasi (Bahasa Indonesia)](#-penjelasan-aplikasi-bahasa-indonesia)
- [📖 English Application Overview](#-english-application-overview)
- [✨ Fitur Unggulan Lengkap / Comprehensive Features](#-fitur-unggulan-lengkap--comprehensive-features)
- [💻 Prasyarat Sistem / Prerequisites](#-prasyarat-sistem--prerequisites)
- [📥 Panduan Instalasi Langkah-demi-Langkah / Installation Guide](#-panduan-instalasi-langkah-demi-langkah--installation-guide)
- [🚀 Cara Menjalankan Aplikasi / How to Run](#-cara-menjalankan-aplikasi--how-to-run)
- [🌐 Mode Web Browser Preview](#-mode-web-browser-preview)
- [🛠️ Panduan Pemecahan Masalah / Troubleshooting Guide](#️-panduan-pemecahan-masalah--troubleshooting-guide)
- [🏛️ Arsitektur & Tech Stack](#️-arsitektur--tech-stack)
- [📁 Struktur Direktori Proyek / Directory Structure](#-struktur-direktori-proyek--directory-structure)
- [📄 Lisensi / License](#-lisensi--license)

---

## 🇮🇩 Penjelasan Aplikasi (Bahasa Indonesia)

**NetPulse Network Monitor** adalah aplikasi pemantau jaringan desktop generasi terbaru untuk **Windows 10 & 11** yang dibangun menggunakan **Rust (Tauri v2)** dan **React 19**. Aplikasi ini dirancang untuk pengguna yang membutuhkan pemantauan kecepatan internet real-time yang akurat, pemutus internet aplikasi per-program (Firewall Kill Switch), intip kata sandi Wi-Fi, uji kecepatan (Speed Test), serta meteran kecepatan yang **menempel langsung di Taskbar Windows ala TrafficMonitor**.

Aplikasi ini berjalan **100% offline secara lokal** dengan konsumsi sumber daya super hemat (**RAM <30MB, CPU <0.3%**) dan menyimpan seluruh histori lalu lintas data ke database lokal **SQLite**.

---

## 🇬🇧 English Application Overview

**NetPulse Network Monitor** is an ultra-lightweight, high-performance network monitoring and management desktop suite for **Windows 10 and 11**. Engineered with **Rust (Tauri v2)** on the backend and **React 19 (TypeScript + Vite)** on the frontend, it delivers real-time per-second bandwidth telemetry, an authentic **TrafficMonitor-style Windows Taskbar Speed Meter**, granular **Per-App Internet Blocking (Win32 & Microsoft Store UWP)**, native ICMP diagnostics, saved Wi-Fi password extraction, and local SQLite data persistence with virtually zero system overhead.

---

## ✨ Fitur Unggulan Lengkap / Comprehensive Features

### 1. ⚡ Native Windows Taskbar Speed Meter (TrafficMonitor Style)
- **Menempel Langsung di Taskbar OS**: Widget mandiri menempel rapi di taskbar Windows 10/11 di sebelah kiri area system tray.
- **Dynamic 410px Clearance**: Penataan posisi dinamis cerdas dengan jarak aman 410px dari sisi kanan layar sehingga **tidak akan pernah menumpuk atau menindih ikon dinamis Windows** (seperti ikon Lokasi `🧭`, Mikrofon, Recording, atau panah tray `^`).
- **Warna Kontras Khas TrafficMonitor**: Warna Oranye/Amber (`↑:`) untuk kecepatan Upload dan Hijau Terang (`↓:`) untuk Download dengan drop-shadow tajam.
- **50ms Anti-Flicker Keeper**: Thread Win32 Z-order menjaga widget **tidak pernah hilang atau berkedip 1 detik pun** saat membuka game berat atau berpindah aplikasi.
- **Dukungan Penuh Snipping Tool**: Dilengkapi konfigurasi Win32 `SetWindowDisplayAffinity(WDA_NONE)` sehingga widget tetap terlihat utuh saat mengambil tangkapan layar (`Win + Shift + S`).
- **Kontrol Interaktif**: Bisa digeser bebas (*drag & drop*), **klik ganda** untuk membuka Dashboard utama, dan **klik kanan** untuk menu cepat (*Snap to Taskbar* & pilihan tema).

### 2. 🛡️ Multi-Vector Application Internet Kill Switch (Pemutus Internet Aplikasi)
- **Dukungan Game Microsoft Store (UWP / AppX)**: Mampu memutus total akses internet game dari Microsoft Store (*seperti Angry Birds 2, dsb.*) menggunakan aturan isolasi `-Package <PackageFamilyName>`.
- **Dukungan Browser & Software PC (Win32)**: Memutus koneksi internet browser (*Brave, Chrome, Edge, Firefox*) dan program desktop (*Steam, Discord, Torrent, Game PC*) dalam 1 kali klik.
- **Zero UI Freeze**: Dieksekusi di background thread asinkron (`tokio::task::spawn_blocking`), sehingga **antarmuka desktop tetap berjalan lancar 60 FPS tanpa ada lag, macet, atau status Not Responding**.
- **Penyimpanan Permanen 3 Lapis (Anti-Reset F5)**: Status pemblokiran (`🔴 Blocked`) tersimpan permanen di `localStorage` browser, SQLite Database lokal, dan mesin Windows Firewall.

### 3. 🚀 Speed Test & Diagnostik Jaringan Lengkap
- **Speed Test Terintegrasi**: Uji kecepatan Download, Upload, Ping, dan Jitter dengan animasi gauge interaktif dan grafik progress real-time.
- **1-Click Quick Diagnostics**: Pemeriksaan kesehatan Gateway, DNS Lokal, Cloudflare (1.1.1.1), Google (8.8.8.8), packet loss, dan MTU secara instan.
- **DNS Benchmark**: Menguji dan membandingkan kecepatan respon latency antar penyedia DNS (Cloudflare, Google DNS, Quad9, OpenDNS, Local DNS).
- **Manual Ping & Traceroute**: Melacak rute koneksi hop-by-hop dan uji ping target server kustom.
- **Flush DNS Cache**: Tombol 1-klik untuk membersihkan dan me-refresh cache DNS Windows.

### 4. 📊 Pemantau Bandwidth & Riwayat Kuota Offline
- **Grafik Gelombang Real-Time**: Visualisasi grafik lalu lintas unduh dan unggah yang diperbarui setiap detik.
- **Skor Kesehatan Jaringan (Network Health 0-100)**: Penilaian otomatis stabilitas koneksi internet.
- **Per-App Bandwidth & Active Sockets**: Memantau konsumsi bandwidth setiap aplikasi yang aktif beserta alamat IP dan port tujuannya.
- **Histori Kuota & Outage Tracker**: Pencatatan riwayat konsumsi data harian, mingguan, bulanan, dan log riwayat internet putus/downtime.

### 5. 🔑 Wi-Fi Password Recovery & Pemindai Sinyal Nirkabel
- **Lihat Password Wi-Fi Tersimpan**: Menampilkan dan menyalin kata sandi jaringan Wi-Fi yang pernah tersambung ke komputer Anda.
- **Pemindai Sinyal Wi-Fi Terdekat**: Memindai seluruh SSID di sekitar lengkap dengan kekuatan sinyal (%), frekuensi band (2.4GHz / 5GHz), channel, dan tipe enkripsi.
- **Deteksi LAN Gigabit**: Menampilkan status dan kecepatan tautan kabel jaringan Ethernet.

---

## 💻 Prasyarat Sistem / Prerequisites

Sebelum menginstal dan menjalankan NetPulse, pastikan perangkat Windows Anda telah terpasang:

| Prasyarat | Versi Minimum | Link Unduhan / Panduan |
|---|---|---|
| **Sistem Operasi** | Windows 10 (Build 19041+) / Windows 11 | Bawaan PC |
| **Node.js & npm** | Node.js v18.0+ atau v20.0+ | [Download Node.js](https://nodejs.org/) |
| **Rust & Cargo** | Rust 1.77+ (Stable) | [Install Rust via rustup](https://rustup.rs/) |
| **C++ Build Tools** | Visual Studio Build Tools 2022 (C++) | [Download Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |
| **WebView2** | Microsoft Edge WebView2 Runtime | [Download WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) *(Sudah bawaan di Win 10/11)* |

---

## 📥 Panduan Instalasi Langkah-demi-Langkah / Installation Guide

### Langkah 1: Clone Repository
Buka terminal (Git Bash, Command Prompt, atau PowerShell) dan clone repository ini:
```bash
git clone https://github.com/Asafik/network-monitoring.git
cd network-monitoring
```

### Langkah 2: Install Dependensi Frontend
Jalankan perintah berikut untuk mengunduh seluruh dependensi React & Vite:
```bash
npm install
```

### Langkah 3: Verifikasi Rust Toolchain
Pastikan kompiler Rust dan Cargo sudah terdeteksi di sistem Anda:
```bash
rustc --version
cargo --version
```

---

## 🚀 Cara Menjalankan Aplikasi / How to Run

> ⚠️ **CATATAN PENTING MENGENAI HAK ADMINISTRATOR**:
> Fitur **Internet Kill Switch (Pemblokiran Aplikasi & Game)** mengendalikan aturan Windows Firewall di tingkat sistem kernel. Oleh karena itu, aplikasi **wajib dijalankan dengan izin Administrator** agar Windows Firewall mengizinkan pemutusan koneksi.

Pilih salah satu cara berikut yang paling nyaman untuk Anda:

### 🌟 Opsi A: 1-Klik Launcher Otomatis (Sangat Direkomendasikan)
1. Buka folder project di File Explorer: `F:\network-monitor` (atau lokasi clone Anda).
2. **Klik kanan file `run-dev-admin.bat`** lalu pilih **`Run as administrator`** *(atau cukup klik ganda)*.
3. Klik **"Yes"** pada jendela konfirmasi Windows UAC.
4. Script akan otomatis menyiapkan whitelist keamanan Windows dan langsung membuka aplikasi desktop beserta meteran taskbar!

---

### 💻 Opsi B: Lewat Terminal (Command Prompt / PowerShell)
Buka terminal Anda di folder project, lalu jalankan perintah:
```bash
# Menjalankan launcher mode administrator
npm run dev:admin

# Atau menjalankan mode Tauri dev standar
npm run tauri:dev
```

---

### 📦 Opsi C: Build File Executable Mandiri (.exe Release)
Jika Anda ingin membuat file binary installer yang bisa langsung dibuka tanpa membuka terminal:
```bash
npm run tauri:build
```
File executable `.exe` hasil build siap pakai akan berada di:
`src-tauri/target/release/network-monitor.exe`

---

## 🌐 Mode Web Browser Preview

NetPulse juga dilengkapi server backend lokal embedded di port `9090`. Anda dapat memantau jaringan langsung lewat browser favorit Anda:
1. Buka browser (Google Chrome, Brave, Microsoft Edge, Firefox).
2. Akses alamat: **`http://localhost:1420`**
3. Seluruh data, grafik, dan status pemblokiran aplikasi akan **tersinkronisasi secara real-time dua arah** dengan aplikasi desktop.

---

## 🛠️ Panduan Pemecahan Masalah / Troubleshooting Guide

### 1. Muncul `os error 4551` (Application Control policy has blocked this file)
* **Penyebab**: Fitur *Smart App Control* di Windows 11 memblokir binary dev yang belum bersertifikat.
* **Solusi**:
  1. Buka **Windows Security** -> pilih menu **`App & browser control`** di sebelah kiri.
  2. Klik **`Smart App Control settings`** lalu ubah ke **`Off`** atau **`Evaluation`**.
  3. Script `run-dev-admin.bat` juga sudah dilengkapi `sign-bin.ps1` untuk otomatis menandatangani (*code signing*) binary secara mandiri.

### 2. Aplikasi Gagal Memblokir Internet Game / Browser
* **Penyebab**: Aplikasi tidak dijalankan dalam mode Administrator sehingga Windows menolak izin `netsh advfirewall`.
* **Solusi**: Jalankan aplikasi melalui **`run-dev-admin.bat` (Run as administrator)** atau buka terminal dengan hak Administrator.

### 3. Jendela Taskbar Menumpuk
* **Solusi**: Sistem sudah dilengkapi jarak aman dinamis **410px**. Anda juga bisa menggeser (*drag & drop*) posisi widget speed meter ke titik mana pun di taskbar sesuai keinginan Anda.

---

## 🏛️ Arsitektur & Tech Stack

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Desktop Shell** | [Tauri v2](https://v2.tauri.app/) | Runtime desktop ultra-ringan berbasis WebView2 & Rust |
| **Backend Core** | [Rust](https://www.rust-lang.org/) | Multi-threaded async engine (`tokio`, `sysinfo`, `rusqlite`, `winping`) |
| **Frontend Framework** | [React 19](https://react.dev/) | React 19 dengan hooks modern dan concurrent rendering |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Type-safe contract antara frontend dan backend IPC |
| **Build Tooling** | [Vite 7](https://vitejs.dev/) | Hot Module Replacement (HMR) super cepat |
| **Database** | [SQLite](https://sqlite.org/) | Database embedded lokal offline (`network_monitor.db`) |
| **Taskbar Hook** | Win32 API (`user32.dll`) | Z-order topmost keeper, dynamic clearance, dan display affinity |

---

## 📁 Struktur Direktori Proyek / Directory Structure

```
network-monitoring/
├── src-tauri/                     # Backend Rust (Tauri v2)
│   ├── src/
│   │   ├── main.rs                # Entrypoint & konfigurasi akselerasi GPU
│   │   ├── lib.rs                 # Lifecycle Tauri, Tray icon, commands & monitoring loop
│   │   ├── taskbar_dock.rs        # Win32 taskbar docking, clearance 410px & topmost keeper
│   │   ├── app_blocker.rs         # Engine pemutus internet Windows Firewall (Win32 & AppX)
│   │   ├── app_bandwidth.rs       # Pemindai proses aktif & konsumsi data per-aplikasi
│   │   ├── diagnostics_tools.rs   # Speed test, ping manual, traceroute, DNS benchmark
│   │   ├── monitor.rs             # Pengumpul metrik bandwidth & ICMP latency
│   │   ├── wifi.rs                # Pemindai sinyal Wi-Fi & ekstraksi password tersimpan
│   │   ├── db.rs                  # Schema SQLite & persistensi riwayat kuota/outage
│   │   └── server.rs              # Embedded HTTP API Server (port 9090)
│   ├── Cargo.toml                 # Dependensi Rust crate
│   ├── build.rs                   # Script build Rust
│   └── tauri.conf.json            # Konfigurasi multi-window & Taskbar Widget
├── src/                           # Frontend React 19 + TypeScript
│   ├── components/                # Sidebar navigasi, AppIcon, dan kartu ringkasan
│   ├── views/                     # StandaloneWidget (Taskbar), Dashboard, Apps, SpeedTest, Diagnostics, Adapters, History
│   ├── types/                     # TypeScript data contracts (NetworkMetrics, AppBandwidthItem)
│   ├── utils/                     # Formatter satuan (B/s, KB/s, MB/s, GB)
│   ├── main.tsx                   # Dual router (Dashboard window vs Standalone Taskbar Meter)
│   ├── App.tsx                    # State coordinator & IPC event listener
│   └── App.css                    # Styling, glassmorphism & animasi keyframes
├── run-dev-admin.bat              # 1-Klik Administrator Launcher (Anti-Flicker)
├── sign-bin.ps1                   # Script otomatis Authenticode Code Signing
├── package.json                   # Dependensi npm & script eksekusi
└── README.md                      # Dokumentasi komprehensif proyek
```

---

## 📄 Lisensi / License
Proyek ini bersifat terbuka (*open-source*) dan dirilis di bawah lisensi resmi [MIT License](LICENSE). Bebas digunakan, dimodifikasi, dan didistribusikan.
