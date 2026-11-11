'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  FileCheck2,
  TrendingUp,
  Layers,
  ArrowRight,
  Check,
  Building,
  Briefcase,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CAPathway } from '@ca-career-os/shared';

const PATHWAYS = [
  {
    pathway: CAPathway.AUDIT,
    name: 'Statutory Audit & Assurance',
    icon: Compass,
    description:
      'Companies Act 2013, Standards on Auditing (SAs), CARO 2020, and Ind AS 115/116 financial statement assurance for listed and large private enterprises.',
    hiringDemand: 'High (Big 4 & Top 20)',
    ctcRange: '₹14 - ₹24 LPA',
    roles: [
      'Senior Associate Audit',
      'Assistant Manager Assurance',
      'Technical Accounting Specialist',
    ],
    skills: ['Ind AS 115 / 116', 'CARO 2020 Reporting', 'ICFR Testing'],
  },
  {
    pathway: CAPathway.TAX,
    name: 'Direct Tax & Transfer Pricing',
    icon: FileCheck2,
    description:
      'Corporate taxation, Section 92C transfer pricing documentation, Form 3CD/3CEB certifications, and tax dispute resolution before appellate authorities.',
    hiringDemand: 'High (Big 4 & MNCs)',
    ctcRange: '₹15 - ₹26 LPA',
    roles: [
      'Corporate Tax Consultant',
      'Transfer Pricing Senior',
      'International Tax Specialist',
    ],
    skills: ['Section 92C Benchmarking', 'Form 3CD Certification', 'BEPS Pillar Two'],
  },
  {
    pathway: CAPathway.FPA,
    name: 'Financial Planning & Analysis',
    icon: TrendingUp,
    description:
      '12-month rolling forecasts, SaaS unit economics, variance attribution (Price-Volume-Mix), annual operating plans (AOP), and executive PowerBI dashboards.',
    hiringDemand: 'Very High (Tech & High-Growth)',
    ctcRange: '₹16 - ₹28 LPA',
    roles: [
      'FP&A Manager',
      'Corporate Finance Analyst',
      'Strategic Finance Lead',
    ],
    skills: ['Rolling Forecasts', 'Variance Attribution', 'Cohort Economics'],
  },
  {
    pathway: CAPathway.CORP_FIN,
    name: 'Corporate Finance & Valuation',
    icon: Layers,
    description:
      'ICAI Valuation Standards (IVS 301), DCF financial modeling, LBO scenarios, capital structure advisory, and debt syndication.',
    hiringDemand: 'Selective & Elite',
    ctcRange: '₹18 - ₹32 LPA',
    roles: [
      'Valuation Associate',
      'Corporate Finance Manager',
      'Treasury & Capital Markets Specialist',
    ],
    skills: ['DCF & Relative Valuation', 'IVS 301 Standards', 'LBO Modeling'],
  },
  {
    pathway: CAPathway.IB,
    name: 'Transaction Advisory & M&A Due Diligence',
    icon: Briefcase,
    description:
      'Quality of Earnings (QoE) reports, debt-like item identification, normalized working capital analyses, and target business financial health evaluations.',
    hiringDemand: 'High (PE & Advisory)',
    ctcRange: '₹18 - ₹35 LPA',
    roles: [
      'Financial Due Diligence Senior',
      'Transaction Advisory Manager',
      'M&A Associate',
    ],
    skills: ['Quality of Earnings (QoE)', 'Normalized Working Capital', 'SPA Negotiation'],
  },
  {
    pathway: CAPathway.CONSULTING,
    name: 'Management Consulting & CFO Advisory',
    icon: Award,
    description:
      'Finance target operating model (TOM) design, chart of accounts standardization, fast-close acceleration, and enterprise ERP transformation.',
    hiringDemand: 'Growing (Global Capability Centers)',
    ctcRange: '₹16 - ₹30 LPA',
    roles: [
      'Transformation Consultant',
      'CFO Advisory Senior',
      'Finance Business Partner',
    ],
    skills: ['Target Operating Model', 'Fast-Close Optimization', 'ERP Finance Architecture'],
  },
  {
    pathway: CAPathway.PRACTICE,
    name: 'Independent CA Public Practice',
    icon: Building,
    description:
      'Proprietorship and partnership accounting firms delivering statutory audits, GST compliances, internal audits, and direct tax advisory services.',
    hiringDemand: 'Entrepreneurial & Independent',
    ctcRange: '₹12 - ₹40+ LPA',
    roles: [
      'Managing Partner',
      'Audit Proprietor',
      'Senior Tax Practitioner',
    ],
    skills: ['Client Relationship OS', 'Statutory Compliance Vault', 'UDIN & Peer Review'],
  },
];

