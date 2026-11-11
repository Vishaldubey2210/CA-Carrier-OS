'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import {
  GraduationCap,
  Briefcase,
  FileText,
  Compass,
  ArrowRight,
  User,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { JobDetail } from '@ca-career-os/shared';

export default function CandidateDashboardPage() {
  const { user, activeWorkspace, isAuthenticated, isLoading, demoLogin } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<JobDetail[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [profRes, appRes, jobRes] = await Promise.all([
          isAuthenticated ? apiClient.get('/career/profile').catch(() => null) : Promise.resolve(null),
          isAuthenticated ? apiClient.get('/applications').catch(() => null) : Promise.resolve(null),
          apiClient.get<JobDetail[]>('/jobs?limit=12').catch(() => null),
        ]);

        if (isMounted) {
          if (profRes?.success) setProfile(profRes.data);
          if (appRes?.success && Array.isArray(appRes.data)) setApplications(appRes.data);
          if (jobRes?.success && Array.isArray(jobRes.data)) setJobs(jobRes.data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const candidateName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Candidate';
  const articleships = jobs.filter(
    (j) =>
      j.opportunityType === 'ARTICLESHIP' ||
      j.opportunityType === 'INDUSTRIAL_TRAINING' ||
      j.title.toLowerCase().includes('article') ||
      j.title.toLowerCase().includes('intern') ||
      j.title.toLowerCase().includes('trainee')
  );
  const generalJobs = jobs.filter(
    (j) =>
      j.opportunityType !== 'ARTICLESHIP' &&
      !j.title.toLowerCase().includes('article') &&
      !j.title.toLowerCase().includes('intern')
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header (Linear Style) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Welcome back, {candidateName}
            </h1>
            <span className="badge-success-clean">
              <CheckCircle2 size={11} /> {activeWorkspace?.name || 'Personal Workspace'}
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            Command center for your verified articleships, job discovery, and application milestones.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/articleship"
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <GraduationCap size={14} /> Articleship Hub
          </Link>
          <Link
            href="/jobs"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <Briefcase size={13} /> CA Jobs
          </Link>
          <Link
            href="/resumes"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <FileText size={13} /> Resume Studio
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Strip (Editorial Metric Strip) */}
      <div className="editorial-metric-strip">
        <Link href="/articleship" className="metric-strip-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Articleship & Trainees
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {articleships.length > 0 ? `${articleships.length} Vacancies` : '50+ Vacancies'}
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#15803d', fontWeight: 500 }}>
            Form 102/103 & Form 104
          </span>
        </Link>

        <Link href="/jobs" className="metric-strip-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CA & Finance Jobs
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {generalJobs.length > 0 ? `${generalJobs.length} Positions` : '400+ Positions'}
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Audit, Direct Tax, FP&A & M&A
          </span>
        </Link>

        <Link href="/jobs" className="metric-strip-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Applications
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {applications.length} Tracked
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Stage updates & follow-ups
          </span>
        </Link>

        <Link href="/career" className="metric-strip-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Career Pathway
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
            Ready
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#15803d', fontWeight: 500 }}>
            ICAI Credential Verified
          </span>
        </Link>
      </div>

      {/* 3. Main Split Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column (8 cols): Fresh Openings */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Latest Verified Openings
              </h2>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Live XML feed updates synced hourly from official firm portals
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/articleship" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
                View All Articleships →
              </Link>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div style={{ background: 'var(--surface-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No openings found in current sync.
            </div>
          ) : (
            <div className="data-table-container">
              {jobs.slice(0, 6).map((job) => {
                const isTrainee =
                  job.opportunityType === 'ARTICLESHIP' ||
                  job.opportunityType === 'INDUSTRIAL_TRAINING' ||
                  job.title.toLowerCase().includes('article') ||
                  job.title.toLowerCase().includes('intern');
                const targetUrl = job.applicationUrl || job.canonicalUrl || job.sourceUrl || '#';
                const firmInitials = job.companyName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

                return (
                  <div
                    key={job.id}
                    className="scan-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '4px',
                          background: '#F1F5F9',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          flexShrink: 0,
                        }}
                      >
                        {firmInitials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              padding: '0.1rem 0.35rem',
                              borderRadius: '3px',
                              background: isTrainee ? '#FEF3C7' : '#F1F5F9',
                              color: isTrainee ? '#92400E' : '#334155',
                              border: `1px solid ${isTrainee ? '#FDE68A' : '#E2E8F0'}`,
                            }}
                          >
                            {isTrainee ? 'Trainee' : 'Qualified CA'}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                            {job.title}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.125rem' }}>
                          <span>{job.companyName}</span>
                          <span>•</span>
                          <span>{job.locationCity}</span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize' }}>{job.workArrangement.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', fontWeight: 600, flexShrink: 0, marginLeft: '0.75rem' }}
                    >
                      Apply ↗
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Quick Tools & Pipeline */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Shortcuts */}
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1rem',
            }}
          >
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Core Workspaces
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link
                href="/articleship"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'background var(--duration-instant) ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={15} color="var(--text-secondary)" />
                  <span>Articleship & Trainee Hub</span>
                </div>
                <ArrowRight size={13} color="var(--text-muted)" />
              </Link>

              <Link
                href="/jobs"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'background var(--duration-instant) ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={15} color="var(--text-secondary)" />
                  <span>CA & Finance Jobs</span>
                </div>
                <ArrowRight size={13} color="var(--text-muted)" />
              </Link>

              <Link
                href="/resumes"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'background var(--duration-instant) ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={15} color="var(--text-secondary)" />
                  <span>Verified Resume Studio</span>
                </div>
                <ArrowRight size={13} color="var(--text-muted)" />
              </Link>

              <Link
                href="/interviews"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'background var(--duration-instant) ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={15} color="var(--text-secondary)" />
                  <span>Big 4 Interview Prep</span>
                </div>
                <ArrowRight size={13} color="var(--text-muted)" />
              </Link>
            </div>
          </div>

          {/* Applications Pipeline Card */}
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Application Pipeline
              </h3>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {applications.length} Active
              </span>
            </div>

            {applications.length === 0 ? (
              <div style={{ padding: '1rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  No active applications yet
                </div>
                <div style={{ fontSize: '0.6875rem', marginTop: '0.125rem' }}>
                  Openings you apply for will appear here.
                </div>
                <Link
                  href="/articleship"
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--brand-primary)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Explore Articleships →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} style={{ padding: '0.5rem 0.625rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.roleTitle || 'CA Opening'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{app.companyName || 'Employer'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
