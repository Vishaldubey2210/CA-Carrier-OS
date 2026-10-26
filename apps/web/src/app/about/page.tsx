'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Compass,
  FileCheck2,
  Lock,
  ArrowRight,
  BookOpen,
  Award,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
      {/* Editorial Header */}
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
            marginBottom: '1.25rem',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
            PURPOSE & ETHICAL GOVERNANCE
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '1.25rem',
          }}
        >
          About{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CA Career OS
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '780px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          An independent, sovereign operating system engineered specifically for Chartered Accountants in India—designed to bridge the gap between rigorous articleship training and high-impact corporate finance leadership.
        </p>
      </div>

      {/* The Core Problem */}
      <section className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3.5rem' }}>
        <span className="editorial-step" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>01 — THE PROBLEM</span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Why the Traditional CA Career Journey is Broken
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              Articleship Experience Trapped in Form 108
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              CAs undergo 3 years of rigorous statutory audit, tax litigation, and transaction reviews. Yet generic recruitment portals flatten this deep domain expertise into keyword checklists that misrepresent audit depth.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
              The Generative AI Hallucination Trap
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Generic LLM resume builders fabricate client names, unearned audit mandates, and false metrics—exposing candidates to immediate disqualification during partner interviews and ICAI disciplinary risk.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
              Privacy & Employer Surveillance
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Active job search activity on conventional networks leaks to current partners and HR teams, compromising candidate leverage and partner track relationships.
            </p>
          </div>
        </div>
      </section>

      {/* Our Core Architectural Principles */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>02 — PILLARS OF INTEGRITY</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Four Principles We Never Compromise
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Every algorithm, data schema, and workflow in CA Career OS is bound by these non-negotiable rules.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <FileCheck2 size={24} color="var(--accent-indigo)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Zero-Fabrication (ADR-009)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Our resume tailoring engine operates on strict deterministic constraints. It is mathematically prohibited from hallucinating unverified corporate clients, false audit metrics, or unearned credentials.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <Lock size={24} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Candidate Blindfold Privacy
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Candidate workspaces, applications, and compensation targets are cryptographically isolated from organization workspaces. A recruiter from your current employer can never inspect your active search status.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <BookOpen size={24} color="var(--accent-emerald)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ICAI Code of Ethics Aligned
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We adhere strictly to non-solicitation rules under Clauses 6 and 7 of Part I of the First Schedule of the Chartered Accountants Act, 1949. We never act as an unauthorized middleman or fee-splitting broker.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <Award size={24} color="var(--accent-amber)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Statistical Provenance
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We never invent placement numbers, fake salary averages, or phantom corporate testimonials. Every benchmark discloses sample size (N), quartile boundaries, and statistical limitations.
            </p>
          </div>
        </div>
      </section>

      {/* Target Personas */}
      <section className="glass-panel" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
        <span className="editorial-step" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>03 — WHO WE SERVE</span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Tailored for Every Stage of the CA Lifecycle
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={18} color="var(--accent-indigo)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Newly Qualified Chartered Accountants (NQCAs)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Navigating the ICAI Campus Placement Programme, choosing between Big 4 Statutory Audit, Investment Banking FDD, or high-growth SaaS FP&A, and unbundling complex CTC offers.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Experienced CAs & Corporate Finance Leaders
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Mid-career controllers, tax managers, and FP&A leads orchestrating confidential lateral career transitions into CFO advisory, corporate M&A, and private equity portfolio operations.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                CA Practitioners & Sole Proprietors
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Managing post-qualification Form 2 and Form 6 COP statutory milestones, maintaining client compliance calendars (ITR, GST, 44AB), and running firm task workflows in sovereign workspaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Ready to Ground Your CA Career in Reality?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '560px', margin: '0 auto 1.75rem' }}>
          Create your free candidate workspace in 60 seconds. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary btn-pill" style={{ padding: '0.75rem 2rem' }}>
            <span>Join Free Candidate Tier</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/features" className="btn btn-secondary btn-pill" style={{ padding: '0.75rem 1.75rem' }}>
            <span>Explore All Capabilities</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
