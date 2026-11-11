'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { reportFrontendError } from '../lib/error-reporter';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportFrontendError(error, {
      componentName: 'AppErrorBoundary',
      correlationId: error?.digest,
    });
  }, [error]);

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
      className="animate-fade-in"
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#B45309',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle size={26} />
        </div>

        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}
        >
          Temporary service hiccup
        </h1>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          We encountered an issue loading this view. Your session and data are secure. Please try refreshing the section.
        </p>

        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.125rem' }}
          >
            <RotateCcw size={14} />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="btn btn-secondary"
            style={{ padding: '0.55rem 1.125rem' }}
          >
            <Home size={14} />
            <span>Return Home</span>
          </Link>
        </div>

        {error?.digest && (
          <div style={{ marginTop: '1.5rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Error Reference: <code style={{ fontFamily: 'var(--font-mono)' }}>{error.digest}</code>
          </div>
        )}
      </div>
    </div>
  );
}
