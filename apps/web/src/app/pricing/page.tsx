'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Check,
  ArrowRight,
  FileText,
  Building,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PublicPricingPage() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  const plans = [
    {
      tier: 'FREE_CANDIDATE',
      name: 'Free Candidate Tier',
      badge: 'FOREVER FREE',
      badgeClass: 'badge-indigo',
      description: 'Foundational career discovery, capability inventory, and verified job search forever free for all CAs.',
      priceMonthly: 0,
      priceAnnual: 0,
      features: [
        'Articleship capability inventory & 7-pathway diagnostic',
        'Verified job search & unlimited job bookmarking',
        '1 Master Resume & 3 job-tailored resume exports / month',
        '3 AI technical mock interview simulations / month',
        'Standard CTC unbundler & offer comparison calculator',
        'Community discussion access & peer interview debriefs',
      ],
      ctaText: isAuthenticated ? 'Go to Billing' : 'Create Free Account',
      ctaHref: isAuthenticated ? '/billing' : '/register',
      highlight: false,
    },
    {
      tier: 'PRO_CANDIDATE',
      name: 'Pro Candidate Pass',
      badge: 'MOST POPULAR',
      badgeClass: 'badge-cyan',
      description: 'Advanced AI mock interview drill packs, unlimited zero-fabrication resumes, and priority applications.',
      priceMonthly: 999,
      priceAnnual: 9990, // ~17% annual discount
      features: [
        'Unlimited ATS resume tailoring with Zero-Fabrication provenance tracking',
        'Unlimited AI mock technical interviews with 4-dimension Ind AS rubrics',
        'Closed-loop adaptive learning task injection into Career Roadmaps',
        'Priority application tracking & follow-up reminders',
        'In-depth salary benchmarking with sample size (N) filtering',
        'Direct 1-on-1 mentor booking access',
      ],
      ctaText: isAuthenticated ? 'Upgrade in Billing' : 'Start with Pro Pass',
      ctaHref: isAuthenticated ? '/billing' : '/register',
      highlight: true,
    },
    {
      tier: 'PRACTICE_CRM',
      name: 'Independent Practice OS',
      badge: 'CA FIRMS & PRACTITIONERS',
      badgeClass: 'badge-emerald',
      description: 'Confidential client CRM, statutory compliance calendar, and firm task management for CA practitioners.',
      priceMonthly: 2499,
      priceAnnual: 24990,
      features: [
        'Confidential client master repository (Strict workspace tenant isolation)',
        'Statutory compliance calendar engine (Income Tax, GST, TDS, ROC, Tax Audit 44AB)',
        'Filing status tracking with ARN / Acknowledgement reference logging',
        'Personalized post-qualification regulatory checklists (ICAI Form 2 & Form 6 COP)',
        'Automated internal deadline vs statutory due date monitoring',
      ],
      ctaText: isAuthenticated ? 'Select Practice Plan' : 'Register Practice Firm',
      ctaHref: isAuthenticated ? '/billing' : '/register',
      highlight: false,
    },
    {
      tier: 'TEAM_EMPLOYER',
      name: 'Employer Hiring Pass',
      badge: 'RECRUITERS',
      badgeClass: 'badge-amber',
      description: 'Direct recruitment pipeline board, candidate discovery with consent, and ATS candidate management.',
      priceMonthly: 4999,
      priceAnnual: 49990,
      features: [
        'Up to 5 active verified job listings',
        'Candidate discovery engine with articleship domain filters',
        'Full recruitment pipeline board (NEW → IN_REVIEW → SHORTLISTED → INTERVIEW → OFFER → HIRED)',
        'Internal confidential recruiter notes & reviewer ratings',
        'Employer verification review queue & verified badge display',
        'Audit logging for all recruiter operations',
      ],
      ctaText: isAuthenticated ? 'Select Recruiter Plan' : 'Register Organization',
      ctaHref: isAuthenticated ? '/billing' : '/register',
      highlight: false,
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '1rem',
          }}
        >
          <CreditCard size={14} color="var(--brand-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
            TRANSPARENT SUBSCRIPTION PRICING
          </span>
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
          Predictable Pricing for{' '}
          <span
            style={{
              color: 'var(--brand-primary)',
            }}
          >
            Candidates, Practitioners & Employers
          </span>
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          No hidden fees. All paid plans include official GST tax invoices (SAC 998314) supporting Input Tax Credit (ITC) for registered businesses.
        </p>

        {/* Monthly / Annual Cycle Switcher */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--surface-secondary)',
            padding: '0.35rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              background: billingCycle === 'MONTHLY' ? 'var(--brand-primary)' : 'transparent',
              color: billingCycle === 'MONTHLY' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              background: billingCycle === 'ANNUAL' ? 'var(--brand-primary)' : 'transparent',
              color: billingCycle === 'ANNUAL' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>Annual Billing</span>
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--accent-emerald)',
                fontWeight: 700,
              }}
            >
              Save ~17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem',
          alignItems: 'stretch',
        }}
      >
        {plans.map((p) => {
          const price = billingCycle === 'MONTHLY' ? p.priceMonthly : p.priceAnnual;
          const formattedPrice = price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`;
          const periodSuffix = price === 0 ? 'forever' : billingCycle === 'MONTHLY' ? '/ month' : '/ year';

          return (
            <div
              key={p.tier}
              className="glass-panel"
              style={{
                padding: '2.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                border: p.highlight ? '1px solid rgba(99, 102, 241, 0.6)' : '1px solid var(--border-subtle)',
                background: p.highlight
                  ? 'linear-gradient(180deg, rgba(30, 41, 67, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
                  : 'rgba(15, 23, 42, 0.6)',
                boxShadow: p.highlight ? '0 12px 36px rgba(99, 102, 241, 0.2)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className={`badge ${p.badgeClass}`} style={{ fontSize: '0.6875rem' }}>
                    {p.badge}
                  </span>
                  {p.highlight && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      <Sparkles size={12} /> Recommended
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '48px', marginBottom: '1.5rem' }}>
                  {p.description}
                </p>

                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {formattedPrice}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {periodSuffix}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.875rem', fontWeight: 700 }}>
                    What’s Included:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {p.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <Check size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={p.ctaHref}
                className={`btn ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem' }}
              >
                <span>{p.ctaText}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pricing FAQs Section */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Frequently Asked Billing Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Clear statutory compliance answers for Indian finance professionals.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              How does GST invoicing work?
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              All paid subscriptions automatically generate GST tax invoices with SAC 998314. You can provide your firm or company GSTIN during checkout to claim 18% Input Tax Credit (ITC).
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Can I cancel my subscription at any time?
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Yes. You can cancel with 1-click in your authenticated billing dashboard. Your benefits will remain active until the end of your current billing period with zero recurring surprises.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Is the Candidate Free Tier really free forever?
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Yes. Qualified CAs and semi-qualified students will always have unlimited access to Form 108 capability mapping, 7-pathway diagnostics, and verified job discovery at zero cost.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
