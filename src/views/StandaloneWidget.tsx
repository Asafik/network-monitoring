import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { NetworkMetrics } from '../types/network';
import { formatSpeed } from '../utils/formatters';

const parseMetrics = (data: any): NetworkMetrics | null => {
  if (!data) return null;
  const raw = data.metrics || data;
  if (
    raw &&
    (typeof raw.downloadSpeed === 'number' ||
      typeof raw.download_speed === 'number')
  ) {
    return {
      downloadSpeed: raw.downloadSpeed ?? raw.download_speed ?? 0,
      uploadSpeed: raw.uploadSpeed ?? raw.upload_speed ?? 0,
      totalDownloaded: raw.totalDownloaded ?? raw.total_downloaded ?? 0,
      totalUploaded: raw.totalUploaded ?? raw.total_uploaded ?? 0,
      ping: raw.ping ?? 0,
      jitter: raw.jitter ?? 0,
      packetLoss: raw.packetLoss ?? raw.packet_loss ?? 0,
      status: raw.status || 'online',
      activeAdapter: raw.activeAdapter || raw.active_adapter || 'Wi-Fi',
      ipAddress: raw.ipAddress || raw.ip_address || '127.0.0.1',
      gateway: raw.gateway || '192.168.1.1',
      dns: raw.dns || '1.1.1.1',
      timestamp: raw.timestamp || Date.now(),
      healthScore: raw.healthScore || raw.health_score || 95,
      healthStatus: raw.healthStatus || raw.health_status || 'Excellent',
      pingSpikesCount: raw.pingSpikesCount || raw.ping_spikes_count || 0,
    };
  }
  return null;
};

