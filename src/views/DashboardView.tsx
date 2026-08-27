import React from 'react';
import {
  IconDownload,
  IconUpload,
  IconActivity,
  IconZap,
  IconShield,
  IconGlobe,
} from '../components/Icons';
import { NetworkMetrics, HistoryPoint } from '../types/network';
import { formatSpeed, formatBytes } from '../utils/formatters';

interface DashboardViewProps {
  metrics: NetworkMetrics;
  history: HistoryPoint[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ metrics, history }) => {
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

  return (
    <div className="content-body">
      {/* 4 Main Stat Cards */}
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

      {/* Live Real-time Waveform Chart (Main Focus) */}
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

        <div className="svg-chart-wrapper" style={{ height: '220px' }}>
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

      {/* Network Configuration Summary Grid */}
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
