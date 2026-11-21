'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="max-w-[1080px] mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
      <div className="bg-white border border-neutral-200 rounded-lg p-8 sm:p-12 text-center flex flex-col items-center gap-5 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-100 border border-neutral-200 text-[11px] font-semibold tracking-wider uppercase text-neutral-700">
          <span>Get Started Today</span>
        </div>

        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold text-[#09090B] tracking-tight leading-snug m-0 max-w-[580px]">
          Ready to Find Your Articleship or Next CA Role?
        </h2>

        <p className="text-[15px] text-neutral-600 max-w-[540px] m-0 leading-relaxed">
          Access verified articleship vacancies, corporate industrial training, and qualified CA job postings across top firms in India.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/articleship"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#09090B] hover:bg-neutral-800 text-white text-[14px] font-semibold transition-all shadow-sm no-underline"
          >
            <GraduationCap size={16} />
            <span>Browse Articleship (₹99)</span>
          </Link>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white hover:bg-neutral-50 text-[#09090B] border border-neutral-300 text-[14px] font-semibold transition-all shadow-xs no-underline"
          >
            <Briefcase size={15} />
            <span>Explore CA Jobs (₹199)</span>
          </Link>
        </div>

        <span className="text-[12px] text-neutral-500 pt-1 flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>Direct applications • Zero agency middleman • 5,000+ verified firm listings</span>
        </span>
      </div>
    </section>
  );
}
