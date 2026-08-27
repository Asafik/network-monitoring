import React from 'react';

interface AppIconProps {
  name: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 28 }) => {
  const lower = name.toLowerCase();

  // 1. Google Chrome
  if (lower.includes('chrome')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '6px' }}>
        <circle cx="24" cy="24" r="20" fill="#f8fafc" />
        <path d="M24 4C12.95 4 4 12.95 4 24c0 1.25.12 2.47.34 3.65L18.4 14.8C19.78 13.06 21.78 12 24 12h18.82C39.06 7.18 31.95 4 24 4z" fill="#EA4335" />
        <path d="M42.82 12H24c-2.22 0-4.22 1.06-5.6 2.8L4.34 27.65C6.73 38.38 16.39 44 24 44c4.68 0 9-1.58 12.44-4.24l-8.08-14C29.08 24.58 30 23.36 30 22c0-3.31-2.69-6-6-6h18.82z" fill="#FBBC05" />
        <path d="M24 44c8.47 0 15.77-5.28 18.73-12.82l-14.37-1.42c-1.38 1.74-3.38 2.8-5.6 2.8-3.08 0-5.63-2.32-5.96-5.3L4.34 27.65C7.23 37.19 14.88 44 24 44z" fill="#34A853" />
        <circle cx="24" cy="24" r="9" fill="#FFFFFF" />
        <circle cx="24" cy="24" r="7" fill="#4285F4" />
      </svg>
    );
  }

  // 2. Angry Birds / Rovio Game
  if (lower.includes('angry') || lower.includes('bird') || lower.includes('rovio')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '8px' }}>
        <rect width="48" height="48" rx="10" fill="#DC2626" />
        <circle cx="24" cy="24" r="14" fill="#EF4444" />
        <circle cx="19" cy="20" r="4" fill="#FFFFFF" />
        <circle cx="29" cy="20" r="4" fill="#FFFFFF" />
        <circle cx="20" cy="20" r="2" fill="#000000" />
        <circle cx="28" cy="20" r="2" fill="#000000" />
        <polygon points="24,23 19,28 29,28" fill="#F59E0B" />
        <path d="M15 16 L21 18 M33 16 L27 18" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 3. Microsoft Edge
  if (lower.includes('msedge') || lower.includes('edge')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '6px' }}>
        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0078D7" />
            <stop offset="50%" stopColor="#00B294" />
            <stop offset="100%" stopColor="#00C853" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="10" fill="#f0fdf4" />
        <path
          d="M24 8c-8.84 0-16 7.16-16 16 0 5.4 2.67 10.18 6.78 13.08.64-.62 1.34-1.2 2.1-1.72C14.18 33.32 12.5 30 12.5 26c0-6.35 5.15-11.5 11.5-11.5 4.9 0 9.07 3.07 10.7 7.42C36.4 15.6 30.7 8 24 8zm6 16c-3.31 0-6 2.69-6 6 0 3.31 2.69 6 6 6 4.42 0 8-3.58 8-8 0-5.52-4.48-10-10-10H14c-1.1 0-2 .9-2 2s.9 2 2 2h14c3.31 0 6 2.69 6 6z"
          fill="url(#edgeGrad)"
        />
      </svg>
    );
  }

  // 4. Discord
  if (lower.includes('discord')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '8px' }}>
        <rect width="48" height="48" rx="10" fill="#5865F2" />
        <path
          d="M34.5 15.2a22.2 22.2 0 0 0-5.5-1.7.3.3 0 0 0-.3.1c-.2.4-.5 1-.7 1.4a20.5 20.5 0 0 0-8 0 11.4 11.4 0 0 0-.7-1.4.3.3 0 0 0-.3-.1 22.2 22.2 0 0 0-5.5 1.7.3.3 0 0 0-.1.1C9.9 20.5 9 25.6 9.4 30.6a.3.3 0 0 0 .1.2 22.3 22.3 0 0 0 6.7 3.4.3.3 0 0 0 .3-.1c.5-.7 1-1.5 1.4-2.3a.3.3 0 0 0-.2-.4c-.7-.3-1.4-.6-2.1-1a.3.3 0 0 1 0-.5c.1-.1.3-.2.4-.3.1 0 .2 0 .2.1 4.4 2 9 2 13.4 0 .1 0 .2 0 .2-.1.2.1.3.2.4.3a.3.3 0 0 1 0 .5c-.7.4-1.4.7-2.1 1a.3.3 0 0 0-.2.4c.4.8.9 1.6 1.4 2.3.1.1.2.2.3.1a22.3 22.3 0 0 0 6.7-3.4.3.3 0 0 0 .1-.2c.5-5.8-.8-10.9-4-15.3a.3.3 0 0 0-.1-.1zM19 26.5c-1.3 0-2.4-1.2-2.4-2.7s1-2.7 2.4-2.7 2.4 1.2 2.4 2.7-1 2.7-2.4 2.7zm10 0c-1.3 0-2.4-1.2-2.4-2.7s1-2.7 2.4-2.7 2.4 1.2 2.4 2.7-1 2.7-2.4 2.7z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 5. Steam
  if (lower.includes('steam')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '8px' }}>
        <rect width="48" height="48" rx="10" fill="#171A21" />
        <circle cx="24" cy="24" r="18" fill="#1B2838" stroke="#66C0F4" strokeWidth="2" />
        <circle cx="33" cy="18" r="5" fill="#66C0F4" />
        <circle cx="18" cy="30" r="4" fill="#C7D5E0" />
        <path d="M18 30 L33 18" stroke="#C7D5E0" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 26 L22 34" stroke="#66C0F4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 6. Spotify
  if (lower.includes('spotify')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '8px' }}>
        <rect width="48" height="48" rx="10" fill="#191414" />
        <circle cx="24" cy="24" r="18" fill="#1DB954" />
        <path d="M15 19c6.5-1.5 13.5-.8 18.5 2" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M16 24c5-1 10.5-.5 15 1.8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M17 29c4-.8 8-.4 12 1.4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // 7. Visual Studio Code
  if (lower.includes('code') || lower.includes('vscode')) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '8px' }}>
        <rect width="48" height="48" rx="10" fill="#1E1E1E" />
        <path d="M36 8 L24 18 L15 11 L10 14 L18 24 L10 34 L15 37 L24 30 L36 40 L40 37 L40 11 Z" fill="#007ACC" />
        <path d="M36 8 L24 18 L18 24 L24 30 L36 40 Z" fill="#0065A9" />
        <path d="M15 11 L10 14 L18 24 L10 34 L15 37 L22 29 L22 19 Z" fill="#1F9CF0" />
      </svg>
    );
  }

  // 8. Games (eFootball, Roblox, Valorant, Riot, Epic, etc.)
  if (
    lower.includes('football') ||
    lower.includes('game') ||
    lower.includes('valorant') ||
    lower.includes('riot') ||
    lower.includes('epic') ||
    lower.includes('roblox') ||
    lower.includes('cs2') ||
    lower.includes('gta')
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0, borderRadius: '8px' }}>
        <rect width="48" height="48" rx="10" fill="#7C3AED" />
        <path d="M15 18 C12 18 9 21 9 26 C9 31 12 34 16 34 L19 29 L29 29 L32 34 C36 34 39 31 39 26 C39 21 36 18 33 18 Z" fill="#FFFFFF" />
        <circle cx="16" cy="24" r="2" fill="#7C3AED" />
        <circle cx="32" cy="24" r="2" fill="#7C3AED" />
        <circle cx="29" cy="22" r="1.5" fill="#7C3AED" />
        <circle cx="35" cy="22" r="1.5" fill="#7C3AED" />
      </svg>
    );
  }

  // 9. Default / Generic Executable: Clean Gradient Initials Badge
  const initial = name.replace(/\.exe$/i, '').charAt(0).toUpperCase() || 'A';
  const charCode = name.charCodeAt(0) || 65;
  const palettes = [
    { bg: 'linear-gradient(135deg, #0284c7, #38bdf8)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #059669, #34d399)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #d97706, #fbbf24)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #e11d48, #fb7185)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #475569, #64748b)', text: '#ffffff' },
  ];
  const selected = palettes[charCode % palettes.length];

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        background: selected.bg,
        color: selected.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${Math.round(size * 0.44)}px`,
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        userSelect: 'none',
      }}
    >
      {initial}
    </div>
  );
};
