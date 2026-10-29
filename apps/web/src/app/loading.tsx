'use client';

import React from 'react';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div
        className="animate-pulse"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'var(--brand-primary)',
          color: '#ffffff',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        CA
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 600 }}>
        LOADING SOVEREIGN WORKSPACE...
      </div>
    </div>
  );
}
