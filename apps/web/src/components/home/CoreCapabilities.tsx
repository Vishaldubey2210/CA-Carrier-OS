'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  FileText,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';

export function CoreCapabilities() {
  return (
    <section id="features" className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
      {/* Header */}
      <div className="max-w-[680px] mb-12">
        <h2 className="text-[clamp(1.75rem,2.8vw,2.25rem)] font-semibold text-[#1C1917] tracking-tight leading-snug mb-3">
          Built specifically for Chartered Accountants
        </h2>
        <p className="text-[15px] text-[#57534E] leading-relaxed">
          Standard job portals flatten three years of rigorous statutory audit, direct tax litigation, and regulatory filings into keyword search. CharteredOS provides infrastructure tailored to the profession.
        </p>
      </div>

      {/* 3 Clear Capability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 flex flex-col justify-between hover:border-[#D6D3D1] transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#F4F3EF] border border-[#E7E5E4] flex items-center justify-center text-[#1E3A8A] mb-4">
              <GraduationCap size={20} />
            </div>

            <h3 className="text-[17px] font-semibold text-[#1C1917] mb-2">
              Articleship &amp; Industrial Training
            </h3>

            <p className="text-[14px] text-[#57534E] leading-relaxed mb-6">
              Authenticated openings for the 2-year articleship scheme (Form 102/103) and corporate industrial training (Form 104). Direct outbound application links with verified stipends.
            </p>

            <ul className="space-y-2.5 text-[13px] text-[#44403C] mb-6">
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>Form 108 practical hours logging by audit discipline</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>Industrial training Form 104 NOC verification</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>Direct partner firm interview pipelines</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#F5F5F4]">
            <Link
              href="/articleship"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1E3A8A] hover:text-[#172554] transition-colors"
            >
              <span>Explore trainee vacancies</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 flex flex-col justify-between hover:border-[#D6D3D1] transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#F4F3EF] border border-[#E7E5E4] flex items-center justify-center text-[#1E3A8A] mb-4">
              <FileText size={20} />
            </div>

            <h3 className="text-[17px] font-semibold text-[#1C1917] mb-2">
              Technical Drills &amp; Attested Resumes
            </h3>

            <p className="text-[14px] text-[#57534E] leading-relaxed mb-6">
              Practice interview drills on CARO 2020 Clause 3(xxi), Ind AS 115 revenue recognition, and transfer pricing. Build single-page resumes grounded in genuine training logs.
            </p>

            <ul className="space-y-2.5 text-[13px] text-[#44403C] mb-6">
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>Technical rubric scoring for Big 4 manager rounds</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>Single-page executive resumes formatted for CA recruiters</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>Zero hallucination: only attested practical experience</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#F5F5F4]">
            <Link
              href="/interviews"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1E3A8A] hover:text-[#172554] transition-colors"
            >
              <span>Practice audit drills</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 flex flex-col justify-between hover:border-[#D6D3D1] transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#F4F3EF] border border-[#E7E5E4] flex items-center justify-center text-[#1E3A8A] mb-4">
              <Lock size={20} />
            </div>

            <h3 className="text-[17px] font-semibold text-[#1C1917] mb-2">
              Candidate Privacy &amp; In-Hand CTC
            </h3>

            <p className="text-[14px] text-[#57534E] leading-relaxed mb-6">
              Cryptographically isolate your active search activity. Current partners or employers cannot inspect your profile. Calculate true monthly take-home under Section 115BAC.
            </p>

            <ul className="space-y-2.5 text-[13px] text-[#44403C] mb-6">
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>Complete blindfold from current firm recruiters</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>PF, gratuity, and bonus unbundling for realistic CTC</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={15} className="text-[#15803D] mt-0.5 shrink-0" />
                <span>ICAI non-solicitation code of ethics compliant</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#F5F5F4]">
            <Link
              href="/growth"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1E3A8A] hover:text-[#172554] transition-colors"
            >
              <span>Calculate take-home CTC</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
