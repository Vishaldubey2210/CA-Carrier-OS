'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api-client';
import {
  Compass,
  Briefcase,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Lock,
  Calculator,
  Building,
  HelpCircle,
  Mail,
  Send,
  Clock,
  AlertCircle,
  MessageSquareCode,
  Users,
  Award,
  BookOpen,
  CreditCard,
  Bot,
  Play,
  RotateCw,
  Zap,
  Sliders,
  ExternalLink,
  FileText,
  CheckCheck,
  Terminal,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CAPathway } from '@ca-career-os/shared';

// 7 Professional Chartered Accountancy Pathways
const CA_PATHWAYS = [
  {
    pathway: CAPathway.AUDIT,
    name: 'Statutory Audit & Assurance',
    description: 'Companies Act 2013, Standards on Auditing (SAs), CARO 2020, Ind AS 115/116 financial statement reviews.',
    hiringDemand: 'High (Big 4 & Top 20)',
    roles: ['Senior Associate Audit', 'Assistant Manager Assurance', 'Technical Accounting Specialist'],
  },
  {
    pathway: CAPathway.TAX,
    name: 'Direct Tax & Transfer Pricing',
    description: 'Corporate taxation, Section 92C transfer pricing documentation, Form 3CEB/3CD, dispute resolution.',
    hiringDemand: 'High (Big 4 & MNCs)',
    roles: ['Tax Consultant', 'Transfer Pricing Senior', 'International Tax Analyst'],
  },
  {
    pathway: CAPathway.FPA,
    name: 'Financial Planning & Analysis (FP&A)',
    description: '12-month rolling forecasts, SaaS unit economics, variance attribution (Price-Volume-Mix), PowerBI.',
    hiringDemand: 'Very High (Tech & Unicorns)',
    roles: ['FP&A Manager', 'Corporate Finance Analyst', 'Strategic Finance Lead'],
  },
  {
    pathway: CAPathway.CORP_FIN,
    name: 'Corporate Finance & Valuation',
    description: 'ICAI Valuation Standards (IVS 301), DCF financial modeling, LBO scenarios, capital structuring.',
    hiringDemand: 'Selective & Elite',
    roles: ['Valuation Associate', 'Investment Banking Analyst', 'Treasury Manager'],
  },
  {
    pathway: CAPathway.IB,
    name: 'Financial Due Diligence & M&A',
    description: 'Quality of Earnings (QoE), debt-like items, normalized working capital, target financial health review.',
    hiringDemand: 'High (PE & Advisory)',
    roles: ['FDD Senior', 'Transaction Advisory Manager', 'M&A Associate'],
  },
  {
    pathway: CAPathway.CONSULTING,
    name: 'Management Consulting & CFO Advisory',
    description: 'Finance target operating models, ERP chart of accounts design, fast-close acceleration, automation.',
    hiringDemand: 'Growing (Global Capability Centers)',
    roles: ['Transformation Consultant', 'CFO Advisory Senior', 'Finance Business Partner'],
  },
  {
    pathway: CAPathway.PRACTICE,
    name: 'Independent CA Public Practice',
    description: 'Proprietorship or partnership firms handling statutory audits, GST compliances, and direct tax advisory.',
    hiringDemand: 'Entrepreneurial & Independent',
    roles: ['Managing Partner', 'Audit Proprietor', 'Tax Practitioner'],
  },
];

// 9 Core Capabilities from /features
const FEATURE_GROUPS = [
  {
    id: 'career-intelligence',
    title: 'Career Intelligence & 7 Pathways',
    icon: Compass,
    badge: 'CORE ENGINE',
    badgeClass: 'badge-emerald',
    description: 'Specialized capability diagnostic mapping Form 108 articleship to 7 high-impact CA tracks.',
    capabilities: [
      'Form 108 Mapping: Converts 36-month articleship into quantifiable audit, tax, and advisory proof.',
      '7-Pathway Matching: Precision scoring for Statutory Audit, Direct Tax, FP&A, M&A, FDD, and Practice.',
      '30/60/90-Day Milestones: Automated post-qualification execution plan for campus and lateral hiring.',
      'Big 4 Skill Benchmarks: Highlights exact competency gaps compared to senior associate criteria.',
    ],
    ctaHref: '/career',
    ctaText: 'Review Career Engine',
  },
  {
    id: 'job-discovery',
    title: 'Verified Job Search & Fraud Shield',
    icon: Briefcase,
    badge: 'VERIFIED SHIELD',
    badgeClass: 'badge-emerald',
    description: 'Scam-free job board exclusively for qualified CAs, articleship trainees, and finance specialists.',
    capabilities: [
      'Verified Employers Only: Direct company verification eliminates unverified consultancies.',
      'Deterministic Match Score: Transparent skill overlap percentage based on actual work history.',
      'Track-Specific Filters: Instant filtering across Big 4, top mid-tier, listed MNCs, and remote roles.',
      'Live Pipeline Tracker: Track stage progression from Applied to Interviewing and Final Offer.',
    ],
    ctaHref: '/jobs',
    ctaText: 'Explore Verified Roles',
  },
  {
    id: 'zero-fabrication-resumes',
    title: 'Zero-Fabrication Resumes (ADR-009)',
    icon: FileCheck2,
    badge: 'ICAI ETHICAL',
    badgeClass: 'badge-indigo',
    description: 'The first resume engine mathematically constrained against AI hallucination.',
    capabilities: [
      'Strict Provenance: Only attested articleship and qualification facts can be formatted.',
      'Targeted JD Alignment: Reorders verified facts to match target JD keywords without fake claims.',
      'Candidate Sign-Off: Cryptographic candidate attestation required before final PDF export.',
      'ICAI Ethics Grounded: Prohibits invented audit turnover, fake clients, or exaggerated roles.',
    ],
    ctaHref: '/resumes',
    ctaText: 'Build Compliant Resume',
  },
  {
    id: 'mock-interviews',
    title: 'Technical Ind AS Mock Interviews',
    icon: MessageSquareCode,
    badge: 'AI SIMULATOR',
    badgeClass: 'badge-cyan',
    description: 'Interactive technical interview drills designed to simulate Big 4 partner evaluation.',
    capabilities: [
      '8-Turn Technical Drills: Realistic probing on Ind AS 115, Ind AS 116, CARO 2020, and Sec 92C.',
      '4-Dimension Rubric: Real-time scoring on statutory depth, accuracy, logic, and presentation.',
      'Model Partner Answers: Instant STAR feedback and model technical responses after each turn.',
      'Targeted Remediation: Weak answers auto-generate targeted revision tasks on your dashboard.',
    ],
    ctaHref: '/interviews',
    ctaText: 'Practice Mock Interview',
  },
  {
    id: 'ctc-unbundler',
    title: 'CTC Unbundler & In-Hand Calculator',
    icon: Calculator,
    badge: 'TAX ANALYTICS',
    badgeClass: 'badge-amber',
    description: 'Deconstruct confusing compensation packages into accurate net monthly bank credits.',
    capabilities: [
      'Sec 115BAC Ready: Real FY 2024-25 new tax regime slabs with ₹75,000 standard deduction.',
      'Statutory Isolations: Precise deduction of employee PF (12%), gratuity, and professional tax.',
      'Guaranteed vs Variable: Clearly isolates guaranteed base cash from variable performance bonuses.',
      'Side-by-Side Offer Matrix: Compare multiple offers with city cost-of-living index.',
    ],
    ctaHref: '/jobs',
    ctaText: 'Calculate Net Take-Home',
  },
  {
    id: 'practice-os',
    title: 'Independent CA Firm Practice OS',
    icon: Building,
    badge: 'FIRM WORKSPACE',
    badgeClass: 'badge-emerald',
    description: 'Complete operational command center for CA sole proprietorships and partnership firms.',
    capabilities: [
      'Client Master & Entity Vault: Consolidated PAN, GSTIN, DIN, and authorized contact records.',
      'Compliance Due Date Radar: Real-time tracking for GSTR-3B, Tax Audit 44AB, and quarterly TDS.',
      'Filing Reference Archive: Secure vault for ARN, ACK, and UDIN generation tracking.',
      'Non-Solicitation Architecture: Fully compliant with Clause 6 and 7 of ICAI First Schedule.',
    ],
    ctaHref: '/practice',
    ctaText: 'Launch Practice Firm OS',
  },
  {
    id: 'mentorship-community',
    title: 'Mentorship & Professional Community',
    icon: Users,
    badge: 'COMMUNITY',
    badgeClass: 'badge-emerald',
    description: 'Verified CA-to-CA guidance, career debriefs, and ethical peer discussions.',
    capabilities: [
      '1-on-1 Senior CA Mentors: Connect with Big 4 directors, PE associates, and corporate CFOs.',
      'Confidential 45-Min Slots: Structured career advisory sessions with concrete action items.',
      'Technical Debate Forums: Discuss complex Ind AS interpretations, case laws, and campus tips.',
      'Zero Spam Moderation: Strictly non-commercial; zero promotional solicitation allowed.',
    ],
    ctaHref: '/growth',
    ctaText: 'Connect with Mentors',
  },
  {
    id: 'ai-career-agent',
    title: 'Sovereign AI Career Agent',
    icon: Bot,
    badge: 'AI COPILOT',
    badgeClass: 'badge-amber',
    description: 'Intelligent personal career copilot with strict 4-tier security boundaries.',
    capabilities: [
      'Tiered Permission Gates: READ_ONLY, WRITE, EXPLICITLY_APPROVED, and DESTRUCTIVE tiers.',
      'Human-in-the-Loop: High-impact actions require explicit cryptographic token approval.',
      'ICAI Domain Grounded: Prompt defense safeguards prevent hallucinations and prompt injection.',
      'Deterministic Audit Trail: Explainable reasoning for every career and skill recommendation.',
    ],
    ctaHref: '/career',
    ctaText: 'Review Agent Policy',
  },
  {
    id: 'security-privacy',
    title: 'Candidate Blindfold Security & RBAC',
    icon: ShieldCheck,
    badge: 'ENTERPRISE RBAC',
    badgeClass: 'badge-indigo',
    description: 'Enterprise multi-tenant isolation and complete candidate identity protection.',
    capabilities: [
      'Candidate Blindfold Rule: Current employers are cryptographically barred from finding you.',
      'Multi-Tenant Data Silos: Complete database schema separation between candidates and firms.',
      'HttpOnly Cookie Sessions: 15-minute access tokens with 7-day rotated refresh cookies.',
      'Immutable Audit Logging: SHA-256 payload tracking on all recruiter and admin mutations.',
    ],
    ctaHref: '/security',
    ctaText: 'Read Security Architecture',
  },
];

