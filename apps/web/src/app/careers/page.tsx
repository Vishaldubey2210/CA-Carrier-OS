'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code2,
  FileCheck2,
} from 'lucide-react';

export default function CareersPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
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
          <Briefcase size={14} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', letterSpacing: '0.04em' }}>
            TALENT & CULTURE
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: '1rem',
          }}
        >
          Work at CA Career OS
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Building vertical SaaS infrastructure for India’s 400,000+ Chartered Accountants and finance leaders.
        </p>
      </div>

      {/* Honest Current Hiring Status */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          marginBottom: '3rem',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          background: 'rgba(99, 102, 241, 0.05)',
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <Sparkles size={24} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Current Hiring Status: Zero Invented Openings
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              In accordance with our Zero-Fabrication integrity policy, we do not post phantom vacancies or pretend to have open roles when our team is currently lean and focused on core product stability. We are currently an engineering-led team operating on disciplined product milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Engineering & Product Culture */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
          Our Engineering & Design Principles
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <Code2 size={22} color="var(--accent-indigo)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              Full-Stack Determinism
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              We favor strong static typing (TypeScript, Zod), dual-persistence architectures, and comprehensive test coverage (150+ unit/integration suites) over brittle hacks.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <FileCheck2 size={22} color="var(--accent-emerald)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              Domain Grounding
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              We deeply understand Indian statutory frameworks: Ind AS 115/116, CARO 2020, Companies Act 2013, Section 44AB tax audits, and the ICAI Code of Ethics.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <ShieldCheck size={22} color="var(--accent-cyan)" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
              Candidate Privacy First
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Every feature is built around the Candidate Blindfold Rule—cryptographic tenant boundaries that prioritize user sovereignty over ad-tech surveillance.
            </p>
          </div>
        </div>
      </section>

      {/* Talent Network Registration */}
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          Interested in Future Senior Roles?
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          If you are a Senior Full-Stack Engineer, Product Designer, or qualified CA interested in building the future of financial career infrastructure, we invite you to connect with us.
        </p>
        <Link href="/contact" className="btn btn-secondary btn-pill" style={{ padding: '0.625rem 1.75rem' }}>
          <span>Connect via Support Desk</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
