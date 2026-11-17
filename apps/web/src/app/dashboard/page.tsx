'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { JobDetail } from '@ca-career-os/shared';

export default function CandidateDashboardPage() {
  const { user, activeWorkspace, isAuthenticated, isLoading } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<JobDetail[]>([]);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'ARTICLESHIP' | 'JOBS'>('ALL');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [appRes, jobRes] = await Promise.all([
          isAuthenticated ? apiClient.get('/applications').catch(() => null) : Promise.resolve(null),
          apiClient.get<JobDetail[]>('/jobs?limit=20').catch(() => null),
        ]);

        if (isMounted) {
          if (appRes?.success && Array.isArray(appRes.data)) setApplications(appRes.data);
          if (jobRes?.success && Array.isArray(jobRes.data)) setJobs(jobRes.data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-500 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const candidateName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Candidate';
  const articleships = jobs.filter(
    (j) =>
      j.opportunityType === 'ARTICLESHIP' ||
      j.opportunityType === 'INDUSTRIAL_TRAINING' ||
      j.title.toLowerCase().includes('article') ||
      j.title.toLowerCase().includes('intern') ||
      j.title.toLowerCase().includes('trainee')
  );
  const generalJobs = jobs.filter(
    (j) =>
      j.opportunityType !== 'ARTICLESHIP' &&
      !j.title.toLowerCase().includes('article') &&
      !j.title.toLowerCase().includes('intern')
  );

  const displayedJobs =
    selectedTab === 'ARTICLESHIP'
      ? articleships
      : selectedTab === 'JOBS'
      ? generalJobs
      : jobs;

  return (
    <div className="flex flex-col gap-6 max-w-[1140px] mx-auto w-full text-black">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-black tracking-tight m-0">
              Welcome, {candidateName}
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-300">
              {activeWorkspace?.name || 'Personal Workspace'}
            </span>
          </div>
          <p className="text-[13px] text-neutral-600 m-0">
            Browse verified CA Articleship vacancies and Qualified Chartered Accountant jobs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/articleship"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-black text-white text-[13px] font-semibold hover:bg-neutral-800 transition-colors no-underline"
          >
            <GraduationCap size={15} />
            <span>Articleship Hub</span>
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white text-black border border-black text-[13px] font-semibold hover:bg-neutral-50 transition-colors no-underline"
          >
            <Briefcase size={14} />
            <span>CA Jobs</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-neutral-200 rounded-lg overflow-hidden bg-white">
        <Link
          href="/articleship"
          className="p-5 border-b sm:border-b-0 sm:border-r border-neutral-200 hover:bg-neutral-50 transition-colors no-underline text-inherit"
        >
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Articleship &amp; Trainees
          </span>
          <div className="text-[26px] font-extrabold text-black tracking-tight">
            {articleships.length > 0 ? `${articleships.length} Openings` : '50+ Openings'}
          </div>
          <span className="text-[12px] text-neutral-600 font-medium">
            Form 102/103 &amp; Form 104 Industrial Training
          </span>
        </Link>

        <Link
          href="/jobs"
          className="p-5 border-b sm:border-b-0 sm:border-r border-neutral-200 hover:bg-neutral-50 transition-colors no-underline text-inherit"
        >
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Qualified CA Jobs
          </span>
          <div className="text-[26px] font-extrabold text-black tracking-tight">
            {generalJobs.length > 0 ? `${generalJobs.length} Positions` : '200+ Positions'}
          </div>
          <span className="text-[12px] text-neutral-600 font-medium">
            Statutory Audit, Direct Tax, FP&amp;A &amp; M&amp;A
          </span>
        </Link>

        <div className="p-5 hover:bg-neutral-50 transition-colors">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Tracked Applications
          </span>
          <div className="text-[26px] font-extrabold text-black tracking-tight">
            {applications.length} Active
          </div>
          <span className="text-[12px] text-neutral-600 font-medium">
            Direct firm submissions
          </span>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Opportunities List */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-[16px] font-bold text-black m-0">
                Verified Vacancies
              </h2>
              <span className="text-[12px] text-neutral-500">
                Direct postings from authorized career portals
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex items-center gap-1 bg-neutral-100 p-1 rounded-md text-[12px]">
              <button
                type="button"
                onClick={() => setSelectedTab('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedTab === 'ALL'
                    ? 'bg-black text-white'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('ARTICLESHIP')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedTab === 'ARTICLESHIP'
                    ? 'bg-black text-white'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                Articleships
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('JOBS')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedTab === 'JOBS'
                    ? 'bg-black text-white'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                CA Jobs
              </button>
            </div>
          </div>

          {displayedJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-neutral-500 text-[13px]">
              No listings currently match this filter.
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-200">
              {displayedJobs.slice(0, 8).map((job) => {
                const targetUrl = job.applicationUrl || job.canonicalUrl || job.sourceUrl || '#';
                const isTrainee =
                  job.opportunityType === 'ARTICLESHIP' ||
                  job.opportunityType === 'INDUSTRIAL_TRAINING' ||
                  job.title.toLowerCase().includes('article') ||
                  job.title.toLowerCase().includes('intern');

                return (
                  <div
                    key={job.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 text-black">
                          {isTrainee ? 'Articleship' : 'Qualified CA'}
                        </span>
                        <span className="text-[13px] font-semibold text-black">
                          {job.companyName}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-[12px] text-neutral-500 flex items-center gap-1">
                          <MapPin size={11} /> {job.locationCity || 'India'}
                        </span>
                      </div>

                      <h3 className="text-[14px] font-bold text-black leading-snug m-0">
                        {job.title}
                      </h3>

                      {job.caPathway && (
                        <div className="text-[12px] text-neutral-500">
                          Pathway: {job.caPathway.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      {job.salaryDisclosed && job.salaryMin && job.salaryMax && (
                        <span className="text-[13px] font-bold text-black">
                          ₹{(job.salaryMin / 100000).toFixed(0)}L – ₹{(job.salaryMax / 100000).toFixed(0)}L
                        </span>
                      )}

                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded bg-black text-white hover:bg-neutral-800 transition-colors no-underline"
                      >
                        <span>Apply</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Application Tracker & Direct Links */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Quick Hub Navigation */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 mb-3 m-0">
              Quick Portals
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/articleship"
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-neutral-50 transition-colors text-black no-underline text-[13px] font-semibold border border-neutral-100"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} />
                  <span>Articleship Hub (Form 102/103)</span>
                </div>
                <ArrowRight size={13} className="text-neutral-400" />
              </Link>

              <Link
                href="/jobs"
                className="flex items-center justify-between p-2.5 rounded-md hover:bg-neutral-50 transition-colors text-black no-underline text-[13px] font-semibold border border-neutral-100"
              >
                <div className="flex items-center gap-2">
                  <Briefcase size={15} />
                  <span>CA Jobs &amp; Traineeships</span>
                </div>
                <ArrowRight size={13} className="text-neutral-400" />
              </Link>
            </div>
          </div>

          {/* Applications Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 m-0">
                Your Applications
              </h3>
              <span className="text-[11px] font-semibold text-neutral-500">
                {applications.length} Tracked
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 text-[13px] bg-neutral-50 rounded-md">
                <p className="m-0 mb-2">No active applications tracked yet.</p>
                <Link
                  href="/articleship"
                  className="text-black font-semibold text-[12px] hover:underline"
                >
                  Find Articleships →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {applications.slice(0, 4).map((app) => (
                  <div key={app.id} className="p-2.5 bg-neutral-50 rounded-md border border-neutral-100 text-[12px]">
                    <div className="font-bold text-black">{app.roleTitle || 'CA Opening'}</div>
                    <div className="text-neutral-500">{app.companyName || 'Firm'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
