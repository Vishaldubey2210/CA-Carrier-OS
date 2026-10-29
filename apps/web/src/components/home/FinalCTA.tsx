'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, RotateCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function FinalCTA() {
  const router = useRouter();
  const [demoStage, setDemoStage] = useState<'IDLE' | 'ANALYZING' | 'MATCHING' | 'READY'>('IDLE');

  const handleLaunchTestDrive = () => {
    if (demoStage !== 'IDLE') return;
    setDemoStage('ANALYZING');
    setTimeout(() => {
      setDemoStage('MATCHING');
      setTimeout(() => {
        setDemoStage('READY');
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }, 1000);
    }, 900);
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full">
      <div
        className="relative rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white overflow-hidden shadow-2xl flex flex-col items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#2563EB]/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#059669]/15 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-[760px] mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[12px] font-bold tracking-wider uppercase text-[#93C5FD]">
            <Sparkles size={14} className="text-[#34D399]" />
            <span>JOIN INDIA&apos;S PREMIER CA PLATFORM</span>
          </span>

          <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-extrabold tracking-tight leading-[1.2] m-0 text-white">
            Accelerate Your Career with CharteredOS
          </h2>

          <p className="text-[16px] sm:text-[17px] text-[#CBD5E1] leading-relaxed max-w-[60ch] m-0">
            Benchmark your skills across 7 specialized career horizons, evaluate verified roles across India, and take full control of your growth.
          </p>

          {/* Interactive 1-Click Test Drive Box */}
          <div className="w-full max-w-[500px] mt-4 p-5 sm:p-6 rounded-2xl bg-white/95 text-[#0F172A] shadow-xl flex flex-col gap-3.5 text-left border border-white">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0F172A] flex items-center gap-2">
                <Sparkles size={16} className="text-[#1E3A8A]" />
                <span>Instant Interactive Platform Demo</span>
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#1E3A8A]">
                NO LOGIN REQUIRED
              </span>
            </div>

            <p className="text-[13px] text-[#64748B] m-0 leading-relaxed">
              Explore the full CharteredOS workspace with preloaded career diagnostics, resume tools, and CTC calculators.
            </p>

            <button
              type="button"
              disabled={demoStage !== 'IDLE'}
              onClick={handleLaunchTestDrive}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold text-[14px] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-75"
            >
              {demoStage === 'IDLE' ? (
                <>
                  <Sparkles size={16} />
                  <span>Launch Interactive Demo</span>
                </>
              ) : (
                <>
                  <RotateCw size={16} className="animate-spin" />
                  <span>Entering CharteredOS Workspace...</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Standard Links */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[14px] border border-white/20 transition-all no-underline"
            >
              <span>Create Free Account</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[14px] border border-white/20 transition-all no-underline"
            >
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
