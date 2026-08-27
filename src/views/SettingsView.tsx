import React from 'react';
import { AppSettings } from '../types/network';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onToggleSpeedWidget?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onToggleSpeedWidget,
}) => {
  return (
    <div className="content-body">
      <div className="settings-section">
        {/* 1. DATA USAGE & QUOTA LIMITS */}
        <div className="settings-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Data Usage & Quota Limits</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Set bandwidth thresholds to prevent unexpected data overages
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              Quota Protection
            </span>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Daily Quota Limit</h4>
              <p>Maximum data consumption allowed per day</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="input-field mono-text"
                value={settings.dailyDataLimitGb || 10}
                onChange={(e) => onUpdateSettings({ dailyDataLimitGb: Number(e.target.value) })}
                style={{ width: '100px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>GB</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Weekly Quota Limit</h4>
              <p>Maximum data consumption allowed per week</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="input-field mono-text"
                value={settings.weeklyDataLimitGb || 50}
                onChange={(e) => onUpdateSettings({ weeklyDataLimitGb: Number(e.target.value) })}
                style={{ width: '100px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>GB</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Monthly Quota Limit</h4>
              <p>Maximum data consumption allowed per billing cycle / month</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="input-field mono-text"
                value={settings.monthlyDataLimitGb || 150}
                onChange={(e) => onUpdateSettings({ monthlyDataLimitGb: Number(e.target.value) })}
                style={{ width: '100px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>GB</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Quota Alert Threshold</h4>
              <p>Send notification when consumption reaches selected threshold</p>
            </div>
            <select
              className="input-field"
              value={settings.quotaWarningThresholdPercent || 80}
              onChange={(e) =>
                onUpdateSettings({ quotaWarningThresholdPercent: Number(e.target.value) })
              }
              style={{ width: '160px' }}
            >
              <option value="50">50% of Quota</option>
              <option value="75">75% of Quota</option>
              <option value="80">80% (Recommended)</option>
              <option value="90">90% of Quota</option>
              <option value="100">100% (Quota Exhausted)</option>
            </select>
          </div>
        </div>

        {/* 2. WINDOWS NOTIFICATIONS & ANTI-SPAM COOLDOWN */}
        <div className="settings-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Windows Toast Notifications</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Native Windows toast alerts for outages, latency spikes, or quota limits
              </p>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Enable Windows Notifications</h4>
              <p>Allow application to deliver native desktop notifications</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) =>
                  onUpdateSettings({ enableNotifications: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Anti-Spam Cooldown Timer</h4>
              <p>Minimum interval between toast notifications to prevent spam</p>
            </div>
            <select
              className="input-field"
              value={settings.notificationCooldownSecs || 60}
              onChange={(e) =>
                onUpdateSettings({ notificationCooldownSecs: Number(e.target.value) })
              }
              style={{ width: '160px' }}
            >
              <option value="30">30 Seconds</option>
              <option value="60">1 Minute (Standard)</option>
              <option value="120">2 Minutes</option>
              <option value="300">5 Minutes</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>High Latency Alert Threshold (ms)</h4>
              <p>Trigger alert when ping exceeds this threshold</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="input-field mono-text"
                value={settings.latencyWarningThreshold}
                onChange={(e) =>
                  onUpdateSettings({ latencyWarningThreshold: Number(e.target.value) })
                }
                style={{ width: '100px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>ms</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Packet Loss Alert Threshold (%)</h4>
              <p>Trigger alert when packet loss exceeds this percentage</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="input-field mono-text"
                value={settings.packetLossWarningThreshold}
                onChange={(e) =>
                  onUpdateSettings({ packetLossWarningThreshold: Number(e.target.value) })
                }
                style={{ width: '100px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>%</span>
            </div>
          </div>
        </div>

        {/* 3. TASKBAR SPEED METER WIDGET */}
        <div className="settings-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Floating Taskbar Speed Meter</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Compact always-on-top 2-line upload & download speed meter for Windows taskbar
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              NetSpeed Style
            </span>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Show Taskbar Speed Meter</h4>
              <p>Display floating real-time speed overlay on screen</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showSpeedWidget !== false}
                onChange={() => {
                  if (onToggleSpeedWidget) {
                    onToggleSpeedWidget();
                  } else {
                    onUpdateSettings({ showSpeedWidget: !settings.showSpeedWidget });
                  }
                }}
              />
              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Widget Visual Style</h4>
              <p>Choose background theme for the floating widget</p>
            </div>
            <select
              className="input-field"
              value={settings.speedWidgetStyle || 'classic'}
              onChange={(e) =>
                onUpdateSettings({ speedWidgetStyle: e.target.value as any })
              }
              style={{ width: '160px' }}
            >
              <option value="classic">Solid Dark (High Contrast)</option>
              <option value="glass">Glassmorphism (Blur)</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Reset Widget Position</h4>
              <p>Snap the floating meter back to the bottom-right taskbar clock area</p>
            </div>
            <button
              onClick={() => {
                const initialX = Math.max(window.innerWidth - 150, 40);
                const initialY = Math.max(window.innerHeight - 80, 40);
                localStorage.setItem('netpulse_widget_pos', JSON.stringify({ x: initialX, y: initialY }));
                window.location.reload();
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Dock to Taskbar
            </button>
          </div>
        </div>

        {/* 4. SYSTEM & TRAY */}
        <div className="settings-card">
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>General & System Tray</h3>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Launch on Windows Startup (Auto-Start)</h4>
              <p>Automatically start Network Monitor in background when Windows boots</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.startWithWindows}
                onChange={(e) =>
                  onUpdateSettings({ startWithWindows: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Close Button (X) Minimizes to Tray</h4>
              <p>Keep monitoring in background inside Windows System Tray when closed</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.minimizeToTray}
                onChange={(e) =>
                  onUpdateSettings({ minimizeToTray: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
