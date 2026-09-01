use std::io::Write;
use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;
const RUN_KEY: &str = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";
const APP_NAME: &str = "NetSpeedX";

/// Extract the exact registered executable path from Windows Registry
fn get_registry_autostart_path() -> Option<String> {
    let reg_out = Command::new("reg")
        .args(["query", RUN_KEY, "/v", APP_NAME])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .ok()?;

    if reg_out.status.success() {
        let stdout = String::from_utf8_lossy(&reg_out.stdout);
        for line in stdout.lines() {
            if line.contains(APP_NAME) && line.contains("REG_SZ") {
                let parts: Vec<&str> = line.split("REG_SZ").collect();
                if parts.len() == 2 {
                    let raw_val = parts[1].trim();
                    // Strip quotes and arguments like --autostart
                    let clean = raw_val
                        .replace('"', "")
                        .replace("--autostart", "")
                        .trim()
                        .to_string();
                    return Some(clean);
                }
            }
        }
    }
    None
}

/// Check if NetSpeedX is correctly registered for the CURRENT executable path
pub fn is_autostart_enabled() -> bool {
    let current_exe = match std::env::current_exe() {
        Ok(p) => p.to_string_lossy().to_string(),
        Err(_) => return false,
    };

    if let Some(reg_path) = get_registry_autostart_path() {
        if reg_path.eq_ignore_ascii_case(&current_exe) && std::path::Path::new(&reg_path).exists() {
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

/// Enable autostart with 3-Layer Redundancy:
/// 1. Windows Registry (HKCU Run Key)
/// 2. Startup Folder Shortcut (.lnk with Working Directory)
/// 3. Windows Task Scheduler (OnLogon Task - Bypasses UAC delays for portable apps)
pub fn enable_autostart() -> Result<(), String> {
    let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_str = exe_path.to_string_lossy().to_string();
    let working_dir = exe_path
        .parent()
        .unwrap_or(std::path::Path::new(""))
        .to_string_lossy()
        .to_string();

    // 1. Clean up obsolete entries
    let _ = Command::new("reg")
        .args([
            "delete",
            r"HKCU\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers",
            "/v",
            &exe_str,
            "/f",
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let _ = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", "NetPulse", "/f"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    // 2. Layer 1: Windows Registry Run Key
    let escaped_exe = exe_str.replace('\\', "\\\\");
    let reg_content = format!(
        "Windows Registry Editor Version 5.00\r\n\r\n[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run]\r\n\"NetSpeedX\"=\"\\\"{}\\\" --autostart\"\r\n",
        escaped_exe
    );

    let temp_reg = std::env::temp_dir().join("netspeedx_autostart.reg");
    if let Ok(mut file) = std::fs::File::create(&temp_reg) {
        let _ = file.write_all(reg_content.as_bytes());
    }

    let _ = Command::new("reg")
        .args(["import", &temp_reg.to_string_lossy()])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let _ = std::fs::remove_file(&temp_reg);

    // 3. Layer 2: Startup Folder Shortcut (.lnk)
    if let Ok(appdata) = std::env::var("APPDATA") {
        let startup_dir = std::path::Path::new(&appdata)
            .join("Microsoft")
            .join("Windows")
            .join("Start Menu")
            .join("Programs")
            .join("Startup");

        if startup_dir.exists() {
            let old_shortcut = startup_dir.join("NetPulse.lnk");
            if old_shortcut.exists() {
                let _ = std::fs::remove_file(old_shortcut);
            }

            let ps_cmd = format!(
                "$wsh = New-Object -ComObject WScript.Shell; $s = $wsh.CreateShortcut([IO.Path]::Combine($env:APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'NetSpeedX.lnk')); $s.TargetPath = '{}'; $s.Arguments = '--autostart'; $s.WorkingDirectory = '{}'; $s.Save()",
                exe_str.replace('\'', "''"),
                working_dir.replace('\'', "''")
            );
            let _ = Command::new("powershell")
                .args(["-NoProfile", "-Command", &ps_cmd])
                .creation_flags(CREATE_NO_WINDOW)
                .output();
        }
    }

    // 4. Layer 3: Windows Task Scheduler (OnLogon Task for portable apps)
    let task_tr = format!("\"{}\" --autostart", exe_str);
    let _ = Command::new("schtasks")
        .args([
            "/create",
            "/tn",
            "NetSpeedX",
            "/tr",
            &task_tr,
            "/sc",
            "onlogon",
            "/f",
            "/rl",
            "limited",
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    Ok(())
}

/// Disable autostart from Registry Run, Startup Folder, and Task Scheduler
pub fn disable_autostart() -> Result<(), String> {
    let _ = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", APP_NAME, "/f"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let _ = Command::new("reg")
        .args(["delete", RUN_KEY, "/v", "NetPulse", "/f"])
        .creation_flags(CREATE_NO_WINDOW)
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

    let _ = Command::new("schtasks")
        .args(["/delete", "/tn", "NetSpeedX", "/f"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    Ok(())
}

/// Ensure autostart is synchronized with the current executable path
pub fn init_default_autostart() {
    let current_exe = match std::env::current_exe() {
        Ok(p) => p.to_string_lossy().to_string(),
        Err(_) => return,
    };

    // If autostart was registered to an old/moved location or not registered, update it!
    let need_update = match get_registry_autostart_path() {
        Some(path) => !path.eq_ignore_ascii_case(&current_exe) || !std::path::Path::new(&path).exists(),
        None => true,
    };

    if need_update {
        let _ = enable_autostart();
    }
}
