'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQS = [
  {
    q: 'What is EZapply?',
    a: 'EZapply is an all-in-one AI career operating system and application suite built for modern professionals across Tech, Finance, Consulting, Legal, and Accounting. It combines verified job discovery, automated cold outreach via personal Gmail SMTP, and smart application tracking.',
  },
  {
    q: 'What is included in the ₹99 Intern & Trainee Pass?',
    a: 'The ₹99 Pass gives students, graduates, and articleship trainees 3 months of access to verified internships, CA articleship vacancies (Form 102/103), Corporate Industrial Training (Form 104), and our 1-click cold email outreach tool with 5,000+ verified hiring desk contacts.',
  },
  {
    q: 'What is included in the ₹199 Professional Pro Pass?',
    a: 'The ₹199 Pro Pass provides 6 months of comprehensive access to all verified jobs across Tech, Finance, Consulting, Legal, and Qualified CA roles, along with our 450/day Gmail cold mailer, salary benchmarks, and direct recruiter contacts.',
  },
  {
    q: 'Are the job and articleship postings verified?',
    a: 'Yes. Every vacancy listed on EZapply is directly verified from authorized employer career portals (Greenhouse, Lever, Workday), official partner circulars, or confirmed recruiter announcements to ensure zero expired or fake listings.',
  },
  {
    q: 'Is there any recurring subscription or auto-debit?',
    a: 'No. Both the ₹99 Intern Pass and ₹199 Professional Pro Pass are strictly one-time payments with zero hidden fees, zero auto-renewals, and zero surprise charges.',
  },
  {
    q: 'Can non-finance professionals (like software developers or consultants) use EZapply?',
    a: 'Yes, absolutely! EZapply is built for every ambitious professional. Whether you are a software engineer, data scientist, management consultant, corporate lawyer, finance analyst, or CA student, EZapply helps you discover verified opportunities and apply directly.',
  },
];

export function FAQSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="py-16 sm:py-20 px-4 sm:px-6 max-w-[820px] mx-auto w-full"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Section Header */}
      <div className="text-center max-w-[600px] mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold tracking-wider uppercase text-neutral-700 mb-3">
          <span>Got Questions?</span>
        </div>
        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold text-black tracking-tight leading-snug mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-[15px] text-neutral-600 leading-relaxed m-0">
          Everything you need to know about the ₹99 Articleship Pass and ₹199 CA Career Pro Pass.
        </p>
      </div>

      {/* Accordion List - Frosted Glass Panels */}
      <div className="flex flex-col gap-3">
        {FAQS.map((faq, idx) => {
          const isOpen = activeFaq === idx;
          const buttonId = `faq-btn-${idx}`;
          const contentId = `faq-content-${idx}`;

          return (
            <div
              key={idx}
              className={`rounded-xl transition-all overflow-hidden glass-card ${
                isOpen
                  ? 'border-black/70 shadow-md'
                  : ''
              }`}
            >
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <span className="text-[15px] font-semibold text-black leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-neutral-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-black' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-[14px] text-neutral-600 leading-relaxed border-t border-white/60">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
