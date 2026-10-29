'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <FileText size={14} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', letterSpacing: '0.04em' }}>
            STATUTORY TERMS & CONDITIONS
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
          Terms of Service
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Operating Draft for Legal Review | Baseline: October 2026
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
          <strong>Draft for Legal Review:</strong> These Terms of Service represent an operating draft defining platform usage rules, non-solicitation bounds, and disclaimers. Subject to legal counsel finalization prior to commercial release.
        </span>
      </div>

      {/* Terms Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account or accessing CA Career OS (&quot;the Platform&quot;), you agree to be legally bound by these Terms of Service. If you are entering into these terms on behalf of a partnership firm, corporate entity, or recruitment agency, you represent that you hold the legal authority to bind that organization.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            2. Professional User Roles & Governance
          </h2>
          <p>The platform supports distinct role tiers with explicit responsibilities:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Candidates:</strong> Must provide truthful qualifications, genuine articleship records, and must formally attest to resume facts under the Zero-Fabrication Rule (ADR-009).</li>
            <li><strong>Recruiters & Employers:</strong> Must undergo employer verification before job publishing. Must not solicit candidates for unverified or fraudulent positions.</li>
            <li><strong>CA Practitioners:</strong> Must maintain client confidentiality and comply with all statutory audit and tax filing responsibilities.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            3. ICAI Code of Ethics Alignment
          </h2>
          <p>
            CA Career OS is strictly aligned with the Code of Ethics established by the Institute of Chartered Accountants of India (ICAI). In particular:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Users shall not solicit professional clients in violation of Clauses 6 and 7 of Part I of the First Schedule of the Chartered Accountants Act, 1949.</li>
            <li>Practice CRM features are provided strictly for firm management and internal compliance tracking—not for public touting or fee sharing.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            4. Prohibited Activities
          </h2>
          <p>Users are strictly prohibited from:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Uploading forged or altered Form 108 articleship completion records.</li>
            <li>Submitting automated adversarial prompt injections or jailbreak attempts against the AI Career Agent.</li>
            <li>Scraping candidate profiles or employer records without explicit consent.</li>
            <li>Creating fake corporate entities or posting scam job openings with fee-demanding schemes.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            5. Subscriptions, Payments & Invoicing
          </h2>
          <p>
            Paid subscriptions (`PRO_CANDIDATE`, `PRACTICE_CRM`, `TEAM_EMPLOYER`) are billed in advance in Indian Rupees (INR) via Razorpay. All transactions include 18% GST with SAC 998314. You can cancel at any time through the billing dashboard. Subscriptions remain active until the end of the paid cycle.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            6. Statutory Disclaimer & Limitation of Liability
          </h2>
          <p>
            CA Career OS is an independent vertical SaaS provider. We are not an official organ of the Institute of Chartered Accountants of India (ICAI) and do not guarantee statutory examination results or campus placement hiring offers. To the maximum extent permitted by Indian law, CA Career OS is provided &quot;as is&quot; without warranties of any kind.
          </p>
        </section>

        <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Legal Questions
          </h2>
          <p style={{ margin: 0 }}>
            For legal inquiries or statutory notices, please contact: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>legal@cacareeros.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