export const StandaloneWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    totalDownloaded: 0,
    totalUploaded: 0,
    ping: 0,
    jitter: 0,
    packetLoss: 0,
    status: 'online',
    activeAdapter: 'Wi-Fi / Ethernet',
    ipAddress: '127.0.0.1',
    gateway: '192.168.1.1',
    dns: '1.1.1.1',
    timestamp: Date.now(),
    healthScore: 95,
    healthStatus: 'Excellent',
    pingSpikesCount: 0,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [bgStyle, setBgStyle] = useState<'transparent' | 'dark' | 'glass'>('transparent');

  useEffect(() => {
    // Make root document and body completely transparent for seamless Windows taskbar integration
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    const isTauriEnv =
      typeof window !== 'undefined' &&
      ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

    const updateStyleFromStr = (val: string) => {
      if (val === 'glass') {
        setBgStyle('glass');
      } else if (val === 'classic' || val === 'dark') {
        setBgStyle('dark');
      } else {
        setBgStyle('transparent');
      }
    };

    // Load initial preference
    try {
      const saved = localStorage.getItem('netpulse_settings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.speedWidgetStyle) updateStyleFromStr(s.speedWidgetStyle);
      }
    } catch {}

    // Listen for storage events (fired across webviews in same app)
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('netpulse_settings');
        if (saved) {
          const s = JSON.parse(saved);
          if (s.speedWidgetStyle) updateStyleFromStr(s.speedWidgetStyle);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);

    let unlisten: (() => void) | undefined;
    let unlistenStyle: (() => void) | undefined;

    if (isTauriEnv) {
      listen<any>('network-metrics', (event) => {
        const parsed = parseMetrics(event.payload);
        if (parsed) {
          setMetrics(parsed);
        }
      }).then((fn) => {
        unlisten = fn;
      });

      listen<string>('speed_widget_style_change', (event) => {
        if (event.payload) {
          updateStyleFromStr(event.payload);
        }
      }).then((fn) => {
        unlistenStyle = fn;
      });
    }

    let pollInterval: any;
    if (!isTauriEnv) {
      const pollMetrics = () => {
        fetch('http://127.0.0.1:9090/api/metrics')
          .then((res) => res.json())
          .then((data) => {
            const parsed = parseMetrics(data);
            if (parsed) {
              setMetrics(parsed);
            }
          })
          .catch(() => {});
      };
      pollMetrics();
      pollInterval = setInterval(pollMetrics, 1000);
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (unlisten) unlisten();
      if (unlistenStyle) unlistenStyle();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleOpenMain = () => {
    try {
      invoke('show_main_window_command').catch(() => {});
    } catch {}
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
  };

  const handleCloseMenu = () => setShowMenu(false);

  useEffect(() => {
    if (showMenu) {
      window.addEventListener('click', handleCloseMenu);
      return () => window.removeEventListener('click', handleCloseMenu);
    }
  }, [showMenu]);

  const dlFmt = formatSpeed(metrics.downloadSpeed);
  const ulFmt = formatSpeed(metrics.uploadSpeed);

  return (
    <div
      data-tauri-drag-region
      onContextMenu={handleContextMenu}
      onDoubleClick={handleOpenMain}
      title={`${metrics.activeAdapter} | Ping: ${metrics.ping}ms\n(TrafficMonitor Style Taskbar Meter)\nDouble-click: Open Dashboard | Drag: Move on Taskbar`}
      style={{
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box',
        background:
          bgStyle === 'transparent'
            ? 'transparent'
            : bgStyle === 'glass'
            ? 'rgba(15, 23, 42, 0.85)'
            : '#090d16',
        borderRadius: bgStyle === 'transparent' ? '0px' : '5px',
        padding: '1px 5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '0px',
        userSelect: 'none',
        cursor: 'move',
        fontFamily:
          '"Segoe UI", "JetBrains Mono", Consolas, -apple-system, sans-serif',
        overflow: 'hidden',
        border:
          bgStyle === 'transparent'
            ? 'none'
            : bgStyle === 'glass'
            ? '1px solid rgba(14, 165, 233, 0.65)'
            : '1px solid #334155',
        boxShadow:
          bgStyle === 'transparent'
            ? 'none'
            : bgStyle === 'glass'
            ? '0 0 10px rgba(14, 165, 233, 0.35)'
            : '0 2px 6px rgba(0,0,0,0.6)',
      }}
    >
      {/* ROW 1: UPLOAD (TrafficMonitor Balanced Style: Orange Arrow ↑: + Speed) */}
      <div
        data-tauri-drag-region
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          lineHeight: '17px',
          height: '17px',
          gap: '5px',
          paddingRight: '1px',
        }}
      >
        <span
          data-tauri-drag-region
          style={{
            color: '#f59e0b',
            fontWeight: 800,
            fontSize: '11.5px',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          ↑:
        </span>
        <div
          data-tauri-drag-region
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '3px',
            minWidth: '56px',
            justifyContent: 'flex-end',
          }}
        >
          <span
            data-tauri-drag-region
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '11.5px',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              letterSpacing: '-0.2px',
            }}
          >
            {ulFmt.value}
          </span>
          <span
            data-tauri-drag-region
            style={{
              color: '#cbd5e1',
              fontWeight: 700,
              fontSize: '9px',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {ulFmt.unit}
          </span>
        </div>
      </div>

      {/* ROW 2: DOWNLOAD (TrafficMonitor Balanced Style: Lime Arrow ↓: + Speed) */}
      <div
        data-tauri-drag-region
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          lineHeight: '17px',
          height: '17px',
          gap: '5px',
          paddingRight: '1px',
        }}
      >
        <span
          data-tauri-drag-region
          style={{
            color: '#22c55e',
            fontWeight: 800,
            fontSize: '11.5px',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          ↓:
        </span>
        <div
          data-tauri-drag-region
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '3px',
            minWidth: '56px',
            justifyContent: 'flex-end',
          }}
        >
          <span
            data-tauri-drag-region
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '11.5px',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              letterSpacing: '-0.2px',
            }}
          >
            {dlFmt.value}
          </span>
          <span
            data-tauri-drag-region
            style={{
              color: '#cbd5e1',
              fontWeight: 700,
              fontSize: '9px',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {dlFmt.unit}
          </span>
        </div>
      </div>

      {/* Mini Context Menu */}
      {showMenu && (
        <div
          style={{
            position: 'fixed',
            left: '4px',
            top: '4px',
            zIndex: 99999,
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: '140px',
            fontSize: '11px',
            color: '#ffffff',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setShowMenu(false);
              handleOpenMain();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 8px',
              color: '#ffffff',
              textAlign: 'left',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🖥️ Open Dashboard
          </button>

          <button
            onClick={() => {
              setShowMenu(false);
              invoke('snap_widget_to_taskbar_command').catch(() => {});
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 8px',
              color: '#38bdf8',
              textAlign: 'left',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📍 Snap to Taskbar
          </button>

          <button
            onClick={() => {
              setBgStyle(bgStyle === 'transparent' ? 'dark' : 'transparent');
              setShowMenu(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 8px',
              color: '#cbd5e1',
              textAlign: 'left',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            🎨 {bgStyle === 'transparent' ? 'Solid Dark' : 'Transparent'}
          </button>
        </div>
      )}
    </div>
  );
};
