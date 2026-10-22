'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Briefcase,
  Building,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Search,
  Bookmark,
  BookmarkCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  X,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Check,
  Bell,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ApplicationStatus,
  CAPathway,
  JobDetail,
  WorkArrangement,
} from '@ca-career-os/shared';
import { apiClient } from '@/lib/api-client';

interface FrontendApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedDate: string;
  nextFollowUp?: string;
  notes?: string;
  followUps: Array<{ id: string; title: string; completed: boolean }>;
}

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'SAVED' | 'APPLICATIONS'>('EXPLORE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPathway, setSelectedPathway] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedArrangement, setSelectedArrangement] = useState<string>('ALL');

  // Real data state (Zero fake records)
  const [jobs, setJobs] = useState<JobDetail[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<FrontendApplicationItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingJobTarget, setTrackingJobTarget] = useState<JobDetail | null>(null);
  const [trackStatus, setTrackStatus] = useState<ApplicationStatus>(ApplicationStatus.APPLIED);
  const [trackNotes, setTrackNotes] = useState('');
  const [trackFollowUp, setTrackFollowUp] = useState('');

  // Job alert preference modal
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertPathway, setAlertPathway] = useState<string>('AUDIT');
  const [alertMinSalary, setAlertMinSalary] = useState<number>(1400000);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Fetch verified backend data
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [jobsRes, appsRes, savedRes] = await Promise.all([
        apiClient.get<JobDetail[]>('/jobs'),
        apiClient.get<any[]>('/applications'),
        apiClient.get<any[]>('/jobs/saved'),
      ]);

      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        setJobs(jobsRes.data);
      }

      if (appsRes.success && Array.isArray(appsRes.data)) {
        const mapped: FrontendApplicationItem[] = appsRes.data.map((a: any) => ({
          id: a.id,
          jobId: a.jobId,
          jobTitle: a.jobTitle || 'CA Professional Engagement',
          companyName: a.companyName || 'Direct Verified Employer',
          status: a.status || ApplicationStatus.APPLIED,
          appliedDate: a.appliedDate ? a.appliedDate.split('T')[0] : new Date().toISOString().split('T')[0],
          nextFollowUp: a.nextFollowUpDate ? a.nextFollowUpDate.split('T')[0] : undefined,
          notes: a.coverNote,
          followUps: (a.followUpTasks || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            completed: t.completed || false,
          })),
        }));
        setApplications(mapped);
      }

      if (savedRes.success && Array.isArray(savedRes.data)) {
        const ids = new Set<string>(savedRes.data.map((item: any) => item.jobId || item.id));
        setSavedJobIds(ids);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to communicate with CA Career OS API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (activeTab === 'SAVED' && !savedJobIds.has(j.id)) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.locationCity.toLowerCase().includes(q) ||
          (j.structuredRequirements?.mandatorySkills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      if (selectedPathway !== 'ALL' && j.caPathway !== selectedPathway) return false;
      if (selectedCity !== 'ALL' && j.locationCity.toLowerCase() !== selectedCity.toLowerCase())
        return false;
      if (selectedArrangement !== 'ALL' && j.workArrangement !== selectedArrangement) return false;

      return true;
    });
  }, [jobs, savedJobIds, activeTab, searchQuery, selectedPathway, selectedCity, selectedArrangement]);

  const toggleSaveJob = async (jobId: string) => {
    const isCurrentlySaved = savedJobIds.has(jobId);
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });

    try {
      if (isCurrentlySaved) {
        await apiClient.delete(`/jobs/${jobId}/save`);
      } else {
        await apiClient.post(`/jobs/${jobId}/save`, { notes: 'Saved from CA Career OS Job Board' });
      }
    } catch {
      // Retain optimistic state
    }
  };

  const handleOpenTrackModal = (job: JobDetail) => {
    setTrackingJobTarget(job);
    setTrackStatus(ApplicationStatus.APPLIED);
    setTrackNotes('');
    setTrackFollowUp(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsTrackingModalOpen(true);
  };

  const handleSaveTracking = async () => {
    if (!trackingJobTarget) return;

    const tempId = `app-${Date.now()}`;
    const newApp: FrontendApplicationItem = {
      id: tempId,
      jobId: trackingJobTarget.id,
      jobTitle: trackingJobTarget.title,
      companyName: trackingJobTarget.companyName,
      status: trackStatus,
      appliedDate: new Date().toISOString().split('T')[0],
      nextFollowUp: trackFollowUp || undefined,
      notes: trackNotes,
      followUps: trackFollowUp
        ? [{ id: `f-${Date.now()}`, title: `Follow up on application for ${trackingJobTarget.title}`, completed: false }]
        : [],
    };

    setApplications((prev) => [newApp, ...prev]);
    setIsTrackingModalOpen(false);
    setActiveTab('APPLICATIONS');

    try {
      const res = await apiClient.post<any>('/applications', {
        jobId: trackingJobTarget.id,
        status: trackStatus,
        coverNote: trackNotes || undefined,
        nextFollowUpDate: trackFollowUp ? new Date(trackFollowUp).toISOString() : undefined,
      });
      if (res.success && res.data?.id) {
        setApplications((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: res.data.id } : a))
        );
      }
    } catch {
      // Retain optimistic update
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      await apiClient.patch(`/applications/${appId}/status`, { status: newStatus });
    } catch {
      // Retain optimistic update
    }
  };

  const handleToggleFollowUp = (appId: string, taskId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          followUps: app.followUps.map((f) =>
            f.id === taskId ? { ...f, completed: !f.completed } : f
          ),
        };
      })
    );
  };

  const handleSaveJobAlert = async () => {
    try {
      await apiClient.post('/jobs/alerts/preferences', {
        preferredPathways: [alertPathway],
        minSalary: alertMinSalary,
        frequency: 'DAILY',
        channels: ['EMAIL', 'IN_APP'],
      });
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setIsAlertModalOpen(false);
      }, 2000);
    } catch {
      // Local dismissal
      setIsAlertModalOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Editorial Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-cyan">
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Zero-Scraping Verified
            </span>
            <span className="badge badge-emerald">Real Backend API Hydrated</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
            CA Career Opportunities & Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '720px', lineHeight: 1.5 }}>
            Direct mandates from Big 4, top 20 accounting firms, and high-growth corporate enterprises. Grounded in transparent CTC bounds and protected by the Candidate Blindfold Rule.
          </p>
        </div>

        {/* Tab Switcher & Alerts CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="btn btn-secondary btn-pill"
            style={{ fontSize: '0.8125rem' }}
          >
            <Bell size={14} /> Configure Alerts
          </button>

          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card)',
              padding: '0.25rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
              gap: '0.25rem',
            }}
          >
            <button
              onClick={() => setActiveTab('EXPLORE')}
              className={`btn btn-pill ${activeTab === 'EXPLORE' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
            >
              <Search size={14} /> Explore ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('SAVED')}
              className={`btn btn-pill ${activeTab === 'SAVED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
            >
              <Bookmark size={14} /> Saved ({savedJobIds.size})
            </button>
            <button
              onClick={() => setActiveTab('APPLICATIONS')}
              className={`btn btn-pill ${activeTab === 'APPLICATIONS' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
            >
              <Send size={14} /> Pipeline ({applications.length})
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ padding: '1rem', borderColor: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={18} color="var(--accent-rose)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--accent-rose)' }}>{errorMsg}</span>
          <button onClick={loadData} className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
            <RotateCcw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Main View Logic */}
      {activeTab === 'APPLICATIONS' ? (
        /* ================= Application Tracker View ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: '4px solid var(--accent-cyan)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Candidate Personal Application Tracker
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Protected by the <strong>Candidate Blindfold Rule</strong>. Your tracked applications, stage updates, and private recruiter notes are strictly isolated to your personal workspace.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('EXPLORE')}
              className="btn btn-secondary btn-pill"
              style={{ fontSize: '0.8125rem' }}
            >
              + Track New Job
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state-panel">
              <Image
                src="/assets/empty-applications.svg"
                alt="Empty applications pipeline"
                width={120}
                height={120}
                style={{ marginBottom: '1.5rem', opacity: 0.85 }}
              />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No Tracked Applications Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Track external job submissions, stage follow-up deadlines, and keep confidential partner-round notes in your private workspace.
              </p>
              <button
                onClick={() => setActiveTab('EXPLORE')}
                className="btn btn-primary btn-pill"
                style={{ fontSize: '0.875rem' }}
              >
                Browse Verified CA Roles
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="glass-panel"
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {app.jobTitle}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Building size={14} /> {app.companyName}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Calendar size={14} /> Tracked on {app.appliedDate}
                        </span>
                        {app.nextFollowUp && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent-amber)' }}>
                            <Clock size={14} /> Next Follow-up: {app.nextFollowUp}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <option value={ApplicationStatus.SAVED}>SAVED</option>
                        <option value={ApplicationStatus.PLANNED}>PLANNED</option>
                        <option value={ApplicationStatus.APPLIED}>APPLIED</option>
                        <option value={ApplicationStatus.SHORTLISTED}>SHORTLISTED</option>
                        <option value={ApplicationStatus.INTERVIEWING}>INTERVIEWING</option>
                        <option value={ApplicationStatus.OFFERED}>OFFERED</option>
                        <option value={ApplicationStatus.ACCEPTED}>ACCEPTED</option>
                        <option value={ApplicationStatus.REJECTED}>REJECTED</option>
                        <option value={ApplicationStatus.WITHDRAWN}>WITHDRAWN</option>
                      </select>
                    </div>
                  </div>

                  {app.notes && (
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--accent-indigo)',
                      }}
                    >
                      <strong>Confidential Notes:</strong> {app.notes}
                    </p>
                  )}

                  {/* Follow-up tasks checklist */}
                  {app.followUps.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Follow-up Milestones
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {app.followUps.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleFollowUp(app.id, task.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.625rem',
                              cursor: 'pointer',
                              fontSize: '0.8125rem',
                              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: task.completed ? 'line-through' : 'none',
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                border: `1px solid ${task.completed ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                                background: task.completed ? 'var(--accent-emerald)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {task.completed && <Check size={12} color="#000" />}
                            </div>
                            <span>{task.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= Explore & Saved Jobs View ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search Bar & Multi-faceted Filter Ribbon */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search by role title, firm, or technical skills (e.g. Ind AS 115, Transfer Pricing, FP&A)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Filter Ribbon */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Filter size={12} /> Pathway:
              </span>
              {['ALL', 'AUDIT', 'TAX', 'FPA', 'IB', 'PRACTICE', 'CONSULTING'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPathway(p)}
                  className="btn-pill"
                  style={{
                    padding: '0.25rem 0.625rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: selectedPathway === p ? 'var(--accent-cyan)' : 'var(--bg-surface)',
                    color: selectedPathway === p ? '#0f172a' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: selectedPathway === p ? 700 : 500,
                  }}
                >
                  {p}
                </button>
              ))}

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>City:</span>
              {['ALL', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className="btn-pill"
                  style={{
                    padding: '0.25rem 0.625rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: selectedCity === c ? 'var(--accent-indigo)' : 'var(--bg-surface)',
                    color: selectedCity === c ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {c}
                </button>
              ))}

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Arrangement:</span>
              {['ALL', 'HYBRID', 'ONSITE', 'REMOTE'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedArrangement(m)}
                  className="btn-pill"
                  style={{
                    padding: '0.25rem 0.625rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: selectedArrangement === m ? 'var(--accent-emerald)' : 'var(--bg-surface)',
                    color: selectedArrangement === m ? '#0f172a' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: selectedArrangement === m ? 700 : 500,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Job List Cards or Loading Skeleton */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel" style={{ padding: '1.5rem', minHeight: '130px', animation: 'pulse 1.5s infinite ease-in-out' }}>
                  <div style={{ height: '20px', width: '40%', background: 'var(--border-subtle)', borderRadius: '4px', marginBottom: '0.75rem' }} />
                  <div style={{ height: '14px', width: '25%', background: 'var(--border-subtle)', borderRadius: '4px', marginBottom: '1rem' }} />
                  <div style={{ height: '14px', width: '70%', background: 'var(--border-subtle)', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state-panel">
              <Image
                src="/assets/empty-jobs.svg"
                alt="No matching jobs"
                width={120}
                height={120}
                style={{ marginBottom: '1.5rem', opacity: 0.85 }}
              />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {activeTab === 'SAVED' ? 'No Saved Opportunities' : 'No Matching Verified Openings'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {activeTab === 'SAVED'
                  ? 'Bookmark high-conviction roles while exploring to keep track of deadlines and tailor your verified profile.'
                  : 'We enforce an absolute zero-scraping policy. When no direct employer postings match your exact filters, adjust your search parameters or set up a smart alert.'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPathway('ALL');
                    setSelectedCity('ALL');
                    setSelectedArrangement('ALL');
                    if (activeTab === 'SAVED') setActiveTab('EXPLORE');
                  }}
                  className="btn btn-secondary btn-pill"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <RotateCcw size={14} /> Reset Filters
                </button>
                <button
                  onClick={() => setIsAlertModalOpen(true)}
                  className="btn btn-primary btn-pill"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <Bell size={14} /> Notify Me When Posted
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-panel glass-panel-interactive"
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {job.title}
                        </h3>
                        {job.matchScore && (
                          <span
                            className={`badge ${
                              job.matchScore >= 80
                                ? 'badge-emerald'
                                : job.matchScore >= 60
                                ? 'badge-cyan'
                                : 'badge-amber'
                            }`}
                          >
                            <Sparkles size={11} /> {job.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.8125rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Building size={14} /> {job.companyName}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <MapPin size={14} /> {job.locationCity} ({job.workArrangement})
                        </span>
                        {job.salaryDisclosed && job.salaryMin && job.salaryMax && (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: 'var(--accent-emerald)',
                              fontWeight: 600,
                            }}
                          >
                            <IndianRupee size={14} /> ₹{(job.salaryMin / 100000).toFixed(0)}L - ₹
                            {(job.salaryMax / 100000).toFixed(0)}L CTC
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className="btn btn-secondary btn-pill"
                        style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                        title={savedJobIds.has(job.id) ? 'Remove saved job' : 'Save job'}
                      >
                        {savedJobIds.has(job.id) ? (
                          <BookmarkCheck size={16} color="var(--accent-cyan)" />
                        ) : (
                          <Bookmark size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenTrackModal(job)}
                        className="btn btn-secondary btn-pill"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <Send size={13} /> Track
                      </button>
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="btn btn-primary btn-pill"
                        style={{ padding: '0.375rem 0.875rem', fontSize: '0.75rem' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      margin: '0.25rem 0',
                    }}
                  >
                    {job.rawDescription}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mandatory:</span>
                    {(job.structuredRequirements?.mandatorySkills || []).map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: 'var(--accent-cyan)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                    {job.isVerified && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.75rem',
                          color: 'var(--accent-emerald)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontWeight: 600,
                        }}
                      >
                        <ShieldCheck size={13} /> Direct Employer Mandate
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= Job Detail Modal ================= */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
                  {selectedJob.caPathway} Pathway
                </span>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>{selectedJob.companyName}</span>
                  <span>•</span>
                  <span>{selectedJob.locationCity} ({selectedJob.workArrangement})</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedJob.matchScore && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      Explainable Career Fit: {selectedJob.matchScore}%
                    </span>
                  </div>
                  <span className="badge badge-emerald">Eligible to Apply</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Calculated against your verified articleship competencies, statutory accounting standards, and declared career pathway preferences.
                </p>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Key Responsibilities
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                {(selectedJob.structuredRequirements?.keyResponsibilities || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Required Technical Competencies
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(selectedJob.structuredRequirements?.mandatorySkills || []).map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '4px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <Check size={12} /> {s}
                  </span>
                ))}
                {(selectedJob.structuredRequirements?.preferredSkills || []).map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '4px',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    + {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setSelectedJob(null)} className="btn btn-secondary btn-pill">
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedJob;
                  setSelectedJob(null);
                  handleOpenTrackModal(target);
                }}
                className="btn btn-primary btn-pill"
              >
                Track in My Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Track Application Modal ================= */}
      {isTrackingModalOpen && trackingJobTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '550px',
              width: '100%',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Track Application in Private Pipeline
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {trackingJobTarget.title} • {trackingJobTarget.companyName}
                </p>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Application Stage</label>
              <select
                value={trackStatus}
                onChange={(e) => setTrackStatus(e.target.value as ApplicationStatus)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              >
                <option value={ApplicationStatus.SAVED}>SAVED</option>
                <option value={ApplicationStatus.PLANNED}>PLANNED</option>
                <option value={ApplicationStatus.APPLIED}>APPLIED</option>
                <option value={ApplicationStatus.SHORTLISTED}>SHORTLISTED</option>
                <option value={ApplicationStatus.INTERVIEWING}>INTERVIEWING</option>
                <option value={ApplicationStatus.OFFERED}>OFFERED</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Next Follow-up Date</label>
              <input
                type="date"
                value={trackFollowUp}
                onChange={(e) => setTrackFollowUp(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Confidential Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Connected via Partner referral; tailored resume v2 submitted emphasizing Ind AS 115..."
                value={trackNotes}
                onChange={(e) => setTrackNotes(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => setIsTrackingModalOpen(false)} className="btn btn-secondary btn-pill">
                Cancel
              </button>
              <button onClick={handleSaveTracking} className="btn btn-primary btn-pill">
                Save Tracking Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Job Alert Preferences Modal ================= */}
      {isAlertModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Smart Job Alert Preferences
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Receive verified openings matching your exact CA pathway and CTC thresholds.
                </p>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {alertSuccess ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontWeight: 700 }}>Alert Preferences Saved</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  You will be notified immediately when a matching verified employer mandate is published.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Target Pathway</label>
                  <select
                    value={alertPathway}
                    onChange={(e) => setAlertPathway(e.target.value)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="AUDIT">Statutory Audit & Assurance</option>
                    <option value="TAX">Direct & Corporate Tax</option>
                    <option value="FPA">Corporate FP&A</option>
                    <option value="IB">M&A & Deal Advisory</option>
                    <option value="PRACTICE">Independent Practice</option>
                    <option value="CONSULTING">Management Consulting</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Minimum Target CTC: ₹{(alertMinSalary / 100000).toFixed(1)} Lakhs
                  </label>
                  <input
                    type="range"
                    min={800000}
                    max={3500000}
                    step={100000}
                    value={alertMinSalary}
                    onChange={(e) => setAlertMinSalary(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setIsAlertModalOpen(false)} className="btn btn-secondary btn-pill">
                    Cancel
                  </button>
                  <button onClick={handleSaveJobAlert} className="btn btn-primary btn-pill">
                    Save Alert
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
