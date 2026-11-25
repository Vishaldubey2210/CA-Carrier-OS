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
  Eye,
  EyeOff,
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
  const [showPassword, setShowPassword] = useState(false);
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

  // Resend cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first digit box when transitioning to OTP
  useEffect(() => {
    if (step === 'OTP') {
      digitRefs[0]?.current?.focus();
    }
  }, [step]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError('Password must contain at least 12 characters to meet regulatory security standards.');
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
      setError(res.error || 'Registration failed. Please check your details and try again.');
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
      setError('Please enter all 6 digits of the verification code sent to your email.');
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
      setError(res.error || 'Invalid or expired verification code. Please check and try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !challengeId) return;
    setError(null);
    setResendSuccess(null);

    const res = await resendOtp(challengeId);
    if (res.success) {
      setResendCooldown(60);
      setResendSuccess(res.message || 'A fresh verification code has been dispatched to your email.');
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
      setError(res.error || 'Failed to resend code. Please wait a moment and try again.');
    }
  };

  const handleBackToForm = () => {
    setStep('FORM');
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
        padding: '2rem 1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '2.25rem 2rem',
          position: 'relative',
          background: 'var(--surface-primary, #ffffff)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'var(--brand-primary, #0284c7)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.125rem',
              marginBottom: '0.75rem',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
            }}
          >
            CA
          </div>
          <h1
            style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
              letterSpacing: '-0.02em',
              marginBottom: '0.25rem',
            }}
          >
            {step === 'FORM' ? 'Create your account' : 'Check your email'}
          </h1>
          <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
            {step === 'FORM'
              ? 'Sovereign career platform for Chartered Accountants'
              : `We sent a 6-digit verification code to ${maskedEmail}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.75rem 0.875rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#dc2626',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Resend Success Alert */}
        {resendSuccess && (
          <div
            style={{
              padding: '0.75rem 0.875rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#059669',
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

        {/* STEP 1: REGISTRATION DETAILS FORM */}
        {step === 'FORM' && (
          <>
            {/* Role Selector Segmented Control */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.25rem',
                padding: '0.25rem',
                borderRadius: '8px',
                background: 'var(--surface-secondary, #f1f5f9)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                marginBottom: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setRole(UserRole.CANDIDATE)}
                style={{
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  transition: 'all 0.15s ease',
                  background: role === UserRole.CANDIDATE ? 'var(--brand-primary, #0284c7)' : 'transparent',
                  color: role === UserRole.CANDIDATE ? '#ffffff' : 'var(--text-secondary, #64748b)',
                }}
              >
                CA Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.RECRUITER)}
                style={{
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  transition: 'all 0.15s ease',
                  background: role === UserRole.RECRUITER ? 'var(--brand-primary, #0284c7)' : 'transparent',
                  color: role === UserRole.RECRUITER ? '#ffffff' : 'var(--text-secondary, #64748b)',
                }}
              >
                Employer / Firm
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '0.375rem' }}>
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rohan"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      background: 'var(--surface-secondary, #f8fafc)',
                      border: '1px solid var(--border-subtle, #cbd5e1)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '0.375rem' }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      background: 'var(--surface-secondary, #f8fafc)',
                      border: '1px solid var(--border-subtle, #cbd5e1)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '0.375rem' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      borderRadius: '6px',
                      background: 'var(--surface-secondary, #f8fafc)',
                      border: '1px solid var(--border-subtle, #cbd5e1)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <Mail
                    size={15}
                    color="var(--text-muted, #94a3b8)"
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {role === UserRole.RECRUITER && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '0.375rem' }}>
                    Firm or company name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Grant Thornton Bharat"
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                        borderRadius: '6px',
                        background: 'var(--surface-secondary, #f8fafc)',
                        border: '1px solid var(--border-subtle, #cbd5e1)',
                        color: 'var(--text-primary, #0f172a)',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                    <Building
                      size={15}
                      color="var(--text-muted, #94a3b8)"
                      style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary, #475569)', marginBottom: '0.375rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 12 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 2.5rem 0.55rem 2.25rem',
                      borderRadius: '6px',
                      background: 'var(--surface-secondary, #f8fafc)',
                      border: password.length > 0 && password.length < 12 ? '1px solid #f87171' : '1px solid var(--border-subtle, #cbd5e1)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  <Lock
                    size={15}
                    color="var(--text-muted, #94a3b8)"
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
                      color: 'var(--text-muted, #94a3b8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', fontSize: '0.75rem', color: password.length >= 12 ? '#059669' : 'var(--text-muted, #94a3b8)' }}>
                  <CheckCircle2 size={13} />
                  <span>{password.length >= 12 ? '12+ character security requirement met' : `${Math.max(0, 12 - password.length)} more characters required`}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  marginTop: '0.5rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: 'var(--brand-primary, #0284c7)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending verification code...</span>
                  </>
                ) : (
                  <>
                    <span>Create account &amp; verify email</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary, #64748b)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--brand-primary, #0284c7)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>
          </>
        )}

        {/* STEP 2: SLEEK 3+3 COMPACT OTP VERIFICATION */}
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
                Enter 6-digit code
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

            {/* Resend Action & Cooldown */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8125rem',
                color: 'var(--text-muted, #64748b)',
                padding: '0 0.25rem',
              }}
            >
              <span>Didn&apos;t receive it?</span>
              {resendCooldown > 0 ? (
                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem' }}>
                  Resend available in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary, #0284c7)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Resend code</span>
                </button>
              )}
            </div>

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={isVerifying || otpDigits.join('').length !== 6}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                background: 'var(--brand-primary, #0284c7)',
                color: '#ffffff',
                border: 'none',
                cursor: isVerifying || otpDigits.join('').length !== 6 ? 'not-allowed' : 'pointer',
                opacity: isVerifying || otpDigits.join('').length !== 6 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.15s ease',
              }}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Activating account...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Verify email &amp; enter workspace</span>
                </>
              )}
            </button>

            {/* Back to Edit Details */}
            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={handleBackToForm}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #64748b)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.5rem',
                }}
              >
                <ArrowLeft size={13} />
                <span>Use a different email</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
