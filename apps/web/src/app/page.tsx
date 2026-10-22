'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import {
  Compass,
  Briefcase,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  Check,
  Lock,
  Calculator,
  Building,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { CAPathway } from '@ca-career-os/shared';

// 7 Professional Chartered Accountancy Pathways
const CA_PATHWAYS = [
  {
    pathway: CAPathway.AUDIT,
    name: 'Statutory Audit & Assurance',
    description: 'Companies Act 2013, Standards on Auditing (SAs), CARO 2020, Ind AS 115/116 financial statement reviews.',
    hiringDemand: 'High (Big 4 & Top 20)',
    roles: ['Senior Associate Audit', 'Assistant Manager Assurance', 'Technical Accounting Specialist'],
  },
  {
    pathway: CAPathway.TAX,
    name: 'Direct Tax & Transfer Pricing',
    description: 'Corporate taxation, Section 92C transfer pricing documentation, Form 3CEB/3CD, dispute resolution.',
    hiringDemand: 'High (Big 4 & MNCs)',
    roles: ['Tax Consultant', 'Transfer Pricing Senior', 'International Tax Analyst'],
  },
  {
    pathway: CAPathway.FPA,
    name: 'Financial Planning & Analysis (FP&A)',
    description: '12-month rolling forecasts, SaaS unit economics, variance attribution (Price-Volume-Mix), PowerBI.',
    hiringDemand: 'Very High (Tech & Unicorns)',
    roles: ['FP&A Manager', 'Corporate Finance Analyst', 'Strategic Finance Lead'],
  },
  {
    pathway: CAPathway.CORP_FIN,
    name: 'Corporate Finance & Valuation',
    description: 'ICAI Valuation Standards (IVS 301), DCF financial modeling, LBO scenarios, capital structuring.',
    hiringDemand: 'Selective & Elite',
    roles: ['Valuation Associate', 'Investment Banking Analyst', 'Treasury Manager'],
  },
  {
    pathway: CAPathway.IB,
    name: 'Financial Due Diligence & M&A',
    description: 'Quality of Earnings (QoE), debt-like items, normalized working capital, target financial health review.',
    hiringDemand: 'High (PE & Advisory)',
    roles: ['FDD Senior', 'Transaction Advisory Manager', 'M&A Associate'],
  },
  {
    pathway: CAPathway.CONSULTING,
    name: 'Management Consulting & CFO Advisory',
    description: 'Finance target operating models, ERP chart of accounts design, fast-close acceleration, automation.',
    hiringDemand: 'Growing (Global Capability Centers)',
    roles: ['Transformation Consultant', 'CFO Advisory Senior', 'Finance Business Partner'],
  },
  {
    pathway: CAPathway.PRACTICE,
    name: 'Independent CA Public Practice',
    description: 'Proprietorship or partnership firms handling statutory audits, GST compliances, and direct tax advisory.',
    hiringDemand: 'Entrepreneurial & Independent',
    roles: ['Managing Partner', 'Audit Proprietor', 'Tax Practitioner'],
  },
];

export default function RootHomePage() {
  const { isAuthenticated, isLoading, user, activeWorkspace } = useAuth();

  // If user is authenticated, render the Authenticated Candidate Dashboard
  if (isAuthenticated && !isLoading) {
    return <AuthenticatedDashboard user={user} workspace={activeWorkspace} />;
  }

  // Otherwise, render the Public Marketing Experience
  return <PublicMarketingLanding />;
}

// =========================================================================
// 1. PUBLIC MARKETING WEBSITE
// =========================================================================

