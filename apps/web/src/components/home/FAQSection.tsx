'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQS = [
  {
    q: 'What is included in the ₹99 Articleship Pass?',
    a: 'The ₹99 Articleship Pass gives CA students 3 months of unlimited access to verified articleship vacancies under Form 102/103 (2-year scheme) and Corporate Industrial Training (Form 104) at Big 4, Top 20 firms, and leading MNCs, with direct partner contact details and stipend transparency.',
  },
  {
    q: 'What is included in the ₹199 CA Career Pro Pass?',
    a: 'The ₹199 CA Career Pro Pass includes everything in the Articleship Pass plus full 6-month access to all Qualified and Semi-Qualified CA job postings across Audit, Tax, FP&A, Due Diligence, and Corporate Finance, along with genuine salary benchmarks and direct recruiter connections.',
  },
  {
    q: 'Are the articleship and job postings verified?',
    a: 'Yes. Every vacancy listed on CharteredOS is directly verified from authorized firm career portals, official partner circulars, or confirmed recruiter postings to ensure you never waste time applying to expired or fake listings.',
  },
  {
    q: 'Is there any recurring subscription or auto-debit?',
    a: 'No. Both the ₹99 Articleship Pass and ₹199 CA Career Pro Pass are strictly one-time payments with zero hidden fees, auto-renewals, or surprise charges.',
  },
  {
    q: 'How do I apply for the listed vacancies?',
    a: 'Each listing provides direct outbound links to the official employer career portal, Google Form, or direct HR/Partner email, allowing you to submit your application directly to the decision makers.',
  },
  {
    q: 'Is CharteredOS affiliated with ICAI?',
    a: 'No. CharteredOS is an independent career platform built specifically to help Indian Chartered Accountants and CA students easily find genuine articleships and jobs.',
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
      className="py-16 sm:py-20 px-4 sm:px-6 max-w-[800px] mx-auto w-full"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Section Header */}
      <div className="text-center max-w-[600px] mx-auto mb-10">
        <h2 className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold text-black tracking-tight leading-snug mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-[15px] text-neutral-600 leading-relaxed m-0">
          Everything you need to know about the ₹99 Articleship Pass and ₹199 CA Career Pro Pass.
        </p>
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-3">
        {FAQS.map((faq, idx) => {
          const isOpen = activeFaq === idx;
          const buttonId = `faq-btn-${idx}`;
          const contentId = `faq-content-${idx}`;

          return (
            <div
              key={idx}
              className={`rounded-md border transition-colors overflow-hidden bg-white ${
                isOpen
                  ? 'border-black'
                  : 'border-neutral-200 hover:border-neutral-400'
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
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-[14px] text-neutral-600 leading-relaxed border-t border-neutral-100">
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
