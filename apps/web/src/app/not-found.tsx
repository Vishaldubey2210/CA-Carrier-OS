'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  ArrowRight,
  CreditCard,
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
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              background: '#F4F4F5',
              color: '#000000',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            404 &bull; PAGE NOT FOUND
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#000000',
            letterSpacing: '-0.01em',
            marginBottom: '0.5rem',
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: '0.875rem',
            color: '#52525B',
            lineHeight: 1.6,
            maxWidth: '380px',
            margin: '0 auto 1.5rem auto',
          }}
        >
          The page you are looking for does not exist or has been moved. Explore our core sections:
        </p>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '1.75rem',
          }}
        >
          <Link
            href="/"
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            <Home size={14} />
            <span>Back to Home</span>
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              <LayoutDashboard size={14} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              <span>Sign In</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {/* Directory Grid */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '1.25rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#71717A',
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
              gap: '0.5rem',
            }}
          >
            <Link
              href="/articleship"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                background: '#FAFAFA',
                border: '1px solid #E5E7EB',
                color: '#000000',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <GraduationCap size={16} color="#000000" />
              <div>
                <div>Articleship Hub</div>
                <div style={{ fontSize: '0.6875rem', color: '#71717A', fontWeight: 400 }}>Form 102/103/104</div>
              </div>
            </Link>

            <Link
              href="/jobs"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                background: '#FAFAFA',
                border: '1px solid #E5E7EB',
                color: '#000000',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <Briefcase size={16} color="#000000" />
              <div>
                <div>CA Jobs</div>
                <div style={{ fontSize: '0.6875rem', color: '#71717A', fontWeight: 400 }}>Audit, Tax &amp; Finance</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
