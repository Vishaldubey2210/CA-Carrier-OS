'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FAQS = [
  {
    q: 'How does the verified resume builder work?',
    a: 'Our resume engine operates under strict factual verification: it structures, highlights, and formats skills and exposure formally attested from your professional training. It focuses on validated competencies, quantifiable metrics, and audit/tax experience.',
  },
  {
    q: 'How is candidate confidentiality and privacy protected?',
    a: 'Candidate personal workspaces, compensation targets, offer comparisons, and job applications are cryptographically isolated. Recruiters from your current firm or employer can never view your active profile during passive career discovery.',
  },
  {
    q: 'How is articleship experience structured and evaluated?',
    a: 'Candidates document their training breakdown across statutory audit, corporate tax, transfer pricing, FP&A, and reporting. Our system benchmarks this exposure against industry requirements to surface your highest-fit career pathways.',
  },
  {
    q: 'Does CharteredOS claim official affiliation with ICAI?',
    a: 'No. CharteredOS is an independent career operating system built specifically for Chartered Accountants. We strictly respect the ICAI Code of Ethics and professional conduct guidelines.',
  },
  {
    q: 'How are payments and GST invoicing handled for firms?',
    a: 'All purchases generate official GST tax invoices under Service Accounting Code (SAC) 998314 (Information Technology Software Services), supporting full B2B Input Tax Credit (ITC) for firms and employers.',
  },
  {
    q: 'How are user credentials and session data secured?',
    a: 'Passwords are encrypted using memory-hard scrypt hashing with per-user unique cryptographic salts. Sessions use short-lived JWT access tokens paired with secure HttpOnly refresh cookies.',
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
        <h2 className="text-[clamp(1.75rem,2.8vw,2.25rem)] font-semibold text-[#1C1917] tracking-tight leading-snug mb-3">
          Frequently asked questions
        </h2>
        <p className="text-[15px] text-[#57534E] leading-relaxed m-0">
          Answers regarding articleship verification, candidate confidentiality, compensation benchmarks, and platform security.
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
              className={`rounded-xl border transition-colors overflow-hidden bg-white ${
                isOpen
                  ? 'border-[#D6D3D1] shadow-xs'
                  : 'border-[#E7E5E4] hover:border-[#D6D3D1]'
              }`}
            >
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
              >
                <span className="text-[15px] font-medium text-[#1C1917] leading-snug">
                  {faq.q}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-[#F4F3EF] text-[#1E3A8A] rotate-180' : 'bg-[#FAF9F6] text-[#78716C]'
                  }`}
                >
                  <ChevronDown size={16} />
                </div>
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
                    transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-[14px] text-[#57534E] leading-relaxed border-t border-[#F5F5F4]">
                      <p className="m-0">{faq.a}</p>
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
