import React from 'react';
import { AppSettings } from '../types/network';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  return (
    <div className="content-body">
      <div className="settings-section">
        <div className="settings-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>General & System Tray</h3>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Start with Windows</h4>
              <p>Automatically launch Network Monitor when Windows boots up.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoStartWithWindows}
                onChange={(e) =>
                  onUpdateSettings({ autoStartWithWindows: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Close Window to System Tray</h4>
              <p>Minimizes to the notification area instead of closing the application.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.startMinimizedToTray}
                onChange={(e) =>
                  onUpdateSettings({ startMinimizedToTray: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Monitoring & Ping</h3>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Default Ping Host</h4>
              <p>Target IP or hostname used for latency & packet loss evaluation.</p>
            </div>
            <input
              type="text"
              className="input-field mono-text"
              value={settings.defaultPingHost}
              onChange={(e) => onUpdateSettings({ defaultPingHost: e.target.value })}
              style={{ width: '160px' }}
            />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Sampling Interval (ms)</h4>
              <p>Frequency of bandwidth traffic sampling rate.</p>
            </div>
            <select
              className="input-field"
              value={settings.pollingIntervalMs}
              onChange={(e) =>
                onUpdateSettings({ pollingIntervalMs: Number(e.target.value) })
              }
              style={{ width: '160px' }}
            >
              <option value="500">500 ms (Fast)</option>
              <option value="1000">1000 ms (Standard)</option>
              <option value="2000">2000 ms (Battery saver)</option>
            </select>
          </div>
        </div>

        <div className="settings-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Notifications & Alerts</h3>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Disconnect Notification</h4>
              <p>Show Windows desktop notification when internet connection drops.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifyOnDisconnect}
                onChange={(e) =>
                  onUpdateSettings({ notifyOnDisconnect: e.target.checked })
                }
              />
              <span className="slider" />
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>High Latency Alert</h4>
              <p>Alert when ping exceeds threshold ({settings.latencyThresholdMs} ms).</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifyOnHighLatency}
                onChange={(e) =>
                  onUpdateSettings({ notifyOnHighLatency: e.target.checked })
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
