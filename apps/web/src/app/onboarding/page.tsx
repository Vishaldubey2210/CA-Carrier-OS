'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  Award,
  Layers,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';

const ARTICLESHIP_AREAS = [
  'Statutory Audit & Assurance (Companies Act 2013)',
  'Internal Financial Controls (ICFR) & SOX 404',
  'Direct Tax & Corporate Tax Returns (Form 3CD)',
  'Transfer Pricing & Section 92C Documentation',
  'GST Monthly Filings & Annual Audit (Form 9C)',
  'Financial Due Diligence & M&A Transaction Support',
  'FP&A, Variance Modeling & Budget Forecasting',
  'Valuation under ICAI Standards (IVS 301)',
];

const SOFTWARE_LIST = [
  'Advanced Excel (PowerQuery, Financial Modeling)',
  'SAP ERP (FICO, S/4HANA)',
  'PowerBI / Tableau Financial Reporting',
  'Tally Prime & Busy Accounting',
  'Oracle NetSuite',
  'Alteryx / Python Data Automation',
];

const PATHWAYS = [
  { id: 'AUDIT', label: 'Statutory Audit & Assurance' },
  { id: 'TAX', label: 'Direct Tax & Transfer Pricing' },
  { id: 'FPA', label: 'Financial Planning & Analysis (FP&A)' },
  { id: 'CORP_FIN', label: 'Corporate Finance & Valuation' },
  { id: 'IB', label: 'Financial Due Diligence & M&A' },
  { id: 'CONSULTING', label: 'CFO Advisory & Management Consulting' },
  { id: 'PRACTICE', label: 'Independent CA Public Practice' },
];

