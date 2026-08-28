import {
  IconDashboard,
  IconGauge,
  IconAdapters,
  IconHistory,
  IconDiagnostics,
  IconSettings,
  IconWifi,
  IconActivity,
  IconGrid,
} from './Icons';
import { NetworkMetrics, NavTab } from '../types/network';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  metrics: NetworkMetrics;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, metrics }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard size={19} /> },
    { id: 'speedtest', label: 'Speed Test & Tools', icon: <IconGauge size={19} /> },
    { id: 'diagnostics', label: 'Diagnostics & Ping', icon: <IconDiagnostics size={19} /> },
    { id: 'apps', label: 'Applications', icon: <IconGrid size={19} /> },
    { id: 'adapters', label: 'Network Adapters', icon: <IconAdapters size={19} /> },
    { id: 'history', label: 'Historical Stats', icon: <IconHistory size={19} /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings size={19} /> },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand / Logo */}
        <div className="sidebar-header">
          <div className="logo-badge">
            <IconActivity size={22} />
          </div>
          <div className="brand-info">
            <span className="brand-title">NetSpeedX</span>
            <div className="status-badge">
              <span className={`status-dot ${metrics.status}`} />
              <span style={{ textTransform: 'capitalize' }}>
                {metrics.status === 'online' ? 'Connected' : metrics.status}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer Widget */}
      <div className="sidebar-footer">
        <div className="mini-adapter-card">
          <div className="mini-adapter-header">
            <span>Active Interface</span>
            <IconWifi size={14} />
          </div>
          <div className="mini-adapter-name" title={metrics.connectionDetails?.ssid || metrics.activeAdapter}>
            {metrics.connectionDetails?.ssid ? `Wi-Fi (${metrics.connectionDetails.ssid})` : metrics.activeAdapter}
          </div>
          <div className="mini-adapter-ip mono-text">
            {metrics.ipAddress}
          </div>
        </div>
      </div>
    </aside>
  );
};
