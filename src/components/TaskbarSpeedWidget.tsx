import React, { useState, useEffect, useRef } from 'react';
import { formatSpeed } from '../utils/formatters';

interface TaskbarSpeedWidgetProps {
  downloadBps: number;
  uploadBps: number;
  pingMs?: number;
  activeNetworkName?: string;
  onOpenDashboard?: () => void;
  onCloseWidget?: () => void;
  styleMode?: 'classic' | 'glass' | 'compact';
}

export const TaskbarSpeedWidget: React.FC<TaskbarSpeedWidgetProps> = ({
  downloadBps,
  uploadBps,
  pingMs = 0,
  activeNetworkName = 'Wi-Fi / Ethernet',
  onOpenDashboard,
  onCloseWidget,
  styleMode = 'classic',
}) => {
  // Draggable position state (default to bottom right dock above Windows taskbar)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('netpulse_widget_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      } catch {}
    }
    // Default: bottom right area (typical Windows Taskbar clock corner)
    const initialX = Math.max(window.innerWidth - 150, 40);
    const initialY = Math.max(window.innerHeight - 80, 40);
    return { x: initialX, y: initialY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('netpulse_widget_locked') === 'true';
  });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [themeMode, setThemeMode] = useState<'classic' | 'glass'>(styleMode === 'glass' ? 'glass' : 'classic');

  const widgetRef = useRef<HTMLDivElement>(null);

  // Format speeds matching exact NetSpeedMonitor precision
  const dlFmt = formatSpeed(downloadBps);
  const ulFmt = formatSpeed(uploadBps);

  // Drag listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isLocked) return;
      const newX = Math.max(4, Math.min(window.innerWidth - 130, e.clientX - dragOffset.x));
      const newY = Math.max(4, Math.min(window.innerHeight - 56, e.clientY - dragOffset.y));
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      localStorage.setItem('netpulse_widget_pos', JSON.stringify(newPos));
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isLocked]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setShowContextMenu(false);
    if (showContextMenu) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showContextMenu]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isLocked) return; // Only left click for dragging
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleToggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    localStorage.setItem('netpulse_widget_locked', String(nextLocked));
    setShowContextMenu(false);
  };

  const handleToggleTheme = () => {
    const next = themeMode === 'classic' ? 'glass' : 'classic';
    setThemeMode(next);
    setShowContextMenu(false);
  };

  const handleResetPosition = () => {
    const initialX = Math.max(window.innerWidth - 150, 40);
    const initialY = Math.max(window.innerHeight - 80, 40);
    const pos = { x: initialX, y: initialY };
    setPosition(pos);
    localStorage.setItem('netpulse_widget_pos', JSON.stringify(pos));
    setShowContextMenu(false);
  };

  return (
    <>
      <div
        ref={widgetRef}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onDoubleClick={onOpenDashboard}
        title={`${activeNetworkName} | Ping: ${pingMs}ms\n(Double-click to open NetPulse, Right-click for options)`}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 99999,
          userSelect: 'none',
          cursor: isLocked ? 'pointer' : isDragging ? 'grabbing' : 'grab',
          background:
            themeMode === 'glass'
              ? 'rgba(15, 23, 42, 0.78)'
              : '#111827',
          backdropFilter: themeMode === 'glass' ? 'blur(12px)' : 'none',
          border: themeMode === 'glass' ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '7px',
          padding: '4px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '2px',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
          fontFamily: '"JetBrains Mono", "Segoe UI Mono", Consolas, monospace',
          letterSpacing: '-0.2px',
          minWidth: '110px',
          transition: isDragging ? 'none' : 'box-shadow 0.15s ease',
        }}
      >
        {/* ROW 1: UPLOAD SPEED (Orange / Amber Arrow ↑) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', lineHeight: 1.1 }}>
          <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '13px', display: 'inline-flex', alignItems: 'center', filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))' }}>
            ↑:
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '13px', textAlign: 'right', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {ulFmt.value}
            </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '10px' }}>
              {ulFmt.unit}
            </span>
          </div>
        </div>

        {/* ROW 2: DOWNLOAD SPEED (Bright Lime / Green Arrow ↓) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', lineHeight: 1.1 }}>
          <span style={{ color: '#22c55e', fontWeight: 900, fontSize: '13px', display: 'inline-flex', alignItems: 'center', filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))' }}>
            ↓:
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '13px', textAlign: 'right', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {dlFmt.value}
            </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '10px' }}>
              {dlFmt.unit}
            </span>
          </div>
        </div>
      </div>

      {/* POPUP CONTEXT MENU (ON RIGHT CLICK) */}
      {showContextMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.min(contextMenuPos.x, window.innerWidth - 170)}px`,
            top: `${Math.min(contextMenuPos.y, window.innerHeight - 180)}px`,
            zIndex: 100000,
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '6px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: '160px',
            fontSize: '12px',
            color: '#f8fafc',
            animation: 'fadeIn 0.12s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '4px',
            }}
          >
            NetPulse Speed Meter
          </div>

          <button
            onClick={() => {
              setShowContextMenu(false);
              onOpenDashboard?.();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 10px',
              color: '#ffffff',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(2, 132, 199, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>🖥️</span>
            <span>Open NetPulse</span>
          </button>

          <button
            onClick={handleToggleLock}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 10px',
              color: '#ffffff',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>{isLocked ? '🔓' : '🔒'}</span>
            <span>{isLocked ? 'Unlock Position' : 'Lock Position'}</span>
          </button>

          <button
            onClick={handleToggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 10px',
              color: '#ffffff',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>🎨</span>
            <span>Theme: {themeMode === 'classic' ? 'Solid Dark' : 'Glass Blur'}</span>
          </button>

          <button
            onClick={handleResetPosition}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 10px',
              color: '#ffffff',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>📍</span>
            <span>Dock to Taskbar Corner</span>
          </button>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

          <button
            onClick={() => {
              setShowContextMenu(false);
              onCloseWidget?.();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 10px',
              color: '#f87171',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>❌</span>
            <span>Hide Speed Meter</span>
          </button>
        </div>
      )}
    </>
  );
};
