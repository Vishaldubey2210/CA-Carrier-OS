'use client';

import React from 'react';

export default function Loading() {
  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        minHeight: '70vh',
      }}
      className="animate-fade-in"
    >
      {/* Top Header Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '220px', height: '24px' }} />
          <div className="skeleton-shimmer" style={{ width: '380px', height: '14px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100px', height: '36px', borderRadius: '6px' }} />
          <div className="skeleton-shimmer" style={{ width: '120px', height: '36px', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Metric Strip Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'var(--border-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface-primary)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div className="skeleton-shimmer" style={{ width: '90px', height: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '130px', height: '28px' }} />
            <div className="skeleton-shimmer" style={{ width: '110px', height: '12px' }} />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div
        style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="skeleton-shimmer" style={{ flex: 1, height: '40px', borderRadius: '6px' }} />
          <div className="skeleton-shimmer" style={{ width: '180px', height: '40px', borderRadius: '6px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div className="skeleton-shimmer" style={{ width: '36px', height: '36px', borderRadius: '6px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div className="skeleton-shimmer" style={{ width: '240px', height: '16px' }} />
                  <div className="skeleton-shimmer" style={{ width: '160px', height: '12px' }} />
                </div>
              </div>
              <div className="skeleton-shimmer" style={{ width: '90px', height: '32px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
