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

## 🚀 Cara Menjalankan Aplikasi (How to Run)

> ⚠️ **PENTING (Administrator Privileges)**:
> Fitur **Internet Kill Switch (Pemutus Internet Aplikasi)** membutuhkan hak akses **Administrator** untuk mengontrol Windows Firewall di tingkat kernel.

### 🌟 Cara 1: 1-Klik Launcher (Paling Mudah)
1. Buka folder project di File Explorer (`F:\network-monitor`).
2. **Klik kanan file `run-dev-admin.bat`** lalu pilih **`Run as administrator`** *(atau cukup klik 2x)*.
3. Klik **"Yes"** pada jendela konfirmasi Windows UAC.
4. Aplikasi desktop dan meteran kecepatan taskbar akan langsung terbuka otomatis!

---

### 💻 Cara 2: Lewat Terminal / Command Prompt
Buka terminal (PowerShell / Command Prompt / Terminal VSCode):
```bash
# Jalankan launcher admin otomatis
npm run dev:admin

# Atau jalankan tauri dev biasa
npm run tauri:dev
```

---

### 📦 Cara 3: Build File Installer Standalone (.exe)
Untuk membuat file installer / executable mandiri:
```bash
npm run tauri:build
```
File `.exe` hasil build akan berada di:
`src-tauri/target/release/network-monitor.exe`

---

## 🌐 Mode Web Browser Preview
Selain aplikasi desktop native, Anda juga bisa membuka antarmuka pemantau di browser web favorit Anda (Chrome, Brave, Edge):
- Buka browser dan akses: **`http://localhost:1420`**
- Data tersinkronisasi **dua arah secara real-time** dengan backend Rust lokal (`port 9090`).

---

## ✨ Fitur-Fitur Utama (Key Features)

### 1. ⚡ Native Windows Taskbar Speed Meter (TrafficMonitor Style)
- **Menempel Langsung di Taskbar**: Berada di taskbar Windows 10/11 di sebelah kiri ikon system tray (`^`).
- **Dynamic 410px Clearance**: Posisi dinamis yang rapi, tidak akan bertumpuk saat ikon lokasi Windows (`🧭`), mikrofon, atau notifikasi tray muncul.
- **Warna Kontras Khas TrafficMonitor**: Oranye/Amber (`↑:`) untuk Upload dan Hijau Terang (`↓:`) untuk Download dengan drop-shadow tajam.
- **50ms Anti-Flicker Keeper**: Thread Win32 Z-order menjaga widget **tidak pernah hilang atau kedip 1 detik pun** saat membuka aplikasi lain.
- **Dukungan Penuh Snipping Tool**: Mendukung tangkapan layar `Win + Shift + S` (`SetWindowDisplayAffinity(WDA_NONE)`).
- **Interaktif**: Bisa digeser (*drag*), **klik ganda** untuk buka Dashboard utama, atau **klik kanan** untuk menu cepat.

### 2. 🛡️ Multi-Vector Application Internet Kill Switch
- **Pemutus Internet Game Microsoft Store (UWP / AppX)**: Mampu memutus internet game Microsoft Store (*seperti Angry Birds 2*) menggunakan aturan `-Package <PackageFamilyName>`.
- **Pemutus Internet Browser & Software PC**: Memutus akses internet browser (*Brave, Chrome, Edge*) dan program Win32 lainnya secara instan.
- **Zero UI Freeze**: Eksekusi background asynchronous (`tokio::task::spawn_blocking`), antarmuka desktop tetap lancar 60 FPS tanpa macet/not-responding.
- **Penyimpanan Permanen 3 Lapis**: Status blokir tersimpan di `localStorage`, SQLite database lokal, dan Windows Firewall (anti-reset saat refresh F5).

### 3. 🚀 Speed Test & Diagnostik Jaringan Lengkap
- **Speed Test Akurat**: Uji kecepatan Download, Upload, Ping, dan Jitter dengan animasi gauge interaktif.
- **1-Click Quick Diagnostics**: Cek kesehatan Gateway, DNS Lokal, Cloudflare (1.1.1.1), Google (8.8.8.8), packet loss, dan MTU.
- **DNS Benchmark**: Perbandingan latensi antar provider DNS (Cloudflare, Google, Quad9, OpenDNS, Local).
- **Manual Ping & Traceroute**: Pelacakan hop rute jaringan dan uji ping target kustom.
- **Flush DNS Cache**: Tombol 1-klik untuk membersihkan cache DNS Windows.

### 4. 📊 Pemantau Bandwidth & Riwayat Konsumsi Kuota
- **Grafik Gelombang Real-Time**: Visualisasi grafik lalu lintas unduh & unggah per detik.
- **Skor Kesehatan Jaringan (Network Health 0-100)**: Penilaian stabilitas koneksi otomatis.
- **Per-App Bandwidth & Active Sockets**: Memantau konsumsi data setiap aplikasi yang sedang berjalan beserta port & alamat IP tujuannya.
- **Riwayat Kuota & Deteksi Internet Putus (Outage Log)**: Pencatatan konsumsi data harian, mingguan, bulanan, dan histori downtime internet.

### 5. 🔑 Wi-Fi Password Recovery & Pemindai Sinyal
- **Lihat Password Wi-Fi Tersimpan**: Menampilkan dan menyalin kata sandi jaringan Wi-Fi yang pernah tersambung ke laptop/PC.
- **Pemindai Sinyal Wi-Fi**: Memindai SSID Wi-Fi sekitar lengkap dengan persentase sinyal (%), frekuensi 2.4GHz / 5GHz, channel, dan tipe enkripsi.
- **Deteksi LAN Gigabit**: Menampilkan status dan kecepatan tautan kabel LAN.

### 6. 💾 100% Offline, Aman & Super Ringan
- Menggunakan database **SQLite offline** di komputer Anda tanpa koneksi cloud luar.
- Sangat hemat sumber daya: RAM <30MB dan CPU <0.3%.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| **Desktop Framework** | [Tauri v2](https://v2.tauri.app/) |
| **Backend Core** | [Rust](https://www.rust-lang.org/) (`sysinfo`, `rusqlite`, `winping`, `tokio`) |
| **Frontend UI** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Database** | [SQLite](https://sqlite.org/) (Embedded local offline database) |
| **Styling** | Vanilla CSS (GPU-Accelerated, Dark Mode) |

---

## 📥 Prasyarat Pengembangan (Prerequisites)

- **Node.js** (v18 ke atas): [Download Node.js](https://nodejs.org/)
- **Rust & Cargo**: [Install Rust via rustup](https://rustup.rs/)
- **Visual Studio C++ Build Tools**: [Download Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

---

## 📄 Lisensi
Proyek ini bersifat open-source di bawah lisensi [MIT License](LICENSE).
