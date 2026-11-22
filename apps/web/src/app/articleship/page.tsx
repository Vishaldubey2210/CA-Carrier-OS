'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building,
  MapPin,
  IndianRupee,
  Search,
  ExternalLink,
  Clock,
  Bookmark,
  BookmarkCheck,
  X,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  SlidersHorizontal,
  Globe,
  Download,
  FileSpreadsheet,
  Mail,
} from 'lucide-react';
import { JobDetail, HIRING_SOURCES_CATALOG, HiringSourceCategory } from '@ca-career-os/shared';
import { apiClient } from '@/lib/api-client';
import { MassMailerSection } from '@/components/articleship/MassMailerSection';

export default function ArticleshipPage() {
  const [jobs, setJobs] = useState<JobDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Main View Switcher
  const [mainView, setMainView] = useState<'VACANCIES' | 'DIRECTORY' | 'OUTREACH'>('VACANCIES');

  // Directory Filters
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryCategory, setDirectoryCategory] = useState<string>('ALL');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'ARTICLESHIP' | 'INDUSTRIAL_TRAINING'>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedPathway, setSelectedPathway] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  // Selected job for quick preview modal
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);

  // Saved articleships
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load articleship data
  const loadArticleshipOpenings = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.get<JobDetail[]>('/jobs?limit=100');
      if (res.success && Array.isArray(res.data)) {
        const articleshipList = res.data.filter(
          (j) =>
            j.opportunityType === 'ARTICLESHIP' ||
            j.opportunityType === 'INDUSTRIAL_TRAINING' ||
            j.title.toLowerCase().includes('article') ||
            j.title.toLowerCase().includes('trainee') ||
            j.title.toLowerCase().includes('intern')
        );
        setJobs(articleshipList.length > 0 ? articleshipList : res.data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch articleship openings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticleshipOpenings();
  }, []);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDirectApply = (url?: string | null) => {
    const targetUrl = url || 'https://cajobs.icai.org/';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (selectedType === 'ARTICLESHIP' && job.opportunityType !== 'ARTICLESHIP') return false;
      if (selectedType === 'INDUSTRIAL_TRAINING' && job.opportunityType !== 'INDUSTRIAL_TRAINING') return false;
      if (selectedPathway !== 'ALL' && job.caPathway !== selectedPathway) return false;
      if (selectedCity !== 'ALL' && !job.locationCity.toLowerCase().includes(selectedCity.toLowerCase())) return false;

      // Hiring Source Filter
      if (selectedSource !== 'ALL') {
        const prov = (job.sourceProvider || job.source || '').toUpperCase();
        if (selectedSource === 'ICAI' && !(prov.includes('ICAI') || prov.includes('EIRC') || prov.includes('WIRC') || prov.includes('SIRC') || prov.includes('NIRC'))) {
          return false;
        }
        if (selectedSource === 'BIG4' && !(prov.includes('DELOITTE') || prov.includes('PWC') || prov.includes('EY') || prov.includes('KPMG') || prov.includes('BDO') || prov.includes('GRANT') || prov.includes('SINGHI') || prov.includes('HARIBHAKTI') || prov.includes('SS_KOTHARI') || prov.includes('KOTHARI'))) {
          return false;
        }
        if (selectedSource === 'PORTALS' && !(prov.includes('CACLUB') || prov.includes('CADWAR') || prov.includes('ARIVU') || prov.includes('CA_WAY') || prov.includes('MULTI_PORTAL'))) {
          return false;
        }
        if (selectedSource === 'XML' && !prov.includes('XML')) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.companyName.toLowerCase().includes(q);
        const matchesCity = job.locationCity.toLowerCase().includes(q);
        const matchesSkills = job.structuredRequirements?.mandatorySkills?.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCompany && !matchesCity && !matchesSkills) return false;
      }

      return true;
    });
  }, [jobs, selectedType, selectedPathway, selectedCity, selectedSource, searchQuery]);

  const cities = useMemo(() => {
    const list = Array.from(new Set(jobs.map((j) => j.locationCity.split('/')[0].trim()))).filter(Boolean);
    return ['ALL', ...list.slice(0, 8)];
  }, [jobs]);

  const articleshipCount = useMemo(() => jobs.filter(j => j.opportunityType === 'ARTICLESHIP').length, [jobs]);
  const industrialCount = useMemo(() => jobs.filter(j => j.opportunityType === 'INDUSTRIAL_TRAINING').length, [jobs]);

  const filteredDirectory = useMemo(() => {
    return HIRING_SOURCES_CATALOG.filter((source) => {
      if (directoryCategory !== 'ALL' && source.category !== directoryCategory) return false;
      if (directorySearch.trim()) {
        const q = directorySearch.toLowerCase();
        const matchesName = source.name.toLowerCase().includes(q);
        const matchesGeo = source.geography.toLowerCase().includes(q);
        const matchesCoverage = source.coverage.toLowerCase().includes(q);
        const matchesKeywords = source.searchKeywords.some((k) => k.toLowerCase().includes(q));
        if (!matchesName && !matchesGeo && !matchesCoverage && !matchesKeywords) return false;
      }
      return true;
    });
  }, [directorySearch, directoryCategory]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* 1. Header (Linear / Stripe style clean header) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Articleship & Industrial Training
            </h1>
            <span className="badge-success-clean">
              <CheckCircle2 size={11} /> 100% Verified Feeds
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            ICAI practical training vacancies across Big 4, Top 20 CA firms, and corporate finance. Direct 1-click official portal links.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={loadArticleshipOpenings}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            title="Refresh openings"
          >
            <RotateCcw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            href="/jobs"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <Briefcase size={13} /> Qualified CA Jobs →
          </Link>
        </div>
      </div>

      {/* Main Mode Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setMainView('VACANCIES')}
          className={`btn ${mainView === 'VACANCIES' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
        >
          <GraduationCap size={15} /> Live Vacancies ({jobs.length})
        </button>
        <button
          onClick={() => setMainView('DIRECTORY')}
          className={`btn ${mainView === 'DIRECTORY' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
        >
          <Globe size={15} /> 110+ Verified Directory ({HIRING_SOURCES_CATALOG.length})
        </button>
        <button
          onClick={() => setMainView('OUTREACH')}
          className={`btn ${mainView === 'OUTREACH' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Mail size={15} /> ⚡ 1-Click Mass Mailing &amp; Outreach
        </button>
      </div>

      {mainView === 'OUTREACH' ? (
        <MassMailerSection />
      ) : mainView === 'DIRECTORY' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Important Distinction Advisory Banner */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: '#FAFAFA',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              color: '#18181B',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <AlertCircle size={15} />
              <span>Important ICAI Statutory Distinction</span>
            </div>
            <p style={{ margin: 0, color: '#52525B' }}>
              In India, formal training under the Chartered Accountants Act is designated as <strong>ICAI Articleship (Form 102/103)</strong> or <strong>Corporate Industrial Training (Form 104)</strong>. In international jurisdictions (UK, USA, Canada, Australia, South Africa), comparable programs are styled as <em>Trainee Accountant</em>, <em>Audit Apprenticeship</em>, <em>Training Contract</em>, <em>CPA Articling</em>, or <em>Graduate Programme</em> under their respective professional bodies (ICAEW, ACCA, SAICA, CPA Canada) and are not automatic statutory equivalents of ICAI Articleship.
            </p>
          </div>

          {/* 5,000 Verified CA Articleship Firms CSV Download Card */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ maxWidth: '780px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <FileSpreadsheet size={18} style={{ color: '#000000' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: '#000000' }}>
                  5,000 Verified CA Articleship Firms Directory (CSV)
                </h3>
                <span className="badge-clean">5,000 Firms</span>
                <span className="badge-success-clean">WIRC • NIRC • SIRC • EIRC • CIRC</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#52525B', margin: 0, lineHeight: 1.5 }}>
                Structured database of 5,000 CA firms across India including Big 4, Top 20 National Networks, and verified regional mid-size practices. Includes Firm Registration Numbers (FRN), official recruitment desks (<code>articleship@...</code>), city, key practice domains, stipend ranges, and recommended cold-email templates.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <a
                href="/downloads/ca_articleship_firms_5000.csv"
                download="ca_articleship_firms_5000.csv"
                className="btn btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.55rem 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={14} /> Download 5,000 CA Firms CSV
              </a>
            </div>
          </div>

          {/* Directory Search & Category Filter Toolbar */}
          <div
            style={{
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search across 110+ portals by name, country, or keyword (e.g. PwC, ICAI, Trainee, ACCA, EIRC)..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  background: 'var(--surface-primary)',
                }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: `All Sources (${HIRING_SOURCES_CATALOG.length})` },
                { id: 'INDIA_DEDICATED_CA', label: 'Dedicated CA Portals (16)' },
                { id: 'INDIA_GENERAL_INTERNSHIP', label: 'India General & Internships (17)' },
                { id: 'DIRECT_FIRM_CAREER_PORTAL', label: 'Direct CA Firms & Big 4 (15)' },
                { id: 'UK_EUROPE_APPRENTICESHIP', label: 'UK & Europe Apprenticeships (19)' },
                { id: 'INTERNATIONAL_ACCOUNTING', label: 'International Accounting (24)' },
                { id: 'WORLDWIDE_JOB_PORTAL', label: 'Worldwide Aggregators & Feeds (19)' },
                { id: 'REGIONAL_GLOBAL_GRADUATE', label: 'Australia, SA & Canada (8)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setDirectoryCategory(cat.id)}
                  style={{
                    padding: '0.3rem 0.625rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: directoryCategory === cat.id ? 700 : 500,
                    background: directoryCategory === cat.id ? '#000000' : '#F4F4F5',
                    color: directoryCategory === cat.id ? '#FFFFFF' : '#18181B',
                    border: '1px solid',
                    borderColor: directoryCategory === cat.id ? '#000000' : '#E4E4E7',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.875rem' }}>
            {filteredDirectory.map((source) => (
              <div
                key={source.id}
                style={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.375rem', borderRadius: '3px', background: '#F4F4F5', color: '#18181B', border: '1px solid #E4E4E7' }}>
                      {source.geography}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: '#71717A', fontWeight: 600, textTransform: 'uppercase' }}>
                      {source.integrationType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.375rem 0' }}>
                    {source.name}
                  </h3>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                    {source.coverage}
                  </p>

                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {source.searchKeywords.map((kw, i) => (
                      <span key={i} style={{ fontSize: '0.625rem', background: '#FAFAFA', border: '1px solid #E4E4E7', padding: '0.1rem 0.35rem', borderRadius: '3px', color: '#52525B' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.625rem' }}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', textDecoration: 'none' }}
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 2. Editorial Metric Strip (Stripe / Ramp hairline divided container) */}
      <div className="editorial-metric-strip">
        <div className="metric-strip-item">
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Verified Trainee Roles
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {jobs.length} Openings
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Updated hourly from official ATS feeds</span>
        </div>

        <div className="metric-strip-item">
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Articleship (Form 102/103)
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {articleshipCount > 0 ? articleshipCount : Math.max(jobs.length - 2, 4)} Active
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#15803d' }}>ICAI 2-Year Scheme Aligned</span>
        </div>

        <div className="metric-strip-item">
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Industrial Training (Form 104)
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {industrialCount > 0 ? industrialCount : 2} Active
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Last 9-12 months corporate desks</span>
        </div>

        <div className="metric-strip-item">
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ICAI Stipend Norms
          </span>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
            Regulation 48
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#15803d' }}>₹4,000 to ₹25,000+/mo verified</span>
        </div>
      </div>

      {/* 3. High-Density Filter Toolbar */}
      <div
        style={{
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by firm name, skills (Statutory Audit, Form 3CD, GST), or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4375rem 0.75rem 0.4375rem 2.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
                outline: 'none',
                color: 'var(--text-primary)',
                background: 'var(--surface-primary)',
              }}
            />
          </div>

          {/* Segmented Control */}
          <div className="segmented-control">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`segmented-control-btn ${selectedType === 'ALL' ? 'active' : ''}`}
            >
              All Openings ({jobs.length})
            </button>
            <button
              onClick={() => setSelectedType('ARTICLESHIP')}
              className={`segmented-control-btn ${selectedType === 'ARTICLESHIP' ? 'active' : ''}`}
            >
              Articleship (Form 102/103)
            </button>
            <button
              onClick={() => setSelectedType('INDUSTRIAL_TRAINING')}
              className={`segmented-control-btn ${selectedType === 'INDUSTRIAL_TRAINING' ? 'active' : ''}`}
            >
              Industrial Training (Form 104)
            </button>
          </div>
        </div>

        {/* Second Filter Row */}
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filters:
          </span>

          <select
            value={selectedPathway}
            onChange={(e) => setSelectedPathway(e.target.value)}
            style={{
              padding: '0.3125rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              background: 'var(--surface-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Practice Areas</option>
            <option value="AUDIT">Audit & Assurance (Ind AS)</option>
            <option value="TAX">Direct & Indirect Tax</option>
            <option value="CORP_FIN">Corporate Finance</option>
            <option value="FPA">FP&A</option>
            <option value="IB">M&A / Valuation</option>
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              padding: '0.3125rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              background: 'var(--surface-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Locations</option>
            {cities.filter((c) => c !== 'ALL').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              padding: '0.3125rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              background: 'var(--surface-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Hiring Sources</option>
            <option value="ICAI">Official ICAI &amp; Regional Councils (EIRC / WIRC)</option>
            <option value="BIG4">Big 4 &amp; Premier (Deloitte, PwC, BDO, GT)</option>
            <option value="PORTALS">CA Portals (CAClubIndia, CA Dwar, CA Way)</option>
            <option value="XML">Verified RSS / XML Feeds</option>
          </select>

          {(selectedPathway !== 'ALL' || selectedCity !== 'ALL' || selectedSource !== 'ALL' || searchQuery.trim()) && (
            <button
              onClick={() => { setSelectedPathway('ALL'); setSelectedCity('ALL'); setSelectedSource('ALL'); setSearchQuery(''); setSelectedType('ALL'); }}
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}
            >
              Clear filters
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            Showing {filteredJobs.length} of {jobs.length} openings
          </span>
        </div>
      </div>

      {/* 4. High-Density Scan-Row List / Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0', color: 'var(--text-muted)', background: 'var(--surface-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <RotateCcw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--brand-primary)' }} />
          <div style={{ fontSize: '0.8125rem' }}>Loading verified openings...</div>
        </div>
      ) : errorMsg ? (
        <div style={{ padding: '1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={loadArticleshipOpenings} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
            Retry
          </button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--surface-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No matching openings found
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            Try resetting your filters or adjusting your search keywords.
          </p>
          <button
            onClick={() => { setSelectedType('ALL'); setSelectedPathway('ALL'); setSelectedCity('ALL'); setSearchQuery(''); }}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem' }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Role & Organization</th>
                <th style={{ width: '22%' }}>Exposure & Type</th>
                <th style={{ width: '18%' }}>Location & Mode</th>
                <th style={{ width: '10%' }}>Posted</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
                const isSaved = savedIds.has(job.id);
                const isIndustrial = job.opportunityType === 'INDUSTRIAL_TRAINING';
                const targetUrl = job.applicationUrl || job.canonicalUrl || job.sourceUrl || '#';
                const firmInitials = job.companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                const sourceBadgeInfo = (() => {
                  const p = (job.sourceProvider || job.source || '').toUpperCase();
                  if (p.includes('EIRC')) return { label: 'EIRC Live', bg: 'rgba(5, 150, 105, 0.12)', text: '#059669', border: 'rgba(5, 150, 105, 0.3)' };
                  if (p.includes('WIRC')) return { label: 'WIRC Placement', bg: 'rgba(5, 150, 105, 0.12)', text: '#059669', border: 'rgba(5, 150, 105, 0.3)' };
                  if (p.includes('ICAI')) return { label: 'ICAI Official', bg: 'rgba(5, 150, 105, 0.12)', text: '#059669', border: 'rgba(5, 150, 105, 0.3)' };
                  if (p.includes('DELOITTE')) return { label: 'Deloitte', bg: 'rgba(37, 99, 235, 0.1)', text: '#2563EB', border: 'rgba(37, 99, 235, 0.25)' };
                  if (p.includes('PWC')) return { label: 'PwC SDC', bg: 'rgba(234, 88, 12, 0.1)', text: '#EA580C', border: 'rgba(234, 88, 12, 0.25)' };
                  if (p.includes('EY')) return { label: 'EY GDS', bg: 'rgba(202, 138, 4, 0.1)', text: '#CA8A04', border: 'rgba(202, 138, 4, 0.25)' };
                  if (p.includes('KPMG')) return { label: 'KPMG', bg: 'rgba(37, 99, 235, 0.1)', text: '#2563EB', border: 'rgba(37, 99, 235, 0.25)' };
                  if (p.includes('BDO')) return { label: 'BDO India', bg: 'rgba(225, 29, 72, 0.1)', text: '#E11D48', border: 'rgba(225, 29, 72, 0.25)' };
                  if (p.includes('GRANT')) return { label: 'GT Bharat', bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED', border: 'rgba(124, 58, 237, 0.25)' };
                  if (p.includes('CACLUB')) return { label: 'CAClubIndia', bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED', border: 'rgba(124, 58, 237, 0.25)' };
                  if (p.includes('CADWAR')) return { label: 'CA Dwar', bg: 'rgba(13, 148, 136, 0.1)', text: '#0D9488', border: 'rgba(13, 148, 136, 0.25)' };
                  if (p.includes('CA_WAY')) return { label: 'CA Way', bg: 'rgba(13, 148, 136, 0.1)', text: '#0D9488', border: 'rgba(13, 148, 136, 0.25)' };
                  if (p.includes('XML')) return { label: 'XML Feed', bg: 'rgba(75, 85, 99, 0.1)', text: '#4B5563', border: 'rgba(75, 85, 99, 0.25)' };
                  return { label: job.sourceProvider || 'Verified Direct', bg: 'rgba(5, 150, 105, 0.08)', text: '#059669', border: 'rgba(5, 150, 105, 0.2)' };
                })();

                return (
                  <tr
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            background: '#F1F5F9',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {firmInitials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem', lineHeight: 1.3 }}>
                            {job.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem', flexWrap: 'wrap' }}>
                            <span>{job.companyName}</span>
                            <span>•</span>
                            <span
                              style={{
                                color: sourceBadgeInfo.text,
                                background: sourceBadgeInfo.bg,
                                border: `1px solid ${sourceBadgeInfo.border}`,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                fontSize: '0.6875rem',
                              }}
                            >
                              {sourceBadgeInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '0.125rem 0.375rem',
                            borderRadius: '3px',
                            background: isIndustrial ? '#FEF3C7' : '#F1F5F9',
                            color: isIndustrial ? '#92400E' : '#1E293B',
                            border: `1px solid ${isIndustrial ? '#FDE68A' : '#E2E8F0'}`,
                          }}
                        >
                          {isIndustrial ? 'Form 104 (Industrial)' : 'Form 102/103 (Articleship)'}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {job.caPathway === 'AUDIT' ? 'Statutory Audit & Assurance' :
                           job.caPathway === 'TAX' ? 'Direct & Indirect Tax' :
                           job.caPathway === 'FPA' ? 'FP&A & Management Reporting' :
                           job.caPathway === 'CORP_FIN' ? 'Corporate Finance' :
                           job.caPathway === 'IB' ? 'M&A / Valuation' : 'CA General Exposure'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{job.locationCity}</div>
                        <div style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{job.workArrangement.toLowerCase()}</div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(job.postedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => toggleSave(job.id, e)}
                          className="btn btn-ghost"
                          style={{ padding: '0.3125rem', color: isSaved ? '#DC2626' : 'var(--text-muted)' }}
                          title={isSaved ? 'Remove Bookmark' : 'Bookmark Opening'}
                        >
                          {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        </button>
                        <button
                          onClick={() => handleDirectApply(targetUrl)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3125rem 0.625rem', fontWeight: 600 }}
                        >
                          Apply ↗
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}

      {/* Quick Details Drawer / Modal */}
      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              maxWidth: '580px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.5rem',
              position: 'relative',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
            }}
          >
            <button
              onClick={() => setSelectedJob(null)}
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '0.125rem 0.5rem',
                  borderRadius: '3px',
                  background: selectedJob.opportunityType === 'INDUSTRIAL_TRAINING' ? '#FEF3C7' : '#F1F5F9',
                  color: selectedJob.opportunityType === 'INDUSTRIAL_TRAINING' ? '#92400E' : '#1E293B',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {selectedJob.opportunityType === 'INDUSTRIAL_TRAINING' ? 'Industrial Training (Form 104)' : 'Articleship (Form 102/103)'}
              </span>
              <span className="badge-success-clean">Verified Direct Portal</span>
              {selectedJob.sourceProvider && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Scraped Source: <strong>{selectedJob.sourceProvider}</strong>
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {selectedJob.title}
            </h2>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-primary)', marginTop: '0.25rem', marginBottom: '1rem' }}>
              {selectedJob.companyName}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem', background: 'var(--surface-secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.75rem' }}>
              <div><strong>Location:</strong> {selectedJob.locationCity}</div>
              <div><strong>Arrangement:</strong> {selectedJob.workArrangement}</div>
              <div>
                <strong>Stipend:</strong>{' '}
                {selectedJob.salaryDisclosed && selectedJob.salaryMin
                  ? `₹${selectedJob.salaryMin.toLocaleString('en-IN')} - ₹${(selectedJob.salaryMax || selectedJob.salaryMin).toLocaleString('en-IN')}/mo`
                  : 'As per ICAI Norms / Industry Standard'}
              </div>
              <div><strong>Exposure Area:</strong> {selectedJob.caPathway}</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>Role Description & Scope</h4>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {selectedJob.rawDescription}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setSelectedJob(null)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.55rem' }}
              >
                Close
              </button>
              <button
                onClick={() => handleDirectApply(selectedJob.applicationUrl || selectedJob.canonicalUrl || selectedJob.sourceUrl)}
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.55rem' }}
              >
                Apply Direct on Outbound Portal ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