const CITIES = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Remote'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [successComplete, setSuccessComplete] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    caFinalStatus: 'QUALIFIED' as 'QUALIFIED' | 'FINALIST' | 'SEMI_QUALIFIED',
    icaiMembershipNo: '',
    attemptsCount: 1,
    articleshipFirm: '',
    articleshipFirmTier: 'MID_SIZE' as 'BIG4' | 'TOP10' | 'MID_SIZE' | 'SMALL',
    articleshipWeeks: 156,
    articleshipAreas: [] as string[],
    softwareProficiencies: [] as string[],
    preferredPathways: [] as string[],
    targetCities: [] as string[],
    targetSalaryMin: 10,
    targetSalaryMax: 18,
    summary: '',
  });

  // Calculate profile completion percentage based on actual fields
  const computeCompletion = () => {
    let score = 0;
    if (formData.caFinalStatus) score += 15;
    if (formData.icaiMembershipNo.trim()) score += 10;
    if (formData.articleshipFirm.trim()) score += 15;
    if (formData.articleshipAreas.length > 0) score += 20;
    if (formData.softwareProficiencies.length > 0) score += 15;
    if (formData.preferredPathways.length > 0) score += 15;
    if (formData.targetCities.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const completionPct = computeCompletion();

  const handleToggleArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      articleshipAreas: prev.articleshipAreas.includes(area)
        ? prev.articleshipAreas.filter((a) => a !== area)
        : [...prev.articleshipAreas, area],
    }));
  };

  const handleToggleSoftware = (sw: string) => {
    setFormData((prev) => ({
      ...prev,
      softwareProficiencies: prev.softwareProficiencies.includes(sw)
        ? prev.softwareProficiencies.filter((s) => s !== sw)
        : [...prev.softwareProficiencies, sw],
    }));
  };

  const handleTogglePathway = (pId: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredPathways: prev.preferredPathways.includes(pId)
        ? prev.preferredPathways.filter((p) => p !== pId)
        : [...prev.preferredPathways, pId],
    }));
  };

  const handleToggleCity = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCities: prev.targetCities.includes(city)
        ? prev.targetCities.filter((c) => c !== city)
        : [...prev.targetCities, city],
    }));
  };

  const handleSaveProfile = async (finish = false) => {
    setIsSaving(true);
    try {
      await apiClient.post('/career/profile', {
        caFinalStatus: formData.caFinalStatus,
        icaiMembershipNo: formData.icaiMembershipNo || undefined,
        attemptsCount: Number(formData.attemptsCount) || 1,
        articleshipFirm: formData.articleshipFirm || undefined,
        articleshipFirmTier: formData.articleshipFirmTier,
        articleshipWeeks: Number(formData.articleshipWeeks) || 156,
        articleshipAreas: formData.articleshipAreas,
        softwareProficiencies: formData.softwareProficiencies,
        preferredPathways: formData.preferredPathways,
        targetCities: formData.targetCities,
        targetSalaryMin: (Number(formData.targetSalaryMin) || 10) * 100000,
        targetSalaryMax: (Number(formData.targetSalaryMax) || 18) * 100000,
        summary: formData.summary || `Qualified Chartered Accountant targeting ${formData.preferredPathways.join(', ') || 'Finance'} roles.`,
      });

      if (finish) {
        setSuccessComplete(true);
      }
    } catch {
      // Fallback
    } finally {
      setIsSaving(false);
    }
  };

  if (successComplete) {
    return (
      <div style={{ maxWidth: '680px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem 2.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={36} color="var(--accent-emerald)" />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Profile Successfully Activated
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your articleship exposure and career preferences have been saved to your sovereign workspace. Your personalized 7-pathway roadmap is ready.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary" style={{ padding: '0.625rem 1.75rem' }}>
              <span>Enter Command Center</span>
              <ArrowRight size={15} />
            </Link>
            <Link href="/resumes" className="btn btn-secondary" style={{ padding: '0.625rem 1.75rem' }}>
              <span>Tailor Verified Resume</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '2rem auto 5rem', padding: '1rem 2rem' }}>
      {/* Top Progress & Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--brand-primary)', fontWeight: 700 }}>
            CANDIDATE ONBOARDING WIZARD • STEP {currentStep} OF 4
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Profile Strength: {completionPct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--border-subtle)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(currentStep / 4) * 100}%`,
              height: '100%',
              background: 'var(--brand-primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {/* Step 1: Qualification & ICAI Credentials */}
        {currentStep === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Award size={24} color="var(--brand-primary)" />
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  ICAI Professional Standing
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  Document your current examination and membership qualification status.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Current CA Standing
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { id: 'QUALIFIED', label: 'Chartered Accountant (Qualified)' },
                    { id: 'FINALIST', label: 'CA Finalist (Awaiting Results)' },
                    { id: 'SEMI_QUALIFIED', label: 'Semi-Qualified / Articleship Trainee' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, caFinalStatus: st.id as any })}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: formData.caFinalStatus === st.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        background: formData.caFinalStatus === st.id ? 'var(--brand-primary)' : 'var(--surface-secondary)',
                        color: formData.caFinalStatus === st.id ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    ICAI Membership / Reg No. (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 542198 / NRO0458921"
                    value={formData.icaiMembershipNo}
                    onChange={(e) => setFormData({ ...formData, icaiMembershipNo: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Final Attempts (Rank / Attempts)
                  </label>
                  <select
                    value={formData.attemptsCount}
                    onChange={(e) => setFormData({ ...formData, attemptsCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  >
                    <option value={1}>1st Attempt (Single sitting)</option>
                    <option value={2}>2 Attempts</option>
                    <option value={3}>3 Attempts</option>
                    <option value={4}>4+ Attempts</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Articleship Exposure */}
        {currentStep === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Building size={24} color="var(--brand-primary)" />
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Form 108 Articleship Exposure
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  Ground your resume in verified audit and tax mandates.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Articleship Firm Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. S.R. Batliboi & Co. / BSR & Co."
                    value={formData.articleshipFirm}
                    onChange={(e) => setFormData({ ...formData, articleshipFirm: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Firm Tier
                  </label>
                  <select
                    value={formData.articleshipFirmTier}
                    onChange={(e) => setFormData({ ...formData, articleshipFirmTier: e.target.value as any })}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  >
                    <option value="BIG4">Big 4 (EY, Deloitte, PwC, KPMG)</option>
                    <option value="TOP10">Top 10 / Top 20 National Firm (GT, BDO, etc.)</option>
                    <option value="MID_SIZE">Mid-Size Established CA Firm</option>
                    <option value="SMALL">Boutique / Proprietorship Firm</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Exposure Areas (Select all applicable)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
                  {ARTICLESHIP_AREAS.map((area) => {
                    const isSelected = formData.articleshipAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleToggleArea(area)}
                        style={{
                          padding: '0.625rem 0.875rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--brand-primary)' : 'var(--surface-secondary)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <span>{area}</span>
                        {isSelected && <Check size={14} color="#ffffff" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Software & Skills */}
        {currentStep === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Sparkles size={24} color="var(--brand-primary)" />
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Financial Software & Tools
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  Select the financial software systems you operated during your training.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {SOFTWARE_LIST.map((sw) => {
                const isSelected = formData.softwareProficiencies.includes(sw);
                return (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => handleToggleSoftware(sw)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--brand-primary)' : 'var(--surface-secondary)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{sw}</span>
                    {isSelected && <Check size={14} color="#ffffff" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Target Pathways & Preferences */}
        {currentStep === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Compass size={24} color="var(--brand-primary)" />
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Target Career Pathways & Locations
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  Specify the roles and geographies you are actively targeting.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Target CA Pathways (Select top choices)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                  {PATHWAYS.map((p) => {
                    const isSelected = formData.preferredPathways.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleTogglePathway(p.id)}
                        style={{
                          padding: '0.625rem 0.875rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--brand-primary)' : 'var(--surface-secondary)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{p.label}</span>
                        {isSelected && <Check size={14} color="#ffffff" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Preferred Cities
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {CITIES.map((c) => {
                    const isSelected = formData.targetCities.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleToggleCity(c)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '9999px',
                          border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--brand-primary)' : 'var(--surface-secondary)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              >
                <ArrowLeft size={14} />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => handleSaveProfile(false)}
              disabled={isSaving}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
            >
              <Save size={14} />
              <span>Save Progress</span>
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSaveProfile(true)}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.8125rem' }}
              >
                <span>{isSaving ? 'Activating...' : 'Complete Onboarding'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
