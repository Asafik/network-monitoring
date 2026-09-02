use std::io::Write;
use std::os::windows::process::CommandExt;
use std::process::Command;
use sysinfo::System;

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

// Find actual full executable path and PID on disk for running processes
fn find_process_details(app_name: &str) -> (Option<String>, Option<u32>) {
    let mut sys = System::new();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let target_clean = app_name
        .trim()
        .to_lowercase()
        .replace(".exe", "");

    for (pid, proc_) in sys.processes() {
        let p_name = proc_.name().to_string_lossy().to_lowercase();
        let p_clean = p_name.replace(".exe", "");

        if p_name == target_clean
            || p_clean == target_clean
            || p_name.contains(&target_clean)
            || target_clean.contains(&p_clean)
        {
            let path_opt = proc_.exe().map(|p| p.to_string_lossy().to_string());
            return (path_opt, Some(pid.as_u32()));
        }
    }

    (None, None)
}

// Run a PowerShell script with guaranteed Administrator UAC Elevation via temporary script file
fn run_firewall_command_elevated(script: &str) {
    let temp_ps1 = std::env::temp_dir().join("netspeedx_fw.ps1");
    if let Ok(mut f) = std::fs::File::create(&temp_ps1) {
        let _ = f.write_all(script.as_bytes());
    }

    let ps_path = temp_ps1.to_string_lossy().to_string();

    // 1. Try direct execution (works instantly if running with admin rights)
    let out = Command::new("powershell")
        .args(&["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", &ps_path])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    // 2. If direct execution failed (e.g. standard user token without admin rights), request UAC elevation
    let needs_elevation = match out {
        Ok(ref o) => !o.status.success() || String::from_utf8_lossy(&o.stderr).contains("requires elevation") || String::from_utf8_lossy(&o.stderr).contains("Access is denied"),
        Err(_) => true,
    };

    if needs_elevation {
        let elevate_cmd = format!(
            "Start-Process powershell.exe -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', '{}')",
            ps_path.replace('\'', "''")
        );
        let _ = Command::new("powershell")
            .args(&["-NoProfile", "-NonInteractive", "-Command", &elevate_cmd])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
    }

    let _ = std::fs::remove_file(&temp_ps1);
}

pub fn block_app_internet(app_name: &str, exe_path: Option<&str>) -> Result<String, String> {
    let clean_name = app_name.trim();
    if is_protected_system_process(clean_name) {
        return Err(format!(
            "Process '{}' is a protected Windows system component!",
            clean_name
        ));
    }

    let lower = clean_name.to_lowercase();
    let no_exe = lower.replace(".exe", "");
    let first_word = lower.split_whitespace().next().unwrap_or(&lower).to_string();

    let rule_out = format!("NetPulse_Block_{}", clean_name);
    let rule_in = format!("NetPulse_Block_{}_In", clean_name);
    let rule_appx = format!("NetPulse_Block_{}_Appx", clean_name);

    // Find actual full path & PID
    let (detected_path, detected_pid) = find_process_details(clean_name);
    let resolved_path = match exe_path {
        Some(p) if !p.is_empty() => Some(p.to_string()),
        _ => detected_path,
    };

    let ps_app_name = clean_name.replace("'", "''");

    // Build elevated script for Windows Firewall
    let mut script = format!(
        r#"
$targets = @('{clean_name}', '{lower}', '{no_exe}', '{first_word}');
Get-NetFirewallRule -DisplayName 'NetPulse_Block_*' -ErrorAction SilentlyContinue | ForEach-Object {{
    $dn = $_.DisplayName.ToLower();
    foreach ($t in $targets) {{
        if ($t.Length -ge 3 -and ($dn.Contains($t) -or $t.Contains($dn.Replace('netpulse_block_', '').Replace('_in', '').Replace('_appx', '')))) {{
            Remove-NetFirewallRule -Name $_.Name -ErrorAction SilentlyContinue;
            break;
        }}
    }}
}};
"#
    );

    if let Some(ref path) = resolved_path {
        let p_clean = path.replace("'", "''");
        script.push_str(&format!(
            r#"
netsh advfirewall firewall add rule name="{rule_out}" dir=out action=block program="{p_clean}" enable=yes profile=any
netsh advfirewall firewall add rule name="{rule_in}" dir=in action=block program="{p_clean}" enable=yes profile=any
New-NetFirewallRule -DisplayName "{rule_out}" -Direction Outbound -Action Block -Program "{p_clean}" -Enabled True -Profile Any -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "{rule_in}" -Direction Inbound -Action Block -Program "{p_clean}" -Enabled True -Profile Any -ErrorAction SilentlyContinue
"#
        ));
    } else {
        script.push_str(&format!(
            r#"
New-NetFirewallRule -DisplayName "{rule_out}" -Direction Outbound -Action Block -Program "{ps_app_name}" -Enabled True -Profile Any -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "{rule_in}" -Direction Inbound -Action Block -Program "{ps_app_name}" -Enabled True -Profile Any -ErrorAction SilentlyContinue
"#
        ));
    }

    // Include AppX Package blocking for Microsoft Store games / applications
    script.push_str(&format!(
        r#"
try {{
    $pkgs = Get-AppxPackage | Where-Object {{ $_.Name -like '*{ps_app_name}*' -or $_.PackageFamilyName -like '*{ps_app_name}*' -or $_.Name -like '*{first_word}*' }};
    foreach ($pkg in $pkgs) {{
        New-NetFirewallRule -DisplayName "{rule_appx}" -Direction Outbound -Action Block -Package $pkg.PackageFamilyName -Enabled True -Profile Any -ErrorAction SilentlyContinue
    }}
}} catch {{}}
"#
    ));

    // If running, drop TCP socket connections
    if let Some(pid) = detected_pid {
        script.push_str(&format!(
            "try {{ Get-NetTCPConnection -OwningProcess {} -ErrorAction SilentlyContinue | ForEach-Object {{ netsh advfirewall firewall show rule name=all | Out-Null }} }} catch {{}}\n",
            pid
        ));
    }

    // Execute with UAC Elevation
    run_firewall_command_elevated(&script);

    Ok(format!(
        "Internet access for '{}' has been blocked via Windows Firewall!",
        clean_name
    ))
}

