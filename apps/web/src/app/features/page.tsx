'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Briefcase,
  FileCheck2,
  MessageSquareCode,
  Calculator,
  BriefcaseBusiness,
  Users,
  ShieldCheck,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const FEATURE_GROUPS = [
  {
    id: 'career-intelligence',
    title: 'Career Intelligence & 7 Pathways',
    icon: Compass,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'Structured 7-pathway capability diagnostic tailored to Indian Chartered Accountants.',
    capabilities: [
      'Articleship Capability Inventory: Form 108 exposure mapping (Audit, Tax, Transfer Pricing, M&A).',
      '7-Pathway Diagnostic: Statutory Audit, Direct Tax, FP&A, Corporate Finance, IB Due Diligence, Consulting, and Practice.',
      '30/60/90-Day Milestones: Automated task generation and progress tracking for post-qualification success.',
      'Skill Gap Analyzer: Benchmarking candidate competencies against senior industry criteria.',
    ],
    ctaHref: '/career',
    ctaText: 'Review Career Engine',
  },
  {
    id: 'job-discovery',
    title: 'Verified Job Search & Scam Alerts',
    icon: Briefcase,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'Scam-free job board exclusively for qualified CAs and semi-qualified finance specialists.',
    capabilities: [
      'Verified Employer Shield: Rigorous employer verification before job posting approval.',
      'Explainable Match Scoring: Deterministic rubric showing exact skill overlap percentage.',
      'Pathway Filtering: Instant filtering across 7 CA tracks, Big 4 vs Mid-market, and hybrid arrangements.',
      'Integrated Application Tracker: Status history from SAVED to INTERVIEWING and OFFERED.',
    ],
    ctaHref: '/jobs',
    ctaText: 'Explore Verified Roles',
  },
  {
    id: 'zero-fabrication-resumes',
    title: 'Verified CA Resumes',
    icon: FileCheck2,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'The industry-first resume engine that mathematically stops AI hallucinations.',
    capabilities: [
      'Mandatory Candidate Attestation: Generative rewording is strictly bound to user-attested factual records.',
      'Targeted Job Tailoring: Reorders and highlights verified articleship experience without inventing clients.',
      'ATS-Optimized Formatting: Clean, single-column Big 4 standard layout engineered for parsing algorithms.',
      'Tailored Cover Letter Generator: Grounds letters in verified articleship accomplishments.',
    ],
    ctaHref: '/resumes',
    ctaText: 'Build Verified Resume',
  },
  {
    id: 'mock-interviews',
    title: 'Technical Mock Interview Simulator',
    icon: MessageSquareCode,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'Technical interview practice evaluated on authentic Ind AS and ICAI statutory rubrics.',
    capabilities: [
      'Technical Question Bank: In-depth questions covering Ind AS 115, 116, CARO 2020, and Section 92C.',
      'Interactive 8-Turn Sessions: Adaptive follow-up probes testing reasoning rather than memorization.',
      '4-Dimension Evaluation: Technical Accuracy, Communication, Scenario Problem-Solving, and Completeness.',
      'Historical Performance Radar: Track performance trends over multiple interview drill packs.',
    ],
    ctaHref: '/interviews',
    ctaText: 'Practice Mock Interview',
  },
  {
    id: 'financial-ctc',
    title: 'CTC Unbundler & Salary Intelligence',
    icon: Calculator,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'Transparent compensation intelligence and statutory take-home salary calculations.',
    capabilities: [
      'Statutory CTC Unbundler: Deducts PF (12%), Gratuity (4.81%), and insurance to compute true gross.',
      'FY 2025–26 Tax Model: Accurate take-home calculations under both New and Old Tax Regimes.',
      'Multi-Offer Comparison: Side-by-side evaluation of base pay, variable clauses, and stock vesting.',
      'Salary Benchmarks: Provenance-backed quartiles (P25, P50, P75) disclosing sample size (N).',
    ],
    ctaHref: '/growth',
    ctaText: 'Calculate Take-Home CTC',
  },
  {
    id: 'practice-management',
    title: 'CA Practice Management OS',
    icon: BriefcaseBusiness,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'Confidential client CRM and statutory compliance calendar for CA practitioners.',
    capabilities: [
      'Post-Qualification Checklists: ICAI Form 2, Form 6 Certificate of Practice, and CABF guidance.',
      'Confidential Client CRM: Isolated client repository with PAN, GSTIN, and CIN metadata.',
      'Statutory Compliance Engine: Due date tracking for ITR, GST Returns, TDS, and Section 44AB Tax Audits.',
      'Audit Reference Logging: Acknowledgement number and ARN tracking for client peace of mind.',
    ],
    ctaHref: '/practice',
    ctaText: 'Explore Practice OS',
  },
  {
    id: 'mentorship-community',
    title: 'Mentorship & Professional Community',
    icon: Users,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'Verified CA-to-CA guidance and ethical peer discussions.',
    capabilities: [
      '1-on-1 Mentor Discovery: Connect with senior CAs in Big 4, PE, and strategic corporate finance.',
      'Confidential Booking Slots: Structured 45-minute advisory sessions with feedback loops.',
      'Community Discussions: Career queries, interview debriefs, and technical accounting debates.',
      'ICAI Ethics Moderation: Zero commercial solicitation; strict non-promotional enforcement.',
    ],
    ctaHref: '/growth',
    ctaText: 'Connect with Mentors',
  },
  {
    id: 'ai-career-agent',
    title: 'Sovereign AI Career Agent',
    icon: Bot,
    badge: 'LOCAL DETERMINISTIC / SANDBOX',
    badgeClass: 'badge-amber',
    description: 'An intelligent personal advisor with strict 4-tier permission boundaries.',
    capabilities: [
      'Permission-Tiered Tool Calling: READ_ONLY, WRITE, EXPLICITLY_APPROVED, and DESTRUCTIVE tiers.',
      'Human-in-the-Loop Approvals: High-impact actions require cryptographic token sign-off.',
      'ICAI Domain Grounding: Prompt guardrails defending against prompt injections and jailbreaks.',
      'Deterministic Evaluation: Transparent explanations without black-box hallucinated advice.',
    ],
    ctaHref: '/career',
    ctaText: 'Review Agent Policy',
  },
  {
    id: 'security-privacy',
    title: 'Candidate Blindfold Security & RBAC',
    icon: ShieldCheck,
    badge: 'GENERALLY AVAILABLE',
    badgeClass: 'badge-emerald',
    description: 'Enterprise tenant isolation and strict candidate identity protection.',
    capabilities: [
      'Candidate Blindfold Rule: Employers can never view or search their current employees.',
      'Multi-Tenant Cryptographic Isolation: Strict foreign key and workspace boundary enforcement.',
      'HttpOnly Cookie Authentication: 15-minute access token and 7-day rotated refresh tokens.',
      'Structured Audit Logging: SHA-256 payload tracking on all administrative and recruiter mutations.',
    ],
    ctaHref: '/security',
    ctaText: 'Read Security Architecture',
  },
];

