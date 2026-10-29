'use client';

import React, { useState } from 'react';
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
  TrendingUp,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CAPABILITIES = [
  {
    id: 'career-intelligence',
    badge: 'CORE ENGINE',
    badgeColor: 'text-[#1E3A8A] bg-[#EEF2F6] border-[#CBD5E1]',
    iconBg: 'bg-[#EEF2F6] text-[#1E3A8A]',
    title: 'Career Intelligence & 7 Pathways',
    icon: Compass,
    tagline: 'Articleship Capability Benchmarking',
    description:
      'Transform articleship exposure into quantifiable capability benchmarks mapped to 7 high-impact CA career horizons.',
    highlights: [
      'Maps 36-month training across Audit, Tax & Advisory',
      '30/60/90-day milestone roadmap for lateral & campus hiring',
      'Highlights competency gaps against Big 4 senior associate criteria',
    ],
    ctaHref: '/career',
    ctaText: 'Explore Pathways',
    previewType: 'radar',
  },
  {
    id: 'resumes',
    badge: 'ACCURACY',
    badgeColor: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
    iconBg: 'bg-[#ECFDF5] text-[#059669]',
    title: 'Precision Tailored Resumes',
    icon: FileCheck2,
    tagline: 'Zero-Exaggeration Attested Profiles',
    description:
      'Role-targeted resume tailoring restricted strictly to genuine, verified training and project records.',
    highlights: [
      'Strict zero-exaggeration policy prevents inflated claims',
      'Format templates optimized for corporate ATS parsers',
      'Pre-configured Ind AS & CARO 2020 terminology verification',
    ],
    ctaHref: '/resumes',
    ctaText: 'Build Tailored Resume',
    previewType: 'resume',
  },
  {
    id: 'interviews',
    badge: 'TECHNICAL DRILL',
    badgeColor: 'text-[#0284C7] bg-[#E0F2FE] border-[#BAE6FD]',
    iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
    title: 'Big 4 Mock Interview Simulator',
    icon: Terminal,
    tagline: 'Partner Technical Hiring Rubrics',
    description:
      'Interactive case drills evaluating Ind AS 115, Ind AS 116, and transfer pricing under partner hiring rubrics.',
    highlights: [
      'STAR-method scoring with partner model answers',
      'Direct feedback on statutory reasoning and citation depth',
      'Real-time timer & scenario curveball stress tests',
    ],
    ctaHref: '/interviews',
    ctaText: 'Practice Mock Drills',
    previewType: 'terminal',
  },
  {
    id: 'ctc',
    badge: 'COMPENSATION',
    badgeColor: 'text-[#D97706] bg-[#FEF3C7] border-[#FDE68A]',
    iconBg: 'bg-[#FEF3C7] text-[#D97706]',
    title: 'In-Hand Take-Home CTC Unbundler',
    icon: Calculator,
    tagline: 'FY 2024-25 Net Realized Cash Analytics',
    description:
      'Compute exact monthly net bank credit after New Tax Regime TDS and provident fund withholdings.',
    highlights: [
      'FY 2024-25 New Tax Regime vs Old Regime comparison',
      'Unbundles retention bonuses and employer PF contributions',
      'Detailed monthly bank credit projection breakdown',
    ],
    ctaHref: '/career',
    ctaText: 'Calculate Net CTC',
    previewType: 'ctc',
  },
  {
    id: 'privacy',
    badge: 'CONFIDENTIALITY',
    badgeColor: 'text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]',
    iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
    title: 'Confidential Career Search',
    icon: Lock,
    tagline: 'Cryptographic Privacy Shield',
    description:
      'Total privacy controls protecting candidate profiles from being tracked by their current employer or colleagues.',
    highlights: [
      'Zero employer tracking during passive job discovery',
      'Granular visibility toggles for recruiters and firms',
      'Cryptographic shielding on candidate identity data',
    ],
    ctaHref: '/security',
    ctaText: 'Review Privacy Model',
    previewType: 'privacy',
  },
];

