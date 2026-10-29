'use client';

import React, { useRef } from 'react';
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
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface StackingCardProps {
  index: number;
  total: number;
  id: string;
  children: React.ReactNode;
}

function StackingCardItem({ index, total, id, children }: StackingCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLast = index === total - 1;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80px', 'end 80px'],
  });

  // Card stays pinned at top 80px; fades and scales slightly down as the next card scrolls over it
  const scale = useTransform(scrollYProgress, [0, 0.7, 1], isLast ? [1, 1, 1] : [1, 0.98, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.55, 1], isLast ? [1, 1, 1] : [1, 0.85, 0.3]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="relative w-full"
      style={{
        // Height allows ample scroll runway for each card to stay pinned before the next arrives
        minHeight: isLast ? 'auto' : '100vh',
        paddingBottom: isLast ? '0px' : '6vh',
      }}
    >
      <div
        className="sticky top-[80px] w-full"
        style={{
          zIndex: 10 + index,
        }}
      >
        <motion.div
          style={{
            scale,
            opacity,
            borderRadius: '28px 72px 28px 28px',
          }}
          className="w-full bg-white border border-[#CBD5E1] shadow-[0_25px_60px_rgba(15,23,42,0.12)] p-6 sm:p-8 md:p-10 lg:p-12 overflow-hidden transition-all duration-300 hover:shadow-[0_30px_70px_rgba(15,23,42,0.16)]"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const { isAuthenticated, user, demoLogin } = useAuth();
  const router = useRouter();

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
    <section className="relative pt-6 sm:pt-10 pb-16 px-3 sm:px-6 max-w-[1360px] mx-auto w-full flex flex-col items-center">
      {/* Subtle radial gradient glow behind hero */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[540px] pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(30, 58, 138, 0.08) 0%, rgba(5, 150, 105, 0.04) 45%, transparent 70%)',
          filter: 'blur(75px)',
        }}
      />

      {/* Hero Header Content */}
      <div className="flex flex-col items-center text-center max-w-[880px] mx-auto gap-4 sm:gap-5 mb-12 sm:mb-16">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        >
          {isAuthenticated ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2F6] border border-[#CBD5E1] text-[13px] text-[#1E3A8A] font-semibold">
              <span>Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Member'}</span>
              <span className="text-[#94A3B8]">•</span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-[#1E3A8A] hover:underline"
              >
                Dashboard <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2F6] border border-[#CBD5E1] text-[13px] text-[#1E3A8A] font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0" />
              <span>Built for Indian Chartered Accountants</span>
            </div>
          )}
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          className="text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold text-[#0F172A] tracking-tight leading-[1.12] m-0"
        >
          The Modern Career Platform for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#059669]">
            Chartered Accountants
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="text-[clamp(1rem,1.25vw,1.15rem)] text-[#334155] leading-relaxed max-w-[68ch] m-0"
        >
          Benchmark your skills across 7 specialized career horizons, prepare for Big 4 technical interviews,
          and discover verified finance opportunities with complete confidentiality.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <button
            type="button"
            onClick={handleLaunchDemo}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer min-h-[46px]"
          >
            <span>Explore Demo</span>
            <ArrowRight size={16} />
          </button>

          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#334155] font-semibold text-[15px] border border-[#CBD5E1] shadow-2xs hover:border-[#94A3B8] transition-all no-underline min-h-[46px]"
          >
            Create Free Account
          </Link>
        </motion.div>
      </div>

      {/* Large Stacking Cards Section (Career Diagnostic, Smart Resume, Interview Preparation, Take-Home CTC) */}
      <div className="w-full max-w-[1280px] flex flex-col">
        {/* ================= CARD 1: CAREER DIAGNOSTIC ================= */}
        <StackingCardItem index={0} total={4} id="card-diagnostic">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E2E8F0] mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2F6] text-[#1E3A8A] flex items-center justify-center font-bold text-[15px] shadow-2xs">
                01
              </div>
              <div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-[#0F172A] m-0 leading-snug">
                  Career Diagnostic
                </h3>
                <span className="text-[13px] text-[#64748B]">
                  Competency benchmark &amp; pathway fit analysis
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[12px] font-bold text-[#059669]">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <span>94% High Big 4 Alignment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Text & Structured Data */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <span className="text-[12px] font-bold text-[#1E3A8A] tracking-wider uppercase">
                Experience &amp; Skills Match
              </span>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black text-[#0F172A] tracking-tight">
                  94%
                </span>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-[#059669]">
                    High Big 4 Alignment
                  </span>
                  <span className="text-[12px] text-[#64748B]">
                    Top 6th percentile in India
                  </span>
                </div>
              </div>

              <p className="text-[15px] text-[#475569] leading-relaxed m-0">
                Articleship training benchmarked against Companies Act 2013 and CARO 2020 assurance criteria.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-lg bg-[#F1F5F9] text-[12px] font-semibold text-[#334155] border border-[#E2E8F0]">
                  CARO 2020 Tested
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#F1F5F9] text-[12px] font-semibold text-[#334155] border border-[#E2E8F0]">
                  ICFR Sign-Offs
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#F1F5F9] text-[12px] font-semibold text-[#334155] border border-[#E2E8F0]">
                  Listed Client Exposure
                </span>
              </div>

              {/* Progress Breakdown */}
              <div className="flex flex-col gap-3.5 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] mt-1">
                <div>
                  <div className="flex justify-between text-[13px] font-bold text-[#334155] mb-1.5">
                    <span>Statutory Audit &amp; Assurance (Ind AS 115/116)</span>
                    <span className="text-[#1E3A8A] font-extrabold">18 Months (50%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full bg-[#1E3A8A] rounded-full w-[50%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] font-bold text-[#334155] mb-1.5">
                    <span>Direct Tax, Corporate Advisory &amp; Transfer Pricing</span>
                    <span className="text-[#059669] font-extrabold">10 Months (28%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full bg-[#059669] rounded-full w-[28%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] font-bold text-[#334155] mb-1.5">
                    <span>Financial Due Diligence &amp; M&amp;A Advisory</span>
                    <span className="text-[#0284C7] font-extrabold">8 Months (22%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div className="h-full bg-[#0284C7] rounded-full w-[22%]" />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[12px] text-[#64748B]">
                  <span>Total Documented Tenure: 36 Months</span>
                  <span className="text-[#059669] font-bold">100% Validated</span>
                </div>
              </div>
            </div>

            {/* Right Column: Relevant Dashboard Image */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#CBD5E1] shadow-lg group bg-[#0F172A]">
                <img
                  src="/assets/career-diagnostic.jpg"
                  alt="Career Diagnostic Dashboard & Competency Spectrum"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#0F172A]/85 backdrop-blur-md text-white text-[11px] font-mono border border-white/20">
                  Live Diagnostic Radar
                </div>
              </div>
            </div>
          </div>
        </StackingCardItem>

        {/* ================= CARD 2: SMART RESUME ================= */}
        <StackingCardItem index={1} total={4} id="card-resume">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E2E8F0] mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-[15px] shadow-2xs">
                02
              </div>
              <div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-[#0F172A] m-0 leading-snug">
                  Smart Resume
                </h3>
                <span className="text-[13px] text-[#64748B]">
                  ATS-optimized, zero-fabrication attested resume builder
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[12px] font-bold text-[#1E3A8A]">
              <FileCheck2 size={15} className="text-[#1E3A8A]" />
              <span>Ready for Big 4 Partners</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Text & Attested Bullet Points */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-[17px] font-extrabold text-[#0F172A] m-0">
                    Statutory Audit Senior Associate Profile
                  </h4>
                  <p className="text-[13px] text-[#64748B] m-0 mt-0.5">
                    Targeting: Big 4 Audit Practices &amp; Global Accounting Networks
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-[#ECFDF5] text-[#059669] text-[11px] font-bold border border-[#A7F3D0]">
                  VERIFIED ATTESTATION
                </span>
              </div>

              {/* Verified Bullet Points */}
              <div className="space-y-3 text-[14px] text-[#334155] leading-relaxed bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0]">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <p className="m-0 text-[#334155]">
                    <strong className="text-[#0F172A]">Statutory Audit Leadership:</strong> Led audit engagements for 3 listed manufacturing clients with aggregate turnover exceeding ₹1,200 Cr under Ind AS 115, Ind AS 116, and CARO 2020.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <p className="m-0 text-[#334155]">
                    <strong className="text-[#0F172A]">ICFR Internal Controls:</strong> Evaluated Internal Financial Controls over Financial Reporting (IFCoFR) across order-to-cash, procure-to-pay, and inventory cycles, reporting zero critical deficiencies.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <p className="m-0 text-[#334155]">
                    <strong className="text-[#0F172A]">Executive Communication:</strong> Formulated audit committee technical memos and presented key accounting judgments to board audit committees and partner review panels.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#64748B]">
                <div className="flex items-center gap-1.5 text-[#059669] font-semibold">
                  <Check size={14} />
                  <span>Every bullet point validated against actual training documentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] font-mono font-bold text-[#334155]">
                    PDF Export Ready
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-mono font-bold text-[#059669]">
                    ATS Score: 98/100
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Relevant Resume Mockup Image */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#CBD5E1] shadow-lg group bg-[#0F172A]">
                <img
                  src="/assets/smart-resume.jpg"
                  alt="Smart Resume ATS Score & Attested Document Preview"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#0F172A]/85 backdrop-blur-md text-white text-[11px] font-mono border border-white/20">
                  ATS Verified Score: 98/100
                </div>
              </div>
            </div>
          </div>
        </StackingCardItem>

        {/* ================= CARD 3: INTERVIEW PREPARATION ================= */}
        <StackingCardItem index={2} total={4} id="card-interview">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E2E8F0] mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2F6] text-[#1E3A8A] flex items-center justify-center font-bold text-[15px] shadow-2xs">
                03
              </div>
              <div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-[#0F172A] m-0 leading-snug">
                  Interview Preparation
                </h3>
                <span className="text-[13px] text-[#64748B]">
                  Technical partner simulator with STAR rubric scoring
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2F6] border border-[#CBD5E1] text-[12px] font-bold text-[#1E3A8A]">
              <Terminal size={15} className="text-[#1E3A8A]" />
              <span>Case: Ind AS 115 Revenue Recognition</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Terminal Question & Candidate Response */}
            <div className="lg:col-span-6 flex flex-col gap-3.5">
              <div className="bg-[#0F172A] text-white p-5 sm:p-6 rounded-2xl font-mono text-[13px] leading-relaxed flex flex-col gap-3 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-[#94A3B8]">
                  <span>&gt; BIG 4 PARTNER TECHNICAL SIMULATION</span>
                  <span className="text-[#34D399]">ACTIVE DRILL SESSION</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[#CBD5E1]">
                  <span className="text-[#FBBF24] font-bold block mb-1">
                    [Partner Case Question]:
                  </span>
                  &quot;A manufacturing client sells equipment with a 2-year maintenance warranty and uncertain volume rebates. How would you account for the variable consideration under Ind AS 115?&quot;
                </div>

                <div className="p-3.5 rounded-xl bg-[#1E3A8A]/30 border border-[#2563EB]/40 text-[#E2E8F0]">
                  <span className="text-[#34D399] font-bold block mb-1">
                    [Candidate Verified Response]:
                  </span>
                  &quot;Under Ind AS 115 paragraph 56, variable consideration is included in transaction price only to the extent that it is highly probable that a significant reversal in cumulative revenue recognized will not occur when uncertainty is resolved. The warranty must be evaluated separately as an assurance vs. service obligation under paragraph B29.&quot;
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#34D399] font-bold">Technical Score: 9.4 / 10</span>
                    <span className="text-white/40">•</span>
                    <span className="text-[#FBBF24]">Verdict: Top 5% of Candidates</span>
                  </div>
                  <span className="text-[#A5B4FC] text-[11px]">
                    STAR Rubric: Complete Situation, Task, Action &amp; Resolution
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Relevant Terminal Mockup Image */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#CBD5E1] shadow-lg group bg-[#0F172A]">
                <img
                  src="/assets/interview-drill.jpg"
                  alt="Big 4 Technical Interview Drill Terminal Interface"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#0F172A]/85 backdrop-blur-md text-[#34D399] text-[11px] font-mono border border-white/20">
                  STAR Rubric: 9.4/10 Strong Hire
                </div>
              </div>
            </div>
          </div>
        </StackingCardItem>

        {/* ================= CARD 4: TAKE-HOME CTC ================= */}
        <StackingCardItem index={3} total={4} id="card-ctc">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E2E8F0] mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-[15px] shadow-2xs">
                04
              </div>
              <div>
                <h3 className="text-[19px] sm:text-[22px] font-bold text-[#0F172A] m-0 leading-snug">
                  Take-Home CTC
                </h3>
                <span className="text-[13px] text-[#64748B]">
                  Unbundled in-hand compensation analytics (FY 2024-25 New Tax Regime)
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[12px] font-bold text-[#059669]">
              <Calculator size={15} />
              <span>₹1,18,500 / month Net Credit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: CTC Metrics & Breakdown Table */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <span className="text-[12px] font-bold text-[#1E3A8A] tracking-wider uppercase">
                Annual In-Hand Net Take-Home
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-[#0F172A] tracking-tight">
                  ₹18.5
                </span>
                <span className="text-2xl font-bold text-[#64748B]">LPA</span>
              </div>

              <div className="inline-flex items-center gap-2 text-[14px] font-bold text-[#059669] bg-[#ECFDF5] px-3.5 py-1.5 rounded-lg border border-[#A7F3D0] w-fit">
                <span>~₹1,18,500 / month net bank credit</span>
              </div>

              <p className="text-[14px] text-[#475569] leading-relaxed m-0">
                Calculated under FY 2024-25 New Tax Regime with standard deduction, employee PF contributions, and performance bonus pacing.
              </p>

              {/* Table Breakdown */}
              <div className="bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] flex flex-col gap-2.5 text-[13px]">
                <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                  <span className="text-[#475569] font-medium">Annual Gross Base Salary:</span>
                  <span className="font-bold text-[#0F172A]">₹16,50,000</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                  <span className="text-[#475569] font-medium">Annual Performance Bonus &amp; Retention:</span>
                  <span className="font-bold text-[#059669]">₹2,00,000</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                  <span className="text-[#475569] font-medium">Monthly Employee PF &amp; Gratuity:</span>
                  <span className="font-bold text-[#DC2626]">-₹16,500</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E2E8F0]">
                  <span className="text-[#475569] font-medium">Estimated Monthly TDS (New Regime):</span>
                  <span className="font-bold text-[#DC2626]">-₹14,200</span>
                </div>
                <div className="flex justify-between pt-2 text-[15px]">
                  <span className="text-[#0F172A] font-extrabold">Net Monthly Take-Home:</span>
                  <span className="font-extrabold text-[#059669]">₹1,18,500</span>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Fintech Analytics Visual Card */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="w-full rounded-2xl border border-[#CBD5E1] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 sm:p-7 text-white shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <PieChart size={18} className="text-[#34D399]" />
                    <span className="text-[14px] font-bold text-white tracking-wide">
                      Compensation Allocation Radar
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#059669]/20 text-[#34D399] text-[11px] font-semibold border border-[#059669]/40">
                    Net: 77% In-Hand
                  </span>
                </div>

                {/* Visual Donut & Key Ratio */}
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-3xl font-black text-[#34D399]">77.2%</div>
                    <div className="text-[12px] text-[#94A3B8] mt-0.5">Net Realized Ratio</div>
                    <div className="text-[10px] text-[#A5B4FC] mt-1 font-mono">₹14.22L In-Bank</div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-3xl font-black text-[#F59E0B]">10.8%</div>
                    <div className="text-[12px] text-[#94A3B8] mt-0.5">Bonus &amp; Variable</div>
                    <div className="text-[10px] text-[#FDE68A] mt-1 font-mono">₹2.00L Annual</div>
                  </div>
                </div>

                {/* Deductions visual meter */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[12px] text-[#CBD5E1] mb-1">
                      <span>Take-Home Bank Credit (₹1,18,500/mo)</span>
                      <span className="text-[#34D399] font-bold">77%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] rounded-full w-[77%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] text-[#CBD5E1] mb-1">
                      <span>Statutory PF &amp; Gratuity Shield (₹16,500/mo)</span>
                      <span className="text-[#38BDF8] font-bold">11%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full w-[11%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[12px] text-[#CBD5E1] mb-1">
                      <span>Income Tax TDS (New Regime ₹14,200/mo)</span>
                      <span className="text-[#F87171] font-bold">9%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#DC2626] to-[#F87171] rounded-full w-[9%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span className="flex items-center gap-1.5 text-[#34D399]">
                    <TrendingUp size={13} />
                    <span>Optimized for maximum cash-flow efficiency</span>
                  </span>
                  <span className="font-mono text-white/50">FY 2024-25</span>
                </div>
              </div>
            </div>
          </div>
        </StackingCardItem>
      </div>
    </section>
  );
}
