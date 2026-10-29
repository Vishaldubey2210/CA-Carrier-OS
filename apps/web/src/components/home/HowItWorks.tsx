'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Compass,
  Layers,
  FileCheck2,
  MessageSquareCode,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Play,
  Pause,
  Award,
  Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'Profile & Articleship Assessment',
    subtitle: 'Transform training experience into verified capability benchmarks',
    description:
      'Record your 3-year articleship breakdown across Statutory Audit, Corporate Tax, Internal Controls, and Deal Advisory. Our diagnostic maps your real exposure against hiring benchmarks.',
    icon: Compass,
    badgeText: 'MILESTONE 01 OF 05',
    detail: 'Maps directly to Big 4 and corporate finance hiring criteria.',
  },
  {
    num: '02',
    title: '7-Pathway Diagnostic',
    subtitle: 'Benchmark your fit across 7 specialized career horizons',
    description:
      'Evaluate your skills against Statutory Audit, Direct Tax, FP&A, Corporate Valuation, M&A Due Diligence, CFO Advisory, and Practice. Receive a customized 30/60/90-day action plan.',
    icon: Layers,
    badgeText: 'MILESTONE 02 OF 05',
    detail: 'Calibrated with leading accounting and industry placement standards.',
  },
  {
    num: '03',
    title: 'Role-Targeted Resume Tailoring',
    subtitle: 'Precision formatting based on authentic experience',
    description:
      'Target specific job descriptions with precision ATS-compliant formatting. The engine organizes your real accomplishments and working paper projects with your review and sign-off.',
    icon: FileCheck2,
    badgeText: 'MILESTONE 03 OF 05',
    detail: 'Strictly bounded to your genuine, verified credentials.',
  },
  {
    num: '04',
    title: 'Big 4 Technical Interview Drills',
    subtitle: 'Simulate partner-level Ind AS and taxation interviews',
    description:
      'Engage in technical drills testing Ind AS 115 revenue, Ind AS 116 leases, and transfer pricing. Receive instant STAR rubric scoring and model partner answers.',
    icon: MessageSquareCode,
    badgeText: 'MILESTONE 04 OF 05',
    detail: 'Evaluated against authentic partner hiring rubrics.',
  },
  {
    num: '05',
    title: 'Unbundle In-Hand CTC & Apply',
    subtitle: 'Confidential application dispatch without current firm exposure',
    description:
      'Calculate exact monthly net bank take-home after PF and FY 2024-25 New Tax Regime deductions. Apply to verified jobs with complete privacy from your current firm.',
    icon: Calculator,
    badgeText: 'MILESTONE 05 OF 05',
    detail: 'Guarantees complete confidentiality throughout your search.',
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 5-second auto-advance timer with smooth ticking countdown
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((s) => (s === STEPS.length - 1 ? 0 : s + 1));
          return 0;
        }
        return prev + 2; // 50 ticks * 100ms = 5000ms = 5s
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  const handleSelectStep = (idx: number) => {
    setActiveStep(idx);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev === 0 ? STEPS.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setActiveStep((prev) => (prev === STEPS.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const currentStep = STEPS[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full outline-none"
    >
      {/* Section Header */}
      <div className="text-center max-w-[700px] mx-auto mb-10 sm:mb-14">
        <span className="editorial-step">
          02 — SYSTEMATIC WORKFLOW
        </span>
        <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold text-[#0F172A] tracking-tight leading-tight mt-2 mb-3">
          From Articleship to Verified CA Placement
        </h2>
        <p className="text-[16px] text-[#334155] leading-relaxed max-w-[65ch] mx-auto m-0">
          A disciplined 5-stage career roadmap engineered for articleship trainees and qualified Chartered Accountants.
        </p>
      </div>

      {/* Stepper Timeline Navigation (Horizontal on Desktop, Clean Wrap on Mobile) */}
      <div className="relative mb-10 max-w-[900px] mx-auto">
        {/* Track Line behind circles */}
        <div className="absolute top-5 left-6 right-6 h-[3px] bg-[#E2E8F0] -z-0 hidden sm:block">
          <div
            className="h-full bg-[#1E3A8A] transition-all duration-300"
            style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* 5 Step Nodes */}
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => handleSelectStep(idx)}
                aria-label={`Step ${idx + 1}: ${step.title}`}
                aria-current={isActive ? 'step' : undefined}
                className={`flex flex-col items-center gap-2 group cursor-pointer transition-all ${
                  isActive ? 'scale-105' : 'hover:scale-102'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] transition-all duration-200 border-2 ${
                    isActive
                      ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-md ring-4 ring-[#1E3A8A]/15'
                      : isCompleted
                      ? 'bg-[#059669] border-[#059669] text-white shadow-xs'
                      : 'bg-white border-[#CBD5E1] text-[#64748B] hover:border-[#1E3A8A]'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={2.5} /> : step.num}
                </div>
                <span
                  className={`text-[12px] font-semibold text-center hidden md:block max-w-[110px] leading-tight ${
                    isActive ? 'text-[#1E3A8A]' : 'text-[#64748B]'
                  }`}
                >
                  {step.title.split(' ')[0]} {step.title.split(' ')[1] || ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Advance Status & Play/Pause Controls Bar */}
      <div className="max-w-[960px] mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#64748B]">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#D97706]' : 'bg-[#059669] animate-pulse'}`}
          />
          <span className="font-medium text-[#334155]">
            {isPaused ? 'Paused (Inspecting)' : `Auto-advancing Step ${activeStep + 1} of 05`}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden ml-1 hidden sm:block">
            <div
              className="h-full bg-[#1E3A8A] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous step"
            className="p-1.5 rounded-md text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next step"
            className="p-1.5 rounded-md text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Content Spotlight Box: Narrative (Left) + Interactive UI Mock (Right) */}
      <div className="max-w-[1040px] mx-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-xl overflow-hidden p-6 sm:p-8 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            {/* Left Column: Narrative Details */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] font-bold text-[#1E3A8A] bg-[#EEF2F6] px-3 py-1 rounded-full border border-[#CBD5E1]">
                  STEP {currentStep.num} OF 05
                </span>
                <div className="w-9 h-9 rounded-lg bg-[#EEF2F6] flex items-center justify-center text-[#1E3A8A]">
                  <StepIcon size={18} />
                </div>
              </div>

              <div>
                <h3 className="text-[22px] sm:text-[26px] font-bold text-[#0F172A] leading-snug m-0 mb-1">
                  {currentStep.title}
                </h3>
                <div className="text-[14px] font-semibold text-[#1E3A8A] mb-3">
                  {currentStep.subtitle}
                </div>
                <p className="text-[15px] text-[#475569] leading-relaxed m-0">
                  {currentStep.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5 text-[13px] text-[#334155]">
                <Award size={16} className="text-[#059669] shrink-0" />
                <span>{currentStep.detail}</span>
              </div>

              <div className="flex items-center justify-between pt-2 text-[13px] text-[#64748B]">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  <span>
                    {activeStep === STEPS.length - 1 ? 'Back to Step 01' : 'Next Step'}
                  </span>
                  <ChevronRight size={14} />
                </button>
                <span>Step {activeStep + 1} of 5</span>
              </div>
            </div>

            {/* Right Column: Live Mockup Stage */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6 flex flex-col gap-3 shadow-inner">
              {activeStep === 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <span className="text-[13px] font-bold text-[#0F172A]">Articleship Capability Breakdown</span>
                    <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                      Profile Verified
                    </span>
                  </div>
                  <div className="space-y-2.5 text-[12px]">
                    <div>
                      <div className="flex justify-between font-semibold text-[#334155] mb-1">
                        <span>Statutory Audit & CARO 2020</span>
                        <span className="text-[#1E3A8A]">16 Months (44%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div className="h-full bg-[#1E3A8A] rounded-full w-[44%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-[#334155] mb-1">
                        <span>Corporate Tax & Form 3CD</span>
                        <span className="text-[#059669]">10 Months (28%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div className="h-full bg-[#059669] rounded-full w-[28%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold text-[#334155] mb-1">
                        <span>ICFR Internal Financial Controls</span>
                        <span className="text-[#7C3AED]">6 Months (17%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div className="h-full bg-[#7C3AED] rounded-full w-[17%]" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>34 Working paper files verified</span>
                    <span className="text-[#059669] font-semibold">100% Attested</span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <span className="text-[13px] font-bold text-[#0F172A]">7-Pathway Match Matrix</span>
                    <span className="text-[11px] font-semibold text-[#1E3A8A] bg-[#EEF2F6] px-2 py-0.5 rounded">
                      Diagnostic Ready
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] uppercase font-bold">Statutory Audit</div>
                      <div className="text-[15px] font-extrabold text-[#059669]">94% Match</div>
                      <div className="text-[11px] text-[#475569]">Big 4 Senior Associate</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] uppercase font-bold">Financial Due Diligence</div>
                      <div className="text-[15px] font-extrabold text-[#1E3A8A]">88% Match</div>
                      <div className="text-[11px] text-[#475569]">Advisory Consultant</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] uppercase font-bold">FP&A Corporate</div>
                      <div className="text-[15px] font-extrabold text-[#0284C7]">82% Match</div>
                      <div className="text-[11px] text-[#475569]">Finance Manager</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0]">
                      <div className="text-[10px] text-[#64748B] uppercase font-bold">Public Practice</div>
                      <div className="text-[15px] font-extrabold text-[#D97706]">78% Match</div>
                      <div className="text-[11px] text-[#475569]">Audit Partner</div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <span className="text-[13px] font-bold text-[#0F172A]">Resume Tailoring Engine</span>
                    <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                      Zero-Fabrication
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] text-[12px] text-[#334155] space-y-1.5">
                    <div className="font-semibold text-[#0F172A]">Target: Top Tier Statutory Audit Practice</div>
                    <div className="text-[#059669] flex items-center gap-1 font-medium text-[11px]">
                      <Check size={13} />
                      <span>Verified: 16 months listed company statutory audit</span>
                    </div>
                    <div className="text-[#059669] flex items-center gap-1 font-medium text-[11px]">
                      <Check size={13} />
                      <span>Ind AS 115 & 116 compliance review verified</span>
                    </div>
                    <div className="text-[#64748B] text-[11px] italic">
                      All bullet points strictly validated against formal training records.
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <span className="text-[13px] font-bold text-[#0F172A]">Big 4 Drill Terminal</span>
                    <span className="text-[11px] font-semibold text-[#1E3A8A] bg-[#EEF2F6] px-2 py-0.5 rounded">
                      STAR Scoring
                    </span>
                  </div>
                  <div className="bg-[#0F172A] text-white p-3 rounded-lg font-mono text-[11px] space-y-1.5">
                    <div className="text-[#94A3B8]">&gt; Partner Case: Ind AS 116 Lease Modification</div>
                    <div className="text-[#34D399]">&gt; Evaluation: Remeasure lease liability with revised discount rate</div>
                    <div className="pt-1.5 border-t border-white/10 flex justify-between text-[#A5B4FC]">
                      <span>Technical Score: 9.2/10</span>
                      <span className="text-[#FBBF24]">Verdict: Top 5%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <span className="text-[13px] font-bold text-[#0F172A]">Confidential Application Dispatch</span>
                    <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded">
                      Complete Privacy
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] space-y-2 text-[12px]">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#334155]">Current Employer Exclusion:</span>
                      <span className="text-[#059669]">100% Protected</span>
                    </div>
                    <div className="flex justify-between text-[#475569]">
                      <span>Target Compensation:</span>
                      <span className="font-semibold text-[#0F172A]">₹18.0 - ₹22.0 LPA</span>
                    </div>
                    <div className="flex justify-between text-[#475569]">
                      <span>Take-Home Bank Credit:</span>
                      <span className="font-semibold text-[#1E3A8A]">~₹1,18,000 / month</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
