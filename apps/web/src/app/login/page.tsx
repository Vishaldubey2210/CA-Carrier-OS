'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  KeyRound,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOtp, resendOtp, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: OTP State
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [challengeId, setChallengeId] = useState<string>('');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const digitRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first digit box when switching to OTP
  useEffect(() => {
    if (step === 'OTP') {
      digitRefs[0]?.current?.focus();
    }
  }, [step]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    const res = await login(email, password || undefined);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify your details.');
      return;
    }

    if (res.requiresOtp && res.challengeId) {
      setChallengeId(res.challengeId);
      setMaskedEmail(res.maskedEmail || email);
      setResendCooldown(res.resendCooldownSeconds || 60);
      setDeliveryNote(res.deliveryNote || null);
      if (res.previewCode) {
        setPreviewCode(res.previewCode);
        setOtpDigits(res.previewCode.split('').slice(0, 6));
      } else {
        setPreviewCode(null);
      }
      setStep('OTP');
      setError(null);
    } else {
      router.push('/dashboard');
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // Handle paste into a box
      const pastedChars = cleaned.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedChars[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(5, pastedChars.length);
      digitRefs[nextIndex]?.current?.focus();
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto-advance
    if (cleaned && index < 5) {
      digitRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1]?.current?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setResendSuccess(null);

    const res = await verifyOtp(challengeId, code);
    setIsVerifying(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Verification code failed. Please check the code and try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !challengeId) return;
    setError(null);
    setResendSuccess(null);

    const res = await resendOtp(challengeId);
    if (res.success) {
      setResendCooldown(60);
      setResendSuccess(res.message || 'A fresh verification code has been dispatched.');
      setDeliveryNote(res.deliveryNote || null);
      if (res.previewCode) {
        setPreviewCode(res.previewCode);
        setOtpDigits(res.previewCode.split('').slice(0, 6));
      } else {
        setPreviewCode(null);
        setOtpDigits(['', '', '', '', '', '']);
      }
      digitRefs[0]?.current?.focus();
    } else {
      setError(res.error || 'Failed to resend code. Please try again later.');
    }
  };

  const handleBackToLogin = () => {
    setStep('CREDENTIALS');
    setError(null);
    setResendSuccess(null);
    setDeliveryNote(null);
    setPreviewCode(null);
    setOtpDigits(['', '', '', '', '', '']);
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
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--brand-primary)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            CA
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '0.375rem',
            }}
          >
            {step === 'CREDENTIALS' ? 'Sign in to CA Career OS' : 'Verify Your Identity'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {step === 'CREDENTIALS'
              ? 'Multi-Tenant Chartered Accountant Career Platform'
              : `Security code dispatched to ${maskedEmail}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Resend Success Alert */}
        {resendSuccess && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{resendSuccess}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS FORM */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.375rem',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                <Mail
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Password <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional for Email OTP)</span>
                </label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 2.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                <Lock
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
                  <span>Dispatching OTP via SMTP...</span>
                </>
              ) : (
                <>
                  <span>Continue with Email OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION FORM */}
        {step === 'OTP' && (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {deliveryNote && (
              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#b45309',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  lineHeight: 1.4,
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{deliveryNote}</span>
              </div>
            )}

            {previewCode && (
              <div
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  color: 'var(--brand-primary, #0284c7)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                  <span>
                    Auto-filled Code: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{previewCode}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpDigits(previewCode.split('').slice(0, 6))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary, #0284c7)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem',
                    textDecoration: 'underline',
                  }}
                >
                  Fill
                </button>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #475569)',
                  marginBottom: '0.75rem',
                }}
              >
                Enter 6-digit verification code
              </label>

              {/* Compact, beautifully proportioned 3+3 OTP Input boxes */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '0.5rem 0',
                }}
              >
                {/* First 3 digits */}
                {otpDigits.slice(0, 3).map((digit, i) => {
                  const idx = i;
                  return (
                    <input
                      key={idx}
                      ref={digitRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      aria-label={`Digit ${idx + 1}`}
                      style={{
                        width: '44px',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontVariantNumeric: 'tabular-nums',
                        borderRadius: '8px',
                        background: 'var(--surface-secondary, #f8fafc)',
                        border: digit ? '1.5px solid var(--brand-primary, #0284c7)' : '1px solid var(--border-subtle, #cbd5e1)',
                        color: 'var(--text-primary, #0f172a)',
                        outline: 'none',
                        boxShadow: digit ? '0 1px 2px rgba(2, 132, 199, 0.08)' : 'none',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      }}
                    />
                  );
                })}

                {/* Subtle center dash separator */}
                <div
                  style={{
                    width: '8px',
                    height: '2px',
                    background: 'var(--border-subtle, #cbd5e1)',
                    borderRadius: '1px',
                    margin: '0 0.125rem',
                    flexShrink: 0,
                  }}
                />

                {/* Second 3 digits */}
                {otpDigits.slice(3, 6).map((digit, i) => {
                  const idx = i + 3;
                  return (
                    <input
                      key={idx}
                      ref={digitRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      aria-label={`Digit ${idx + 1}`}
                      style={{
                        width: '44px',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontVariantNumeric: 'tabular-nums',
                        borderRadius: '8px',
                        background: 'var(--surface-secondary, #f8fafc)',
                        border: digit ? '1.5px solid var(--brand-primary, #0284c7)' : '1px solid var(--border-subtle, #cbd5e1)',
                        color: 'var(--text-primary, #0f172a)',
                        outline: 'none',
                        boxShadow: digit ? '0 1px 2px rgba(2, 132, 199, 0.08)' : 'none',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      }}
                    />
                  );
                })}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.5rem', marginBottom: 0 }}>
                Verification code expires in 5 minutes
              </p>
            </div>

            {/* Resend Action & Timer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>Didn&apos;t receive code?</span>
              {resendCooldown > 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Resend available in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            {/* Submit Verification */}
            <button
              type="submit"
              disabled={isVerifying || otpDigits.join('').length !== 6}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                opacity: isVerifying || otpDigits.join('').length !== 6 ? 0.6 : 1,
              }}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Verify &amp; Sign In</span>
                </>
              )}
            </button>

            {/* Back to Email/Password */}
            <button
              type="button"
              onClick={handleBackToLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                marginTop: '0.25rem',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account yet?{' '}
          <Link href="/register" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
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
          <ShieldCheck size={14} color="#10b981" />
          <span>Tenant-isolated &bull; Zero-PII Protected</span>
        </div>
      </div>
    </div>
  );
}
