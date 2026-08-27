use crate::wifi::{get_active_wifi_details, ActiveConnectionDetails};
use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use std::sync::{Arc, Mutex};
use sysinfo::Networks;
use winping::{Buffer, Pinger};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkMetrics {
    #[serde(rename = "downloadSpeed")]
    pub download_speed: f64,
    #[serde(rename = "uploadSpeed")]
    pub upload_speed: f64,
    #[serde(rename = "totalDownloaded")]
    pub total_downloaded: u64,
    #[serde(rename = "totalUploaded")]
    pub total_uploaded: u64,
    pub ping: f64,
    pub jitter: f64,
    #[serde(rename = "packetLoss")]
    pub packet_loss: f64,
    pub status: String,
    #[serde(rename = "activeAdapter")]
    pub active_adapter: String,
    #[serde(rename = "ipAddress")]
    pub ip_address: String,
    pub gateway: String,
    pub dns: String,
    pub timestamp: i64,
    #[serde(rename = "connectionDetails")]
    pub connection_details: ActiveConnectionDetails,
    #[serde(rename = "healthScore")]
    pub health_score: u32,
    #[serde(rename = "healthStatus")]
    pub health_status: String,
    #[serde(rename = "pingSpikesCount")]
    pub ping_spikes_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NetworkAdapterInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "type")]
    pub adapter_type: String,
    pub status: String,
    #[serde(rename = "ipV4")]
    pub ip_v4: String,
    #[serde(rename = "ipV6")]
    pub ip_v6: String,
    #[serde(rename = "macAddress")]
    pub mac_address: String,
    pub gateway: String,
    #[serde(rename = "dnsServers")]
    pub dns_servers: Vec<String>,
    #[serde(rename = "linkSpeedMbps")]
    pub link_speed_mbps: u64,
    #[serde(rename = "rxBytes")]
    pub rx_bytes: u64,
    #[serde(rename = "txBytes")]
    pub tx_bytes: u64,
    #[serde(rename = "rxSpeedBps")]
    pub rx_speed_bps: f64,
    #[serde(rename = "txSpeedBps")]
    pub tx_speed_bps: f64,
}

pub fn ping_host_native(ip: IpAddr) -> Option<f64> {
    if let Ok(pinger) = Pinger::new() {
        let mut buffer = Buffer::new();
        match pinger.send(ip, &mut buffer) {
            Ok(rtt) => Some(rtt as f64),
            Err(_) => None,
        }
    } else {
        None
    }
}

pub struct NetworkMonitor {
    networks: Arc<Mutex<Networks>>,
    recent_pings: Arc<Mutex<Vec<f64>>>,
}

