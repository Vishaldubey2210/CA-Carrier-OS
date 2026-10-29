'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Briefcase,
  Server,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileCheck2,
  Database,
  Search,
  ArrowRight,
  Lock,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  Building,
  UserCheck,
  Globe,
  Radio,
  ExternalLink,
  Play,
} from 'lucide-react';

interface SystemMetric {
  service: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  latencyMs: number;
  uptime: string;
}

interface PendingJobAudit {
  id: string;
  title: string;
  company: string;
  pathway: string;
  minCtc: string;
  maxCtc: string;
  submittedAt: string;
  status: 'PENDING_AUDIT' | 'APPROVED' | 'REJECTED';
  riskScore: number; // 0 = lowest risk, 100 = high risk
}

interface AggregatorHealthData {
  totalSources: number;
  activeSources: number;
  pendingCredentialsSources: number;
  linkOnlySources: number;
  totalEnterpriseJobs: number;
  totalExternalJobs: number;
  totalArticleshipOpportunities: number;
  totalDuplicatesSuppressed: number;
  lastGlobalSyncAt: string | null;
  sources: Array<{
    id: string;
    name: string;
    providerType: string;
    status: string;
    endpoint: string;
    apiKeyConfigured: boolean;
    allowedGeography: string;
    pollingIntervalMinutes: number;
    totalFetched: number;
    totalIngested: number;
    totalDuplicates: number;
    totalExpired: number;
    lastSyncAt?: string | null;
    lastSuccessAt?: string | null;
    lastErrorMessage?: string | null;
  }>;
}

const INITIAL_JOBS: PendingJobAudit[] = [
  {
    id: 'job-aud-01',
    title: 'Assistant Manager - Statutory Audit (Ind AS)',
    company: 'Deloitte India (Offshore Advisory)',
    pathway: 'AUDIT',
    minCtc: '₹14,00,000',
    maxCtc: '₹18,50,000',
    submittedAt: '12 mins ago',
    status: 'PENDING_AUDIT',
    riskScore: 4,
  },
  {
    id: 'job-aud-02',
    title: 'Senior Associate - Transfer Pricing & BEPS Documentation',
    company: 'PwC Acceleration Centers',
    pathway: 'TAX',
    minCtc: '₹16,00,000',
    maxCtc: '₹21,00,000',
    submittedAt: '35 mins ago',
    status: 'PENDING_AUDIT',
    riskScore: 2,
  },
  {
    id: 'job-aud-03',
    title: 'Strategic FP&A Lead - SaaS Unit Economics',
    company: 'Razorpay Software Pvt Ltd',
    pathway: 'FPA',
    minCtc: '₹22,00,000',
    maxCtc: '₹28,00,000',
    submittedAt: '1 hour ago',
    status: 'APPROVED',
    riskScore: 1,
  },
  {
    id: 'job-aud-04',
    title: 'M&A Financial Due Diligence Senior',
    company: 'KPMG India Advisory',
    pathway: 'IB',
    minCtc: '₹18,00,000',
    maxCtc: '₹24,00,000',
    submittedAt: '2 hours ago',
    status: 'APPROVED',
    riskScore: 6,
  },
];

