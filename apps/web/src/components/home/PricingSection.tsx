'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  const plans = [
    {
      id: 'free',
      name: 'Free Candidate',
      badge: 'FOREVER FREE',
      badgeClass: 'text-[#64748B] bg-[#F1F5F9] border-[#CBD5E1]',
      monthlyPrice: '₹0',
      annualPrice: '₹0',
      period: 'forever',
      description: 'Essential articleship diagnostic and career discovery for CA students and qualified professionals.',
      features: [
        'Articleship capability diagnostic',
        '7-pathway matching and score benchmarks',
        'Access to verified job listings',
        '3 tailored resume exports',
        'Confidential candidate employer privacy',
      ],
      ctaText: 'Get Started Free',
      ctaHref: '/register',
      ctaPrimary: false,
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Candidate',
      badge: 'MOST POPULAR',
      badgeClass: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
      monthlyPrice: '₹799',
      annualPrice: '₹7,990',
      period: billingCycle === 'MONTHLY' ? '/ month' : '/ year',
      description: 'Full suite for serious candidates targeting Big 4 and high-growth corporate finance roles.',
      features: [
        'Unlimited zero-fabrication attested resumes',
        'Unlimited Big 4 technical mock interviews',
        'Interactive STAR rubric scoring & feedback',
        '1-on-1 verified CA mentor booking',
        'Priority applicant badge for verified recruiters',
      ],
      ctaText: 'Upgrade to Pro',
      ctaHref: '/register',
      ctaPrimary: true,
      popular: true,
    },
    {
      id: 'practice',
      name: 'Practice Firm OS',
      badge: 'PRACTITIONER',
      badgeClass: 'text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]',
      monthlyPrice: '₹2,499',
      annualPrice: '₹24,990',
      period: billingCycle === 'MONTHLY' ? '/ month' : '/ year',
      description: 'For Chartered Accountants running proprietary practices or partnership audit firms.',
      features: [
        'Full client master relationship database',
        'Statutory compliance filing calendar',
        'Filing ARN & UDIN verification tracker',
        'ICAI non-solicitation compliant operations',
        'Document vault with encryption',
      ],
      ctaText: 'Start Firm Workspace',
      ctaHref: '/register',
      ctaPrimary: false,
      popular: false,
    },
    {
      id: 'recruiter',
      name: 'Team Employer',
      badge: 'RECRUITER',
      badgeClass: 'text-[#1E3A8A] bg-[#EEF2F6] border-[#CBD5E1]',
      monthlyPrice: '₹7,999',
      annualPrice: '₹79,990',
      period: billingCycle === 'MONTHLY' ? '/ month' : '/ year',
      description: 'For corporate talent teams and accounting firms hiring qualified Chartered Accountants.',
      features: [
        'Up to 5 active verified job postings',
        'Candidate pipeline Kanban review workflow',
        'Verified candidate discovery with explicit consent',
        'Verified employer blue verification badge',
        'Dedicated account manager support',
      ],
      ctaText: 'Post CA Openings',
      ctaHref: '/register',
      ctaPrimary: false,
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-16 sm:py-24 px-4 sm:px-6 max-w-[1200px] mx-auto w-full"
    >
      {/* Section Header (Guaranteed visible, no clipping) */}
      <div className="text-center max-w-[700px] mx-auto mb-10 sm:mb-12">
        <span className="editorial-step">
          04 — TRANSPARENT TIERS
        </span>
        <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold text-[#0F172A] tracking-tight leading-tight mt-2 mb-3">
          Transparent, Server-Enforced Tiers
        </h2>
        <p className="text-[16px] text-[#334155] leading-relaxed max-w-[65ch] mx-auto mb-6 m-0">
          Clear entitlements with zero hidden fees. Includes official GST invoices with input tax credit for firms.
        </p>

        {/* Monthly / Annual Toggle with Sliding Indicator */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingCycle('MONTHLY')}
            className={`relative px-4 sm:px-5 py-2 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
              billingCycle === 'MONTHLY' ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            {billingCycle === 'MONTHLY' && (
              <motion.span
                layoutId="pricingCyclePill"
                className="absolute inset-0 rounded-full bg-[#1E3A8A] shadow-sm -z-0"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Monthly Billing</span>
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle('ANNUAL')}
            className={`relative px-4 sm:px-5 py-2 rounded-full text-[13px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'ANNUAL' ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            {billingCycle === 'ANNUAL' && (
              <motion.span
                layoutId="pricingCyclePill"
                className="absolute inset-0 rounded-full bg-[#1E3A8A] shadow-sm -z-0"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Annual Pass</span>
            <span
              className={`relative z-10 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                billingCycle === 'ANNUAL' ? 'bg-[#059669] text-white' : 'bg-[#ECFDF5] text-[#059669]'
              }`}
            >
              Save ~17%
            </span>
          </button>
        </div>
      </div>

      {/* 4 Equal Height Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan, idx) => {
          const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
          const isPro = plan.popular;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 1 }}
              className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 bg-white ${
                isPro
                  ? 'border-[#059669] shadow-lg lg:-translate-y-1 relative ring-1 ring-[#059669]/20'
                  : 'border-[#E2E8F0] shadow-card hover:shadow-card-hover hover:-translate-y-1'
              }`}
            >
              <div>
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${plan.badgeClass} tracking-wider uppercase`}
                  >
                    {plan.badge}
                  </span>
                  {isPro && (
                    <span className="text-[11px] font-semibold text-[#059669] flex items-center gap-1">
                      <Sparkles size={12} />
                      Featured
                    </span>
                  )}
                </div>

                {/* Plan Title & Price */}
                <h3 className="text-[19px] font-bold text-[#0F172A] mb-2 m-0">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                    {price}
                  </span>
                  <span className="text-[13px] text-[#64748B] font-medium">
                    {plan.period}
                  </span>
                </div>

                <p className="text-[13px] text-[#475569] leading-relaxed mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Feature Bullets (Consistent Emerald Checkmarks) */}
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5 mb-8 text-[13px] text-[#334155]">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <Check size={16} className="text-[#059669] shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button Aligned at Bottom */}
              <div className="mt-auto pt-2">
                <Link
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-[14px] transition-all no-underline ${
                    plan.ctaPrimary
                      ? 'bg-[#1E3A8A] hover:bg-[#1E40AF] text-white shadow-sm hover:shadow'
                      : 'bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#CBD5E1] hover:border-[#94A3B8]'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footnote Under Cards (Not an orphan line) */}
      <div className="mt-8 pt-6 border-t border-[#E2E8F0] text-center text-[13px] text-[#64748B] max-w-[800px] mx-auto">
        <p className="m-0 leading-relaxed">
          All subscription fees are denominated in INR. Applicable GST charged as per statutory norms.
          Official tax invoices issued with Service Accounting Code (SAC) <strong>998314</strong> supporting corporate B2B Input Tax Credit.
        </p>
      </div>
    </section>
  );
}
