import React, { useState, useEffect } from 'react';
import { NetworkMetrics } from '../types/network';
import { IconActivity, IconCheck } from './Icons';

interface StartupScannerOverlayProps {
  metrics: NetworkMetrics;
  onComplete: () => void;
}

export const StartupScannerOverlay: React.FC<StartupScannerOverlayProps> = ({
  metrics,
  onComplete,
}) => {
  const [progress, setProgress] = useState(15);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const steps = [
    {
      title: 'Mendeteksi Perangkat & Kartu Jaringan',
      desc: metrics.activeAdapter ? `Ditemukan: ${metrics.activeAdapter}` : 'Memindai adapter Wi-Fi & Ethernet...',
    },
    {
      title: 'Menganalisa Gateway & Koneksi Internet',
      desc: metrics.gateway ? `Gateway: ${metrics.gateway} • IP: ${metrics.ipAddress || '127.0.0.1'}` : 'Memeriksa jalur perutean jaringan...',
    },
    {
      title: 'Menginisialisasi Engine NetSpeedX',
      desc: 'Menyiapkan pemantau bandwidth & taskbar speed meter...',
    },
    {
      title: 'Sistem Siap Digunakan',
      desc: 'Semua modul jaringan aktif dan berjalan lancar',
    },
  ];

  useEffect(() => {
    // Step 1: Initial scan
    const t1 = setTimeout(() => {
      setProgress(45);
      setCurrentStep(1);
    }, 450);

    // Step 2: Gateway check
    const t2 = setTimeout(() => {
      setProgress(75);
      setCurrentStep(2);
    }, 950);

    // Step 3: Engine ready
    const t3 = setTimeout(() => {
      setProgress(100);
      setCurrentStep(3);
    }, 1450);

    // Step 4: Fade out and complete
    const t4 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1850);

    const t5 = setTimeout(() => {
      onComplete();
    }, 2150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        setTimeout(onComplete, 200);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.99) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Background Cyber Grid Glow */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, rgba(14, 165, 233, 0.03) 60%, transparent 80%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Glass Card */}
      <div
        style={{
          position: 'relative',
          width: '420px',
          padding: '36px 32px',
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(2, 132, 199, 0.2)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Animated Scanner Radar Icon */}
        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Radar Pulse Rings */}
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              border: '2px solid rgba(14, 165, 233, 0.4)',
              animation: 'scannerPulse 1.8s infinite ease-out',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '-18px',
              borderRadius: '50%',
              border: '1px dashed rgba(56, 189, 248, 0.25)',
            }}
          />

          {/* Center Badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(2, 132, 199, 0.6)',
              color: '#ffffff',
            }}
          >
            {progress === 100 ? (
              <IconCheck size={32} color="#ffffff" />
            ) : (
              <IconActivity size={32} color="#ffffff" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          NetSpeedX Engine
        </h2>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
          Menganalisa Perangkat Jaringan
        </span>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '9999px',
              overflow: 'hidden',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                borderRadius: '9999px',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
            <span>Inisialisasi Sistem</span>
            <span style={{ color: '#38bdf8' }}>{progress}%</span>
          </div>
        </div>

        {/* Step Status Text */}
        <div
          style={{
            minHeight: '44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: progress === 100 ? '#10b981' : '#38bdf8',
                boxShadow: progress === 100 ? '0 0 8px #10b981' : '0 0 8px #38bdf8',
              }}
            />
            <span>{steps[currentStep].title}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '340px' }}>
            {steps[currentStep].desc}
          </p>
        </div>

        {/* Quick Dismiss Hint */}
        <span style={{ fontSize: '10px', color: '#475569', marginTop: '16px', fontWeight: 500 }}>
          Klik di mana saja untuk langsung masuk
        </span>
      </div>

      <style>{`
        @keyframes scannerPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
