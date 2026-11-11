'use client';

import React from 'react';
import {
  Lock,
  FileCheck,
  Award,
  ShieldCheck,
} from 'lucide-react';

const GOVERNANCE_PILLARS = [
  {
    icon: Lock,
    title: 'Candidate Blindfold Privacy',
    citation: 'Tenancy Isolation',
    description:
      'Cryptographic separation between individual candidate records and corporate hiring accounts. Current partners, audit managers, or HR personnel can never inspect or track your career search.',
  },
  {
    icon: FileCheck,
    title: 'Zero-Fabrication Resumes',
    citation: 'Form 108 Verified',
    description:
      'Our resume tailoring engine operates on deterministic constraints. It is strictly prohibited from hallucinating unearned credentials, unverified client mandates, or inflated metrics.',
  },
  {
    icon: Award,
    title: 'ICAI Non-Solicitation Norms',
    citation: 'Chartered Accountants Act 1949',
    description:
      'Statutory adherence to Clauses 6 & 7 of Part I of the First Schedule of the Chartered Accountants Act, 1949. We operate purely as career software without charging placement commissions.',
  },
  {
    icon: ShieldCheck,
    title: 'Deterministic Match Rubrics',
    citation: 'Transparent Standards',
    description:
      'No black-box algorithmic filters. Candidates receive complete transparency into match scores, missing technical prerequisites (e.g. Ind AS 115, Form 3CD, CARO 2020), and required experience.',
  },
];

export function PurposeGovernance() {
  return (
    <section id="about" className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="border border-[#E7E5E4] rounded-xl bg-white p-6 sm:p-10">
        {/* Header */}
        <div className="max-w-[640px] mb-8">
          <h2 className="text-[clamp(1.75rem,2.8vw,2.25rem)] font-semibold text-[#1C1917] tracking-tight leading-snug mb-3">
            Governance &amp; fiduciary trust
          </h2>
          <p className="text-[15px] text-[#57534E] leading-relaxed">
            Every database schema, background worker, and matching pipeline in CharteredOS is bound by professional compliance and member privacy.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#F5F5F4]">
          {GOVERNANCE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4] flex items-center justify-center shrink-0 text-[#1E3A8A]">
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[15px] font-semibold text-[#1C1917] m-0">
                      {pillar.title}
                    </h3>
                    <span className="text-[11px] font-medium text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded">
                      {pillar.citation}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#57534E] leading-relaxed m-0">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
