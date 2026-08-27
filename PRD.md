# Product Requirements Document (PRD)

## Project: Windows Network Monitor

### 1. Executive Summary
**Windows Network Monitor** adalah aplikasi desktop modern dan efisien untuk memantau performa dan lalu lintas jaringan secara *real-time* di lingkungan Windows 10/11. Aplikasi ini dirancang untuk bekerja secara lokal 100% tanpa ketergantungan pada layanan cloud atau API berbayar, berbobot ringan, serta mampu berjalan di background / system tray dengan integrasi auto-start Windows.

---

### 2. Target Platform & Environment

- **Target OS**: Windows 10 / Windows 11 (64-bit)
- **Application Type**: Desktop Application
- **Environment & Toolchains**:
  - Node.js & npm
  - Rust 1.98.0 & Cargo 1.98.0
  - Git 2.55.0
  - Visual Studio Build Tools / MSVC x64/x86
  - Windows 11 SDK & CMake tools
  - SQLite
  - IDE: VS Code / Google Antigravity

---

### 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Desktop Shell** | Tauri v2 | Ringan, aman, penggunaan memori minimal dibandingkan Electron |
| **Backend / Native Core** | Rust | Kecepatan tinggi, thread safety, akses native Windows API & socket |
| **Frontend Framework** | React 19 + TypeScript | UI deklaratif, interaktif, type safety |
| **Build Tool & Bundler** | Vite | Kompilasi frontend super cepat dan HMR instan |
| **Local Storage** | SQLite (via Rust backend) | Penyimpanan data historis andal, ringan, dan mandiri |
| **Styling & UI** | Modern CSS / Component Library | Tampilan modern, responsif, dark mode, animasi halus |

---

### 4. Core Features & Functional Requirements

#### 4.1. Real-time Network Monitoring
- **Ping / Latency**: Pengukuran latency berkala ke target yang dapat dikonfigurasi (misal: DNS gateway, 8.8.8.8, 1.1.1.1).
- **Jitter**: Menghitung variasi waktu antar paket ping secara berkelanjutan.
- **Packet Loss**: Mendeteksi persentase paket yang hilang/gagal dalam interval waktu tertentu.
- **Status Jaringan**: Deteksi instan status Online / Offline / Degraded.
- **Bandwidth Traffic**:
  - Kecepatan Download (Rx) secara realtime.
  - Kecepatan Upload (Tx) secara realtime.
- **Network Adapter Information**:
  - Informasi interface aktif (Wi-Fi, Ethernet, VPN).
  - Alamat IP lokal (IPv4/IPv6), MAC address, Gateway, DNS server.
  - Kecepatan tautan (*Link Speed*) dan status koneksi interface.

#### 4.2. Historical Statistics & Data Logging
- Penyimpanan data performa jaringan ke database lokal SQLite.
- Agregasi data (per menit, per jam, harian).
- Visualisasi grafik historis:
  - Grafik tren latency & jitter.
  - Grafik konsumsi bandwidth (Download vs Upload).
  - Log insiden pemutusan koneksi (downtime / disconnect history).
- Fitur ekspor atau pembersihan data lama secara otomatis (retention policy).

#### 4.3. System Tray & Background Execution
- Aplikasi dapat diminimalkan ke **System Tray** (tidak memenuhi taskbar).
- Ikon tray dinamis (menampilkan status koneksi atau tooltip kecepatan).
- Menu konteks tray (Open Dashboard, Toggle Monitoring, Settings, Exit).
- Berjalan di background tanpa membebani CPU/RAM secara berlebihan.

#### 4.4. Windows Auto-Start
- Opsi untuk berjalan otomatis saat Windows booting (*Start with Windows* / Registry run entry via Tauri plugin autostart).
- Opsi *Start Minimized to Tray*.

#### 4.5. Modern Web-based GUI
- Tampilan modern, elegan, clean, dan mendukung Dark/Light mode.
- Chart/grafik interaktif dengan animasi halus.
- Pengaturan kustomisasi (interval polling ping, target host ping, tema, batas notifikasi/alert).

---

### 5. Architectural & Implementation Rules

1. **Fokus Platform**: Utamakan kompatibilitas dan performa optimal di Windows 10/11 terlebih dahulu.
2. **Stack Consistency**: Dilarang mengganti stack tanpa persetujuan eksplisit.
   - ❌ *Jangan gunakan Electron*
   - ❌ *Jangan gunakan Next.js*
   - ✅ *Frontend: React + TypeScript + Vite*
   - ✅ *Backend: Tauri v2 + Rust*
   - ✅ *Database: SQLite*
3. **100% Local & Offline**: Hindari cloud, server eksternal, atau API berbayar. Seluruh komputasi, monitoring, dan penyimpanan data dilakukan di mesin lokal pengguna.
4. **Efisiensi Sumber Daya**: Proses monitoring di Rust harus menggunakan thread pool / asynchronous runtime non-blocking agar tidak membebani penggunaan CPU dan RAM.

---

### 6. Roadmap & Implementation Phases

- **Fase 1: Native Monitoring Engine (Rust)**
  - Pengambilan statistik network interface (traffic Rx/Tx) via Windows API / Sysinfo / Pnet.
  - Modul Ping, Jitter, dan Packet Loss tester.
- **Fase 2: Database & State Management (SQLite + Tauri State)**
  - Skema database SQLite untuk penyimpanan metrik & riwayat insiden.
  - Integrasi Tauri command dan event emitter untuk streaming data ke UI.
- **Fase 3: Frontend Dashboard (React + TypeScript)**
  - Dashboard interaktif dengan gauge chart, bandwidth line charts, dan status panel.
  - Tampilan Adapter Details dan Historical Logs.
- **Fase 4: System Tray & Auto-Start Integration**
  - Konfigurasi system tray, menu, dan background runtime.
  - Autostart plugin setup.
- **Fase 5: Polish, Testing & Packaging**
  - Profiling performa dan konsumsi memori.
  - Build installer / MSI / executable release.
