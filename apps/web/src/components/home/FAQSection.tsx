'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
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
  const [activeFaq, setActiveFaq] = useState<number | null>(0); // First item open by default

  const toggleFaq = (idx: number) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  // Structured Data JSON-LD for FAQPage
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
      className="py-16 sm:py-24 px-4 sm:px-6 max-w-[900px] mx-auto w-full"
    >
      {/* FAQ Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Section Header */}
      <div className="text-center max-w-[700px] mx-auto mb-10 sm:mb-12">
        <span className="editorial-step">
          06 — CLARITY & TRUST
        </span>
        <h2 className="text-[clamp(1.875rem,3.5vw,2.75rem)] font-bold text-[#0F172A] tracking-tight leading-tight mt-2 mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-[16px] text-[#334155] leading-relaxed max-w-[65ch] mx-auto m-0">
          Direct answers regarding career diagnostics, candidate confidentiality, compensation benchmarks, and platform security.
        </p>
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = activeFaq === idx;
          const buttonId = `faq-btn-${idx}`;
          const contentId = `faq-content-${idx}`;

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-200 overflow-hidden bg-white ${
                isOpen
                  ? 'border-[#CBD5E1] shadow-card'
                  : 'border-[#E2E8F0] shadow-2xs hover:border-[#CBD5E1]'
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
                <span className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] leading-snug">
                  {faq.q}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-[#EEF2F6] text-[#1E3A8A] rotate-180' : 'bg-[#F8FAFC] text-[#64748B]'
                  }`}
                >
                  <ChevronDown size={18} />
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
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-[14px] text-[#475569] leading-relaxed border-t border-[#F1F5F9]">
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