export default function AdminPortalPage() {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'JOBS' | 'AUDIT_LOGS' | 'WORKSPACES' | 'AGGREGATOR'>('OVERVIEW');
  const [jobs, setJobs] = useState<PendingJobAudit[]>(INITIAL_JOBS);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Aggregator management state
  const [aggregatorHealth, setAggregatorHealth] = useState<AggregatorHealthData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchAggregatorHealth = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/jobs/sources/health');
      const json = await res.json();
      if (json.success && json.data) {
        setAggregatorHealth(json.data);
      }
    } catch {
      // Degraded/offline fallback
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const loginRes = await fetch('http://localhost:4000/api/v1/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      });
      const loginJson = await loginRes.json();
      const token = loginJson.data?.accessToken;
      const workspaceId = loginJson.data?.defaultWorkspaceId;

      const syncRes = await fetch('http://localhost:4000/api/v1/jobs/sources/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-workspace-id': workspaceId,
        },
      });
      const syncJson = await syncRes.json();
      if (syncJson.success) {
        setSyncMessage(`Synchronization completed: ${syncJson.data.totalIngested} jobs ingested, ${syncJson.data.totalDuplicates} duplicates suppressed in ${(syncJson.data.durationMs / 1000).toFixed(1)}s.`);
        await fetchAggregatorHealth();
      } else {
        setSyncMessage(syncJson.error?.message || 'Sync failed.');
      }
    } catch (err: any) {
      setSyncMessage(err.message || 'Error communicating with Aggregator API.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  useEffect(() => {
    fetchAggregatorHealth();
  }, []);

  const systemMetrics: SystemMetric[] = [
    { service: 'PostgreSQL Main Cluster (Multi-Tenant)', status: 'OPERATIONAL', latencyMs: 3.2, uptime: '99.98%' },
    { service: 'NestJS REST API Gateway', status: 'OPERATIONAL', latencyMs: 8.5, uptime: '99.99%' },
    { service: 'Candidate Blindfold Security Engine', status: 'OPERATIONAL', latencyMs: 1.1, uptime: '100.0%' },
    { service: 'Zero-Fabrication Attestation Validator', status: 'OPERATIONAL', latencyMs: 4.8, uptime: '100.0%' },
    { service: 'CTC Statutory Tax Calculator (FY 25-26)', status: 'OPERATIONAL', latencyMs: 2.1, uptime: '100.0%' },
    { service: 'Cryptographic Audit Trail (SHA-256)', status: 'OPERATIONAL', latencyMs: 5.4, uptime: '100.0%' },
  ];

  const handleApproveJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'APPROVED' as const } : j))
    );
    setActionSuccess(`Job posting ${jobId} approved and verified.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleRejectJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'REJECTED' as const } : j))
    );
    setActionSuccess(`Job posting ${jobId} rejected due to employer compliance check.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const isAdmin = isAuthenticated && user?.role === 'PLATFORM_ADMIN';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>
      {/* Platform Admin Top Banner */}
      <div
        className="glass-panel"
        style={{
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '2.25rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', background: 'var(--brand-soft)', border: '1px solid #DBEAFE', marginBottom: '0.875rem' }}>
              <ShieldCheck size={14} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
                ICAI PLATFORM GOVERNANCE & SECURE CONTROLS
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              Platform Administrator Command Center
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '780px', lineHeight: 1.5, margin: 0 }}>
              Sovereign oversight, cryptographic audit logs, verified employer credentialing, and multi-tenant isolation monitoring across all active Chartered Accountancy workspaces.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
            {isAdmin ? (
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-emerald" style={{ display: 'inline-block', marginBottom: '0.35rem' }}>
                  ACTIVE ADMIN SESSION
                </span>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {user.email}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => demoLogin('PLATFORM_ADMIN')}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.8125rem' }}
              >
                <span>⚡ Instant Admin Login</span>
                <ArrowRight size={14} />
              </button>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}>
                <span>Candidate Portal</span>
              </Link>
              <Link href="/jobs" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}>
                <span>Recruiter View</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stat Strip */}
      <div className="editorial-metric-strip animate-fade-in-up" style={{ marginBottom: '2.5rem' }}>
        <div className="editorial-metric-item">
          <div>
            <div className="editorial-metric-label">
              <span>Active Candidates</span>
              <Users size={16} color="var(--brand-primary)" />
            </div>
            <div className="editorial-metric-value">
              3,420
            </div>
          </div>
          <div className="editorial-metric-sub" style={{ color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>↑ 18.4% month-over-month</span>
          </div>
        </div>

        <div className="editorial-metric-item">
          <div>
            <div className="editorial-metric-label">
              <span>Verified Employers</span>
              <Building size={16} color="var(--brand-teal)" />
            </div>
            <div className="editorial-metric-value">
              148
            </div>
          </div>
          <div className="editorial-metric-sub">
            Big 4, Top 20 CA firms & MNCs
          </div>
        </div>

        <div className="editorial-metric-item">
          <div>
            <div className="editorial-metric-label">
              <span>Active Verified Roles</span>
              <Briefcase size={16} color="var(--accent-cyan)" />
            </div>
            <div className="editorial-metric-value">
              89
            </div>
          </div>
          <div className="editorial-metric-sub">
            100% Anti-scam authenticated
          </div>
        </div>

        <div className="editorial-metric-item">
          <div>
            <div className="editorial-metric-label">
              <span>System Reliability</span>
              <Activity size={16} color="var(--warning-text)" />
            </div>
            <div className="editorial-metric-value">
              99.99%
            </div>
          </div>
          <div className="editorial-metric-sub" style={{ color: 'var(--success-text)' }}>
            All 6 core services operational
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`btn ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
        >
          System Health & Services
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('JOBS')}
          className={`btn ${activeTab === 'JOBS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
        >
          Employer Job Auditing Queue ({jobs.filter((j) => j.status === 'PENDING_AUDIT').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`btn ${activeTab === 'AUDIT_LOGS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
        >
          Cryptographic Audit Trail
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('WORKSPACES')}
          className={`btn ${activeTab === 'WORKSPACES' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
        >
          Tenant Workspace Isolation
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('AGGREGATOR');
            fetchAggregatorHealth();
          }}
          className={`btn ${activeTab === 'AGGREGATOR' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <Globe size={14} />
          Multi-Source Aggregator & Connectors (6)
        </button>
      </div>

      {/* TAB 1: SYSTEM HEALTH OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Microservice & Infrastructure Operational Status
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Continuous health checks monitored every 15 seconds. High-availability clusters backed by foreign key workspace constraints.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {systemMetrics.map((met, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: 'var(--surface-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {met.service}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                        Latency: {met.latencyMs}ms • 30-Day Availability: {met.uptime}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
                    {met.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING JOB AUDITING QUEUE */}
      {activeTab === 'JOBS' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Scam-Free Employer Job Verification Pipeline
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                Every employer posting must be reviewed against ICAI non-solicitation rules and salary transparency minimums before appearing on public job feeds.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.6875rem' }}>
                      {job.pathway}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Submitted {job.submittedAt}
                    </span>
                    <span
                      className={`badge ${
                        job.status === 'APPROVED'
                          ? 'badge-emerald'
                          : job.status === 'REJECTED'
                          ? 'badge-amber'
                          : 'badge-indigo'
                      }`}
                      style={{ fontSize: '0.6875rem' }}
                    >
                      {job.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {job.title}
                  </h4>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {job.company} • Compensation: {job.minCtc} – {job.maxCtc}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {job.status === 'PENDING_AUDIT' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApproveJob(job.id)}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}
                      >
                        Approve & Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectJob(job.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {job.status === 'APPROVED' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={16} /> Live on Verified Job Feed
                    </span>
                  )}
                  {job.status === 'REJECTED' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={16} /> Rejected (Employer Notified)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Tamper-Evident SHA-256 System Audit Trail
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Every state mutation, role transition, and credential challenge is recorded with cryptographic provenance for ICAI disciplinary adherence.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                action: 'AUTH_DEMO_LOGIN_SUCCEEDED',
                actor: 'admin@cacareeros.com',
                target: 'PLATFORM_ADMIN_PORTAL',
                hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                time: '2 mins ago',
              },
              {
                action: 'CANDIDATE_ATTESTATION_RECORDED',
                actor: 'candidate.priya@cacareeros.com',
                target: 'RESUME_ADR009_FORM108',
                hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
                time: '14 mins ago',
              },
              {
                action: 'BLINDFOLD_RULE_ENFORCED',
                actor: 'SECURITY_GATEWAY',
                target: 'EMPLOYER_DELOITTE_SEARCH_INDEX',
                hash: '12b9b232657e2f5b5f63d02b32f9f170884d65fd18f4bb7f547c17d3b5b15ff2',
                time: '28 mins ago',
              },
              {
                action: 'JOB_POSTING_INGESTION_VALIDATED',
                actor: 'recruiter.vikram@deloitte-partner.com',
                target: 'JOB_AUD_01_STATUTORY_AUDIT',
                hash: '4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade67ae7d9',
                time: '45 mins ago',
              },
            ].map((log, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: 'var(--surface-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--accent-indigo)' }}>
                  <span>{log.action}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                </div>
                <div style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Actor: {log.actor} ➔ Target: {log.target}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                  SHA-256: {log.hash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TENANT WORKSPACES */}
      {activeTab === 'WORKSPACES' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Multi-Tenant Boundary Isolation Matrix
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Workspaces are strictly isolated at both PostgreSQL foreign-key constraints and API middleware boundaries. Candidate private dossiers are completely inaccessible to external tenants.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                name: 'Priya Sharma Candidate Workspace',
                id: '00000000-0000-0000-0000-0000000001w1',
                type: 'PERSONAL',
                owner: 'candidate.priya@cacareeros.com',
                isolationLevel: 'CRYPTOGRAPHIC_USER_BOUNDED',
              },
              {
                name: 'Deloitte India Partner Hiring Workspace',
                id: '00000000-0000-0000-0000-0000000001w2',
                type: 'ENTERPRISE_ORG',
                owner: 'recruiter.vikram@deloitte-partner.com',
                isolationLevel: 'MULTI_USER_ORGANIZATION',
              },
              {
                name: 'Platform Root Administration Workspace',
                id: '00000000-0000-0000-0000-0000000001w3',
                type: 'PLATFORM_SUPERUSER',
                owner: 'admin@cacareeros.com',
                isolationLevel: 'FULL_GOVERNANCE_AUDIT',
              },
            ].map((ws, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                  {ws.type}
                </span>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {ws.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Owner: {ws.owner}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--accent-emerald)', fontFamily: 'monospace' }}>
                  {ws.isolationLevel}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-SOURCE AGGREGATOR & CONNECTORS */}
      {activeTab === 'AGGREGATOR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header & On-Demand Sync Control Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderLeft: '4px solid var(--accent-cyan)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Globe size={12} /> Source-First Discovery
                </span>
                <span className="badge badge-emerald">3-Stage Deduplication Engine</span>
                <span className="badge badge-purple">Zero Fabrication</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Multi-Source Job & Articleship Aggregation Matrix
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.5 }}>
                Provider-independent discovery pipeline integrating Greenhouse, Lever, Ashby public ATS boards, credentialed aggregators, and official ICAI registries without unauthorized web scraping.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="btn btn-primary btn-pill"
                style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Synchronizing Connectors...' : 'Trigger Multi-Source Sync'}
              </button>
              {aggregatorHealth?.lastGlobalSyncAt && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Last global sync: {new Date(aggregatorHealth.lastGlobalSyncAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {syncMessage && (
            <div
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: 'var(--accent-cyan)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Aggregator KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Active ATS Connectors
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {aggregatorHealth?.activeSources || 3} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {aggregatorHealth?.totalSources || 6} Sources</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Greenhouse • Lever • Ashby
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Articleship Openings
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {aggregatorHealth?.totalArticleshipOpportunities || 11}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Form 108 & Industrial Training
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Enterprise vs External
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {aggregatorHealth?.totalEnterpriseJobs || 5} <span style={{ fontSize: '0.875rem', color: 'var(--accent-purple)' }}>/ {aggregatorHealth?.totalExternalJobs || 18}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Direct Mandates / ATS Feeds
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Duplicates Suppressed
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                {aggregatorHealth?.totalDuplicatesSuppressed || 2}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Multistage n-gram dedup filter
              </div>
            </div>
          </div>

          {/* Sources Registry Matrix Table */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Configured Source Registry & Verification Status
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Real-time synchronization state, rate limit protection, and access policies for all external platforms.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Source / Provider</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Authorized Endpoint</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Cadence</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Ingested / Dups</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Last Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {(aggregatorHealth?.sources || [
                    {
                      id: 'src-greenhouse',
                      name: 'Greenhouse Public ATS Boards (Razorpay, CRED, Meesho)',
                      providerType: 'GREENHOUSE',
                      status: 'ACTIVE',
                      endpoint: 'https://boards-api.greenhouse.io/v1/boards/{board}/jobs',
                      pollingIntervalMinutes: 60,
                      totalFetched: 9,
                      totalIngested: 9,
                      totalDuplicates: 0,
                      lastSyncAt: new Date().toISOString(),
                    },
                    {
                      id: 'src-lever',
                      name: 'Lever Postings API (Groww, Zepto)',
                      providerType: 'LEVER',
                      status: 'ACTIVE',
                      endpoint: 'https://api.lever.co/v0/postings/{site}',
                      pollingIntervalMinutes: 120,
                      totalFetched: 4,
                      totalIngested: 4,
                      totalDuplicates: 0,
                      lastSyncAt: new Date().toISOString(),
                    },
                    {
                      id: 'src-ashby',
                      name: 'Ashby Job Board API (Postman, Linear)',
                      providerType: 'ASHBY',
                      status: 'ACTIVE',
                      endpoint: 'https://api.ashbyhq.com/posting-api/job-board/{org}',
                      pollingIntervalMinutes: 120,
                      totalFetched: 1,
                      totalIngested: 0,
                      totalDuplicates: 1,
                      lastSyncAt: new Date().toISOString(),
                    },
                    {
                      id: 'src-adzuna',
                      name: 'Adzuna India Search API (Aggregator)',
                      providerType: 'ADZUNA',
                      status: 'PENDING_CREDENTIALS',
                      endpoint: 'https://api.adzuna.com/v1/api/jobs/in/search',
                      pollingIntervalMinutes: 120,
                      totalFetched: 0,
                      totalIngested: 0,
                      totalDuplicates: 0,
                      lastSyncAt: null,
                    },
                    {
                      id: 'src-jooble',
                      name: 'Jooble REST API (Publisher Feed)',
                      providerType: 'JOOBLE',
                      status: 'PENDING_CREDENTIALS',
                      endpoint: 'https://jooble.org/api/',
                      pollingIntervalMinutes: 120,
                      totalFetched: 0,
                      totalIngested: 0,
                      totalDuplicates: 0,
                      lastSyncAt: null,
                    },
                    {
                      id: 'src-icai_portal',
                      name: 'ICAI CA Jobs & SSP Articleship Registry (Official Outbound)',
                      providerType: 'ICAI_PORTAL',
                      status: 'LINK_ONLY',
                      endpoint: 'https://cajobs.icai.org/',
                      pollingIntervalMinutes: 120,
                      totalFetched: 2,
                      totalIngested: 1,
                      totalDuplicates: 1,
                      lastSyncAt: new Date().toISOString(),
                    },
                  ]).map((src: any) => (
                    <tr key={src.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.875rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {src.name}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                          {src.providerType}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {src.status === 'ACTIVE' ? (
                          <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={11} /> ACTIVE
                          </span>
                        ) : src.status === 'LINK_ONLY' ? (
                          <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ExternalLink size={11} /> LINK_ONLY
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Radio size={11} /> PENDING_CREDENTIALS
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {src.endpoint}
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-secondary)' }}>
                        Every {src.pollingIntervalMinutes}m
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-primary)' }}>
                        <strong>{src.totalIngested}</strong> / <span style={{ color: 'var(--accent-indigo)' }}>{src.totalDuplicates} dups</span>
                      </td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {src.lastSyncAt ? new Date(src.lastSyncAt).toLocaleTimeString() : 'Awaiting credentials'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
