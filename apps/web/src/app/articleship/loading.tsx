'use client';

import React from 'react';

export default function ArticleshipLoading() {
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
          <div className="skeleton-shimmer" style={{ width: '260px', height: '24px' }} />
          <div className="skeleton-shimmer" style={{ width: '420px', height: '14px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '110px', height: '32px', borderRadius: '6px' }} />
          <div className="skeleton-shimmer" style={{ width: '130px', height: '32px', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div className="skeleton-shimmer" style={{ width: '130px', height: '32px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '160px', height: '32px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '180px', height: '32px', borderRadius: '6px' }} />
      </div>

      {/* Metrics Row Skeleton */}
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
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: 'var(--surface-primary)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton-shimmer" style={{ width: '60%', height: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '40%', height: '22px' }} />
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
        <div className="skeleton-shimmer" style={{ flex: 1, height: '32px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '120px', height: '32px', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ width: '120px', height: '32px', borderRadius: '6px' }} />
      </div>

      {/* Table Rows Skeleton */}
      <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1rem',
              borderBottom: i < 7 ? '1px solid var(--border-subtle)' : 'none',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 2 }}>
              <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <div className="skeleton-shimmer" style={{ width: '50%', height: '14px' }} />
                <div className="skeleton-shimmer" style={{ width: '30%', height: '12px' }} />
              </div>
            </div>
            <div className="skeleton-shimmer" style={{ width: '120px', height: '14px', flex: 1 }} />
            <div className="skeleton-shimmer" style={{ width: '100px', height: '14px', flex: 1 }} />
            <div className="skeleton-shimmer" style={{ width: '70px', height: '28px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
