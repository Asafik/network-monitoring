import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  IconWifi,
  IconAdapters,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconCheck,
  IconRefresh,
} from '../components/Icons';
import { NetworkAdapter, NetworkMetrics, WifiNetworkItem } from '../types/network';
import { formatBytes, formatSpeed } from '../utils/formatters';

interface AdaptersViewProps {
  adapters: NetworkAdapter[];
  metrics: NetworkMetrics;
  availableNetworks: WifiNetworkItem[];
  onRefreshNetworks: () => void;
  isScanning: boolean;
}

export const AdaptersView: React.FC<AdaptersViewProps> = ({
  adapters,
  metrics,
  availableNetworks,
  onRefreshNetworks,
  isScanning,
}) => {
  const [wifiPassword, setWifiPassword] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Per-row password visibility & copied state for the table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedPasswords, setCopiedPasswords] = useState<Record<string, boolean>>({});

  const conn = metrics.connectionDetails;
  const isWifi = conn?.connectionType === 'wifi' || !!conn?.ssid;
  const isWired = conn?.connectionType === 'ethernet' || conn?.isWired;

  const toggleRowPassword = (ssid: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [ssid]: !prev[ssid],
    }));
  };

  const copyRowPassword = (ssid: string, pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedPasswords((prev) => ({ ...prev, [ssid]: true }));
    setTimeout(() => {
      setCopiedPasswords((prev) => ({ ...prev, [ssid]: false }));
    }, 2000);
  };

  const handleToggleTopPassword = () => {
    if (!isPasswordVisible) {
      if (wifiPassword !== null) {
        setIsPasswordVisible(true);
        return;
      }

      const ssid = conn?.ssid;
      if (!ssid) return;

      setIsLoadingPassword(true);
      const isTauriEnv =
        typeof window !== 'undefined' &&
        ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

      if (isTauriEnv) {
        invoke<string | null>('get_wifi_password', { ssid })
          .then((pwd) => {
            setWifiPassword(pwd || 'No Password / Open');
            setIsPasswordVisible(true);
          })
          .catch(() => {
            setWifiPassword('Unavailable');
            setIsPasswordVisible(true);
          })
          .finally(() => setIsLoadingPassword(false));
      } else {
        fetch('http://127.0.0.1:9090/api/wifi-password')
          .then((res) => res.json())
          .then((data) => {
            setWifiPassword(data.password || 'No Password / Open');
            setIsPasswordVisible(true);
          })
          .catch(() => {
            setWifiPassword('Unavailable');
            setIsPasswordVisible(true);
          })
          .finally(() => setIsLoadingPassword(false));
      }
    } else {
      setIsPasswordVisible(false);
    }
  };

  const handleCopyTopPassword = () => {
    if (wifiPassword) {
      navigator.clipboard.writeText(wifiPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="content-body">
      {/* 1. TOP SECTION: CURRENT ACTIVE CONNECTION & WI-FI DETAILS */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: isWifi ? 'rgba(2, 132, 199, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: isWifi ? '#0284c7' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isWifi ? <IconWifi size={22} /> : <IconAdapters size={22} />}
            </div>
            <div>
              <span className="card-label">
                {isWifi ? 'Active Wi-Fi Connection' : isWired ? 'Active Wired Ethernet' : 'Primary Connection'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {isWifi ? conn?.ssid || 'Connected Wi-Fi' : isWired ? 'Gigabit Ethernet (LAN)' : metrics.activeAdapter}
              </h3>
            </div>
          </div>

          <div>
            <span
              className="adapter-pill active"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
              {isWifi ? `Signal ${conn?.signalPercent ?? 99}%` : isWired ? 'Cable Connected' : 'Connected'}
            </span>
          </div>
        </div>

        {/* Detailed Connection Parameters */}
        <div className="adapter-details-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {isWifi ? (
            <>
              <div className="detail-item">
                <span className="detail-label">Active SSID</span>
                <span className="detail-value" style={{ color: '#0284c7' }}>
                  {conn?.ssid || 'Wi-Fi'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Security & Auth</span>
                <span className="detail-value">{conn?.authentication || 'WPA2-Personal'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wi-Fi Radio / Band</span>
                <span className="detail-value">
                  {conn?.radioType || '802.11ac'} {conn?.channel ? `(Ch ${conn.channel})` : ''}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Link Speed</span>
                <span className="detail-value">{conn?.linkSpeedMbps ? `${conn.linkSpeedMbps} Mbps` : '866 Mbps'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="detail-item">
                <span className="detail-label">Connection Type</span>
                <span className="detail-value" style={{ color: '#059669' }}>
                  Wired Gigabit LAN
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hardware Port</span>
                <span className="detail-value">{metrics.activeAdapter}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Link Speed</span>
                <span className="detail-value">1000 Mbps (1 Gbps Full-Duplex)</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Security</span>
                <span className="detail-value">Direct Wired LAN</span>
              </div>
            </>
          )}
        </div>

        {/* Wi-Fi Password Viewer Box */}
        {isWifi && conn?.ssid && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconLock size={16} color="#64748b" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                Active Wi-Fi Password:
              </span>
              <span
                className="mono-text"
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isPasswordVisible ? '#0f172a' : '#94a3b8',
                  background: isPasswordVisible ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                  padding: isPasswordVisible ? '2px 8px' : '0',
                  borderRadius: '6px',
                  letterSpacing: isPasswordVisible ? '0' : '2px',
                }}
              >
                {isPasswordVisible ? wifiPassword || '••••••••' : '••••••••••••'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleToggleTopPassword}
                disabled={isLoadingPassword}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                {isPasswordVisible ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                <span>{isLoadingPassword ? 'Reading...' : isPasswordVisible ? 'Hide' : 'Show Password'}</span>
              </button>

              {isPasswordVisible && wifiPassword && (
                <button
                  onClick={handleCopyTopPassword}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isCopied ? '#059669' : 'linear-gradient(90deg, #0284c7, #4f46e5)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isCopied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. MIDDLE SECTION: NETWORK INTERFACE CONTROLLERS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          Network Interface Controllers
        </h3>

        <div className="adapters-list">
          {adapters.map((adapter) => {
            const rxSpeed = formatSpeed(adapter.rxSpeedBps);
            const txSpeed = formatSpeed(adapter.txSpeedBps);

            return (
              <div key={adapter.id} className="adapter-item-card">
                <div className="adapter-item-top">
                  <div className="adapter-type-group">
                    <div className="adapter-icon-box">
                      {adapter.type === 'wifi' ? (
                        <IconWifi size={22} />
                      ) : (
                        <IconAdapters size={22} />
                      )}
                    </div>
                    <div className="adapter-titles">
                      <h3>{adapter.name}</h3>
                      <p>{adapter.description}</p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`adapter-pill ${
                        adapter.status === 'up' ? 'active' : 'inactive'
                      }`}
                    >
                      {adapter.status === 'up' ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Detailed Metrics Grid */}
                <div className="adapter-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">IPv4 Address</span>
                    <span className="detail-value">{adapter.ipV4 || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">MAC Address</span>
                    <span className="detail-value">{adapter.macAddress || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Link Speed</span>
                    <span className="detail-value">
                      {adapter.linkSpeedMbps > 0 ? `${adapter.linkSpeedMbps} Mbps` : '—'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Gateway</span>
                    <span className="detail-value">{adapter.gateway || '—'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Download Speed</span>
                    <span className="detail-value" style={{ color: '#0284c7' }}>
                      {rxSpeed.value} {rxSpeed.unit}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Upload Speed</span>
                    <span className="detail-value" style={{ color: '#7c3aed' }}>
                      {txSpeed.value} {txSpeed.unit}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Received</span>
                    <span className="detail-value">{formatBytes(adapter.rxBytes)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Sent</span>
                    <span className="detail-value">{formatBytes(adapter.txBytes)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM SECTION: SAVED WI-FI PROFILES & NEARBY SIGNALS TABLE */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="chart-title">Saved Wi-Fi Profiles & Network Scanner</span>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              All Wi-Fi networks ever connected to this PC with password recovery & nearby signals
            </p>
          </div>

          <button
            onClick={onRefreshNetworks}
            disabled={isScanning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span className={isScanning ? 'spinning' : ''} style={{ display: 'flex' }}>
              <IconRefresh size={14} />
            </span>
            <span>{isScanning ? 'Scanning...' : 'Scan Networks'}</span>
          </button>
        </div>

        <div className="incident-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Wi-Fi Network (SSID)</th>
                <th>Status</th>
                <th>Signal</th>
                <th>Security</th>
                <th>Saved Password</th>
              </tr>
            </thead>
            <tbody>
              {availableNetworks.map((net, idx) => {
                const isRowPwdVisible = !!visiblePasswords[net.ssid];
                const isRowCopied = !!copiedPasswords[net.ssid];

                return (
                  <tr key={`${net.ssid}-${idx}`}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconWifi
                          size={16}
                          color={
                            net.status === 'connected'
                              ? '#059669'
                              : net.hasSavedProfile
                              ? '#0284c7'
                              : '#64748b'
                          }
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {net.ssid || '<Hidden Network>'}
                          </div>
                          {net.band && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {net.band} {net.channel ? `(Ch ${net.channel})` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td>
                      {net.status === 'connected' ? (
                        <span
                          className="adapter-pill active"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
                          Connected
                        </span>
                      ) : net.status === 'saved_in_range' ? (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'rgba(2, 132, 199, 0.1)',
                            color: '#0284c7',
                            border: '1px solid rgba(2, 132, 199, 0.25)',
                          }}
                        >
                          Saved (In Range)
                        </span>
                      ) : net.status === 'saved_offline' ? (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'rgba(100, 116, 139, 0.08)',
                            color: '#64748b',
                            border: '1px solid rgba(100, 116, 139, 0.15)',
                          }}
                        >
                          Saved Profile
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'rgba(245, 158, 11, 0.08)',
                            color: '#d97706',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                          }}
                        >
                          Nearby Unsaved
                        </span>
                      )}
                    </td>

                    {/* Signal Column */}
                    <td>
                      {net.signalPercent !== null && net.signalPercent !== undefined ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '50px',
                              height: '6px',
                              background: '#e2e8f0',
                              borderRadius: '9999px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${net.signalPercent}%`,
                                height: '100%',
                                background:
                                  net.signalPercent > 70
                                    ? '#059669'
                                    : net.signalPercent > 40
                                    ? '#0284c7'
                                    : '#f59e0b',
                                borderRadius: '9999px',
                              }}
                            />
                          </div>
                          <span className="mono-text" style={{ fontSize: '12px', fontWeight: 600 }}>
                            {net.signalPercent}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Out of range</span>
                      )}
                    </td>

                    {/* Security Column */}
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {net.authentication || 'WPA2-Personal'}
                    </td>

                    {/* Password Column with Reveal & Copy Button */}
                    <td>
                      {net.hasSavedProfile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className="mono-text"
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: isRowPwdVisible ? '#0f172a' : '#94a3b8',
                              background: isRowPwdVisible ? 'rgba(2, 132, 199, 0.08)' : '#f1f5f9',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              letterSpacing: isRowPwdVisible ? '0' : '1px',
                              minWidth: '90px',
                              display: 'inline-block',
                            }}
                          >
                            {isRowPwdVisible ? net.password || 'Open / No Key' : '••••••••'}
                          </span>

                          <button
                            onClick={() => toggleRowPassword(net.ssid)}
                            title={isRowPwdVisible ? 'Hide Password' : 'Show Password'}
                            style={{
                              border: '1px solid var(--border-color)',
                              background: '#ffffff',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {isRowPwdVisible ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                          </button>

                          {net.password && (
                            <button
                              onClick={() => copyRowPassword(net.ssid, net.password!)}
                              title="Copy Password"
                              style={{
                                border: 'none',
                                background: isRowCopied ? '#059669' : '#0284c7',
                                color: '#ffffff',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '11px',
                                gap: '4px',
                              }}
                            >
                              {isRowCopied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {availableNetworks.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    Scanning saved profiles & nearby Wi-Fi networks...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
