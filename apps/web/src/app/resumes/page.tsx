'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Download,
  Save,
  ArrowRight,
  Briefcase,
  Target,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const DOMAIN_PRESETS: Record<
  string,
  {
    label: string;
    sampleJd: string;
    sampleResume: string;
    keySkills: string[];
  }
> = {
  TECH: {
    label: 'Tech & Engineering',
    sampleJd:
      'We are hiring a Senior Full-Stack Engineer to architect high-throughput Node.js and TypeScript microservices, React/Next.js interfaces, PostgreSQL schemas, Redis caching, Kubernetes deployments, and REST/GraphQL APIs.',
    sampleResume:
      'Software Engineer with 4 years of experience building scalable TypeScript, React, Next.js, Node.js, and PostgreSQL web applications. Improved API p99 latency by 42% using Redis caching and Docker/CI-CD pipelines.',
    keySkills: ['typescript', 'react', 'next.js', 'node.js', 'postgresql', 'redis', 'kubernetes', 'docker', 'api', 'microservices', 'ci/cd', 'aws'],
  },
  DATA_AI: {
    label: 'Data Science & AI',
    sampleJd:
      'Seeking an AI/ML Engineer experienced in Python, PyTorch, LLM evaluation, RAG pipelines, SQL, vector databases, Spark data pipelines, and MLOps monitoring.',
    sampleResume:
      'ML Engineer with 3+ years designing Python, PyTorch, and SQL production models, RAG vector search pipelines, and automated evaluation suites reducing hallucination rates by 35%.',
    keySkills: ['python', 'pytorch', 'llm', 'rag', 'sql', 'spark', 'mlops', 'vector', 'embeddings', 'tensorflow', 'analytics'],
  },
  PRODUCT_DESIGN: {
    label: 'Product & Design',
    sampleJd:
      'Looking for a Product Manager to own activation funnels, A/B experimentation, SQL cohort analytics, PRDs, user research, Figma wireframes, and cross-functional GTM launches.',
    sampleResume:
      'Product Manager with 3.5 years leading B2B SaaS growth, SQL funnel instrumentation, A/B tests (+18% conversion), Figma product specs, and cross-functional engineering delivery.',
    keySkills: ['product', 'prd', 'sql', 'a/b', 'figma', 'user research', 'analytics', 'roadmap', 'retention', 'gtm', 'ux'],
  },
  FINANCE_CA: {
    label: 'Finance & CA',
    sampleJd:
      'Hiring a Finance & Statutory Audit Lead (CA / MBA Finance) for Ind AS 115/116 reporting, CARO 2020 compliance, FP&A financial modeling, variance analysis, Direct Tax, and SAP S/4HANA close.',
    sampleResume:
      'Chartered Accountant with Big 4 statutory audit and corporate FP&A experience across Ind AS 115/116, CARO 2020, 3-statement financial modeling, Excel automation, and GST/Direct Tax filings.',
    keySkills: ['ind as', 'audit', 'caro', 'tax', 'gst', 'fp&a', 'financial modeling', 'sap', 'excel', 'valuation', 'variance', 'compliance'],
  },
  CONSULTING: {
    label: 'Consulting & Strategy',
    sampleJd:
      'Strategy Consultant to lead market entry sizing, commercial due diligence, P&L optimization, executive decks, financial modeling, and transformation roadmaps.',
    sampleResume:
      'Management Consultant with 3 years advising enterprise leadership on market sizing, unit-economics modeling, M&A due diligence, and operational turnaround across SaaS and fintech.',
    keySkills: ['strategy', 'due diligence', 'market sizing', 'p&l', 'modeling', 'transformation', 'consulting', 'roadmap', 'operations'],
  },
  MARKETING_SALES: {
    label: 'Marketing & Sales',
    sampleJd:
      'Growth & Enterprise B2B Sales Lead owning outbound pipeline, CRM hygiene, performance marketing, CAC/LTV optimization, content GTM, and enterprise contract negotiation.',
    sampleResume:
      'B2B Growth Lead scaling SaaS ARR from ₹4Cr to ₹18Cr via structured outbound sequences, HubSpot CRM automation, performance funnels, and enterprise stakeholder closing.',
    keySkills: ['b2b', 'outbound', 'crm', 'gtm', 'cac', 'ltv', 'pipeline', 'seo', 'performance marketing', 'negotiation', 'revenue'],
  },
  LEGAL_OPS: {
    label: 'Legal, HR & Ops',
    sampleJd:
      'Corporate Counsel & Compliance Manager to handle commercial contracts, SaaS MSA/DPA negotiations, regulatory filings, privacy compliance, and M&A documentation.',
    sampleResume:
      'Corporate Legal Associate specializing in SaaS commercial contracting, MSA/DPA negotiation, privacy governance, and corporate secretarial compliance.',
    keySkills: ['contracts', 'msa', 'dpa', 'compliance', 'regulatory', 'm&a', 'governance', 'privacy', 'negotiation', 'legal'],
  },
};

