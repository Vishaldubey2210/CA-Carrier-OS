'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Search,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_DATA: FaqItem[] = [
  // 1. Articleship & Verification
  {
    category: 'Articleship & Resumes',
    q: 'How does the Zero-Fabrication Rule (ADR-009) work?',
    a: 'Our resume tailoring engine operates on strict deterministic constraints: it can only reorder, highlight, and adjust the wording of factual qualifications and articleship experiences that have been formally attested by you. It is mathematically prohibited from hallucinating unverified corporate clients, false audit metrics, or unearned credentials.',
  },
  {
    category: 'Articleship & Resumes',
    q: 'How is Form 108 articleship training verified?',
    a: 'Candidates can document their 3-year articleship breakdown across statutory audit, corporate taxation, transfer pricing, and financial reporting. Our document parser extracts verification data from ICAI Form 108 documents, flagging low-confidence documents for human-in-the-loop audit review.',
  },
  {
    category: 'Articleship & Resumes',
    q: 'Can employers see unverified resume claims?',
    a: 'No. When an employer inspects a candidate profile through consent-backed discovery, only formally attested competencies with provenance badges are displayed.',
  },

  // 2. Privacy & Blindfold
  {
    category: 'Privacy & Security',
    q: 'What is the Candidate Blindfold Rule?',
    a: 'Under our access control policy, candidate personal workspaces, private compensation targets, offer comparisons, and job applications are cryptographically separated from organization employer workspaces. A recruiter from your current employer can never discover your active search status or inspect your private records.',
  },
  {
    category: 'Privacy & Security',
    q: 'Do you share candidate data with third-party advertising brokers?',
    a: 'Never. CA Career OS operates strictly as sovereign software. We do not sell candidate resumes, personal emails, or mobile numbers to third-party ad networks or recruitment headhunters.',
  },
  {
    category: 'Privacy & Security',
    q: 'How are passwords and session tokens protected?',
    a: 'Passwords are encrypted using memory-hard scrypt hashing with per-user unique cryptographic salts. Sessions use 15-minute short-lived JWT access tokens paired with 7-day HttpOnly refresh cookies with reuse detection.',
  },

  // 3. Career Intelligence
  {
    category: 'Career Pathways',
    q: 'What are the 7 CA Career Pathways?',
    a: 'The platform categorizes CA careers into seven distinct tracks: Statutory Audit & Assurance, Direct Tax & Transfer Pricing, Financial Planning & Analysis (FP&A), Corporate Finance & Valuation, Financial Due Diligence & M&A (FDD), Management Consulting & CFO Advisory, and Independent CA Public Practice.',
  },
  {
    category: 'Career Pathways',
    q: 'How are mock interviews evaluated?',
    a: 'Interview responses are evaluated against a 4-dimension rubric: Technical Accuracy (Ind AS, Companies Act 2013, Tax codes), Communication Clarity, Problem-Solving Structure (STAR methodology), and Completeness of Statutory Disclosures.',
  },

  // 4. Practice OS
  {
    category: 'CA Practice OS',
    q: 'What is the Practice Management OS?',
    a: 'Practice OS is a sovereign mini-CRM designed for sole practitioners and partnership firms. It manages confidential client records (PAN, GSTIN, CIN), tracks statutory compliance deadlines (ITR, GST, TDS, Section 44AB Tax Audit), and logs filing acknowledgment reference numbers.',
  },
  {
    category: 'CA Practice OS',
    q: 'Does CA Career OS comply with ICAI non-solicitation ethics?',
    a: 'Yes. CA Career OS strictly conforms to Clauses 6 and 7 of Part I of the First Schedule of the Chartered Accountants Act, 1949. We do not solicit professional work or permit commercial touting between practitioners.',
  },

  // 5. Billing & Invoicing
  {
    category: 'Billing & Invoices',
    q: 'How is GST handled on subscription invoices?',
    a: 'All paid subscription transactions are invoiced with official Service Accounting Code (SAC) 998314 for Information Technology Software Services. If you provide your business GSTIN during checkout, your tax invoice will include B2B GST details for 18% Input Tax Credit (ITC).',
  },
  {
    category: 'Billing & Invoices',
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. You can cancel your subscription with 1-click in the billing section of your workspace. Your access will remain active through the end of the paid billing period, with zero recurring charges.',
  },
];

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = ['ALL', 'Articleship & Resumes', 'Privacy & Security', 'Career Pathways', 'CA Practice OS', 'Billing & Invoices'];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '3.5rem 2rem 5rem' }}>
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
          <HelpCircle size={14} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-indigo)', letterSpacing: '0.04em' }}>
            TRANSPARENT ANSWERS & ARCHITECTURE
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
          Frequently Asked Questions
        </h1>

        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Everything you need to know about our verification safeguards, ICAI ethics alignment, and privacy boundaries.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '540px', margin: '0 auto 1.75rem' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search questions (e.g. Form 108, GST, Blindfold)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
            >
              {cat === 'ALL' ? 'All Questions' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredFaqs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
              No questions found matching your search. Try searching for &quot;GST&quot;, &quot;Form 108&quot;, or &quot;Privacy&quot;.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  border: isOpen ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.625rem' }}>
                      {faq.category}
                    </span>
                    <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      {faq.q}
                    </h2>
                  </div>
                  <ChevronDown
                    size={18}
                    color="var(--text-muted)"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                </div>

                {isOpen && (
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem', margin: '1rem 0 0 0' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still have questions banner */}
      <div
        style={{
          marginTop: '4rem',
          padding: '2.5rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 67, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          Have a specific inquiry not listed here?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          Our engineering and regulatory team is available to address your questions. Every submission logs an auditable ticket.
        </p>
        <Link href="/contact" className="btn btn-primary btn-pill" style={{ padding: '0.625rem 1.75rem' }}>
          <span>Contact Support Desk</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
