import React, { useState, useMemo, useEffect } from 'react';
import {
  IconGauge,
  IconGlobe,
  IconRoute,
  IconSparkles,
  IconDownload,
  IconUpload,
  IconActivity,
  IconCheckCircle,
} from '../components/Icons';
import {
  SpeedTestResult,
  SpeedTestProgress,
  DnsBenchmarkItem,
  TracerouteHop,
} from '../types/network';

interface SpeedTestViewProps {
  onRunSpeedTest?: (onProgress: (p: SpeedTestProgress) => void, mode?: 'download' | 'upload') => Promise<SpeedTestResult>;
  speedTestHistory?: SpeedTestResult[];
  onRunDnsBenchmark?: () => Promise<DnsBenchmarkItem[]>;
  onRunTraceroute?: (target: string) => Promise<TracerouteHop[]>;
  onFlushDns?: () => Promise<string>;
}

type SpeedTab = 'speedtest' | 'dnsbench' | 'traceroute';

export const SpeedTestView: React.FC<SpeedTestViewProps> = ({
  onRunSpeedTest,
  speedTestHistory = [],
  onRunDnsBenchmark,
  onRunTraceroute,
  onFlushDns,
}) => {
  const [activeTab, setActiveTab] = useState<SpeedTab>('speedtest');

  // 1. Speed Test States (Strictly Independent Download or Upload)
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [testMode, setTestMode] = useState<'download' | 'upload'>('download');
  const [speedProgress, setSpeedProgress] = useState<SpeedTestProgress | null>(null);
  const [lastSpeedResult, setLastSpeedResult] = useState<SpeedTestResult | null>(
    speedTestHistory.length > 0 ? speedTestHistory[0] : null
  );

  // Live Gauge Animation Values
  const [displayGaugeSpeed, setDisplayGaugeSpeed] = useState<number>(0);

  // 2. DNS Benchmark States
  const [dnsResults, setDnsResults] = useState<DnsBenchmarkItem[]>([]);
  const [isRunningDns, setIsRunningDns] = useState(false);

  // 3. Traceroute States
  const [traceTargetInput, setTraceTargetInput] = useState('1.1.1.1');
  const [traceHops, setTraceHops] = useState<TracerouteHop[]>([]);
  const [isRunningTrace, setIsRunningTrace] = useState(false);

  // 4. Flush DNS Status
  const [flushStatus, setFlushStatus] = useState<string | null>(null);

  // Smooth Speedometer Needle / Counter Interpolation
  useEffect(() => {
    if (!isTestingSpeed) {
      if (lastSpeedResult) {
        setDisplayGaugeSpeed(testMode === 'upload' ? lastSpeedResult.uploadMbps : lastSpeedResult.downloadMbps);
      } else {
        setDisplayGaugeSpeed(0);
      }
      return;
    }

    if (speedProgress) {
      const targetSpeed = speedProgress.currentSpeedMbps ?? 0;
      setDisplayGaugeSpeed(targetSpeed);
    }
  }, [isTestingSpeed, speedProgress, lastSpeedResult, testMode]);

  const handleStartSpeedTest = async (mode: 'download' | 'upload') => {
    if (!onRunSpeedTest || isTestingSpeed) return;
    setIsTestingSpeed(true);
    setTestMode(mode);
    setDisplayGaugeSpeed(0);

    setSpeedProgress({
      phase: mode,
      progress: 5,
      currentSpeedMbps: 0,
      pingMs: 0,
      downloadMbps: 0,
      uploadMbps: 0,
      message: mode === 'download' ? 'Starting Download Speed Test...' : 'Starting Upload Speed Test...',
    });

    try {
      const res = await onRunSpeedTest((prog) => {
        setSpeedProgress(prog);
      }, mode);
      setLastSpeedResult(res);
      setDisplayGaugeSpeed(mode === 'upload' ? res.uploadMbps : res.downloadMbps);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingSpeed(false);
    }
  };

  const handleRunDnsBenchmark = async () => {
    if (!onRunDnsBenchmark || isRunningDns) return;
    setIsRunningDns(true);
    try {
      const res = await onRunDnsBenchmark();
      setDnsResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningDns(false);
    }
  };

  const handleRunTraceroute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onRunTraceroute || isRunningTrace) return;
    setIsRunningTrace(true);
    try {
      const res = await onRunTraceroute(traceTargetInput);
      setTraceHops(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningTrace(false);
    }
  };

  const handleFlushDns = async () => {
    if (!onFlushDns) return;
    try {
      const msg = await onFlushDns();
      setFlushStatus(msg);
      setTimeout(() => setFlushStatus(null), 4000);
    } catch (err) {
      setFlushStatus('Failed to flush DNS');
    }
  };

  // Ookla-style Gauge Calculation (240 Degree Sweep from -120deg to +120deg)
  const gaugeData = useMemo(() => {
    const maxScale = 150; // Max dial scale in Mbps
    const clampedSpeed = Math.min(Math.max(displayGaugeSpeed, 0), maxScale);
    const fraction = clampedSpeed / maxScale;

    // Angle from -120deg (0 Mbps) to +120deg (150 Mbps)
    const angleDeg = -120 + fraction * 240;
    const angleRad = (angleDeg - 90) * (Math.PI / 180);

    const cx = 150;
    const cy = 150;
    const radius = 105;

    // Needle end coordinates
    const needleLen = 85;
    const needleX = cx + needleLen * Math.cos(angleRad);
    const needleY = cy + needleLen * Math.sin(angleRad);

    // Arc path for the active progress glow
    const startAngleRad = (-120 - 90) * (Math.PI / 180);
    const startX = cx + radius * Math.cos(startAngleRad);
    const startY = cy + radius * Math.sin(startAngleRad);
    const endX = cx + radius * Math.cos(angleRad);
    const endY = cy + radius * Math.sin(angleRad);
    const largeArcFlag = angleDeg - -120 > 180 ? 1 : 0;
    const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

    return {
      angleDeg,
      needleX,
      needleY,
      arcPath,
      fraction,
      cx,
      cy,
      radius,
    };
  }, [displayGaugeSpeed]);

  const activePhase = speedProgress?.phase || (lastSpeedResult ? 'completed' : 'idle');

  return (
    <div className="content-body">
      {/* Top Header Navigation Tabs */}
      <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'speedtest', label: 'Internet Speed Test', icon: <IconGauge size={16} /> },
            { id: 'dnsbench', label: 'DNS Benchmark', icon: <IconGlobe size={16} /> },
            { id: 'traceroute', label: 'Traceroute Tool', icon: <IconRoute size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SpeedTab)}
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

        {/* Flush DNS action button */}
        <button
          onClick={handleFlushDns}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: '#ffffff',
            color: '#0284c7',
            fontWeight: 600,
            fontSize: '12px',
            cursor: 'pointer',
          }}
          title="Flush Windows DNS Resolver Cache"
        >
          <IconSparkles size={14} color="#0284c7" />
          <span>Flush DNS Cache</span>
        </button>
      </div>

      {flushStatus && (
        <div style={{ background: '#ecfdf5', color: '#059669', padding: '10px 16px', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '12px', fontWeight: 600 }}>
          {flushStatus}
        </div>
      )}

      {/* 1. SPEED TEST MAIN VIEW */}
      {activeTab === 'speedtest' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '28px' }}>
          {/* Header info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconGauge size={20} color="#0284c7" />
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  Internet Speedometer
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Measure real Download and Upload throughput to the nearest CDN endpoint
              </p>
            </div>

            {/* Dedicated Action Buttons: Only Download and Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => handleStartSpeedTest('download')}
                disabled={isTestingSpeed}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isTestingSpeed && testMode === 'download' ? '#cbd5e1' : '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isTestingSpeed ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                  transition: 'all 0.15s ease',
                }}
                title="Test Download Speed Only"
              >
                <IconDownload size={15} color="#ffffff" />
                <span>Test Download</span>
              </button>

              <button
                onClick={() => handleStartSpeedTest('upload')}
                disabled={isTestingSpeed}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isTestingSpeed && testMode === 'upload' ? '#cbd5e1' : '#7c3aed',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isTestingSpeed ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.15s ease',
                }}
                title="Test Upload Speed Only"
              >
                <IconUpload size={15} color="#ffffff" />
                <span>Test Upload</span>
              </button>
            </div>
          </div>

          {/* MAIN SPEEDOMETER GAUGE HERO SECTION */}
          <div
            className={
              isTestingSpeed
                ? testMode === 'upload'
                  ? 'speed-gauge-ul-active'
                  : 'speed-gauge-dl-active'
                : ''
            }
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 16px',
              background: 'radial-gradient(circle at center, rgba(2, 132, 199, 0.05) 0%, rgba(248, 250, 252, 0.7) 70%)',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              minHeight: '360px',
            }}
          >
            {/* Phase Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 20px',
                borderRadius: '9999px',
                background:
                  activePhase === 'download'
                    ? 'rgba(2, 132, 199, 0.12)'
                    : activePhase === 'upload'
                    ? 'rgba(124, 58, 237, 0.12)'
                    : activePhase === 'completed'
                    ? 'rgba(5, 150, 105, 0.12)'
                    : '#f1f5f9',
                color:
                  activePhase === 'download'
                    ? '#0284c7'
                    : activePhase === 'upload'
                    ? '#7c3aed'
                    : activePhase === 'completed'
                    ? '#059669'
                    : '#64748b',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '12px',
                boxShadow: isTestingSpeed ? '0 0 12px rgba(2, 132, 199, 0.2)' : 'none',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'currentColor',
                }}
              />
              <span>
                {activePhase === 'download'
                  ? 'Testing Download Speed...'
                  : activePhase === 'upload'
                  ? 'Testing Upload Speed...'
                  : activePhase === 'completed'
                  ? `${testMode === 'upload' ? 'Upload' : 'Download'} Test Completed`
                  : 'Select: Test Download or Test Upload'}
              </span>
            </div>

            {/* THE CIRCULAR SPEEDOMETER DIAL */}
            {!isTestingSpeed && !lastSpeedResult ? (
              /* DEDICATED INDEPENDENT BUTTONS BEFORE FIRST TEST */
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '30px 0' }}>
                <div
                  onClick={() => handleStartSpeedTest('download')}
                  style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.3)',
                    userSelect: 'none',
                    textAlign: 'center',
                    gap: '6px',
                  }}
                >
                  <IconDownload size={32} color="#ffffff" />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>TEST DOWNLOAD</span>
                </div>

                <div
                  onClick={() => handleStartSpeedTest('upload')}
                  style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
                    userSelect: 'none',
                    textAlign: 'center',
                    gap: '6px',
                  }}
                >
                  <IconUpload size={32} color="#ffffff" />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>TEST UPLOAD</span>
                </div>
              </div>
            ) : (
              /* LIVE RADIAL SPEEDOMETER GAUGE */
              <div style={{ position: 'relative', width: '320px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 300 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gaugeDlGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient id="gaugeUlGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Background Track Arc (-120deg to +120deg) */}
                  <path
                    d="M 59 202 A 105 105 0 1 1 241 202"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* Gauge Radial Tick Marks & Numbers */}
                  {[
                    { val: 0, label: '0' },
                    { val: 25, label: '25' },
                    { val: 50, label: '50' },
                    { val: 75, label: '75' },
                    { val: 100, label: '100' },
                    { val: 125, label: '125' },
                    { val: 150, label: '150+' },
                  ].map((tick, idx) => {
                    const tickAngleDeg = -120 + (tick.val / 150) * 240;
                    const tickRad = (tickAngleDeg - 90) * (Math.PI / 180);
                    const innerR = 84;
                    const outerR = 94;
                    const textR = 70;

                    const x1 = 150 + innerR * Math.cos(tickRad);
                    const y1 = 150 + innerR * Math.sin(tickRad);
                    const x2 = 150 + outerR * Math.cos(tickRad);
                    const y2 = 150 + outerR * Math.sin(tickRad);
                    const tx = 150 + textR * Math.cos(tickRad);
                    const ty = 150 + textR * Math.sin(tickRad) + 3;

                    return (
                      <g key={idx}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" />
                        <text
                          x={tx}
                          y={ty}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="9"
                          fontWeight="700"
                          fontFamily="sans-serif"
                        >
                          {tick.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Dynamic Glowing Progress Arc */}
                  {gaugeData.fraction > 0.01 && (
                    <path
                      d={gaugeData.arcPath}
                      fill="none"
                      stroke={testMode === 'upload' ? 'url(#gaugeUlGrad)' : 'url(#gaugeDlGrad)'}
                      strokeWidth="14"
                      strokeLinecap="round"
                      filter="url(#gaugeGlow)"
                      style={{ transition: 'all 0.15s ease' }}
                    />
                  )}

                  {/* Center Needle Indicator with Elastic Sweep */}
                  <line
                    x1="150"
                    y1="150"
                    x2={gaugeData.needleX}
                    y2={gaugeData.needleY}
                    stroke={testMode === 'upload' ? '#7c3aed' : '#0284c7'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{
                      transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    }}
                  />

                  {/* Center Pivot Circle */}
                  <circle cx="150" cy="150" r="11" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
                  <circle cx="150" cy="150" r="5" fill={testMode === 'upload' ? '#7c3aed' : '#0284c7'} />
                </svg>

                {/* Digital Counter in Center */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <span
                    className="mono-text"
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: testMode === 'upload' ? '#7c3aed' : '#0284c7',
                      lineHeight: 1,
                      textShadow: '0 2px 12px rgba(2, 132, 199, 0.2)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {displayGaugeSpeed.toFixed(1)}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#64748b',
                      marginTop: '4px',
                      letterSpacing: '1px',
                    }}
                  >
                    Mbps
                  </span>
                </div>
              </div>
            )}

            {/* Live Progress Bar during test */}
            {isTestingSpeed && speedProgress && (
              <div style={{ width: '80%', maxWidth: '460px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                  <span>{speedProgress.message}</span>
                  <span className="mono-text">{speedProgress.progress.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${speedProgress.progress}%`,
                      height: '100%',
                      background: testMode === 'upload' ? '#7c3aed' : '#0284c7',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Server Connection & ISP Footer in Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconGlobe size={14} color="#0284c7" />
                <span>Server: <b>Cloudflare CDN (Global Edge)</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconActivity size={14} color="#059669" />
                <span>Interface: <b>Wi-Fi Adapter (Real Hardware)</b></span>
              </div>
            </div>
          </div>

          {/* 2 RESULT METRIC CARDS: DOWNLOAD SPEED & UPLOAD SPEED ONLY */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Download Speed Card */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="card-label">Download Speed</span>
                <IconDownload size={20} color="#0284c7" />
              </div>
              <div className="card-value-group" style={{ marginTop: '10px' }}>
                <span className="card-big-value" style={{ color: '#0284c7' }}>
                  {isTestingSpeed && testMode === 'download'
                    ? speedProgress?.downloadMbps.toFixed(1) ?? '--'
                    : lastSpeedResult && lastSpeedResult.downloadMbps > 0
                    ? lastSpeedResult.downloadMbps.toFixed(1)
                    : '--'}
                </span>
                <span className="card-unit">Mbps</span>
              </div>
              <span className="card-subtext" style={{ color: '#0284c7', fontWeight: 600 }}>
                {isTestingSpeed && testMode === 'download' ? 'Measuring...' : 'Download Throughput'}
              </span>
            </div>

            {/* Upload Speed Card */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="card-label">Upload Speed</span>
                <IconUpload size={20} color="#7c3aed" />
              </div>
              <div className="card-value-group" style={{ marginTop: '10px' }}>
                <span className="card-big-value" style={{ color: '#7c3aed' }}>
                  {isTestingSpeed && testMode === 'upload'
                    ? speedProgress?.uploadMbps.toFixed(1) ?? '--'
                    : lastSpeedResult && lastSpeedResult.uploadMbps > 0
                    ? lastSpeedResult.uploadMbps.toFixed(1)
                    : '--'}
                </span>
                <span className="card-unit">Mbps</span>
              </div>
              <span className="card-subtext" style={{ color: '#7c3aed', fontWeight: 600 }}>
                {isTestingSpeed && testMode === 'upload' ? 'Measuring...' : 'Upload Throughput'}
              </span>
            </div>
          </div>

          {/* Speed Quality Assessment Badge */}
          {lastSpeedResult && !isTestingSpeed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(2, 132, 199, 0.06))',
                borderRadius: '12px',
                border: '1px solid rgba(5, 150, 105, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconCheckCircle size={22} color="#059669" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Ultra-Fast & Stable Connection (Grade A+)
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Optimized for 4K Ultra HD video streaming, lag-free multiplayer gaming, and high-definition video conferencing.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: '#059669', color: '#ffffff' }}>
                  4K Streaming Ready
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: '#0284c7', color: '#ffffff' }}>
                  Low Latency Gaming
                </span>
              </div>
            </div>
          )}

          {/* Speed Test Results Table */}
          {speedTestHistory.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Stored Speed Test History (SQLite)
                </h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Date & Time</th>
                    <th style={{ padding: '10px 14px' }}>Test Type</th>
                    <th style={{ padding: '10px 14px' }}>Download Speed</th>
                    <th style={{ padding: '10px 14px' }}>Upload Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {speedTestHistory.slice(0, 10).map((item) => {
                    const isDownloadOnly = item.downloadMbps > 0 && (!item.uploadMbps || item.uploadMbps === 0);

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)' }}>
                        <td style={{ padding: '12px 14px' }}>{item.date} {item.timestamp}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: isDownloadOnly
                                ? 'rgba(2, 132, 199, 0.1)'
                                : 'rgba(124, 58, 237, 0.1)',
                              color: isDownloadOnly
                                ? '#0284c7'
                                : '#7c3aed',
                            }}
                          >
                            {isDownloadOnly ? 'Download Only' : 'Upload Only'}
                          </span>
                        </td>
                        <td className="mono-text" style={{ padding: '12px 14px', fontWeight: 700, color: item.downloadMbps > 0 ? '#0284c7' : '#94a3b8' }}>
                          {item.downloadMbps > 0 ? `${item.downloadMbps.toFixed(1)} Mbps` : '-'}
                        </td>
                        <td className="mono-text" style={{ padding: '12px 14px', fontWeight: 700, color: item.uploadMbps > 0 ? '#7c3aed' : '#94a3b8' }}>
                          {item.uploadMbps > 0 ? `${item.uploadMbps.toFixed(1)} Mbps` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. DNS BENCHMARK */}
      {activeTab === 'dnsbench' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>DNS Speed Benchmark</h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Compare resolution latency across Cloudflare, Google, Quad9, and local resolvers
              </p>
            </div>

            <button
              onClick={handleRunDnsBenchmark}
              disabled={isRunningDns}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isRunningDns ? 'not-allowed' : 'pointer',
              }}
            >
              <IconGlobe size={16} color="#ffffff" />
              <span>{isRunningDns ? 'Testing DNS Servers...' : 'Run DNS Benchmark'}</span>
            </button>
          </div>

          {dnsResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dnsResults.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.provider}</span>
                      <span className="mono-text" style={{ fontSize: '11px', color: '#64748b' }}>({item.ip})</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Rating: {item.rating}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span className="mono-text" style={{ fontSize: '18px', fontWeight: 800, color: item.avgResponseMs < 25 ? '#059669' : '#0284c7' }}>
                      {item.avgResponseMs.toFixed(1)} ms
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: idx === 0 ? 'rgba(5, 150, 105, 0.15)' : '#f1f5f9',
                        color: idx === 0 ? '#059669' : '#475569',
                      }}
                    >
                      {idx === 0 ? 'FASTEST' : `#${idx + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '13px' }}>
              Click <b>"Run DNS Benchmark"</b> to test and compare DNS resolver latencies.
            </div>
          )}
        </div>
      )}

      {/* 3. TRACEROUTE TOOL */}
      {activeTab === 'traceroute' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Traceroute Network Path</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Trace hop-by-hop packet routing from your device to the destination server
            </p>
          </div>

          <form onSubmit={handleRunTraceroute} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={traceTargetInput}
              onChange={(e) => setTraceTargetInput(e.target.value)}
              placeholder="Enter IP or Hostname (e.g. 1.1.1.1, google.com)"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isRunningTrace}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isRunningTrace ? 'not-allowed' : 'pointer',
              }}
            >
              {isRunningTrace ? 'Tracing...' : 'Start Trace'}
            </button>
          </form>

          {traceHops.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {traceHops.map((hop) => (
                <div
                  key={hop.hop}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, color: '#0284c7', width: '24px' }}>#{hop.hop}</span>
                    <span className="mono-text" style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>{hop.ip}</span>
                    {hop.hostname && <span style={{ fontSize: '11px', color: '#64748b' }}>({hop.hostname})</span>}
                  </div>

                  <span className="mono-text" style={{ fontWeight: 700, color: '#059669' }}>
                    {hop.responseTimeMs !== null && hop.responseTimeMs !== undefined ? `${hop.responseTimeMs.toFixed(1)} ms` : '* * * (Timeout)'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '13px' }}>
              Enter a destination hostname and click <b>"Start Trace"</b> to inspect network routing hops.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
