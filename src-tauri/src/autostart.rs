use std::io::Write;
use std::process::Command;

const RUN_KEY: &str = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
const APP_NAME: &str = "NetSpeedX";

/// Check if NetSpeedX is registered in Windows Startup Registry or Startup Folder
pub fn is_autostart_enabled() -> bool {
    let reg_out = Command::new("reg")
        .args(["query", RUN_KEY, "/v", APP_NAME])
        .output();

    if let Ok(out) = reg_out {
        if out.status.success() && String::from_utf8_lossy(&out.stdout).contains(APP_NAME) {
            return true;
        }
    }

    // Also check startup folder shortcut
    if let Ok(appdata) = std::env::var("APPDATA") {
        let shortcut_path = std::path::Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("Startup")
            .join("NetSpeedX.lnk");
        if shortcut_path.exists() {
            return true;
        }
    }

    false
}

/// Enable autostart with guaranteed clean formatting (Registry Run + Startup Folder Shortcut)
pub fn enable_autostart() -> Result<(), String> {
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_str = exe_path.to_string_lossy().to_string();

    // 1. Remove any leftover RUNASADMIN compatibility flag or old NetPulse entries
    let _ = Command::new("reg")
        .args([
            "delete",
            r"HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers",
            "/v",
            &exe_str,
            "/f",
        ])
        .output();

    let _ = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", "NetPulse", "/f"])
        .output();

    // 2. Write and import .reg file for 100% clean quote formatting without commandline escape bugs
    let escaped_exe = exe_str.replace('\\', "\\\\");
    let reg_content = format!(
        "Windows Registry Editor Version 5.00\r\n\r\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]\r\n\"NetSpeedX\"=\"\\\"{}\\\" --autostart\"\r\n",
        escaped_exe
    );

    let temp_reg = std::env::temp_dir().join("netspeedx_autostart.reg");
    if let Ok(mut file) = std::fs::File::create(&temp_reg) {
        let _ = file.write_all(reg_content.as_bytes());
    }

    let output = Command::new("reg")
        .args(["import", &temp_reg.to_string_lossy()])
        .output();

    let _ = std::fs::remove_file(&temp_reg);

    // 3. Also place shortcut in Startup folder for 100% reliability
    if let Ok(appdata) = std::env::var("APPDATA") {
        let startup_dir = std::path::Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("Startup");

        if startup_dir.exists() {
            // Delete old NetPulse.lnk if exists
            let old_shortcut = startup_dir.join("NetPulse.lnk");
            if old_shortcut.exists() {
                let _ = std::fs::remove_file(old_shortcut);
            }

            let working_dir = exe_path
                .parent()
                .unwrap_or(std::path::Path::new(""))
                .to_string_lossy()
                .replace('\'', "''");

            let ps_cmd = format!(
                "$wsh = New-Object -ComObject WScript.Shell; $s = $wsh.CreateShortcut([IO.Path]::Combine($env:APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'NetSpeedX.lnk')); $s.TargetPath = '{}'; $s.Arguments = '--autostart'; $s.WorkingDirectory = '{}'; $s.Save()",
                exe_str.replace('\'', "''"),
                working_dir
            );
            let _ = Command::new("powershell")
                .args(["-NoProfile", "-Command", &ps_cmd])
                .output();
        }
    }

    match output {
        Ok(out) if out.status.success() => Ok(()),
        Ok(out) => Err(String::from_utf8_lossy(&out.stderr).to_string()),
        Err(e) => Err(e.to_string()),
    }
}

/// Disable autostart from both Registry Run and Startup Folder
pub fn disable_autostart() -> Result<(), String> {
    let _ = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", APP_NAME, "/f"])
        .output();

    let _ = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", "NetPulse", "/f"])
        .output();

    if let Ok(appdata) = std::env::var("APPDATA") {
        let startup_dir = std::path::Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("Startup");

        let shortcut_path = startup_dir.join("NetSpeedX.lnk");
        if shortcut_path.exists() {
            let _ = std::fs::remove_file(shortcut_path);
        }

        let old_shortcut = startup_dir.join("NetPulse.lnk");
        if old_shortcut.exists() {
            let _ = std::fs::remove_file(old_shortcut);
        }
    }

    Ok(())
}

/// Ensure default autostart is active on first run
pub fn init_default_autostart() {
    if !is_autostart_enabled() {
        let _ = enable_autostart();
    }
}
