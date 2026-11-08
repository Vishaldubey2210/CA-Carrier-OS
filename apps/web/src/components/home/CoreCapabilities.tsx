'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  FileCheck2,
  Terminal,
  Calculator,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

const CAPABILITIES = [
  {
    id: 'articleship',
    tag: 'PRACTICAL TRAINING',
    title: 'Articleship & Industrial Training Hub',
    description:
      'Direct placement board for ICAI 2-Year Scheme (Form 102/103) and Corporate Industrial Training (Form 104) across Big 4, Top 20 CA firms, and Fortune 500 treasury desks.',
    href: '/articleship',
    ctaText: 'Explore Articleships',
    stat: '440+ Verified Openings',
  },
  {
    id: 'diagnostic',
    tag: 'COMPETENCY BENCHMARK',
    title: 'Career Intelligence & 7 Pathways',
    description:
      'Map your articleship exposure against Companies Act 2013, CARO 2020, Ind AS, and transfer pricing standards to quantify lateral senior associate hiring readiness.',
    href: '/career',
    ctaText: 'Run Diagnostic',
    stat: '7 Specialized Horizons',
  },
  {
    id: 'resumes',
    tag: 'ATTESTED PROVENANCE',
    title: 'Zero-Fabrication Verified Resumes',
    description:
      'Build ATS-optimized, single-page executive resumes strictly bounded by verified training logs. Zero keyword stuffing, 100% auditable experience.',
    href: '/resumes',
    ctaText: 'Build Verified Resume',
    stat: 'ICAI Form 108 Aligned',
  },
  {
    id: 'interviews',
    tag: 'TECHNICAL DRILLS',
    title: 'Big 4 Mock Interview Simulator',
    description:
      'Practice technical partner drills evaluating Ind AS 115, Ind AS 116, deferred tax assets, and ICFR controls with real-time scoring rubrics.',
    href: '/interviews',
    ctaText: 'Practice Drills',
    stat: 'STAR-Method Rubrics',
  },
  {
    id: 'compensation',
    tag: 'FINANCIAL ANALYTICS',
    title: 'In-Hand Take-Home CTC Unbundler',
    description:
      'Compute exact net monthly bank credits under FY 2024-25 New Tax Regime. Unbundle employer PF contributions, gratuity, and performance bonus pacing.',
    href: '/growth',
    ctaText: 'Calculate Take-Home',
    stat: 'New Tax Regime Engine',
  },
  {
    id: 'privacy',
    tag: 'CONFIDENTIALITY',
    title: 'Candidate Blindfold Architecture',
    description:
      'Complete employer isolation. Your search activity, resume exports, and interview applications are cryptographically concealed from current accounting employers.',
    href: '/settings',
    ctaText: 'Review Security Controls',
    stat: 'Zero Cross-Tenant Leakage',
  },
];

export function CoreCapabilities() {
  return (
    <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem 4rem', width: '100%' }}>
      {/* Section Header */}
      <div style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
        <div className="badge-success-clean" style={{ marginBottom: '0.5rem' }}>
          <CheckCircle2 size={12} />
          <span>Core Infrastructure</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', margin: 0, lineHeight: 1.25 }}>
          Engineered for the Indian Chartered Accountant
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Six integrated modules replacing disparate job boards, unverified resume templates, and ambiguous CTC offers with an institutional-grade career system.
        </p>
      </div>

      {/* High-Density Bento Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1rem',
        }}
      >
        {CAPABILITIES.map((cap) => (
          <div
            key={cap.id}
            style={{
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {cap.tag}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#15803d',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {cap.stat}
                </span>
              </div>

              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-0.015em' }}>
                {cap.title}
              </h3>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {cap.description}
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Link
                href={cap.href}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', width: 'fit-content' }}
              >
                {cap.ctaText} <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
