'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  FileCheck2,
  Terminal,
  Calculator,
  Lock,
  ArrowRight,
  Check,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

const CAPABILITIES = [
  {
    id: 'career-intelligence',
    badge: 'CORE ENGINE',
    badgeColor: 'text-[#1E3A8A] bg-[#EEF2F6] border-[#CBD5E1]',
    iconBg: 'bg-[#EEF2F6] text-[#1E3A8A]',
    title: 'Career Intelligence & 7 Pathways',
    icon: Compass,
    description:
      'Transform articleship exposure into quantifiable capability benchmarks mapped to 7 high-impact CA career horizons.',
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
    badge: 'ACCURACY',
    badgeColor: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
    iconBg: 'bg-[#ECFDF5] text-[#059669]',
    title: 'Precision Tailored Resumes',
    icon: FileCheck2,
    description:
      'Role-targeted resume tailoring restricted strictly to genuine, verified training and project records.',
    highlights: [
      'Strict zero-exaggeration policy prevents inflated claims',
      'Format templates optimized for corporate ATS parsers',
    ],
    ctaHref: '/resumes',
    ctaText: 'Build Tailored Resume',
    featured: false,
  },
  {
    id: 'interviews',
    badge: 'TECHNICAL DRILL',
    badgeColor: 'text-[#0284C7] bg-[#E0F2FE] border-[#BAE6FD]',
    iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
    title: 'Big 4 Mock Interview Simulator',
    icon: Terminal,
    description:
      'Interactive case drills evaluating Ind AS 115, Ind AS 116, and transfer pricing under partner hiring rubrics.',
    highlights: [
      'STAR-method scoring with partner model answers',
      'Direct feedback on statutory reasoning and citation depth',
    ],
    ctaHref: '/interviews',
    ctaText: 'Practice Mock Drills',
    featured: false,
  },
  {
    id: 'ctc',
    badge: 'COMPENSATION',
    badgeColor: 'text-[#D97706] bg-[#FEF3C7] border-[#FDE68A]',
    iconBg: 'bg-[#FEF3C7] text-[#D97706]',
    title: 'In-Hand Take-Home CTC Unbundler',
    icon: Calculator,
    description:
      'Compute exact monthly net bank credit after New Tax Regime TDS and provident fund withholdings.',
    highlights: [
      'FY 2024-25 New Tax Regime vs Old Regime comparison',
      'Unbundles retention bonuses and employer PF contributions',
    ],
    ctaHref: '/career',
    ctaText: 'Calculate Net CTC',
    featured: false,
  },
  {
    id: 'privacy',
    badge: 'CONFIDENTIALITY',
    badgeColor: 'text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]',
    iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
    title: 'Confidential Career Search',
    icon: Lock,
    description:
      'Total privacy controls protecting candidate profiles from being tracked by their current employer or colleagues.',
    highlights: [
      'Zero employer tracking during passive job discovery',
      'Granular visibility toggles for recruiters and firms',
    ],
    ctaHref: '/security',
    ctaText: 'Review Privacy Model',
    featured: false,
  },
];

export function CoreCapabilities() {
  return (
    <div id="features" className="w-full flex flex-col items-center">
      {/* ================= PAGE 1: FULL-SCREEN STANDALONE STATEMENT ================= */}
      <section className="min-h-[85vh] sm:min-h-[90vh] w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-[1020px] mx-auto py-16 sm:py-24 relative">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEF2F6] border border-[#CBD5E1] text-[12px] sm:text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-6 shadow-2xs"
        >
          <Sparkles size={15} className="text-[#2563EB]" />
          <span>The CA Career Operating Stack</span>
        </motion.div>

        {/* Grand Animated Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold text-[#0F172A] tracking-tight leading-[1.12] m-0"
        >
          Engineered to Command Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#059669]">
            True Market Worth
          </span>
        </motion.h2>

        {/* Supporting Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="text-[clamp(1.05rem,1.4vw,1.3rem)] text-[#475569] leading-relaxed max-w-[62ch] mx-auto mt-6 mb-0"
        >
          From articleship benchmark diagnostics to Big 4 technical partner drills and verified take-home CTC calculations — five precision engines built exclusively for Indian Chartered Accountants.
        </motion.p>

        {/* Downward Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-12 sm:mt-16 flex flex-col items-center gap-2 text-[#64748B]"
        >
          <span className="text-[12px] font-bold tracking-wider uppercase text-[#1E3A8A]">
            Scroll to explore the 5 engines
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <ChevronDown size={22} className="text-[#1E3A8A]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ================= PAGE 2: THE 5 BENTO CAPABILITY BOXES ================= */}
      <section className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 pt-6 pb-24 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 w-full">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            const isFeatured = cap.featured;

            return (
              <motion.div
                key={cap.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`rounded-2xl border border-[#CBD5E1] bg-white p-6 sm:p-7 md:p-8 flex flex-col justify-between shadow-card hover:shadow-xl hover:-translate-y-1.5 hover:border-[#94A3B8] transition-all duration-300 group ${
                  isFeatured
                    ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white via-white to-[#F0F4FA]'
                    : ''
                }`}
              >
                <div>
                  {/* Header: Icon Chip + Status Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${cap.iconBg}`}
                    >
                      <Icon size={24} />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cap.badgeColor} tracking-wider uppercase shadow-2xs`}
                    >
                      {cap.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[19px] sm:text-[22px] font-bold text-[#0F172A] mb-3 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                    {cap.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] text-[#475569] leading-relaxed mb-6">
                    {cap.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="list-none p-0 m-0 flex flex-col gap-2.5 mb-6 text-[13px] text-[#334155]">
                    {cap.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={13} />
                        </div>
                        <span className="leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Link Button */}
                <div className="pt-4 border-t border-[#E2E8F0] mt-auto">
                  <Link
                    href={cap.ctaHref}
                    className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1E3A8A] hover:text-[#1E40AF] group/btn transition-colors no-underline"
                  >
                    <span>{cap.ctaText}</span>
                    <ArrowRight
                      size={15}
                      className="transform transition-transform group-hover/btn:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
