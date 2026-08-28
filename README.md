# 🌐 NetSpeedX

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011%20(64--bit)-0078D6?style=for-the-badge&logo=windows" alt="Windows" />
  <img src="https://img.shields.io/badge/Backend-Rust%20%2B%20Tauri%20v2-orange?style=for-the-badge&logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/RAM-~10MB%20(Ultra%20Lightweight)-10B981?style=for-the-badge" alt="RAM" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <b>Ultra-lightweight Windows Network Monitor with a Taskbar Speed Meter (TrafficMonitor Style), Internet Kill Switch, and Local Web Dashboard.</b><br/>
  <i>Aplikasi pemantau kecepatan internet desktop Windows super ringan dengan meteran taskbar, pemutus internet aplikasi, dan web dashboard lokal.</i>
</p>

---

## ⚡ Download Portable (Ready to Use / Siap Pakai)

No installation required! Just download and run:  
*Tidak perlu install! Cukup download dan langsung jalankan:*

| File | Type | Description |
|---|---|---|
| **[`NetSpeedX.exe`](https://github.com/Asafik/network-monitoring/releases)** | Standalone Executable | Click and run immediately *(Tinggal klik 2x langsung jalan)* |
| **[`NetSpeedX-v1.0.0-Portable-x64.zip`](https://github.com/Asafik/network-monitoring/releases)** | ZIP Archive | Complete portable release package *(Paket portabel lengkap)* |

> [!TIP]
> **Windows SmartScreen Note / Catatan SmartScreen:**  
> If Windows shows *"Windows protected your PC / SmartScreen"*:  
> 1. Click **`More info`** *(Info selengkapnya)*  
> 2. Click **`Run anyway`** *(Tetap jalankan)*  
> *(Or right-click the `.exe` ➡️ **Properties** ➡️ check **Unblock** ➡️ **OK**)*

---

## ✨ Key Features / Fitur Utama

- 📌 **Taskbar Speed Meter (TrafficMonitor Style)**  
  Displays real-time Upload (`↑:`) & Download (`↓:`) speeds docked right on your Windows taskbar next to the clock.  
  *Menampilkan kecepatan internet real-time menempel di taskbar samping jam.*
- 🎨 **3 Visual Styles (3 Tema Visual)**  
  - **Transparent**: Blends naturally into the taskbar *(Menyatu dengan warna taskbar)*.  
  - **Solid Dark**: High-contrast dark box *(Kotak hitam kontras pekat)*.  
  - **Glassmorphism**: Cyberpunk semi-transparent with glowing neon blue border *(Aksen biru neon glow)*.  
- 🎛️ **Custom Taskbar Offset (Jarak Posisi)**  
  Slider and presets (200px / 280px / 410px) to position the meter perfectly without covering Windows tray icons.  
  *Slider untuk mengatur jarak posisi meteran agar tidak menutupi ikon tray Windows.*
- ⛔ **Multi-Vector Internet Kill Switch**  
  Block internet access for any Desktop app (`.exe`) or Microsoft Store game (UWP/AppX) in 1-click.  
  *Putus internet aplikasi desktop atau game Microsoft Store dalam 1-klik.*
- 🔒 **Single Instance Lock**  
  Opening `NetSpeedX.exe` multiple times will focus the running window instead of opening duplicate instances.  
  *Mencegah jendela aplikasi ganda/menumpuk.*
- 🚀 **Speed Test & Diagnostics**  
  Real-time speed testing, 1-click gateway/DNS diagnostic, and DNS speed benchmark.  
  *Tes kecepatan internet, diagnostik 1-klik, dan perbandingan server DNS tercepat.*
- 🔑 **Wi-Fi Password Viewer**  
  View and copy saved Wi-Fi passwords on your PC.  
  *Lihat dan salin kata sandi Wi-Fi yang tersimpan di komputer.*
- 📱 **Embedded Local Web Dashboard (Port 9090)**  
  Monitor your PC bandwidth from any browser or smartphone on the same local Wi-Fi via `http://localhost:9090`.  
  *Pantau kecepatan PC dari browser HP/laptop lain di jaringan Wi-Fi yang sama.*
- 🪶 **Ultra-Low Resource (Super Ringan)**  
  Consumes only **~10 MB RAM** and **<0.3% CPU** (Built with Rust + Tauri v2, not bloated Electron).  
  *Hanya memakai ~10 MB RAM dan <0.3% CPU.*

---

## 🎯 How to Use / Cara Pakai

1. **Run Application**: Open `NetSpeedX.exe` (Run as administrator for firewall and Wi-Fi features).  
   *Buka `NetSpeedX.exe` (Jalankan sebagai administrator untuk fitur firewall & Wi-Fi).*
2. **Taskbar Speed Meter**: Double-click the speed meter on your taskbar to open the main dashboard.  
   *Klik ganda pada meteran di taskbar untuk membuka jendela utama.*
3. **Block App Internet**: Go to **Applications** tab ➡️ click **Putus Internet** on any app.  
   *Masuk ke menu **Applications** ➡️ klik tombol **Putus Internet**.*
4. **Change Taskbar Style**: Go to **Settings** ➡️ select **Widget Visual Style** or adjust **Taskbar Offset**.  
   *Masuk ke menu **Settings** ➡️ pilih tema visual atau atur jarak posisi taskbar.*
5. **Auto-Start**: In **Settings**, enable **Launch on Windows Startup** to run silently in the background on PC boot.  
   *Di menu **Settings**, aktifkan **Auto-Start** agar otomatis berjalan saat Windows menyala.*

---

## 🛠️ Build from Source (Developer)

### Prerequisites:
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (v1.77+ Stable)
- Visual Studio C++ Build Tools

```bash
# 1. Clone the repository
git clone https://github.com/Asafik/network-monitoring.git
cd network-monitoring

# 2. Install dependencies
npm install

# 3. Run in development mode
npm run tauri:dev

# 4. Build release executable (.exe)
npm run tauri:build -- --no-bundle
```

The output binary is located at: `src-tauri/target/release/netspeedx.exe`

---

## 📄 License

This project is open-source and licensed under the **[MIT License](LICENSE)**.
