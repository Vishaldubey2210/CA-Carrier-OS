'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  Key,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Clock,
  RotateCcw,
  Sparkles,
  Info,
  Building,
  Filter,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Play,
  Pause,
  StopCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  SmtpConfigRecord,
  MassMailingRecipient,
  MassMailingCampaignResult,
  MassMailingLogEntry,
} from '@ca-career-os/shared';

const DEFAULT_SUBJECT_TEMPLATE =
  'Application for Articleship | {candidate_name} | {inter_status} | ICAI Reg: {cro_number} | {city}';

const DEFAULT_BODY_TEMPLATE = `Respected HR & Recruitment Team at {firm_name},

I am writing to express my keen interest in pursuing my 2-year ICAI Articleship practical training with {firm_name} at your {city} office, specifically in Statutory Audit, Taxation, or Advisory services.

My Brief Profile & Eligibility Summary:
• Candidate Name: {candidate_name}
• ICAI Registration Number: {cro_number}
• CA Intermediate: {inter_status}
• Mandatory ICITSS: Completed ITT & Orientation Course (Eligible under Form 102/103)
• Current City: {candidate_city}
• Contact Details: {phone}

I am deeply impressed by {firm_name}'s distinguished corporate clientele, rigorous audit standards, and professional learning culture. I am eager to contribute with high dedication, strong analytical capabilities, and thorough compliance mindset.

I have attached my updated Curriculum Vitae (CV) and CA Intermediate marksheet for your review.

Thank you for your valuable time and consideration.

Sincerely,
{candidate_name}
ICAI Student Registration: {cro_number}
Mobile: {phone}
{linkedin_url}`;

