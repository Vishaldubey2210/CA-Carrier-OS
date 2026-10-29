'use client';

import React, { useState } from 'react';
import {
  Lock,
  FileCheck2,
  Award,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOVERNANCE_ITEMS = [
  {
    id: 'privacy',
    icon: Lock,
    title: 'Confidential Career Privacy',
    badge: 'PRIVACY',
    tagline: 'Zero Employer Visibility',
    description:
      'Complete privacy separation between candidate profiles and employer directories. Recruiters from your current employer can never search, inspect, or track your career exploration.',
    badgeColor: 'text-[#1E3A8A] bg-white border-[#BFDBFE]',
    accentColor: '#1E3A8A',
    bgGradient: 'bg-gradient-to-br from-[#EFF6FF] via-white to-[#DBEAFE]',
    borderColor: 'border-[#93C5FD]',
    iconBg: 'bg-[#1E3A8A] text-white',
    trustNote: 'Zero Employer Directory Tracking • 100% Confidential',
  },
  {
    id: 'accuracy',
    icon: FileCheck2,
    title: 'Verified Career Profiles',
    badge: 'ACCURACY',
    tagline: 'Zero-Fabrication Policy',
    description:
      'Resume tailoring is strictly bounded to verified, authentic training and project records. Our platform refuses to invent unearned credentials or inflated metrics.',
    badgeColor: 'text-[#059669] bg-white border-[#A7F3D0]',
    accentColor: '#059669',
    bgGradient: 'bg-gradient-to-br from-[#ECFDF5] via-white to-[#D1FAE5]',
    borderColor: 'border-[#6EE7B7]',
    iconBg: 'bg-[#059669] text-white',
    trustNote: 'Attested Training Records • Ind AS & CARO Validation',
  },
  {
    id: 'compliance',
    icon: Award,
    title: 'ICAI Ethical Grounding',
    badge: 'COMPLIANCE',
    tagline: 'Non-Solicitation Norms',
    description:
      'Adherence to ICAI Code of Ethics Clauses 6 and 7 of Part I of the First Schedule. Practice tools respect non-solicitation norms while tracking compliances and peer-review working papers.',
    badgeColor: 'text-[#7C3AED] bg-white border-[#DDD6FE]',
    accentColor: '#7C3AED',
    bgGradient: 'bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE]',
    borderColor: 'border-[#C4B5FD]',
    iconBg: 'bg-[#7C3AED] text-white',
    trustNote: 'ICAI Code of Ethics Part I First Schedule Compliant',
  },
  {
    id: 'transparency',
    icon: ShieldCheck,
    title: 'Explainable Match Rubrics',
    badge: 'TRANSPARENCY',
    tagline: 'No Black-Box Algorithms',
    description:
      'No black-box rejection algorithms. Every job match and technical case evaluation displays transparent statutory rubrics and detailed skill matrices so you always know where you stand.',
    badgeColor: 'text-[#D97706] bg-white border-[#FDE68A]',
    accentColor: '#D97706',
    bgGradient: 'bg-gradient-to-br from-[#FFFBEB] via-white to-[#FEF3C7]',
    borderColor: 'border-[#FCD34D]',
    iconBg: 'bg-[#D97706] text-white',
    trustNote: 'Deterministic Match Scoring • Transparent Criteria',
  },
];

export function PurposeGovernance() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = GOVERNANCE_ITEMS.length;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <section
      id="about"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1360px] mx-auto w-full overflow-x-clip"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* ================= LEFT HALF: HEADLINE & EDITORIAL MANIFESTO ================= */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2F6] border border-[#CBD5E1] text-[12px] font-bold text-[#1E3A8A] uppercase tracking-wider w-fit shadow-2xs">
            <Sparkles size={14} className="text-[#2563EB]" />
            <span>Ethical Foundation &amp; Governance</span>
          </div>

          {/* Big High-Impact Headline */}
          <h2 className="text-[clamp(2.1rem,4vw,3.25rem)] font-extrabold text-[#0F172A] tracking-tight leading-[1.15] m-0">
            Built for Professional Rigor &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#059669]">
              Ethical Trust
            </span>
          </h2>

          {/* Subheading / Description */}
          <p className="text-[16px] sm:text-[18px] text-[#475569] leading-relaxed max-w-[54ch] m-0">
            Empowering Indian Chartered Accountants with objective career diagnostics, verified credentials, and complete privacy.
          </p>

          {/* 3 Core Trust Pillars List */}
          <div className="flex flex-col gap-3.5 pt-2 text-[14px] text-[#334155]">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#0F172A]">Complete Candidate Anonymity:</strong> Zero employer tracking ensures safe exploration while in active employment.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#0F172A]">Zero Exaggeration Engine:</strong> Resumes strictly tied to validated articleship working papers.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#0F172A]">ICAI Statutory Alignment:</strong> 100% compliant with non-solicitation code and professional norms.
              </span>
            </div>
          </div>

          {/* Interactive Stack Controls Indicator */}
          <div className="pt-4 flex items-center gap-4">
            <span className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider">
              {`Pillar 0${activeIndex + 1} of 0${total}`}
            </span>
            <div className="flex items-center gap-2">
              {GOVERNANCE_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to ${item.badge}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? 'w-7 bg-[#1E3A8A]'
                      : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT HALF: 4-CARD STACK (LEFT TO RIGHT WITH RIGHT ARROW) ================= */}
        <div className="lg:col-span-6 flex items-center gap-4 sm:gap-6">
          {/* Stack Container */}
          <div className="relative flex-1 min-h-[420px] sm:min-h-[440px]">
            {GOVERNANCE_ITEMS.map((item, idx) => {
              const diff = (idx - activeIndex + total) % total;
              const Icon = item.icon;

              if (diff > 3) return null;

              const isFront = diff === 0;

              // Stack offsets from left to right:
              // diff 0: x: 0, scale: 1
              // diff 1: x: 22px, scale: 0.96, opacity: 0.85
              // diff 2: x: 44px, scale: 0.92, opacity: 0.60
              // diff 3: x: 64px, scale: 0.88, opacity: 0.35
              const xOffset = diff * 22;
              const yOffset = diff * 10;
              const scale = 1 - diff * 0.04;
              const opacity = diff === 0 ? 1 : diff === 1 ? 0.85 : diff === 2 ? 0.6 : 0.35;
              const zIndex = 40 - diff * 10;

              return (
                <motion.div
                  key={item.id}
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
                    // Signature curved top-right scoop
                    borderRadius: '24px 64px 24px 24px',
                  }}
                  className={`absolute inset-0 w-full p-6 sm:p-8 flex flex-col justify-between border ${
                    item.borderColor
                  } ${item.bgGradient} transition-shadow select-none overflow-hidden ${
                    isFront
                      ? 'shadow-[0_20px_50px_rgba(15,23,42,0.12)] cursor-default'
                      : 'shadow-md cursor-pointer hover:opacity-95'
                  }`}
                >
                  {/* Decorative background radial tint */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none opacity-30 blur-2xl"
                    style={{ background: item.accentColor }}
                  />

                  {/* Card Header: Icon + Badge + Counter */}
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-black/10 relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} shadow-sm`}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <span
                          className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${item.badgeColor} tracking-wider uppercase inline-block shadow-2xs`}
                        >
                          {item.badge}
                        </span>
                        <span className="text-[12px] text-[#475569] block font-medium mt-0.5">
                          {item.tagline}
                        </span>
                      </div>
                    </div>

                    <div className="text-[13px] font-bold font-mono text-[#0F172A] bg-white/80 px-3 py-1 rounded-lg border border-black/10">
                      0{idx + 1} / 0{total}
                    </div>
                  </div>

                  {/* Card Body: Title & Detailed Description */}
                  <div className="my-auto relative z-10 py-2">
                    <h3 className="text-[20px] sm:text-[23px] font-extrabold text-[#0F172A] mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[14px] sm:text-[15px] text-[#334155] leading-relaxed m-0">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer: Distinct Trust Note */}
                  <div className="pt-4 border-t border-black/10 flex items-center justify-between text-[12px] font-semibold text-[#0F172A] relative z-10">
                    <span className="flex items-center gap-1.5" style={{ color: item.accentColor }}>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: item.accentColor }}
                      />
                      <span>{item.trustNote}</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Arrow: Sits beside the box on the right, does NOT overlap the box */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Governance Pillar"
            className="shrink-0 w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white shadow-[0_10px_25px_rgba(30,58,138,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white group/btn"
          >
            <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
