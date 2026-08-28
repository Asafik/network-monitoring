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

export interface OutageLog {
  id: string;
  startTime: string;
  endTime: string;
  durationSecs: number;
  durationFormatted: string;
  date: string;
}

export interface OutageStats {
  todayDisconnectsCount: number;
  todayDowntimeSecs: number;
  todayDowntimeFormatted: string;
  weekDowntimeSecs: number;
  weekDowntimeFormatted: string;
  monthDowntimeSecs: number;
  monthDowntimeFormatted: string;
}

export interface AdvancedLatencyStats {
  currentPing: number;
  minPing: number;
  avgPing: number;
  maxPing: number;
  jitter: number;
  packetLoss: number;
  spikeCount: number;
  points: HistoryPoint[];
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
  healthScore?: number;
  healthStatus?: string;
  pingSpikesCount?: number;
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

export interface SpeedTestResult {
  id: string;
  timestamp: string;
  date: string;
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
}

export type SpeedTestRecord = SpeedTestResult;

export interface SpeedTestProgress {
  phase: 'ping' | 'download' | 'upload' | 'complete' | 'error';
  progress: number;
  currentSpeedMbps: number;
  pingMs: number;
  downloadMbps: number;
  uploadMbps: number;
  message: string;
}

export interface DiagnosticCheckItem {
  step: string;
  target: string;
  status: 'PASS' | 'GOOD' | 'WARN' | 'FAIL';
  responseTimeMs?: number | null;
  message: string;
}

export interface QuickDiagnosticsResult {
  items: DiagnosticCheckItem[];
  overall_status: string;
  recommendation?: string | null;
}

export interface DnsBenchmarkItem {
  provider: string;
  ip: string;
  avgResponseMs: number;
  minResponseMs: number;
  maxResponseMs: number;
  failureRatePercent: number;
  rating: string;
}

export interface TracerouteHop {
  hop: number;
  ip: string;
  hostname?: string | null;
  responseTimeMs?: number | null;
  status: string;
}

export interface ManualPingResult {
  target: string;
  packetsSent: number;
  packetsReceived: number;
  packetsLost: number;
  packetLossPercent: number;
  minPingMs: number;
  avgPingMs: number;
  maxPingMs: number;
  jitterMs: number;
  packetHistory: number[];
}

export interface AppBandwidthItem {
  pid: number;
  name: string;
  downloadBps: number;
  uploadBps: number;
  totalDownloadMb: number;
  totalUploadMb: number;
  activeConnections: number;
  isBlocked?: boolean;
  isSystem?: boolean;
}

export interface NetworkSessionRecord {
  id: string;
  adapterName: string;
  ssid?: string | null;
  startTime: string;
  endTime: string;
  durationFormatted: string;
  downloadGb: number;
  uploadGb: number;
  avgPingMs: number;
  date: string;
}

export interface PingTarget {
  id: string;
  name: string;
  host: string;
  category: 'dns' | 'gateway' | 'custom' | 'game';
  currentPing?: number;
  minPing?: number;
  maxPing?: number;
  avgPing?: number;
  packetLoss?: number;
  history: number[];
  status: 'online' | 'degraded' | 'offline';
}

export interface AppSettings {
  autoRefreshInterval: number; // ms
  enableNotifications: boolean;
  enableSoundAlerts: boolean;
  latencyWarningThreshold: number; // ms
  packetLossWarningThreshold: number; // percentage
  dailyDataLimitGb?: number;
  weeklyDataLimitGb?: number;
  monthlyDataLimitGb?: number;
  quotaWarningThresholdPercent?: number; // 50, 75, 80, 90, 100
  notificationCooldownSecs?: number;
  selectedDnsPreset: 'system' | 'cloudflare' | 'google' | 'adguard';
  startWithWindows: boolean;
  minimizeToTray: boolean;
  theme: 'light' | 'dark' | 'system';
  showSpeedWidget?: boolean;
  speedWidgetStyle?: 'classic' | 'glass' | 'compact';
  taskbarOffset?: number;
}

export type NavTab = 'dashboard' | 'speedtest' | 'diagnostics' | 'apps' | 'adapters' | 'history' | 'settings';
