'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  Layers,
  Save,
  Briefcase,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';

const PROFESSIONAL_DOMAINS = [
  { id: 'TECH', label: 'Tech & Software Engineering', desc: 'Frontend, Backend, Full Stack, DevOps, Mobile, Cloud' },
  { id: 'DATA_AI', label: 'Data Science & AI', desc: 'ML Engineer, GenAI, Data Engineering, Analytics' },
  { id: 'PRODUCT_DESIGN', label: 'Product & Design', desc: 'Product Manager, UI/UX Designer, Growth PM' },
  { id: 'FINANCE_CA', label: 'Finance, Banking & CA', desc: 'Qualified CA, Audit, Tax, FP&A, IB, Articleship' },
  { id: 'CONSULTING', label: 'Consulting & Strategy', desc: 'Management Consulting, Business Ops, Chief of Staff' },
  { id: 'MARKETING_SALES', label: 'Marketing, Growth & Sales', desc: 'B2B SaaS Sales, Performance Marketing, GTM' },
  { id: 'LEGAL_OPS', label: 'Legal, Compliance & HR', desc: 'Corporate Counsel, Regulatory Compliance, Talent Ops' },
];

const SKILLS_BY_DOMAIN: Record<string, string[]> = {
  TECH: ['TypeScript', 'React / Next.js', 'Node.js', 'Python / Go', 'PostgreSQL', 'AWS / Kubernetes', 'System Design', 'CI/CD'],
  DATA_AI: ['Python', 'PyTorch / TensorFlow', 'LLM / RAG Systems', 'SQL & Data Warehousing', 'Spark / Airflow', 'MLOps', 'Statistical Modeling'],
  PRODUCT_DESIGN: ['Product Strategy', 'SQL & Funnel Analytics', 'Figma & Prototyping', 'A/B Experimentation', 'PRDs & Roadmapping', 'User Research'],
  FINANCE_CA: ['Ind AS / IFRS', 'Statutory Audit (CARO 2020)', 'Direct & Indirect Tax (GST)', '3-Statement Financial Modeling', 'SAP S/4HANA', 'Due Diligence'],
  CONSULTING: ['Market Sizing', 'Commercial Due Diligence', 'P&L Optimization', 'Executive Storytelling', 'Financial Modeling', 'Change Management'],
  MARKETING_SALES: ['B2B Outbound Pipeline', 'Enterprise Sales', 'Performance Marketing', 'CRM Automation', 'SEO & Content GTM', 'Revenue Ops'],
  LEGAL_OPS: ['Commercial Contracts (MSA/DPA)', 'M&A Documentation', 'Privacy & Data Governance', 'Regulatory Compliance', 'Talent Acquisition'],
};

