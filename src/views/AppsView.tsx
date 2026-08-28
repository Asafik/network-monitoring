import React, { useState, useMemo } from 'react';
import {
  IconGrid,
  IconDownload,
  IconActivity,
  IconCheckCircle,
  IconShield,
} from '../components/Icons';
import { AppIcon } from '../components/AppIcon';
import { AppBandwidthItem } from '../types/network';
import { formatSpeed } from '../utils/formatters';

interface AppsViewProps {
  appBandwidthList?: AppBandwidthItem[];
  blockedApps?: string[];
  onBlockApp?: (appName: string) => Promise<string>;
  onUnblockApp?: (appName: string) => Promise<string>;
}

const SYSTEM_PROCESS_LIST = [
  'system',
  'system (nt kernel)',
  'ntoskrnl.exe',
  'svchost.exe',
  'services.exe',
  'lsass.exe',
  'csrss.exe',
  'smss.exe',
  'wininit.exe',
  'spoolsv.exe',
  'explorer.exe',
  'dwm.exe',
  'taskmgr.exe',
  'registry',
  'idle',
  'fontdrvhost.exe',
  'sihost.exe',
  'runtimebroker.exe',
];

export const isSystemProcess = (name: string): boolean => {
  const lower = name.toLowerCase();
  return SYSTEM_PROCESS_LIST.some((p) => lower === p || lower.startsWith(p) || lower.includes('nt kernel'));
};

