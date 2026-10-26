'use client';

import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  BookOpen,
  FileText,
  Compass,
  BriefcaseBusiness,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Mail,
} from 'lucide-react';

export default function HelpKnowledgeBasePage() {
  const guideCategories = [
    {
      title: 'Getting Started as a Candidate',
      icon: Compass,
      description: 'How to map Form 108 articleship exposure, run 7-pathway career diagnostics, and set up your personal workspace.',
      articles: [
        'Setting up your candidate profile with ICAI credentials',
        'How Form 108 weeks & firm tiers affect pathway matching',
        'Understanding your 30/60/90-day post-qualification roadmap',
      ],
      linkHref: '/career',
    },
    {
      title: 'Zero-Fabrication Resume Tailoring',
      icon: FileText,
      description: 'Master Big 4 standard resume generation with strict candidate attestation (ADR-009).',
      articles: [
        'Attesting verified audit and taxation accomplishments',
        'Tailoring resumes to specific job descriptions without hallucination',
        'Generating audit-grounded cover letters and InMail pitches',
      ],
      linkHref: '/resumes',
    },
    {
      title: 'CA Practice Management OS',
      icon: BriefcaseBusiness,
      description: 'Setting up client CRM, statutory compliance calendars, and ICAI regulatory checklists.',
      articles: [
        'Managing post-qualification Form 2 and Form 6 COP statutory milestones',
        'Setting up private client records with PAN, GSTIN, and CIN metadata',
        'Configuring statutory compliance alerts for Section 44AB and GST returns',
      ],
      linkHref: '/practice',
    },
    {
      title: 'Billing, Subscriptions & GST Invoicing',
      icon: CreditCard,
      description: 'Everything you need to know about plans, Razorpay payments, and B2B Input Tax Credit.',
      articles: [
        'Entering your company GSTIN for 18% Input Tax Credit (SAC 998314)',
        'Upgrading from Free Candidate Tier to Pro Candidate Pass',
        '1-click subscription cancellation and renewal policies',
      ],
      linkHref: '/pricing',
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      {/* Header */}
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
          <BookOpen size={14} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', letterSpacing: '0.04em' }}>
            PRODUCT DOCUMENTATION & GUIDES
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}
        >
          Help & Knowledge Base
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Practical tutorials and regulatory guidance for navigating your Chartered Accountancy career workflows.
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {guideCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--brand-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Icon size={22} />
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {cat.title}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {cat.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                  {cat.articles.map((art, aIdx) => (
                    <li key={aIdx} style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--brand-primary)' }} />
                      <span>{art}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={cat.linkHref} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span>Launch Workflow</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Dedicated Support Ticket Callout */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'var(--surface-primary)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Need direct technical assistance?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Submit a structured inquiry to our support and regulatory desk.
          </p>
        </div>
        <Link href="/contact" className="btn btn-primary btn-pill" style={{ padding: '0.625rem 1.75rem' }}>
          <span>Open Support Ticket</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