export function SevenHorizons() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activePathway = PATHWAYS[selectedIdx];
  const PathwayIcon = activePathway.icon;

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      const next = (idx + 1) % PATHWAYS.length;
      setSelectedIdx(next);
    } else if (e.key === 'ArrowLeft') {
      const prev = (idx - 1 + PATHWAYS.length) % PATHWAYS.length;
      setSelectedIdx(prev);
    }
  };

  return (
    <section
      id="pathways"
      className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full"
    >
      {/* Section Header */}
      <div className="text-center max-w-[700px] mx-auto mb-10 sm:mb-14">
        <span className="editorial-step">
          Specialized Horizons
        </span>
        <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold text-[#0F172A] tracking-tight leading-tight mt-2 mb-3">
          Specialized Horizons for Qualified CAs
        </h2>
        <p className="text-[16px] text-[#334155] leading-relaxed max-w-[65ch] mx-auto m-0">
          Discover tailored opportunities, hiring standards, and indicative compensation bands across 7 elite finance tracks.
        </p>
      </div>

      {/* Pill Tabs with Horizontal Scroll & Framer Motion LayoutId */}
      <div className="relative mb-8 max-w-[1040px] mx-auto">
        <div
          role="tablist"
          aria-label="7 Career Horizons"
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        >
          {PATHWAYS.map((p, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={p.pathway}
                role="tab"
                id={`tab-pathway-${idx}`}
                aria-selected={isSelected}
                aria-controls={`panel-pathway-${idx}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setSelectedIdx(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`relative px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isSelected ? 'text-white' : 'text-[#475569] bg-white border border-[#E2E8F0] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="activePathwayPill"
                    className="absolute inset-0 rounded-full bg-[#1E3A8A] shadow-sm -z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Detail Panel with Crossfade (No Carousel Arrows / Stacked Clipping) */}
      <div className="max-w-[1040px] mx-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden p-6 sm:p-8 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePathway.pathway}
            id={`panel-pathway-${selectedIdx}`}
            role="tabpanel"
            aria-labelledby={`tab-pathway-${selectedIdx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
            {/* Left 2 Cols: Main Details */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2F6] flex items-center justify-center text-[#1E3A8A] shrink-0">
                  <PathwayIcon size={20} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    Demand: {activePathway.hiringDemand}
                  </span>
                  <span className="text-[11px] text-[#64748B] italic">*(Indicative market trend)*</span>
                </div>
              </div>

              <div>
                <h3 className="text-[22px] sm:text-[26px] font-bold text-[#0F172A] leading-snug m-0 mb-2">
                  {activePathway.name}
                </h3>
                <p className="text-[15px] text-[#475569] leading-relaxed m-0">
                  {activePathway.description}
                </p>
              </div>

              {/* Core Skill Rubrics */}
              <div className="pt-2">
                <span className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider block mb-2">
                  Core Technical Rubrics
                </span>
                <div className="flex flex-wrap gap-2">
                  {activePathway.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#334155]"
                    >
                      <Check size={14} className="text-[#059669]" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Roles */}
              <div className="pt-2">
                <span className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider block mb-2">
                  Target Roles in this Horizon
                </span>
                <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] text-[#334155]">
                  {activePathway.roles.map((role, rIdx) => (
                    <li key={rIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right 1 Col: Compensation & CTA Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 flex flex-col justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Indicative CTC Range
                </span>
                <div className="text-[28px] font-extrabold text-[#0F172A] tracking-tight">
                  {activePathway.ctcRange}
                </div>
                <p className="text-[12px] text-[#64748B] mt-1 mb-4 leading-normal">
                  *(Indicative annual compensation for 0-4 years post-qualification experience across Tier-1/Metro centers)*
                </p>

                <div className="p-3 rounded-lg bg-white border border-[#E2E8F0] text-[12px] text-[#475569] space-y-1.5">
                  <div className="flex justify-between">
                    <span>Articleship Attestation:</span>
                    <span className="font-semibold text-[#059669]">Supported</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical STAR Drill:</span>
                    <span className="font-semibold text-[#1E3A8A]">Available</span>
                  </div>
                </div>
              </div>

              <Link
                href="/career"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold text-[14px] shadow-sm transition-all no-underline"
              >
                <span>Benchmark Your Fit</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
