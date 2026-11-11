'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  const plans = [
    {
      id: 'free',
      name: 'Candidate Free',
      badge: 'Free Forever',
      badgeClass: 'text-[#57534E] bg-[#F5F5F4] border-[#E7E5E4]',
      monthlyPrice: '₹0',
      annualPrice: '₹0',
      period: 'forever',
      description: 'Essential articleship diagnostic and verified job discovery for CA students.',
      features: [
        'Articleship capability diagnostic',
        '7-pathway matching benchmarks',
        'Access to verified job listings',
        '3 tailored resume exports',
        'Candidate employer privacy',
      ],
      ctaText: 'Get Started Free',
      ctaHref: '/register',
      ctaPrimary: false,
      popular: false,
    },
    {
      id: 'pro',
      name: 'Candidate Pro',
      badge: 'Most Popular',
      badgeClass: 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]',
      monthlyPrice: '₹799',
      annualPrice: '₹7,990',
      period: billingCycle === 'MONTHLY' ? '/ month' : '/ year',
      description: 'Comprehensive preparation for candidates targeting Big 4 and corporate finance.',
      features: [
        'Unlimited zero-fabrication resumes',
        'Unlimited Big 4 technical mock interviews',
        'Interactive STAR rubric feedback',
        '1-on-1 verified CA mentor booking',
        'Priority applicant badge for verified firms',
      ],
      ctaText: 'Upgrade to Pro',
      ctaHref: '/register',
      ctaPrimary: true,
      popular: true,
    },
    {
      id: 'practice',
      name: 'Practice Firm OS',
      badge: 'Practitioners',
      badgeClass: 'text-[#6D28D9] bg-[#F5F3FF] border-[#DDD6FE]',
      monthlyPrice: '₹2,499',
      annualPrice: '₹24,990',
      period: billingCycle === 'MONTHLY' ? '/ month' : '/ year',
      description: 'For Chartered Accountants running proprietary practices or partnership audit firms.',
      features: [
        'Client relationship master database',
        'Statutory compliance filing calendar',
        'Filing ARN & UDIN verification tracker',
        'ICAI non-solicitation compliant operations',
        'Encrypted document vault',
      ],
      ctaText: 'Start Firm Workspace',
      ctaHref: '/register',
      ctaPrimary: false,
      popular: false,
    },
    {
      id: 'recruiter',
      name: 'Team Employer',
      badge: 'Recruiters',
      badgeClass: 'text-[#1E3A8A] bg-[#EFF6FF] border-[#BFDBFE]',
      monthlyPrice: '₹7,999',
      annualPrice: '₹79,990',
      period: billingCycle === 'MONTHLY' ? '/ month' : '/ year',
      description: 'For corporate talent teams and accounting firms hiring qualified Chartered Accountants.',
      features: [
        'Up to 5 active verified job postings',
        'Candidate pipeline review workflow',
        'Verified candidate discovery with consent',
        'Verified employer badge',
        'Dedicated account support',
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
      className="py-16 sm:py-20 px-4 sm:px-6 max-w-[1120px] mx-auto w-full"
    >
      {/* Section Header */}
      <div className="text-center max-w-[620px] mx-auto mb-10">
        <h2 className="text-[clamp(1.75rem,2.8vw,2.25rem)] font-semibold text-[#1C1917] tracking-tight leading-snug mb-3">
          Simple, transparent plans
        </h2>
        <p className="text-[15px] text-[#57534E] leading-relaxed mb-6">
          Clear entitlements with zero hidden fees. Includes official GST invoices with input tax credit for firms.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-lg text-[13px]">
          <button
            type="button"
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              billingCycle === 'ANNUAL'
                ? 'bg-white text-[#1C1917] shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Annual billing <span className="text-[11px] text-[#15803D] font-semibold">(Save ~17%)</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => {
          const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice;
          const isPro = plan.popular;

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 flex flex-col justify-between transition-colors bg-white ${
                isPro
                  ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A]/20 shadow-xs'
                  : 'border-[#E7E5E4] hover:border-[#D6D3D1]'
              }`}
            >
              <div>
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded border ${plan.badgeClass}`}
                  >
                    {plan.badge}
                  </span>
                  {isPro && (
                    <span className="text-[11px] font-semibold text-[#15803D]">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="text-[17px] font-semibold text-[#1C1917] mb-2">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-bold text-[#1C1917] tracking-tight">
                    {price}
                  </span>
                  <span className="text-[13px] text-[#78716C]">
                    {plan.period}
                  </span>
                </div>

                <p className="text-[13px] text-[#57534E] leading-relaxed mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Feature Bullets */}
                <ul className="space-y-2.5 mb-8 text-[13px] text-[#44403C]">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check size={15} className="text-[#15803D] shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-2">
                <Link
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg font-medium text-[13px] transition-colors ${
                    plan.ctaPrimary
                      ? 'bg-[#1E3A8A] hover:bg-[#172554] text-white shadow-xs'
                      : 'bg-[#FAF9F6] hover:bg-[#F5F5F4] text-[#1C1917] border border-[#E7E5E4]'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <div className="mt-8 pt-6 border-t border-[#E7E5E4] text-center text-[12px] text-[#78716C] max-w-[720px] mx-auto">
        <p className="m-0 leading-relaxed">
          All subscription fees are denominated in INR. Official tax invoices issued under Service Accounting Code (SAC) 998314 supporting corporate B2B Input Tax Credit.
        </p>
      </div>
    </section>
  );
}
