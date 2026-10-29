'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  FileCheck2,
  MessageSquareCode,
  Calculator,
  Lock,
  Briefcase,
  Building,
  Users,
  TrendingUp,
  ArrowRight,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

const CAPABILITIES = [
  {
    id: 'career-intelligence',
    title: 'Career Intelligence & 7 Pathways',
    icon: Compass,
    badge: 'CORE ENGINE',
    badgeColor: 'text-[#1E3A8A] bg-[#EEF2F6] border-[#CBD5E1]',
    description: 'Transform articleship exposure into quantifiable capability benchmarks mapped to 7 high-impact CA career horizons.',
    highlights: [
      'Maps 36-month training across Audit, Tax & Advisory',
      '30/60/90-day milestone roadmap for lateral & campus hiring',
      'Highlights competency gaps against Big 4 senior associate criteria',
    ],
    ctaHref: '/career',
    ctaText: 'Explore Pathways',
    featured: true,
  },
  {
    id: 'resumes',
    title: 'Precision Tailored Resumes',
    icon: FileCheck2,
    badge: 'ACCURACY',
    badgeColor: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
    description: 'Role-targeted resume tailoring restricted strictly to genuine, verified training and project records.',
    highlights: [
      'Strict zero-exaggeration policy prevents inflated claims',
      'Format templates optimized for corporate ATS parsers',
    ],
    ctaHref: '/resumes',
    ctaText: 'Build Tailored Resume',
  },
  {
    id: 'interviews',
    title: 'Big 4 Mock Interview Simulator',
    icon: MessageSquareCode,
    badge: 'TECHNICAL DRILL',
    badgeColor: 'text-[#0284C7] bg-[#E0F2FE] border-[#BAE6FD]',
    description: 'Interactive case drills evaluating Ind AS 115, Ind AS 116, and transfer pricing under partner hiring rubrics.',
    highlights: [
      'STAR-method scoring with partner model answers',
      'Direct feedback on statutory reasoning and citation depth',
    ],
    ctaHref: '/interviews',
    ctaText: 'Practice Mock Drills',
  },
  {
    id: 'ctc',
    title: 'In-Hand Take-Home CTC Unbundler',
    icon: Calculator,
    badge: 'COMPENSATION',
    badgeColor: 'text-[#D97706] bg-[#FEF3C7] border-[#FDE68A]',
    description: 'Compute exact monthly net bank credit after New Tax Regime TDS and provident fund withholdings.',
    highlights: [
      'FY 2024-25 New Tax Regime vs Old Regime comparison',
      'Unbundles retention bonuses and employer PF contributions',
    ],
    ctaHref: '/career',
    ctaText: 'Calculate Net CTC',
  },
  {
    id: 'privacy',
    title: 'Confidential Career Search',
    icon: Lock,
    badge: 'CONFIDENTIALITY',
    badgeColor: 'text-[#1E3A8A] bg-[#EEF2F6] border-[#CBD5E1]',
    description: 'Total privacy controls protecting candidate profiles from being tracked by their current employer or colleagues.',
    highlights: [
      'Zero employer tracking during passive job discovery',
      'Granular visibility toggles for recruiters and firms',
    ],
    ctaHref: '/security',
    ctaText: 'Review Privacy Model',
  },
  {
    id: 'jobs',
    title: 'Verified Job Mandate Discovery',
    icon: Briefcase,
    badge: 'OPPORTUNITIES',
    badgeColor: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
    description: 'Access authenticated CA openings with transparent compensation bands and verified recruiter credentials.',
    highlights: [
      'Multi-source aggregator with direct employer postings',
      'Transparent budget disclosures on every listing',
    ],
    ctaHref: '/jobs',
    ctaText: 'Browse Open Mandates',
  },
  {
    id: 'practice',
    title: 'Practice Management Firm OS',
    icon: Building,
    badge: 'PUBLIC PRACTICE',
    badgeColor: 'text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]',
    description: 'Client master repository, compliance calendar, and UDIN/ARN tracking built for CA partnership firms.',
    highlights: [
      'ICAI Code of Ethics non-solicitation compliant',
      'Automated filing deadline reminders and document vault',
    ],
    ctaHref: '/practice',
    ctaText: 'Explore Practice OS',
  },
  {
    id: 'mentorship',
    title: '1-on-1 Senior CA Mentorship',
    icon: Users,
    badge: 'PEER GUIDANCE',
    badgeColor: 'text-[#0284C7] bg-[#E0F2FE] border-[#BAE6FD]',
    description: 'Book confidential 1-on-1 strategy calls with verified Big 4 partners and corporate finance directors.',
    highlights: [
      'Specialized track guidance for post-qualification CAs',
      'Portfolio and interview preparation reviews',
    ],
    ctaHref: '/career',
    ctaText: 'Connect with Mentors',
  },
  {
    id: 'financial-intel',
    title: 'Peer Financial Intelligence',
    icon: TrendingUp,
    badge: 'SALARY BENCHMARKS',
    badgeColor: 'text-[#D97706] bg-[#FEF3C7] border-[#FDE68A]',
    description: 'Real-time compensation benchmarks across audit, corporate finance, and consulting cohorts in India.',
    highlights: [
      'Aggregated cohort data across metro and tier-1 hubs',
      'Annual increment and bonus trends by qualification year',
    ],
    ctaHref: '/pricing',
    ctaText: 'View Benchmarks',
  },
];

export function CoreCapabilities() {
  return (
    <section
      id="features"
      className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full"
    >
      {/* Section Header */}
      <div className="text-center max-w-[700px] mx-auto mb-12 sm:mb-16">
        <span className="editorial-step">
          01 — CORE CAPABILITIES
        </span>
        <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold text-[#0F172A] tracking-tight leading-tight mt-2 mb-3">
          Engineered for Professional CA Rigor
        </h2>
        <p className="text-[16px] text-[#334155] leading-relaxed max-w-[65ch] mx-auto m-0">
          Full-stack articleship verification, Big 4 mock drills, and compensation analytics in one unified platform.
        </p>
      </div>

      {/* Responsive Bento Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CAPABILITIES.map((cap, idx) => {
          const Icon = cap.icon;
          const isFeatured = cap.featured;

          return (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group ${
                isFeatured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white via-white to-[#F0F4FA]' : ''
              }`}
            >
              <div>
                {/* Header: Icon Chip + Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#EEF2F6] flex items-center justify-center text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors shrink-0">
                    <Icon size={22} />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cap.badgeColor} tracking-wider uppercase`}
                  >
                    {cap.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[18px] sm:text-[19px] font-bold text-[#0F172A] mb-2 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                  {cap.title}
                </h3>

                {/* 2-line Description */}
                <p className="text-[14px] text-[#475569] leading-relaxed mb-4 line-clamp-2">
                  {cap.description}
                </p>

                {/* Bullet Highlights */}
                <ul className="list-none p-0 m-0 flex flex-col gap-2 mb-6 text-[13px] text-[#334155]">
                  {cap.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={15} className="text-[#059669] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Link */}
              <div className="pt-3 border-t border-[#E2E8F0] mt-auto">
                <Link
                  href={cap.ctaHref}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1E3A8A] hover:text-[#1E40AF] group-hover:gap-2 transition-all no-underline"
                >
                  <span>{cap.ctaText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
