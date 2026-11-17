'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PublicPricingPage() {
  const { isAuthenticated } = useAuth();

  const plans = [
    {
      id: 'articleship-pass',
      name: 'Articleship Pass',
      badge: 'CA Students & Inter',
      price: '₹99',
      period: '3 months access',
      description: 'Built specifically for CA Intermediate cleared students looking for verified articleship training and industrial training vacancies.',
      features: [
        'Form 102/103 2-year articleship scheme vacancies',
        'Corporate industrial training (Form 104) openings',
        'Direct firm website links & partner contact details',
        'Verified stipend transparency by city & tier',
        'Personal application status tracker',
        'Filter by Big 4, Top 20 firms, and mid-size practices',
      ],
      ctaText: 'Get Articleship Pass',
      ctaHref: '/articleship',
      popular: false,
    },
    {
      id: 'ca-pro-pass',
      name: 'CA Career Pro',
      badge: 'Semi-Qualified & Qualified CAs',
      price: '₹199',
      period: '6 months access',
      description: 'Comprehensive access to all Qualified Chartered Accountant roles, corporate finance jobs, and articleship opportunities.',
      features: [
        'Everything included in the Articleship Pass',
        'All Qualified & Semi-Qualified CA job vacancies',
        'Direct recruiter and hiring partner contacts',
        'CTC & compensation benchmark insights',
        'Priority applicant visibility for hiring firms',
        'Instant alerts for new Big 4, MNC, and startup openings',
        'Audit, Tax, M&A, and FP&A role categorization',
      ],
      ctaText: 'Get CA Career Pro',
      ctaHref: '/jobs',
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-[620px] mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-300 text-[12px] font-semibold text-neutral-800 mb-4 bg-neutral-50">
            <ShieldCheck size={14} />
            <span>Verified CA Opportunities</span>
          </div>
          <h1 className="text-[clamp(2rem,3vw,2.75rem)] font-bold text-black tracking-tight leading-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-[16px] text-neutral-600 leading-relaxed">
            Straightforward pricing with no hidden charges or auto-renewals. Choose the plan that fits your current career stage.
          </p>
        </div>

        {/* 2 Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-16">
          {plans.map((plan) => {
            const isPro = plan.popular;

            return (
              <div
                key={plan.id}
                className={`rounded-lg border p-8 flex flex-col justify-between transition-colors bg-white ${
                  isPro
                    ? 'border-black ring-1 ring-black shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[12px] font-semibold px-2.5 py-1 rounded border ${
                        isPro
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <h2 className="text-[22px] font-bold text-black mb-2">
                    {plan.name}
                  </h2>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[40px] font-black tracking-tight text-black">
                      {plan.price}
                    </span>
                    <span className="text-[14px] text-neutral-500 font-medium">
                      / {plan.period}
                    </span>
                  </div>

                  <p className="text-[14px] text-neutral-600 leading-relaxed mb-6 pb-6 border-b border-neutral-100">
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-3">
                      Plan Inclusions
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-[13px] text-neutral-800">
                          <Check size={16} className="text-black shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3.5 px-4 rounded-md text-[14px] font-semibold text-center flex items-center justify-center gap-2 transition-all no-underline ${
                    isPro
                      ? 'bg-black text-white hover:bg-neutral-800'
                      : 'bg-white text-black border border-black hover:bg-neutral-50'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="p-6 rounded-lg border border-neutral-200 bg-neutral-50 text-center max-w-[680px] mx-auto">
          <h3 className="text-[15px] font-bold text-black mb-1">
            Official Firm Portal Verification
          </h3>
          <p className="text-[13px] text-neutral-600 leading-relaxed m-0">
            All vacancies are verified from official firm career portals and authorized partner listings.
          </p>
        </div>
      </div>
    </div>
  );
}
