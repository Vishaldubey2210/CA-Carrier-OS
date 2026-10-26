'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Mail,
  Home,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { verifyEmail, isAuthenticated } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'ERROR'>('VERIFYING');
  const [message, setMessage] = useState<string>('Verifying your email address credentials...');

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setMessage('No verification token provided in URL. Please check your verification email link.');
      return;
    }

    let isMounted = true;
    async function executeVerification() {
      const res = await verifyEmail(token!);
      if (!isMounted) return;

      if (res.success) {
        setStatus('SUCCESS');
        setMessage(res.message || 'Your email address has been verified successfully!');
      } else {
        setStatus('ERROR');
        setMessage(res.error || 'Verification link is invalid, expired, or has already been used.');
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

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
          maxWidth: '480px',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {status === 'VERIFYING' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(30, 58, 138, 0.08)',
                border: '1px solid rgba(30, 58, 138, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
                marginBottom: '1.5rem',
              }}
            >
              <Loader2 size={32} className="animate-spin" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Verifying Email
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {message}
            </p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Email Verified!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {message} Your sovereign workspace is fully active.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
                  <span>Go to Command Center</span>
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
                  <span>Sign In to Account</span>
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        )}

        {status === 'ERROR' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)',
                marginBottom: '1.5rem',
              }}
            >
              <XCircle size={36} />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Verification Failed
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {message}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                <span>Back to Sign In</span>
              </Link>
              <Link href="/" className="btn btn-secondary" style={{ padding: '0.625rem 1.25rem' }}>
                <Home size={15} />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: '2rem',
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
          <ShieldCheck size={14} color="#10b981" />
          <span>ICAI Compliant Sovereign Account Verification</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={24} className="animate-spin" color="#3b82f6" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
