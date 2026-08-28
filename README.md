# 🌐 NetSpeedX - Windows Network Monitor & Taskbar Speed Meter

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011%20(64--bit)-0078D6?style=for-the-badge&logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/Backend-Rust%20%2B%20Tauri%20v2-orange?style=for-the-badge&logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Database-SQLite%20(Local%20Offline)-003B57?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Style-TrafficMonitor%20Taskbar%20Dock-10B981?style=for-the-badge" alt="TrafficMonitor" />
  <img src="https://img.shields.io/badge/Resource-CPU%20%3C0.3%25%20%7C%20RAM%20%7E10MB-blueviolet?style=for-the-badge" alt="Resource" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <b>Aplikasi Pemantau Kecepatan Internet Desktop Windows Modern, Ultra-Ringan, Hemat Daya, dengan Meteran Kecepatan Menempel di Taskbar (TrafficMonitor Style), Pemutus Internet Aplikasi (Firewall Kill Switch), Diagnostik Jaringan, dan Web Dashboard Lokal.</b>
</p>

---

## 📑 Daftar Isi / Table of Contents
1. [📖 Tentang Aplikasi NetSpeedX](#-tentang-aplikasi-netspeedx)
2. [✨ Fitur-Fitur Unggulan](#-fitur-fitur-unggulan)
3. [🎯 Panduan Lengkap Cara Pakai (User Guide)](#-panduan-lengkap-cara-pakai-user-guide)
   - [1. Cara Membuka & Menjalankan Aplikasi](#1-cara-membuka--menjalankan-aplikasi)
   - [2. Menggunakan Taskbar Speed Meter (Di Samping Jam)](#2-menggunakan-taskbar-speed-meter-di-samping-jam)
   - [3. Memutus / Mengizinkan Internet Aplikasi (Kill Switch)](#3-memutus--mengizinkan-internet-aplikasi-kill-switch)
   - [4. Membuka Web Dashboard di Browser & HP / Tablet](#4-membuka-web-dashboard-di-browser--hp--tablet)
   - [5. Melakukan Speed Test & Diagnostik Jaringan](#5-melakukan-speed-test--diagnostik-jaringan)
   - [6. Melihat Password Wi-Fi & Riwayat Kuota](#6-melihat-password-wi-fi--riwayat-kuota)
   - [7. Pengaturan Auto-Start Saat PC Menyala (Boot)](#7-pengaturan-auto-start-saat-pc-menyala-boot)
4. [🛠️ Panduan Instalasi & Build dari Source Code (Developer)](#️-panduan-instalasi--build-dari-source-code-developer)
5. [💡 Solusi Kendala / Troubleshooting](#-solusi-kendala--troubleshooting)
6. [🏛️ Arsitektur & Teknologi](#️-arsitektur--teknologi)
7. [📁 Struktur Direktori Proyek](#-struktur-direktori-proyek)
8. [📄 Lisensi](#-lisensi)

---

## 📖 Tentang Aplikasi NetSpeedX

**NetSpeedX** adalah aplikasi pemantau dan pengelola jaringan desktop generasi terbaru untuk **Windows 10 & Windows 11 (64-bit)**. Dibangun dari nol menggunakan kombinasi arsitektur **Rust (Tauri v2)** pada backend dan **React 19 (TypeScript + Vite)** pada frontend, NetSpeedX menggabungkan performa sistem native yang sangat kencang dengan antarmuka modern yang memukau.

### Mengapa NetSpeedX Berbeda?
- 🪶 **Ultra-Ringan & Hemat Baterai**: Hanya menggunakan **~10 MB RAM** dan **<0.3% CPU**, jauh lebih ringan dibanding aplikasi monitoring berbasis Electron biasa.
- 📌 **Native Taskbar Speed Meter**: Angka kecepatan unduh dan unggah menempel langsung di Taskbar Windows (di samping jam/tray) seperti *TrafficMonitor* legendaris.
- 🎛️ **Jarak Posisi Dinamis (Taskbar Offset Slider)**: Pengaturan jarak offset yang fleksibel sehingga pas untuk layar laptop dengan sedikit ikon tray maupun PC dengan banyak ikon tray tanpa menimpa ikon sistem Windows.
- 🔒 **100% Offline & Privasi Terjaga**: Seluruh pencatatan kuota disimpan secara lokal di database **SQLite** (`network_monitor.db`). Tidak ada data atau riwayat internet yang dikirim keluar ke server cloud mana pun.
- 🛡️ **Firewall Kill Switch Multi-Vector**: Mampu memblokir akses internet software desktop (.exe) maupun Game Microsoft Store (UWP/AppX) secara instan tanpa membuat komputer freeze atau lag.
- 📱 **Embedded Web Dashboard**: Pantau bandwidth PC Anda langsung dari browser di laptop lain, smartphone, atau tablet melalui jaringan Wi-Fi lokal.

---

## ✨ Fitur-Fitur Unggulan

### 1. ⚡ Taskbar Speed Meter (TrafficMonitor Native Style)
- **Menempel Sempurna di Taskbar**: Menampilkan kecepatan upload (`↑`) dan download (`↓`) secara real-time setiap detik.
- **Anti-Flicker & Persisten**: Terikat langsung ke window Taskbar Windows (`Shell_TrayWnd`), sehingga **tidak akan pernah hilang atau berkedip saat Anda membuka Start Menu atau Search Windows**.
- **Jarak Posisi Bisa Disesuaikan (Custom Offset Slider)**: Dilengkapi slider dan tombol preset (Kompak Laptop 200px / Standar 280px / Lebar 410px) di menu Settings agar meteran tidak menimpa ikon tray Windows.
- **Dukungan Screenshot Penuh**: Dapat ditangkap secara sempurna saat Anda mengambil screenshot dengan tombol `Win + Shift + S` (Snipping Tool).
- **Interaksi Fleksibel**: Klik ganda untuk membuka jendela Dashboard utama, klik kanan untuk menu cepat tema & snap posisi.

### 2. 🛡️ Multi-Vector Internet Kill Switch (Pemutus Internet Aplikasi)
- **Aplikasi Desktop (Win32)**: Putus koneksi internet Browser (Chrome, Brave, Edge, Firefox), Discord, Steam, Torrent, game, atau software apa pun dalam 1-klik.
- **Game & Aplikasi Microsoft Store (UWP / AppX)**: Mendukung pemutusan internet game dari Microsoft Store (*seperti Angry Birds 2, Roblox, Minecraft, dsb.*) menggunakan isolasi Package Family Name.
- **Zero UI Freeze**: Eksekusi aturan Windows Firewall berjalan di background thread asinkron (`tokio::task::spawn_blocking`), sehingga antarmuka tetap mulus 60 FPS tanpa macet atau status *Not Responding*.
- **Penyimpanan Permanen 3 Lapis**: Status pemblokiran tersimpan aman di database SQLite, localStorage, dan Windows Firewall Engine (tetap aktif meski PC direstart).

### 3. 🚀 Speed Test & Diagnostik Jaringan Komprehensif
- **Speed Test Akurat**: Pengujian kecepatan Download, Upload, Ping, dan Jitter dengan animasi gauge interaktif.
- **1-Click Quick Diagnostics**: Pemeriksaan instan status Gateway, DNS Lokal, Cloudflare (1.1.1.1), Google DNS (8.8.8.8), MTU, dan Packet Loss.
- **DNS Benchmark**: Bandingkan performa kecepatan respon antara Cloudflare, Google DNS, Quad9, OpenDNS, dan DNS lokal ISP Anda.
- **Ping & Traceroute Manual**: Uji latency ke alamat server atau website kustom dan lacak jalur routing hop-by-hop.
- **Flush DNS Cache**: Bersihkan cache DNS Windows hanya dengan satu kali klik untuk mengatasi masalah internet ngadat.

### 4. 📊 Analisis Bandwidth & Database Riwayat Kuota
- **Grafik Gelombang Real-Time**: Visualisasi grafik lalu lintas unduh dan unggah yang diperbarui setiap detik.
- **Skor Kesehatan Jaringan (0–100)**: Indikator cerdas yang mengukur stabilitas dan kualitas koneksi internet Anda.
- **Per-App Traffic & Active Sockets**: Lihat aplikasi apa saja yang sedang menyedot kuota internet beserta alamat IP dan port tujuannya.
- **Histori Pemakaian Kuota & Outage Tracker**: Rekapitulasi pemakaian data harian, mingguan, bulanan, serta pencatatan otomatis saat internet sempat terputus (downtime).

### 5. 🔑 Wi-Fi Password Recovery & Pemindai Sinyal
- **Lihat Password Wi-Fi Tersimpan**: Menampilkan dan menyalin kata sandi jaringan Wi-Fi yang pernah terhubung ke PC Anda.
- **Pemindai Wi-Fi Terdekat**: Memindai seluruh sinyal Wi-Fi di sekitar lengkap dengan kekuatan sinyal (%), frekuensi band (2.4GHz / 5GHz), channel, dan tipe enkripsi.
- **Deteksi LAN Adapter**: Menampilkan status koneksi kabel LAN Ethernet dan kecepatan bandwidth antarmuka.

### 6. 🌐 Embedded Web Dashboard (Port 9090)
- NetSpeedX memiliki server web lokal terintegrasi. Anda bisa membuka dashboard pemantauan jaringan di browser desktop atau browser smartphone/tablet yang terhubung pada jaringan Wi-Fi yang sama.

---

## 🎯 Panduan Lengkap Cara Pakai (User Guide)

### 1. Cara Membuka & Menjalankan Aplikasi
- **Buka Langsung**: Cukup klik ganda file **`NetSpeedX.exe`** di folder aplikasi.
- **Mode Administrator**: Untuk menggunakan fitur blokir firewall aplikasi dan melihat password Wi-Fi, klik kanan `NetSpeedX.exe` ➡️ pilih **"Run as administrator"**.

---

### 2. Menggunakan Taskbar Speed Meter (Di Samping Jam)
Saat NetSpeedX berjalan, meteran kecepatan akan otomatis muncul di taskbar pojok kanan bawah:
- **Warna Oranye (`↑:`)**: Menunjukkan kecepatan internet **Upload** saat ini.
- **Warna Hijau (`↓:`)**: Menunjukkan kecepatan internet **Download** saat ini.
- **Buka Dashboard**: **Klik ganda (Double Click)** pada angka kecepatan untuk langsung membuka jendela utama NetSpeedX.
- **Atur Jarak Posisi**: Masuk ke menu **Settings** ➡️ geser slider **Jarak Posisi Taskbar** (misal 200px untuk laptop atau 280px untuk PC) agar pas di samping ikon tray Anda.
- **Klik Kanan pada Meteran**: Untuk memunculkan menu cepat (Pilihan Tema, Snap to Taskbar, dsb.).

---

### 3. Memutus / Mengizinkan Internet Aplikasi (Kill Switch)
1. Buka jendela utama NetSpeedX ➡️ Masuk ke menu **"Aplikasi" (App Traffic)** di sidebar kiri.
2. Di daftar aplikasi yang sedang aktif menggunakan internet, cari aplikasi atau game yang ingin Anda putus koneksinya.
3. Klik tombol **"Blokir Internet"** (berwarna merah).
4. Status akan berubah menjadi **🔴 Terblokir**. Aplikasi tersebut tidak akan bisa mengakses internet sama sekali sampai Anda mengklik tombol **"Buka Blokir"** (berwarna hijau).

---

### 4. Membuka Web Dashboard di Browser & HP / Tablet
1. Pastikan NetSpeedX sedang aktif di PC Anda.
2. **Di Komputer yang Sama**:
   - Buka browser (Chrome / Edge / Firefox) ➡️ Buka alamat: **`http://localhost:9090`**
   - Atau klik tombol **"Buka Web Monitor"** di pojok kanan atas jendela NetSpeedX / dari menu klik kanan ikon tray.
3. **Dari HP / Tablet (Jaringan Wi-Fi yang Sama)**:
   - Cek alamat IP lokal PC Anda (contoh: `192.168.1.15`).
   - Buka browser di HP Anda lalu ketik: **`http://192.168.1.15:9090`**
   - Anda sekarang bisa memantau kecepatan internet PC Anda secara remote dari HP!

---

### 5. Melakukan Speed Test & Diagnostik Jaringan
1. Masuk ke menu **"Speed Test"** di sidebar.
2. Klik tombol **"Mulai Speed Test"** untuk menguji kecepatan Download, Upload, Ping, dan Jitter secara real-time.
3. Masuk ke menu **"Diagnostik"** untuk melakukan:
   - **Quick Diagnostic (1-Klik)**: Memeriksa kesehatan gateway, DNS Cloudflare, Google, dan packet loss.
   - **DNS Benchmark**: Menguji server DNS mana yang paling cepat untuk koneksi Anda.
   - **Flush DNS**: Membersihkan cache DNS jika ada website yang tidak bisa dibuka.
   - **Manual Ping / Traceroute**: Memeriksa kestabilan rute koneksi ke website tertentu.

---

### 6. Melihat Password Wi-Fi & Riwayat Kuota
- **Melihat Password Wi-Fi**: Buka menu **"Adapter & Wi-Fi"** ➡️ pilih tab **"Wi-Fi Tersimpan"** ➡️ klik ikon mata / tombol salin untuk melihat kata sandi Wi-Fi.
- **Melihat Riwayat Kuota**: Buka menu **"Riwayat" (History)** untuk melihat grafik pemakaian data harian, mingguan, bulanan, dan log riwayat saat internet sempat terputus (downtime).

---

### 7. Pengaturan Auto-Start Saat PC Menyala (Boot)
- Masuk ke menu **"Pengaturan" (Settings)** ➡️ aktifkan saklar **"Jalankan Otomatis saat Windows Menyala" (Auto-Start)**.
- **Cara Kerja Saat PC Dinyalakan Ulang / Restart**:
  - NetSpeedX akan otomatis berjalan di latar belakang secara hening (**Silent Mode**).
  - Jendela dashboard utama **tidak akan muncul mengganggu di tengah layar** (tersimpan rapi di system tray pojok kanan bawah).
  - **Taskbar Speed Meter** di samping jam akan langsung aktif dan muncul seketika!

---

## 🛠️ Panduan Instalasi & Build dari Source Code (Developer)

Jika Anda seorang pengembang dan ingin mengompilasi proyek ini sendiri dari source code:

### Prasyarat Sistem:
- **Node.js**: v18+ atau v20+ ([Download Node.js](https://nodejs.org/))
- **Rust & Cargo**: Rust 1.77+ Stable ([Install via rustup](https://rustup.rs/))
- **C++ Build Tools**: Visual Studio Build Tools 2022 dengan komponen C++ ([Download](https://visualstudio.microsoft.com/visual-cpp-build-tools/))

### Langkah-Langkah Build:
```bash
# 1. Clone repositori ini
git clone https://github.com/Asafik/network-monitoring.git
cd network-monitoring

# 2. Install dependensi frontend
npm install

# 3. Jalankan dalam mode Development
npm run tauri:dev

# 4. Build file Executable Production (.exe Release)
npm run tauri:build -- --no-bundle
```
File executable `.exe` hasil build akan tersedia di:
`src-tauri/target/release/NetSpeedX.exe`

---

## 💡 Solusi Kendala / Troubleshooting

| Kendala | Penyebab | Solusi |
|---|---|---|
| **Fitur Blokir Aplikasi / Password Wi-Fi tidak berfungsi** | Aplikasi tidak memiliki hak akses administrator | Tutup aplikasi, lalu klik kanan `NetSpeedX.exe` ➡️ pilih **"Run as administrator"**. |
| **Meteran Taskbar menimpa ikon tray Windows** | Jumlah ikon tray di layar berbeda | Masuk ke **Settings** ➡️ sesuaikan **Jarak Posisi Taskbar** (misal 200px untuk laptop). |
| **Pesan `os error 4551` saat kompilasi** | Smart App Control Windows 11 memblokir binary dev | Buka Windows Security ➡️ *App & browser control* ➡️ ubah *Smart App Control* ke *Off* atau jalankan `sign-bin.ps1`. |
| **Web Monitor di browser tidak bisa dibuka** | Server lokal belum aktif atau diblokir firewall | Pastikan `NetSpeedX.exe` sedang berjalan, lalu buka alamat `http://localhost:9090`. |

---

## 🏛️ Arsitektur & Teknologi

| Bagian | Teknologi | Fungsi & Kegunaan |
|---|---|---|
| **Desktop Shell** | [Tauri v2](https://v2.tauri.app/) | Kerangka kerja aplikasi desktop ultra-ringan berbasis WebView2 dan Rust |
| **Backend Core** | [Rust](https://www.rust-lang.org/) | Multi-threading, Windows Native API (`user32.dll`, `iphlpapi.dll`), dan ICMP raw ping |
| **Frontend Framework** | [React 19](https://react.dev/) | Antarmuka pengguna modern, dinamis, dan responsif |
| **Bahasa Pemrograman** | [TypeScript 5.8](https://www.typescriptlang.org/) | Jaminan keamanan tipe data (type-safety) antara Frontend dan Backend IPC |
| **Database Lokal** | [SQLite (rusqlite)](https://sqlite.org/) | Penyimpanan data riwayat pemakaian kuota dan log jaringan secara offline |
| **Taskbar Docking** | Win32 API Hook | Z-Order Topmost Keeper, parent binding `Shell_TrayWnd`, dan custom offset slider |

---

## 📁 Struktur Direktori Proyek

```text
network-monitoring/
├── src-tauri/                     # Backend Rust (Tauri v2)
│   ├── src/
│   │   ├── main.rs                # Entry point & optimasi akselerasi grafis
│   │   ├── lib.rs                 # Handler Tauri IPC, System Tray, dan background keeper loop
│   │   ├── taskbar_dock.rs        # Win32 taskbar integration, dynamic offset & GWLP_HWNDPARENT binding
│   │   ├── autostart.rs           # Integrasi Windows Registry Startup & Silent boot
│   │   ├── app_blocker.rs         # Engine Firewall Kill Switch (Win32 & Microsoft Store UWP)
│   │   ├── app_bandwidth.rs       # Monitoring proses aktif, port soket & pemakaian bandwidth
│   │   ├── diagnostics_tools.rs   # Speed test internal, ping ICMP, traceroute, DNS benchmark
│   │   ├── monitor.rs             # Pengumpul metrik network real-time (GetIfTable2 & TCP table)
│   │   ├── wifi.rs                # Ekstraksi password Wi-Fi tersimpan & pemindai sinyal
│   │   ├── db.rs                  # Schema SQLite & persistensi riwayat kuota / outage
│   │   └── server.rs              # Embedded HTTP Web Server (Port 9090)
│   ├── Cargo.toml                 # Dependensi crate Rust
│   └── tauri.conf.json            # Konfigurasi multi-window (NetSpeedX & Taskbar Widget)
├── src/                           # Frontend React 19 + TypeScript
│   ├── components/                # Sidebar navigasi, AppIcon, TaskbarSpeedWidget, dsb.
│   ├── views/                     # DashboardView, AppsView, SpeedTestView, DiagnosticsView, AdaptersView, HistoryView, SettingsView
│   ├── types/                     # TypeScript Interfaces (NetworkMetrics, AppBandwidthItem, dsb.)
│   ├── utils/                     # Format byte/detik, kalkulasi warna & tema
│   ├── App.tsx                    # Root UI Coordinator & routing
│   └── index.css                  # Desain sistem modern, glassmorphism & animasi
├── NetSpeedX.exe                  # Binary Executable Portable Siap Pakai
├── sign-bin.ps1                   # Script penandatanganan sertifikat Windows Authenticode
├── package.json                   # Dependensi npm & build script
└── README.md                      # Dokumentasi komprehensif proyek
```

---

## 📄 Lisensi
Proyek ini bersifat terbuka (*open-source*) dan dirilis di bawah lisensi resmi **[MIT License](LICENSE)**. Bebas digunakan, dipelajari, dimodifikasi, dan didistribusikan.