export function MassMailerSection() {
  // 1. SMTP State
  const [smtpEmail, setSmtpEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [senderName, setSenderName] = useState('Rahul Sharma');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [showAdvancedSmtp, setShowAdvancedSmtp] = useState(false);

  const [savedConfig, setSavedConfig] = useState<SmtpConfigRecord | null>(null);
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2. Candidate Info State
  const [candidateName, setCandidateName] = useState('Rahul Sharma');
  const [icaiRegNo, setIcaiRegNo] = useState('WRO0786542');
  const [interStatus, setInterStatus] = useState('Both Groups Cleared (1st Attempt)');
  const [candidateCity, setCandidateCity] = useState('Mumbai');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/ca-rahul-sharma');

  // 3. Email Template State
  const [subjectTemplate, setSubjectTemplate] = useState(DEFAULT_SUBJECT_TEMPLATE);
  const [bodyTemplate, setBodyTemplate] = useState(DEFAULT_BODY_TEMPLATE);
  const [activePreviewTab, setActivePreviewTab] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [throttleDelaySec, setThrottleDelaySec] = useState<number>(1.5);

  // 4. Target Selection State
  const [targetFirms, setTargetFirms] = useState<MassMailingRecipient[]>([]);
  const [totalAvailableFirms, setTotalAvailableFirms] = useState(0);
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTarget, setSearchTarget] = useState('');
  const [selectedBatchLimit, setSelectedBatchLimit] = useState<number>(20);
  const [isLoadingFirms, setIsLoadingFirms] = useState(false);
  const [showFirmsDrawer, setShowFirmsDrawer] = useState(false);

  // 5. Campaign Execution & Live Logs State
  const [isSending, setIsSending] = useState(false);
  const [campaignResult, setCampaignResult] = useState<MassMailingCampaignResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<MassMailingLogEntry[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // Fetch saved SMTP status & initial targets on mount
  useEffect(() => {
    fetchSmtpStatus();
    fetchTargets();
  }, []);

  // Refetch targets when filters change
  useEffect(() => {
    fetchTargets();
  }, [filterRegion, filterCity, filterCategory, searchTarget, selectedBatchLimit]);

  const fetchSmtpStatus = async () => {
    try {
      const res = await apiClient.get<any>('/api/v1/mass-mailing/smtp-status');
      if (res.data && res.data.isVerified) {
        setSavedConfig(res.data);
        setSmtpEmail(res.data.email);
        setSenderName(res.data.senderName);
      }
    } catch {
      // Ignored if not saved yet
    }
  };

  const fetchTargets = async () => {
    setIsLoadingFirms(true);
    try {
      const query = new URLSearchParams({
        region: filterRegion,
        city: filterCity,
        category: filterCategory,
        search: searchTarget,
        limit: selectedBatchLimit.toString(),
      });
      const res = await apiClient.get<{ total: number; firms: MassMailingRecipient[] }>(
        `/api/v1/mass-mailing/targets?${query.toString()}`
      );
      if (res.data) {
        setTargetFirms(res.data.firms || []);
        setTotalAvailableFirms(res.data.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingFirms(false);
    }
  };

  // Handle Verify & Save SMTP
  const handleVerifyAndSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(smtpEmail)) {
      setSmtpMessage({ type: 'error', text: 'Please enter a valid sender email address.' });
      return;
    }

    const cleanPass = appPassword.replace(/\s+/g, '');
    if (!cleanPass || cleanPass.length < 8) {
      setSmtpMessage({
        type: 'error',
        text: 'Google App Password must be entered (16 letters, e.g. "abcd efgh ijkl mnop").',
      });
      return;
    }

    setIsVerifyingSmtp(true);
    try {
      const payload = {
        email: smtpEmail.trim().toLowerCase(),
        appPassword: cleanPass,
        senderName: senderName.trim(),
        host: smtpHost.trim(),
        port: Number(smtpPort),
        secure: smtpPort === 465,
      };

      const res = await apiClient.post<SmtpConfigRecord>('/api/v1/mass-mailing/save-smtp', payload);
      if (res.data) {
        setSavedConfig(res.data);
        setSmtpMessage({
          type: 'success',
          text: `SMTP Verified & Saved! Connected as ${res.data.maskedEmail} (${res.data.host}:${res.data.port}).`,
        });
      }
      setAppPassword(''); // Clear raw password input for security
    } catch (err: any) {
      setSmtpMessage({
        type: 'error',
        text: err?.message || 'SMTP Authentication failed. Check your App Password and try again.',
      });
    } finally {
      setIsVerifyingSmtp(false);
    }
  };

  // Generate Personalized Preview for first recipient
  const previewData = useMemo(() => {
    const firstFirm = targetFirms[0] || {
      firmName: 'BSR & Co. LLP (KPMG Network)',
      email: 'articleship@bsraffiliates.com',
      primaryCity: 'Mumbai',
    };

    const renderedSubject = subjectTemplate
      .replace(/{firm_name}/g, firstFirm.firmName)
      .replace(/{candidate_name}/g, candidateName)
      .replace(/{cro_number}/g, icaiRegNo)
      .replace(/{inter_status}/g, interStatus)
      .replace(/{city}/g, firstFirm.primaryCity || candidateCity);

    const renderedBody = bodyTemplate
      .replace(/{firm_name}/g, firstFirm.firmName)
      .replace(/{candidate_name}/g, candidateName)
      .replace(/{cro_number}/g, icaiRegNo)
      .replace(/{inter_status}/g, interStatus)
      .replace(/{city}/g, firstFirm.primaryCity || candidateCity)
      .replace(/{candidate_city}/g, candidateCity)
      .replace(/{phone}/g, phone)
      .replace(/{linkedin_url}/g, linkedinUrl);

    return { firm: firstFirm, subject: renderedSubject, body: renderedBody };
  }, [targetFirms, subjectTemplate, bodyTemplate, candidateName, icaiRegNo, interStatus, candidateCity, phone, linkedinUrl]);

  // Handle Start Campaign
  const handleStartCampaign = async () => {
    if (!savedConfig && !appPassword) {
      setSmtpMessage({
        type: 'error',
        text: 'Please connect and verify your Gmail App Password before launching outreach.',
      });
      return;
    }

    if (targetFirms.length === 0) {
      alert('No CA firms selected. Please choose at least 1 firm recipient.');
      return;
    }

    const confirmStart = window.confirm(
      `Ready to dispatch personalized articleship applications to ${targetFirms.length} verified CA firms?\n\nPacing delay: ${throttleDelaySec}s between emails to protect your Gmail reputation.`
    );
    if (!confirmStart) return;

    setIsSending(true);
    setLiveLogs([]);
    setSentCount(0);
    setFailedCount(0);
    setCampaignResult(null);

    // Initial local log entry
    setLiveLogs([
      {
        id: 'init-1',
        timestamp: new Date().toLocaleTimeString('en-IN'),
        level: 'INFO',
        recipientEmail: 'SYSTEM',
        firmName: 'Campaign Initializing',
        message: `Starting automated outreach to ${targetFirms.length} firms from ${savedConfig?.maskedEmail || smtpEmail}...`,
      },
    ]);

    try {
      const payload = {
        smtpConfig: appPassword
          ? {
              email: smtpEmail.trim().toLowerCase(),
              appPassword: appPassword.replace(/\s+/g, ''),
              senderName: senderName.trim(),
              host: smtpHost.trim(),
              port: Number(smtpPort),
            }
          : undefined,
        subject: subjectTemplate,
        bodyTemplate: bodyTemplate,
        recipients: targetFirms,
        candidateDetails: {
          candidateName,
          icaiRegNo,
          interStatus,
          city: candidateCity,
          phone,
          linkedinUrl,
        },
        throttleDelayMs: Math.round(throttleDelaySec * 1000),
      };

      const res = await apiClient.post<MassMailingCampaignResult>('/api/v1/mass-mailing/send', payload);
      if (res.data) {
        setCampaignResult(res.data);
        setLiveLogs(res.data.logs || []);
        setSentCount(res.data.totalSent || 0);
        setFailedCount(res.data.totalFailed || 0);
      }
    } catch (err: any) {
      setLiveLogs((prev) => [
        ...prev,
        {
          id: 'err-1',
          timestamp: new Date().toLocaleTimeString('en-IN'),
          level: 'ERROR',
          recipientEmail: 'SYSTEM',
          firmName: 'Execution Failure',
          message: err?.message || 'Campaign execution failed. Check your network or credentials.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Overview & Safety Banner */}
      <div
        style={{
          background: '#000000',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ background: '#FFFFFF', color: '#000000', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              DIRECT GMAIL INTEGRATION
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              1-Click CA Articleship Mass Mailing &amp; Outreach Engine
            </h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#D4D4D8', margin: 0, lineHeight: 1.5 }}>
            Deliver personalized articleship applications directly to HR &amp; Partner inboxes of 5,000 verified CA firms across India. Emails are sent from your genuine Gmail address with automated rate-limiting to guarantee inbox placement without getting spam-flagged.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {savedConfig ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#27272A', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #3F3F46' }}>
              <ShieldCheck size={16} style={{ color: '#4ADE80' }} />
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#A1A1AA' }}>SMTP Authenticated</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF' }}>{savedConfig.maskedEmail}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#27272A', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #3F3F46' }}>
              <AlertCircle size={16} style={{ color: '#FACC15' }} />
              <div style={{ fontSize: '0.75rem', color: '#E4E4E7' }}>Gmail SMTP not configured</div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Grid: Left = Setup & Campaign Config, Right = Live Terminal & Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Setup & Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* STEP 1: SMTP Connect Box */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: '#000000', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={16} /> 1. Connect Sender Gmail Account
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Partners reply directly to your inbox. Requires Google 16-character App Password.
                </p>
              </div>
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: '#000000', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 500 }}
              >
                Get App Password <ExternalLink size={11} />
              </a>
            </div>

            {/* Instruction Callout */}
            <div
              style={{
                background: '#FAFAFA',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.625rem 0.75rem',
                fontSize: '0.75rem',
                color: '#52525B',
                marginBottom: '1rem',
                lineHeight: 1.4,
              }}
            >
              <strong>2-Minute Setup:</strong> Go to Google Account → <em>Security</em> → <em>2-Step Verification</em> → Scroll down to <em>App passwords</em> → Generate 16 letters code (e.g. <code>abcd efgh ijkl mnop</code>) and paste below.
            </div>

            <form onSubmit={handleVerifyAndSaveSmtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Your Gmail Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname.ca2026@gmail.com"
                  value={smtpEmail}
                  onChange={(e) => setSmtpEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Google 16-Letter App Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!savedConfig}
                    placeholder={savedConfig ? '•••••••••••••••• (Saved in DB)' : 'e.g. abcd efgh ijkl mnop'}
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 2.25rem 0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8125rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Sender Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (CA Inter)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              {/* Advanced SMTP Details Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSmtp(!showAdvancedSmtp)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#71717A',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0,
                  }}
                >
                  {showAdvancedSmtp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showAdvancedSmtp ? 'Hide Advanced SMTP Relay Options' : 'Custom Host / Port (Zoho, Outlook, Custom Domain)'}
                </button>

                {showAdvancedSmtp && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SMTP Host</label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Port</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Alert */}
              {smtpMessage && (
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    background: smtpMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                    border: smtpMessage.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FECACA',
                    color: smtpMessage.type === 'success' ? '#166534' : '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {smtpMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{smtpMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingSmtp}
                className="btn btn-primary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.5rem 1rem',
                  marginTop: '0.25rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {isVerifyingSmtp ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" /> Verifying SMTP Handshake...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} /> Verify &amp; Save Credentials
                  </>
                )}
              </button>
            </form>
          </div>

          {/* STEP 2: Candidate Info & Placeholders */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#000000' }}>
              2. Candidate Profile (Auto-Populates Email Tags)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>ICAI Registration Number</label>
                <input
                  type="text"
                  value={icaiRegNo}
                  onChange={(e) => setIcaiRegNo(e.target.value)}
                  placeholder="e.g. WRO0786542"
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>CA Inter Clearance Status</label>
                <select
                  value={interStatus}
                  onChange={(e) => setInterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="Both Groups Cleared (1st Attempt)">Both Groups Cleared (1st Attempt)</option>
                  <option value="Both Groups Cleared">Both Groups Cleared</option>
                  <option value="Group 1 Cleared (Appearing G2)">Group 1 Cleared (Appearing G2)</option>
                  <option value="Direct Entry Route Graduate">Direct Entry Route Graduate</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>City</label>
                <input
                  type="text"
                  value={candidateCity}
                  onChange={(e) => setCandidateCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>LinkedIn / Resume Drive URL</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Target Firms Filter & Batch Selection */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: '#000000', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building size={16} /> 3. Select Target CA Firms ({targetFirms.length} Selected)
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Filtered from 5,000 verified CA firms database with official articleship desks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFirmsDrawer(!showFirmsDrawer)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                {showFirmsDrawer ? 'Hide Recipient List' : 'Preview Recipients List'}
              </button>
            </div>

            {/* Filter Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}
                >
                  <option value="ALL">All Regions (5,000)</option>
                  <option value="WIRC">WIRC (Mumbai, Pune, Guj)</option>
                  <option value="NIRC">NIRC (Delhi NCR, Chd, Jai)</option>
                  <option value="SIRC">SIRC (Blr, Chn, Hyd, Kochi)</option>
                  <option value="EIRC">EIRC (Kolkata, Bhb, Patna)</option>
                  <option value="CIRC">CIRC (Kanpur, Ind, Lko, Bhp)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>City</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}
                >
                  <option value="ALL">All Major Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Batch Size (Per Run)</label>
                <select
                  value={selectedBatchLimit}
                  onChange={(e) => setSelectedBatchLimit(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}
                >
                  <option value={5}>5 Firms (Quick Test)</option>
                  <option value={15}>15 Firms</option>
                  <option value={25}>25 Firms (Recommended)</option>
                  <option value={50}>50 Firms</option>
                  <option value={100}>100 Firms (Max Batch)</option>
                </select>
              </div>
            </div>

            {/* Recipients Drawer Preview */}
            {showFirmsDrawer && (
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem',
                  background: '#FAFAFA',
                  fontSize: '0.75rem',
                }}
              >
                {isLoadingFirms ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Loading firms...</div>
                ) : (
                  targetFirms.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.35rem 0.5rem',
                        borderBottom: i < targetFirms.length - 1 ? '1px solid #E4E4E7' : 'none',
                      }}
                    >
                      <div>
                        <strong>{f.firmName}</strong> <span style={{ color: '#71717A' }}>({f.primaryCity || f.region})</span>
                      </div>
                      <div style={{ fontFamily: 'monospace', color: '#27272A' }}>{f.email}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* STEP 4: Email Content & Personalization */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: '#000000' }}>
                4. Email Subject &amp; Cover Letter
              </h3>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('EDIT')}
                  className={`btn ${activePreviewTab === 'EDIT' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                >
                  Edit Template
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('PREVIEW')}
                  className={`btn ${activePreviewTab === 'PREVIEW' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                >
                  <Eye size={12} /> Live Preview
                </button>
              </div>
            </div>

            {activePreviewTab === 'EDIT' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject Line</label>
                  <input
                    type="text"
                    value={subjectTemplate}
                    onChange={(e) => setSubjectTemplate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8125rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Email Body (Supports <code>{'{firm_name}'}</code>, <code>{'{candidate_name}'}</code>, <code>{'{cro_number}'}</code>, <code>{'{city}'}</code>)
                  </label>
                  <textarea
                    rows={8}
                    value={bodyTemplate}
                    onChange={(e) => setBodyTemplate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.5,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#FAFAFA',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #E4E4E7' }}>
                  <div style={{ color: '#71717A', fontSize: '0.6875rem' }}>TO:</div>
                  <div style={{ fontWeight: 600 }}>{previewData.firm.firmName} &lt;{previewData.firm.email}&gt;</div>
                  <div style={{ color: '#71717A', fontSize: '0.6875rem', marginTop: '0.25rem' }}>SUBJECT:</div>
                  <div style={{ fontWeight: 600 }}>{previewData.subject}</div>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#18181B', fontSize: '0.75rem' }}>
                  {previewData.body}
                </div>
              </div>
            )}

            {/* Pacing Delay Slider */}
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#52525B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} /> Gmail Pacing Delay:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.5"
                  value={throttleDelaySec}
                  onChange={(e) => setThrottleDelaySec(Number(e.target.value))}
                  style={{ width: '100px' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '40px' }}>{throttleDelaySec}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Terminal & Real-Time Logs Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Trigger Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#000000' }}>
                  Dispatch Status &amp; Execution
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Ready to send to <strong>{targetFirms.length}</strong> selected CA firms.
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartCampaign}
                disabled={isSending || targetFirms.length === 0}
                className="btn btn-primary"
                style={{
                  fontSize: '0.875rem',
                  padding: '0.6rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                }}
              >
                {isSending ? (
                  <>
                    <RotateCcw size={16} className="animate-spin" /> Dispatching Emails...
                  </>
                ) : (
                  <>
                    <Send size={16} /> 🚀 Start Mass Mailing ({targetFirms.length} Firms)
                  </>
                )}
              </button>
            </div>

            {/* KPI Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Total Queued</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#000000' }}>{targetFirms.length}</div>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center', background: '#F0FDF4' }}>
                <div style={{ fontSize: '0.6875rem', color: '#166534' }}>Delivered</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>{sentCount}</div>
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center', background: failedCount > 0 ? '#FEF2F2' : '#FAFAFA' }}>
                <div style={{ fontSize: '0.6875rem', color: failedCount > 0 ? '#991B1B' : '#71717A' }}>Failed</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: failedCount > 0 ? '#991B1B' : '#71717A' }}>{failedCount}</div>
              </div>
            </div>
          </div>

          {/* Interactive Monospace Terminal Logs Monitor */}
          <div
            style={{
              background: '#09090B',
              border: '1px solid #27272A',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: '440px',
            }}
          >
            {/* Terminal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #27272A',
                paddingBottom: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#A1A1AA', fontFamily: 'monospace', fontWeight: 600 }}>
                  outreach-terminal://ca-articleship-dispatcher
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: isSending ? '#4ADE80' : '#71717A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontFamily: 'monospace',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSending ? '#4ADE80' : '#71717A' }} />
                  {isSending ? 'DISPATCHING LIVE' : 'IDLE'}
                </span>
                <button
                  type="button"
                  onClick={() => setLiveLogs([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#71717A',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                paddingRight: '0.5rem',
              }}
            >
              {liveLogs.length === 0 ? (
                <div style={{ color: '#52525B', margin: 'auto', textAlign: 'center', padding: '2rem 1rem' }}>
                  <Terminal size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                  <div>Terminal ready for automated outreach.</div>
                  <div style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                    Click &quot;Start Mass Mailing&quot; to begin dispatching to selected CA firms.
                  </div>
                </div>
              ) : (
                liveLogs.map((log) => {
                  let color = '#D4D4D8';
                  let icon = 'ℹ';
                  if (log.level === 'SUCCESS') {
                    color = '#4ADE80';
                    icon = '✓';
                  } else if (log.level === 'ERROR') {
                    color = '#F87171';
                    icon = '✕';
                  } else if (log.level === 'WARN') {
                    color = '#FBBF24';
                    icon = '⚠';
                  }

                  return (
                    <div key={log.id} style={{ display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                      <span style={{ color: '#71717A', flexShrink: 0 }}>[{log.timestamp}]</span>
                      <span style={{ color: color, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
                      <span style={{ color: color, wordBreak: 'break-word' }}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Terminal Footer Info */}
            <div
              style={{
                borderTop: '1px solid #27272A',
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.6875rem',
                color: '#71717A',
                fontFamily: 'monospace',
              }}
            >
              <span>Relay: {smtpHost}:587</span>
              <span>Throttle: {throttleDelaySec}s/msg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