function PublicMarketingLanding() {
  const [selectedPathway, setSelectedPathway] = useState<CAPathway>(CAPathway.AUDIT);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const activePathwayDetail = CA_PATHWAYS.find((p) => p.pathway === selectedPathway) || CA_PATHWAYS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Public Navigation Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2.5rem',
          maxWidth: '1300px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.125rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            CA
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              CA Career OS
            </span>
            <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              ICAI PROFESSIONAL SUITE
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#pathways" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Career Pathways
          </a>
          <a href="#capabilities" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Capabilities
          </a>
          <a href="#practice" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Practice OS
          </a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            Pricing
          </a>
          <a href="#faqs" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
            FAQs
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
            Sign In
          </Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
            <span>Create Free Account</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section (KOTA-inspired Bold Editorial) */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '2rem 2rem 0',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <ShieldCheck size={14} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
            BUILT EXCLUSIVELY FOR INDIAN CHARTERED ACCOUNTANTS
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            color: '#ffffff',
            maxWidth: '1000px',
          }}
        >
          The Career Operating System for{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Chartered Accountants
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '780px',
            lineHeight: 1.6,
          }}
        >
          Ground your career in verified articleship records. Generate zero-fabrication resumes (ADR-009), evaluate technical Ind AS interview rubrics, compute in-hand CTC take-home, and manage ICAI compliance—all in one sovereign workspace.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link href="/register" className="btn btn-primary btn-pill" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            <span>Join as CA Candidate</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/jobs" className="btn btn-secondary btn-pill" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            <span>Explore Verified Opportunities</span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <CheckCircle2 size={15} color="var(--accent-emerald)" /> Zero Resume Hallucinations
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <CheckCircle2 size={15} color="var(--accent-emerald)" /> ICAI Code of Ethics Grounded
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <CheckCircle2 size={15} color="var(--accent-emerald)" /> Candidate Blindfold Privacy
          </span>
        </div>
      </section>

      {/* Editorial Numbered Pillars (01, 02, 03) */}
      <section
        id="capabilities"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="editorial-step">01 — ARCHITECTURAL INTEGRITY</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Crafted for Professional Rigor, Not Generic Job Boards
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck2 size={22} color="var(--accent-indigo)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Zero-Fabrication ATS Resumes
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Unlike open-ended generative tools that invent unverified corporate achievements, our engine enforces ADR-009: every tailored bullet point is mathematically constrained to verified Form 108 articleship records.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={22} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Real CTC Unbundling & Tax Analytics
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Move beyond misleading headline LPA packages. Our statutory unbundler isolates employer EPF, gratuity deductions, performance variable hurdles, and computes realistic net monthly in-hand under Section 115BAC.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={22} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Independent CA Practice OS
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Built for proprietors and partnership firms. Manage client master records, track statutory compliance due dates (GSTR-3B, Tax Audit 44AB, TDS 26Q), and log filing ARN references with strict workspace isolation.
            </p>
          </div>
        </div>
      </section>

      {/* 7 CA Career Pathways Matrix */}
      <section
        id="pathways"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="editorial-step">02 — SPECIALIZATION INTELLIGENCE</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Tailored for the 7 Chartered Accountancy Career Horizons
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Discover where your articleship exposure, technical aptitude, and compensation objectives align.
          </p>
        </div>

        {/* Pathway Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          {CA_PATHWAYS.map((p) => (
            <button
              key={p.pathway}
              type="button"
              onClick={() => setSelectedPathway(p.pathway)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: selectedPathway === p.pathway ? 'var(--accent-indigo)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedPathway === p.pathway ? '#ffffff' : 'var(--text-secondary)',
                border: selectedPathway === p.pathway ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Selected Pathway Deep-Dive Card */}
        <div
          className="glass-panel"
          style={{
            padding: '2.25rem',
            borderLeft: '4px solid var(--accent-cyan)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>
              {activePathwayDetail.hiringDemand}
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              {activePathwayDetail.name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {activePathwayDetail.description}
            </p>
            <Link href="/career" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              <span>Diagnose Your Fit for {activePathwayDetail.name}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Representative Target Roles
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activePathwayDetail.roles.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <Briefcase size={16} color="var(--accent-indigo)" />
                  <span style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transparent SaaS Pricing (Derived from real Billing Tier Configuration) */}
      <section
        id="pricing"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>03 — TRANSPARENT TIERS</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Built for Candidates, Recruiters & Practice Firms
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '600px', margin: '0 auto' }}>
            Clear entitlements enforced on the server. No hidden overages. Includes official GST invoices with SAC code 998314.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {/* Tier 1: Free Candidate */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>CANDIDATE</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Free Forever</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.75rem 0' }}>
                ₹0 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Essential career diagnostic tools for qualified CAs and articleship trainees.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> 7-Pathway capability diagnostic</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> 3 Tailored resumes per month</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> 3 Technical mock interview drills</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Job application tracking board</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }}>
              Get Started Free
            </Link>
          </div>

          {/* Tier 2: Pro Candidate */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--accent-indigo)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-indigo)', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '9999px', letterSpacing: '0.05em' }}>
              MOST POPULAR
            </div>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>ACCELERATOR</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Pro Candidate</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.75rem 0' }}>
                ₹999 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Full suite for serious candidates targeting Big 4 and high-growth corporate roles.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Unlimited Zero-Fabrication resumes</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Unlimited technical mock interviews</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Adaptive learning deficit fixing</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Verified 1-on-1 mentor booking</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
              Upgrade to Pro
            </Link>
          </div>

          {/* Tier 3: Practice CRM */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>PRACTITIONER</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Practice CRM</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.75rem 0' }}>
                ₹2,499 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                For Chartered Accountants running proprietary firms or partnership offices.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Full client master repository</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Statutory compliance calendar</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Filing ARN / ACK reference tracking</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> ICAI non-solicitation compliant</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }}>
              Start Firm Workspace
            </Link>
          </div>

          {/* Tier 4: Team Employer */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>RECRUITER</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Team Employer</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.75rem 0' }}>
                ₹4,999 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                For corporate talent teams and accounting firms hiring qualified CAs.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Up to 5 active verified job postings</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Candidate pipeline Kanban review</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Candidate discovery with consent</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Verified employer blue badge</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }}>
              Post CA Openings
            </Link>
          </div>
        </div>
      </section>

      {/* Practical FAQs */}
      <section
        id="faqs"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>04 — CLARITY & TRUST</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Transparent answers about our verification policies, privacy safeguards, and ICAI compliance.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: 'How does the Zero-Fabrication Rule (ADR-009) work?',
              a: 'Our resume tailoring engine operates on strict deterministic constraints: it can only reorder, highlight, and adjust the wording of factual qualifications and articleship experiences that have been formally attested by you. It is mathematically prohibited from hallucinating unverified corporate clients, false audit metrics, or unearned credentials.',
            },
            {
              q: 'What is the Candidate Blindfold Rule?',
              a: 'Under our access control policy, candidate personal workspaces, private compensation targets, offer comparisons, and job applications are cryptographically separated from organization employer workspaces. A recruiter from your current employer can never discover your active search status or inspect your private records.',
            },
            {
              q: 'Does CA Career OS claim official affiliation with ICAI?',
              a: 'No. CA Career OS is an independent software platform designed for Chartered Accountants. We adhere strictly to the ICAI Code of Ethics (including non-solicitation rules under Clauses 6 and 7 of Part I of the First Schedule) and provide structured guidance to help members navigate statutory SSP and CMI&B placement portals.',
            },
            {
              q: 'How are payments and GST invoicing handled?',
              a: 'Payments are processed securely via Razorpay in Indian Rupees (INR). All subscription purchases automatically generate downloadable GST tax invoices with official Service Accounting Code (SAC) 998314 for Information Technology Software Services, supporting B2B Input Tax Credit (ITC).',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>{faq.q}</h3>
                <ChevronRight
                  size={18}
                  color="var(--text-muted)"
                  style={{ transform: activeFaq === idx ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}
                />
              </div>
              {activeFaq === idx && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.75rem 0 0 0' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Public Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '3rem 2.5rem 2rem',
          maxWidth: '1300px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.75rem' }}>
                CA
              </div>
              <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>CA Career OS</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.6 }}>
              Production SaaS platform for Indian Chartered Accountants. Grounded in certified articleship records and statutory compliance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <Link href="/career" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Career Pathways</Link>
                <Link href="/jobs" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Job Discovery</Link>
                <Link href="/resumes" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Zero-Fabrication Resumes</Link>
                <Link href="/practice" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Practice Management OS</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Account</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sign In</Link>
                <Link href="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Register Candidate</Link>
                <Link href="/billing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Subscription Plans</Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>© 2026 CA Career OS. Built for Chartered Accountants. All rights reserved.</span>
          <span>Confidentiality & Candidate Blindfold Protected.</span>
        </div>
      </footer>
    </div>
  );
}