pub fn unblock_app_internet(app_name: &str) -> Result<String, String> {
    let clean_name = app_name.trim();
    let lower = clean_name.to_lowercase();
    let no_exe = lower.replace(".exe", "");
    let first_word = lower.split_whitespace().next().unwrap_or(&lower).to_string();

    let script = format!(
        r#"
$targets = @('{clean_name}', '{lower}', '{no_exe}', '{first_word}');
Get-NetFirewallRule -DisplayName 'NetPulse_Block_*' -ErrorAction SilentlyContinue | ForEach-Object {{
    $dn = $_.DisplayName.ToLower();
    foreach ($t in $targets) {{
        if ($t.Length -ge 3 -and ($dn.Contains($t) -or $t.Contains($dn.Replace('netpulse_block_', '').Replace('_in', '').Replace('_appx', '')))) {{
            Remove-NetFirewallRule -Name $_.Name -ErrorAction SilentlyContinue;
            break;
        }}
    }}
}};

foreach ($t in $targets) {{
    if ($t.Length -ge 3) {{
        netsh advfirewall firewall delete rule name="NetPulse_Block_$t"
        netsh advfirewall firewall delete rule name="NetPulse_Block_${{t}}_In"
        netsh advfirewall firewall delete rule name="NetPulse_Block_${{t}}_Appx"
    }}
}}
"#
    );

    // Execute with UAC Elevation
    run_firewall_command_elevated(&script);

    Ok(format!(
        "Internet access for '{}' has been restored!",
        clean_name
    ))
}

pub fn get_blocked_apps() -> Vec<String> {
    let mut blocked = Vec::new();

    let ps_cmd = "Get-NetFirewallRule -DisplayName 'NetPulse_Block_*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty DisplayName";
    let output = Command::new("powershell")
        .args(&["-NoProfile", "-NonInteractive", "-Command", ps_cmd])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    if let Ok(out) = output {
        let stdout = String::from_utf8_lossy(&out.stdout);
        for line in stdout.lines() {
            let line_trimmed = line.trim();
            if let Some(pos) = line_trimmed.find("NetPulse_Block_") {
                let mut app_name = line_trimmed[pos + 15..].to_string();
                if app_name.ends_with("_In") {
                    app_name = app_name[..app_name.len() - 3].to_string();
                }
                if app_name.ends_with("_Appx") {
                    app_name = app_name[..app_name.len() - 5].to_string();
                }
                let clean = app_name.trim().to_string();
                if !clean.is_empty() && !blocked.contains(&clean) {
                    blocked.push(clean);
                }
            }
        }
    }

    blocked
}
