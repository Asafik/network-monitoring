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
    fn FindWindowExW(
        hWndParent: isize,
        hWndChildAfter: isize,
        lpszClass: *const u16,
        lpszWindow: *const u16,
    ) -> isize;
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
}

const SM_CXSCREEN: i32 = 0;
const SM_CYSCREEN: i32 = 1;

pub fn make_taskbar_persistent(hwnd: isize) {
    if hwnd == 0 {
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

        let tray_class: Vec<u16> = "Shell_TrayWnd\0".encode_utf16().collect();
        let notify_class: Vec<u16> = "TrayNotifyWnd\0".encode_utf16().collect();

        let tray_hwnd = FindWindowW(tray_class.as_ptr(), std::ptr::null());
        if tray_hwnd != 0 {
            let mut taskbar_rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
            GetWindowRect(tray_hwnd, &mut taskbar_rect);

            let taskbar_h = (taskbar_rect.bottom - taskbar_rect.top).max(40);

            // Calculate vertical center on the taskbar
            let y = taskbar_rect.top + (taskbar_h - widget_height) / 2;

            // Try Windows 10 TrayNotifyWnd first
            let notify_hwnd = FindWindowExW(tray_hwnd, 0, notify_class.as_ptr(), std::ptr::null());
            if notify_hwnd != 0 {
                let mut notify_rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
                GetWindowRect(notify_hwnd, &mut notify_rect);

                // Ensure notify_rect.left is valid and not zero/offscreen
                if notify_rect.left > 300 && notify_rect.left < taskbar_rect.right {
                    let x = notify_rect.left - widget_width - 24;
                    return (x, y);
                }
            }

            // Windows 11 XAML taskbar: System tray with Clock + Quick Settings + Location/Mic/Apps + Chevron is ~280-360px wide.
            // Position widget comfortably to the left with dynamic 410px clearance so it never overlaps dynamic tray icons.
            let x = (taskbar_rect.right - 410 - widget_width).max(50);
            return (x, y);
        }

        // Fallback for primary screen metrics
        let x = (screen_w - 410 - widget_width).max(50);
        let y = (screen_h - 44).max(0);
        (x, y)
    }
}
