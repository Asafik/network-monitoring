mod db;
mod monitor;
mod server;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
            let show_i = MenuItem::with_id(app, "show", "Buka Network Monitor", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Sembunyikan ke Tray", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Keluar", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

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

                loop {
                    let (metrics, adapters) = monitor_clone.collect_metrics(default_target);

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

                    std::thread::sleep(Duration::from_millis(1000));
                }
            });

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
            ping_target
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
