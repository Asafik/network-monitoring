export interface UsageItem {
  label: string;
  downloadGb: number;
  uploadGb: number;
  totalGb: number;
}

export interface DataUsageSummary {
  todayGb: number;
  todayDownloadGb: number;
  todayUploadGb: number;
  thisWeekGb: number;
  thisWeekDownloadGb: number;
  thisWeekUploadGb: number;
  thisMonthGb: number;
  thisMonthDownloadGb: number;
  thisMonthUploadGb: number;
  daily: UsageItem[];
  weekly: UsageItem[];
  monthly: UsageItem[];
}

export interface WifiNetworkItem {
  ssid: string;
  signalPercent?: number | null;
  authentication: string;
  status: 'connected' | 'saved_in_range' | 'saved_offline' | 'in_range';
  radioType?: string | null;
  band?: string | null;
  channel?: string | null;
  hasSavedProfile: boolean;
  password?: string | null;
}

export interface ActiveConnectionDetails {
  connectionType: 'wifi' | 'ethernet' | 'none';
  ssid?: string | null;
  signalPercent?: number | null;
  radioType?: string | null;
  channel?: string | null;
  authentication?: string | null;
  linkSpeedMbps?: number | null;
  bssid?: string | null;
  isWired?: boolean;
}

export interface NetworkMetrics {
  downloadSpeed: number; // bytes per second
  uploadSpeed: number;   // bytes per second
  totalDownloaded: number; // bytes
  totalUploaded: number;   // bytes
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage (0-100)
  status: 'online' | 'degraded' | 'offline';
  activeAdapter: string;
  ipAddress: string;
  gateway: string;
  dns: string;
  timestamp: number;
  connectionDetails?: ActiveConnectionDetails;
}

export interface NetworkAdapter {
  id: string;
  name: string;
  description: string;
  type: 'ethernet' | 'wifi' | 'vpn' | 'loopback' | 'other';
  status: 'up' | 'down';
  ipV4: string;
  ipV6: string;
  macAddress: string;
  gateway: string;
  dnsServers: string[];
  linkSpeedMbps: number;
  rxBytes: number;
  txBytes: number;
  rxSpeedBps: number;
  txSpeedBps: number;
}

export interface HistoryPoint {
  time: string;
  timestamp: number;
  downloadBps: number;
  uploadBps: number;
  pingMs: number;
  jitterMs: number;
  packetLoss: number;
}

export interface IncidentLog {
  id: string;
  timestamp: string;
  type: 'disconnect' | 'high_latency' | 'packet_loss' | 'adapter_change';
  severity: 'low' | 'medium' | 'high';
  message: string;
  duration?: string;
}

export interface PingTarget {
  id: string;
  name: string;
  host: string;
  status: 'active' | 'error' | 'testing';
  latency: number;
  minLatency: number;
  maxLatency: number;
  avgLatency: number;
  packetLoss: number;
  history: number[];
}

export interface AppSettings {
  pollingIntervalMs: number;
  pingIntervalMs: number;
  defaultPingHost: string;
  autoStartWithWindows: boolean;
  startMinimizedToTray: boolean;
  notifyOnDisconnect: boolean;
  notifyOnHighLatency: boolean;
  latencyThresholdMs: number;
  theme: 'dark' | 'midnight' | 'cyber';
}
