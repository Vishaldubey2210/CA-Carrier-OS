'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export function PricingSection() {
  const plans = [
    {
      id: 'articleship-pass',
      name: 'Articleship Pass',
      badge: 'CA Students & Inter Cleared',
      price: '₹99',
      period: '3 months full access',
      description: 'Ideal for CA Intermediate cleared students looking for verified articleship (Form 102/103) and industrial training (Form 104).',
      features: [
        'Form 102/103 2-year articleship scheme vacancies',
        'Corporate industrial training (Form 104) openings',
        'Directory of 5,000+ verified CA firms across India',
        '1-Click Mass Outreach with Gmail SMTP automation',
        'Verified stipend transparency by city & tier',
        'Direct partner & HR contacts (No agency middlemen)',
      ],
      ctaText: 'Get Articleship Pass (₹99)',
      ctaHref: '/articleship',
      popular: false,
    },
    {
      id: 'ca-pro-pass',
      name: 'CA Career Pro',
      badge: 'Qualified & Semi-Qualified CAs',
      price: '₹199',
      period: '6 months full access',
      description: 'Complete access to all Qualified CA roles, corporate finance positions, compensation benchmarks, and articleship listings.',
      features: [
        'Everything included in the Articleship Pass',
        'All Qualified & Semi-Qualified CA job vacancies',
        'Audit, Direct & Indirect Tax, FP&A, and FDD roles',
        'Direct recruiter and hiring partner email contacts',
        'CTC & compensation benchmark insights',
        'Priority applicant visibility for hiring firms',
        'Instant alerts for new Big 4 and corporate openings',
      ],
      ctaText: 'Get CA Career Pro (₹199)',
      ctaHref: '/jobs',
      popular: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 px-4 sm:px-6 max-w-[1000px] mx-auto w-full"
    >
      {/* Section Header */}
      <div className="text-center max-w-[620px] mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-3">
          <span>Simple &amp; Honest Pricing</span>
        </div>
        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-extrabold text-[#09090B] tracking-tight mb-3">
          Two Plans. No Recurring Subscriptions.
        </h2>
        <p className="text-[15px] text-neutral-600 leading-relaxed">
          Pay once and get direct access to verified openings. Zero auto-renewals, zero hidden charges.
        </p>
      </div>

      {/* 2 Plans Grid - Frosted Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {plans.map((plan) => {
          const isPro = plan.popular;

          return (
            <div
              key={plan.id}
              className={`glass-card p-7 sm:p-8 flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'border-neutral-900/80 ring-1 ring-neutral-900/80 shadow-lg'
                  : ''
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 right-6 bg-[#09090B] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[12px] font-semibold px-2.5 py-1 rounded-full glass-pill ${
                      isPro
                        ? 'text-neutral-900 font-bold'
                        : 'text-emerald-800 border-emerald-300/70 bg-emerald-50/80'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                {/* Plan Name & Price */}
                <h3 className="text-[21px] font-bold text-[#09090B] mb-2">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[38px] font-black tracking-tight text-[#09090B]">
                    {plan.price}
                  </span>
                  <span className="text-[13px] text-neutral-500 font-medium">
                    / {plan.period}
                  </span>
                </div>

                <p className="text-[14px] text-neutral-600 leading-relaxed mb-6 pb-6 border-b border-white/60">
                  {plan.description}
                </p>

                {/* Features List */}
                <div className="mb-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-3.5">
                    What&apos;s Included
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[13px] text-neutral-800">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3 px-4 rounded-lg text-[14px] font-semibold text-center flex items-center justify-center gap-2 transition-all no-underline ${
                    isPro
                      ? 'bg-[#09090B] text-white hover:bg-neutral-800 shadow-md'
                      : 'glass-pill text-black hover:bg-white shadow-xs'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={15} />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>One-time fee • Immediate access</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