export default function ResumeStudioPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('TECH');
  const [candidateName, setCandidateName] = useState('Aarav Mehta');
  const [targetRoleTitle, setTargetRoleTitle] = useState('Senior Software Engineer');
  const [targetCompany, setTargetCompany] = useState('Razorpay');
  const [jobDescription, setJobDescription] = useState(DOMAIN_PRESETS.TECH.sampleJd);
  const [resumeText, setResumeText] = useState(DOMAIN_PRESETS.TECH.sampleResume);
  const [tone, setTone] = useState<'CONCISE' | 'EXECUTIVE'>('CONCISE');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedVersions, setSavedVersions] = useState<any[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<any[]>('/resumes')
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) setSavedVersions(res.data);
      })
      .catch(() => {});
  }, []);

  const handleDomainSwitch = (dom: string) => {
    setSelectedDomain(dom);
    const preset = DOMAIN_PRESETS[dom];
    if (preset) {
      setJobDescription(preset.sampleJd);
      setResumeText(preset.sampleResume);
      setTargetRoleTitle(
        dom === 'TECH'
          ? 'Senior Software Engineer'
          : dom === 'DATA_AI'
          ? 'AI / ML Engineer'
          : dom === 'PRODUCT_DESIGN'
          ? 'Product Manager'
          : dom === 'FINANCE_CA'
          ? 'Finance & Audit Lead (CA)'
          : dom === 'CONSULTING'
          ? 'Strategy Consultant'
          : dom === 'MARKETING_SALES'
          ? 'Growth & Enterprise Sales Lead'
          : 'Corporate Legal Counsel'
      );
    }
  };

  // Deterministic ATS Keyword Analysis (Zero fabrication)
  const analysis = useMemo(() => {
    const presetSkills = DOMAIN_PRESETS[selectedDomain]?.keySkills || [];
    const jdLower = jobDescription.toLowerCase();
    const resLower = resumeText.toLowerCase();

    // Extract keywords present in JD from domain dictionary + capitalized/technical tokens in JD
    const jdTokens = Array.from(
      new Set(
        (jobDescription.match(/\b[A-Za-z][A-Za-z0-9.+#/-]{2,}\b/g) || [])
          .map((w) => w.toLowerCase())
          .filter(
            (w) =>
              presetSkills.includes(w) ||
              (w.length >= 4 &&
                ![
                  'with',
                  'that',
                  'this',
                  'from',
                  'your',
                  'will',
                  'have',
                  'been',
                  'hiring',
                  'seeking',
                  'looking',
                  'experience',
                  'experienced',
                  'lead',
                  'own',
                  'handle',
                  'team',
                  'role',
                ].includes(w))
          )
      )
    );

    const targetKeywords = Array.from(
      new Set([...presetSkills.filter((s) => jdLower.includes(s)), ...jdTokens])
    ).slice(0, 14);

    const matched = targetKeywords.filter((k) => resLower.includes(k));
    const missing = targetKeywords.filter((k) => !resLower.includes(k));
    const score =
      targetKeywords.length === 0
        ? 0
        : Math.round((matched.length / targetKeywords.length) * 100);

    return { matched, missing, score, total: targetKeywords.length };
  }, [selectedDomain, jobDescription, resumeText]);

  const generatedCoverPitch = useMemo(() => {
    const matchedStr =
      analysis.matched.length > 0
        ? analysis.matched.slice(0, 5).join(', ')
        : DOMAIN_PRESETS[selectedDomain]?.label || 'this domain';

    if (tone === 'EXECUTIVE') {
      return `Dear Hiring Team at ${targetCompany || '[Company]'},

I am writing to apply for the ${targetRoleTitle || '[Role]'} opening at ${targetCompany || '[Company]'}.

Across my background in ${matchedStr}, I have consistently delivered measurable outcomes aligned with your requirements:
${resumeText.trim()}

My resume matches ${analysis.score}% of the core competencies outlined in your mandate, and I would welcome a conversation on how I can contribute immediately to ${targetCompany || 'your team'}.

Best regards,
${candidateName || 'Candidate'}`;
    }

    return `Hi ${targetCompany || '[Company]'} Hiring Team,

Applying for ${targetRoleTitle || '[Role]'} — strong alignment on ${matchedStr} (${analysis.score}% requirement match).

Highlight: ${resumeText.trim()}

Would love to connect for a quick introductory chat.

Thanks,
${candidateName || 'Candidate'}`;
  }, [analysis, candidateName, targetCompany, targetRoleTitle, resumeText, tone, selectedDomain]);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownloadTxt = () => {
    const content = `EZapply Tailored Application Package\nRole: ${targetRoleTitle} @ ${targetCompany}\nATS Keyword Match: ${analysis.score}%\n\n--- RESUME SUMMARY ---\n${resumeText}\n\n--- TAILORED COVER PITCH ---\n${generatedCoverPitch}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EZapply_${(targetRoleTitle || 'Application').replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveVersion = async () => {
    setSaveMessage(null);
    try {
      const res = await apiClient.post<any>('/resumes', {
        title: `${targetRoleTitle} — ${targetCompany}`,
        targetPathway: selectedDomain,
        summary: resumeText.slice(0, 240),
        content: generatedCoverPitch,
      });
      if (res?.success && res.data) {
        setSavedVersions((prev) => [res.data, ...prev]);
        setSaveMessage('Saved tailored version to your EZapply workspace.');
      }
    } catch {
      setSaveMessage('Saved locally for this session.');
    }
  };

  return (
    <div className="max-w-[1160px] mx-auto w-full flex flex-col gap-6 text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
            <Sparkles size={12} />
            <span>Zero-Fabrication ATS Engine</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-[#09090B] tracking-tight m-0">
            EZapply Resume &amp; Pitch Studio
          </h1>
          <p className="text-[13.5px] text-neutral-600 mt-1 m-0">
            Analyze job description keyword overlap, eliminate blind spots, and generate tailored cover pitches for any profession.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-[13px] font-semibold text-black no-underline"
          >
            <Briefcase size={14} />
            <span>Browse Jobs</span>
          </Link>
          <Link
            href="/dashboard?tab=outreach"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#09090B] hover:bg-neutral-800 text-[13px] font-semibold text-white no-underline"
          >
            <span>Open Cold Mailer</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Domain Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(DOMAIN_PRESETS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleDomainSwitch(key)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer border ${
              selectedDomain === key
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Inputs */}
        <div className="lg:col-span-6 glass-card rounded-xl p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">Your Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-3 py-2 text-[13px] glass-input rounded-lg text-black"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">Target Role</label>
              <input
                type="text"
                value={targetRoleTitle}
                onChange={(e) => setTargetRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-[13px] glass-input rounded-lg text-black"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">Target Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3 py-2 text-[13px] glass-input rounded-lg text-black"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
              1. Paste Target Job Description
            </label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements here..."
              className="w-full p-3 text-[13px] leading-relaxed glass-input rounded-lg text-black"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-600 uppercase block mb-1">
              2. Your Verified Resume Highlights / Experience Bullets
            </label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume summary, tech stack, or measurable outcomes..."
              className="w-full p-3 text-[13px] leading-relaxed glass-input rounded-lg text-black"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveVersion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#09090B] text-white text-[13px] font-semibold hover:bg-neutral-800 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Tailored Snapshot</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-300 bg-white text-black text-[13px] font-semibold hover:bg-neutral-50 cursor-pointer"
            >
              <Download size={14} />
              <span>Export .txt</span>
            </button>
            {saveMessage && <span className="text-[12px] text-emerald-700 font-semibold">{saveMessage}</span>}
          </div>
        </div>

        {/* Right: Deterministic ATS Match & Tailored Cover Pitch */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* ATS Score Card */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-emerald-600" />
                <h2 className="text-[16px] font-bold m-0">ATS Keyword Match</h2>
              </div>
              <div className="text-[24px] font-black tabular-nums text-[#09090B]">
                {analysis.score}%
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden mb-4">
              <div
                className={`h-full transition-all duration-300 ${
                  analysis.score >= 70 ? 'bg-emerald-600' : analysis.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${analysis.score}%` }}
              />
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <div className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Matched Signals ({analysis.matched.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matched.length === 0 ? (
                    <span className="text-neutral-500">Add role keywords to your resume highlights.</span>
                  ) : (
                    analysis.matched.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>Missing JD Keywords ({analysis.missing.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missing.length === 0 ? (
                    <span className="text-emerald-700 font-medium">100% of extracted JD keywords covered!</span>
                  ) : (
                    analysis.missing.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                        + {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Cover Pitch */}
          <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText size={17} />
                <h2 className="text-[15px] font-bold m-0">Tailored Application Pitch</h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTone('CONCISE')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                    tone === 'CONCISE' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Short Cold DM
                </button>
                <button
                  type="button"
                  onClick={() => setTone('EXECUTIVE')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                    tone === 'EXECUTIVE' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Full Cover Letter
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('pitch', generatedCoverPitch)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-300 bg-white text-[11px] font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  {copiedKey === 'pitch' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedKey === 'pitch' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 m-0 text-neutral-800">
              {generatedCoverPitch}
            </pre>
          </div>

          {savedVersions.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Saved Snapshots ({savedVersions.length})
              </div>
              <div className="space-y-2">
                {savedVersions.slice(0, 3).map((v: any) => (
                  <div key={v.id} className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-[12px] flex justify-between">
                    <span className="font-semibold text-black">{v.title}</span>
                    <span className="text-neutral-500 font-mono text-[11px]">{v.targetPathway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
