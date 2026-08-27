import React, { useState } from 'react';
import {
  IconGauge,
  IconAlertTriangle,
  IconLayers,
  IconActivity,
  IconDownload,
  IconUpload,
} from '../components/Icons';
import {
  HistoryPoint,
  IncidentLog,
  SpeedTestRecord,
  OutageLog,
  NetworkSessionRecord,
} from '../types/network';
import { formatSpeed } from '../utils/formatters';

interface HistoryViewProps {
  history: HistoryPoint[];
  incidents: IncidentLog[];
  speedTests?: SpeedTestRecord[];
  outages?: OutageLog[];
  sessions?: NetworkSessionRecord[];
}

type HistoryTab = 'speedtests' | 'outages' | 'sessions' | 'incidents';

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  incidents,
  speedTests = [],
  outages = [],
  sessions = [],
}) => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('speedtests');

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
      {/* 3 Summary Cards */}
      <div className="metrics-grid-3">
        <div className="glass-card glow-cyan">
          <div className="card-top">
            <span className="card-label">Peak Download Recorded</span>
            <IconDownload size={18} color="#0284c7" />
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#0284c7' }}>
              {peakDlFormatted.value}
            </span>
            <span className="card-unit">{peakDlFormatted.unit}</span>
          </div>
          <span className="card-subtext">Recorded in SQLite history</span>
        </div>

        <div className="glass-card glow-purple">
          <div className="card-top">
            <span className="card-label">Peak Upload Recorded</span>
            <IconUpload size={18} color="#7c3aed" />
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#7c3aed' }}>
              {peakUlFormatted.value}
            </span>
            <span className="card-unit">{peakUlFormatted.unit}</span>
          </div>
          <span className="card-subtext">Recorded in SQLite history</span>
        </div>

        <div className="glass-card">
          <div className="card-top">
            <span className="card-label">Average Session Latency</span>
            <IconActivity size={18} color="#059669" />
          </div>
          <div className="card-value-group">
            <span className="card-big-value" style={{ color: '#059669' }}>
              {avgPing.toFixed(0)}
            </span>
            <span className="card-unit">ms</span>
          </div>
          <span className="card-subtext">Calculated from recent probes</span>
        </div>
      </div>

      {/* History Log Category Tabs */}
      <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', gap: '8px' }}>
        {[
          { id: 'speedtests', label: `Speed Test History (${speedTests.length})`, icon: <IconGauge size={15} /> },
          { id: 'outages', label: `Internet Outage Log (${outages.length})`, icon: <IconAlertTriangle size={15} /> },
          { id: 'sessions', label: `Network Sessions (${sessions.length})`, icon: <IconLayers size={15} /> },
          { id: 'incidents', label: `Incidents & Alerts (${incidents.length})`, icon: <IconActivity size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as HistoryTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#0284c7' : '#f1f5f9',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. SPEED TESTS TABLE */}
      {activeTab === 'speedtests' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Internet Speed Test History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Date & Time</th>
                <th style={{ padding: '8px 12px' }}>Download Speed</th>
                <th style={{ padding: '8px 12px' }}>Upload Speed</th>
                <th style={{ padding: '8px 12px' }}>Ping / Latency</th>
                <th style={{ padding: '8px 12px' }}>Jitter</th>
              </tr>
            </thead>
            <tbody>
              {speedTests.length > 0 ? (
                speedTests.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)' }}>
                    <td style={{ padding: '12px' }}>{st.date} {st.timestamp}</td>
                    <td className="mono-text" style={{ padding: '12px', fontWeight: 800, color: '#0284c7' }}>
                      {st.downloadMbps > 0 ? `${st.downloadMbps.toFixed(1)} Mbps` : '-'}
                    </td>
                    <td className="mono-text" style={{ padding: '12px', fontWeight: 800, color: '#7c3aed' }}>
                      {st.uploadMbps > 0 ? `${st.uploadMbps.toFixed(1)} Mbps` : '-'}
                    </td>
                    <td className="mono-text" style={{ padding: '12px' }}>{st.pingMs > 0 ? `${st.pingMs} ms` : '-'}</td>
                    <td className="mono-text" style={{ padding: '12px' }}>{st.jitterMs > 0 ? `${st.jitterMs} ms` : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No saved speed test history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. OUTAGES TABLE */}
      {activeTab === 'outages' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Internet Outage & Downtime Log</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Date</th>
                <th style={{ padding: '8px 12px' }}>Downtime Started (Offline)</th>
                <th style={{ padding: '8px 12px' }}>Connection Restored (Online)</th>
                <th style={{ padding: '8px 12px' }}>Downtime Duration</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {outages.length > 0 ? (
                outages.map((out) => (
                  <tr key={out.id} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)' }}>
                    <td style={{ padding: '12px' }}>{out.date}</td>
                    <td className="mono-text" style={{ padding: '12px', color: '#e11d48', fontWeight: 600 }}>{out.startTime}</td>
                    <td className="mono-text" style={{ padding: '12px', color: '#059669', fontWeight: 600 }}>{out.endTime}</td>
                    <td className="mono-text" style={{ padding: '12px', fontWeight: 800 }}>{out.durationFormatted}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                        Resolved
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No outages detected. Network connectivity has remained 100% online!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. NETWORK SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Network Connection Sessions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Network / Wi-Fi</th>
                <th style={{ padding: '8px 12px' }}>Connected At</th>
                <th style={{ padding: '8px 12px' }}>Disconnected At</th>
                <th style={{ padding: '8px 12px' }}>Session Duration</th>
                <th style={{ padding: '8px 12px' }}>Download</th>
                <th style={{ padding: '8px 12px' }}>Upload</th>
                <th style={{ padding: '8px 12px' }}>Average Ping</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? (
                sessions.map((sess) => (
                  <tr key={sess.id} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {sess.ssid || sess.adapterName}
                    </td>
                    <td className="mono-text" style={{ padding: '12px' }}>{sess.startTime}</td>
                    <td className="mono-text" style={{ padding: '12px' }}>{sess.endTime}</td>
                    <td className="mono-text" style={{ padding: '12px', fontWeight: 700 }}>{sess.durationFormatted}</td>
                    <td className="mono-text" style={{ padding: '12px', color: '#0284c7', fontWeight: 700 }}>{sess.downloadGb} GB</td>
                    <td className="mono-text" style={{ padding: '12px', color: '#7c3aed', fontWeight: 700 }}>{sess.uploadGb} GB</td>
                    <td className="mono-text" style={{ padding: '12px' }}>{sess.avgPingMs} ms</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No saved session history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. INCIDENTS TABLE */}
      {activeTab === 'incidents' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Incident & Alert Logs</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Timestamp</th>
                <th style={{ padding: '8px 12px' }}>Incident Type</th>
                <th style={{ padding: '8px 12px' }}>Severity</th>
                <th style={{ padding: '8px 12px' }}>Message Details</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length > 0 ? (
                incidents.map((inc) => (
                  <tr key={inc.id} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)' }}>
                    <td className="mono-text" style={{ padding: '12px' }}>{inc.timestamp}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{inc.type}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: inc.severity === 'high' ? 'rgba(225, 29, 72, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                          color: inc.severity === 'high' ? '#e11d48' : '#d97706',
                        }}
                      >
                        {inc.severity.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>{inc.message}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No incidents recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
