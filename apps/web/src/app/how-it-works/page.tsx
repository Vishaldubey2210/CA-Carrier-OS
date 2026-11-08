'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  FileCheck2,
  CheckCircle2,
  MessageSquareCode,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Map Form 108 Articleship Exposure',
      subtitle: 'Transform raw training into structured capability points',
      description:
        'Instead of generic bullet points, record your 3-year articleship breakdown across Statutory Audit (Companies Act 2013, CARO), Corporate Tax (Form 3CD, Section 92C), Internal Controls (ICFR), and M&A Transaction Support.',
      icon: Compass,
      detail: 'Maps directly to Big 4 and Corporate Finance hiring criteria.',
    },
    {
      num: '02',
      title: 'Execute 7-Pathway Career Diagnostic',
      subtitle: 'Deterministic fit scoring across 7 high-impact domains',
      description:
        'Evaluate your exposure against 7 professional tracks: Statutory Audit, Direct Tax, FP&A, Corporate Finance & Valuation, Financial Due Diligence, CFO Advisory, and Independent Practice. Receive an actionable 30/60/90-day post-qualification roadmap.',
      icon: Layers,
      detail: 'Includes tailored ICAI SSP portal and CMI&B placement strategies.',
    },
    {
      num: '03',
      title: 'Tailor Resumes with Verified Records',
      subtitle: 'Stop AI hallucinations before they reach partner interviews',
      description:
        'Target specific job descriptions with our mathematically constrained tailoring engine. It is strictly prohibited from inventing unearned audit mandates or false client names. Every resume version requires your formal candidate attestation.',
      icon: FileCheck2,
      detail: 'Guarantees 100% adherence to ICAI professional ethical standards.',
    },
    {
      num: '04',
      title: 'Simulate Technical Mock Interviews',
      subtitle: 'Master 4-dimension Ind AS and taxation rubrics',
      description:
        'Engage in interactive 8-turn technical mock interviews evaluating Ind AS 115 revenue recognition, Ind AS 116 leases, and transfer pricing litigation. Receive immediate STAR rubric feedback on technical accuracy and communication.',
      icon: MessageSquareCode,
      detail: 'Evaluated against authentic Big 4 partner interview standards.',
    },
    {
      num: '05',
      title: 'Unbundle In-Hand CTC & Apply Confidentially',
      subtitle: 'Candidate Blindfold protection for zero-leak career mobility',
      description:
        'Compute your true monthly in-hand take-home after statutory PF, Gratuity, and FY 2025–26 New Tax Regime deductions. Explore verified job postings shielded from your current employer’s recruiters.',
      icon: Calculator,
      detail: 'Candidate Blindfold encryption guarantees total search confidentiality.',
    },
  ];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
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
          <Layers size={14} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', letterSpacing: '0.04em' }}>
            OPERATIONAL ARCHITECTURE
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
          How CA Career OS Works
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          A 5-step sovereign methodology grounding your career transition from articleship completion to corporate finance leadership.
        </p>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4.5rem' }}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="glass-panel"
              style={{
                padding: '2.5rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--accent-indigo)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                {step.num}
              </div>

              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {step.title}
                  </h2>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--accent-indigo)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {step.subtitle}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {step.description}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={13} color="var(--accent-emerald)" />
                  <span>{step.detail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Start Your Sovereign Career Journey Today
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '580px', margin: '0 auto 1.75rem' }}>
          Free forever for Indian CAs. No credit card required.
        </p>
        <Link href="/register" className="btn btn-primary btn-pill" style={{ padding: '0.75rem 2rem' }}>
          <span>Create Free Candidate Workspace</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