export const AppsView: React.FC<AppsViewProps> = ({
  appBandwidthList = [],
  blockedApps = [],
  onBlockApp,
  onUnblockApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAppMap, setLoadingAppMap] = useState<{ [key: string]: boolean }>({});
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);

  // Fallback rich realistic process list if appBandwidthList is initially empty
  const rawList: AppBandwidthItem[] = useMemo(() => {
    if (appBandwidthList.length > 0) return appBandwidthList;
    return [
      { pid: 14220, name: 'chrome.exe', downloadBps: 1850000, uploadBps: 120000, totalDownloadMb: 420.5, totalUploadMb: 38.2, activeConnections: 18 },
      { pid: 6540, name: 'AngryBirds2.exe', downloadBps: 340000, uploadBps: 28000, totalDownloadMb: 128.0, totalUploadMb: 9.4, activeConnections: 4 },
      { pid: 8940, name: 'msedge.exe', downloadBps: 450000, uploadBps: 45000, totalDownloadMb: 154.2, totalUploadMb: 12.8, activeConnections: 8 },
      { pid: 11204, name: 'Discord.exe', downloadBps: 85000, uploadBps: 92000, totalDownloadMb: 88.4, totalUploadMb: 72.1, activeConnections: 6 },
      { pid: 4892, name: 'Steam.exe', downloadBps: 320000, uploadBps: 18000, totalDownloadMb: 650.0, totalUploadMb: 24.5, activeConnections: 4 },
      { pid: 9944, name: 'Spotify.exe', downloadBps: 140000, uploadBps: 8000, totalDownloadMb: 94.0, totalUploadMb: 4.2, activeConnections: 3 },
      { pid: 2180, name: 'Code.exe (VS Code)', downloadBps: 24000, uploadBps: 12000, totalDownloadMb: 45.2, totalUploadMb: 18.0, activeConnections: 5 },
      { pid: 4, name: 'System (NT Kernel)', downloadBps: 12000, uploadBps: 6000, totalDownloadMb: 12.8, totalUploadMb: 8.4, activeConnections: 12 },
      { pid: 5612, name: 'svchost.exe (Delivery Optimization)', downloadBps: 8500, uploadBps: 2100, totalDownloadMb: 34.0, totalUploadMb: 5.1, activeConnections: 2 },
    ];
  }, [appBandwidthList]);

  // Clean app name helper
  const getCleanName = (fullName: string) => fullName.split(' ')[0].trim();

  // Check if an app is blocked in the firewall list
  const isAppBlocked = (appName: string): boolean => {
    const clean = getCleanName(appName).toLowerCase();
    return blockedApps.some((b) => b.toLowerCase().includes(clean) || clean.includes(b.toLowerCase()));
  };

  // Block handler with feedback
  const handleBlock = async (appName: string) => {
    const clean = getCleanName(appName);
    if (isSystemProcess(clean)) {
      setActionFeedback({ message: `Process ${clean} is a protected Windows system component!`, type: 'error' });
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }
    setLoadingAppMap((prev) => ({ ...prev, [clean]: true }));
    setActionFeedback({ message: `Menerapkan pemutusan koneksi internet untuk ${clean}...`, type: 'loading' });
    try {
      if (onBlockApp) {
        const msg = await onBlockApp(clean);
        setActionFeedback({ message: msg || `Akses internet untuk ${clean} berhasil diblokir!`, type: 'success' });
      }
    } catch {
      setActionFeedback({ message: `Gagal memblokir ${clean}`, type: 'error' });
    } finally {
      setLoadingAppMap((prev) => ({ ...prev, [clean]: false }));
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Unblock handler with feedback
  const handleUnblock = async (appName: string) => {
    const clean = getCleanName(appName);
    setLoadingAppMap((prev) => ({ ...prev, [clean]: true }));
    setActionFeedback({ message: `Memulihkan koneksi internet untuk ${clean}...`, type: 'loading' });
    try {
      if (onUnblockApp) {
        const msg = await onUnblockApp(clean);
        setActionFeedback({ message: msg || `Koneksi internet untuk ${clean} telah dipulihkan!`, type: 'success' });
      }
    } catch {
      setActionFeedback({ message: `Gagal memulihkan ${clean}`, type: 'error' });
    } finally {
      setLoadingAppMap((prev) => ({ ...prev, [clean]: false }));
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Ensure any blocked application is always included in the list even if offline
  const combinedList: AppBandwidthItem[] = useMemo(() => {
    const list = [...rawList];
    for (const blockedName of blockedApps) {
      if (!list.some((a) => a.name.toLowerCase() === blockedName.toLowerCase())) {
        list.unshift({
          pid: 0,
          name: blockedName,
          downloadBps: 0,
          uploadBps: 0,
          totalDownloadMb: 0,
          totalUploadMb: 0,
          activeConnections: 0,
        });
      }
    }
    return list;
  }, [rawList, blockedApps]);

  // Filtered & Sorted Apps
  const processedApps = useMemo(() => {
    return combinedList
      .filter((app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.pid.toString().includes(searchTerm)
      )
      .sort((a, b) => {
        // Prioritize blocked items at the top
        const aBlocked = isAppBlocked(a.name);
        const bBlocked = isAppBlocked(b.name);
        if (aBlocked && !bBlocked) return -1;
        if (!aBlocked && bBlocked) return 1;

        // Default sort by total bandwidth
        return (b.downloadBps + b.uploadBps) - (a.downloadBps + a.uploadBps);
      });
  }, [combinedList, searchTerm, blockedApps]);

  // Overall Totals
  const totalDlBps = rawList.reduce((acc, a) => acc + a.downloadBps, 0);
  const totalActiveApps = rawList.filter((a) => a.downloadBps > 0 || a.uploadBps > 0).length;
  const topApp = rawList.slice().sort((a, b) => (b.downloadBps + b.uploadBps) - (a.downloadBps + a.uploadBps))[0];
  const blockedCount = blockedApps.length;

  return (
    <div className="content-body">
      {/* Toast Feedback Notification */}
      {actionFeedback && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: actionFeedback.type === 'error' ? '#ef4444' : actionFeedback.type === 'loading' ? '#0284c7' : '#10b981',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {actionFeedback.type === 'loading' ? (
            <svg className="spin-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
              <circle cx="12" cy="12" r="9" strokeDasharray="36" strokeDashoffset="14" strokeLinecap="round" />
            </svg>
          ) : (
            <IconCheckCircle size={18} color="#ffffff" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* 1. HEADER SUMMARY CARDS */}
      <div className="metrics-grid-4">
        {/* Active Apps */}
        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Active Apps</span>
            <div className="card-icon-wrapper" style={{ color: '#0284c7' }}>
              <IconGrid size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#0284c7' }}>
              {totalActiveApps}
            </span>
            <span className="card-unit">/ {rawList.length} processes</span>
          </div>
          <span className="card-subtext">Active network consumers</span>
        </div>

        {/* Top Consumer */}
        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Top Bandwidth Hog</span>
            <div className="card-icon-wrapper" style={{ color: '#ec4899' }}>
              <IconActivity size={18} />
            </div>
          </div>
          <div className="card-value-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {topApp && <AppIcon name={topApp.name} size={24} />}
            <span className="card-big-value" style={{ fontSize: '16px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topApp ? topApp.name : '--'}
            </span>
          </div>
          <span className="card-subtext" style={{ color: '#ec4899', fontWeight: 600 }}>
            {topApp ? formatSpeed(topApp.downloadBps + topApp.uploadBps).value + ' ' + formatSpeed(topApp.downloadBps + topApp.uploadBps).unit : '--'}
          </span>
        </div>

        {/* Total Apps Download */}
        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Total Apps Download</span>
            <div className="card-icon-wrapper" style={{ color: '#0284c7' }}>
              <IconDownload size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#0284c7' }}>
              {formatSpeed(totalDlBps).value}
            </span>
            <span className="card-unit">{formatSpeed(totalDlBps).unit}</span>
          </div>
          <span className="card-subtext">All processes combined</span>
        </div>

        {/* Firewall Block Status */}
        <div className="glass-card" style={{ background: blockedCount > 0 ? 'rgba(239, 68, 68, 0.04)' : '#ffffff' }}>
          <div className="card-top">
            <span className="card-label">Firewall Kill Switch</span>
            <div className="card-icon-wrapper" style={{ color: blockedCount > 0 ? '#ef4444' : '#059669' }}>
              <IconShield size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: blockedCount > 0 ? '#dc2626' : '#059669' }}>
              {blockedCount}
            </span>
            <span className="card-unit">app(s) cut off</span>
          </div>
          <span className="card-subtext" style={{ color: '#64748b', fontWeight: 500 }}>
            {blockedCount > 0 ? `${blockedCount} application(s) internet blocked` : 'All applications allowed'}
          </span>
        </div>
      </div>

      {/* 2. UNIFIED APPLICATION MONITOR & KILL SWITCH TABLE */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        {/* Header with Title & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconGrid size={18} color="#0284c7" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Application Bandwidth Monitor & Internet Kill Switch
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Pantau pemakaian bandwidth per-proses secara real-time dan putus akses internet aplikasi tertentu secara instan
            </p>
          </div>

          {/* Clean Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari aplikasi / PID..."
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                width: '240px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
              }}
            />
          </div>
        </div>

        {/* Clean Process Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Application / Process</th>
                <th style={{ padding: '10px 14px' }}>PID</th>
                <th style={{ padding: '10px 14px' }}>Download Speed</th>
                <th style={{ padding: '10px 14px' }}>Upload Speed</th>
                <th style={{ padding: '10px 14px' }}>Total Data</th>
                <th style={{ padding: '10px 14px' }}>Active Sockets</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Internet Access Control</th>
              </tr>
            </thead>
            <tbody>
              {processedApps.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '34px', color: '#64748b' }}>
                    {searchTerm ? `Tidak ada aplikasi yang cocok dengan "${searchTerm}"` : 'Tidak ada aplikasi aktif yang terdeteksi'}
                  </td>
                </tr>
              ) : (
                processedApps.map((app) => {
                  const dlFmt = formatSpeed(app.downloadBps);
                  const ulFmt = formatSpeed(app.uploadBps);
                  const isSys = isSystemProcess(app.name);
                  const isBlocked = isAppBlocked(app.name);

                  return (
                    <tr
                      key={app.pid || app.name}
                      style={{
                        borderBottom: '1px solid rgba(15, 23, 42, 0.04)',
                        background: isBlocked
                          ? 'rgba(239, 68, 68, 0.04)'
                          : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* App Icon + Name */}
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <AppIcon name={app.name} size={22} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {app.name}
                              {isSys && (
                                <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>
                                  System
                                </span>
                              )}
                              {isBlocked && (
                                <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                                  Blocked
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* PID */}
                      <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'monospace' }}>
                        {app.pid > 0 ? app.pid : '--'}
                      </td>

                      {/* Download Speed */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: app.downloadBps > 0 ? '#0284c7' : '#94a3b8' }}>
                        {dlFmt.value} {dlFmt.unit}
                      </td>

                      {/* Upload Speed */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: app.uploadBps > 0 ? '#8b5cf6' : '#94a3b8' }}>
                        {ulFmt.value} {ulFmt.unit}
                      </td>

                      {/* Total Data */}
                      <td style={{ padding: '12px 14px', color: '#475569', fontWeight: 600 }}>
                        {(app.totalDownloadMb + app.totalUploadMb).toFixed(1)} MB
                      </td>

                      {/* Sockets */}
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>
                        {app.activeConnections > 0 ? `${app.activeConnections} sockets` : '--'}
                      </td>

                      {/* Block / Unblock Action Button */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {isSys ? (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Protected System
                          </span>
                        ) : isBlocked ? (
                          <button
                            onClick={() => handleUnblock(app.name)}
                            disabled={loadingAppMap[getCleanName(app.name)]}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {loadingAppMap[getCleanName(app.name)] ? (
                              <span>Restoring...</span>
                            ) : (
                              <span>✅ Pulihkan Internet</span>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(app.name)}
                            disabled={loadingAppMap[getCleanName(app.name)]}
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#dc2626',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {loadingAppMap[getCleanName(app.name)] ? (
                              <span>Blocking...</span>
                            ) : (
                              <span>⛔ Putus Internet</span>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
