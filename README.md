# 🌐 NetPulse - Windows Network Monitor & Taskbar Speed Meter

<p align="center">
  <b>Ultra-Lightweight, Real-Time Windows Network Monitor, Native Taskbar Speed Meter & Wi-Fi Management Tool</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-0078D6?style=flat-square&logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/Backend-Rust%20%2B%20Tauri%20v2-orange?style=flat-square&logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Database-SQLite%20(Local%20Offline)-003B57?style=flat-square&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Style-TrafficMonitor%20Taskbar%20Dock-10B981?style=flat-square" alt="TrafficMonitor" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## 📖 English Overview

**NetPulse Network Monitor** is a state-of-the-art, high-performance desktop application for Windows 10 and 11. Built with **Rust (Tauri v2)** and **React 19**, it provides real-time per-second bandwidth tracking, an authentic **TrafficMonitor-style Windows Taskbar Speed Meter**, granular **Per-App Internet Blocking**, native ICMP latency diagnostics, and local SQLite history persistence with an ultra-low CPU (<0.3%) and RAM footprint (<30MB).

---

## ✨ Key Features

### 1. ⚡ Native Windows Taskbar Speed Meter (TrafficMonitor Style)
- **Direct OS Taskbar Docking**: Seamlessly sits directly on the Windows 10/11 taskbar next to the system tray (`^` chevron).
- **Authentic Traffic Colors**: Orange/Amber (`↑:`) for Upload and Lime Green (`↓:`) for Download with crisp anti-aliased font and drop-shadows.
- **Zero-Latency Anti-Flicker Keeper**: 50ms Win32 Z-order thread ensures the widget **never disappears or flickers**, even when launching heavy games, opening fullscreen apps, or switching windows.
- **Full Screenshot & Snipping Tool Support**: Configured via `SetWindowDisplayAffinity(WDA_NONE)` so the widget is captured accurately during `Win + Shift + S` snips.
- **Interactive Controls**: Freely drag anywhere along the taskbar, **double-click** to open the main dashboard, or **right-click** for quick options like *Snap to Taskbar* or *Theme Switch*.

### 2. 🛡️ Application Internet Blocker (Firewall Cut-Off)
- **One-Click Internet Cut-Off**: Cut off internet access for specific installed Windows applications (.exe) using native Windows Firewall rules (`netsh advfirewall firewall`).
- **Installed Applications Discovery**: Scans installed applications from registry and common paths for easy 1-click management.
- **Active Block List**: View and unblock apps anytime with instant system notification feedback.

### 3. 🚀 Speed Test & Advanced Diagnostics Suite
- **Built-in Speed Test**: Test download speed, upload speed, ping, and jitter with live progress animation.
- **1-Click Quick Diagnostics**: Instant health checks on Default Gateway, Local DNS, Cloudflare (1.1.1.1), Google (8.8.8.8), packet loss, and MTU.
- **DNS Benchmark**: Compare latency across Cloudflare, Google DNS, Quad9, OpenDNS, and Local DNS.
- **Manual Ping & Traceroute**: Hop-by-hop route diagnostics and customizable ping test targets.
- **Flush DNS Cache**: Instant DNS cache purge utility with single-click execution.

### 4. 📊 Live Bandwidth & Historical Tracking
- **Real-Time Waveform Chart**: Live bandwidth visualization updating every second.
- **Network Health Score**: Instant rating (0-100) analyzing ping, jitter, and packet loss stability.
- **Per-App Bandwidth & Active Sessions**: Monitor active process connections, remote addresses, and ports.
- **Data Quota & Outage Tracker**: Daily, weekly, and monthly data consumption tracking alongside outage log history.

### 5. 🔑 Wi-Fi Password Recovery & Wireless Scanner
- **Saved Wi-Fi Password Viewer**: Reveal and copy passwords for any Wi-Fi network previously connected to your PC.
- **Wireless Signal Scanner**: Scan nearby Wi-Fi SSIDs with signal strength (%), frequency band (2.4GHz / 5GHz), channel, and encryption type.
- **Ethernet Gigabit Detection**: Detects wired LAN status and link speeds automatically.

### 6. 🪟 Desktop Integration & Local API Sync
- **System Tray Integration**: Minimize to tray on close (X) for continuous background monitoring.
- **Embedded API Server (`127.0.0.1:9090`)**: Access metrics and sync live data across desktop and browser tabs.

