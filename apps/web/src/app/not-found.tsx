'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileQuestion,
  Home,
  LayoutDashboard,
  Briefcase,
  Compass,
  HelpCircle,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '620px',
          width: '100%',
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Icon Illustration */}
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '20px',
            background: 'rgba(30, 58, 138, 0.08)',
            border: '1px solid rgba(30, 58, 138, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
            marginBottom: '1.5rem',
          }}
        >
          <FileQuestion size={40} />
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '0.75rem' }}>
          <span
            className="badge badge-indigo"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', letterSpacing: '0.05em' }}
          >
            HTTP 404 &bull; ROUTE NOT FOUND
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem',
          }}
        >
          This Page Does Not Exist
        </h1>

        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: '0 auto 2rem auto',
          }}
        >
          The URL you requested is not part of the CA Career OS sovereign workspace architecture, or may have been relocated.
        </p>

        {/* Primary Action Controls */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2.5rem',
          }}
        >
          <Link
            href="/"
            className="btn btn-primary"
            style={{ padding: '0.625rem 1.25rem' }}
          >
            <Home size={16} />
            <span>Return to Homepage</span>
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn btn-secondary"
              style={{ padding: '0.625rem 1.25rem' }}
            >
              <LayoutDashboard size={16} />
              <span>Go to Command Center</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ padding: '0.625rem 1.25rem' }}
            >
              <span>Sign In to Account</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Quick Directory Links */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.75rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          >
            Explore Sovereign Portals
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <Link
              href="/jobs"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Briefcase size={14} color="#60a5fa" />
              <span>Jobs Discovery</span>
            </Link>

            <Link
              href="/career"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Compass size={14} color="#34d399" />
              <span>Career Roadmap</span>
            </Link>

            <Link
              href="/help"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                transition: 'all 0.15s ease',
              }}
            >
              <HelpCircle size={14} color="#fbbf24" />
              <span>Knowledge Base</span>
            </Link>

            <Link
              href="/contact"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Mail size={14} color="#f472b6" />
              <span>Support Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
