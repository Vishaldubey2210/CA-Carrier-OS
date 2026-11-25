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
  category: 'TECH' | 'FINANCE' | 'CONSULTING' | 'ARTICLESHIP' | 'QUALIFIED' | 'INDUSTRIAL_TRAINING';
  typeLabel: string;
  location: string;
  compensation: string;
  exposure: string;
  url: string;
}

const FEATURED_OPPORTUNITIES: SampleJob[] = [
  {
    id: 'google-swe-01',
    firm: 'Google India',
    role: 'Senior Software Engineer (Distributed Systems & Cloud Core)',
    category: 'TECH',
    typeLabel: 'Tech & Engineering',
    location: 'Bengaluru (Hybrid)',
    compensation: '₹45L – ₹65L / yr',
    exposure: 'Distributed Infrastructure, High-Throughput APIs, Kubernetes, Go',
    url: 'https://careers.google.com',
  },
  {
    id: 'gs-quant-02',
    firm: 'Goldman Sachs India',
    role: 'Financial Analyst & Investment Banking Associate',
    category: 'FINANCE',
    typeLabel: 'Finance & Banking',
    location: 'Bengaluru (Hybrid)',
    compensation: '₹28L – ₹38L / yr',
    exposure: 'LBO Modeling, M&A Valuation, Financial Risk Engineering',
    url: 'https://www.goldmansachs.com/careers',
  },
  {
    id: 'mckinsey-strat-03',
    firm: 'McKinsey & Company',
    role: 'Management Consultant — Corporate Strategy & Operations',
    category: 'CONSULTING',
    typeLabel: 'Consulting & Strategy',
    location: 'Mumbai / Delhi (Hybrid)',
    compensation: '₹32L – ₹42L / yr',
    exposure: 'Digital Transformation, Growth Strategy, Private Equity Diligence',
    url: 'https://www.mckinsey.com/careers',
  },
  {
    id: 'gt-audit-04',
    firm: 'Grant Thornton Bharat LLP',
    role: 'Senior Associate — Statutory Audit & Assurance',
    category: 'QUALIFIED',
    typeLabel: 'Chartered Accountant',
    location: 'Mumbai (Hybrid)',
    compensation: '₹14L – ₹18L / yr',
    exposure: 'CARO 2020, Ind AS 115, Listed Entity Audits',
    url: 'https://gtbharat.com/careers',
  },
  {
    id: 'singhi-art-05',
    firm: 'Singhi & Co Chartered Accountants',
    role: 'CA Article Assistant (2-Year Practical Scheme)',
    category: 'ARTICLESHIP',
    typeLabel: 'Articleship (Form 102/103)',
    location: 'Delhi NCR (Onsite)',
    compensation: '₹18,000 – ₹25,000 / mo',
    exposure: 'Tax Audit (Form 3CD), Statutory Audit, GST Direct Filings',
    url: 'https://singhico.com/careers',
  },
  {
    id: 'deloitte-ind-06',
    firm: 'Deloitte India Advisory',
    role: 'CA Industrial Trainee — Corporate Finance & Ind AS',
    category: 'INDUSTRIAL_TRAINING',
    typeLabel: 'Industrial Training (Form 104)',
    location: 'Bengaluru (Hybrid)',
    compensation: '₹45,000 – ₹55,000 / mo',
    exposure: 'Ind AS 116 Leases, Internal Financial Controls (IFC), SAP S/4HANA',
    url: 'https://www2.deloitte.com/in/en/careers',
  },
  {
    id: 'razorpay-eng-07',
    firm: 'Razorpay Software',
    role: 'Staff Platform Engineer — Payments & Fintech Infrastructure',
    category: 'TECH',
    typeLabel: 'Tech & Engineering',
    location: 'Bengaluru (Hybrid)',
    compensation: '₹40L – ₹52L / yr',
    exposure: 'Payment Gateways, High-Availability Systems, Node.js & Go',
    url: 'https://boards.greenhouse.io/razorpay',
  },
];

