mod app_bandwidth;
mod app_blocker;
mod autostart;
mod db;
mod diagnostics_tools;
mod monitor;
mod server;
mod speedtest;
mod taskbar_dock;
mod wifi;

use db::{Database, HistoryPoint, IncidentLog};
use monitor::{NetworkAdapterInfo, NetworkMetrics, NetworkMonitor};
use std::net::IpAddr;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, State, WindowEvent,
};
use wifi::ActiveConnectionDetails;

pub struct AppState {
    pub db: Arc<Database>,
    pub monitor: Arc<NetworkMonitor>,
}

#[tauri::command]
fn get_history(state: State<AppState>, limit: Option<usize>) -> Result<Vec<HistoryPoint>, String> {
    state
        .db
        .get_recent_history(limit.unwrap_or(40))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_incidents(state: State<AppState>, limit: Option<usize>) -> Result<Vec<IncidentLog>, String> {
    state
        .db
        .get_recent_incidents(limit.unwrap_or(20))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_wifi_password(ssid: String) -> Result<Option<String>, String> {
    Ok(wifi::get_wifi_password(&ssid))
}

#[tauri::command]
fn get_available_networks() -> Result<Vec<wifi::WifiNetworkItem>, String> {
    Ok(wifi::get_all_wifi_networks())
}

#[tauri::command]
fn get_data_usage_summary(state: State<AppState>) -> Result<db::DataUsageSummary, String> {
    state
        .db
        .get_data_usage_summary(1024 * 1024 * 1024 * 5, 1024 * 1024 * 1024 * 1)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_outage_logs(state: State<AppState>, limit: Option<usize>) -> Result<Vec<db::OutageLog>, String> {
    state
        .db
        .get_outage_logs(limit.unwrap_or(20))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_outage_stats(state: State<AppState>) -> Result<db::OutageStats, String> {
    state
        .db
        .get_outage_stats()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_advanced_latency_history(state: State<AppState>, range: String) -> Result<db::AdvancedLatencyStats, String> {
    state
        .db
        .get_advanced_latency_history(&range)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_speed_test_command(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    mode: Option<String>,
) -> Result<speedtest::SpeedTestResult, String> {
    let app_handle = app.clone();
    let is_upload = mode.as_deref() == Some("upload");

    let result = if is_upload {
        speedtest::run_upload_test(move |progress| {
            let _ = app_handle.emit("speedtest-progress", &progress);
        })
        .await?
    } else {
        speedtest::run_download_test(move |progress| {
            let _ = app_handle.emit("speedtest-progress", &progress);
        })
        .await?
    };

    // Save only tested metric to SQLite
    let _ = state.db.insert_speed_test(
        0.0,
        0.0,
        result.download_mbps,
        result.upload_mbps,
    );

    Ok(result)
}

#[tauri::command]
fn get_speed_test_history(state: State<AppState>, range: Option<String>) -> Result<Vec<db::SpeedTestRecord>, String> {
    state
        .db
        .get_speed_tests(&range.unwrap_or_else(|| "all".to_string()))
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_quick_diagnostics_command() -> Result<diagnostics_tools::QuickDiagnosticsResult, String> {
    tokio::task::spawn_blocking(diagnostics_tools::run_quick_diagnostics)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_dns_benchmark_command() -> Result<Vec<diagnostics_tools::DnsBenchmarkItem>, String> {
    tokio::task::spawn_blocking(diagnostics_tools::run_dns_benchmark)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_manual_ping_test_command(target: String, count: Option<usize>) -> Result<diagnostics_tools::ManualPingResult, String> {
    tokio::task::spawn_blocking(move || diagnostics_tools::run_manual_ping_test(&target, count.unwrap_or(30)))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_traceroute_command(target: String) -> Result<Vec<diagnostics_tools::TracerouteHop>, String> {
    tokio::task::spawn_blocking(move || diagnostics_tools::run_traceroute(&target))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_per_app_bandwidth_command() -> Result<Vec<app_bandwidth::AppBandwidthItem>, String> {
    tokio::task::spawn_blocking(app_bandwidth::get_per_app_bandwidth)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_network_sessions_command(state: State<AppState>, limit: Option<usize>) -> Result<Vec<db::NetworkSessionRecord>, String> {
    state
        .db
        .get_network_sessions(limit.unwrap_or(20))
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn flush_dns_cache_command() -> Result<String, String> {
    tokio::task::spawn_blocking(|| {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        use std::os::windows::process::CommandExt;
        let _ = std::process::Command::new("ipconfig")
            .arg("/flushdns")
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        "DNS Cache successfully flushed".to_string()
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn block_app_command(state: State<'_, AppState>, app_name: String, exe_path: Option<String>) -> Result<String, String> {
    let clean = app_name.trim().to_string();
    let db = state.db.clone();
    tokio::task::spawn_blocking(move || {
        let res = app_blocker::block_app_internet(&clean, exe_path.as_deref());
        let _ = db.insert_blocked_app(&clean);
        res
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn unblock_app_command(state: State<'_, AppState>, app_name: String) -> Result<String, String> {
    let clean = app_name.trim().to_string();
    let db = state.db.clone();
    tokio::task::spawn_blocking(move || {
        let res = app_blocker::unblock_app_internet(&clean);
        let _ = db.remove_blocked_app(&clean);
        res
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_blocked_apps_command(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let db = state.db.clone();
    tokio::task::spawn_blocking(move || {
        let mut list = db.get_blocked_apps().unwrap_or_default();
        let fw_list = app_blocker::get_blocked_apps();
        for app in fw_list {
            if !list.contains(&app) {
                let _ = db.insert_blocked_app(&app);
                list.push(app);
            }
        }
        list
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn show_main_window_command(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
    Ok(())
}

#[tauri::command]
fn hide_main_window_command(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    Ok(())
}

#[tauri::command]
fn toggle_widget_window_command(app: tauri::AppHandle, show: Option<bool>) -> Result<bool, String> {
    if let Some(widget) = app.get_webview_window("widget") {
        let is_vis = widget.is_visible().unwrap_or(false);
        let target = show.unwrap_or(!is_vis);
        taskbar_dock::set_widget_enabled(target);
        if target {
            let _ = widget.show();
            let _ = snap_widget_to_taskbar_command(app);
        } else {
            let _ = widget.hide();
        }
        return Ok(target);
    }
    Ok(false)
}

#[tauri::command]
fn snap_widget_to_taskbar_command(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(widget) = app.get_webview_window("widget") {
        let _ = widget.set_always_on_top(true);
        let (x, y) = taskbar_dock::get_taskbar_dock_position(125, 38);
        let _ = widget.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
        if let Ok(hwnd) = widget.hwnd() {
            taskbar_dock::make_taskbar_persistent(hwnd.0 as isize);
        }
        let _ = widget.show();
    }
    Ok(())
}

#[tauri::command]
fn ping_target(state: State<AppState>, host: String) -> Result<Option<f64>, String> {
    let ip: IpAddr = match host.parse() {
        Ok(addr) => addr,
        Err(_) => {
            // Try resolving DNS
            use std::net::ToSocketAddrs;
            let socket_addr = format!("{}:80", host)
                .to_socket_addrs()
                .map_err(|e| e.to_string())?
                .next()
                .ok_or_else(|| "Could not resolve host".to_string())?;
            socket_addr.ip()
        }
    };

    Ok(state.monitor.ping_host(ip))
}

#[tauri::command]
fn set_taskbar_offset_command(app: tauri::AppHandle, offset: i32) -> Result<i32, String> {
    taskbar_dock::set_taskbar_offset(offset);
    let _ = snap_widget_to_taskbar_command(app);
    Ok(taskbar_dock::get_taskbar_offset())
}

#[tauri::command]
fn get_taskbar_offset_command() -> Result<i32, String> {
    Ok(taskbar_dock::get_taskbar_offset())
}

#[tauri::command]
fn open_web_browser_command() -> Result<(), String> {
    let _ = std::process::Command::new("cmd")
        .args(["/C", "start", "http://localhost:9090"])
        .spawn();
    Ok(())
}

#[tauri::command]
fn get_autostart_command() -> Result<bool, String> {
    Ok(autostart::is_autostart_enabled())
}

#[tauri::command]
fn set_autostart_command(enabled: bool) -> Result<bool, String> {
    if enabled {
        autostart::enable_autostart()?;
    } else {
        autostart::disable_autostart()?;
    }
    Ok(autostart::is_autostart_enabled())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // App data directory for SQLite
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::env::current_dir().unwrap());
            std::fs::create_dir_all(&app_data_dir).ok();

            let db = Arc::new(Database::new(&app_data_dir).expect("failed to init database"));
            let monitor = Arc::new(NetworkMonitor::new());

            app.manage(AppState {
                db: db.clone(),
                monitor: monitor.clone(),
            });

            // Build menu for System Tray
            let show_i = MenuItem::with_id(app, "show", "Buka NetSpeedX", true, None::<&str>)?;
            let toggle_widget_i = MenuItem::with_id(app, "toggle_widget", "Tampilkan/Sembunyikan Speed Meter", true, None::<&str>)?;
            let web_i = MenuItem::with_id(app, "open_web", "Buka Web Monitor (Browser)", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Sembunyikan ke Tray", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Keluar", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &toggle_widget_i, &web_i, &hide_i, &quit_i])?;

            // Build Tray Icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().cloned().expect("failed to get default window icon"))
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "toggle_widget" => {
                        if let Some(widget) = app.get_webview_window("widget") {
                            if widget.is_visible().unwrap_or(false) {
                                let _ = widget.hide();
                            } else {
                                let _ = widget.show();
                            }
                        }
                    }
                    "open_web" => {
                        let _ = std::process::Command::new("cmd")
                            .args(["/C", "start", "http://localhost:9090"])
                            .spawn();
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Shared state for Local Web API
            let default_metrics = NetworkMetrics {
                download_speed: 0.0,
                upload_speed: 0.0,
                total_downloaded: 0,
                total_uploaded: 0,
                ping: 0.0,
                jitter: 0.0,
                packet_loss: 0.0,
                status: "online".to_string(),
                active_adapter: "Wi-Fi".to_string(),
                ip_address: "127.0.0.1".to_string(),
                gateway: "192.168.1.1".to_string(),
                dns: "1.1.1.1 / 8.8.8.8".to_string(),
                timestamp: chrono::Utc::now().timestamp_millis(),
                connection_details: ActiveConnectionDetails::default(),
                health_score: 95,
                health_status: "Excellent".to_string(),
                ping_spikes_count: 0,
            };

            let latest_metrics = Arc::new(Mutex::new(default_metrics));
            let latest_adapters = Arc::new(Mutex::new(Vec::<NetworkAdapterInfo>::new()));

            // Start Local API Server on 127.0.0.1:9090 for Web Browser Sync
            server::start_local_api_server(latest_metrics.clone(), latest_adapters.clone(), db.clone());

            // Background Monitoring Loop
            let app_handle = app.handle().clone();
            let db_clone = db.clone();
            let monitor_clone = monitor.clone();

            std::thread::spawn(move || {
                let default_target: IpAddr = "1.1.1.1".parse().unwrap();
                let mut db_save_counter = 0;
                let mut is_currently_offline = false;
                let mut outage_start_ts = 0i64;
                let mut outage_start_time_str = String::new();

                loop {
                    let (metrics, adapters) = monitor_clone.collect_metrics(default_target);

                    // Outage tracking state machine
                    if metrics.status == "offline" {
                        if !is_currently_offline {
                            is_currently_offline = true;
                            outage_start_ts = chrono::Local::now().timestamp();
                            outage_start_time_str = chrono::Local::now().format("%H:%M:%S").to_string();
                        }
                    } else if is_currently_offline {
                        // Reconnected!
                        is_currently_offline = false;
                        let end_time_str = chrono::Local::now().format("%H:%M:%S").to_string();
                        let duration_secs = (chrono::Local::now().timestamp() - outage_start_ts).max(1) as u64;
                        let _ = db_clone.insert_outage(&outage_start_time_str, &end_time_str, duration_secs);
                    }

                    // Update shared state for browser sync
                    *latest_metrics.lock().unwrap() = metrics.clone();
                    *latest_adapters.lock().unwrap() = adapters.clone();

                    // Emit to Frontend via Tauri Event
                    let _ = app_handle.emit("network-metrics", &metrics);
                    let _ = app_handle.emit("network-adapters", &adapters);

                    // Save to SQLite every 2 seconds
                    db_save_counter += 1;
                    if db_save_counter >= 2 {
                        db_save_counter = 0;
                        let _ = db_clone.insert_metric(
                            metrics.timestamp,
                            metrics.download_speed,
                            metrics.upload_speed,
                            metrics.ping,
                            metrics.jitter,
                            metrics.packet_loss,
                        );
                    }

                    // Keep widget dynamically docked and persistently topmost on the taskbar
                    if taskbar_dock::is_widget_enabled() {
                        if let Some(widget) = app_handle.get_webview_window("widget") {
                            let (x, y) = taskbar_dock::get_taskbar_dock_position(125, 38);
                            let _ = widget.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
                            if let Ok(hwnd) = widget.hwnd() {
                                taskbar_dock::make_taskbar_persistent(hwnd.0 as isize);
                            }
                        }
                    }

                    std::thread::sleep(Duration::from_millis(1000));
                }
            });

            // Position native widget window directly on Windows taskbar (TrafficMonitor style)
            if let Some(widget) = app.get_webview_window("widget") {
                let _ = widget.set_always_on_top(true);
                let (x, y) = taskbar_dock::get_taskbar_dock_position(125, 38);
                let _ = widget.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
                if let Ok(hwnd) = widget.hwnd() {
                    taskbar_dock::make_taskbar_persistent(hwnd.0 as isize);
                }
                let _ = widget.show();
            }

            // High-frequency (50ms) background taskbar keeper: Guarantees 0ms flicker / never disappears even when opening Start/Search
            let widget_keeper_handle = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    if taskbar_dock::is_widget_enabled() {
                        if let Some(widget) = widget_keeper_handle.get_webview_window("widget") {
                            if let Ok(hwnd) = widget.hwnd() {
                                taskbar_dock::make_taskbar_persistent(hwnd.0 as isize);
                            }
                        }
                    }
                    std::thread::sleep(Duration::from_millis(50));
                }
            });

            // If launched manually (not via Windows Boot Autostart), display main dashboard window immediately
            let is_autostart = std::env::args().any(|a| a == "--autostart" || a == "--minimized" || a == "--silent");
            if let Some(main_win) = app.get_webview_window("main") {
                if !is_autostart {
                    let _ = main_win.show();
                    let _ = main_win.set_focus();
                } else {
                    let _ = main_win.hide();
                }
            }

            // Ensure default auto-start with Admin privileges on Windows boot
            autostart::init_default_autostart();

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Intercept close button (X) and hide window instead
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_history,
            get_incidents,
            get_wifi_password,
            get_available_networks,
            get_data_usage_summary,
            get_outage_logs,
            get_outage_stats,
            get_advanced_latency_history,
            run_speed_test_command,
            get_speed_test_history,
            run_quick_diagnostics_command,
            run_dns_benchmark_command,
            run_manual_ping_test_command,
            run_traceroute_command,
            get_per_app_bandwidth_command,
            get_network_sessions_command,
            flush_dns_cache_command,
            block_app_command,
            unblock_app_command,
            get_blocked_apps_command,
            show_main_window_command,
            hide_main_window_command,
            toggle_widget_window_command,
            snap_widget_to_taskbar_command,
            open_web_browser_command,
            get_autostart_command,
            set_autostart_command,
            set_taskbar_offset_command,
            get_taskbar_offset_command,
            ping_target
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
