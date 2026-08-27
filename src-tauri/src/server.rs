use crate::db::Database;
use crate::monitor::{NetworkAdapterInfo, NetworkMetrics};
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::{Arc, Mutex};

pub fn start_local_api_server(
    latest_metrics: Arc<Mutex<NetworkMetrics>>,
    latest_adapters: Arc<Mutex<Vec<NetworkAdapterInfo>>>,
    db: Arc<Database>,
) {
    std::thread::spawn(move || {
        let listener = match TcpListener::bind("127.0.0.1:9090") {
            Ok(l) => l,
            Err(e) => {
                eprintln!("Local API server could not bind to 127.0.0.1:9090: {}", e);
                return;
            }
        };

        for stream in listener.incoming() {
            if let Ok(mut stream) = stream {
                let mut buffer = [0u8; 1024];
                let _ = stream.read(&mut buffer);
                let request = String::from_utf8_lossy(&buffer);

                if request.starts_with("GET /api/metrics") {
                    let metrics = latest_metrics.lock().unwrap().clone();
                    let adapters = latest_adapters.lock().unwrap().clone();

                    let payload = serde_json::json!({
                        "metrics": metrics,
                        "adapters": adapters,
                    });

                    let json_str = payload.to_string();
                    let response = format!(
                        "HTTP/1.1 200 OK\r\n\
                         Content-Type: application/json\r\n\
                         Access-Control-Allow-Origin: *\r\n\
                         Access-Control-Allow-Methods: GET, OPTIONS\r\n\
                         Access-Control-Allow-Headers: *\r\n\
                         Content-Length: {}\r\n\
                         Connection: close\r\n\r\n{}",
                        json_str.len(),
                        json_str
                    );
                    let _ = stream.write_all(response.as_bytes());
                } else if request.starts_with("GET /api/wifi-password") {
                    let ssid = latest_metrics
                        .lock()
                        .unwrap()
                        .connection_details
                        .ssid
                        .clone()
                        .unwrap_or_else(|| "Command Center".to_string());
                    
                    let pwd = crate::wifi::get_wifi_password(&ssid);
                    let payload = serde_json::json!({
                        "ssid": ssid,
                        "password": pwd
                    });

                    let json_str = payload.to_string();
                    let response = format!(
                        "HTTP/1.1 200 OK\r\n\
                         Content-Type: application/json\r\n\
                         Access-Control-Allow-Origin: *\r\n\
                         Access-Control-Allow-Methods: GET, OPTIONS\r\n\
                         Access-Control-Allow-Headers: *\r\n\
                         Content-Length: {}\r\n\
                         Connection: close\r\n\r\n{}",
                        json_str.len(),
                        json_str
                    );
                    let _ = stream.write_all(response.as_bytes());
                } else if request.starts_with("GET /api/wifi-networks") {
                    let networks = crate::wifi::get_all_wifi_networks();
                    let json_str = serde_json::to_string(&networks).unwrap_or_default();
                    let response = format!(
                        "HTTP/1.1 200 OK\r\n\
                         Content-Type: application/json\r\n\
                         Access-Control-Allow-Origin: *\r\n\
                         Access-Control-Allow-Methods: GET, OPTIONS\r\n\
                         Access-Control-Allow-Headers: *\r\n\
                         Content-Length: {}\r\n\
                         Connection: close\r\n\r\n{}",
                        json_str.len(),
                        json_str
                    );
                    let _ = stream.write_all(response.as_bytes());
                } else if request.starts_with("GET /api/history") {
                    let history = db.get_recent_history(40).unwrap_or_default();
                    let json_str = serde_json::to_string(&history).unwrap_or_default();
                    let response = format!(
                        "HTTP/1.1 200 OK\r\n\
                         Content-Type: application/json\r\n\
                         Access-Control-Allow-Origin: *\r\n\
                         Content-Length: {}\r\n\
                         Connection: close\r\n\r\n{}",
                        json_str.len(),
                        json_str
                    );
                    let _ = stream.write_all(response.as_bytes());
                } else if request.starts_with("OPTIONS") {
                    let response = "HTTP/1.1 204 No Content\r\n\
                                    Access-Control-Allow-Origin: *\r\n\
                                    Access-Control-Allow-Methods: GET, OPTIONS\r\n\
                                    Access-Control-Allow-Headers: *\r\n\
                                    Connection: close\r\n\r\n";
                    let _ = stream.write_all(response.as_bytes());
                } else {
                    let response = "HTTP/1.1 404 NOT FOUND\r\n\
                                    Content-Length: 0\r\n\
                                    Connection: close\r\n\r\n";
                    let _ = stream.write_all(response.as_bytes());
                }
            }
        }
    });
}
