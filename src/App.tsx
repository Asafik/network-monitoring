import { useState, useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { AdaptersView } from './views/AdaptersView';
import { HistoryView } from './views/HistoryView';
import { DiagnosticsView } from './views/DiagnosticsView';
import { SettingsView } from './views/SettingsView';
import { IconRefresh } from './components/Icons';
import {
  NetworkMetrics,
  NetworkAdapter,
  HistoryPoint,
  IncidentLog,
  PingTarget,
  AppSettings,
  WifiNetworkItem,
} from './types/network';
import './index.css';
import './App.css';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNativeTauri, setIsNativeTauri] = useState(true);
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetworkItem[]>([]);
  const [isScanningNetworks, setIsScanningNetworks] = useState(false);

  // Live Metrics State
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    totalDownloaded: 0,
    totalUploaded: 0,
    ping: 0,
    jitter: 0,
    packetLoss: 0,
    status: 'online',
    activeAdapter: 'Detecting...',
    ipAddress: '127.0.0.1',
    gateway: '192.168.1.1',
    dns: '1.1.1.1 / 8.8.8.8',
    timestamp: Date.now(),
  });

  // Adapters State
  const [adapters, setAdapters] = useState<NetworkAdapter[]>([]);

  // Historical Waveform Points
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // Incident Logs State
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);

  // Ping Targets State for Diagnostics
  const [pingTargets, setPingTargets] = useState<PingTarget[]>([
    {
      id: 'target-cf',
      name: 'Cloudflare DNS',
      host: '1.1.1.1',
      status: 'active',
      latency: 0,
      minLatency: 0,
      maxLatency: 0,
      avgLatency: 0,
      packetLoss: 0,
      history: [],
    },
    {
      id: 'target-google',
      name: 'Google Public DNS',
      host: '8.8.8.8',
      status: 'active',
      latency: 0,
      minLatency: 0,
      maxLatency: 0,
      avgLatency: 0,
      packetLoss: 0,
      history: [],
    },
    {
      id: 'target-gw',
      name: 'Local Gateway Router',
      host: '192.168.1.1',
      status: 'active',
      latency: 0,
      minLatency: 0,
      maxLatency: 0,
      avgLatency: 0,
      packetLoss: 0,
      history: [],
    },
  ]);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    pollingIntervalMs: 1000,
    pingIntervalMs: 1000,
    defaultPingHost: '1.1.1.1',
    autoStartWithWindows: true,
    startMinimizedToTray: true,
    notifyOnDisconnect: true,
    notifyOnHighLatency: true,
    latencyThresholdMs: 120,
    theme: 'dark',
  });

  const scanWifiNetworks = useCallback(() => {
    setIsScanningNetworks(true);
    const isTauriEnv =
      typeof window !== 'undefined' &&
      ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

    if (isTauriEnv) {
      invoke<WifiNetworkItem[]>('get_available_networks')
        .then((nets) => {
          if (nets && Array.isArray(nets)) {
            setAvailableNetworks(nets);
          }
        })
        .catch((err) => console.warn('Could not scan Wi-Fi networks:', err))
        .finally(() => setIsScanningNetworks(false));
    } else {
      fetch('http://127.0.0.1:9090/api/wifi-networks')
        .then((res) => res.json())
        .then((nets) => {
          if (nets && Array.isArray(nets)) {
            setAvailableNetworks(nets);
          }
        })
        .catch(() => {})
        .finally(() => setIsScanningNetworks(false));
    }
  }, []);

  useEffect(() => {
    // Check if running inside Tauri Desktop or plain web browser
    const isTauriEnv =
      typeof window !== 'undefined' &&
      ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

    setIsNativeTauri(isTauriEnv);

    // Initial scan of available Wi-Fi networks
    scanWifiNetworks();

    if (isTauriEnv) {
      // --- TAURI NATIVE ENVIRONMENT ---
      let unlistenMetrics: (() => void) | undefined;
      let unlistenAdapters: (() => void) | undefined;

      // Load initial SQLite historical data
      invoke<HistoryPoint[]>('get_history', { limit: 40 })
        .then((data) => {
          if (data && data.length > 0) {
            setHistory(data);
          }
        })
        .catch((err) => console.warn('Could not load history from SQLite:', err));

      invoke<IncidentLog[]>('get_incidents', { limit: 20 })
        .then((data) => {
          if (data && data.length > 0) {
            setIncidents(data);
          }
        })
        .catch((err) => console.warn('Could not load incidents from SQLite:', err));

      // Listen to real-time events
      listen<NetworkMetrics>('network-metrics', (event) => {
        const newMetric = event.payload;
        setMetrics(newMetric);

        const timeStr = new Date(newMetric.timestamp).toLocaleTimeString([], {
          hour12: false,
        });

        setHistory((prev) => [
          ...prev.slice(-39),
          {
            time: timeStr,
            timestamp: newMetric.timestamp,
            downloadBps: newMetric.downloadSpeed,
            uploadBps: newMetric.uploadSpeed,
            pingMs: newMetric.ping,
            jitterMs: newMetric.jitter,
            packetLoss: newMetric.packetLoss,
          },
        ]);
      }).then((unlisten) => {
        unlistenMetrics = unlisten;
      });

      listen<NetworkAdapter[]>('network-adapters', (event) => {
        setAdapters(event.payload);
      }).then((unlisten) => {
        unlistenAdapters = unlisten;
      });

      return () => {
        if (unlistenMetrics) unlistenMetrics();
        if (unlistenAdapters) unlistenAdapters();
      };
    } else {
      // --- BROWSER SYNC WITH LOCAL NATIVE API ---
      const fetchLiveData = () => {
        fetch('http://127.0.0.1:9090/api/metrics')
          .then((res) => res.json())
          .then((data) => {
            if (data.metrics) {
              setMetrics(data.metrics);
              const timeStr = new Date(data.metrics.timestamp).toLocaleTimeString([], {
                hour12: false,
              });

              setHistory((prev) => [
                ...prev.slice(-39),
                {
                  time: timeStr,
                  timestamp: data.metrics.timestamp,
                  downloadBps: data.metrics.downloadSpeed,
                  uploadBps: data.metrics.uploadSpeed,
                  pingMs: data.metrics.ping,
                  jitterMs: data.metrics.jitter,
                  packetLoss: data.metrics.packetLoss,
                },
              ]);
            }
            if (data.adapters) {
              setAdapters(data.adapters);
            }
          })
          .catch((err) => {
            console.log('Connecting to local Network Monitor API server...', err);
          });
      };

      fetchLiveData();
      fetch('http://127.0.0.1:9090/api/history')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setHistory(data);
        })
        .catch(() => {});

      const interval = setInterval(fetchLiveData, 1000);
      return () => clearInterval(interval);
    }
  }, [scanWifiNetworks]);

  // Continuous Diagnostics Multi-Target Ping
  useEffect(() => {
    const isTauriEnv =
      typeof window !== 'undefined' &&
      ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

    const interval = setInterval(() => {
      pingTargets.forEach((target) => {
        if (isTauriEnv) {
          invoke<number | null>('ping_target', { host: target.host })
            .then((rtt) => {
              if (rtt !== null && rtt !== undefined && rtt > 0) {
                updateTargetStats(target.id, rtt);
              }
            })
            .catch(() => {});
        } else {
          const simRtt = 15 + Math.floor(Math.random() * 10);
          updateTargetStats(target.id, simRtt);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [pingTargets]);

  const updateTargetStats = (targetId: string, rtt: number) => {
    setPingTargets((prev) =>
      prev.map((t) => {
        if (t.id !== targetId) return t;
        const newHist = [...t.history.slice(-9), rtt];
        const min = Math.min(...newHist);
        const max = Math.max(...newHist);
        const avg = newHist.reduce((a, b) => a + b, 0) / newHist.length;
        return {
          ...t,
          latency: rtt,
          minLatency: min,
          maxLatency: max,
          avgLatency: avg,
          packetLoss: 0,
          history: newHist,
        };
      })
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    scanWifiNetworks();
    if (isNativeTauri) {
      invoke<HistoryPoint[]>('get_history', { limit: 40 })
        .then((data) => {
          if (data) setHistory(data);
        })
        .finally(() => {
          setTimeout(() => setIsRefreshing(false), 500);
        });
    } else {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleAddPingTarget = (host: string, name: string) => {
    const newTarget: PingTarget = {
      id: `target-${Date.now()}`,
      name,
      host,
      status: 'active',
      latency: 0,
      minLatency: 0,
      maxLatency: 0,
      avgLatency: 0,
      packetLoss: 0,
      history: [],
    };
    setPingTargets((prev) => [...prev, newTarget]);
  };

  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Live Network Dashboard',
      subtitle: isNativeTauri
        ? 'Real-time native Windows traffic, latency, and adapter status'
        : 'Browser Preview Mode (Open Desktop App for Real-time Native Windows Metrics)',
    },
    adapters: {
      title: 'Network Adapters & Available Wi-Fi',
      subtitle: 'Active connection, password viewer, network interfaces, and nearby wireless signals',
    },
    history: {
      title: 'Historical Statistics & Logs',
      subtitle: 'SQLite database performance history and incident records',
    },
    diagnostics: {
      title: 'Diagnostics & Latency Tester',
      subtitle: 'Continuous multi-target ICMP ping, jitter, and packet loss',
    },
    settings: {
      title: 'Monitor Settings',
      subtitle: 'Configure intervals, system tray behavior, and alerts',
    },
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} metrics={metrics} />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-title-group">
            <h1 className="header-title">{titles[currentTab].title}</h1>
            <span className="header-subtitle">{titles[currentTab].subtitle}</span>
          </div>

          <div className="header-actions">
            {!isNativeTauri && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(2, 132, 199, 0.1)',
                  color: '#0284c7',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                }}
              >
                Browser Preview
              </span>
            )}
            <button
              className={`btn-icon ${isRefreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              title="Refresh Stats"
            >
              <IconRefresh size={16} />
            </button>
          </div>
        </header>

        {/* View Switcher */}
        {currentTab === 'dashboard' && (
          <DashboardView metrics={metrics} history={history} />
        )}
        {currentTab === 'adapters' && (
          <AdaptersView
            adapters={adapters}
            metrics={metrics}
            availableNetworks={availableNetworks}
            onRefreshNetworks={scanWifiNetworks}
            isScanning={isScanningNetworks}
          />
        )}
        {currentTab === 'history' && (
          <HistoryView history={history} incidents={incidents} />
        )}
        {currentTab === 'diagnostics' && (
          <DiagnosticsView targets={pingTargets} onAddTarget={handleAddPingTarget} />
        )}
        {currentTab === 'settings' && (
          <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
        )}
      </main>
    </div>
  );
}

export default App;