impl NetworkMonitor {
    pub fn new() -> Self {
        let networks = Networks::new_with_refreshed_list();

        NetworkMonitor {
            networks: Arc::new(Mutex::new(networks)),
            recent_pings: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn ping_host(&self, ip: IpAddr) -> Option<f64> {
        ping_host_native(ip)
    }

    pub fn collect_metrics(&self, default_target: IpAddr) -> (NetworkMetrics, Vec<NetworkAdapterInfo>) {
        let mut networks = self.networks.lock().unwrap();
        networks.refresh(true);

        let mut total_rx = 0u64;
        let mut total_tx = 0u64;
        let mut rx_speed_bps = 0.0f64;
        let mut tx_speed_bps = 0.0f64;
        let mut active_adapter_name = "Wi-Fi".to_string();
        let mut active_ip = "127.0.0.1".to_string();
        let mut max_speed = 0.0;

        let mut adapter_list = Vec::new();

        for (interface_name, data) in networks.iter() {
            let rx = data.total_received();
            let tx = data.total_transmitted();
            let rx_speed = data.received() as f64;
            let tx_speed = data.transmitted() as f64;

            total_rx += rx;
            total_tx += tx;
            rx_speed_bps += rx_speed;
            tx_speed_bps += tx_speed;

            let ip_v4 = data
                .ip_networks()
                .iter()
                .find(|ip_net| ip_net.addr.is_ipv4())
                .map(|ip_net| ip_net.addr.to_string())
                .unwrap_or_default();

            let ip_v6 = data
                .ip_networks()
                .iter()
                .find(|ip_net| ip_net.addr.is_ipv6())
                .map(|ip_net| ip_net.addr.to_string())
                .unwrap_or_default();

            let mac = data.mac_address().to_string();

            let is_loopback = interface_name.to_lowercase().contains("loopback");
            let is_wifi = interface_name.to_lowercase().contains("wi-fi") || interface_name.to_lowercase().contains("wireless") || interface_name.to_lowercase().contains("wlan");
            let is_eth = interface_name.to_lowercase().contains("ethernet") || interface_name.to_lowercase().contains("lan");

            let adapter_type = if is_loopback {
                "loopback"
            } else if is_wifi {
                "wifi"
            } else if is_eth {
                "ethernet"
            } else {
                "other"
            };

            let is_active = !ip_v4.is_empty() && ip_v4 != "127.0.0.1";
            if is_active && (rx_speed + tx_speed >= max_speed || active_ip == "127.0.0.1") {
                max_speed = rx_speed + tx_speed;
                active_adapter_name = interface_name.clone();
                active_ip = ip_v4.clone();
            }

            adapter_list.push(NetworkAdapterInfo {
                id: interface_name.clone(),
                name: interface_name.clone(),
                description: format!("Network Controller ({})", interface_name),
                adapter_type: adapter_type.to_string(),
                status: if is_active { "up".to_string() } else { "down".to_string() },
                ip_v4,
                ip_v6,
                mac_address: mac,
                gateway: "192.168.1.1".to_string(),
                dns_servers: vec!["1.1.1.1".to_string(), "8.8.8.8".to_string()],
                link_speed_mbps: if is_wifi { 866 } else if is_eth { 1000 } else { 0 },
                rx_bytes: rx,
                tx_bytes: tx,
                rx_speed_bps: rx_speed,
                tx_speed_bps: tx_speed,
            });
        }

        // Measure Ping
        let current_ping = ping_host_native(default_target);
        let mut pings = self.recent_pings.lock().unwrap();

        let (ping_val, packet_loss, jitter_val, status) = match current_ping {
            Some(ms) => {
                pings.push(ms);
                if pings.len() > 10 {
                    pings.remove(0);
                }

                // Calculate jitter (average difference between consecutive pings)
                let mut diff_sum = 0.0;
                for i in 1..pings.len() {
                    diff_sum += (pings[i] - pings[i - 1]).abs();
                }
                let jitter = if pings.len() > 1 {
                    diff_sum / (pings.len() - 1) as f64
                } else {
                    1.5
                };

                let st = if ms < 100.0 { "online" } else { "degraded" };
                (ms, 0.0, jitter, st.to_string())
            }
            None => {
                pings.clear();
                (0.0, 100.0, 0.0, "offline".to_string())
            }
        };

        let now_ts = chrono::Utc::now().timestamp_millis();

        // Calculate Network Health Score (0-100)
        let mut score: f64 = 100.0;
        if ping_val > 25.0 {
            score -= ((ping_val - 25.0) * 0.35).min(30.0);
        }
        if jitter_val > 2.5 {
            score -= ((jitter_val - 2.5) * 1.8).min(20.0);
        }
        score -= (packet_loss as f64 * 2.5).min(50.0);

        if status == "offline" {
            score = 0.0;
        }

        let health_score_final = (score.max(0.0).min(100.0).round()) as u32;
        let health_status_final = match health_score_final {
            90..=100 => "Excellent",
            75..=89 => "Good",
            60..=74 => "Fair",
            40..=59 => "Poor",
            _ => "Critical",
        }.to_string();

        let ping_spikes = pings.iter().filter(|&&p| p > 75.0).count() as u32;

        // Determine connection details (Wi-Fi vs Ethernet)
        let connection_details = if let Some(wifi_info) = get_active_wifi_details() {
            wifi_info
        } else {
            let is_ethernet_active = active_adapter_name.to_lowercase().contains("ethernet") || active_adapter_name.to_lowercase().contains("lan");
            ActiveConnectionDetails {
                connection_type: if is_ethernet_active { "ethernet".to_string() } else { "none".to_string() },
                ssid: None,
                signal_percent: if is_ethernet_active { Some(100) } else { None },
                radio_type: if is_ethernet_active { Some("Gigabit Ethernet (802.3)".to_string()) } else { None },
                channel: None,
                authentication: if is_ethernet_active { Some("Direct Wired (No Password)".to_string()) } else { None },
                link_speed_mbps: if is_ethernet_active { Some(1000) } else { None },
                bssid: None,
                is_wired: is_ethernet_active,
            }
        };

        let metrics = NetworkMetrics {
            download_speed: rx_speed_bps,
            upload_speed: tx_speed_bps,
            total_downloaded: total_rx,
            total_uploaded: total_tx,
            ping: ping_val,
            jitter: jitter_val,
            packet_loss,
            status,
            active_adapter: active_adapter_name,
            ip_address: active_ip,
            gateway: "192.168.1.1".to_string(),
            dns: "1.1.1.1 / 8.8.8.8".to_string(),
            timestamp: now_ts,
            connection_details,
            health_score: health_score_final,
            health_status: health_status_final,
            ping_spikes_count: ping_spikes,
        };

        (metrics, adapter_list)
    }
}
