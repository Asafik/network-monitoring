use std::process::Command;

const RUN_KEY: &str = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
const LAYERS_KEY: &str = r"HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers";
const APP_NAME: &str = "NetPulse";

/// Check if NetPulse is registered in Windows Startup Registry
pub fn is_autostart_enabled() -> bool {
    let reg_out = Command::new("reg")
        .args(["query", RUN_KEY, "/v", APP_NAME])
        .output();

    if let Ok(out) = reg_out {
        if out.status.success() && String::from_utf8_lossy(&out.stdout).contains(APP_NAME) {
            return true;
        }
    }

    false
}

/// Enable autostart with Administrator privileges and --autostart argument (Silent / Minimized to Tray)
pub fn enable_autostart() -> Result<(), String> {
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_str = exe_path.to_string_lossy().to_string();
    let autostart_cmd = format!("{} --autostart", exe_str);

    // 1. Set Windows Run key with --autostart flag
    let run_res = Command::new("reg")
        .args([
            "add",
            RUN_KEY,
            "/v",
            APP_NAME,
            "/t",
            "REG_SZ",
            "/d",
            &autostart_cmd,
            "/f",
        ])
        .output()
        .map_err(|e| format!("Failed to configure autostart run key: {}", e))?;

    // 2. Set RUNASADMIN compatibility layer so it always has Administrator privileges
    let _ = Command::new("reg")
        .args([
            "add",
            LAYERS_KEY,
            "/v",
            &exe_str,
            "/t",
            "REG_SZ",
            "/d",
            "~ RUNASADMIN",
            "/f",
        ])
        .output();

    if run_res.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&run_res.stderr).to_string())
    }
}

/// Disable autostart from Windows Startup Registry
pub fn disable_autostart() -> Result<(), String> {
    let output = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", APP_NAME, "/f"])
        .output()
        .map_err(|e| format!("Failed to remove autostart key: {}", e))?;

    if output.status.success() || !is_autostart_enabled() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// Ensure default autostart is active on first run
pub fn init_default_autostart() {
    if !is_autostart_enabled() {
        let _ = enable_autostart();
    }
}
