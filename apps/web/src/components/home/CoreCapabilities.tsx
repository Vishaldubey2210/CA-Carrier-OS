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
    <section id="features" className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
      {/* Header */}
      <div className="max-w-[700px] mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-3">
          <span>Complete Career Engine</span>
        </div>
        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold text-[#09090B] tracking-tight leading-snug mb-3">
          Engineered for Every Modern Professional
        </h2>
        <p className="text-[15px] text-neutral-600 leading-relaxed">
          Whether you&apos;re an ambitious Software Engineer, Financial Analyst, Strategy Consultant, Legal Associate, or Chartered Accountant—EZapply streamlines your search and dispatches applications directly to decision makers.
        </p>
      </div>

      {/* 3 Focused Capability Columns - Frosted Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: All Professional Jobs */}
        <div className="glass-card p-6 flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg glass-pill flex items-center justify-center text-black">
                <Briefcase size={20} />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full glass-pill text-neutral-800">
                All Disciplines
              </span>
            </div>

            <h3 className="text-[18px] font-bold text-[#09090B] mb-2">
              Verified Professional Jobs
            </h3>

            <p className="text-[13px] text-neutral-600 leading-relaxed mb-5">
              Verified openings across Tech &amp; Engineering, Investment Banking, Strategy Consulting, Corporate Legal, and Accounting.
            </p>

            <ul className="space-y-2.5 text-[12.5px] text-neutral-800 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Tech, Finance, Consulting &amp; Legal roles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Direct employer links (Greenhouse, Lever, Portals)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Disclosed CTC &amp; compensation benchmarks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Zero agency middlemen or spam listings</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/60">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-black hover:text-emerald-700 transition-colors"
            >
              <span>Explore All Jobs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 2: 1-Click Cold Mailer */}
        <div className="glass-card p-6 flex flex-col justify-between transition-all border-neutral-900/40">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg glass-pill flex items-center justify-center text-black">
                <Mail size={20} />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full glass-pill border-emerald-300/70 bg-emerald-50/80 text-emerald-800">
                450 Emails / Day
              </span>
            </div>

            <h3 className="text-[18px] font-bold text-[#09090B] mb-2">
              Cold Mail Outreach
            </h3>

            <p className="text-[13px] text-neutral-600 leading-relaxed mb-5">
              Automated high-deliverability outreach via your own Gmail SMTP. Reach hiring managers, partners, and recruiters directly in their inboxes.
            </p>

            <ul className="space-y-2.5 text-[12.5px] text-neutral-800 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Personal Gmail App Password integration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Pre-built templates for Tech, Finance &amp; CA</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Curated directory of 5,000+ hiring contacts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Dynamic variable replacement &amp; delivery logs</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/60">
            <Link
              href="/dashboard?tab=outreach"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-black hover:text-emerald-700 transition-colors"
            >
              <span>Launch Cold Mailer</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 3: Articleship & Internships */}
        <div className="glass-card p-6 flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg glass-pill flex items-center justify-center text-black">
                <GraduationCap size={20} />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full glass-pill text-neutral-800">
                ₹99 One-Time Pass
              </span>
            </div>

            <h3 className="text-[18px] font-bold text-[#09090B] mb-2">
              Articleship &amp; Internships
            </h3>

            <p className="text-[13px] text-neutral-600 leading-relaxed mb-5">
              Verified openings for CA articleship (Form 102/103), Corporate Industrial Training (Form 104), and premier internships across India.
            </p>

            <ul className="space-y-2.5 text-[12.5px] text-neutral-800 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Big 4 &amp; Top 30 national CA practices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Corporate Industrial Training at MNCs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Transparent stipends by location &amp; tier</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Direct partner emails &amp; application forms</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/60">
            <Link
              href="/articleship"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-black hover:text-emerald-700 transition-colors"
            >
              <span>Explore Articleship Hub</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
