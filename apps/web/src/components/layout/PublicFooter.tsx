'use client';

import React from 'react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-white/60 bg-white/40 backdrop-blur-md text-neutral-600 mt-auto"
      style={{
        padding: '3rem 1.5rem 2rem',
      }}
    >
      <div className="max-w-[1120px] mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 no-underline"
              aria-label="EZapply Home"
            >
              <div className="w-8 h-8 rounded-lg bg-[#09090B] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                EZ
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-black text-base tracking-tight leading-tight">
                  EZapply
                </span>
                <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                  Career &amp; Application OS
                </span>
              </div>
            </Link>

            <p className="text-[13px] text-neutral-600 leading-relaxed max-w-[300px] m-0">
              The smart, one-click application platform and career copilot for every professional across Tech, Finance, Consulting, Legal, and Accounting.
            </p>
          </div>

          {/* Column 2: Opportunities */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[12px] font-bold text-black uppercase tracking-wider m-0">
              Opportunities
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
              <li>
                <Link href="/jobs" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  All Verified Jobs (Tech, Finance, Legal)
                </Link>
              </li>
              <li>
                <Link href="/articleship" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Articleship Hub (Form 102/103)
                </Link>
              </li>
              <li>
                <Link href="/articleship" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Industrial Training (Form 104)
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Pricing Plans (₹99 &amp; ₹199)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[12px] font-bold text-black uppercase tracking-wider m-0">
              Support &amp; Help
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
              <li>
                <Link href="/faq" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Help Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[12px] font-bold text-black uppercase tracking-wider m-0">
              Legal
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-[13px]">
              <li>
                <Link href="/privacy" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-600 hover:text-black transition-colors no-underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-neutral-500">
          <p className="m-0">
            © {new Date().getFullYear()} EZapply. Smart, verified applications &amp; career copilot for all professionals.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-neutral-500 hover:text-black transition-colors no-underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-neutral-500 hover:text-black transition-colors no-underline">
              Terms
            </Link>
            <Link href="/contact" className="text-neutral-500 hover:text-black transition-colors no-underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
