export function formatSpeed(bytesPerSec: number): { value: string; unit: string } {
  if (bytesPerSec < 1024) {
    return { value: bytesPerSec.toFixed(0), unit: 'B/s' };
  } else if (bytesPerSec < 1024 * 1024) {
    return { value: (bytesPerSec / 1024).toFixed(1), unit: 'KB/s' };
  } else if (bytesPerSec < 1024 * 1024 * 1024) {
    return { value: (bytesPerSec / (1024 * 1024)).toFixed(2), unit: 'MB/s' };
  } else {
    return { value: (bytesPerSec / (1024 * 1024 * 1024)).toFixed(2), unit: 'GB/s' };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getStatusColor(status: 'online' | 'degraded' | 'offline'): string {
  switch (status) {
    case 'online':
      return 'var(--status-online)';
    case 'degraded':
      return 'var(--status-warning)';
    case 'offline':
      return 'var(--status-offline)';
  }
}