export function HeroSection() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'TECH' | 'FINANCE' | 'CONSULTING' | 'ARTICLESHIP'>('ALL');

  const filteredList = useMemo(() => {
    return FEATURED_OPPORTUNITIES.filter((item) => {
      if (selectedFilter === 'TECH' && item.category !== 'TECH') return false;
      if (selectedFilter === 'FINANCE' && item.category !== 'FINANCE' && item.category !== 'QUALIFIED') return false;
      if (selectedFilter === 'CONSULTING' && item.category !== 'CONSULTING') return false;
      if (selectedFilter === 'ARTICLESHIP' && item.category !== 'ARTICLESHIP' && item.category !== 'INDUSTRIAL_TRAINING') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.firm.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q) ||
          item.exposure.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.typeLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <section className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
      {/* 1. Masthead */}
      <div className="max-w-[760px] mx-auto text-center mb-10">
        {/* Frosted Glass Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[12px] font-medium text-neutral-800 mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold text-neutral-900">EZapply</span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-600">The Career Operating System for All Professionals</span>
        </div>

        <h1 className="text-[clamp(2.1rem,3.6vw,3.25rem)] font-extrabold text-[#09090B] tracking-tight leading-[1.16] mb-4">
          Smart Applications &amp; Career OS for Every Professional
        </h1>

        <p className="text-[clamp(1rem,1.15vw,1.125rem)] text-neutral-600 leading-relaxed max-w-[660px] mx-auto mb-6 font-normal">
          Whether you&apos;re in Tech, Finance, Consulting, Legal, or CA Articleship—discover verified opportunities, dispatch cold emails, and track applications with EZapply.
        </p>

        {/* Frosted Glass Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8 text-[12px] text-neutral-700">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Tech &amp; Software Roles</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Finance &amp; Banking</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Consulting &amp; Strategy</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>CA Articleship &amp; Jobs</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>1-Click Cold Mailer</span>
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#09090B] hover:bg-neutral-800 text-white text-[14px] font-semibold transition-all shadow-md no-underline"
          >
            <Briefcase size={16} />
            <span>Explore All Jobs</span>
          </Link>

          <Link
            href="/articleship"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg glass-pill text-[#09090B] hover:bg-white text-[14px] font-semibold transition-all no-underline"
          >
            <GraduationCap size={15} />
            <span>Articleship &amp; Internships</span>
          </Link>

          <Link
            href="/dashboard?tab=outreach"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg glass-pill text-neutral-700 hover:text-black text-[13px] font-semibold transition-all no-underline"
          >
            <Mail size={14} />
            <span>Cold Mailer</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] text-neutral-600 hover:text-black transition-colors cursor-pointer no-underline"
          >
            <span>Sign In</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 2. Opportunity Board - Frosted Glassmorphism Panel */}
      <div className="w-full glass-card overflow-hidden">
        {/* Search & Filter Strip */}
        <div className="p-4 sm:p-5 border-b border-white/60 bg-white/40 backdrop-blur-md flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-[420px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search by role, company, skills, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] text-black glass-input rounded-lg placeholder:text-neutral-400"
            />
          </div>

          <div className="inline-flex items-center gap-1 bg-black/5 backdrop-blur-md p-1 rounded-lg border border-white/50 self-start sm:self-auto text-[12px] flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'ALL'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              All Roles
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('TECH')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'TECH'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Tech &amp; Engineering
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('FINANCE')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'FINANCE'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Finance &amp; Banking
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('CONSULTING')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'CONSULTING'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Consulting
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('ARTICLESHIP')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                selectedFilter === 'ARTICLESHIP'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Articleship &amp; Trainees
            </button>
          </div>
        </div>

        {/* Opportunity Rows */}
        <div className="divide-y divide-white/50">
          {filteredList.map((job) => {
            const isArticleship = job.category === 'ARTICLESHIP' || job.category === 'INDUSTRIAL_TRAINING';
            return (
              <div
                key={job.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/60 backdrop-blur-xs transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        isArticleship
                          ? 'border-emerald-200/80 bg-emerald-50/80 text-emerald-800'
                          : 'border-neutral-200/80 bg-neutral-100/80 text-neutral-800'
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

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/50">
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
        <div className="p-3.5 bg-white/40 backdrop-blur-md border-t border-white/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[12px] text-neutral-600">
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
