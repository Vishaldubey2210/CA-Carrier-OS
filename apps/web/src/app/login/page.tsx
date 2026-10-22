'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleFillDemo = (type: 'candidate' | 'recruiter') => {
    if (type === 'candidate') {
      setEmail('candidate.a@ca-career.com');
      setPassword('StrongPassword123!');
    } else {
      setEmail('recruiter.grant@firm.com');
      setPassword('StrongPassword123!');
    }
    setError(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            CA
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '0.375rem',
            }}
          >
            Sign in to CA Career OS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Multi-Tenant Chartered Accountant Career Platform
          </p>
        </div>

        {/* Quick Demo Pre-fill Pills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Fast Local Demo Sign-in
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleFillDemo('candidate')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
            >
              Candidate Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('recruiter')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
            >
              Recruiter Demo
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ca.candidate@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <label
                htmlFor="password"
                style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account yet?{' '}
          <Link href="/register" style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>

        {/* Privacy Assurance */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>Tenant-isolated & Zero-PII Protected</span>
        </div>
      </div>
    </div>
  );
}
