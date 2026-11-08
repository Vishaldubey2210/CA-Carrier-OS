'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileCheck2,
  ArrowRight,
  Calculator,
  Terminal,
  Check,
  TrendingUp,
  PieChart,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Building,
  MapPin,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function HeroSection() {
  const { isAuthenticated, user, demoLogin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ARTICLESHIP' | 'DIAGNOSTIC' | 'RESUME' | 'COMPENSATION'>('ARTICLESHIP');

  const handleLaunchDemo = async () => {
    try {
      const res = await demoLogin('CANDIDATE');
      if (res.success) {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  };

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1rem 4rem', width: '100%' }}>
      {/* Hero Header Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.5rem', gap: '1rem' }}>
        {/* Eyebrow Badge */}
        <div className="badge-success-clean" style={{ padding: '0.25rem 0.65rem' }}>
          <CheckCircle2 size={12} />
          <span>ICAI Practical Training & Career Platform</span>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          The Professional Career Operating System for Chartered Accountants
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: 'clamp(0.9375rem, 1.2vw, 1.0625rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '650px',
            margin: 0,
          }}
        >
          Dedicated articleship and industrial training placement desk, 440+ verified corporate openings,
          and audit-provenance resume studio for Indian CAs.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Link
            href="/articleship"
            className="btn btn-primary"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
          >
            <GraduationCap size={16} /> Explore Articleships
          </Link>

          <Link
            href="/jobs"
            className="btn btn-secondary"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
          >
            <Briefcase size={16} /> Qualified CA Jobs
          </Link>

          <button
            type="button"
            onClick={handleLaunchDemo}
            className="btn btn-ghost"
            style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', border: '1px solid var(--border-subtle)' }}
          >
            Live Demo Access
          </button>
        </div>
      </div>

      {/* High-Density Interactive Feature Showcase (Linear / Stripe style interactive tabbed frame) */}
      <div
        style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            padding: '0.625rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 500 }}>
              CharteredOS • Platform Preview
            </span>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="segmented-control">
            <button
              onClick={() => setActiveTab('ARTICLESHIP')}
              className={`segmented-control-btn ${activeTab === 'ARTICLESHIP' ? 'active' : ''}`}
            >
              1. Articleship Hub
            </button>
            <button
              onClick={() => setActiveTab('DIAGNOSTIC')}
              className={`segmented-control-btn ${activeTab === 'DIAGNOSTIC' ? 'active' : ''}`}
            >
              2. Competency Diagnostic
            </button>
            <button
              onClick={() => setActiveTab('RESUME')}
              className={`segmented-control-btn ${activeTab === 'RESUME' ? 'active' : ''}`}
            >
              3. Verified Resume
            </button>
            <button
              onClick={() => setActiveTab('COMPENSATION')}
              className={`segmented-control-btn ${activeTab === 'COMPENSATION' ? 'active' : ''}`}
            >
              4. In-Hand CTC
            </button>
          </div>
        </div>

        {/* Feature Tab Content */}
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'ARTICLESHIP' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Live Articleship & Industrial Training Feed
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Form 102/103 & Form 104 vacancies ingested directly from top tier CA firms and MNCs
                  </span>
                </div>
                <Link href="/articleship" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
                  Explore 440+ Openings →
                </Link>
              </div>

              {/* High-density preview table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Firm / Organization</th>
                      <th>Role & Training Type</th>
                      <th>Location</th>
                      <th>Exposure</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { firm: 'ICAI SSP Portal', role: 'Official Articleship Placement Window', type: 'Form 102/103', loc: 'Pan-India', exp: 'Statutory Audit & Tax', url: 'https://cajobs.icai.org/' },
                      { firm: 'Meesho India', role: 'CA Industrial Trainee — Internal Controls', type: 'Form 104', loc: 'Bengaluru', exp: 'Ind AS / ICFR', url: 'https://cajobs.icai.org/' },
                      { firm: 'CRED (Dreamplug)', role: 'CA Industrial Trainee — Treasury & Audit', type: 'Form 104', loc: 'Bengaluru', exp: 'Financial Modeling', url: 'https://cajobs.icai.org/' },
                      { firm: 'Razorpay Software', role: 'CA Industrial Trainee — Finance & Reporting', type: 'Form 104', loc: 'Bengaluru', exp: 'Corporate Tax', url: 'https://cajobs.icai.org/' },
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '4px', background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                              {row.firm[0]}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{row.firm}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.1rem 0.35rem', borderRadius: '3px', background: row.type.includes('104') ? '#FEF3C7' : '#F1F5F9', color: row.type.includes('104') ? '#92400E' : '#1E293B' }}>
                              {row.type}
                            </span>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{row.role}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.loc}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.exp}</td>
                        <td style={{ textAlign: 'right' }}>
                          <a href={row.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>
                            Apply Direct ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'DIAGNOSTIC' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span className="badge-success-clean" style={{ alignSelf: 'flex-start' }}>
                  ICAI CARO 2020 & Ind AS Benchmarked
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Objective Competency Scoring Across 7 CA Horizons
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  Quantify your audit and financial reporting experience. Identifies technical gaps in Ind AS 115, Form 3CD, transfer pricing, and SOX 404 before you sit for Big 4 manager rounds.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <Link href="/career" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
                    Run Free Diagnostic →
                  </Link>
                </div>
              </div>

              <div style={{ gridColumn: 'span 5', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sample Diagnostic Breakdown</span>
                {[
                  { skill: 'Ind AS 115 / Revenue Assurance', score: 92 },
                  { skill: 'CARO 2020 Reporting & Internal Controls', score: 88 },
                  { skill: 'Form 3CD Tax Audit & TDS Reconciliations', score: 95 },
                  { skill: 'Financial Modeling & Valuation (IVS 301)', score: 78 },
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.skill}</span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.score}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.score}%`, height: '100%', background: '#0F172A' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'RESUME' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span className="badge-success-clean" style={{ alignSelf: 'flex-start' }}>
                  Zero-Fabrication Provenance
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  ICAI Form 108 Verified Resume Studio
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  Build single-page executive resumes tailored for Big 4 assurance and corporate treasury teams. Includes automated ICAI compliance checks and ATS formatting.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <Link href="/resumes" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
                    Open Resume Studio →
                  </Link>
                </div>
              </div>

              <div style={{ gridColumn: 'span 5', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Priya Sharma, ACA</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Chartered Accountant • ICAI M.No. 542109</div>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Articleship Experience: Statutory Audit</div>
                  • Executed statutory audit drills across 4 listed manufacturing entities under Companies Act 2013.<br />
                  • Prepared CARO 2020 inventory physical verification and related party disclosure schedules.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMPENSATION' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span className="badge-success-clean" style={{ alignSelf: 'flex-start' }}>
                  FY 2024-25 New Tax Regime Engine
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Transparent In-Hand Take-Home CTC Analytics
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  No more surprise CTC structures. Unbundle base gross, employer PF, performance bonus retentions, and monthly TDS in seconds.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <Link href="/growth" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>
                    Calculate My Take-Home →
                  </Link>
                </div>
              </div>

              <div style={{ gridColumn: 'span 5', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Annual Gross CTC</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹18,50,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Standard Deduction &amp; PF</span>
                  <span style={{ color: '#DC2626', fontWeight: 600 }}>-₹1,47,600</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated Monthly TDS</span>
                  <span style={{ color: '#DC2626', fontWeight: 600 }}>-₹14,200/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Net In-Hand Bank Credit</span>
                  <span style={{ fontWeight: 800, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>₹1,18,500/mo</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
