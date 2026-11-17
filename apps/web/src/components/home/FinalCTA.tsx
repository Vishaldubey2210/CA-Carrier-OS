'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Briefcase } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="max-w-[1040px] mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
      <div className="bg-white border border-neutral-200 rounded-lg p-8 sm:p-12 text-center flex flex-col items-center gap-5">
        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold text-black tracking-tight leading-snug m-0 max-w-[560px]">
          Ready to Find Your Next Opportunity?
        </h2>

        <p className="text-[15px] text-neutral-600 max-w-[520px] m-0 leading-relaxed">
          Access verified articleship vacancies and qualified CA job postings across top firms in India.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/articleship"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-black hover:bg-neutral-800 text-white text-[14px] font-semibold transition-colors no-underline"
          >
            <GraduationCap size={16} />
            <span>Browse Articleship (₹99)</span>
          </Link>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white hover:bg-neutral-100 text-black border border-black text-[14px] font-semibold transition-colors no-underline"
          >
            <Briefcase size={15} />
            <span>Explore CA Jobs (₹199)</span>
          </Link>
        </div>

        <span className="text-[12px] text-neutral-500 pt-1">
          Direct applications • Zero agency middleman • Verified firm listings
        </span>
      </div>
    </section>
  );
}