---

## 🇮🇩 Ringkasan Fitur (Bahasa Indonesia)

- ⚡ **Speed Meter Taskbar ala TrafficMonitor**: Menempel langsung di taskbar Windows 11 sebelah ikon tray (`^`), warna oranye (`↑:`) & hijau (`↓:`), anti-hilang saat buka aplikasi lain, dan ikut tertangkap saat screenshot (`Win+Shift+S`).
- 🛡️ **Pemutus Internet Aplikasi (App Blocker)**: Memutus koneksi internet aplikasi tertentu secara instan lewat Windows Firewall asli.
- 🚀 **Speed Test & Diagnostik Lengkap**: Uji kecepatan unduh/unggah, benchmark DNS (Cloudflare vs Google vs Quad9), ping manual, traceroute, dan tombol Flush DNS.
- 🔑 **Intip Password Wi-Fi**: Menampilkan dan menyalin kata sandi semua jaringan Wi-Fi yang tersimpan di Windows.
- 📡 **Pemindai Sinyal Wi-Fi**: Mendeteksi sinyal Wi-Fi di sekitar lengkap dengan persentase sinyal (%), frekuensi 2.4/5GHz, dan tipe keamanan.
- 💾 **100% Offline & Ringan**: Database SQLite lokal tanpa koneksi cloud, konsumsi RAM <30MB, dan CPU <0.3%.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Desktop Framework** | [Tauri v2](https://v2.tauri.app/) |
| **Backend Core** | [Rust](https://www.rust-lang.org/) (`sysinfo`, `rusqlite`, `winping`, `windows-sys`) |
| **Frontend UI** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Database** | [SQLite](https://sqlite.org/) (Embedded local offline database) |
| **Styling** | Vanilla CSS (GPU-Accelerated, High-DPI optimized) |

---

## 📥 Installation & Setup

### 1. Prerequisites
- **Node.js** (v18 or newer): [Download Node.js](https://nodejs.org/)
- **Rust & Cargo**: [Install Rust via rustup](https://rustup.rs/)
- **Visual Studio C++ Build Tools**: [Download Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

### 2. Clone Repository
```bash
git clone https://github.com/Asafik/network-monitoring.git
cd network-monitoring
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run in Development Mode
```bash
npm run tauri dev
```

### 5. Build Standalone Release (.exe)
```bash
npm run tauri build
```
The compiled executable will be located at:
`src-tauri/target/release/network-monitor.exe`

---

## 📁 Project Structure

```
network-monitoring/
├── src-tauri/                 # Rust Native Backend
│   ├── src/
│   │   ├── main.rs            # Entrypoint & GPU acceleration configuration
│   │   ├── lib.rs             # Tauri lifecycle, Tray, commands & monitoring loop
│   │   ├── taskbar_dock.rs    # Win32 taskbar hook, positioning & topmost keeper
│   │   ├── app_blocker.rs     # Windows Firewall application blocker engine
│   │   ├── diagnostics_tools.rs # Speed test, ping, traceroute, DNS benchmark
│   │   ├── monitor.rs         # sysinfo bandwidth & ICMP latency engine
│   │   ├── wifi.rs            # WLAN interfaces, nearby scanner & passwords
│   │   ├── db.rs              # SQLite database schema & queries
│   │   └── server.rs          # Local embedded HTTP server (port 9090)
│   ├── Cargo.toml             # Rust dependencies
│   └── tauri.conf.json        # Multi-window & taskbar widget configuration
├── src/                       # Frontend React 19 Application
│   ├── components/            # Sidebar, Icons, and reusable UI widgets
│   ├── views/                 # StandaloneWidget, Dashboard, SpeedTest, Diagnostics, Apps, Adapters, History, Settings
│   ├── types/                 # TypeScript interfaces and data models
│   ├── utils/                 # Unit formatters (Bps, KB/s, MB/s)
│   ├── main.tsx               # Dual router (Dashboard vs Native Taskbar Widget)
│   ├── App.tsx                # Main state & IPC event coordinator
│   └── index.css              # Design tokens & typography
├── package.json               # Node.js dependencies & scripts
└── README.md                  # Project documentation
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
