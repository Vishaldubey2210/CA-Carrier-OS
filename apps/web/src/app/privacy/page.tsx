'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
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
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', letterSpacing: '0.04em' }}>
            DATA PRIVACY & SOVEREIGNTY
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Operating Draft for Compliance Review | Baseline: October 2026
        </p>
      </div>

      {/* Draft Notice Banner */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <FileText size={18} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.8125rem', color: '#9A3412', lineHeight: 1.5 }}>
          <strong>Draft for Legal Review:</strong> This document outlines the technical data architecture and privacy controls of CA Career OS. It is an operating draft prepared for product review and does not constitute statutory certification or legal counsel warranty.
        </span>
      </div>

      {/* Candidate Blindfold Guarantee Highlight */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '3rem',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'rgba(16, 185, 129, 0.05)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Lock size={24} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              The Candidate Blindfold Rule
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Under our access control policy, candidate personal workspaces, private compensation targets, offer comparisons, and job applications are cryptographically separated from organization employer workspaces. A recruiter from your current employer can never discover your active search status or inspect your private records.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. Scope and Sovereign Commitment
          </h2>
          <p>
            CA Career OS (&quot;we&quot;, &quot;us&quot;, &quot;the platform&quot;) operates as sovereign vertical software designed for Chartered Accountants, semi-qualified candidates, CA firms, and corporate recruiters in India. We do not monetize through behavioral advertising networks or sell candidate contact details to third-party headhunters.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Categories of Information Processed
          </h2>
          <p>We process only information required to provide verified career services:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Identity & Credentials:</strong> Name, email address, password hash (scrypt-encrypted), and ICAI membership/student registration number where provided.</li>
            <li><strong>Articleship & Career Provenance:</strong> Form 108 articleship exposure (weeks, firm tier, domain areas), resume versions, and candidate-attested accomplishments.</li>
            <li><strong>Evaluations & Simulations:</strong> Technical interview responses, STAR rubric evaluations, and personalized 30/60/90-day roadmap task progression.</li>
            <li><strong>Billing & GST Data:</strong> Payment transaction metadata, Razorpay customer identifiers, and company GSTINs for official B2B tax invoicing (SAC 998314). We never store raw credit card numbers or banking passwords.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. Verified Resume Standards & AI Boundaries
          </h2>
          <p>
            When utilizing AI-assisted resume tailoring or interview evaluations, your verified articleship records are processed strictly within bounded deterministic prompts. The AI is structurally prohibited from storing your confidential client engagements in public training datasets.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            4. Third-Party Service Providers
          </h2>
          <p>We work with trusted infrastructure providers under strict data-protection agreements:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Razorpay Software Private Limited:</strong> Secure payment processing in Indian Rupees (INR) adhering to PCI-DSS standards.</li>
            <li><strong>Cloud Hosting & Persistence:</strong> Vercel (Next.js web layer) and Railway (isolated backend API and PostgreSQL database).</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            5. Your Rights: Access, Export & Deletion
          </h2>
          <p>
            Under applicable digital data privacy principles, you have full ownership over your professional information. You may at any time export your verified resume history or request permanent deletion of your account and personal workspace by contacting <a href="mailto:privacy@cacareeros.com" style={{ color: 'var(--accent-cyan)' }}>privacy@cacareeros.com</a>.
          </p>
        </section>

        <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Contact the Data Protection Officer
          </h2>
          <p style={{ margin: 0 }}>
            For privacy inquiries or audit rights, please email: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>privacy@cacareeros.com</span> or submit a structured ticket through our <Link href="/contact" style={{ color: 'var(--accent-cyan)' }}>Contact Desk</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
