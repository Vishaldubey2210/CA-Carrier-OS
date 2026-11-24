'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@ca-career-os/shared';
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, verifyOtp, resendOtp, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Step 1: Registration Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Step 2: OTP State
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError('Password must be at least 12 characters long for enterprise security.');
      return;
    }

    const res = await register({
      email,
      password,
      firstName,
      lastName,
      role,
      organizationName: role === UserRole.RECRUITER ? organizationName : undefined,
    });

    if (!res.success) {
      setError(res.error || 'Registration failed. Please check your details.');
      return;
    }

    if (res.requiresOtp && res.challengeId) {
      setChallengeId(res.challengeId);
      setMaskedEmail(res.maskedEmail || email);
      setResendCooldown(res.resendCooldownSeconds || 60);
      setDeliveryNote(res.deliveryNote || null);
      setPreviewCode(res.previewCode || null);
      setStep('OTP');
      setError(null);
    } else {
      router.push('/dashboard');
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
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
      if (res.deliveryNote) setDeliveryNote(res.deliveryNote);
      if (res.previewCode) setPreviewCode(res.previewCode);
      setOtpDigits(['', '', '', '', '', '']);
      digitRefs[0]?.current?.focus();
    } else {
      setError(res.error || 'Failed to resend verification code. Please try again.');
    }
  };

  const handleBackToForm = () => {
    setStep('FORM');
    setError(null);
    setResendSuccess(null);
    setOtpDigits(['', '', '', '', '', '']);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--brand-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              marginBottom: '0.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            CA
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            {step === 'FORM' ? 'Create Your Account' : 'Verify Your Email'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {step === 'FORM'
              ? 'Join the Chartered Accountancy Operating System'
              : `Security code dispatched to ${maskedEmail}`}
          </p>
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
              background: 'rgba(16, 185, 129, 0.12)',
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

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'FORM' && (
          <>
            {/* Role Selector Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                padding: '0.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setRole(UserRole.CANDIDATE)}
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  transition: 'all 0.2s ease',
                  background: role === UserRole.CANDIDATE ? 'var(--brand-primary)' : 'transparent',
                  color: role === UserRole.CANDIDATE ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                CA Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.RECRUITER)}
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  transition: 'all 0.2s ease',
                  background: role === UserRole.RECRUITER ? 'var(--brand-primary)' : 'transparent',
                  color: role === UserRole.RECRUITER ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                Employer / Recruiter
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Rohan"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rohan.sharma@example.com"
                    required
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

              {role === UserRole.RECRUITER && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    Organization / Firm Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="KPMG Global Services"
                      required
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
                    <Building
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                  Password (minimum 12 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-secondary)',
                      border: password.length > 0 && password.length < 12 ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
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
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', fontSize: '0.75rem', color: password.length >= 12 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={12} />
                  <span>{password.length >= 12 ? 'Security criteria met (12+ characters)' : `${Math.max(0, 12 - password.length)} more characters needed`}</span>
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
                    <span>Create Account &amp; Get Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>
          </>
        )}

        {/* STEP 2: OTP VERIFICATION FORM */}
        {step === 'OTP' && (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Sandbox / SMTP Notice pill if present */}
            {previewCode && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                  <span>
                    Verification Code: <strong>{previewCode}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const chars = previewCode.slice(0, 6).split('');
                    setOtpDigits(chars);
                    digitRefs[5]?.current?.focus();
                  }}
                  style={{
                    background: 'var(--brand-primary)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    cursor: 'pointer',
                  }}
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.625rem',
                }}
              >
                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Enter 6-Digit Verification Code
                </label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Expires in 5 mins
                </span>
              </div>

              {/* 6 Digit Inputs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '0.5rem',
                }}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={digitRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    aria-label={`Digit ${idx + 1}`}
                    style={{
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                ))}
              </div>
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
                  <span>Verifying &amp; Saving Account...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Verify &amp; Launch Workspace</span>
                </>
              )}
            </button>

            {/* Back to Edit Details */}
            <button
              type="button"
              onClick={handleBackToForm}
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
              <span>Change email or details</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
