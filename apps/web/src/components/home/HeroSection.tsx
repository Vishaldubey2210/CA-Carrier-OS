'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Briefcase,
  Search,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SampleJob {
  id: string;
  firm: string;
  role: string;
  category: 'ARTICLESHIP' | 'QUALIFIED' | 'INDUSTRIAL_TRAINING';
  typeLabel: string;
  location: string;
  compensation: string;
  exposure: string;
  url: string;
}

const FEATURED_OPPORTUNITIES: SampleJob[] = [
  {
    id: 'gt-audit-01',
    firm: 'Grant Thornton Bharat LLP',
    role: 'Senior Associate — Statutory Audit & Assurance',
    category: 'QUALIFIED',
    typeLabel: 'Qualified CA',
    location: 'Mumbai (Hybrid)',
    compensation: '₹14L – ₹18L / yr',
    exposure: 'CARO 2020, Ind AS 115, Listed Audits',
    url: 'https://gtbharat.com/careers',
  },
  {
    id: 'singhi-art-02',
    firm: 'Singhi & Co Chartered Accountants',
    role: 'CA Article Assistant (2-Year Scheme)',
    category: 'ARTICLESHIP',
    typeLabel: 'Articleship (Form 102/103)',
    location: 'Delhi NCR (Onsite)',
    compensation: '₹18,000 – ₹25,000 / mo',
    exposure: 'Tax Audit (Form 3CD), Statutory Audit, GST Filings',
    url: 'https://singhico.com/careers',
  },
  {
    id: 'deloitte-ind-03',
    firm: 'Deloitte India Advisory',
    role: 'CA Industrial Trainee — Financial Reporting',
    category: 'INDUSTRIAL_TRAINING',
    typeLabel: 'Industrial Training (Form 104)',
    location: 'Bengaluru (Hybrid)',
    compensation: '₹45,000 – ₹55,000 / mo',
    exposure: 'Ind AS 116 Leases, Internal Financial Controls',
    url: 'https://www2.deloitte.com/in/en/careers',
  },
  {
    id: 'bdo-fdd-04',
    firm: 'BDO India LLP',
    role: 'Manager — Financial Due Diligence & M&A',
    category: 'QUALIFIED',
    typeLabel: 'Qualified CA',
    location: 'Bengaluru (Onsite)',
    compensation: '₹22L – ₹28L / yr',
    exposure: 'Quality of Earnings (QoE), Working Capital Pacing',
    url: 'https://bdo.in/careers',
  },
  {
    id: 'razorpay-fpa-05',
    firm: 'Razorpay Software',
    role: 'Senior Manager — Corporate FP&A',
    category: 'QUALIFIED',
    typeLabel: 'Qualified CA',
    location: 'Bengaluru (Hybrid)',
    compensation: '₹26L – ₹34L / yr',
    exposure: '3-Statement Financial Modeling, SaaS Unit Economics',
    url: 'https://boards.greenhouse.io/razorpay',
  },
];

export function HeroSection() {
  const { demoLogin } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ARTICLESHIP' | 'QUALIFIED'>('ALL');

  const filteredList = useMemo(() => {
    return FEATURED_OPPORTUNITIES.filter((item) => {
      if (selectedFilter === 'ARTICLESHIP' && item.category === 'QUALIFIED') return false;
      if (selectedFilter === 'QUALIFIED' && item.category !== 'QUALIFIED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.firm.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q) ||
          item.exposure.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedFilter]);

  const handleLaunchDemo = async () => {
    try {
      const res = await demoLogin('CANDIDATE');
      if (res.success) {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  };

  return (
    <section className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
      {/* 1. Masthead */}
      <div className="max-w-[760px] mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F3EF] border border-[#E7E5E4] text-[13px] text-[#44403C] mb-5">
          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          <span>ICAI Regulation 51 &amp; Form 108 Aligned Platform</span>
        </div>

        <h1 className="text-[clamp(2rem,3.8vw,3.25rem)] font-semibold text-[#1C1917] tracking-tight leading-[1.2] mb-4">
          A calm, professional workspace for Chartered Accountants
        </h1>

        <p className="text-[clamp(1rem,1.15vw,1.125rem)] text-[#57534E] leading-relaxed max-w-[640px] mx-auto mb-8 font-normal">
          Verified articleships, corporate industrial training, and qualified CA openings across India. With Form 108 practical hours attestation, transparent stipends, and complete candidate privacy.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/articleship"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-[14px] font-medium shadow-xs transition-colors"
          >
            <GraduationCap size={16} />
            <span>Articleship Hub</span>
          </Link>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#F5F5F4] text-[#1C1917] border border-[#D6D3D1] text-[14px] font-medium shadow-xs transition-colors"
          >
            <Briefcase size={15} />
            <span>Qualified CA Jobs</span>
          </Link>

          <button
            type="button"
            onClick={handleLaunchDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
          >
            <span>Explore instant demo</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Live Opportunity Board (Clean, soft, no eye strain) */}
      <div className="w-full bg-white border border-[#E7E5E4] rounded-xl shadow-xs overflow-hidden">
        {/* Search & Filter Strip */}
        <div className="p-4 sm:p-5 border-b border-[#F5F5F4] bg-[#FAF9F6] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-[420px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]"
            />
            <input
              type="text"
              placeholder="Search by firm, discipline (Audit, Ind AS, Tax), or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] text-[#1C1917] bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 placeholder:text-[#A8A29E] transition-all"
            />
          </div>

          <div className="inline-flex items-center gap-1 bg-[#F5F5F4] p-1 rounded-lg self-start sm:self-auto text-[12px]">
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'ALL'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              All Openings
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('ARTICLESHIP')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'ARTICLESHIP'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Articleship &amp; Trainees
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('QUALIFIED')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'QUALIFIED'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Qualified CAs
            </button>
          </div>
        </div>

        {/* Opportunity Rows */}
        <div className="divide-y divide-[#F5F5F4]">
          {filteredList.map((job) => {
            const isArticleship =
              job.category === 'ARTICLESHIP' || job.category === 'INDUSTRIAL_TRAINING';

            return (
              <div
                key={job.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        isArticleship
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#F0FDF4] text-[#166534]'
                      }`}
                    >
                      {job.typeLabel}
                    </span>
                    <span className="text-[12px] font-medium text-[#78716C]">
                      {job.firm}
                    </span>
                    <span className="text-[12px] text-[#A8A29E]">•</span>
                    <span className="text-[12px] text-[#78716C] flex items-center gap-1">
                      <MapPin size={11} /> {job.location}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#1C1917] leading-snug">
                    {job.role}
                  </h3>

                  <div className="text-[12px] text-[#78716C]">
                    <span>Exposure: {job.exposure}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F5F4]">
                  <span className="text-[13px] font-semibold text-[#1C1917]">
                    {job.compensation}
                  </span>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1E3A8A] hover:text-[#172554] transition-colors"
                  >
                    <span>Apply</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link Strip */}
        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#E7E5E4] flex items-center justify-between text-[12px] text-[#78716C]">
          <span>Verified feeds updated hourly • Zero agency intermediary fees</span>
          <Link
            href="/articleship"
            className="text-[#1E3A8A] hover:text-[#172554] font-medium inline-flex items-center gap-1"
          >
            <span>View all 480+ vacancies</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
