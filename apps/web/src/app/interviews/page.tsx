'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquareCode,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  BookOpen,
  Briefcase,
} from 'lucide-react';

interface PrepQuestion {
  id: string;
  domain: string;
  topic: string;
  difficulty: 'Core' | 'Senior' | 'Executive';
  question: string;
  rubric: string[];
}

const QUESTION_BANK: PrepQuestion[] = [
  {
    id: 'tech-1',
    domain: 'TECH',
    topic: 'System Design',
    difficulty: 'Senior',
    question: 'Design a rate-limited notification and email outreach queue capable of safely dispatching 450+ personalized messages/user/day without hitting provider throttling.',
    rubric: [
      'Token bucket / sliding window rate limiter keyed by sender account',
      'Dead-letter queue (DLQ) with exponential backoff on 429 / temporary SMTP faults',
      'Idempotency keys to avoid duplicate email sends on worker retry',
    ],
  },
  {
    id: 'tech-2',
    domain: 'TECH',
    topic: 'Frontend & Web Performance',
    difficulty: 'Core',
    question: 'How would you optimize a dashboard rendering 1,500+ filterable job listings to stay under 50ms interaction latency?',
    rubric: [
      'Windowed pagination / incremental batch rendering (e.g. slice(0, visibleCount))',
      'Memoized multi-facet filter pipelines (useMemo) + debounced text input',
      'Dynamic code splitting (next/dynamic) for heavy secondary tabs',
    ],
  },
  {
    id: 'ai-1',
    domain: 'DATA_AI',
    topic: 'LLM & RAG Architecture',
    difficulty: 'Senior',
    question: 'Explain how you measure and reduce hallucinations when extracting structured requirements from unformatted job descriptions.',
    rubric: [
      'Strict JSON schema validation (Zod) + deterministic regex/dictionary fallback',
      'Precision/Recall evaluation against a golden human-labeled dataset',
      'Grounding assertions separating extracted evidence from inferred claims',
    ],
  },
  {
    id: 'prod-1',
    domain: 'PRODUCT_DESIGN',
    topic: 'Product Sense & Metrics',
    difficulty: 'Core',
    question: 'Users browse jobs on EZapply but drop off before clicking Apply or sending outreach. How do you diagnose and fix funnel drop-off?',
    rubric: [
      'Instrument impression -> click -> outbound/apply funnel events segmented by domain',
      'Audit trust signals (verified URLs, transparent compensation, response expectations)',
      'Reduce friction via 1-click cold pitch templates & prefilled user profile variables',
    ],
  },
  {
    id: 'fin-1',
    domain: 'FINANCE_CA',
    topic: 'Ind AS & Statutory Audit',
    difficulty: 'Senior',
    question: 'Walk through the audit risks and Ind AS 115 / Ind AS 116 impacts for a high-growth SaaS enterprise signing multi-year bundled contracts.',
    rubric: [
      'Distinct performance obligation identification (license vs implementation vs support)',
      'Allocation of transaction price using standalone selling prices (SSP)',
      'Contract asset/liability recognition and CARO 2020 internal control disclosures',
    ],
  },
  {
    id: 'cons-1',
    domain: 'CONSULTING',
    topic: 'Strategy & Profitability Case',
    difficulty: 'Executive',
    question: 'A B2B hiring marketplace sees rising candidate signups (+40% QoQ) while enterprise net revenue retention (NRR) drops by 8%. Structure your diagnosis.',
    rubric: [
      'Decompose NRR = Expansion - Contraction - Churn across customer tiers',
      'Test candidate-side quality vs recruiter time-to-fill and signal-to-noise ratio',
      'Propose pricing/tier alignment and verified matching rubrics',
    ],
  },
  {
    id: 'mkt-1',
    domain: 'MARKETING_SALES',
    topic: 'GTM & B2B Outbound',
    difficulty: 'Core',
    question: 'How do you structure a multi-touch cold outreach sequence that achieves >15% positive reply rate without triggering spam filters?',
    rubric: [
      'Domain/account warmup, SPF/DKIM/DMARC hygiene, and pacing delays',
      'Hyper-relevant personalization tied to role pain points rather than generic blasts',
      'Clear low-friction CTA and systematic A/B testing on subject lines',
    ],
  },
  {
    id: 'leg-1',
    domain: 'LEGAL_OPS',
    topic: 'Commercial Contracting & Privacy',
    difficulty: 'Senior',
    question: 'What key clauses do you negotiate first when reviewing an enterprise SaaS MSA + Data Processing Addendum (DPA) involving candidate PII?',
    rubric: [
      'Limitation of liability & super-cap carve-outs for data breach/IP indemnity',
      'Sub-processor notification, cross-border transfer safeguards, and deletion SLAs',
      'Scope of PII processing and explicit prohibition on training public models with tenant data',
    ],
  },
];

const DOMAINS = [
  { id: 'ALL', label: 'All Domains' },
  { id: 'TECH', label: 'Tech & Engineering' },
  { id: 'DATA_AI', label: 'Data & AI' },
  { id: 'PRODUCT_DESIGN', label: 'Product & Design' },
  { id: 'FINANCE_CA', label: 'Finance & CA' },
  { id: 'CONSULTING', label: 'Consulting' },
  { id: 'MARKETING_SALES', label: 'Marketing & Sales' },
  { id: 'LEGAL_OPS', label: 'Legal & Ops' },
];

