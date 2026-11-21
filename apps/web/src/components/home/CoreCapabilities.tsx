'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export function CoreCapabilities() {
  return (
    <section id="features" className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
      {/* Header */}
      <div className="max-w-[660px] mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-100 border border-neutral-200 text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-3">
          <span>Focused Architecture</span>
        </div>
        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold text-[#09090B] tracking-tight leading-snug mb-3">
          Only Two Focus Areas: Articleship &amp; Jobs
        </h2>
        <p className="text-[15px] text-neutral-600 leading-relaxed">
          No complex clutter or unnecessary tools. We connect CA students to verified articleship vacancies with transparent stipends and Chartered Accountants to genuine job openings.
        </p>
      </div>

      {/* 2 Focused Capability Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Articleship */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-400 transition-all shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <GraduationCap size={20} />
              </div>
              <span className="text-[12px] font-bold px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-800">
                ₹99 One-Time Pass
              </span>
            </div>

            <h3 className="text-[19px] font-bold text-[#09090B] mb-2">
              Articleship &amp; Industrial Training
            </h3>

            <p className="text-[14px] text-neutral-600 leading-relaxed mb-6">
              Verified openings for the 2-year CA articleship scheme (Form 102/103) and corporate industrial training (Form 104). Direct links with verified stipends and partner contacts.
            </p>

            <ul className="space-y-3 text-[13px] text-neutral-800 mb-6">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Big 4, Top 20 firms, and reputed mid-size practices</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Corporate Industrial Training (Form 104) at leading MNCs</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Transparent stipend information by location &amp; tier</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>1-Click Mass Outreach to 5,000+ CA firm hiring desks</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <Link
              href="/articleship"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-black hover:text-emerald-700 transition-colors"
            >
              <span>Explore Articleship Vacancies</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 2: CA Jobs */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-400 transition-all shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <Briefcase size={20} />
              </div>
              <span className="text-[12px] font-bold px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 text-neutral-800">
                ₹199 Pro Pass
              </span>
            </div>

            <h3 className="text-[19px] font-bold text-[#09090B] mb-2">
              Qualified &amp; Semi-Qualified CA Jobs
            </h3>

            <p className="text-[14px] text-neutral-600 leading-relaxed mb-6">
              Discover verified full-time positions across Statutory Audit, Direct &amp; Indirect Tax, Financial Due Diligence, Transfer Pricing, and Corporate FP&amp;A.
            </p>

            <ul className="space-y-3 text-[13px] text-neutral-800 mb-6">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Verified corporate finance, audit, and tax consulting roles</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Genuine salary &amp; CTC ranges disclosed upfront</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Filtered by experience: Fresher CA, 1-3 yrs, 3-5 yrs, 5+ yrs</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Direct application links without recruiter spam</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-black hover:text-emerald-700 transition-colors"
            >
              <span>Explore CA Jobs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
