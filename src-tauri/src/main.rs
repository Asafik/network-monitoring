// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Enforce Single Instance: Prevent duplicate instances from opening
    #[cfg(windows)]
    unsafe {
        use std::ptr::null_mut;
        extern "system" {
            fn CreateMutexW(lpMutexAttributes: *mut std::ffi::c_void, bInitialOwner: i32, lpName: *const u16) -> *mut std::ffi::c_void;
            fn GetLastError() -> u32;
            fn FindWindowW(lpClassName: *const u16, lpWindowName: *const u16) -> *mut std::ffi::c_void;
            fn SetForegroundWindow(hWnd: *mut std::ffi::c_void) -> i32;
            fn ShowWindow(hWnd: *mut std::ffi::c_void, nCmdShow: i32) -> i32;
        }

        let mutex_name: Vec<u16> = "Global\\NetSpeedX_SingleInstance_Mutex\0".encode_utf16().collect();
        let _handle = CreateMutexW(null_mut(), 1, mutex_name.as_ptr());
        if GetLastError() == 183 {
            // ERROR_ALREADY_EXISTS (183): An instance is already running!
            // Find existing main window, restore and bring it to front, then exit 2nd process silently
            let win_title: Vec<u16> = "NetSpeedX\0".encode_utf16().collect();
            let hwnd = FindWindowW(null_mut(), win_title.as_ptr());
            if !hwnd.is_null() {
                ShowWindow(hwnd, 9); // SW_RESTORE
                SetForegroundWindow(hwnd);
            }
            return;
        }
    }

    // Enforce native Windows Direct3D GPU acceleration & sync with display refresh rate (Hz)
    std::env::set_var(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-hardware-overlays",
    );

    network_monitor_lib::run()
}
