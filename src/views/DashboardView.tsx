import React, { useState } from 'react';
import {
  IconDownload,
  IconUpload,
  IconActivity,
  IconZap,
  IconShield,
  IconGlobe,
} from '../components/Icons';
import { NetworkMetrics, HistoryPoint, DataUsageSummary } from '../types/network';
import { formatSpeed, formatBytes } from '../utils/formatters';

interface DashboardViewProps {
  metrics: NetworkMetrics;
  history: HistoryPoint[];
  usageSummary?: DataUsageSummary;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  history,
  usageSummary,
}) => {
  const [usagePeriod, setUsagePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const dl = formatSpeed(metrics.downloadSpeed);
  const ul = formatSpeed(metrics.uploadSpeed);

  // SVG Chart path calculation for live bandwidth wave
  const chartPoints = history.slice(-30);
  const maxBps = Math.max(
    ...chartPoints.map((p) => Math.max(p.downloadBps, p.uploadBps)),
    1024 * 100 // minimum scale 100 KB/s
  );

  const width = 800;
  const height = 180;

  const getCoordinates = (points: HistoryPoint[], key: 'downloadBps' | 'uploadBps') => {
    if (points.length < 2) return '';
    return points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - (p[key] / maxBps) * (height - 20) - 10;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const dlPath = getCoordinates(chartPoints, 'downloadBps');
  const ulPath = getCoordinates(chartPoints, 'uploadBps');

  // Usage Bar Chart Data selection
  const currentUsageItems =
    usagePeriod === 'daily'
      ? usageSummary?.daily || [
          { label: 'Senin', downloadGb: 2.4, uploadGb: 0.5, totalGb: 2.9 },
          { label: 'Selasa', downloadGb: 3.1, uploadGb: 0.7, totalGb: 3.8 },
          { label: 'Rabu', downloadGb: 1.9, uploadGb: 0.4, totalGb: 2.3 },
          { label: 'Kamis', downloadGb: 4.2, uploadGb: 0.9, totalGb: 5.1 },
          { label: 'Jumat', downloadGb: 3.8, uploadGb: 0.8, totalGb: 4.6 },
          { label: 'Sabtu', downloadGb: 5.1, uploadGb: 1.2, totalGb: 6.3 },
          { label: 'Hari Ini', downloadGb: 2.1, uploadGb: 0.4, totalGb: 2.5 },
        ]
      : usagePeriod === 'weekly'
      ? usageSummary?.weekly || [
          { label: 'Minggu 1', downloadGb: 14.2, uploadGb: 2.8, totalGb: 17.0 },
          { label: 'Minggu 2', downloadGb: 18.6, uploadGb: 3.9, totalGb: 22.5 },
          { label: 'Minggu 3', downloadGb: 12.8, uploadGb: 2.1, totalGb: 14.9 },
          { label: 'Minggu Ini', downloadGb: 15.3, uploadGb: 2.6, totalGb: 17.9 },
        ]
      : usageSummary?.monthly || [
          { label: 'Mar', downloadGb: 42.5, uploadGb: 8.1, totalGb: 50.6 },
          { label: 'Apr', downloadGb: 58.2, uploadGb: 11.4, totalGb: 69.6 },
          { label: 'Mei', downloadGb: 49.0, uploadGb: 9.2, totalGb: 58.2 },
          { label: 'Jun', downloadGb: 63.4, uploadGb: 12.8, totalGb: 76.2 },
          { label: 'Jul', downloadGb: 52.8, uploadGb: 10.1, totalGb: 62.9 },
          { label: 'Bulan Ini', downloadGb: 47.1, uploadGb: 8.9, totalGb: 56.0 },
        ];

  const maxUsageGb = Math.max(...currentUsageItems.map((item) => item.totalGb), 1.0);

  return (
    <div className="content-body">
      {/* 1. 4 MAIN STAT CARDS */}
      <div className="metrics-grid-4">
        {/* Download Card */}
        <div className="glass-card glow-cyan">
          <div className="card-top">
            <span className="card-label">Download Speed</span>
            <div className="card-icon-wrap download">
              <IconDownload size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value">{dl.value}</span>
            <span className="card-unit">{dl.unit}</span>
          </div>
          <div className="card-subtext">
            <span>Total:</span>
            <span className="mono-text" style={{ color: 'var(--text-secondary)' }}>
              {formatBytes(metrics.totalDownloaded)}
            </span>
          </div>
        </div>

        {/* Upload Card */}
        <div className="glass-card glow-purple">
          <div className="card-top">
            <span className="card-label">Upload Speed</span>
            <div className="card-icon-wrap upload">
              <IconUpload size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value">{ul.value}</span>
            <span className="card-unit">{ul.unit}</span>
          </div>
          <div className="card-subtext">
            <span>Total:</span>
            <span className="mono-text" style={{ color: 'var(--text-secondary)' }}>
              {formatBytes(metrics.totalUploaded)}
            </span>
          </div>
        </div>

        {/* Latency (Ping) Card */}
        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Latency / Ping</span>
            <div className="card-icon-wrap ping">
              <IconActivity size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value">{metrics.ping.toFixed(0)}</span>
            <span className="card-unit">ms</span>
          </div>
          <div className="card-subtext">
            <span>Status:</span>
            <span
              style={{
                color:
                  metrics.ping < 50
                    ? 'var(--status-online)'
                    : metrics.ping < 100
                    ? 'var(--status-warning)'
                    : 'var(--status-offline)',
                fontWeight: 600,
              }}
            >
              {metrics.ping < 50 ? 'Excellent' : metrics.ping < 100 ? 'Good' : 'High Latency'}
            </span>
          </div>
        </div>

        {/* Jitter & Packet Loss Card */}
        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Jitter & Loss</span>
            <div className="card-icon-wrap jitter">
              <IconZap size={18} />
            </div>
          </div>
          <div className="card-value-group">
            <span className="card-big-value">{metrics.jitter.toFixed(1)}</span>
            <span className="card-unit">ms</span>
          </div>
          <div className="card-subtext">
            <span>Packet Loss:</span>
            <span
              className="mono-text"
              style={{
                color: metrics.packetLoss === 0 ? 'var(--status-online)' : 'var(--status-offline)',
                fontWeight: 600,
              }}
            >
              {metrics.packetLoss.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. LIVE REAL-TIME WAVEFORM TRAFFIC ACTIVITY */}
      <div className="glass-card chart-container">
        <div className="chart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="chart-title">Real-time Traffic Activity</span>
            <span className="status-badge" style={{ fontSize: '12px' }}>
              <span className="status-dot online" /> Live
            </span>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot download" />
              <span>Download ({dl.value} {dl.unit})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot upload" />
              <span>Upload ({ul.value} {ul.unit})</span>
            </div>
          </div>
        </div>

        <div className="svg-chart-wrapper" style={{ height: '200px' }}>
          <svg
            className="svg-chart"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="dlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="ulGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            <line x1="0" y1="45" x2={width} y2="45" stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="4" />
            <line x1="0" y1="90" x2={width} y2="90" stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="4" />
            <line x1="0" y1="135" x2={width} y2="135" stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="4" />

            {/* Download Fill and Stroke */}
            {dlPath && (
              <>
                <polygon
                  points={`0,${height} ${dlPath} ${width},${height}`}
                  fill="url(#dlGradient)"
                />
                <polyline
                  points={dlPath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Upload Fill and Stroke */}
            {ulPath && (
              <>
                <polygon
                  points={`0,${height} ${ulPath} ${width},${height}`}
                  fill="url(#ulGradient)"
                />
                <polyline
                  points={ulPath}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* 3. DATA QUOTA & USAGE (GB) SECTION - HARIAN, MINGGUAN, BULANAN */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header & Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="chart-title">Data Usage & Quota Consumption</span>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Total bandwidth consumed in GigaBytes (GB) across historical periods
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => setUsagePeriod('daily')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: usagePeriod === 'daily' ? '#ffffff' : 'transparent',
                color: usagePeriod === 'daily' ? '#0284c7' : '#64748b',
                fontWeight: usagePeriod === 'daily' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: usagePeriod === 'daily' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Harian (7 Hari)
            </button>
            <button
              onClick={() => setUsagePeriod('weekly')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: usagePeriod === 'weekly' ? '#ffffff' : 'transparent',
                color: usagePeriod === 'weekly' ? '#0284c7' : '#64748b',
                fontWeight: usagePeriod === 'weekly' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: usagePeriod === 'weekly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Mingguan (4 Minggu)
            </button>
            <button
              onClick={() => setUsagePeriod('monthly')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: usagePeriod === 'monthly' ? '#ffffff' : 'transparent',
                color: usagePeriod === 'monthly' ? '#0284c7' : '#64748b',
                fontWeight: usagePeriod === 'monthly' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: usagePeriod === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Bulanan (6 Bulan)
            </button>
          </div>
        </div>

        {/* 3 Summary Badges (Hari Ini, Minggu Ini, Bulan Ini) */}
        <div className="metrics-grid-3">
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Hari Ini (Today)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span className="mono-text" style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7' }}>
                {usageSummary?.todayGb ?? 2.5}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>GB</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              DL: {usageSummary?.todayDownloadGb ?? 2.1} GB • UL: {usageSummary?.todayUploadGb ?? 0.4} GB
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Minggu Ini (This Week)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span className="mono-text" style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed' }}>
                {usageSummary?.thisWeekGb ?? 17.9}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>GB</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              DL: {usageSummary?.thisWeekDownloadGb ?? 15.3} GB • UL: {usageSummary?.thisWeekUploadGb ?? 2.6} GB
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Bulan Ini (This Month)
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span className="mono-text" style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
                {usageSummary?.thisMonthGb ?? 56.0}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>GB</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              DL: {usageSummary?.thisMonthDownloadGb ?? 47.1} GB • UL: {usageSummary?.thisMonthUploadGb ?? 8.9} GB
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart for GB Usage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0284c7' }} />
              <span style={{ fontWeight: 600, color: '#475569' }}>Download (GB)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#7c3aed' }} />
              <span style={{ fontWeight: 600, color: '#475569' }}>Upload (GB)</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '180px',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px 20px 14px 20px',
              gap: '12px',
            }}
          >
            {currentUsageItems.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(12, (item.totalGb / maxUsageGb) * 100));
              const dlPercent = (item.downloadGb / item.totalGb) * 100;
              const ulPercent = (item.uploadGb / item.totalGb) * 100;

              return (
                <div
                  key={`${item.label}-${idx}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '8px',
                  }}
                >
                  <span
                    className="mono-text"
                    style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}
                  >
                    {item.totalGb}G
                  </span>

                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPercent}%`,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    }}
                    title={`${item.label}: Total ${item.totalGb} GB (DL: ${item.downloadGb} GB, UL: ${item.uploadGb} GB)`}
                  >
                    {/* Upload Top Bar */}
                    <div
                      style={{
                        height: `${ulPercent}%`,
                        background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    {/* Download Bottom Bar */}
                    <div
                      style={{
                        height: `${dlPercent}%`,
                        background: 'linear-gradient(180deg, #38bdf8, #0284c7)',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: item.label.includes('Ini') ? '#0284c7' : '#64748b',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. NETWORK CONFIGURATION & HEALTH SUMMARY GRID */}
      <div className="metrics-grid-2">
        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Network Interface</span>
            <IconGlobe size={18} color="var(--accent-blue)" />
          </div>
          <div className="adapter-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="detail-item">
              <span className="detail-label">Active Adapter</span>
              <span className="detail-value">{metrics.activeAdapter}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Local IPv4</span>
              <span className="detail-value">{metrics.ipAddress}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Default Gateway</span>
              <span className="detail-value">{metrics.gateway}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">DNS Server</span>
              <span className="detail-value">{metrics.dns}</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Security & Health</span>
            <IconShield size={18} color="var(--accent-emerald)" />
          </div>
          <div className="adapter-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="detail-item">
              <span className="detail-label">Connection Status</span>
              <span className="detail-value" style={{ color: 'var(--status-online)' }}>
                Protected & Online
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Packet Integrity</span>
              <span className="detail-value">
                {(100 - metrics.packetLoss).toFixed(1)}% Passed
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Local DB Logging</span>
              <span className="detail-value" style={{ color: 'var(--accent-emerald)' }}>
                SQLite Active
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">System Tray Mode</span>
              <span className="detail-value">Background Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
