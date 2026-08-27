use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ActiveConnectionDetails {
    #[serde(rename = "connectionType")]
    pub connection_type: String, // "wifi" | "ethernet" | "none"
    #[serde(rename = "ssid")]
    pub ssid: Option<String>,
    #[serde(rename = "signalPercent")]
    pub signal_percent: Option<u8>,
    #[serde(rename = "radioType")]
    pub radio_type: Option<String>,
    #[serde(rename = "channel")]
    pub channel: Option<String>,
    #[serde(rename = "authentication")]
    pub authentication: Option<String>,
    #[serde(rename = "linkSpeedMbps")]
    pub link_speed_mbps: Option<u64>,
    #[serde(rename = "bssid")]
    pub bssid: Option<String>,
    #[serde(rename = "isWired")]
    pub is_wired: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WifiNetworkItem {
    pub ssid: String,
    #[serde(rename = "signalPercent")]
    pub signal_percent: Option<u8>,
    pub authentication: String,
    pub status: String, // "connected" | "saved_in_range" | "saved_offline" | "in_range"
    #[serde(rename = "radioType")]
    pub radio_type: Option<String>,
    pub band: Option<String>,
    pub channel: Option<String>,
    #[serde(rename = "hasSavedProfile")]
    pub has_saved_profile: bool,
    pub password: Option<String>,
}

pub fn get_active_wifi_details() -> Option<ActiveConnectionDetails> {
    let output = Command::new("netsh")
        .args(["wlan", "show", "interfaces"])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .ok()?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    if !output_str.contains("State") || !output_str.contains("connected") {
        return None;
    }

    let mut details = ActiveConnectionDetails {
        connection_type: "wifi".to_string(),
        is_wired: false,
        ..Default::default()
    };

    for line in output_str.lines() {
        let parts: Vec<&str> = line.splitn(2, ':').collect();
        if parts.len() != 2 {
            continue;
        }

        let key = parts[0].trim().to_lowercase();
        let val = parts[1].trim();

        if key == "ssid" {
            details.ssid = Some(val.to_string());
        } else if key == "bssid" {
            details.bssid = Some(val.to_string());
        } else if key == "signal" {
            let pct_str = val.trim_end_matches('%').trim();
            if let Ok(pct) = pct_str.parse::<u8>() {
                details.signal_percent = Some(pct);
            }
        } else if key == "radio type" {
            details.radio_type = Some(val.to_string());
        } else if key == "channel" {
            details.channel = Some(val.to_string());
        } else if key == "authentication" {
            details.authentication = Some(val.to_string());
        } else if key == "receive rate (mbps)" || key == "transmit rate (mbps)" {
            if details.link_speed_mbps.is_none() {
                if let Ok(speed) = val.parse::<f64>() {
                    details.link_speed_mbps = Some(speed as u64);
                }
            }
        }
    }

    if details.ssid.is_some() {
        Some(details)
    } else {
        None
    }
}

pub fn get_saved_profiles() -> Vec<String> {
    let mut profiles = Vec::new();
    if let Ok(output) = Command::new("netsh")
        .args(["wlan", "show", "profiles"])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
    {
        let output_str = String::from_utf8_lossy(&output.stdout);
        for line in output_str.lines() {
            let parts: Vec<&str> = line.splitn(2, ':').collect();
            if parts.len() == 2 && parts[0].to_lowercase().contains("all user profile") {
                let name = parts[1].trim();
                if !name.is_empty() && !profiles.contains(&name.to_string()) {
                    profiles.push(name.to_string());
                }
            }
        }
    }
    profiles
}

pub fn get_wifi_password(ssid: &str) -> Option<String> {
    let name_arg = format!("name={}", ssid);
    let output = Command::new("netsh")
        .args(["wlan", "show", "profile", &name_arg, "key=clear"])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .ok()?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    for line in output_str.lines() {
        let line_trimmed = line.trim();
        if line_trimmed.to_lowercase().starts_with("key content")
            || line_trimmed.to_lowercase().starts_with("konten kunci")
        {
            let parts: Vec<&str> = line.splitn(2, ':').collect();
            if parts.len() == 2 {
                return Some(parts[1].trim().to_string());
            }
        }
    }

    None
}

struct ScannedNetwork {
    signal: u8,
    auth: String,
    radio: String,
    band: String,
    channel: String,
}

pub fn get_all_wifi_networks() -> Vec<WifiNetworkItem> {
    let active_ssid = get_active_wifi_details()
        .and_then(|d| d.ssid)
        .unwrap_or_default();
    let saved_profile_names = get_saved_profiles();
    let saved_set: HashSet<String> = saved_profile_names.iter().cloned().collect();

    // 1. Scan in-range networks
    let output = Command::new("netsh")
        .args(["wlan", "show", "networks", "mode=bssid"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let mut in_range_map: HashMap<String, ScannedNetwork> = HashMap::new();
    let mut current_ssid = String::new();
    let mut current_auth = "WPA2-Personal".to_string();
    let mut current_radio = "802.11ac".to_string();
    let mut current_band = "5 GHz".to_string();
    let mut current_channel = "1".to_string();
    let mut max_signal = 0u8;

    if let Ok(out) = output {
        let output_str = String::from_utf8_lossy(&out.stdout);

        for line in output_str.lines() {
            let trimmed = line.trim();

            if trimmed.starts_with("SSID") && trimmed.contains(':') {
                if !current_ssid.is_empty() {
                    in_range_map.insert(
                        current_ssid.clone(),
                        ScannedNetwork {
                            signal: max_signal,
                            auth: current_auth.clone(),
                            radio: current_radio.clone(),
                            band: current_band.clone(),
                            channel: current_channel.clone(),
                        },
                    );
                }

                let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
                current_ssid = if parts.len() == 2 {
                    parts[1].trim().to_string()
                } else {
                    String::new()
                };
                max_signal = 0;
            } else if trimmed.to_lowercase().starts_with("authentication") {
                let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
                if parts.len() == 2 {
                    current_auth = parts[1].trim().to_string();
                }
            } else if trimmed.to_lowercase().starts_with("signal") {
                let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
                if parts.len() == 2 {
                    let pct_str = parts[1].trim().trim_end_matches('%').trim();
                    if let Ok(pct) = pct_str.parse::<u8>() {
                        if pct > max_signal {
                            max_signal = pct;
                        }
                    }
                }
            } else if trimmed.to_lowercase().starts_with("radio type") {
                let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
                if parts.len() == 2 {
                    current_radio = parts[1].trim().to_string();
                }
            } else if trimmed.to_lowercase().starts_with("band") {
                let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
                if parts.len() == 2 {
                    current_band = parts[1].trim().to_string();
                }
            } else if trimmed.to_lowercase().starts_with("channel") {
                let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
                if parts.len() == 2 {
                    current_channel = parts[1].trim().to_string();
                }
            }
        }

        if !current_ssid.is_empty() {
            in_range_map.insert(
                current_ssid,
                ScannedNetwork {
                    signal: max_signal,
                    auth: current_auth,
                    radio: current_radio,
                    band: current_band,
                    channel: current_channel,
                },
            );
        }
    }

    let mut result = Vec::new();
    let mut processed_ssids = HashSet::new();

    // 2. Add saved profiles with passwords
    for profile_name in saved_profile_names {
        if profile_name.is_empty() {
            continue;
        }

        let is_connected = !active_ssid.is_empty() && profile_name == active_ssid;
        let in_range_info = in_range_map.get(&profile_name);
        let password = get_wifi_password(&profile_name);

        let status = if is_connected {
            "connected".to_string()
        } else if in_range_info.is_some() {
            "saved_in_range".to_string()
        } else {
            "saved_offline".to_string()
        };

        let (sig, auth, rad, band, ch) = match in_range_info {
            Some(info) => (
                Some(info.signal),
                info.auth.clone(),
                Some(info.radio.clone()),
                Some(info.band.clone()),
                Some(info.channel.clone()),
            ),
            None => (
                None,
                "WPA2-Personal".to_string(),
                None,
                None,
                None,
            ),
        };

        result.push(WifiNetworkItem {
            ssid: profile_name.clone(),
            signal_percent: sig,
            authentication: auth,
            status,
            radio_type: rad,
            band,
            channel: ch,
            has_saved_profile: true,
            password,
        });

        processed_ssids.insert(profile_name);
    }

    // 3. Add other in-range networks (unsaved / nearby)
    for (ssid, info) in in_range_map {
        if ssid.is_empty() || processed_ssids.contains(&ssid) {
            continue;
        }

        let is_connected = !active_ssid.is_empty() && ssid == active_ssid;
        let has_saved = saved_set.contains(&ssid);

        result.push(WifiNetworkItem {
            ssid: ssid.clone(),
            signal_percent: Some(info.signal),
            authentication: info.auth,
            status: if is_connected {
                "connected".to_string()
            } else {
                "in_range".to_string()
            },
            radio_type: Some(info.radio),
            band: Some(info.band),
            channel: Some(info.channel),
            has_saved_profile: has_saved,
            password: None,
        });
    }

    // Sort order:
    // 1. Connected
    // 2. Saved (In range)
    // 3. Saved (Offline)
    // 4. In range unsaved (by signal desc)
    result.sort_by(|a, b| {
        let rank = |item: &WifiNetworkItem| -> u8 {
            match item.status.as_str() {
                "connected" => 0,
                "saved_in_range" => 1,
                "saved_offline" => 2,
                _ => 3,
            }
        };

        let rank_a = rank(a);
        let rank_b = rank(b);

        if rank_a != rank_b {
            rank_a.cmp(&rank_b)
        } else {
            let sig_a = a.signal_percent.unwrap_or(0);
            let sig_b = b.signal_percent.unwrap_or(0);
            sig_b.cmp(&sig_a)
        }
    });

    result
}
