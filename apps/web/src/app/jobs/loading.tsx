'use client';

import React from 'react';

export default function JobsLoading() {
  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        width: '100%',
        minHeight: '70vh',
      }}
      className="animate-fade-in"
    >
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div className="skeleton-shimmer" style={{ width: '280px', height: '24px' }} />
          <div className="skeleton-shimmer" style={{ width: '440px', height: '14px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '120px', height: '32px', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div className="skeleton-shimmer" style={{ width: '140px', height: '32px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '120px', height: '32px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '140px', height: '32px', borderRadius: '6px' }} />
      </div>

      {/* Search Toolbar Skeleton */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
        <div className="skeleton-shimmer" style={{ flex: 1, height: '34px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '130px', height: '34px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '130px', height: '34px', borderRadius: '6px' }} />
      </div>

      {/* Job Card List Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '1.25rem',
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
                <div className="skeleton-shimmer" style={{ width: '35%', height: '18px' }} />
                <div className="skeleton-shimmer" style={{ width: '25%', height: '14px' }} />
              </div>
              <div className="skeleton-shimmer" style={{ width: '90px', height: '32px', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="skeleton-shimmer" style={{ width: '100px', height: '14px' }} />
              <div className="skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
              <div className="skeleton-shimmer" style={{ width: '110px', height: '14px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