function CardPreview({ type }: { type: string }) {
  if (type === 'radar') {
    return (
      <div className="w-full rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <span className="text-[12px] font-bold text-[#1E3A8A] uppercase tracking-wider">
            Articleship Competency Spectrum
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-bold border border-[#A7F3D0]">
            94% Big 4 Alignment
          </span>
        </div>

        <div className="space-y-3 text-[13px]">
          <div>
            <div className="flex justify-between text-[#334155] font-semibold mb-1">
              <span>Statutory Audit & Assurance (Ind AS 115/116)</span>
              <span className="text-[#1E3A8A] font-bold">18 Mo (50%)</span>
            </div>
            <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div className="h-full bg-[#1E3A8A] rounded-full w-[50%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#334155] font-semibold mb-1">
              <span>Direct Tax, Transfer Pricing & Appeals</span>
              <span className="text-[#059669] font-bold">10 Mo (28%)</span>
            </div>
            <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div className="h-full bg-[#059669] rounded-full w-[28%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#334155] font-semibold mb-1">
              <span>Financial Due Diligence & Valuations</span>
              <span className="text-[#0284C7] font-bold">8 Mo (22%)</span>
            </div>
            <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div className="h-full bg-[#0284C7] rounded-full w-[22%]" />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Total Verified Tenure: 36 Months</span>
          <span className="text-[#059669] font-bold">100% CARO 2020 Compliant</span>
        </div>
      </div>
    );
  }

  if (type === 'resume') {
    return (
      <div className="w-full rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-5 sm:p-6 flex flex-col gap-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <span className="text-[12px] font-bold text-[#059669] uppercase tracking-wider">
            Verified ATS Parser Attestation
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-bold border border-[#A7F3D0]">
            ATS Score: 98/100
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] text-[12px] text-[#334155] leading-relaxed">
          <strong className="text-[#0F172A] block mb-1">Statutory Audit Senior Associate Memo:</strong>
          &quot;Led CARO 2020 verification and Ind AS 115 revenue assessments across 3 listed clients with aggregate turnover exceeding ₹1,200 Cr.&quot;
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
          <span className="font-mono text-[#059669]">Zero Fabricated Bullets</span>
          <span className="font-mono">Ready for Partner Screen</span>
        </div>
      </div>
    );
  }

  if (type === 'terminal') {
    return (
      <div className="w-full rounded-2xl border border-[#CBD5E1] bg-[#0F172A] text-white p-5 sm:p-6 flex flex-col gap-3 shadow-inner">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-[#94A3B8]">
          <span>&gt; BIG 4 PARTNER TECHNICAL SIMULATION</span>
          <span className="text-[#34D399] font-mono">STAR 9.4/10</span>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[12px] text-[#E2E8F0] leading-relaxed">
          <span className="text-[#FBBF24] font-bold block mb-1">[Partner Question]:</span>
          How would you account for variable consideration under Ind AS 115 for contracts with volume rebates?
        </div>

        <div className="p-3 rounded-xl bg-[#1E3A8A]/30 border border-[#2563EB]/40 text-[12px] text-[#34D399] leading-relaxed font-mono">
          [Verdict]: Strong Hire — Accurately applied paragraph 56 reversal constraints.
        </div>
      </div>
    );
  }

  if (type === 'ctc') {
    return (
      <div className="w-full rounded-2xl border border-[#CBD5E1] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-[12px] font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1.5">
            <PieChart size={14} />
            Net Realized Compensation
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#059669]/20 text-[#34D399] text-[11px] font-mono border border-[#059669]/40">
            FY 2024-25
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="text-3xl font-black text-white">₹18.5 LPA</div>
            <div className="text-[11px] text-[#94A3B8]">Gross Annual CTC</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#34D399]">~₹1,18,500</div>
            <div className="text-[11px] text-[#A7F3D0]">Monthly Net Bank Credit</div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 text-[11px] text-[#94A3B8] flex justify-between">
          <span>TDS &amp; PF unbundled</span>
          <span className="text-[#34D399] font-bold">77.2% Net In-Hand</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-5 sm:p-6 flex flex-col gap-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <span className="text-[12px] font-bold text-[#7C3AED] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck size={14} />
          Cryptographic Candidate Shield
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] text-[11px] font-bold border border-[#DDD6FE]">
          100% Confidential
        </span>
      </div>

      <div className="space-y-2 text-[12px] text-[#334155]">
        <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-between">
          <span>Current Employer Tracking</span>
          <span className="text-[#DC2626] font-bold">BLOCKED</span>
        </div>
        <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-between">
          <span>Direct Recruiter Inbound</span>
          <span className="text-[#059669] font-bold">ANONYMIZED</span>
        </div>
      </div>
    </div>
  );
}

export function CoreCapabilities() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = CAPABILITIES.length;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  return (
    <div id="features" className="w-full flex flex-col items-center overflow-x-clip">
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

      {/* ================= PAGE 2: FULL-PAGE BOX WITH ARCHITECTURAL TOP-RIGHT DEEP CURVE ================= */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 pt-4 pb-24 sm:pb-32 flex flex-col items-center">
        {/* Navigation Category Pill Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          {CAPABILITIES.map((cap, idx) => {
            const isCurrent = activeIndex === idx;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all duration-200 cursor-pointer border ${
                  isCurrent
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md scale-105'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8]'
                }`}
              >
                <span>{`0${idx + 1}. ${cap.badge}`}</span>
              </button>
            );
          })}
        </div>

        {/* Full-Page Box Stacking Stage: Only Right Arrow on the right side */}
        <div className="relative w-full min-h-[580px] sm:min-h-[540px] flex items-center justify-center">
          {/* Prominent Floating Right Arrow on the Right Side Only */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next card (move stack to right)"
            className="absolute -right-3 sm:-right-6 lg:-right-7 top-1/2 -translate-y-1/2 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white shadow-[0_12px_35px_rgba(30,58,138,0.35)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white group/btn"
          >
            <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>

          {/* Full-Page Box Layered Stack (Right side peeking with signature deep top-right curve) */}
          <div className="relative w-full min-h-[580px] sm:min-h-[540px]">
            {CAPABILITIES.map((cap, idx) => {
              const diff = (idx - activeIndex + total) % total;
              const Icon = cap.icon;

              if (diff > 3) return null;

              const isFront = diff === 0;

              // Stack offsets:
              // diff 0 (front): x: 0, scale: 1
              // diff 1: x: 24px, scale: 0.97, opacity: 0.85
              // diff 2: x: 48px, scale: 0.94, opacity: 0.60
              // diff 3: x: 70px, scale: 0.91, opacity: 0.35
              const xOffset = diff * 24;
              const yOffset = diff * 8;
              const scale = 1 - diff * 0.03;
              const opacity = diff === 0 ? 1 : diff === 1 ? 0.85 : diff === 2 ? 0.6 : 0.35;
              const zIndex = 40 - diff * 10;

              return (
                <motion.div
                  key={cap.id}
                  onClick={() => {
                    if (!isFront) handleNext();
                  }}
                  initial={false}
                  animate={{
                    x: xOffset,
                    y: yOffset,
                    scale: scale,
                    opacity: opacity,
                    zIndex: zIndex,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    transformOrigin: 'left center',
                    // Signature Asymmetrical Curve: Top-Right is very deeply curved (96px), other 3 corners normal (24px)
                    borderRadius: '24px 96px 24px 24px',
                  }}
                  className={`absolute inset-0 w-full bg-white border border-[#CBD5E1] p-6 sm:p-9 lg:p-12 flex flex-col justify-between transition-shadow select-none overflow-hidden ${
                    isFront
                      ? 'shadow-[0_24px_60px_rgba(15,23,42,0.14)] cursor-default'
                      : 'shadow-xl cursor-pointer hover:opacity-95'
                  }`}
                >
                  {/* Subtle decorative radial tint in top right curve */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-40 bg-gradient-to-br from-[#1E3A8A]/10 to-[#059669]/10 blur-2xl"
                  />

                  {/* Top Bar: Icon + Badge + Counter */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E2E8F0] mb-6 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${cap.iconBg} shadow-2xs border border-[#CBD5E1]`}
                      >
                        <Icon size={26} />
                      </div>
                      <div>
                        <span
                          className={`text-[12px] font-bold px-3.5 py-1 rounded-full border ${cap.badgeColor} tracking-wider uppercase inline-block shadow-2xs`}
                        >
                          {cap.badge}
                        </span>
                        <span className="text-[13px] text-[#64748B] block mt-0.5 font-medium">
                          {cap.tagline}
                        </span>
                      </div>
                    </div>

                    <div className="text-[14px] font-bold font-mono text-[#0F172A] bg-[#F1F5F9] px-4 py-1.5 rounded-xl border border-[#CBD5E1] shadow-2xs">
                      ENGINE 0{idx + 1} / 0{total}
                    </div>
                  </div>

                  {/* Main Full-Page Box Content: 2-Column Executive Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto relative z-10">
                    {/* Left Column: Title, Description, and Verified Highlights */}
                    <div className="lg:col-span-6 flex flex-col gap-4">
                      <h3 className="text-[24px] sm:text-[30px] lg:text-[34px] font-black text-[#0F172A] tracking-tight leading-snug m-0">
                        {cap.title}
                      </h3>

                      <p className="text-[15px] sm:text-[16px] text-[#475569] leading-relaxed m-0">
                        {cap.description}
                      </p>

                      <ul className="list-none p-0 m-0 flex flex-col gap-3 my-2 text-[14px] text-[#334155]">
                        {cap.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <Check size={13} />
                            </div>
                            <span className="leading-snug">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: High-End Live Interactive Preview Visual */}
                    <div className="lg:col-span-6 flex justify-center items-center">
                      <CardPreview type={cap.previewType} />
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 mt-auto relative z-10">
                    <Link
                      href={cap.ctaHref}
                      className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline group/link"
                    >
                      <span>{cap.ctaText}</span>
                      <ArrowRight
                        size={16}
                        className="group-hover/link:translate-x-1.5 transition-transform"
                      />
                    </Link>

                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#059669]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#059669] shadow-2xs" />
                      <span>Verified Indian CA Architecture</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Progress Tracker Dots */}
        <div className="flex items-center justify-center gap-3 mt-10 sm:mt-12">
          {CAPABILITIES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Jump to engine 0${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === i
                  ? 'w-10 bg-[#1E3A8A]'
                  : 'w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
