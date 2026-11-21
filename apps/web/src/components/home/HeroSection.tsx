'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Briefcase,
  Search,
  MapPin,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Building,
  Mail,
  Zap,
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
    <section className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
      {/* 1. Masthead */}
      <div className="max-w-[760px] mx-auto text-center mb-10">
        {/* Status Pill with Emerald Pulsing Dot */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 text-[12px] font-medium text-neutral-800 bg-white shadow-xs mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold text-neutral-900">5,000+ Verified CA Firms</span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-600">Form 102/103 &amp; Qualified Openings</span>
        </div>

        <h1 className="text-[clamp(2.1rem,3.6vw,3.25rem)] font-extrabold text-[#09090B] tracking-tight leading-[1.16] mb-4">
          Verified CA Articleship &amp; Placement Network
        </h1>

        <p className="text-[clamp(1rem,1.15vw,1.125rem)] text-neutral-600 leading-relaxed max-w-[620px] mx-auto mb-6 font-normal">
          The simplest and easiest way to search verified Articleship openings (Form 102/103), Corporate Industrial Training (Form 104), and Qualified Chartered Accountant jobs in India.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-[12px] text-neutral-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Form 102/103 2-Yr Scheme</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Form 104 Industrial Training</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>1-Click Mass Outreach</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 border border-neutral-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>₹99 / ₹199 Transparent Pricing</span>
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/articleship"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#09090B] hover:bg-neutral-800 text-white text-[14px] font-semibold transition-all shadow-sm no-underline"
          >
            <GraduationCap size={16} />
            <span>Articleship Hub (₹99)</span>
          </Link>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white hover:bg-neutral-50 text-[#09090B] border border-neutral-300 text-[14px] font-semibold transition-all shadow-xs no-underline"
          >
            <Briefcase size={15} />
            <span>CA Jobs (₹199)</span>
          </Link>

          <button
            type="button"
            onClick={handleLaunchDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] text-neutral-600 hover:text-black transition-colors cursor-pointer"
          >
            <span>Live Demo</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Opportunity Board - Executive Monochrome & Emerald Accent */}
      <div className="w-full bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
        {/* Search & Filter Strip */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-[420px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search by firm, discipline, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] text-black bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-black placeholder:text-neutral-400 transition-all"
            />
          </div>

          <div className="inline-flex items-center gap-1 bg-neutral-200/80 p-1 rounded-md self-start sm:self-auto text-[12px]">
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded transition-all cursor-pointer font-medium ${
                selectedFilter === 'ALL'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              All Openings
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('ARTICLESHIP')}
              className={`px-3 py-1 rounded transition-all cursor-pointer font-medium ${
                selectedFilter === 'ARTICLESHIP'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Articleship &amp; Trainees
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('QUALIFIED')}
              className={`px-3 py-1 rounded transition-all cursor-pointer font-medium ${
                selectedFilter === 'QUALIFIED'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Qualified CAs
            </button>
          </div>
        </div>

        {/* Opportunity Rows */}
        <div className="divide-y divide-neutral-200">
          {filteredList.map((job) => {
            const isArticleship = job.category === 'ARTICLESHIP' || job.category === 'INDUSTRIAL_TRAINING';
            return (
              <div
                key={job.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        isArticleship
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-neutral-200 bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {job.typeLabel}
                    </span>
                    <span className="text-[13px] font-semibold text-black flex items-center gap-1">
                      {job.firm}
                      <CheckCircle2 size={13} className="text-emerald-600 inline-block" />
                    </span>
                    <span className="text-[12px] text-neutral-400">•</span>
                    <span className="text-[12px] text-neutral-600 flex items-center gap-1">
                      <MapPin size={11} /> {job.location}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#09090B] leading-snug">
                    {job.role}
                  </h3>

                  <div className="text-[12px] text-neutral-500">
                    <span>Exposure: {job.exposure}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                  <span className="text-[13px] font-bold text-black">
                    {job.compensation}
                  </span>

                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <span>Apply Direct</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link Strip */}
        <div className="p-3.5 bg-neutral-50/80 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] text-neutral-600">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>5,000 CA Firms Indexed via Schema.org &amp; Direct Career Portals</span>
          </span>
          <div className="flex gap-4">
            <Link
              href="/articleship"
              className="text-black hover:underline font-semibold inline-flex items-center gap-1 no-underline"
            >
              <span>View Articleships</span>
              <ArrowRight size={12} />
            </Link>
            <Link
              href="/jobs"
              className="text-black hover:underline font-semibold inline-flex items-center gap-1 no-underline"
            >
              <span>View CA Jobs</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
