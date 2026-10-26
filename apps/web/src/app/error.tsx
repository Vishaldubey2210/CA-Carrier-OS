'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { reportFrontendError } from '../lib/error-reporter';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Record sanitized telemetry with correlation / digest ID
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
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '540px',
          padding: '3rem 2.5rem',
          background: 'var(--surface-primary)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-rose)',
            marginBottom: '1.5rem',
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          An unexpected interruption occurred while processing your request. Your account and workspace data remain safe.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ padding: '0.625rem 1.25rem', gap: '0.5rem' }}
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="btn btn-secondary"
            style={{ padding: '0.625rem 1.25rem', gap: '0.5rem' }}
          >
            <Home size={15} />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/contact"
            className="btn btn-secondary"
            style={{ padding: '0.625rem 1.25rem', gap: '0.5rem' }}
          >
            <HelpCircle size={15} />
            <span>Contact Support</span>
          </Link>
        </div>

        {error?.digest && (
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
            }}
          >
            Incident Reference: {error.digest}
          </div>
        )}
      </div>
    </div>
  );
}
