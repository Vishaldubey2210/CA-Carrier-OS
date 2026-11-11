'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-[#E7E5E4] bg-white text-[#44403C] mt-auto transition-colors"
      style={{
        borderTop: '1px solid #E7E5E4',
        backgroundColor: '#FFFFFF',
        padding: '3.5rem 1.5rem 2.5rem',
      }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
        {/* Clean 4-Column Layout (1 col mobile, 2 cols tablet, 4 cols desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 no-underline group focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-md outline-none"
              aria-label="CharteredOS Home"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                CO
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[#0F172A] text-lg tracking-tight leading-tight">
                  CharteredOS
                </span>
                <span className="text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                  Career platform for CAs
                </span>
              </div>
            </Link>

            <p className="text-[14px] text-[#475569] leading-relaxed max-w-[320px] m-0">
              The modern career platform engineered exclusively for Indian Chartered Accountants, finance professionals, and accounting firms.
            </p>
          </div>

          {/* Column 2: Product & Platform */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider m-0">
              Product & Platform
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-[14px]">
              <li>
                <Link href="/features" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  All Capabilities
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Systematic Workflow
                </Link>
              </li>
              <li>
                <Link href="/career" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  7 Career Horizons
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Verified Job Discovery
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Practice Management OS
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Help */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider m-0">
              Company & Help
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-[14px]">
              <li>
                <Link href="/about" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  About the Platform
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Member Support
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  CA Talent Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider m-0">
              Legal & Compliance
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-[14px]">
              <li>
                <Link href="/privacy" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Security & Governance
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[#475569] hover:text-[#1E3A8A] transition-colors no-underline">
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Quick Links */}
        <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#64748B]">
          <p className="m-0 text-center sm:text-left">
            © {new Date().getFullYear()} CharteredOS. All rights reserved. Built for Indian Chartered Accountants.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-[#64748B] hover:text-[#0F172A] transition-colors no-underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-[#64748B] hover:text-[#0F172A] transition-colors no-underline">
              Terms
            </Link>
            <Link href="/security" className="text-[#64748B] hover:text-[#0F172A] transition-colors no-underline">
              Security
            </Link>
            <Link href="/contact" className="text-[#64748B] hover:text-[#0F172A] transition-colors no-underline">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
