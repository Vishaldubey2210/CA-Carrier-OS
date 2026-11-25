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
  HelpCircle,
  Zap,
  BookOpen,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  SmtpConfigRecord,
  MassMailingRecipient,
  MassMailingCampaignResult,
  MassMailingLogEntry,
} from '@ca-career-os/shared';

export const GENERIC_TEMPLATES = {
  TECH_ENGINEERING: {
    name: '1. Tech & Software Engineering Application',
    subject: 'Application for Software Engineering Role | {candidate_name} | {city}',
    body: `Dear Engineering Hiring Team at {firm_name},

I am writing to express my strong interest in Software Engineering / Developer opportunities with {firm_name} in {city}.

My Professional Background & Technical Stack:
• Candidate Name: {candidate_name}
• Primary Stack: React, Next.js, Node.js, TypeScript, PostgreSQL, Distributed Systems
• Location: {candidate_city}
• Contact: {phone}
• GitHub / Portfolio: {linkedin_url}

I have hands-on experience designing robust backend services, scalable RESTful & GraphQL APIs, and responsive, accessible web applications. I admire {firm_name}'s high-growth engineering standards and would love to contribute to your core product roadmap.

My updated resume is attached for your review. Thank you for your time and consideration.

Best regards,
{candidate_name}
Mobile: {phone}
{linkedin_url}`,
  },
  FINANCE_CONSULTING: {
    name: '2. Finance Analyst & Strategy Consultant Application',
    subject: 'Application for Finance / Strategy Associate | {candidate_name} | {city}',
    body: `Dear Hiring Team at {firm_name},

I am writing to formally submit my candidacy for Corporate Finance, Investment Banking, FP&A, or Strategy Consulting roles at {firm_name} in {city}.

Profile Overview:
• Candidate Name: {candidate_name}
• Domain: Corporate FP&A, Financial Modeling (DCF/LBO), Due Diligence, Strategy
• Qualification: {inter_status}
• Base City: {candidate_city}
• Phone: {phone}

With a strong analytical grounding in financial statement analysis, operational modeling, and business problem solving, I am eager to drive measurable business outcomes at {firm_name}.

My CV and key project highlights are attached for your consideration.

Warm regards,
{candidate_name}
Mobile: {phone}
{linkedin_url}`,
  },
  LEGAL_COMPLIANCE: {
    name: '3. Legal Associate & Corporate Compliance Application',
    subject: 'Application for Legal & Compliance Associate | {candidate_name} | {city}',
    body: `Respected Legal Recruitment Team at {firm_name},

I am writing to submit my application for Legal Associate and Corporate Compliance positions at {firm_name} in {city}.

Summary of Credentials:
• Name: {candidate_name}
• Key Focus: Corporate M&A, Contract Negotiation, Regulatory Compliance, Risk Advisory
• Location: {candidate_city}
• Contact: {phone}

I bring rigorous attention to contractual precision, statutory adherence, and corporate risk mitigation. I am keen to support {firm_name}'s legal advisory mandates.

My complete Curriculum Vitae is enclosed. Thank you for your review.

Sincerely,
{candidate_name}
Phone: {phone}
{linkedin_url}`,
  },
  ARTICLESHIP: {
    name: '4. CA Articleship (Form 102/103 2-Year Scheme)',
    subject: 'Application for Articleship | {candidate_name} | {inter_status} | ICAI Reg: {cro_number} | {city}',
    body: `Respected HR & Recruitment Team at {firm_name},

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
{linkedin_url}`,
  },
  INDUSTRIAL_TRAINING: {
    name: '5. CA Industrial Training (Form 104 - MNCs & Corporates)',
    subject: 'Application for CA Industrial Training (Form 104) | {candidate_name} | ICAI: {cro_number} | {city}',
    body: `Respected Campus & Finance Hiring Team at {firm_name},

I am writing to formally apply for the CA Industrial Trainee position under Form 104 at {firm_name} in your {city} team, within Corporate FP&A, Financial Reporting, Internal Audit, or Treasury.

Profile Highlights:
• Candidate: {candidate_name}
• ICAI Student Reg No: {cro_number}
• Eligibility: Completed mandatory initial articleship tenure; eligible for Form 104 Industrial Training
• Practical Exposure: Financial modeling, Ind AS compliance, and management reporting
• Current Location: {candidate_city}
• Phone: {phone}

I am eager to apply my strong accounting fundamentals and analytical skills to high-impact corporate finance initiatives at {firm_name}.

My CV and execution highlights are enclosed for your kind review.

Warm regards,
{candidate_name}
Mobile: {phone}
{linkedin_url}`,
  },
  QUALIFIED_JOB: {
    name: '6. Qualified & Semi-Qualified CA Job Application',
    subject: 'Application for Chartered Accountant Role | {candidate_name} | CA Qualified | {city}',
    body: `Dear Hiring Team at {firm_name},

I am submitting my profile for consideration for Chartered Accountant positions (Statutory Audit, Direct / Indirect Tax, Financial Due Diligence, or FP&A) at {firm_name} in {city}.

Professional Overview:
• Name: {candidate_name}
• ICAI Membership / Registration: {cro_number}
• Qualification: {inter_status}
• Core Expertise: Ind AS / IFRS, CARO 2020, Tax Audit Form 3CD, Financial Analysis
• Base Location: {candidate_city}
• Direct Phone: {phone}

I welcome the opportunity to discuss how my audit acumen and financial analysis experience can create value for {firm_name}.

My comprehensive CV is attached. Looking forward to your response.

Sincerely,
{candidate_name}
Mobile: {phone}
{linkedin_url}`,
  },
};