export default function FeaturesPage() {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'GA' | 'SANDBOX'>('ALL');

  const filteredFeatures = FEATURE_GROUPS.filter((f) => {
    if (selectedFilter === 'GA') return f.badge === 'GENERALLY AVAILABLE';
    if (selectedFilter === 'SANDBOX') return f.badge.includes('SANDBOX');
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div className="badge-success-clean" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={12} />
          <span>Product Capabilities Catalog</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}
        >
          Engineered for the Full{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Chartered Accountancy Lifecycle
          </span>
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Explore the 9 core modules of CA Career OS. Every capability is mapped to real backend domain services, persistent data models, and verified test suites.
        </p>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`btn ${selectedFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}
          >
            All Capabilities ({FEATURE_GROUPS.length})
          </button>
          <button
            onClick={() => setSelectedFilter('GA')}
            className={`btn ${selectedFilter === 'GA' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}
          >
            Generally Available (8)
          </button>
          <button
            onClick={() => setSelectedFilter('SANDBOX')}
            className={`btn ${selectedFilter === 'SANDBOX' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}
          >
            Sandbox / Local Eval (1)
          </button>
        </div>
      </div>

      {/* Capabilities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {filteredFeatures.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-indigo)',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span className={`badge ${feat.badgeClass}`} style={{ fontSize: '0.6875rem' }}>
                    {feat.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {feat.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.75rem' }}>
                  {feat.capabilities.map((cap, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <CheckCircle2 size={15} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={feat.ctaHref}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8125rem' }}
              >
                <span>{feat.ctaText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div
        className="glass-panel"
        style={{
          marginTop: '4rem',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Ready to experience these capabilities?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Create your personal workspace today. 100% free for all qualified CAs and semi-qualified candidates.
          </p>
        </div>
        <Link href="/register" className="btn btn-primary btn-pill" style={{ padding: '0.75rem 2rem' }}>
          <span>Get Started Free</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