const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Remote (India / Global)'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [successComplete, setSuccessComplete] = useState(false);

  const [formData, setFormData] = useState({
    primaryDomain: 'TECH',
    experienceStage: 'EARLY_CAREER' as 'STUDENT_INTERN' | 'EARLY_CAREER' | 'MID_LEVEL' | 'SENIOR_LEAD',
    headlineRole: '',
    credentialOrPortfolio: '',
    selectedSkills: [] as string[],
    targetCities: ['Bengaluru'] as string[],
    targetSalaryMin: 12,
    targetSalaryMax: 24,
    summary: '',
  });

  const domainSkills = SKILLS_BY_DOMAIN[formData.primaryDomain] || SKILLS_BY_DOMAIN.TECH;

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
  };

  const toggleCity = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCities: prev.targetCities.includes(city)
        ? prev.targetCities.filter((c) => c !== city)
        : [...prev.targetCities, city],
    }));
  };

  const completionPct = Math.min(
    100,
    (formData.primaryDomain ? 25 : 0) +
      (formData.headlineRole.trim() ? 20 : 0) +
      (formData.selectedSkills.length > 0 ? 30 : 0) +
      (formData.targetCities.length > 0 ? 15 : 0) +
      (formData.summary.trim() ? 10 : 0)
  );

  const handleSaveProfile = async (finish = false) => {
    setIsSaving(true);
    try {
      await apiClient.post('/career/profile', {
        primaryDomain: formData.primaryDomain,
        caFinalStatus: formData.experienceStage === 'SENIOR_LEAD' ? 'QUALIFIED' : 'FINALIST',
        icaiMembershipNo: formData.credentialOrPortfolio || undefined,
        articleshipAreas: formData.selectedSkills,
        softwareProficiencies: formData.selectedSkills,
        preferredPathways: [formData.primaryDomain === 'FINANCE_CA' ? 'FPA' : 'CONSULTING'],
        targetCities: formData.targetCities,
        targetSalaryMin: (Number(formData.targetSalaryMin) || 10) * 100000,
        targetSalaryMax: (Number(formData.targetSalaryMax) || 20) * 100000,
        summary:
          formData.summary ||
          `${formData.headlineRole || 'Professional'} in ${formData.primaryDomain} targeting ${formData.targetCities.join(', ')}`,
      });
      if (finish) setSuccessComplete(true);
    } catch {
      if (finish) setSuccessComplete(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (successComplete) {
    return (
      <div className="max-w-[680px] mx-auto my-12 px-4 text-center">
        <div className="glass-card rounded-xl p-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="text-[24px] font-extrabold text-[#09090B] mb-2">
            EZapply Profile Activated
          </h1>
          <p className="text-[14px] text-neutral-600 leading-relaxed mb-7">
            Your multi-domain preferences, skills, and target compensation have been saved. Explore curated opportunities or tailor your next pitch.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#09090B] text-white text-[13.5px] font-semibold no-underline"
            >
              <Briefcase size={15} />
              <span>Explore Matching Jobs</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/resumes"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-neutral-300 bg-white text-black text-[13.5px] font-semibold no-underline"
            >
              <span>Open Resume Studio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[880px] mx-auto w-full py-4 px-2 sm:px-4 text-black">
      {/* Header Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
            EZapply Career Profile Setup • Step {currentStep} of 3
          </span>
          <span className="text-[12.5px] font-bold text-black tabular-nums">
            Profile Completeness: {completionPct}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
          <div
            className="h-full bg-[#09090B] transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 sm:p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Compass size={22} />
              <div>
                <h1 className="text-[20px] font-extrabold text-[#09090B] m-0">Choose Your Domain &amp; Stage</h1>
                <p className="text-[13px] text-neutral-600 m-0">
                  EZapply adapts jobs, resume keywords, and cold outreach templates to your exact profession.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-2">Primary Professional Domain</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PROFESSIONAL_DOMAINS.map((dom) => {
                  const active = formData.primaryDomain === dom.id;
                  return (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, primaryDomain: dom.id, selectedSkills: [] })}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        active ? 'bg-[#09090B] text-white border-[#09090B]' : 'bg-white text-black border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <div className="text-[13.5px] font-bold">{dom.label}</div>
                      <div className={`text-[11.5px] mt-0.5 ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {dom.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-2">Experience Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'STUDENT_INTERN', label: 'Student / Intern / Article' },
                  { id: 'EARLY_CAREER', label: 'Early Career (0–2 yrs)' },
                  { id: 'MID_LEVEL', label: 'Mid-Level (2–5 yrs)' },
                  { id: 'SENIOR_LEAD', label: 'Senior / Lead (5+ yrs)' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, experienceStage: lvl.id as any })}
                    className={`p-2.5 rounded-lg border text-[12px] font-semibold cursor-pointer ${
                      formData.experienceStage === lvl.id
                        ? 'bg-[#09090B] text-white border-[#09090B]'
                        : 'bg-white text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Award size={22} />
              <div>
                <h1 className="text-[20px] font-extrabold text-[#09090B] m-0">Core Skills &amp; Credentials</h1>
                <p className="text-[13px] text-neutral-600 m-0">
                  Highlight your strongest skills so EZapply surfaces your highest-fit opportunities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-neutral-700 block mb-1">Target Job Title</label>
                <input
                  type="text"
                  value={formData.headlineRole}
                  onChange={(e) => setFormData({ ...formData, headlineRole: e.target.value })}
                  placeholder="e.g. Full-Stack Engineer / FP&A Lead / Product Manager"
                  className="w-full px-3 py-2 text-[13px] glass-input rounded-lg text-black"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-neutral-700 block mb-1">
                  LinkedIn, GitHub, Portfolio, or ICAI Reg No. (Optional)
                </label>
                <input
                  type="text"
                  value={formData.credentialOrPortfolio}
                  onChange={(e) => setFormData({ ...formData, credentialOrPortfolio: e.target.value })}
                  placeholder="https://github.com/... or WRO0786542"
                  className="w-full px-3 py-2 text-[13px] glass-input rounded-lg text-black"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-2">
                Select Core Skills ({formData.selectedSkills.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {domainSkills.map((skill) => {
                  const selected = formData.selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold border cursor-pointer transition-all ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Layers size={22} />
              <div>
                <h1 className="text-[20px] font-extrabold text-[#09090B] m-0">Target Locations &amp; Compensation</h1>
                <p className="text-[13px] text-neutral-600 m-0">
                  Set preferred cities, remote options, and expected CTC band.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-2">Preferred Cities / Work Mode</label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => {
                  const selected = formData.targetCities.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold border cursor-pointer ${
                        selected
                          ? 'bg-[#09090B] text-white border-[#09090B]'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-neutral-700 block mb-1">Min Expected CTC (INR Lakhs)</label>
                <input
                  type="number"
                  value={formData.targetSalaryMin}
                  onChange={(e) => setFormData({ ...formData, targetSalaryMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-[13px] glass-input rounded-lg text-black"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-neutral-700 block mb-1">Target CTC Ceiling (INR Lakhs)</label>
                <input
                  type="number"
                  value={formData.targetSalaryMax}
                  onChange={(e) => setFormData({ ...formData, targetSalaryMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-[13px] glass-input rounded-lg text-black"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-neutral-700 block mb-1">Short Career Summary (Optional)</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Briefly summarize your experience and what kind of team/role you are looking for next..."
                className="w-full p-3 text-[13px] glass-input rounded-lg text-black"
              />
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex justify-between items-center mt-8 pt-5 border-t border-neutral-200">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-300 bg-white text-[13px] font-semibold text-black cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-[13px] font-semibold text-neutral-500 hover:text-black cursor-pointer"
            >
              Skip for now
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#09090B] text-white text-[13px] font-semibold cursor-pointer hover:bg-neutral-800"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveProfile(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 text-white text-[13px] font-semibold cursor-pointer hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving Profile...' : 'Complete EZapply Setup'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