export function MassMailerSection() {
  // 1. SMTP State
  const [smtpEmail, setSmtpEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [senderName, setSenderName] = useState('Rahul Sharma');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [showAdvancedSmtp, setShowAdvancedSmtp] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

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
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<'ARTICLESHIP' | 'INDUSTRIAL_TRAINING' | 'QUALIFIED_JOB'>('ARTICLESHIP');
  const [subjectTemplate, setSubjectTemplate] = useState(GENERIC_TEMPLATES.ARTICLESHIP.subject);
  const [bodyTemplate, setBodyTemplate] = useState(GENERIC_TEMPLATES.ARTICLESHIP.body);
  const [activePreviewTab, setActivePreviewTab] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [throttleDelaySec, setThrottleDelaySec] = useState<number>(1.5);

  // 4. Target Selection State
  const [targetFirms, setTargetFirms] = useState<MassMailingRecipient[]>([]);
  const [totalAvailableFirms, setTotalAvailableFirms] = useState(0);
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTarget, setSearchTarget] = useState('');
  const [selectedBatchLimit, setSelectedBatchLimit] = useState<number>(50);
  const [isLoadingFirms, setIsLoadingFirms] = useState(false);
  const [showFirmsDrawer, setShowFirmsDrawer] = useState(false);

  // 5. Campaign Execution & Live Logs State
  const [isSending, setIsSending] = useState(false);
  const [campaignResult, setCampaignResult] = useState<MassMailingCampaignResult | null>(null);
  const [liveLogs, setLiveLogs] = useState<MassMailingLogEntry[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // Daily quota tracker
  const DAILY_QUOTA_LIMIT = 450;
  const remainingDailyQuota = Math.max(0, DAILY_QUOTA_LIMIT - sentCount);

  // Fetch saved SMTP status & initial targets on mount
  useEffect(() => {
    fetchSmtpStatus();
    fetchTargets();
  }, []);

  // Refetch targets when filters change
  useEffect(() => {
    fetchTargets();
  }, [filterRegion, filterCity, filterCategory, searchTarget, selectedBatchLimit]);

  // Handle template change
  const handleTemplateSwitch = (key: 'ARTICLESHIP' | 'INDUSTRIAL_TRAINING' | 'QUALIFIED_JOB') => {
    setSelectedTemplateKey(key);
    setSubjectTemplate(GENERIC_TEMPLATES[key].subject);
    setBodyTemplate(GENERIC_TEMPLATES[key].body);
  };

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
      `Ready to dispatch personalized applications to ${targetFirms.length} verified CA firms?\n\nDaily Safe Ceiling: 450 emails/day\nPacing delay: ${throttleDelaySec}s between emails to protect your Gmail reputation.`
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
        message: `Starting automated outreach to ${targetFirms.length} firms from ${savedConfig?.maskedEmail || smtpEmail} (Daily Safe Limit: 450 emails)...`,
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
    <div className="flex flex-col gap-5 text-black">
      {/* 1. Executive Masthead & 450 Daily Limit Banner */}
      <div className="glass-dark-card rounded-xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="max-w-[720px]">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-emerald-500 text-black text-[11px] font-extrabold px-2.5 py-0.5 rounded tracking-wide">
              DIRECT GMAIL INTEGRATION
            </span>
            <span className="bg-neutral-800 text-neutral-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-neutral-700">
              Safe Daily Limit: 450 Emails / 24h
            </span>
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-tight m-0 mb-1.5">
            1-Click CA Articleship &amp; Job Mass Outreach
          </h2>
          <p className="text-[13px] text-neutral-300 leading-relaxed m-0">
            Send genuine, personalized cover letters directly from your own Gmail address to 5,000+ verified CA firms and recruiters. Automated rate limiting prevents spam flags and guarantees partner inbox delivery.
          </p>
        </div>

        {/* Quota & Connection Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-3 min-w-[160px]">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
              Daily Safe Quota
            </div>
            <div className="text-[18px] font-black text-white flex items-baseline gap-1.5">
              <span>{remainingDailyQuota}</span>
              <span className="text-[11px] text-neutral-400 font-normal">/ {DAILY_QUOTA_LIMIT} left</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (sentCount / DAILY_QUOTA_LIMIT) * 100)}%` }}
              />
            </div>
          </div>

          {savedConfig ? (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-emerald-500/40 p-3 rounded-xl">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  SMTP Connected
                </div>
                <div className="text-[12px] font-bold text-white font-mono">{savedConfig.maskedEmail}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 p-3 rounded-xl">
              <AlertCircle size={18} className="text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                  Not Configured
                </div>
                <div className="text-[11px] text-neutral-300">Enter App Password below</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Step-by-Step Guide on How to Get Keys / 16-Letter Google App Password */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowGuide(!showGuide)}>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-emerald-600" />
            <h3 className="text-[15px] font-bold text-black m-0">
              How to Get Your 16-Character Google App Password (Step-by-Step Guide)
            </h3>
          </div>
          <button
            type="button"
            className="text-[12px] font-medium text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            {showGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            <span>{showGuide ? 'Hide Guide' : 'View Guide'}</span>
          </button>
        </div>

        {showGuide && (
          <div className="space-y-4 pt-2 border-t border-white/60">
            <p className="text-[13px] text-neutral-600 m-0">
              Google requires a 16-character <strong>App Password</strong> instead of your normal Gmail password. This allows EZapply to securely dispatch your applications directly from your email without ever exposing your main Google Account password.
            </p>

            {/* 5 Visual Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3 glass-pill rounded-xl flex flex-col gap-1.5">
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </div>
                <div className="text-[12px] font-bold text-black">Google Security</div>
                <div className="text-[11px] text-neutral-600 leading-snug">
                  Open Google Account Settings and click on <strong>Security</strong>.
                </div>
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 mt-auto"
                >
                  <span>Open Security</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div className="p-3 glass-pill rounded-xl flex flex-col gap-1.5">
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                  2
                </div>
                <div className="text-[12px] font-bold text-black">2-Step Verification</div>
                <div className="text-[11px] text-neutral-600 leading-snug">
                  Make sure <strong>2-Step Verification</strong> is turned <strong>ON</strong>.
                </div>
              </div>

              <div className="p-3 glass-pill rounded-xl flex flex-col gap-1.5">
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                  3
                </div>
                <div className="text-[12px] font-bold text-black">App Passwords</div>
                <div className="text-[11px] text-neutral-600 leading-snug">
                  Click on <strong>App Passwords</strong> (or search &quot;App passwords&quot;).
                </div>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 mt-auto"
                >
                  <span>App Passwords</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div className="p-3 glass-pill rounded-xl flex flex-col gap-1.5">
                <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                  4
                </div>
                <div className="text-[12px] font-bold text-black">Name the App</div>
                <div className="text-[11px] text-neutral-600 leading-snug">
                  Type <code>EZapply</code> or <code>Cold Mailer</code> and click <strong>Create</strong>.
                </div>
              </div>

              <div className="p-3 glass-pill rounded-xl flex flex-col gap-1.5 bg-emerald-50/70 border-emerald-300/70">
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                  5
                </div>
                <div className="text-[12px] font-bold text-emerald-900">Copy 16 Letters</div>
                <div className="text-[11px] text-emerald-800 leading-snug">
                  Copy the 16-letter code (e.g. <code>abcd efgh ijkl mnop</code>) and paste below.
                </div>
              </div>
            </div>

            {/* Safety & Spam Prevention Note */}
            <div className="p-3 rounded-xl glass-pill text-[12px] text-neutral-700 flex items-start gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Spam Reputation Risk:</strong> Google restricts personal accounts to 500 emails/day. Our automated system limits outreach to <strong>450 emails daily</strong> with randomized 1.5s - 2.5s delay pacing, ensuring your Gmail account stays 100% compliant with Google sending limits.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Operational Grid: Left = Setup & Campaign, Right = Live Terminal & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (6 cols): Credentials, Candidate Profile & Generic Templates */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* STEP 1: Enter Keys & Gmail */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-[15px] font-bold text-black m-0 flex items-center gap-1.5">
                  <Key size={16} className="text-emerald-600" />
                  <span>1. Enter Your Gmail &amp; App Password</span>
                </h3>
                <p className="text-[12px] text-neutral-500 m-0 mt-0.5">
                  CA partners reply straight to your inbox.
                </p>
              </div>
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="text-[12px] font-medium text-black hover:underline flex items-center gap-1"
              >
                <span>Generate Keys</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <form onSubmit={handleVerifyAndSaveSmtp} className="flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-neutral-800 mb-1">
                  Your Gmail Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname.ca2026@gmail.com"
                  value={smtpEmail}
                  onChange={(e) => setSmtpEmail(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] text-black glass-input rounded-lg placeholder:text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-neutral-800 mb-1">
                  Google 16-Letter App Password (Keys)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!savedConfig}
                    placeholder={savedConfig ? '•••••••••••••••• (Saved in DB)' : 'e.g. abcd efgh ijkl mnop'}
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-[13px] font-mono text-black glass-input rounded-lg placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-neutral-800 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma (CA Inter)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] text-black glass-input rounded-lg placeholder:text-neutral-400"
                />
              </div>

              {/* Advanced Relay Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSmtp(!showAdvancedSmtp)}
                  className="text-[11px] text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  {showAdvancedSmtp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  <span>{showAdvancedSmtp ? 'Hide Advanced SMTP Relay' : 'Custom Host / Port (Zoho, Outlook, Domain)'}</span>
                </button>

                {showAdvancedSmtp && (
                  <div className="grid grid-cols-2 gap-2 mt-2 p-2.5 glass-pill rounded-lg">
                    <div>
                      <label className="text-[10px] text-neutral-500 block">Host</label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full px-2 py-1 text-[12px] glass-input rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 block">Port</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        className="w-full px-2 py-1 text-[12px] glass-input rounded"
                      />
                    </div>
                  </div>
                )}
              </div>

              {smtpMessage && (
                <div
                  className={`p-2.5 rounded-lg text-[12px] flex items-center gap-2 ${
                    smtpMessage.type === 'success'
                      ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-300/70 glass-pill'
                      : 'bg-red-50/80 text-red-800 border border-red-300/70 glass-pill'
                  }`}
                >
                  {smtpMessage.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{smtpMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingSmtp}
                className="mt-1 w-full py-2.5 px-4 rounded-lg bg-black text-white hover:bg-neutral-800 font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                {isVerifyingSmtp ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
                    <span>Verifying Handshake...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} />
                    <span>Verify &amp; Save Credentials</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* STEP 2: Candidate Details */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-[15px] font-bold text-black m-0 mb-3">
              2. Candidate Profile (Auto-Fills Template Placeholders)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-2.5 py-1.5 glass-input rounded text-black"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">ICAI Registration No.</label>
                <input
                  type="text"
                  value={icaiRegNo}
                  onChange={(e) => setIcaiRegNo(e.target.value)}
                  placeholder="e.g. WRO0786542"
                  className="w-full px-2.5 py-1.5 glass-input rounded text-black"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">CA Status / Clearance</label>
                <select
                  value={interStatus}
                  onChange={(e) => setInterStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 glass-input rounded text-black"
                >
                  <option value="Both Groups Cleared (1st Attempt)">Both Groups Cleared (1st Attempt)</option>
                  <option value="Both Groups Cleared">Both Groups Cleared</option>
                  <option value="Group 1 Cleared (Appearing G2)">Group 1 Cleared (Appearing G2)</option>
                  <option value="Direct Entry Route Graduate">Direct Entry Route Graduate</option>
                  <option value="CA Final Qualified">CA Final Qualified</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Target / Base City</label>
                <input
                  type="text"
                  value={candidateCity}
                  onChange={(e) => setCandidateCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 glass-input rounded text-black"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 glass-input rounded text-black"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">LinkedIn / CV Drive Link</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-2.5 py-1.5 glass-input rounded text-black"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Generic Template Selector */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <div>
                <h3 className="text-[15px] font-bold text-black m-0">
                  3. Select Pre-Built Generic Template
                </h3>
                <span className="text-[12px] text-neutral-500">
                  Tested high-response cover letter formats
                </span>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('EDIT')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    activePreviewTab === 'EDIT' ? 'bg-black text-white shadow-xs' : 'glass-pill text-neutral-700'
                  }`}
                >
                  Edit Copy
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('PREVIEW')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-all ${
                    activePreviewTab === 'PREVIEW' ? 'bg-black text-white shadow-xs' : 'glass-pill text-neutral-700'
                  }`}
                >
                  <Eye size={11} />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Template Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              {(['ARTICLESHIP', 'INDUSTRIAL_TRAINING', 'QUALIFIED_JOB'] as const).map((key) => {
                const isSelected = selectedTemplateKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTemplateSwitch(key)}
                    className={`p-2.5 text-left rounded-lg transition-all cursor-pointer text-[12px] leading-tight ${
                      isSelected
                        ? 'bg-black text-white font-bold shadow-xs'
                        : 'glass-pill hover:bg-white text-neutral-700'
                    }`}
                  >
                    {key === 'ARTICLESHIP' && 'Articleship (Form 102/103)'}
                    {key === 'INDUSTRIAL_TRAINING' && 'Industrial Training (Form 104)'}
                    {key === 'QUALIFIED_JOB' && 'Qualified CA Job'}
                  </button>
                );
              })}
            </div>

            {activePreviewTab === 'EDIT' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subjectTemplate}
                    onChange={(e) => setSubjectTemplate(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono text-[12px] glass-input rounded text-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                    Email Body Template
                  </label>
                  <textarea
                    rows={8}
                    value={bodyTemplate}
                    onChange={(e) => setBodyTemplate(e.target.value)}
                    className="w-full p-3 font-mono text-[12px] leading-relaxed glass-input rounded text-black"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 glass-pill rounded-lg text-[12px]">
                <div className="pb-2 mb-2 border-b border-white/60 text-neutral-600">
                  <div><strong>TO:</strong> {previewData.firm.firmName} &lt;{previewData.firm.email}&gt;</div>
                  <div className="mt-1"><strong>SUBJECT:</strong> {previewData.subject}</div>
                </div>
                <div className="whitespace-pre-wrap text-neutral-800 leading-relaxed">
                  {previewData.body}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (6 cols): Target Firms, Batch Control & Terminal Monitor */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* STEP 4: Target Selection & Daily Batch Limit */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-[15px] font-bold text-black m-0 flex items-center gap-1.5">
                  <Building size={16} className="text-emerald-600" />
                  <span>4. Filter Target CA Firms ({targetFirms.length} Selected)</span>
                </h3>
                <span className="text-[12px] text-neutral-500">
                  Sourced from 5,000+ verified CA firms database
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowFirmsDrawer(!showFirmsDrawer)}
                className="text-[12px] font-semibold text-black hover:underline"
              >
                {showFirmsDrawer ? 'Hide List' : 'Preview List'}
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3 text-[12px]">
              <div>
                <label className="block text-neutral-600 mb-1 font-medium">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full p-1.5 glass-input rounded text-black"
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
                <label className="block text-neutral-600 mb-1 font-medium">City</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full p-1.5 glass-input rounded text-black"
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
                <label className="block text-neutral-600 mb-1 font-medium">Batch Size (450 Max)</label>
                <select
                  value={selectedBatchLimit}
                  onChange={(e) => setSelectedBatchLimit(Number(e.target.value))}
                  className="w-full p-1.5 glass-input rounded text-black font-semibold"
                >
                  <option value={25}>25 Firms (Quick Test)</option>
                  <option value={50}>50 Firms (Recommended)</option>
                  <option value={100}>100 Firms</option>
                  <option value={250}>250 Firms</option>
                  <option value={450}>450 Firms (Daily Maximum)</option>
                </select>
              </div>
            </div>

            {/* Recipient Drawer */}
            {showFirmsDrawer && (
              <div className="max-h-[180px] overflow-y-auto glass-pill rounded-lg p-2 text-[11px] mb-3">
                {isLoadingFirms ? (
                  <div className="text-center py-4 text-neutral-500">Loading firms...</div>
                ) : (
                  targetFirms.map((f, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-1 border-b border-white/50 last:border-b-0"
                    >
                      <div className="font-semibold text-black">{f.firmName} ({f.primaryCity || f.region})</div>
                      <div className="font-mono text-neutral-600">{f.email}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Delay Slider */}
            <div className="flex justify-between items-center pt-2 border-t border-white/60 text-[12px]">
              <span className="text-neutral-600 flex items-center gap-1">
                <Clock size={13} /> Gmail Pacing Delay:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.5"
                  value={throttleDelaySec}
                  onChange={(e) => setThrottleDelaySec(Number(e.target.value))}
                  className="w-[90px]"
                />
                <span className="font-mono font-bold text-black">{throttleDelaySec}s / mail</span>
              </div>
            </div>
          </div>

          {/* STEP 5: Execution Trigger & KPI Bar */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-black m-0">
                  Ready to Dispatch
                </h3>
                <div className="text-[12px] text-neutral-500 mt-0.5">
                  Targeting <strong>{targetFirms.length}</strong> verified firms (Daily Quota: {DAILY_QUOTA_LIMIT})
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartCampaign}
                disabled={isSending || targetFirms.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#09090B] hover:bg-neutral-800 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <RotateCcw size={16} className="animate-spin" />
                    <span>Dispatching Outreach...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} className="text-emerald-400" />
                    <span>Start 1-Click Mass Mailing ({targetFirms.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* KPI Counters */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg glass-pill text-center">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Total Selected</div>
                <div className="text-[20px] font-black text-black">{targetFirms.length}</div>
              </div>

              <div className="p-3 rounded-lg glass-pill border-emerald-300/70 bg-emerald-50/80 text-center">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Delivered</div>
                <div className="text-[20px] font-black text-emerald-700">{sentCount}</div>
              </div>

              <div className="p-3 rounded-lg glass-pill text-center">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Remaining Quota</div>
                <div className="text-[20px] font-black text-black">{remainingDailyQuota}</div>
              </div>
            </div>
          </div>

          {/* STEP 6: Interactive Terminal Output */}
          <div className="glass-dark-card rounded-xl p-4 flex flex-col min-h-[380px] shadow-2xl font-mono">
            {/* Terminal Top Bar */}
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] text-neutral-400 font-semibold">
                  outreach-terminal://ca-dispatcher (450 daily)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSending ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
                    }`}
                  />
                  <span className={isSending ? 'text-emerald-400' : 'text-neutral-500'}>
                    {isSending ? 'STREAMING DISPATCH' : 'IDLE'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setLiveLogs([])}
                  className="text-[10px] text-neutral-500 hover:text-white"
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto text-[11px] space-y-1.5 text-neutral-300">
              {liveLogs.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Terminal size={32} className="mx-auto mb-2 opacity-40" />
                  <div>Outreach terminal ready for dispatch.</div>
                  <div className="text-[10px] text-neutral-600 mt-1">
                    Connect your Gmail App Password and click &quot;Start 1-Click Mass Mailing&quot;.
                  </div>
                </div>
              ) : (
                liveLogs.map((log) => {
                  let colorClass = 'text-neutral-300';
                  let icon = 'ℹ';
                  if (log.level === 'SUCCESS') {
                    colorClass = 'text-emerald-400';
                    icon = '✓';
                  } else if (log.level === 'ERROR') {
                    colorClass = 'text-red-400';
                    icon = '✕';
                  } else if (log.level === 'WARN') {
                    colorClass = 'text-amber-400';
                    icon = '⚠';
                  }

                  return (
                    <div key={log.id} className="flex gap-2 leading-relaxed">
                      <span className="text-neutral-600 shrink-0">[{log.timestamp}]</span>
                      <span className={`${colorClass} font-bold shrink-0`}>{icon}</span>
                      <span className={`${colorClass} break-all`}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Terminal Footer */}
            <div className="pt-2 mt-2 border-t border-neutral-800 flex justify-between text-[10px] text-neutral-500">
              <span>Host: {smtpHost}:587</span>
              <span>Throttle: {throttleDelaySec}s/msg</span>
              <span>Safe Ceiling: 450/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
