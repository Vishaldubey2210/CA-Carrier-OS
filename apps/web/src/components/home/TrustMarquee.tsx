'use client';

import React from 'react';
import {
  Compass,
  TrendingUp,
  FileText,
  Lock,
  Briefcase,
  Layers,
  Award,
  Calculator,
} from 'lucide-react';

export function TrustMarquee() {
  const marqueeItems = [
    {
      icon: Compass,
      label: 'Statutory Audit & Assurance',
      color: '#1E3A8A',
    },
    {
      icon: FileText,
      label: 'Corporate Tax & Transfer Pricing',
      color: '#059669',
    },
    {
      icon: TrendingUp,
      label: 'FP&A & Strategic Finance',
      color: '#0284C7',
    },
    {
      icon: Briefcase,
      label: 'M&A & Deal Advisory',
      color: '#7C3AED',
    },
    {
      icon: Award,
      label: 'Management Consulting',
      color: '#D97706',
    },
    {
      icon: Lock,
      label: 'Confidential Career Search',
      color: '#1E3A8A',
    },
    {
      icon: Layers,
      label: '7 Specialized Horizons',
      color: '#059669',
    },
    {
      icon: Calculator,
      label: 'In-Hand Take-Home CTC Calculator',
      color: '#0284C7',
    },
  ];

  return (
    <div
      aria-label="Core Competencies Ticker"
      className="w-full max-w-[1200px] mx-auto px-4 py-5"
    >
      <div className="marquee-container">
        <div className="marquee-track flex gap-4 sm:gap-6">
          {/* Set 1 */}
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`m1-${idx}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-2xs text-[13px] font-medium text-[#475569] shrink-0 hover:border-[#1E3A8A] hover:text-[#0F172A] transition-colors"
              >
                <Icon size={14} style={{ color: item.color }} className="shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}

          {/* Set 2 (Duplicate for continuous loop) */}
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`m2-${idx}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-2xs text-[13px] font-medium text-[#475569] shrink-0 hover:border-[#1E3A8A] hover:text-[#0F172A] transition-colors"
              >
                <Icon size={14} style={{ color: item.color }} className="shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
