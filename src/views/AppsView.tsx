import React, { useState, useMemo } from 'react';
import {
  IconGrid,
  IconDownload,
  IconActivity,
  IconCheckCircle,
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
  const [customAppName, setCustomAppName] = useState('');
  const [activeCategory, setActiveCategory] = useState<'installed' | 'all' | 'blocked'>('installed');
  const [sortBy, setSortBy] = useState<'download' | 'upload' | 'total' | 'connections'>('download');
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

  // Block handler with loading overlay
  const handleBlock = async (appName: string) => {
    const clean = getCleanName(appName);
    if (isSystemProcess(clean)) {
      setActionFeedback({ message: `Process ${clean} is a protected Windows system component!`, type: 'error' });
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }
    setLoadingAppMap((prev) => ({ ...prev, [clean]: true }));
    setActionFeedback({ message: `Applying Windows Firewall block rule for ${clean}...`, type: 'loading' });
    try {
      if (onBlockApp) {
        const msg = await onBlockApp(clean);
        setActionFeedback({ message: msg || `Internet access for ${clean} blocked!`, type: 'success' });
      }
    } catch {
      setActionFeedback({ message: `Failed to block ${clean}`, type: 'error' });
    } finally {
      setLoadingAppMap((prev) => ({ ...prev, [clean]: false }));
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  // Unblock handler with loading overlay
  const handleUnblock = async (appName: string) => {
    const clean = getCleanName(appName);
    setLoadingAppMap((prev) => ({ ...prev, [clean]: true }));
    setActionFeedback({ message: `Removing Windows Firewall rule for ${clean}...`, type: 'loading' });
    try {
      if (onUnblockApp) {
        const msg = await onUnblockApp(clean);
        setActionFeedback({ message: msg || `Internet connection for ${clean} restored!`, type: 'success' });
      }
    } catch {
      setActionFeedback({ message: `Failed to unblock ${clean}`, type: 'error' });
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
    let list = combinedList.filter((app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.pid.toString().includes(searchTerm)
    );

    if (activeCategory === 'installed') {
      list = list.filter((app) => !isSystemProcess(app.name));
    } else if (activeCategory === 'blocked') {
      list = list.filter((app) => isAppBlocked(app.name));
    }

    return list.sort((a, b) => {
      // Prioritize blocked items at the top
      const aBlocked = isAppBlocked(a.name);
      const bBlocked = isAppBlocked(b.name);
      if (aBlocked && !bBlocked) return -1;
      if (!aBlocked && bBlocked) return 1;

      if (sortBy === 'download') return b.downloadBps - a.downloadBps;
      if (sortBy === 'upload') return b.uploadBps - a.uploadBps;
      if (sortBy === 'total') return (b.totalDownloadMb + b.totalUploadMb) - (a.totalDownloadMb + a.totalUploadMb);
      if (sortBy === 'connections') return b.activeConnections - a.activeConnections;
      return 0;
    });
  }, [combinedList, searchTerm, activeCategory, sortBy, blockedApps]);

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
            top: '20px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '10px',
            background:
              actionFeedback.type === 'success'
                ? '#059669'
                : actionFeedback.type === 'loading'
                ? '#0284c7'
                : '#dc2626',
            color: '#ffffff',
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

        {/* Blocked Apps Status Card */}
        <div className="glass-card" style={{ background: blockedCount > 0 ? 'rgba(239, 68, 68, 0.04)' : '#ffffff' }}>
          <div className="card-top">
            <span className="card-label">Cut Off Apps (Firewall)</span>
            <div className="card-icon-wrapper" style={{ color: blockedCount > 0 ? '#dc2626' : '#059669' }}>
              <IconActivity size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: blockedCount > 0 ? '#dc2626' : '#059669' }}>
              {blockedCount}
            </span>
            <span className="card-unit">apps blocked</span>
          </div>
          <span className="card-subtext" style={{ color: blockedCount > 0 ? '#dc2626' : '#64748b', fontWeight: blockedCount > 0 ? 700 : 400 }}>
            {blockedCount > 0 ? 'Internet access blocked' : 'All applications connected'}
          </span>
        </div>
      </div>

      {/* 2. MAIN APPLICATION MONITOR TABLE & CONTROLS */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
        {/* Title & Category Tabs Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconGrid size={18} color="#0284c7" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Application Bandwidth & Internet Kill Switch
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Block or restore network connectivity for user applications instantly (Windows Firewall Kill Switch)
            </p>
          </div>

          {/* Quick Manual Kill Switch Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>🎯 Quick Block:</span>
            <input
              type="text"
              value={customAppName}
              onChange={(e) => setCustomAppName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customAppName.trim()) {
                  handleBlock(customAppName.trim());
                  setCustomAppName('');
                }
              }}
              placeholder="e.g. AngryBirds2.exe, Game.exe"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                color: '#0f172a',
                outline: 'none',
                width: '180px',
              }}
            />
            <button
              onClick={() => {
                if (customAppName.trim() && !loadingAppMap[getCleanName(customAppName)]) {
                  handleBlock(customAppName.trim());
                  setCustomAppName('');
                }
              }}
              disabled={!customAppName.trim() || loadingAppMap[getCleanName(customAppName)]}
              style={{
                background: !customAppName.trim() ? '#cbd5e1' : loadingAppMap[getCleanName(customAppName)] ? '#f87171' : '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: customAppName.trim() && !loadingAppMap[getCleanName(customAppName)] ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {loadingAppMap[getCleanName(customAppName)] ? (
                <>
                  <svg className="spin-anim" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                    <circle cx="12" cy="12" r="9" strokeDasharray="36" strokeDashoffset="14" strokeLinecap="round" />
                  </svg>
                  <span>Blocking...</span>
                </>
              ) : (
                <span>⛔ Block Now</span>
              )}
            </button>
          </div>

          {/* Search Input & Category Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search app name / PID..."
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                color: '#0f172a',
                outline: 'none',
                width: '190px',
              }}
            />

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setActiveCategory('installed')}
                style={{
                  background: activeCategory === 'installed' ? '#0284c7' : 'transparent',
                  color: activeCategory === 'installed' ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: activeCategory === 'installed' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Installed Apps
              </button>

              <button
                onClick={() => setActiveCategory('all')}
                style={{
                  background: activeCategory === 'all' ? '#0284c7' : 'transparent',
                  color: activeCategory === 'all' ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: activeCategory === 'all' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                All Processes ({rawList.length})
              </button>

              <button
                onClick={() => setActiveCategory('blocked')}
                style={{
                  background: activeCategory === 'blocked' ? '#dc2626' : 'transparent',
                  color: activeCategory === 'blocked' ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: activeCategory === 'blocked' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Blocked ({blockedCount})
              </button>
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              {[
                { id: 'download', label: 'Download' },
                { id: 'upload', label: 'Upload' },
                { id: 'total', label: 'Total MB' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  style={{
                    background: sortBy === s.id ? '#0f172a' : 'transparent',
                    color: sortBy === s.id ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: sortBy === s.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Process Table with Cut / Block Action */}
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
                    {activeCategory === 'blocked'
                      ? 'No applications currently blocked from the internet.'
                      : `No applications found matching "${searchTerm}"`}
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
                      key={app.pid}
                      style={{
                        borderBottom: '1px solid rgba(15, 23, 42, 0.04)',
                        background: isBlocked
                          ? 'rgba(239, 68, 68, 0.04)'
                          : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* App Name with Icon */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <AppIcon name={app.name} size={28} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: isBlocked ? '#dc2626' : '#0f172a' }}>
                              {app.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {isSys ? 'Windows Core System' : 'User Installed Program'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="mono-text" style={{ padding: '10px 14px', color: '#64748b' }}>
                        {app.pid}
                      </td>

                      <td className="mono-text" style={{ padding: '10px 14px', fontWeight: 700, color: isBlocked ? '#94a3b8' : '#0284c7' }}>
                        {isBlocked ? '0 B/s' : `${dlFmt.value} ${dlFmt.unit}`}
                      </td>

                      <td className="mono-text" style={{ padding: '10px 14px', fontWeight: 700, color: isBlocked ? '#94a3b8' : '#7c3aed' }}>
                        {isBlocked ? '0 B/s' : `${ulFmt.value} ${ulFmt.unit}`}
                      </td>

                      <td className="mono-text" style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                        {app.totalDownloadMb.toFixed(1)} MB
                      </td>

                      <td className="mono-text" style={{ padding: '10px 14px', color: '#475569' }}>
                        {isBlocked ? '0 sockets' : `${app.activeConnections} sockets`}
                      </td>

                      {/* ACTION: CUT / RESTORE INTERNET CONTROL */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {isSys ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '5px 12px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              display: 'inline-block',
                            }}
                            title="This core system process is protected and cannot be blocked"
                          >
                            System Protected
                          </span>
                        ) : isBlocked ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#dc2626',
                              }}
                            >
                              Blocked
                            </span>
                            <button
                              onClick={() => handleUnblock(app.name)}
                              disabled={loadingAppMap[getCleanName(app.name)]}
                              style={{
                                background: loadingAppMap[getCleanName(app.name)] ? '#6ee7b7' : '#059669',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: loadingAppMap[getCleanName(app.name)] ? 'wait' : 'pointer',
                                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                                transition: 'all 0.15s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              {loadingAppMap[getCleanName(app.name)] ? (
                                <>
                                  <svg className="spin-anim" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                                    <circle cx="12" cy="12" r="9" strokeDasharray="36" strokeDashoffset="14" strokeLinecap="round" />
                                  </svg>
                                  <span>Restoring...</span>
                                </>
                              ) : (
                                <span>Restore Access</span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBlock(app.name)}
                            disabled={loadingAppMap[getCleanName(app.name)]}
                            style={{
                              background: loadingAppMap[getCleanName(app.name)] ? '#fee2e2' : '#ffffff',
                              color: '#dc2626',
                              border: '1px solid rgba(220, 38, 38, 0.35)',
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: loadingAppMap[getCleanName(app.name)] ? 'wait' : 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                            onMouseEnter={(e) => {
                              if (!loadingAppMap[getCleanName(app.name)]) {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loadingAppMap[getCleanName(app.name)]) {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.color = '#dc2626';
                              }
                            }}
                            title="Block all internet and outbound traffic for this application (Windows Firewall)"
                          >
                            {loadingAppMap[getCleanName(app.name)] ? (
                              <>
                                <svg className="spin-anim" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3">
                                  <circle cx="12" cy="12" r="9" strokeDasharray="36" strokeDashoffset="14" strokeLinecap="round" />
                                </svg>
                                <span>Blocking...</span>
                              </>
                            ) : (
                              <span>Block Internet</span>
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
