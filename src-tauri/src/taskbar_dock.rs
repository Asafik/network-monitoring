#[repr(C)]
#[derive(Debug, Clone, Copy)]
struct RECT {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

const GWL_EXSTYLE: i32 = -20;
const WS_EX_TOPMOST: isize = 0x00000008;
const WS_EX_TOOLWINDOW: isize = 0x00000080;
const WS_EX_NOACTIVATE: isize = 0x08000000;
const HWND_TOPMOST: isize = -1;
const SWP_NOMOVE: u32 = 0x0002;
const SWP_NOSIZE: u32 = 0x0001;
const SWP_NOACTIVATE: u32 = 0x0010;
const SWP_SHOWWINDOW: u32 = 0x0040;

#[link(name = "user32")]
extern "system" {
    fn FindWindowW(lpClassName: *const u16, lpWindowName: *const u16) -> isize;
    fn GetWindowRect(hWnd: isize, lpRect: *mut RECT) -> i32;
    fn GetSystemMetrics(nIndex: i32) -> i32;
    fn GetWindowLongPtrW(hWnd: isize, nIndex: i32) -> isize;
    fn SetWindowLongPtrW(hWnd: isize, nIndex: i32, dwNewLong: isize) -> isize;
    fn SetWindowPos(
        hWnd: isize,
        hWndInsertAfter: isize,
        X: i32,
        Y: i32,
        cx: i32,
        cy: i32,
        uFlags: u32,
    ) -> i32;
    fn SetWindowDisplayAffinity(hWnd: isize, dwAffinity: u32) -> i32;
    fn GetForegroundWindow() -> isize;
}

use std::sync::atomic::{AtomicBool, AtomicI32, Ordering};

static TASKBAR_OFFSET: AtomicI32 = AtomicI32::new(260);
static WIDGET_ENABLED: AtomicBool = AtomicBool::new(true);

pub fn set_widget_enabled(enabled: bool) {
    WIDGET_ENABLED.store(enabled, Ordering::Relaxed);
}

pub fn is_widget_enabled() -> bool {
    WIDGET_ENABLED.load(Ordering::Relaxed)
}

pub fn set_taskbar_offset(offset: i32) {
    TASKBAR_OFFSET.store(offset, Ordering::Relaxed);
}

pub fn get_taskbar_offset() -> i32 {
    TASKBAR_OFFSET.load(Ordering::Relaxed)
}

const SM_CXSCREEN: i32 = 0;
const SM_CYSCREEN: i32 = 1;

/// Detect if the user is currently playing a Fullscreen Game or using a Fullscreen App
pub fn is_fullscreen_app_active(widget_hwnd: isize) -> bool {
    unsafe {
        let fg = GetForegroundWindow();
        if fg == 0 || fg == widget_hwnd {
            return false;
        }

        // Check if foreground window is the taskbar itself
        let tray_class: Vec<u16> = "Shell_TrayWnd\0".encode_utf16().collect();
        let tray_hwnd = FindWindowW(tray_class.as_ptr(), std::ptr::null());
        if fg == tray_hwnd {
            return false;
        }

        // Check if foreground window is Windows Desktop (Progman or WorkerW)
        let progman_class: Vec<u16> = "Progman\0".encode_utf16().collect();
        let progman_hwnd = FindWindowW(progman_class.as_ptr(), std::ptr::null());
        if fg == progman_hwnd {
            return false;
        }

        let workerw_class: Vec<u16> = "WorkerW\0".encode_utf16().collect();
        let workerw_hwnd = FindWindowW(workerw_class.as_ptr(), std::ptr::null());
        if fg == workerw_hwnd {
            return false;
        }

        let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
        GetWindowRect(fg, &mut rect);

        let screen_w = GetSystemMetrics(SM_CXSCREEN);
        let screen_h = GetSystemMetrics(SM_CYSCREEN);

        // A fullscreen game/app covers 0,0 to screen_w, screen_h
        if rect.left <= 0 && rect.top <= 0 && rect.right >= screen_w && rect.bottom >= screen_h {
            return true;
        }

        false
    }
}

pub fn make_taskbar_persistent(hwnd: isize) {
    if hwnd == 0 || !is_widget_enabled() || is_fullscreen_app_active(hwnd) {
        return;
    }
    unsafe {
        // 1. Explicitly enable screen capture for Snipping Tool & Screenshot (WDA_NONE = 0)
        SetWindowDisplayAffinity(hwnd, 0);

        // 2. Set Extended Styles to system tool window
        let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let target_style = ex_style | WS_EX_TOPMOST | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE;
        if ex_style != target_style {
            SetWindowLongPtrW(hwnd, GWL_EXSTYLE, target_style);
        }

        // 3. Keep Topmost Z-order without stealing focus
        SetWindowPos(
            hwnd,
            HWND_TOPMOST,
            0,
            0,
            0,
            0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW,
        );
    }
}

pub fn get_taskbar_dock_position(widget_width: i32, widget_height: i32) -> (i32, i32) {
    unsafe {
        let screen_w = GetSystemMetrics(SM_CXSCREEN);
        let screen_h = GetSystemMetrics(SM_CYSCREEN);
        let offset = get_taskbar_offset().max(50).min(900);

        let tray_class: Vec<u16> = "Shell_TrayWnd\0".encode_utf16().collect();
        let tray_hwnd = FindWindowW(tray_class.as_ptr(), std::ptr::null());
        if tray_hwnd != 0 {
            let mut taskbar_rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
            GetWindowRect(tray_hwnd, &mut taskbar_rect);

            let taskbar_h = (taskbar_rect.bottom - taskbar_rect.top).max(36);
            let y = taskbar_rect.top + (taskbar_h - widget_height) / 2;
            let x = (taskbar_rect.right - offset - widget_width).max(20);
            return (x, y);
        }

        // Fallback for primary screen metrics
        let x = (screen_w - offset - widget_width).max(20);
        let y = (screen_h - 40).max(0);
        (x, y)
    }
}