// 5 Steps from /how-it-works
const HOW_IT_WORKS_STEPS = [
  {
    num: '01',
    title: 'Map Form 108 Articleship',
    subtitle: 'Transform raw training into verifiable capability points',
    description:
      'Record your 3-year articleship breakdown across Statutory Audit (Companies Act 2013, CARO), Corporate Tax (Form 3CD, Section 92C), Internal Controls (ICFR), and M&A Deal Advisory.',
    icon: Compass,
    detail: 'Maps directly to Big 4 and corporate finance hiring criteria.',
  },
  {
    num: '02',
    title: '7-Pathway Diagnostic',
    subtitle: 'Benchmark your fit across 7 specialized career horizons',
    description:
      'Evaluate your skills against Statutory Audit, Direct Tax, FP&A, Corporate Valuation, M&A Due Diligence, CFO Advisory, and Practice. Receive a customized 30/60/90-day action plan.',
    icon: Layers,
    detail: 'Calibrated with ICAI SSP portal and CMI&B placement standards.',
  },
  {
    num: '03',
    title: 'Tailor Verified Resumes',
    subtitle: 'Zero-hallucination ADR-009 precision engine',
    description:
      'Target job descriptions using mathematically constrained tailoring. The engine is strictly prohibited from inventing false clients or exaggerated metrics. Requires your formal sign-off.',
    icon: FileCheck2,
    detail: 'Guarantees 100% adherence to ICAI Code of Ethics.',
  },
  {
    num: '04',
    title: 'Drill Big 4 Technical Cases',
    subtitle: 'Simulate partner-level Ind AS and taxation interviews',
    description:
      'Engage in 8-turn technical drills testing Ind AS 115 revenue, Ind AS 116 leases, and transfer pricing. Receive instant STAR rubric scoring and model partner answers.',
    icon: MessageSquareCode,
    detail: 'Evaluated against authentic Big 4 partner hiring rubrics.',
  },
  {
    num: '05',
    title: 'Unbundle In-Hand CTC & Apply',
    subtitle: 'Blindfold privacy for zero-leak career mobility',
    description:
      'Calculate monthly net bank take-home after PF and FY 2024-25 New Tax Regime deductions. Apply to verified jobs with cryptographic protection from your current employer.',
    icon: Calculator,
    detail: 'Candidate Blindfold guarantees complete confidentiality.',
  },
];

// Comprehensive FAQs from /faq
const FAQS = [
  {
    q: 'How does the Zero-Fabrication Rule (ADR-009) work?',
    a: 'Our resume engine operates under strict mathematical provenance: it can only reorder, highlight, and format facts that you have formally attested from your articleship. It is strictly prohibited from inventing unverified clients, false metrics, or unearned credentials.',
  },
  {
    q: 'What is the Candidate Blindfold Rule?',
    a: 'Candidate personal workspaces, compensation targets, offer comparisons, and job applications are cryptographically isolated from organization workspaces. Recruiters from your current employer can never search or view your profile.',
  },
  {
    q: 'How is Form 108 articleship training verified?',
    a: 'Candidates document their 3-year breakdown across statutory audit, corporate tax, transfer pricing, and reporting. Our document parser validates ICAI Form 108 records, flagging any low-confidence data for human review.',
  },
  {
    q: 'Does CA Career OS claim official affiliation with ICAI?',
    a: 'No. CA Career OS is an independent career operating system built for Chartered Accountants. We strictly adhere to the ICAI Code of Ethics (including non-solicitation rules under Clauses 6 and 7 of Part I of the First Schedule).',
  },
  {
    q: 'How are payments and GST invoicing handled?',
    a: 'All purchases generate official GST tax invoices under Service Accounting Code (SAC) 998314 (Information Technology Software Services), supporting full B2B Input Tax Credit (ITC) for firms and employers.',
  },
  {
    q: 'How are passwords and session tokens protected?',
    a: 'Passwords are encrypted using memory-hard scrypt hashing with per-user unique cryptographic salts. Sessions use 15-minute short-lived JWT access tokens paired with 7-day HttpOnly refresh cookies.',
  },
];