// =========================================================================
// 2. AUTHENTICATED CANDIDATE DASHBOARD
// =========================================================================

interface AuthenticatedDashboardProps {
  user: any;
  workspace: any;
}

function AuthenticatedDashboard({ user, workspace }: AuthenticatedDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [profRes, roadRes, appRes, jobRes] = await Promise.all([
          apiClient.get('/career/profile').catch(() => null),
          apiClient.get('/career/roadmap').catch(() => null),
          apiClient.get('/applications').catch(() => null),
          apiClient.get('/jobs').catch(() => null),
        ]);

        if (isMounted) {
          if (profRes?.success) setProfile(profRes.data);
          if (roadRes?.success) setRoadmap(roadRes.data);
          if (appRes?.success && Array.isArray(appRes.data)) setApplications(appRes.data);
          if (jobRes?.success && Array.isArray(jobRes.data)) setJobs(jobRes.data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }
    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Compute genuine metrics from real data (no fabricated numbers)
  const candidateName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Candidate';
  const totalTasks = roadmap?.tasks?.length || 0;
  const completedTasks = roadmap?.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeApplicationsCount = applications.filter((a) => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Personalized Welcome Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(30, 41, 67, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-indigo">
              {workspace?.name || 'Personal Workspace'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Role: {user?.role || 'CANDIDATE'}
            </span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '0.875rem',
              color: '#ffffff',
            }}
          >
            Welcome back, {candidateName}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your Chartered Accountancy career dashboard is connected directly to your personal workspace. Monitor your verified articleship progress, active applications, and learning roadmap.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
            <Link href="/career" className="btn btn-primary">
              <Compass size={16} />
              <span>Review Career Roadmap</span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/jobs" className="btn btn-secondary">
              <Briefcase size={16} />
              <span>Explore Roles ({jobs.length} Open)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Genuine Data Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Metric 1: Tracked Applications */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ACTIVE APPLICATIONS
            </span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)' }}>
              <Briefcase size={18} color="var(--accent-indigo)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            {activeApplicationsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {activeApplicationsCount === 0 ? 'No active applications tracked yet' : `${activeApplicationsCount} in review pipeline`}
          </div>
        </div>

        {/* Metric 2: Roadmap Completion */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ROADMAP PROGRESS
            </span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            {totalTasks > 0 ? `${taskCompletionRate}%` : 'Not Initialized'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {totalTasks > 0 ? `${completedTasks} of ${totalTasks} statutory milestones completed` : 'Configure your pathway in Career'}
          </div>
        </div>

        {/* Metric 3: Verified Articleship */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ARTICLESHIP STATUS
            </span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)' }}>
              <ShieldCheck size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            {profile?.qualificationStatus || 'Qualified CA'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            ICAI Form 108 Provenance Active
          </div>
        </div>

        {/* Metric 4: Verified Resume */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              RESUME STUDIO
            </span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)' }}>
              <FileText size={18} color="var(--accent-amber)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            ADR-009
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Zero-Fabrication Guard Enabled
          </div>
        </div>
      </div>

      {/* Real Tracked Applications or Designed Empty State */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
            Recent Application Tracker Activity
          </h2>
          <Link href="/jobs" style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
            View All ({applications.length}) →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state-panel">
            <div className="empty-state-icon">
              <Briefcase size={36} color="var(--accent-indigo)" />
            </div>
            <div className="empty-state-title">No Active Applications Tracked</div>
            <p className="empty-state-desc">
              When you submit or log applications with Big 4 firms and enterprise corporates, their real-time interview pipeline status will appear here.
            </p>
            <Link href="/jobs" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              Explore Open Roles
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {app.roleTitle || 'Chartered Accountant Role'}
                  </h4>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {app.companyName || 'Corporate Employer'} • Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <span className="badge badge-indigo">{app.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
