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
  ArrowLeft,
  Check,
  Sparkles,
  ChevronDown,
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
    accentColor: '#1E3A8A',
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
    accentColor: '#059669',
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
    accentColor: '#0284C7',
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
    accentColor: '#D97706',
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
    accentColor: '#7C3AED',
  },
];

export function CoreCapabilities() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'right' | 'left'>('right');

  const total = CAPABILITIES.length;

  const handleNext = () => {
    setExitDirection('right');
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setExitDirection('left');
    setActiveIndex((prev) => (prev - 1 + total) % total);
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

      {/* ================= PAGE 2: HORIZONTAL STACK CARDS DECK (LEFT TO RIGHT) ================= */}
      <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 pb-24 sm:pb-32 flex flex-col items-center">
        {/* Navigation Category Pill Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {CAPABILITIES.map((cap, idx) => {
            const isCurrent = activeIndex === idx;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => {
                  setExitDirection(idx > activeIndex ? 'right' : 'left');
                  setActiveIndex(idx);
                }}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all duration-200 cursor-pointer border ${
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

        {/* Stack Stage Wrapper with Floating Right Arrow */}
        <div className="relative w-full max-w-[920px] min-h-[460px] sm:min-h-[440px] flex items-center justify-center">
          {/* Floating Right Arrow Button to flip card to right */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next card (move stack to right)"
            className="absolute -right-3 sm:-right-6 md:-right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white group/btn"
          >
            <ArrowRight size={22} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          {/* Floating Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous card"
            className="absolute -left-3 sm:-left-6 md:-left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-[#F8FAFC] text-[#1E3A8A] border-2 border-[#CBD5E1] hover:border-[#1E3A8A] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group/btn"
          >
            <ArrowLeft size={22} className="group-hover/btn:-translate-x-0.5 transition-transform" />
          </button>

          {/* The Layered Left-to-Right Card Stack */}
          <div className="relative w-full h-[480px] sm:h-[460px] overflow-visible">
            {CAPABILITIES.map((cap, idx) => {
              // Calculate distance from active card in circular ring
              const diff = (idx - activeIndex + total) % total;
              const Icon = cap.icon;

              // Only render visible layers: active (0) and 3 cards stacked towards the right
              if (diff > 3) return null;

              const isFront = diff === 0;

              // Left-to-right stacking offsets
              // diff 0: x: 0, scale: 1
              // diff 1: x: 28px, scale: 0.96, opacity: 0.88 (peeks on the right)
              // diff 2: x: 56px, scale: 0.92, opacity: 0.65 (peeks further right)
              // diff 3: x: 82px, scale: 0.88, opacity: 0.40
              const xOffset = diff * 28;
              const yOffset = diff * 8;
              const scale = 1 - diff * 0.04;
              const opacity = diff === 0 ? 1 : diff === 1 ? 0.88 : diff === 2 ? 0.65 : 0.4;
              const zIndex = 40 - diff * 10;

              return (
                <motion.div
                  key={cap.id}
                  onClick={() => {
                    if (!isFront) {
                      handleNext();
                    }
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
                  }}
                  className={`absolute inset-0 rounded-3xl border border-[#CBD5E1] bg-white p-6 sm:p-8 md:p-9 flex flex-col justify-between transition-shadow select-none ${
                    isFront
                      ? 'shadow-[0_24px_60px_rgba(15,23,42,0.14)] cursor-default'
                      : 'shadow-lg cursor-pointer hover:opacity-95'
                  }`}
                >
                  <div>
                    {/* Header Row: Icon + Badge + Deck Counter */}
                    <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cap.iconBg} shadow-2xs`}
                        >
                          <Icon size={24} />
                        </div>
                        <div>
                          <span
                            className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cap.badgeColor} tracking-wider uppercase inline-block`}
                          >
                            {cap.badge}
                          </span>
                          <span className="text-[12px] text-[#64748B] block mt-0.5 font-medium">
                            {cap.tagline}
                          </span>
                        </div>
                      </div>

                      <div className="text-[13px] font-bold font-mono text-[#64748B] bg-[#F1F5F9] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                        0{idx + 1} / 0{total}
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-[21px] sm:text-[25px] font-extrabold text-[#0F172A] mb-3 leading-snug">
                      {cap.title}
                    </h3>

                    {/* Card Description */}
                    <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed mb-6">
                      {cap.description}
                    </p>

                    {/* Verified Highlights */}
                    <ul className="list-none p-0 m-0 flex flex-col gap-2.5 mb-6 text-[13px] sm:text-[14px] text-[#334155]">
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

                  {/* Footer Action Bar */}
                  <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 mt-auto">
                    <Link
                      href={cap.ctaHref}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-[14px] shadow-sm hover:shadow-md transition-all no-underline group/link"
                    >
                      <span>{cap.ctaText}</span>
                      <ArrowRight
                        size={15}
                        className="group-hover/link:translate-x-1 transition-transform"
                      />
                    </Link>

                    <span className="text-[12px] font-semibold text-[#059669] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#059669]" />
                      <span>Verified Indian CA Architecture</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stack Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-4 mt-8 sm:mt-10">
          <div className="flex items-center gap-2.5">
            {CAPABILITIES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setExitDirection(i > activeIndex ? 'right' : 'left');
                  setActiveIndex(i);
                }}
                aria-label={`Jump to engine 0${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? 'w-9 bg-[#1E3A8A]'
                    : 'w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 text-[13px] text-[#64748B]">
            <span>Click the right arrow to slide the card and reveal the next engine</span>
          </div>
        </div>
      </section>
    </div>
  );
}
