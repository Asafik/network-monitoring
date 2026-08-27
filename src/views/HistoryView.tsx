import React, { useState } from 'react';
import { HistoryPoint, IncidentLog } from '../types/network';
import { formatSpeed } from '../utils/formatters';

interface HistoryViewProps {
  history: HistoryPoint[];
  incidents: IncidentLog[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, incidents }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');

  // Compute peak speeds and average latency from history points
  const maxDl = Math.max(...history.map((h) => h.downloadBps), 0);
  const maxUl = Math.max(...history.map((h) => h.uploadBps), 0);
  const avgPing =
    history.length > 0
      ? history.reduce((acc, curr) => acc + curr.pingMs, 0) / history.length
      : 0;

  const peakDlFormatted = formatSpeed(maxDl);
  const peakUlFormatted = formatSpeed(maxUl);

  return (
    <div className="content-body">
      {/* Time Range Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background:
                  timeRange === range
                    ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                    : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing SQLite Historical Aggregation
        </span>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid-3">
        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Peak Download</span>
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#06b6d4' }}>
              {peakDlFormatted.value}
            </span>
            <span className="card-unit">{peakDlFormatted.unit}</span>
          </div>
          <span className="card-subtext">Recorded in current session</span>
        </div>

        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Peak Upload</span>
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#8b5cf6' }}>
              {peakUlFormatted.value}
            </span>
            <span className="card-unit">{peakUlFormatted.unit}</span>
          </div>
          <span className="card-subtext">Recorded in current session</span>
        </div>

        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Average Latency</span>
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#10b981' }}>
              {avgPing.toFixed(1)}
            </span>
            <span className="card-unit">ms</span>
          </div>
          <span className="card-subtext">Stable connection</span>
        </div>
      </div>

      {/* Incident & Disconnect Event Logs */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="chart-title">Incident & Disconnect History</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {incidents.length} Event(s) logged
          </span>
        </div>

        <div className="incident-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Details</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="mono-text" style={{ color: 'var(--text-muted)' }}>
                    {incident.timestamp}
                  </td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {incident.type.replace('_', ' ')}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          incident.severity === 'high'
                            ? 'rgba(244,63,94,0.15)'
                            : 'rgba(245,158,11,0.15)',
                        color:
                          incident.severity === 'high'
                            ? 'var(--accent-rose)'
                            : 'var(--accent-amber)',
                      }}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td>{incident.message}</td>
                  <td className="mono-text">{incident.duration || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