export default function RootHomePage() {
  const { isAuthenticated, user, demoLogin } = useAuth();
  const router = useRouter();
  const [selectedPathway, setSelectedPathway] = useState<CAPathway>(CAPathway.AUDIT);
  const [pathwayIndex, setPathwayIndex] = useState(0);
  const [pathwayDirection, setPathwayDirection] = useState<'next' | 'prev'>('next');

  const handlePrevPathway = () => {
    setPathwayDirection('prev');
    setPathwayIndex((prev) => {
      const nextIdx = prev === 0 ? CA_PATHWAYS.length - 1 : prev - 1;
      setSelectedPathway(CA_PATHWAYS[nextIdx].pathway);
      return nextIdx;
    });
  };

  const handleNextPathway = () => {
    setPathwayDirection('next');
    setPathwayIndex((prev) => {
      const nextIdx = (prev + 1) % CA_PATHWAYS.length;
      setSelectedPathway(CA_PATHWAYS[nextIdx].pathway);
      return nextIdx;
    });
  };

  const handleSelectPathway = (idx: number) => {
    setPathwayDirection(idx > pathwayIndex ? 'next' : 'prev');
    setPathwayIndex(idx);
    setSelectedPathway(CA_PATHWAYS[idx].pathway);
  };
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  // Interactive Hero Cockpit State
  const [heroTab, setHeroTab] = useState<'DIAGNOSTIC' | 'RESUME' | 'DRILL' | 'CTC'>('DIAGNOSTIC');
  const [heroPathway, setHeroPathway] = useState<'AUDIT' | 'TAX' | 'FPA' | 'IB'>('AUDIT');
  const [heroResumeMode, setHeroResumeMode] = useState<'VERIFIED' | 'RAW'>('VERIFIED');
  const [heroDrillRevealed, setHeroDrillRevealed] = useState(false);
  const [heroSalaryLpa, setHeroSalaryLpa] = useState(18);
  const [heroDemoRoleLoading, setHeroDemoRoleLoading] = useState<string | null>(null);

  const handleHeroInstantDemo = async (role: string) => {
    setHeroDemoRoleLoading(role);
    try {
      const res = await demoLogin(role);
      if (res.success) {
        if (role === 'RECRUITER') router.push('/jobs');
        else if (role === 'PLATFORM_ADMIN') router.push('/admin');
        else router.push('/dashboard');
      }
    } finally {
      setHeroDemoRoleLoading(null);
    }
  };

  // Interactive 3D Stacked Deck State for Capabilities
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [featureDirection, setFeatureDirection] = useState<'next' | 'prev'>('next');

  // Handlers for Stacked Feature Carousel
  const handlePrevFeature = () => {
    setFeatureDirection('prev');
    setActiveFeatureIdx((prev) => (prev === 0 ? FEATURE_GROUPS.length - 1 : prev - 1));
  };

  const handleNextFeature = () => {
    setFeatureDirection('next');
    setActiveFeatureIdx((prev) => (prev === FEATURE_GROUPS.length - 1 ? 0 : prev + 1));
  };

  const handleSelectFeature = (idx: number) => {
    setFeatureDirection(idx > activeFeatureIdx ? 'next' : 'prev');
    setActiveFeatureIdx(idx);
  };

  // Instant Demo Loading Simulator State
  const [demoLoadingStage, setDemoLoadingStage] = useState<'IDLE' | 'ANALYZING' | 'MATCHING' | 'READY'>('IDLE');

  // Interactive Systematic Workflow Stepper State
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [isAutoPlayingWorkflow, setIsAutoPlayingWorkflow] = useState(true);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [isWorkflowPaused, setIsWorkflowPaused] = useState(false);

  // Workflow auto-advance timer with smooth ticking countdown
  useEffect(() => {
    if (!isAutoPlayingWorkflow || isWorkflowPaused) return;
    const interval = setInterval(() => {
      setWorkflowProgress((prev) => {
        if (prev >= 100) {
          setActiveWorkflowStep((s) => (s === HOW_IT_WORKS_STEPS.length - 1 ? 0 : s + 1));
          return 0;
        }
        return prev + 2.5; // 40 ticks * 100ms = 4000ms = 4s per milestone
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isAutoPlayingWorkflow, isWorkflowPaused]);

  // Scroll-Triggered Reveal & Executive Loading Transition Observer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    });

    const elementsToReveal = document.querySelectorAll(
      '.scroll-reveal, .scroll-reveal-section, .scroll-card-reveal'
    );
    elementsToReveal.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSelectWorkflowStep = (idx: number) => {
    setActiveWorkflowStep(idx);
    setWorkflowProgress(0);
  };

  // Demo simulator trigger
  const handleTriggerDemo = () => {
    if (demoLoadingStage !== 'IDLE') return;
    setDemoLoadingStage('ANALYZING');
    setTimeout(() => {
      setDemoLoadingStage('MATCHING');
      setTimeout(() => {
        setDemoLoadingStage('READY');
        setTimeout(() => {
          router.push('/dashboard');
        }, 900);
      }, 1200);
    }, 1100);
  };

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: 'CAREER_SUPPORT',
    subject: '',
    message: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<{ ticketRef: string; message: string } | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const activePathwayDetail = CA_PATHWAYS.find((p) => p.pathway === selectedPathway) || CA_PATHWAYS[0];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    if (contactForm.name.trim().length < 2) {
      setContactError('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!contactForm.email.includes('@') || !contactForm.email.includes('.')) {
      setContactError('Please provide a valid email address.');
      return;
    }
    if (contactForm.subject.trim().length < 4) {
      setContactError('Subject must be at least 4 characters long.');
      return;
    }
    if (contactForm.message.trim().length < 15) {
      setContactError('Message must contain at least 15 characters describing your inquiry.');
      return;
    }

    setContactSubmitting(true);
    try {
      const res = await apiClient.post<{ ticketRef: string; message: string }>('/support/contact', contactForm);
      if (res.success && res.data) {
        setContactSuccess(res.data);
        setContactForm({
          name: '',
          email: '',
          category: 'CAREER_SUPPORT',
          subject: '',
          message: '',
        });
      } else {
        setContactError(res.error?.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err: any) {
      setContactError(err.message || 'Unable to connect to support service. Please try again later.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem', paddingBottom: '5rem', paddingTop: '1.5rem' }}>

      {/* 1. HERO SECTION WITH INTERACTIVE LIVE COCKPIT */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          padding: '1.5rem 1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          position: 'relative',
        }}
      >
        {/* Subtle Ambient Background Mesh */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1000px',
            height: '480px',
            background: 'radial-gradient(circle at 50% 30%, rgba(37, 99, 235, 0.12) 0%, rgba(147, 51, 234, 0.08) 35%, rgba(6, 182, 212, 0.04) 70%, transparent 85%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Welcome Back Pill or Status Beacon */}
        <div style={{ zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
          {isAuthenticated ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.45rem 1.25rem',
                borderRadius: '9999px',
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)' }}>
                Welcome back, <strong>{user?.firstName || 'Candidate'}</strong>
              </span>
              <span style={{ color: 'var(--border-subtle)' }}>•</span>
              <Link
                href="/dashboard"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'none',
                }}
              >
                Command Center <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.95rem',
                borderRadius: '9999px',
                background: 'rgba(23, 63, 138, 0.06)',
                border: '1px solid rgba(23, 63, 138, 0.15)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--brand-primary)', letterSpacing: '0.02em' }}>
                ICAI Form 108 Aligned
              </span>
            </div>
          )}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <ShieldCheck size={14} color="var(--brand-primary)" />
            <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Zero-Fabrication • ADR-009 Grounded
            </span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '1040px', zIndex: 1 }}>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.4vw, 3.65rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
            }}
          >
            The Career Operating System for{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #173f8a 60%, #1e40af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              Chartered Accountants
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
              color: 'var(--text-secondary)',
              maxWidth: '740px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Verified articleship mapping, Big 4 technical interview drills, and in-hand take-home CTC analytics — precision-built for Indian CAs.
          </p>

          {/* Clean High-Signal Value Strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem 1.5rem',
              marginTop: '1.25rem',
              fontSize: '0.84375rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} color="#059669" /> Form 108 Verified
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} color="#059669" /> 7 Specialization Horizons
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} color="#059669" /> Big 4 STAR Rubrics
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} color="#059669" /> Candidate Blindfold Privacy
            </span>
          </div>
        </div>

        {/* 1-Click Instant Persona Launcher Dock */}
        <div
          style={{
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.65rem',
            width: '100%',
            marginTop: '0.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.78125rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Zap size={13} color="#d97706" />
            <span>1-Click Test Drive Simulator:</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => handleHeroInstantDemo('CANDIDATE')}
              disabled={heroDemoRoleLoading !== null}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
              title="Launch candidate workspace with articleship verification"
            >
              <span>Candidate (Priya Sharma, CA)</span>
              {heroDemoRoleLoading === 'CANDIDATE' ? (
                <RotateCw size={13} className="animate-spin" />
              ) : (
                <ArrowRight size={12} color="var(--brand-primary)" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleHeroInstantDemo('RECRUITER')}
              disabled={heroDemoRoleLoading !== null}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
              title="Launch recruiter matrix to inspect verified audit candidates"
            >
              <span>Big 4 Partner (Vikram Malhotra)</span>
              {heroDemoRoleLoading === 'RECRUITER' ? (
                <RotateCw size={13} className="animate-spin" />
              ) : (
                <ArrowRight size={12} color="#059669" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleHeroInstantDemo('PLATFORM_ADMIN')}
              disabled={heroDemoRoleLoading !== null}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
              title="Inspect system logs, tenant guardrails and pipeline health"
            >
              <span>Platform Admin</span>
              {heroDemoRoleLoading === 'PLATFORM_ADMIN' ? (
                <RotateCw size={13} className="animate-spin" />
              ) : (
                <ArrowRight size={12} color="#7c3aed" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1, marginTop: '0.25rem' }}>
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn btn-primary btn-pill" style={{ padding: '0.7rem 2rem', fontSize: '0.9375rem', gap: '0.5rem' }}>
              <span>Launch Command Center</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <Link href="/register" className="btn btn-primary btn-pill" style={{ padding: '0.7rem 2rem', fontSize: '0.9375rem', gap: '0.5rem' }}>
              <span>Create Free CA Account</span>
              <ArrowRight size={15} />
            </Link>
          )}
          <Link href="/jobs" className="btn btn-secondary btn-pill" style={{ padding: '0.7rem 1.6rem', fontSize: '0.9375rem', gap: '0.5rem' }}>
            <Briefcase size={15} />
            <span>Explore Verified Roles</span>
          </Link>
          <a href="#features" className="btn btn-secondary btn-pill" style={{ padding: '0.7rem 1.6rem', fontSize: '0.9375rem' }}>
            <span>Platform Features</span>
          </a>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE CA CAREER OS LIVE COCKPIT (Interactive Executive Simulator) */}
        {/* ========================================================================= */}
        <div
          style={{
            zIndex: 1,
            width: '100%',
            maxWidth: '1100px',
            marginTop: '1rem',
            background: 'var(--surface-primary)',
            borderRadius: '18px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            overflow: 'hidden',
          }}
        >
          {/* macOS Style Cockpit Chrome Header */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              background: 'var(--surface-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Window Dots & Identifier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                ca-career-os://live-cockpit/demo
              </span>
            </div>

            {/* Live Indicator Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>
                SIMULATOR ACTIVE • REAL-TIME DATA
              </span>
            </div>
          </div>

          {/* Interactive Mode Navigation Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              background: 'var(--surface-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '0.35rem',
              gap: '0.35rem',
            }}
          >
            <button
              type="button"
              onClick={() => setHeroTab('DIAGNOSTIC')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: heroTab === 'DIAGNOSTIC' ? 700 : 500,
                background: heroTab === 'DIAGNOSTIC' ? 'var(--surface-primary)' : 'transparent',
                color: heroTab === 'DIAGNOSTIC' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                border: heroTab === 'DIAGNOSTIC' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: heroTab === 'DIAGNOSTIC' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              <Compass size={15} />
              <span>1. 7-Pathway Diagnostic</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroTab('RESUME')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: heroTab === 'RESUME' ? 700 : 500,
                background: heroTab === 'RESUME' ? 'var(--surface-primary)' : 'transparent',
                color: heroTab === 'RESUME' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                border: heroTab === 'RESUME' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: heroTab === 'RESUME' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              <FileCheck2 size={15} />
              <span>2. Verified Resume (ADR-009)</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroTab('DRILL')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: heroTab === 'DRILL' ? 700 : 500,
                background: heroTab === 'DRILL' ? 'var(--surface-primary)' : 'transparent',
                color: heroTab === 'DRILL' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                border: heroTab === 'DRILL' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: heroTab === 'DRILL' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              <MessageSquareCode size={15} />
              <span>3. Big 4 Technical Drill</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroTab('CTC')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: heroTab === 'CTC' ? 700 : 500,
                background: heroTab === 'CTC' ? 'var(--surface-primary)' : 'transparent',
                color: heroTab === 'CTC' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                border: heroTab === 'CTC' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                boxShadow: heroTab === 'CTC' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
              }}
            >
              <Calculator size={15} />
              <span>4. In-Hand CTC Engine</span>
            </button>
          </div>

          {/* Interactive Cockpit Content Body */}
          <div style={{ padding: '1.75rem', textAlign: 'left' }}>

            {/* TAB 1: 7-PATHWAY DIAGNOSTIC */}
            {heroTab === 'DIAGNOSTIC' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                      Interactive Articleship Career Pathway Matcher
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Select a specialized CA vertical to test match calibration against Priya Sharma&apos;s Form 108 articleship portfolio.
                    </p>
                  </div>
                  {/* Vertical Selector Pills */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'AUDIT', label: 'Statutory Audit', match: '94%' },
                      { id: 'TAX', label: 'Direct & International Tax', match: '88%' },
                      { id: 'FPA', label: 'Strategic FP&A', match: '84%' },
                      { id: 'IB', label: 'M&A Deal Advisory', match: '79%' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setHeroPathway(item.id as any)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: heroPathway === item.id ? 'var(--brand-primary)' : 'var(--surface-secondary)',
                          color: heroPathway === item.id ? '#ffffff' : 'var(--text-secondary)',
                          border: heroPathway === item.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {item.label} ({item.match})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pathway Diagnostic Output Card */}
                <div
                  style={{
                    background: 'var(--surface-secondary)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Diagnostic Match Score
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                        {heroPathway === 'AUDIT' ? '94%' : heroPathway === 'TAX' ? '88%' : heroPathway === 'FPA' ? '84%' : '79%'}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>High Compatibility</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {heroPathway === 'AUDIT'
                        ? '36 months statutory audit working papers verified against CARO 2020 & Ind AS 115.'
                        : heroPathway === 'TAX'
                        ? '24 months corporate tax filings, Section 92E transfer pricing documentation verified.'
                        : heroPathway === 'FPA'
                        ? 'Variance analysis, budget forecast models, and EBITDA reconciliation verified.'
                        : 'DCF valuation, due diligence review notes, and transaction working papers verified.'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Verified Competency Grounding
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {heroPathway === 'AUDIT' && (
                        <>
                          <span className="badge badge-primary">Companies Act 2013</span>
                          <span className="badge badge-success">CARO 2020 Clause 3(i)-(xx)</span>
                          <span className="badge badge-info">Ind AS 115 Revenue</span>
                          <span className="badge badge-secondary">SA 700 Independent Audit</span>
                        </>
                      )}
                      {heroPathway === 'TAX' && (
                        <>
                          <span className="badge badge-primary">Section 115BAA</span>
                          <span className="badge badge-success">Transfer Pricing Sec 92CA</span>
                          <span className="badge badge-info">Form 3CD Tax Audit</span>
                          <span className="badge badge-secondary">DTAA Article 12 FTS</span>
                        </>
                      )}
                      {heroPathway === 'FPA' && (
                        <>
                          <span className="badge badge-primary">Rolling 13-Week Cashflow</span>
                          <span className="badge badge-success">EBITDA Variance Bridge</span>
                          <span className="badge badge-info">Capex IRR Analysis</span>
                          <span className="badge badge-secondary">Power BI / Board Deck</span>
                        </>
                      )}
                      {heroPathway === 'IB' && (
                        <>
                          <span className="badge badge-primary">DCF & LBO Modeling</span>
                          <span className="badge badge-success">Financial Due Diligence (FDD)</span>
                          <span className="badge badge-info">Quality of Earnings (QoE)</span>
                          <span className="badge badge-secondary">Target Debt-Free Cash-Free</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Big 4 / Corporate CTC Range
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {heroPathway === 'AUDIT' ? '₹14.5 – 18.0 LPA' : heroPathway === 'TAX' ? '₹15.0 – 19.5 LPA' : heroPathway === 'FPA' ? '₹16.0 – 22.0 LPA' : '₹18.0 – 25.0 LPA'}
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Benchmarked against Mumbai / Bengaluru / Gurugram offers.
                    </span>
                    <Link
                      href="/dashboard"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
                        textDecoration: 'none',
                        marginTop: 'auto',
                      }}
                    >
                      Inspect Full Career Pathway Breakdown <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VERIFIED RESUME (ADR-009) */}
            {heroTab === 'RESUME' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                      Zero-Hallucination Resume Verification (ADR-009)
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Compare CA Career OS cryptographically verifiable resume vs a standard unverified candidate resume.
                    </p>
                  </div>
                  {/* Mode Toggle */}
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setHeroResumeMode('VERIFIED')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: heroResumeMode === 'VERIFIED' ? '#047857' : 'var(--surface-secondary)',
                        color: heroResumeMode === 'VERIFIED' ? '#ffffff' : 'var(--text-secondary)',
                        border: heroResumeMode === 'VERIFIED' ? '1px solid #047857' : '1px solid var(--border-subtle)',
                      }}
                    >
                      ✓ CA Career OS Verified Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroResumeMode('RAW')}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: heroResumeMode === 'RAW' ? '#b91c1c' : 'var(--surface-secondary)',
                        color: heroResumeMode === 'RAW' ? '#ffffff' : 'var(--text-secondary)',
                        border: heroResumeMode === 'RAW' ? '1px solid #b91c1c' : '1px solid var(--border-subtle)',
                      }}
                    >
                      ✕ Standard Unverified Resume
                    </button>
                  </div>
                </div>

                {/* Resume Mode View */}
                {heroResumeMode === 'VERIFIED' ? (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.05)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCheck size={18} color="#059669" />
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#065f46' }}>
                          Verified CA Articleship Experience Profile
                        </span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'rgba(5, 150, 105, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#065f46' }}>
                        SHA-256: 4f9e8a...b72d1c • ICAI Form 108 Confirmed
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.35rem' }}>
                          VERIFIED WORK EXPERIENCE #1
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          Statutory Audit Articleship — BDO India LLP
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                          • Led inventory count observation & valuation tests under CARO 2020 Clause 3(ii) for a ₹820 Cr manufacturing enterprise.<br />
                          • Executed revenue cut-off testing across 180 invoices verifying 5-step model of Ind AS 115.<br />
                          • Zero audit exceptions found during engagement quality review (EQR).
                        </div>
                        <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#ecfdf5', color: '#047857', fontWeight: 600 }}>
                            ✓ Working Paper Ref: WP-INV-2023-42
                          </span>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.35rem' }}>
                          RECRUITER TRUST SCORE
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                          99.4% Authenticity
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                          Every bullet point is backed by actual work records submitted during articleship. Recruiters bypass 1st-round screening automatically.
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                          <Link href="/register" className="btn btn-primary btn-pill" style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}>
                            Generate Your Verified CA Resume <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={18} color="#dc2626" />
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#991b1b' }}>
                        Typical Unverified CA Resume (High ATS Discard Risk: 68%)
                      </span>
                    </div>
                    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div style={{ color: '#b91c1c', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        ⚠️ Ambiguous, unverified claims flagged by Big 4 ATS:
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <del>&quot;Handled complete audit of multiple large companies and solved tax problems.&quot;</del> (Lacks CARO standard references, no audited turnover mentioned)<br />
                        <del>&quot;Expert in Ind AS and GST compliance.&quot;</del> (No specific standards, no verifiable Form 108 cross-check)
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#7f1d1d' }}>
                      CA Career OS eliminates this completely by binding your resume directly to verified articleship working papers.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BIG 4 PARTNER INTERVIEW DRILL */}
            {heroTab === 'DRILL' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                      Big 4 Partner Technical Interview Drill
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Live simulation of an Ind AS 115 Partner-level evaluation interview case.
                    </p>
                  </div>
                  <span className="badge badge-warning">Partner Round Difficulty: High</span>
                </div>

                <div
                  style={{
                    background: 'var(--surface-secondary)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Case Scenario • Ind AS 115 Revenue from Contracts
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      &quot;A SaaS enterprise client signs a 3-year enterprise contract including on-premise license installation, customization, and 36 months of 24/7 technical support for ₹12 Crore upfront. Management recognized the full ₹12 Crore upon software delivery. As Audit Senior, how do you audit this under Ind AS 115?&quot;
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setHeroDrillRevealed(!heroDrillRevealed)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.55rem 1.15rem',
                        borderRadius: '8px',
                        background: heroDrillRevealed ? 'var(--surface-primary)' : 'var(--brand-primary)',
                        color: heroDrillRevealed ? 'var(--text-primary)' : '#ffffff',
                        border: '1px solid var(--brand-primary)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {heroDrillRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                      <span>{heroDrillRevealed ? 'Hide Model Partner Response' : 'Reveal Model Partner Response & Rubric'}</span>
                    </button>

                    <Link
                      href="/dashboard"
                      style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      Explore 50+ Case Drills in App <ArrowRight size={13} />
                    </Link>
                  </div>

                  {heroDrillRevealed && (
                    <div
                      style={{
                        background: '#ffffff',
                        padding: '1.25rem',
                        borderRadius: '8px',
                        border: '1px solid #93c5fd',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        animation: 'fadeIn 0.25s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e40af' }}>
                        🎯 Big 4 Model Partner Response (Score: 5.0 / 5.0):
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        <strong>1. Identification of Separate Performance Obligations:</strong> The license, installation customization, and 3-year support are distinct promises if the customer can benefit from each independently. If customization significantly modifies the software, they must be bundled.<br />
                        <strong>2. Standalone Selling Price Allocation:</strong> Allocate the ₹12 Cr consideration across obligations based on relative standalone selling prices (SSP).<br />
                        <strong>3. Timing of Recognition:</strong> The license portion is point-in-time; technical support MUST be recognized over time (straight-line over 36 months). Upfront full recognition is a material misstatement.<br />
                        <strong>4. Audit Evidence to Request:</strong> Master Service Agreement (MSA), time-sheet logs, vendor rate-cards for support, and management memo on distinctness under paragraph 27 of Ind AS 115.
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <span className="badge badge-success">✓ Technical Accuracy: 100%</span>
                        <span className="badge badge-primary">✓ Audit Evidence Grounded</span>
                        <span className="badge badge-info">✓ CARO & EQR Compliant</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: IN-HAND CTC ENGINE */}
            {heroTab === 'CTC' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                      Real-Time In-Hand Take-Home CTC Calculator
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Adjust your target offer package under the FY 2024-25 New Tax Regime (Section 115BAC).
                    </p>
                  </div>
                  <span className="badge badge-primary">Section 115BAC Compliant</span>
                </div>

                <div
                  style={{
                    background: 'var(--surface-secondary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  {/* Slider Control */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
                      <label htmlFor="hero-ctc-slider" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Target Gross Annual CTC:
                      </label>
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                        ₹{heroSalaryLpa}.0 Lakhs / annum
                      </span>
                    </div>
                    <input
                      id="hero-ctc-slider"
                      type="range"
                      min="8"
                      max="40"
                      step="1"
                      value={heroSalaryLpa}
                      onChange={(e) => setHeroSalaryLpa(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: 'var(--brand-primary)',
                        height: '8px',
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      <span>₹8 LPA (Entry CA)</span>
                      <span>₹18 LPA (Big 4 Senior)</span>
                      <span>₹28 LPA (Manager)</span>
                      <span>₹40 LPA (Director/VP)</span>
                    </div>
                  </div>

                  {/* Calculated Take-Home Grid */}
                  {(() => {
                    const grossAnnual = heroSalaryLpa * 100000;
                    const grossMonthly = Math.round(grossAnnual / 12);
                    const basicMonthly = Math.round(grossMonthly * 0.5);
                    const pfMonthly = Math.min(Math.round(basicMonthly * 0.12), 21600 / 12 * 2); // Standard PF deduction estimate
                    const standardDeduction = 75000;
                    const taxableIncome = Math.max(0, grossAnnual - standardDeduction);
                    
                    // New Tax Regime Slabs
                    let annualTax = 0;
                    if (taxableIncome > 1500000) {
                      annualTax += (taxableIncome - 1500000) * 0.3 + 140000;
                    } else if (taxableIncome > 1200000) {
                      annualTax += (taxableIncome - 1200000) * 0.2 + 80000;
                    } else if (taxableIncome > 1000000) {
                      annualTax += (taxableIncome - 1000000) * 0.15 + 50000;
                    } else if (taxableIncome > 700000) {
                      annualTax += (taxableIncome - 700000) * 0.1 + 20000;
                    } else if (taxableIncome > 300000) {
                      annualTax += (taxableIncome - 300000) * 0.05;
                    }
                    if (taxableIncome <= 700000) {
                      annualTax = 0; // Section 87A rebate
                    } else {
                      annualTax = annualTax * 1.04; // 4% Health & Education cess
                    }

                    const monthlyTds = Math.round(annualTax / 12);
                    const ptMonthly = 200;
                    const netTakeHomeMonthly = Math.max(0, grossMonthly - monthlyTds - pfMonthly - ptMonthly);

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>GROSS MONTHLY</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                            ₹{grossMonthly.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>₹{heroSalaryLpa} LPA ÷ 12</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONTHLY TAX (115BAC)</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginTop: '0.25rem' }}>
                            - ₹{monthlyTds.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Standard Ded: ₹75,000 incl.</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EPF & PROF. TAX</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d97706', marginTop: '0.25rem' }}>
                            - ₹{(pfMonthly + ptMonthly).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>12% PF + ₹200 PT</div>
                        </div>

                        <div
                          style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1.5px solid #10b981',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>NET IN-HAND TAKE HOME</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
                            ₹{netTakeHomeMonthly.toLocaleString('en-IN')} <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>/ mo</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.25rem' }}>Credit directly into Bank A/c</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Cockpit Footer Bar */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--surface-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={14} color="#059669" />
              <span>Multi-Tenant Blindfold Privacy Active (Enterprise Isolation)</span>
            </div>
            <Link
              href="/register"
              style={{
                color: 'var(--brand-primary)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Sign Up for Complete Personalized Suite <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Hero Infinite Marquee Ticker */}
        <div className="marquee-container" style={{ marginTop: '0.5rem', maxWidth: '1100px', width: '100%' }}>
          <div className="marquee-track">
            {/* Set 1 */}
            <div className="marquee-pill">
              <CheckCircle2 size={15} color="var(--accent-emerald)" />
              <span>Zero Resume Hallucinations (ADR-009)</span>
            </div>
            <div className="marquee-pill">
              <ShieldCheck size={15} color="var(--brand-primary)" />
              <span>ICAI Code of Ethics Grounded</span>
            </div>
            <div className="marquee-pill">
              <Lock size={15} color="var(--accent-indigo)" />
              <span>Candidate Blindfold Privacy</span>
            </div>
            <div className="marquee-pill">
              <Sparkles size={15} color="var(--accent-amber)" />
              <span>1-Click Instant Demo Portals</span>
            </div>
            <div className="marquee-pill">
              <Award size={15} color="var(--accent-cyan)" />
              <span>Companies Act 2013 & CARO 2020 Aligned</span>
            </div>

            {/* Set 2 (Duplicate for continuous seamless loop) */}
            <div className="marquee-pill">
              <CheckCircle2 size={15} color="var(--accent-emerald)" />
              <span>Zero Resume Hallucinations (ADR-009)</span>
            </div>
            <div className="marquee-pill">
              <ShieldCheck size={15} color="var(--brand-primary)" />
              <span>ICAI Code of Ethics Grounded</span>
            </div>
            <div className="marquee-pill">
              <Lock size={15} color="var(--accent-indigo)" />
              <span>Candidate Blindfold Privacy</span>
            </div>
            <div className="marquee-pill">
              <Sparkles size={15} color="var(--accent-amber)" />
              <span>1-Click Instant Demo Portals</span>
            </div>
            <div className="marquee-pill">
              <Award size={15} color="var(--accent-cyan)" />
              <span>Companies Act 2013 & CARO 2020 Aligned</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION — 3D Stacked Deck with Asymmetric Radius & Visible Behind Pages */}
      <section
        id="features"
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          padding: '0 1.5rem',
        }}
      >
        {/* Streamlined Clean Heading (No Clutter, Single Bold Title) */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>01 — CORE CAPABILITIES</span>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0.5rem 0 0.5rem' }}>
            Engineered for Professional CA Rigor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '620px', margin: '0 auto' }}>
            Full-stack articleship verification, Big 4 mock drills, and compensation analytics in one unified platform.
          </p>
        </div>

        {/* 3D Stacked Deck with Side Navigation Arrows */}
        {(() => {
          const currentFeature = FEATURE_GROUPS[activeFeatureIdx];
          const FeatureIcon = currentFeature.icon;
          const nextIdx = (activeFeatureIdx + 1) % FEATURE_GROUPS.length;
          const nextNextIdx = (activeFeatureIdx + 2) % FEATURE_GROUPS.length;

          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                width: '100%',
                maxWidth: '1240px',
                margin: '0 auto',
                position: 'relative',
              }}
            >
              {/* Left Arrow Button (Beside the Box) */}
              <button
                type="button"
                onClick={handlePrevFeature}
                aria-label="Previous capability"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-subtle)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexShrink: 0,
                  zIndex: 25,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.background = 'var(--brand-soft)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--surface-primary)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronLeft size={26} />
              </button>

              {/* Stacked Deck Box Container (Enlarged Box & Visible Stacked Page Edges Behind) */}
              <div
                style={{
                  flex: 1,
                  maxWidth: '1060px',
                  position: 'relative',
                  minHeight: '460px',
                  paddingTop: '28px',
                  paddingRight: '22px',
                }}
              >
                {/* Layer 3: Deepest Behind Page Edge (Clearly visible stacked layer) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0px',
                    left: '24px',
                    right: '0px',
                    bottom: '28px',
                    borderRadius: '4px 42px 4px 4px',
                    background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.98) 0%, rgba(226, 232, 240, 0.92) 100%)',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    zIndex: 1,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '0.45rem 1.75rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    STACKED PAGE {String(nextNextIdx + 1).padStart(2, '0')} • {FEATURE_GROUPS[nextNextIdx].title}
                  </span>
                </div>

                {/* Layer 2: Intermediate Behind Page Edge (Immediate next page edge) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '12px',
                    right: '10px',
                    bottom: '14px',
                    borderRadius: '4px 40px 4px 4px',
                    background: 'var(--surface-primary)',
                    border: '1.5px solid var(--border-subtle)',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.09)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '0.45rem 1.75rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--brand-primary)',
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>NEXT: {FEATURE_GROUPS[nextIdx].title}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>

                {/* Layer 1: Front Active Main Card (Asymmetric: 3 square corners, top-right curved) */}
                <div
                  key={currentFeature.id}
                  className={`stacked-card-main asymmetric-card-curve ${
                    featureDirection === 'next' ? 'card-slide-next' : 'card-slide-prev'
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    borderRadius: '4px 38px 4px 4px',
                    background: 'var(--surface-primary)',
                    border: '1.5px solid var(--border-subtle)',
                    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                    padding: '2.5rem 2.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.75rem',
                  }}
                >
                  {/* Header row: Icon, Badge, Title and Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '4px 18px 4px 4px',
                          background: 'var(--brand-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-subtle)',
                          flexShrink: 0,
                        }}
                      >
                        <FeatureIcon size={28} color="var(--brand-primary)" />
                      </div>
                      <div>
                        <span className={`badge ${currentFeature.badgeClass}`}>{currentFeature.badge}</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0 0 0', letterSpacing: '-0.015em' }}>
                          {currentFeature.title}
                        </h3>
                      </div>
                    </div>

                    {/* Counter Pill */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
                        background: 'var(--surface-secondary)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {String(activeFeatureIdx + 1).padStart(2, '0')} / {String(FEATURE_GROUPS.length).padStart(2, '0')}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.96875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {currentFeature.description}
                  </p>

                  {/* 4 Rigorous Capabilities Grid (Spacious 2-column layout) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                      gap: '1.15rem',
                      padding: '1.25rem 1.5rem',
                      background: 'var(--surface-secondary)',
                      borderRadius: '4px 22px 4px 4px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {currentFeature.capabilities.map((cap, idx) => {
                      const parts = cap.split(': ');
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.65rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            lineHeight: 1.5,
                          }}
                        >
                          <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>
                            {parts.length > 1 ? (
                              <>
                                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{parts[0]}:</strong>{' '}
                                <span style={{ color: 'var(--text-secondary)' }}>{parts.slice(1).join(': ')}</span>
                              </>
                            ) : (
                              cap
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Bar: Action CTA and Quick Indicator Dots */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Link
                      href={currentFeature.ctaHref}
                      className="btn btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.75rem 1.75rem',
                        fontSize: '0.9375rem',
                        borderRadius: '6px',
                      }}
                    >
                      <span>{currentFeature.ctaText}</span>
                      <ArrowRight size={15} />
                    </Link>

                    {/* Dot pagination */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {FEATURE_GROUPS.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => handleSelectFeature(dotIdx)}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                          style={{
                            width: activeFeatureIdx === dotIdx ? '28px' : '9px',
                            height: '9px',
                            borderRadius: '4px',
                            background: activeFeatureIdx === dotIdx ? 'var(--brand-primary)' : 'var(--border-strong)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Arrow Button (Beside the Box) */}
              <button
                type="button"
                onClick={handleNextFeature}
                aria-label="Next capability"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--brand-primary)',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexShrink: 0,
                  zIndex: 25,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary-hover)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronRight size={26} />
              </button>
            </div>
          );
        })()}
      </section>

      {/* 3. HOW IT WORKS SECTION — Guided Animated Pathway with Auto-Progression & Interactive UI Showcase */}
      <section
        id="how-it-works"
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '1260px',
          margin: '0 auto',
          width: '100%',
          padding: '0 1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>02 — SYSTEMATIC WORKFLOW</span>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0.5rem 0' }}>
            How CA Career OS Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
            A streamlined 5-step journey transforming raw Form 108 articleship into partner-track career offers.
          </p>
        </div>

        <div
          className="workflow-pathway-container"
          onMouseEnter={() => setIsWorkflowPaused(true)}
          onMouseLeave={() => setIsWorkflowPaused(false)}
          style={{ position: 'relative' }}
        >
          {/* Stepper Connecting Path Bar */}
          <div className="workflow-stepper-header" style={{ marginBottom: '2.5rem' }}>
            {/* Background Track Line */}
            <div className="workflow-track-line">
              <div
                className="workflow-track-line-progress"
                style={{
                  width: `${(activeWorkflowStep / (HOW_IT_WORKS_STEPS.length - 1)) * 100}%`,
                  transition: 'width 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            {/* 5 Milestone Pathway Nodes */}
            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const isCompleted = idx < activeWorkflowStep;
              const isActive = idx === activeWorkflowStep;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => handleSelectWorkflowStep(idx)}
                  className={`workflow-node-button ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  title={step.title}
                  style={{
                    position: 'relative',
                    boxShadow: isActive ? '0 0 0 8px rgba(37, 99, 235, 0.18), 0 8px 20px rgba(37, 99, 235, 0.35)' : 'none',
                    transform: isActive ? 'scale(1.18)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : step.num}
                  
                  {/* Subtle active ping beacon */}
                  {isActive && isAutoPlayingWorkflow && !isWorkflowPaused && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        border: '2px solid #3b82f6',
                        animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Auto-Play Progression Indicator Bar */}
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isWorkflowPaused ? '#f59e0b' : '#10b981',
                  boxShadow: isWorkflowPaused ? '0 0 8px #f59e0b' : '0 0 8px #10b981',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isWorkflowPaused
                  ? 'PAUSED (HOVERING TO INSPECT)'
                  : `AUTO-ADVANCING STEP ${activeWorkflowStep + 1} OF 05 • TRANSITIONS IN ${Math.max(1, Math.ceil((100 - workflowProgress) / 25))}s`}
              </span>
            </div>

            {/* Micro Countdown Progress Bar */}
            <div
              style={{
                width: '180px',
                height: '6px',
                background: 'var(--surface-secondary)',
                borderRadius: '9999px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: `${workflowProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--brand-primary), #06b6d4)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAutoPlayingWorkflow(!isAutoPlayingWorkflow)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isAutoPlayingWorkflow ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              {isAutoPlayingWorkflow ? <RotateCw size={13} className={isWorkflowPaused ? '' : 'spin'} /> : <Play size={13} />}
              <span>{isAutoPlayingWorkflow ? (isWorkflowPaused ? 'Resume Auto-Play' : 'Auto-Play Active') : 'Start Auto-Play'}</span>
            </button>
          </div>

          {/* Enlarged Grand Showcase Box: Narrative (Left) + Rich Interactive UI Mock (Right) */}
          {(() => {
            const currentStep = HOW_IT_WORKS_STEPS[activeWorkflowStep];
            const StepIcon = currentStep.icon;

            return (
              <div
                key={activeWorkflowStep}
                className="workflow-spotlight-box glass-panel"
                style={{
                  padding: '3rem',
                  maxWidth: '1180px',
                  margin: '0 auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: '3rem',
                  alignItems: 'center',
                  borderRadius: '24px',
                  border: '1.5px solid var(--border-glow)',
                  boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                  background: 'var(--surface-primary)',
                }}
              >
                {/* Left Column: Narrative, Milestone Detail & Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--brand-primary)',
                        background: 'var(--brand-soft)',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '9999px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      MILESTONE {currentStep.num} OF 05
                    </span>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'var(--brand-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <StepIcon size={22} color="var(--brand-primary)" />
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                      {currentStep.title}
                    </h3>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--brand-primary)', marginBottom: '0.75rem' }}>
                      {currentStep.subtitle}
                    </div>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                      {currentStep.description}
                    </p>
                  </div>

                  {/* Professional Rigor Note */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      background: 'var(--surface-secondary)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                    }}
                  >
                    <ShieldCheck size={20} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Professional Rigor Standard
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
                        {currentStep.detail}
                      </div>
                    </div>
                  </div>

                  {/* Step Navigation Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <button
                        type="button"
                        disabled={activeWorkflowStep === 0}
                        onClick={() => handleSelectWorkflowStep(Math.max(0, activeWorkflowStep - 1))}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.6rem 1.15rem',
                          fontSize: '0.84375rem',
                          opacity: activeWorkflowStep === 0 ? 0.4 : 1,
                          cursor: activeWorkflowStep === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ArrowLeft size={14} />
                        <span>Previous</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectWorkflowStep(
                            activeWorkflowStep === HOW_IT_WORKS_STEPS.length - 1 ? 0 : activeWorkflowStep + 1
                          )
                        }
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.35rem', fontSize: '0.84375rem' }}
                      >
                        <span>{activeWorkflowStep === HOW_IT_WORKS_STEPS.length - 1 ? 'Restart Path (Step 01)' : 'Next Milestone'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Step {activeWorkflowStep + 1} of 5
                    </span>
                  </div>
                </div>

                {/* Right Column: Creative Live Interactive UI Stage */}
                <div
                  style={{
                    background: 'var(--surface-secondary)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-subtle)',
                    padding: '1.75rem',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* UI STAGE 01: Form 108 Articleship Exposure Map */}
                  {activeWorkflowStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Compass size={18} color="var(--brand-primary)" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Form 108 Articleship Portfolio
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          ICAI SRO-074921 • VERIFIED
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Statutory Audit & CARO 2020</span>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>16 Months (44%)</span>
                          </div>
                          <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '44%', height: '100%', background: '#10b981', borderRadius: '4px' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Corporate & Direct Tax (Form 3CD)</span>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>10 Months (28%)</span>
                          </div>
                          <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '28%', height: '100%', background: '#2563eb', borderRadius: '4px' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Internal Controls & ICFR (Sec 143)</span>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>6 Months (17%)</span>
                          </div>
                          <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '17%', height: '100%', background: '#7c3aed', borderRadius: '4px' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Due Diligence & Transaction Support</span>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>4 Months (11%)</span>
                          </div>
                          <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '11%', height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.78125rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>📁 34 Working Paper Files Attached</span>
                        <span style={{ fontFamily: 'monospace', color: '#047857', fontWeight: 600 }}>SHA-256 Validated</span>
                      </div>
                    </div>
                  )}

                  {/* UI STAGE 02: 7-Pathway Career Diagnostic */}
                  {activeWorkflowStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Layers size={18} color="#7c3aed" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Career Fit Diagnostics Matrix
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          TOP 5% COHORT FIT
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUTORY AUDIT</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', margin: '0.2rem 0' }}>94%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: ₹14 - 18 LPA</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DIRECT TAX & TP</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', margin: '0.2rem 0' }}>88%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: ₹15 - 19 LPA</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STRATEGIC FP&A</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', margin: '0.2rem 0' }}>84%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: ₹16 - 22 LPA</div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>M&A TRANSACTION</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '0.2rem 0' }}>79%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: ₹18 - 25 LPA</div>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>30d: Big 4 Prep</span>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>60d: Mock Interviews</span>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>90d: Campus Placement</span>
                      </div>
                    </div>
                  )}

                  {/* UI STAGE 03: Zero-Fabrication Resume (ADR-009) */}
                  {activeWorkflowStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileCheck2 size={18} color="#059669" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            ADR-009 Provenance Lock
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          MATHEMATICAL ZERO-HALLUCINATION
                        </span>
                      </div>

                      <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
                          ✓ ATTESTED ARTICLESHIP CLAIMS
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          • Led statutory audit testing for ₹820 Cr client under CARO 2020 Clause 3(ii).<br />
                          • Verified 180 cut-off invoices under Ind AS 115 5-step criteria.
                        </div>
                        <div style={{ marginTop: '0.25rem', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600 }}>
                          🚫 Blocked: 2 unearned claims rejected (No Form 108 audit mandate found)
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.78125rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Big 4 ATS Compatibility</span>
                        <span style={{ fontWeight: 800, color: '#059669' }}>98.4% Match Score</span>
                      </div>
                    </div>
                  )}

                  {/* UI STAGE 04: Technical Mock Interviews */}
                  {activeWorkflowStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MessageSquareCode size={18} color="#2563eb" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Ind AS Partner Evaluation Terminal
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', background: 'rgba(37, 99, 235, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          PARTNER ROUND SIMULATION
                        </span>
                      </div>

                      <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
                          CASE: IND AS 115 REVENUE WITH VARIABLE CONSIDERATION
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          &quot;Candidate correctly isolated separate performance obligations and rejected upfront ₹12 Cr software revenue recognition.&quot;
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>TECHNICAL</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>98%</div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>SKEPTICISM</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>96%</div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>STAR FORMAT</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed' }}>94%</div>
                        </div>
                      </div>

                      <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                        ✓ Verdict: Partner-Ready Recommendation for Big 4 Senior Associate
                      </div>
                    </div>
                  )}

                  {/* UI STAGE 05: In-Hand CTC & Blindfold Confidentiality */}
                  {activeWorkflowStep === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calculator size={18} color="#059669" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            In-Hand Compensation & Blindfold Shield
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          BLINDFOLD ACTIVE
                        </span>
                      </div>

                      <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1.5px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONTHLY NET TAKE-HOME</div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem' }}>
                            ₹1,21,450 <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>/ mo</span>
                          </div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>FY 2024-25 New Tax Regime</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ANNUAL GROSS CTC</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹18,00,000</div>
                        </div>
                        <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STANDARD DEDUCTION</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>- ₹75,000 Applied</div>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                        <Lock size={15} color="#059669" />
                        <span>Current Firm Recruiters [PwC/EY/KPMG] Blindfolded from Active Profile</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 4. 7 CA CAREER PATHWAYS SECTION — 3D Stacked Horizon Deck */}
      <section
        id="pathways"
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          padding: '0 1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>03 — SPECIALIZATION INTELLIGENCE</span>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0.5rem 0' }}>
            Tailored for the 7 Chartered Accountancy Horizons
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
            Align your articleship exposure, technical aptitude, and compensation objectives with the right track.
          </p>
        </div>

        {/* Pathway Selector Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
          {CA_PATHWAYS.map((p, idx) => (
            <button
              key={p.pathway}
              type="button"
              onClick={() => handleSelectPathway(idx)}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                background: pathwayIndex === idx ? 'var(--brand-primary)' : 'var(--surface-primary)',
                color: pathwayIndex === idx ? '#ffffff' : 'var(--text-secondary)',
                border: pathwayIndex === idx ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                boxShadow: pathwayIndex === idx ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* 3D Stacked Horizon Deck with Side Navigation Arrows */}
        {(() => {
          const activeItem = CA_PATHWAYS[pathwayIndex] || CA_PATHWAYS[0];
          const nextIdx = (pathwayIndex + 1) % CA_PATHWAYS.length;
          const nextNextIdx = (pathwayIndex + 2) % CA_PATHWAYS.length;

          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.25rem',
                width: '100%',
                maxWidth: '1240px',
                margin: '0 auto',
                position: 'relative',
              }}
            >
              {/* Left Arrow Button (Outside the Box) */}
              <button
                type="button"
                onClick={handlePrevPathway}
                aria-label="Previous career pathway"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-subtle)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexShrink: 0,
                  zIndex: 25,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.background = 'var(--brand-soft)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--surface-primary)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronLeft size={26} />
              </button>

              {/* Stacked Deck Box Container */}
              <div
                style={{
                  flex: 1,
                  maxWidth: '1060px',
                  position: 'relative',
                  minHeight: '440px',
                  paddingTop: '28px',
                  paddingRight: '22px',
                }}
              >
                {/* Layer 3: Deepest Behind Horizon Edge (Visible stacked 3rd layer) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0px',
                    left: '24px',
                    right: '0px',
                    bottom: '28px',
                    borderRadius: '4px 42px 4px 4px',
                    background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.98) 0%, rgba(226, 232, 240, 0.92) 100%)',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    zIndex: 1,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '0.45rem 1.75rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    STACKED HORIZON {String(nextNextIdx + 1).padStart(2, '0')} • {CA_PATHWAYS[nextNextIdx].name}
                  </span>
                </div>

                {/* Layer 2: Intermediate Behind Horizon Edge (Immediate next horizon) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '12px',
                    right: '10px',
                    bottom: '14px',
                    borderRadius: '4px 40px 4px 4px',
                    background: 'var(--surface-primary)',
                    border: '1.5px solid var(--border-subtle)',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.09)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '0.45rem 1.75rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--brand-primary)',
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>NEXT: {CA_PATHWAYS[nextIdx].name}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>

                {/* Layer 1: Front Active Main Horizon Card */}
                <div
                  key={activeItem.pathway}
                  className={`stacked-card-main asymmetric-card-curve ${
                    pathwayDirection === 'next' ? 'card-slide-next' : 'card-slide-prev'
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    borderRadius: '4px 38px 4px 4px',
                    background: 'var(--surface-primary)',
                    border: '1.5px solid var(--border-subtle)',
                    borderLeft: '6px solid var(--brand-primary)',
                    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                    padding: '2.75rem 3rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2.5rem',
                    alignItems: 'center',
                  }}
                >
                  {/* Left Column: Horizon Information & Call to Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        HIRING DEMAND: {activeItem.hiringDemand}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: 'var(--brand-primary)',
                          background: 'var(--surface-secondary)',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {String(pathwayIndex + 1).padStart(2, '0')} / {String(CA_PATHWAYS.length).padStart(2, '0')}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {activeItem.name}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
                        {activeItem.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Link
                        href={`/career?pathway=${activeItem.pathway}`}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.65rem', fontSize: '0.875rem', borderRadius: '6px' }}
                      >
                        <span>Diagnose Fit for {activeItem.name}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Representative Target Roles & Compensation Benchmark */}
                  <div
                    style={{
                      background: 'var(--surface-secondary)',
                      padding: '1.75rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        Representative Target Roles
                      </h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>
                        Top Corporate Recruiters
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {activeItem.roles.map((r, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem 1.15rem',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          }}
                        >
                          <Briefcase size={16} color="var(--brand-primary)" />
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Benchmark Note */}
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        background: 'rgba(37, 99, 235, 0.06)',
                        border: '1px solid rgba(37, 99, 235, 0.15)',
                        fontSize: '0.78125rem',
                        color: 'var(--brand-primary)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>ICAI Placement & Market CTC: ₹14.0 - 24.0 LPA Range</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Arrow Button (Outside the Box) */}
              <button
                type="button"
                onClick={handleNextPathway}
                aria-label="Next career pathway"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--brand-primary)',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexShrink: 0,
                  zIndex: 25,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary-hover)';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronRight size={26} />
              </button>
            </div>
          );
        })()}
      </section>

      {/* 5. PRICING SECTION (Complete 4 Tiers from /pricing) */}
      <section
        id="pricing"
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>04 — TRANSPARENT TIERS</span>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Built for Candidates, Recruiters & Practice Firms
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '620px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Clear, server-enforced entitlements with zero hidden fees. Includes official GST invoices with SAC code 998314.
          </p>

          {/* Billing Cycle Switcher */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem',
              borderRadius: '9999px',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: billingCycle === 'MONTHLY' ? 'var(--brand-primary)' : 'transparent',
                color: billingCycle === 'MONTHLY' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: billingCycle === 'ANNUAL' ? 'var(--brand-primary)' : 'transparent',
                color: billingCycle === 'ANNUAL' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              Annual Pass (Save ~17%)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {/* Tier 1: Free Candidate */}
          <div className="glass-panel scroll-card-reveal scroll-stagger-1" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>FOREVER FREE</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Free Candidate</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.75rem 0' }}>
                ₹0 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Essential career diagnostic tools for qualified CAs and articleship trainees.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> 7-Pathway capability diagnostic</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> 3 Tailored resumes per month</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> 3 Technical mock interview drills</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Standard CTC unbundler</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }}>
              Get Started Free
            </Link>
          </div>

          {/* Tier 2: Pro Candidate */}
          <div className="glass-panel scroll-card-reveal scroll-stagger-2" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--brand-primary)', position: 'relative', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-primary)', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '9999px', letterSpacing: '0.05em' }}>
              MOST POPULAR
            </div>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>ACCELERATOR</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Pro Candidate</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.75rem 0' }}>
                {billingCycle === 'MONTHLY' ? '₹999' : '₹9,990'} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>{billingCycle === 'MONTHLY' ? '/ month' : '/ year'}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Full suite for serious candidates targeting Big 4 and high-growth corporate roles.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Unlimited Zero-Fabrication resumes</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Unlimited technical mock interviews</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Adaptive learning task injection</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-cyan)" /> Verified 1-on-1 mentor booking</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
              Upgrade to Pro
            </Link>
          </div>

          {/* Tier 3: Practice CRM */}
          <div className="glass-panel scroll-card-reveal scroll-stagger-3" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>PRACTITIONER</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Practice Firm OS</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.75rem 0' }}>
                {billingCycle === 'MONTHLY' ? '₹2,499' : '₹24,990'} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>{billingCycle === 'MONTHLY' ? '/ month' : '/ year'}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                For Chartered Accountants running proprietary firms or partnership offices.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Full client master repository</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Statutory compliance calendar</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> Filing ARN / UDIN tracking</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-emerald)" /> ICAI non-solicitation compliant</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }}>
              Start Firm Workspace
            </Link>
          </div>

          {/* Tier 4: Team Employer */}
          <div className="glass-panel scroll-card-reveal scroll-stagger-4" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>RECRUITER</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Team Employer</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.75rem 0' }}>
                {billingCycle === 'MONTHLY' ? '₹7,999' : '₹79,990'} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>{billingCycle === 'MONTHLY' ? '/ month' : '/ year'}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                For corporate talent teams and accounting firms hiring qualified CAs.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Up to 5 active verified job postings</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Candidate pipeline Kanban review</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Candidate discovery with consent</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="var(--accent-amber)" /> Verified employer blue badge</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: '2rem', width: '100%' }}>
              Post CA Openings
            </Link>
          </div>
        </div>
      </section>

      {/* 6. ABOUT & ETHICAL GOVERNANCE SECTION (from /about) */}
      <section
        id="about"
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>05 — PURPOSE & GOVERNANCE</span>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Built for Professional Rigor & Ethical Trust
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
            Grounding your career in factual articleship proof, cryptographic privacy blindfolds, and strict ICAI non-solicitation standards.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel scroll-card-reveal scroll-stagger-1" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Lock size={20} color="var(--brand-primary)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Candidate Blindfold
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Complete cryptographic separation between candidate personal workspaces and employer organization spaces. Your current firm’s recruiters can never track your job search.
            </p>
          </div>

          <div className="glass-panel scroll-card-reveal scroll-stagger-2" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <FileCheck2 size={20} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Zero-Fabrication Rule
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Under ADR-009, AI resume tailoring is mathematically constrained to factual, attested training records. We refuse to invent unearned credentials or fake audit metrics.
            </p>
          </div>

          <div className="glass-panel scroll-card-reveal scroll-stagger-3" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={20} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ICAI Ethical Grounding
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Grounding in ICAI Code of Ethics Clauses 6 and 7 of Part I of the First Schedule. Practice tools respect non-solicitation guidelines while tracking compliances.
            </p>
          </div>

          <div className="glass-panel scroll-card-reveal scroll-stagger-4" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={20} color="var(--accent-amber)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Explainable Match Rubrics
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              No black-box rejection algorithms. Every job match and interview score displays exact, transparent statutory rubrics and skill breakdown matrices.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS SECTION (from /faq) */}
      <section
        id="faq"
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>06 — CLARITY & TRUST</span>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Direct answers regarding Form 108 verification, privacy blindfolds, and ICAI ethical standards.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className={`faq-accordion-item scroll-card-reveal scroll-stagger-${(idx % 4) + 1} ${isOpen ? 'is-active' : ''}`}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    gap: '1rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                    {faq.q}
                  </h3>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isOpen ? 'var(--brand-soft)' : 'var(--surface-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <ChevronDown
                      size={18}
                      color={isOpen ? 'var(--brand-primary)' : 'var(--text-muted)'}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>

                {/* CSS Grid Accordion for 60fps Height Animation */}
                <div className={`faq-grid-accordion ${isOpen ? 'is-open' : ''}`}>
                  <div className="faq-grid-inner" style={{ padding: '0 1.5rem 1.35rem 1.5rem' }}>
                    <p
                      style={{
                        fontSize: '0.90625rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.65,
                        margin: 0,
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '0.875rem',
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CONTACT & DIRECT SUPPORT SECTION (from /contact) */}
      <section
        id="contact"
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="editorial-step" style={{ display: 'inline-block' }}>07 — DIRECT CONTACT & SUPPORT</span>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Connect with our Member Operations Team
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
            Inquiries regarding career diagnostics, firm onboarding, or verified recruitment receive responses within 4 business hours.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Contact Details & SLA Card */}
          <div className="glass-panel" style={{ padding: '2.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>SLA: &lt; 4 HOURS</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Dedicated Member Support
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Our operations team includes qualified Chartered Accountants and technical recruiters who understand ICAI compliance and recruitment cycles.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={18} color="var(--brand-primary)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Inquiries</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>support@cacareeros.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} color="var(--brand-primary)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operations Hours</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mon – Sat, 9:00 AM – 7:00 PM IST</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Tracking</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Deterministic Reference Codes (TKT-YYYY-XXXXXX)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="glass-panel" style={{ padding: '2.25rem', borderRadius: 'var(--radius-lg)' }}>
            {contactSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle2 size={28} color="var(--accent-emerald)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Inquiry Dispatched Successfully
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Your support reference code is:
                </p>
                <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-primary)', padding: '0.5rem 1rem', background: 'var(--brand-soft)', borderRadius: '6px', display: 'inline-block', marginBottom: '1.5rem' }}>
                  {contactSuccess.ticketRef}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  A confirmation email has been dispatched. Our team will review your message shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setContactSuccess(null)}
                  className="btn btn-secondary"
                  style={{ marginTop: '1.25rem' }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Submit an Inquiry
                </h3>

                {contactError && (
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{contactError}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="CA Rahul Sharma"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="rahul.sharma@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Category
                  </label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="CAREER_SUPPORT">CA Career Diagnostic & Resumes</option>
                    <option value="RECRUITER_INQUIRY">Employer & Recruiter Verification</option>
                    <option value="PRACTICE_SOLUTIONS">CA Practice Firm Solutions</option>
                    <option value="TECHNICAL_BUG">Security & Technical Feedback</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="e.g., Query regarding Form 108 verification"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Please specify your query or firm requirements in detail..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <Send size={16} />
                  <span>{contactSubmitting ? 'Submitting Inquiry...' : 'Dispatch Support Ticket'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION WITH LOADING SIMULATION */}
      <section
        className="scroll-reveal-section scroll-reveal scroll-load-pulse"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem',
        }}
      >
        <div
          className="cta-shimmer-box glass-panel"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', maxWidth: '800px' }}>
            <span className="badge badge-indigo" style={{ padding: '0.35rem 0.95rem', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              JOIN INDIA’S CA CAREER PLATFORM
            </span>

            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.22,
                margin: 0,
              }}
            >
              The Sovereign Career Operating System for Chartered Accountants
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '620px', lineHeight: 1.6, margin: 0 }}>
              Diagnose your 7-pathway fit, unbundle in-hand compensation packages, and test drive the platform with 1 click.
            </p>

            {/* Interactive Loading Demo Simulator Box */}
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                marginTop: '0.75rem',
                padding: '1.25rem 1.75rem',
                borderRadius: '12px',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-glow)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--brand-primary)" />
                  1-Click Interactive Test Drive
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: demoLoadingStage === 'IDLE' ? 'var(--text-muted)' : 'var(--brand-primary)',
                    fontWeight: 600,
                  }}
                >
                  {demoLoadingStage === 'IDLE' && 'READY TO LAUNCH'}
                  {demoLoadingStage === 'ANALYZING' && 'PHASE 1: ARTICLES SCAN'}
                  {demoLoadingStage === 'MATCHING' && 'PHASE 2: FIT BENCHMARK'}
                  {demoLoadingStage === 'READY' && 'PHASE 3: ENTERING OS'}
                </span>
              </div>

              {/* Dynamic Loading Meter */}
              {demoLoadingStage !== 'IDLE' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <div
                    style={{
                      height: '6px',
                      width: '100%',
                      background: 'var(--surface-secondary)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--brand-primary), var(--accent-cyan))',
                        width:
                          demoLoadingStage === 'ANALYZING'
                            ? '40%'
                            : demoLoadingStage === 'MATCHING'
                            ? '78%'
                            : '100%',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RotateCw size={12} className="spin" />
                      {demoLoadingStage === 'ANALYZING' && 'Analyzing Form 108 Articleship Inventory...'}
                      {demoLoadingStage === 'MATCHING' && 'Benchmarking 7-Pathway Fit Scores & CTC Matrix...'}
                      {demoLoadingStage === 'READY' && 'Verified! Redirecting to Command Center...'}
                    </span>
                    <span className="loading-dots">
                      <span>•</span>
                      <span>•</span>
                      <span>•</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, textAlign: 'left' }}>
                  Simulate instant Form 108 verification and preview the executive CA Command Center without entering credentials.
                </p>
              )}

              <button
                type="button"
                disabled={demoLoadingStage !== 'IDLE'}
                onClick={handleTriggerDemo}
                className="btn btn-primary btn-pill"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {demoLoadingStage === 'IDLE' ? (
                  <>
                    <Sparkles size={16} />
                    <span>Launch 1-Click Instant Test Drive</span>
                  </>
                ) : (
                  <>
                    <RotateCw size={16} className="spin" />
                    <span>Initializing Sovereign Environment...</span>
                  </>
                )}
              </button>
            </div>

            {/* Standard Direct Links */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              <Link href="/register" className="btn btn-secondary btn-pill" style={{ padding: '0.65rem 1.75rem', fontSize: '0.9375rem' }}>
                <span>Create Free Account</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-pill" style={{ padding: '0.65rem 1.75rem', fontSize: '0.9375rem' }}>
                <span>Sign In / Demo Portals</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
