use std::process::Command;

const RUN_KEY: &str = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
const APP_NAME: &str = "NetPulse";

/// Check if NetPulse is registered in Windows Startup Registry
pub fn is_autostart_enabled() -> bool {
    let output = Command::new("reg")
        .args(["query", RUN_KEY, "/v", APP_NAME])
        .output();

    match output {
        Ok(out) => out.status.success() && String::from_utf8_lossy(&out.stdout).contains(APP_NAME),
        Err(_) => false,
    }
}

/// Enable autostart by writing executable path to HKCU Run
pub fn enable_autostart() -> Result<(), String> {
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_str = exe_path.to_string_lossy().to_string();

    let output = Command::new("reg")
        .args([
            "add",
            RUN_KEY,
            "/v",
            APP_NAME,
            "/t",
            "REG_SZ",
            "/d",
            &exe_str,
            "/f",
        ])
        .output()
        .map_err(|e| format!("Failed to execute reg.exe: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Disable autostart by deleting NetPulse from HKCU Run
pub fn disable_autostart() -> Result<(), String> {
    let output = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", APP_NAME, "/f"])
        .output()
        .map_err(|e| format!("Failed to execute reg.exe: {}", e))?;

    // Even if it didn't exist, we consider it successfully disabled
    if output.status.success() || !is_autostart_enabled() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Ensure default autostart is active on first run
pub fn init_default_autostart() {
    // If not set yet, enable it by default
    if !is_autostart_enabled() {
        let _ = enable_autostart();
    }
}
