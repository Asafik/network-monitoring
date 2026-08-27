import React, { useState } from 'react';
import { IconServer } from '../components/Icons';
import { PingTarget } from '../types/network';

interface DiagnosticsViewProps {
  targets: PingTarget[];
  onAddTarget: (host: string, name: string) => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ targets, onAddTarget }) => {
  const [newHost, setNewHost] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHost.trim()) {
      onAddTarget(newHost.trim(), newName.trim() || newHost.trim());
      setNewHost('');
      setNewName('');
    }
  };

  return (
    <div className="content-body">
      {/* Target Adder Bar */}
      <div className="glass-card">
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Target Host / IP (e.g. 1.1.1.1 or google.com)"
            value={newHost}
            onChange={(e) => setNewHost(e.target.value)}
            style={{ flex: 2 }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Label (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            + Add Target
          </button>
        </form>
      </div>

      {/* Grid of Ping Targets */}
      <div className="metrics-grid-3">
        {targets.map((target) => (
          <div key={target.id} className="glass-card">
            <div className="card-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconServer size={18} color="#38bdf8" />
                <span className="card-label">{target.name}</span>
              </div>
              <span className="mono-text" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {target.host}
              </span>
            </div>

            <div className="card-value-group">
              <span
                className="card-big-value"
                style={{
                  color:
                    target.latency < 50
                      ? 'var(--status-online)'
                      : target.latency < 100
                      ? 'var(--status-warning)'
                      : 'var(--status-offline)',
                }}
              >
                {target.latency.toFixed(0)}
              </span>
              <span className="card-unit">ms</span>
            </div>

            {/* Mini Stat Bar */}
            <div className="adapter-details-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '12px' }}>
              <div className="detail-item">
                <span className="detail-label">Min</span>
                <span className="detail-value">{target.minLatency.toFixed(0)} ms</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Avg</span>
                <span className="detail-value">{target.avgLatency.toFixed(0)} ms</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Max</span>
                <span className="detail-value">{target.maxLatency.toFixed(0)} ms</span>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Packet Loss:</span>
              <span className="mono-text" style={{ color: target.packetLoss === 0 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                {target.packetLoss}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