export default function InterviewPrepPage() {
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [activeId, setActiveId] = useState(QUESTION_BANK[0].id);
  const [draftAnswer, setDraftAnswer] = useState('');
  const [checkedRubric, setCheckedRubric] = useState<Record<string, boolean>>({});
  const [showRubric, setShowRubric] = useState(false);

  // Practice Timer (seconds)
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerRunning]);

  const filteredQuestions =
    selectedDomain === 'ALL' ? QUESTION_BANK : QUESTION_BANK.filter((q) => q.domain === selectedDomain);

  const activeQuestion =
    filteredQuestions.find((q) => q.id === activeId) || filteredQuestions[0] || QUESTION_BANK[0];

  const handleSelectQuestion = (q: PrepQuestion) => {
    setActiveId(q.id);
    setDraftAnswer('');
    setCheckedRubric({});
    setShowRubric(false);
    setSeconds(0);
    setTimerRunning(false);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-[1160px] mx-auto w-full flex flex-col gap-6 text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full mb-2">
            <MessageSquareCode size={12} />
            <span>Multi-Domain Interview Prep</span>
          </div>
          <h1 className="text-[24px] font-extrabold text-[#09090B] tracking-tight m-0">
            EZapply Interview Practice Studio
          </h1>
          <p className="text-[13.5px] text-neutral-600 mt-1 m-0">
            Timed mock drills and structured interviewer rubrics across Engineering, AI, Product, Finance &amp; CA, Consulting, Sales, and Legal.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#09090B] text-white text-[13px] font-semibold no-underline hover:bg-neutral-800"
        >
          <Briefcase size={14} />
          <span>Explore Open Roles</span>
        </Link>
      </div>

      {/* Domain Filter */}
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setSelectedDomain(d.id);
              const firstMatch = d.id === 'ALL' ? QUESTION_BANK[0] : QUESTION_BANK.find((q) => q.domain === d.id);
              if (firstMatch) handleSelectQuestion(firstMatch);
            }}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold cursor-pointer border transition-all ${
              selectedDomain === d.id
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Question Selector */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filteredQuestions.map((q) => {
            const isSelected = q.id === activeQuestion.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#09090B] text-white border-[#09090B] shadow-sm'
                    : 'bg-white text-black border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                  <span className={`font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {q.topic}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${isSelected ? 'bg-white/15 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                    {q.difficulty}
                  </span>
                </div>
                <div className="text-[13px] font-semibold leading-snug line-clamp-2">{q.question}</div>
              </button>
            );
          })}
        </div>

        {/* Right: Interactive Practice Workspace */}
        <div className="lg:col-span-7 glass-card rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                {activeQuestion.topic} • {activeQuestion.difficulty}
              </span>
              <h2 className="text-[17px] font-bold text-[#09090B] leading-snug mt-1 m-0">
                {activeQuestion.question}
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg">
              <Clock size={14} className="text-neutral-600" />
              <span className="font-mono font-bold text-[13px] tabular-nums">{formatTime(seconds)}</span>
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="p-1 rounded hover:bg-neutral-200 cursor-pointer"
                title={timerRunning ? 'Pause timer' : 'Start timer'}
              >
                {timerRunning ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setSeconds(0);
                }}
                className="p-1 rounded hover:bg-neutral-200 cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1.5">
              Your Structured Response (STAR / Architecture / Tradeoffs)
            </label>
            <textarea
              rows={7}
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              placeholder="Outline your assumptions, core design / framework, edge cases, and measurable trade-offs..."
              className="w-full p-3.5 text-[13px] leading-relaxed glass-input rounded-lg text-black"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowRubric((s) => !s)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#09090B] text-white text-[13px] font-semibold hover:bg-neutral-800 cursor-pointer"
            >
              <BookOpen size={14} />
              <span>{showRubric ? 'Hide Interviewer Rubric' : 'Reveal Interviewer Rubric'}</span>
              <ChevronRight size={14} className={showRubric ? 'rotate-90 transition-transform' : 'transition-transform'} />
            </button>

            <span className="text-[12px] text-neutral-500">
              {draftAnswer.trim().split(/\s+/).filter(Boolean).length} words drafted
            </span>
          </div>

          {showRubric && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <div className="text-[12px] font-bold text-emerald-900 uppercase tracking-wider">
                High-Signal Rubric Checklist (Self-Score)
              </div>
              {activeQuestion.rubric.map((item, idx) => {
                const key = `${activeQuestion.id}-${idx}`;
                const checked = Boolean(checkedRubric[key]);
                return (
                  <label key={key} className="flex items-start gap-2.5 text-[13px] text-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setCheckedRubric((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className="mt-1"
                    />
                    <span className={checked ? 'line-through text-neutral-500' : ''}>{item}</span>
                  </label>
                );
              })}
              <div className="pt-1 text-[12px] font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>
                  Score:{' '}
                  {activeQuestion.rubric.filter((_, i) => checkedRubric[`${activeQuestion.id}-${i}`]).length} /{' '}
                  {activeQuestion.rubric.length} checkpoints hit
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
