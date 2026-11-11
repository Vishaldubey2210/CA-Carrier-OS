'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  FileText,
  TrendingUp,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
      }}
      className="animate-fade-in"
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '580px',
          width: '100%',
          padding: '2.75rem 2rem',
          textAlign: 'center',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Subtle Status Pill */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              borderRadius: '4px',
              background: '#F1F5F9',
              color: '#475569',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            404 &bull; PAGE NOT FOUND
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.625rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '0.625rem',
          }}
        >
          We couldn&apos;t find that page
        </h1>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '420px',
            margin: '0 auto 1.75rem auto',
          }}
        >
          The link you followed may be broken or the page may have been relocated. Here are the most active sections of CharteredOS:
        </p>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.625rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          <Link
            href="/"
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.125rem' }}
          >
            <Home size={15} />
            <span>Back to Home</span>
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1.125rem' }}
            >
              <LayoutDashboard size={15} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ padding: '0.55rem 1.125rem' }}
            >
              <span>Sign In</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Clean Directory Grid */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            Quick Navigation
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.625rem',
            }}
          >
            <Link
              href="/articleship"
              className="interactive-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              <GraduationCap size={16} color="var(--brand-primary)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Articleship Hub</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Form 102/103/104</div>
              </div>
            </Link>

            <Link
              href="/jobs"
              className="interactive-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              <Briefcase size={16} color="var(--brand-teal)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>CA Job Directory</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Audit, Tax & FP&A</div>
              </div>
            </Link>

            <Link
              href="/resumes"
              className="interactive-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              <FileText size={16} color="#0284C7" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Resume Studio</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Form 108 Verified</div>
              </div>
            </Link>

            <Link
              href="/growth"
              className="interactive-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              <TrendingUp size={16} color="#D97706" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Mentorship</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>1-on-1 Guidance</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
