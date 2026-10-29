'use client';

import React from 'react';
import { Lock, FileCheck2, Award, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const GOVERNANCE_ITEMS = [
  {
    icon: Lock,
    title: 'Confidential Career Privacy',
    badge: 'PRIVACY',
    iconBg: 'bg-[#EEF2F6] text-[#1E3A8A]',
    description:
      'Complete privacy separation between candidate profiles and employer directories. Recruiters from your current employer can never search, inspect, or track your career exploration.',
  },
  {
    icon: FileCheck2,
    title: 'Verified Career Profiles',
    badge: 'ACCURACY',
    iconBg: 'bg-[#ECFDF5] text-[#059669]',
    description:
      'Resume tailoring is strictly bounded to verified, authentic training and project records. Our platform refuses to invent unearned credentials or inflated metrics.',
  },
  {
    icon: Award,
    title: 'ICAI Ethical Grounding',
    badge: 'COMPLIANCE',
    iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
    description:
      'Adherence to ICAI Code of Ethics Clauses 6 and 7 of Part I of the First Schedule. Practice tools respect non-solicitation norms while tracking compliances and peer-review working papers.',
  },
  {
    icon: ShieldCheck,
    title: 'Explainable Match Rubrics',
    badge: 'TRANSPARENCY',
    iconBg: 'bg-[#FEF3C7] text-[#D97706]',
    description:
      'No black-box rejection algorithms. Every job match and technical case evaluation displays transparent statutory rubrics and detailed skill matrices so you always know where you stand.',
  },
];

export function PurposeGovernance() {
  return (
    <section
      id="about"
      className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full"
    >
      {/* Section Header */}
      <div className="text-center max-w-[700px] mx-auto mb-10 sm:mb-14">
        <span className="editorial-step">
          05 — PURPOSE & GOVERNANCE
        </span>
        <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold text-[#0F172A] tracking-tight leading-tight mt-2 mb-3">
          Built for Professional Rigor & Ethical Trust
        </h2>
        <p className="text-[16px] text-[#334155] leading-relaxed max-w-[65ch] mx-auto m-0">
          Empowering Indian Chartered Accountants with objective career diagnostics, verified credentials, and complete privacy.
        </p>
      </div>

      {/* 4 Cards with Equal Height & Zero Clipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {GOVERNANCE_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 1 }}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg} transition-transform group-hover:scale-105 shrink-0`}
                >
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase bg-[#F1F5F9] px-2 py-0.5 rounded">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-[18px] font-bold text-[#0F172A] mb-2.5 group-hover:text-[#1E3A8A] transition-colors leading-snug m-0">
                {item.title}
              </h3>

              <p className="text-[14px] text-[#475569] leading-relaxed m-0 mt-auto">
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
