# 🌐 NetPulse - Windows Network Monitor

<p align="center">
  <b>Ultra-Lightweight, Real-time Windows Network Traffic, Latency & Wi-Fi Password Manager</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-0078D6?style=flat-square&logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/Backend-Rust%20%2B%20Tauri%20v2-orange?style=flat-square&logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Database-SQLite%20(Local%20Offline)-003B57?style=flat-square&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## 📖 English Overview

**NetPulse Network Monitor** is a modern, high-performance, and ultra-lightweight desktop application built for Windows 10 and 11. Powered by **Tauri v2** and **Rust**, it delivers real-time per-second bandwidth tracking, native ICMP ping latency & jitter analysis, saved Wi-Fi password recovery, and local SQLite history persistence with minimal CPU (<0.3%) and RAM (<30MB) footprint.

### ✨ Key Features (English)
- 🚀 **Real-Time Bandwidth Tracking**: Native download and upload speed monitoring with live traffic waveform charts.
- ⚡ **Native ICMP Ping & Jitter**: Direct kernel pinging with jitter calculation and packet loss detection.
- 🔑 **Wi-Fi Password Recovery**: View and copy saved passwords for all Wi-Fi networks ever connected to the machine.
- 📡 **Nearby Wireless Scanner**: Detects available Wi-Fi signals in range with signal bars (%), band (2.4/5GHz), and security type.
- 🔌 **Gigabit Wired LAN Detection**: Automatic switching and link speed detection when connected via Ethernet.
- 💾 **100% Offline SQLite Database**: Persistent performance metrics and incident logs stored locally in `network_monitor.db`.
- 🪟 **System Tray & Close-to-Hide**: Clicking the close (X) button minimizes the app to the Windows System Tray with quick background access.
- 🎮 **Hardware GPU Acceleration**: DirectComposition GPU rasterization synchronized to native monitor refresh rates (60Hz, 144Hz, 240Hz).
- 🔄 **Web & Desktop Synchronization**: Embedded local API server (`127.0.0.1:9090`) allows web browser tabs (`localhost:1420`) to display identical real-time Windows metrics.

---

## 🇮🇩 Ringkasan Bahasa Indonesia

**NetPulse Network Monitor** adalah aplikasi pemantau jaringan Windows yang sangat ringan, modern, dan berkinerja tinggi. Dibangun menggunakan **Tauri v2** dan **Rust**, aplikasi ini menyediakan pemantauan bandwidth per detik, latency ping & jitter ICMP asli Windows, fitur intip password Wi-Fi yang pernah tersambung, dan penyimpanan database SQLite lokal yang 100% offline tanpa cloud.

### ✨ Fitur Utama (Bahasa Indonesia)
- 🚀 **Pemantauan Bandwidth Realtime**: Grafik gelombang lalu lintas kecepatan Download & Upload asli per detik.
- ⚡ **Pengukuran Ping, Jitter & Packet Loss**: Menggunakan API ICMP native Windows dengan perhitungan jitter otomatis.
- 🔑 **Pengelola & Pemulih Password Wi-Fi**: Menampilkan dan menyalin (*copy*) password untuk semua Wi-Fi yang pernah tersambung di laptop/PC Anda.
- 📡 **Pemindai Sinyal Wi-Fi Sekitar**: Mendeteksi sinyal Wi-Fi di sekitar dengan persentase sinyal (%), frekuensi (2.4/5 GHz), channel, dan tipe keamanan.
- 🔌 **Deteksi Kabel LAN / Ethernet**: Otomatis mendeteksi koneksi kabel dengan kecepatan port Gigabit 1000 Mbps.
- 💾 **Database Lokal SQLite**: Menyimpan seluruh riwayat performa jaringan dan catatan insiden secara aman di `network_monitor.db`.
- 🪟 **Jalan di Belakang Layar (System Tray)**: Tombol X menyembunyikan aplikasi ke System Tray Windows tanpa menutup aplikasi.
- 🎮 **Akselerasi Penuh GPU Direct3D**: Tampilan sangat mulus (*ultra-smooth*) mengikuti refresh rate monitor Anda (60Hz, 120Hz, 144Hz, 240Hz).
- 🔄 **Sinkronisasi Web & Desktop**: Server API lokal bawaan (`127.0.0.1:9090`) menyinkronkan data riil ke browser secara instan.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Desktop Shell** | [Tauri v2](https://v2.tauri.app/) |
| **Backend Core** | [Rust](https://www.rust-lang.org/) (`sysinfo`, `rusqlite`, `winping`, `chrono`) |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler / Dev Server** | [Vite](https://vitejs.dev/) |
| **Database** | [SQLite](https://sqlite.org/) (Embedded local storage) |
| **Styling** | Vanilla Modern CSS (Light Theme, GPU-Accelerated) |

---

## 📥 Installation & Setup (Panduan Instalasi)

### 1. Prerequisites (Persyaratan Sistem)
Make sure you have the following installed on your Windows machine:
- **Node.js** (v18 or newer): [Download Node.js](https://nodejs.org/)
- **Rust & Cargo**: [Install Rust via rustup](https://rustup.rs/)
- **Visual Studio C++ Build Tools** (Required by Rust on Windows): [Download Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

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
To run the full native desktop app with hot-reload:
```bash
npm run tauri dev
```

To run only the web interface preview in your browser:
```bash
npm run dev
```
*(Open `http://localhost:1420` in your browser)*

### 5. Build for Production (.exe Installer)
To compile a standalone Windows installer (`.msi` / `.exe`):
```bash
npm run tauri build
```
The compiled release executable will be available at:
`src-tauri/target/release/network-monitor.exe`

---

## 📁 Project Structure

```
network-monitoring/
├── src-tauri/                 # Rust Native Backend
│   ├── src/
│   │   ├── main.rs            # Application entrypoint & GPU flags
│   │   ├── lib.rs             # Tauri lifecycle, Tray, commands & loop
│   │   ├── monitor.rs         # sysinfo bandwidth & winping latency engine
│   │   ├── wifi.rs            # WLAN interfaces, nearby scanner & passwords
│   │   ├── db.rs              # SQLite database schema & queries
│   │   └── server.rs          # Local embedded HTTP server (port 9090)
│   ├── Cargo.toml             # Rust dependencies
│   └── tauri.conf.json        # Tauri window & bundle configuration
├── src/                       # Frontend React 19 Application
│   ├── components/            # Sidebar, Icons, and reusable widgets
│   ├── views/                 # Dashboard, Adapters, History, Diagnostics, Settings
│   ├── types/                 # TypeScript interfaces and data models
│   ├── utils/                 # Unit formatters (Bps, KB/s, MB/s)
│   ├── App.tsx                # Main state & IPC event coordinator
│   ├── App.css                # Component styling & layout
│   └── index.css              # Design tokens & global typography
├── PRD.md                     # Product Requirements Document
├── package.json               # Node.js dependencies & scripts
└── README.md                  # Project documentation
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
