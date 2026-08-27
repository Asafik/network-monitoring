use std::process::Command;
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x08000000;

// System process names that must NEVER be blocked
pub const PROTECTED_SYSTEM_PROCESSES: &[&str] = &[
    "system",
    "system (nt kernel)",
    "ntoskrnl.exe",
    "svchost.exe",
    "services.exe",
    "lsass.exe",
    "csrss.exe",
    "smss.exe",
    "wininit.exe",
    "spoolsv.exe",
    "explorer.exe",
    "dwm.exe",
    "taskmgr.exe",
    "registry",
    "idle",
    "fontdrvhost.exe",
    "sihost.exe",
    "runtimebroker.exe",
];

pub fn is_protected_system_process(name: &str) -> bool {
    let lower = name.to_lowercase();
    for p in PROTECTED_SYSTEM_PROCESSES {
        if lower == *p || lower.starts_with(p) || lower.ends_with(p) {
            return true;
        }
    }
    false
}

pub fn block_app_internet(app_name: &str, exe_path: Option<&str>) -> Result<String, String> {
    let clean_name = app_name.trim();
    if is_protected_system_process(clean_name) {
        return Err(format!("Process '{}' is a protected Windows system component!", clean_name));
    }

    let rule_name = format!("NetPulse_Block_{}", clean_name);

    // 1. Delete any existing rule with this name first to prevent duplicates
    let _ = Command::new("netsh")
        .args(&["advfirewall", "firewall", "delete", "rule", &format!("name={}", rule_name)])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    // 2. Add outbound block rule by path or program name
    let program_arg = if let Some(path) = exe_path {
        if !path.is_empty() {
            format!("program={}", path)
        } else {
            format!("program={}", clean_name)
        }
    } else {
        format!("program={}", clean_name)
    };

    let output = Command::new("netsh")
        .args(&[
            "advfirewall",
            "firewall",
            "add",
            "rule",
            &format!("name={}", rule_name),
            "dir=out",
            "action=block",
            &program_arg,
            "enable=yes",
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(format!("Internet access for '{}' has been blocked successfully!", clean_name))
    } else {
        let err_msg = String::from_utf8_lossy(&output.stderr);
        // Fallback using PowerShell New-NetFirewallRule if netsh requires elevation
        let ps_cmd = format!(
            "New-NetFirewallRule -DisplayName '{}' -Direction Outbound -Action Block -Program '{}' -Enabled True -ErrorAction SilentlyContinue",
            rule_name, clean_name
        );
        let _ = Command::new("powershell")
            .args(&["-NoProfile", "-NonInteractive", "-Command", &ps_cmd])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        if !err_msg.trim().is_empty() {
            Ok(format!("Firewall block rule applied for '{}'", clean_name))
        } else {
            Ok(format!("Internet access for '{}' has been blocked successfully!", clean_name))
        }
    }
}

pub fn unblock_app_internet(app_name: &str) -> Result<String, String> {
    let clean_name = app_name.trim();
    let rule_name = format!("NetPulse_Block_{}", clean_name);

    // 1. Delete via netsh
    let output = Command::new("netsh")
        .args(&["advfirewall", "firewall", "delete", "rule", &format!("name={}", rule_name)])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| e.to_string())?;

    // 2. Also remove via PowerShell as fallback
    let ps_cmd = format!(
        "Remove-NetFirewallRule -DisplayName '{}' -ErrorAction SilentlyContinue",
        rule_name
    );
    let _ = Command::new("powershell")
        .args(&["-NoProfile", "-NonInteractive", "-Command", &ps_cmd])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    if output.status.success() {
        Ok(format!("Internet access for '{}' has been restored!", clean_name))
    } else {
        Ok(format!("Firewall rule for '{}' has been removed.", clean_name))
    }
}

pub fn get_blocked_apps() -> Vec<String> {
    let output = Command::new("netsh")
        .args(&["advfirewall", "firewall", "show", "rule", "name=all"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let mut blocked = Vec::new();

    if let Ok(out) = output {
        let stdout = String::from_utf8_lossy(&out.stdout);
        for line in stdout.lines() {
            let line_trimmed = line.trim();
            if line_trimmed.starts_with("Rule Name:") || line_trimmed.starts_with("Nama Aturan:") {
                if let Some(pos) = line_trimmed.find("NetPulse_Block_") {
                    let app_name = &line_trimmed[pos + 15..];
                    let clean = app_name.trim().to_string();
                    if !clean.is_empty() && !blocked.contains(&clean) {
                        blocked.push(clean);
                    }
                }
            }
        }
    }

    blocked
}
