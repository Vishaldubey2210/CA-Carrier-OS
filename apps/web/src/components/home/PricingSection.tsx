'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export function PricingSection() {
  const plans = [
    {
      id: 'articleship-pass',
      name: 'Articleship Pass',
      badge: 'CA Students & Inter',
      price: '₹99',
      period: '3 months access',
      description: 'Ideal for CA Intermediate cleared students looking for verified articleship and industrial training.',
      features: [
        'Form 102/103 2-year articleship scheme vacancies',
        'Corporate industrial training (Form 104) openings',
        'Direct firm website links & partner contact details',
        'Verified stipend transparency by city & tier',
        'Application status tracker',
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
      description: 'Full access to all Qualified CA roles, corporate finance positions, and articleship listings.',
      features: [
        'Everything included in the Articleship Pass',
        'All Qualified & Semi-Qualified CA job vacancies',
        'Direct recruiter and hiring partner contacts',
        'CTC & compensation benchmark insights',
        'Priority applicant visibility for hiring firms',
        'Instant alerts for new Big 4 and corporate openings',
      ],
      ctaText: 'Get CA Career Pro',
      ctaHref: '/jobs',
      popular: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 px-4 sm:px-6 max-w-[960px] mx-auto w-full"
    >
      {/* Section Header */}
      <div className="text-center max-w-[580px] mx-auto mb-12">
        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold text-black tracking-tight mb-3">
          Simple, Transparent Pricing
        </h2>
        <p className="text-[15px] text-neutral-600 leading-relaxed">
          No subscriptions, no hidden renewals. Pay once and get direct access to verified openings.
        </p>
      </div>

      {/* 2 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
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
                {/* Badge Header */}
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

                {/* Plan Name & Price */}
                <h3 className="text-[20px] font-bold text-black mb-2">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[36px] font-black tracking-tight text-black">
                    {plan.price}
                  </span>
                  <span className="text-[13px] text-neutral-500 font-medium">
                    / {plan.period}
                  </span>
                </div>

                <p className="text-[14px] text-neutral-600 leading-relaxed mb-6 pb-6 border-b border-neutral-100">
                  {plan.description}
                </p>

                {/* Features List */}
                <div className="mb-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    What&apos;s Included
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

              {/* Action Button */}
              <Link
                href={plan.ctaHref}
                className={`w-full py-3 px-4 rounded-md text-[14px] font-semibold text-center flex items-center justify-center gap-2 transition-all no-underline ${
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
    </section>
  );
}
