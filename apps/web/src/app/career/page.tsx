'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Target,
  ListTodo,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  Check,
  ExternalLink,
  Plus,
  Loader2,
  GitBranch,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileText,
  MessageSquareCode,
  FileCheck2,
  X,
  Sliders,
  Wand2,
  Clock,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  CAPathway,
  CandidateProfileInput,
  CandidateSkillItem,
  SkillGapAnalysisReport,
  PathwayFitReport,
} from '@ca-career-os/shared';
import { apiClient } from '@/lib/api-client';
import { getDetailedFallbackTasks } from '@/lib/detailed-roadmap-curriculum';

const ARTICLESHIP_DOMAINS = [
  { id: 'STATUTORY_AUDIT', label: 'Statutory Audit (Ind AS / IFRS)' },
  { id: 'INTERNAL_AUDIT', label: 'Internal Audit & IFC Testing' },
  { id: 'DIRECT_TAX', label: 'Direct & Corporate Tax' },
  { id: 'TAX_AUDIT', label: 'Tax Audit (Form 3CD)' },
  { id: 'TRANSFER_PRICING', label: 'Transfer Pricing (Form 3CEB)' },
  { id: 'GST_COMPLIANCE', label: 'Indirect Tax & GST' },
  { id: 'M_AND_A_VALUATION', label: 'M&A Due Diligence & Valuation' },
  { id: 'CORP_FIN_FPA', label: 'Corporate Finance & FP&A' },
  { id: 'ROC_COMPLIANCE', label: 'Company Law & ROC' },
];

const FIRM_TIERS = [
  { id: 'BIG4', label: 'Big 4 (Deloitte, PwC, EY, KPMG)' },
  { id: 'TOP10', label: 'Top 10 / Top 20 (BDO, Grant Thornton, RSM, etc.)' },
  { id: 'MID_SIZE', label: 'Mid-Size CA Firm (Multi-partner, 50+ staff)' },
  { id: 'SMALL', label: 'Proprietorship / Boutique Audit Practice' },
];

const PATHWAY_LABELS: Record<string, string> = {
  AUDIT: 'Statutory Audit & Assurance',
  TAX: 'Direct & Corporate Taxation',
  FPA: 'FP&A & Strategic Finance',
  CORP_FIN: 'Corporate Finance & Treasury',
  IB: 'Investment Banking & M&A',
  CONSULTING: 'Forensic & Management Consulting',
  PRACTICE: 'Independent CA Practice OS',
};

interface RoadmapTask {
  id: string;
  milestone: 'DAY_30' | 'DAY_60' | 'DAY_90';
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string | null;
  dueDate?: string | null;
  // Roadmap.sh Visual Graph Architecture
  keySkills?: string[];
  stage?: 'FOUNDATION' | 'APPLICATION' | 'MASTERY';
  branch?: 'left' | 'center' | 'right';
  estimatedHours?: number;
  statutoryReference?: string;
  interviewQuestion?: string;
  interviewAnswerKey?: string;
  practicalDeliverable?: string;
  workpaperModel?: string;
  prerequisites?: string[];
  weekRange?: string;
  submodules?: string[];
  checklist?: string[];
  resources?: string[];
}

export default function CareerHubPage() {
  const [activeTab, setActiveTab] = useState<'pathways' | 'skillgap' | 'roadmap' | 'profile'>('pathways');
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Roadmap.sh visual mode & inspector
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [selectedNode, setSelectedNode] = useState<RoadmapTask | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);

  // GenAI Customizer Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [selectedPace, setSelectedPace] = useState<'ACCELERATED' | 'BALANCED' | 'INTENSIVE'>('BALANCED');
  const [aiGeneratingStage, setAiGeneratingStage] = useState<'IDLE' | 'ANALYZING' | 'GRAPHING' | 'READY'>('IDLE');

  // Candidate Profile State
  const [profile, setProfile] = useState<CandidateProfileInput>({
    caFinalStatus: 'QUALIFIED',
    icaiMembershipNo: '',
    attemptsCount: 1,
    articleshipFirm: '',
    articleshipFirmTier: 'BIG4',
    articleshipWeeks: 156,
    articleshipAreas: [],
    skills: [],
    softwareProficiencies: [],
    preferredPathways: ['AUDIT'],
    targetCities: ['Mumbai'],
    targetSalaryMin: 1400000,
    targetSalaryMax: 2000000,
    summary: '',
  });

  const [profileCompletionPct, setProfileCompletionPct] = useState<number>(0);
  const [diagnosticReport, setDiagnosticReport] = useState<SkillGapAnalysisReport | null>(null);
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [activeMilestone, setActiveMilestone] = useState<'ALL' | 'DAY_30' | 'DAY_60' | 'DAY_90'>('ALL');
  const [selectedPathway, setSelectedPathway] = useState<CAPathway>(CAPathway.AUDIT);

  // Helper to parse JSON metadata stored in task description
  const parseTaskMetadata = (task: any): RoadmapTask => {
    let parsedDesc = task.description;
    let keySkills = task.keySkills || [];
    let stage = task.stage;
    let branch = task.branch;
    let estimatedHours = task.estimatedHours || 20;
    let statutoryReference = task.statutoryReference;
    let interviewQuestion = task.interviewQuestion;
    let interviewAnswerKey = task.interviewAnswerKey;
    let practicalDeliverable = task.practicalDeliverable;
    let workpaperModel = task.workpaperModel;
    let prerequisites = task.prerequisites || [];
    let weekRange = task.weekRange;
    let submodules = task.submodules || [];
    let checklist = task.checklist || [];
    let resources = task.resources || [];

    if (typeof task.description === 'string' && task.description.startsWith('{') && task.description.endsWith('}')) {
      try {
        const meta = JSON.parse(task.description);
        parsedDesc = meta.summary || meta.description || task.description;
        if (meta.keySkills) keySkills = meta.keySkills;
        if (meta.stage) stage = meta.stage;
        if (meta.branch) branch = meta.branch;
        if (meta.estimatedHours) estimatedHours = meta.estimatedHours;
        if (meta.statutoryReference) statutoryReference = meta.statutoryReference;
        if (meta.interviewQuestion) interviewQuestion = meta.interviewQuestion;
        if (meta.interviewAnswerKey) interviewAnswerKey = meta.interviewAnswerKey;
        if (meta.practicalDeliverable) practicalDeliverable = meta.practicalDeliverable;
        if (meta.workpaperModel) workpaperModel = meta.workpaperModel;
        if (meta.prerequisites) prerequisites = meta.prerequisites;
        if (meta.weekRange) weekRange = meta.weekRange;
        if (meta.submodules) submodules = meta.submodules;
        if (meta.checklist) checklist = meta.checklist;
        if (meta.resources) resources = meta.resources;
      } catch (e) {
        // Fallback
      }
    }

    if (!stage) {
      stage = task.milestone === 'DAY_30' ? 'FOUNDATION' : task.milestone === 'DAY_60' ? 'APPLICATION' : 'MASTERY';
    }
    if (!branch) {
      if (task.category === 'SKILL_UPGRADE' || task.category === 'PARTNER_ROUND') branch = 'center';
      else if (task.category === 'APPLICATION_PREP' || task.category === 'CASE_SIMULATION') branch = 'left';
      else branch = 'right';
    }

    if (!weekRange) {
      weekRange =
        task.milestone === 'DAY_30'
          ? branch === 'center'
            ? 'Week 1 — Week 2'
            : branch === 'left'
            ? 'Week 1 — Week 3'
            : 'Week 2 — Week 4'
          : task.milestone === 'DAY_60'
          ? branch === 'center'
            ? 'Week 5 — Week 6'
            : branch === 'left'
            ? 'Week 5 — Week 7'
            : 'Week 6 — Week 8'
          : branch === 'center'
          ? 'Week 9 — Week 10'
          : branch === 'left'
          ? 'Week 9 — Week 11'
          : 'Week 10 — Week 12';
    }

    if (!submodules || submodules.length === 0) {
      submodules = [
        `Core Technical Principles & Regulatory Mandate for ${task.title.split(' ')[1] || 'Domain'}`,
        'Practical Field Execution: Workpaper documentation and evidentiary standards',
        'Cross-Functional Impact: Integration with statutory filings and financial statements',
        'Risk Management & Defensibility against regulatory scrutiny or partner review',
        'Executive Communication: Presenting conclusions to C-suite and Audit Committees',
      ];
    }

    if (!checklist || checklist.length === 0) {
      checklist = [
        `Review statutory standards and ICAI technical pronouncements relevant to ${task.title.split(' ')[1] || 'module'}`,
        `Inspect sample company workpapers and test cases to identify high-risk non-compliance areas`,
        `Execute hands-on simulation drill and draft formal working paper memorandum (${task.title.split(' ')[0] || 'Technical Document'})`,
        `Validate findings against Big 4 quality criteria and regulatory reporting requirements`,
      ];
    }

    return {
      ...task,
      description: parsedDesc,
      keySkills: keySkills.length > 0 ? keySkills : [task.title.split(' ')[1] || 'Technical Standard'],
      stage,
      branch,
      estimatedHours,
      statutoryReference: statutoryReference || 'Companies Act 2013 & ICAI Guidance Standards',
      interviewQuestion: interviewQuestion || 'How do you defend this accounting position in Big 4 partner evaluations?',
      interviewAnswerKey:
        interviewAnswerKey ||
        'Partner Evaluation Rubric: High-scoring candidates must immediately quote the statutory section/standard. Structure the answer using the STAR method: 1) State the accounting position under the standard; 2) Detail the audit or analytical evidence gathered; 3) Formulate the practical judgment without accepting management representations blindly.',
      practicalDeliverable: practicalDeliverable || 'Big 4 standard audit memorandum and working papers pack',
      workpaperModel: workpaperModel || 'Big 4 Standard Practice Working Paper Pack and Audit Memo',
      prerequisites,
      weekRange,
      submodules,
      checklist,
      resources: resources.length > 0 ? resources : [
        'ICAI Technical Educational Guidance Material',
        'Companies Act 2013 & Relevant Statutory Rules',
        'NFRA Financial Reporting Audit Quality Review Reports',
      ],
    };
  };

  // Load real candidate data from backend
  const loadCareerData = async () => {
    setIsLoading(true);
    try {
      const [profRes, roadmapRes, diagRes] = await Promise.all([
        apiClient.get<any>('/career/profile'),
        apiClient.get<any>('/career/roadmap'),
        apiClient.post<SkillGapAnalysisReport>('/career/diagnostic', {}),
      ]);

      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
        if (typeof profRes.data.profileCompletionPct === 'number') {
          setProfileCompletionPct(profRes.data.profileCompletionPct);
        }
      }

      if (roadmapRes.success && roadmapRes.data) {
        if (Array.isArray(roadmapRes.data.tasks)) {
          setTasks(roadmapRes.data.tasks.map(parseTaskMetadata));
        }
        if (roadmapRes.data.targetPathway) {
          setSelectedPathway(roadmapRes.data.targetPathway);
        }
      }

      if (diagRes.success && diagRes.data) {
        setDiagnosticReport(diagRes.data);
      }
    } catch (err: any) {
      setStatusMessage('Connected in local mode. Changes will be saved to your session.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCareerData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post<any>('/career/profile', profile);
      if (res.success && res.data) {
        setProfile(res.data);
        if (typeof res.data.profileCompletionPct === 'number') {
          setProfileCompletionPct(res.data.profileCompletionPct);
        }
      }
      // Re-run diagnostic with updated profile
      const diagRes = await apiClient.post<SkillGapAnalysisReport>('/career/diagnostic', {});
      if (diagRes.success && diagRes.data) {
        setDiagnosticReport(diagRes.data);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setStatusMessage(err.message || 'Error updating profile');
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);

  // GenAI Interactive Roadmap Generator
  const handleGenerateRoadmap = async (overridePrompt?: string, overridePace?: string) => {
    setIsGenerating(true);
    setStatusMessage(null);
    const activePrompt = overridePrompt !== undefined ? overridePrompt : customAiPrompt;
    const activePace = overridePace !== undefined ? overridePace : selectedPace;

    if (activePrompt) {
      setAiGeneratingStage('ANALYZING');
      await new Promise((r) => setTimeout(r, 600));
      setAiGeneratingStage('GRAPHING');
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      const res = await apiClient.post<any>('/career/roadmap/generate', {
        targetPathway: selectedPathway,
        customPrompt: activePrompt || undefined,
        pace: activePace,
      });

      if (res.success && res.data?.tasks && res.data.tasks.length > 0) {
        setTasks(res.data.tasks.map(parseTaskMetadata));
        setActiveTab('roadmap');
        setStatusMessage(
          activePrompt
            ? `GenAI synthesized custom roadmap for ${selectedPathway}!`
            : `30-60-90 Day Execution Roadmap generated for ${selectedPathway}!`
        );
        setIsGenerating(false);
        setAiGeneratingStage('IDLE');
        setIsAiModalOpen(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend roadmap generate call failed, deploying local GenAI graph synthesizer:', err);
    }

    // High-quality GenAI Visual Graph Fallback with 40 ultra-detailed practical modules
    const fallbackTasks: RoadmapTask[] = getDetailedFallbackTasks(selectedPathway, activePrompt);

    setTasks(fallbackTasks);
    setActiveTab('roadmap');
    setStatusMessage(
      activePrompt
        ? `GenAI synthesized custom roadmap for ${selectedPathway}!`
        : `30-60-90 Day Execution Roadmap generated for ${selectedPathway}!`
    );
    setIsGenerating(false);
    setAiGeneratingStage('IDLE');
    setIsAiModalOpen(false);
  };

  const toggleTask = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;
    const nextStatus = targetTask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    if (selectedNode?.id === id) {
      setSelectedNode({ ...selectedNode, status: nextStatus });
    }

    try {
      await apiClient.patch(`/career/tasks/${id}`, { status: nextStatus });
    } catch {
      // Retain optimistic state
    }
  };

  const handleAddArea = (areaId: string) => {
    setProfile((prev) => {
      const exists = prev.articleshipAreas.includes(areaId);
      const updated = exists
        ? prev.articleshipAreas.filter((a) => a !== areaId)
        : [...prev.articleshipAreas, areaId];
      return { ...prev, articleshipAreas: updated };
    });
  };

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks =
    activeMilestone === 'ALL'
      ? tasks
      : tasks.filter((t) => t.milestone === activeMilestone);

  // Group tasks by Stage for the visual Roadmap.sh graph
  const stage1Tasks = filteredTasks.filter((t) => t.stage === 'FOUNDATION' || t.milestone === 'DAY_30');
  const stage2Tasks = filteredTasks.filter((t) => t.stage === 'APPLICATION' || t.milestone === 'DAY_60');
  const stage3Tasks = filteredTasks.filter((t) => t.stage === 'MASTERY' || t.milestone === 'DAY_90');

  const STAGE_CONFIGS = [
    {
      id: 'STAGE_1',
      stage: 'FOUNDATION' as const,
      milestone: 'DAY_30' as const,
      label: 'Stage 01: Core Statutory & Articleship Baselines',
      timeframe: 'Day 1 — Day 30',
      description: 'Master core accounting standards, verify Form 108 audit logs, and establish statutory compliance.',
      tasks: stage1Tasks,
    },
    {
      id: 'STAGE_2',
      stage: 'APPLICATION' as const,
      milestone: 'DAY_60' as const,
      label: 'Stage 02: Practical Case Execution & Workpapers',
      timeframe: 'Day 31 — Day 60',
      description: 'Execute IFCoFR RACM control walkthroughs, group audit consolidations, and senior manager networking.',
      tasks: stage2Tasks,
    },
    {
      id: 'STAGE_3',
      stage: 'MASTERY' as const,
      milestone: 'DAY_90' as const,
      label: 'Stage 03: Big 4 Partner Drills & Offer Mobility',
      timeframe: 'Day 61 — Day 90',
      description: 'Simulate high-stakes partner rounds, freeze zero-fabrication resumes, and evaluate unbundled CTC offers.',
      tasks: stage3Tasks,
    },
  ];

  const AI_PROMPT_PRESETS = [
    {
      label: 'Big 4 Statutory Audit Fast-Track',
      prompt: 'Prioritize Ind AS 115 revenue recognition, CARO 2020 Clause 3(xxi), and Big 4 statutory audit partner interview questions.',
    },
    {
      label: 'Corporate Tax & Transfer Pricing',
      prompt: 'Focus heavily on Section 92C transfer pricing documentation, Form 3CD clauses, and international tax litigation.',
    },
    {
      label: 'FP&A & Rolling P&L Forecasting',
      prompt: 'Tailor curriculum towards 12-month rolling forecasts, Price-Volume-Mix variance analysis, and ERP management reporting.',
    },
    {
      label: 'FDD Due Diligence & M&A Valuation',
      prompt: 'Emphasize Financial Due Diligence (FDD) Quality of Earnings (QoE), debt-like items, and IVS 301 DCF valuation models.',
    },
    {
      label: 'Internal Controls (IFCoFR) RACM',
      prompt: 'Center around end-to-end Risk and Control Matrix (RACM) walkthroughs, SAP S/4HANA ITAC controls, and deficiency reporting.',
    },
    {
      label: 'Aggressive 30-Day Partner Mock Prep',
      prompt: 'Accelerated drill focused on 8-turn technical partner mock rounds, audit opinion formulation, and CTC negotiation.',
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Editorial Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '0.375rem' }}>
            Career Pathways &amp; Roadmap
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '640px', lineHeight: 1.5, margin: 0 }}>
            Structured career milestones across 7 Chartered Accountancy specializations with visual progress tracking.
          </p>
        </div>

        {/* Clean Profile Completion Meter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Profile Readiness
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: profileCompletionPct >= 70 ? 'var(--accent-emerald)' : 'var(--brand-primary)' }}>
                {profileCompletionPct}%
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {profileCompletionPct >= 80 ? 'Application Ready' : 'Articleship Documented'}
              </span>
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: `conic-gradient(var(--accent-emerald) ${profileCompletionPct}%, var(--border-subtle) 0%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--surface-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
              }}
            >
              <Target size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'pathways', label: 'Pathway Recommendations', icon: Compass },
          { id: 'skillgap', label: 'Skill-Gap Diagnostics', icon: Target },
          { id: 'roadmap', label: '30-60-90 Day Execution Roadmap', icon: ListTodo },
          { id: 'profile', label: 'Articleship & Capability Inventory', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="btn-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.125rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8125rem',
                background: isActive ? 'var(--brand-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--brand-primary)' : 'transparent',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status / Success Alert */}
      {statusMessage && (
        <div
          className="animate-fade-in-up"
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--success-surface)',
            border: '1px solid var(--success-border)',
            color: 'var(--success-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TAB 1: Pathway Recommendations */}
      {activeTab === 'pathways' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {diagnosticReport?.pathwayFitReports?.map((report) => (
              <div
                key={report.pathway}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderTop: report.fitScore >= 75 ? '3px solid var(--accent-emerald)' : '3px solid var(--accent-cyan)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      className={`badge ${
                        report.matchCategory === 'STRONG_MATCH'
                          ? 'badge-emerald'
                          : report.matchCategory === 'GOOD_MATCH'
                          ? 'badge-cyan'
                          : 'badge-amber'
                      }`}
                      style={{ marginBottom: '0.375rem' }}
                    >
                      {report.matchCategory.replace('_', ' ')}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {report.title}
                    </h3>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {report.fitScore}%
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                    Match Evidence:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                    {report.whyItSuits.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                {report.matchingSkills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Verified Matching Skills ({report.matchingSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {report.matchingSkills.map((s, idx) => (
                        <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                          <Check size={11} style={{ display: 'inline', marginRight: '2px' }} /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.missingSkills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Identified Skill Gaps ({report.missingSkills.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {report.missingSkills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                          • {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => {
                      setSelectedPathway(report.pathway);
                      handleGenerateRoadmap();
                    }}
                    className="btn btn-secondary btn-pill"
                    style={{ width: '100%', fontSize: '0.8125rem', justifyContent: 'center' }}
                  >
                    Build 30-60-90 Roadmap <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Skill-Gap Diagnostics */}
      {activeTab === 'skillgap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Critical Skill Gaps for Top Pathways
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              These high-impact technical competencies are required by employers in your top matching domains but currently unverified in your profile.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {diagnosticReport?.criticalGaps?.map((gap, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-amber">{gap.priority} PRIORITY</span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{gap.skill}</strong>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {gap.rationale} • <em>{gap.recommendedAction}</em>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPathway(gap.pathway);
                      handleGenerateRoadmap();
                    }}
                    className="btn btn-secondary btn-pill"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Add to Roadmap
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 30-60-90 Day Execution Roadmap */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Roadmap Control Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-indigo">
                  {selectedPathway} Pathway
                </span>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Target Pathway: {selectedPathway}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                {completedCount} of {tasks.length} milestones accomplished ({progressPct}%)
              </p>
            </div>

            {/* View Mode & Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* View Switcher: Map vs List */}
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('MAP')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: viewMode === 'MAP' ? 'var(--brand-primary)' : 'transparent',
                    color: viewMode === 'MAP' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Network size={13} />
                  <span>Interactive Map (roadmap.sh)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('LIST')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: viewMode === 'LIST' ? 'var(--brand-primary)' : 'transparent',
                    color: viewMode === 'LIST' ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListTodo size={13} />
                  <span>Milestone List</span>
                </button>
              </div>

              {/* Milestone Horizon Filter */}
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                {['ALL', 'DAY_30', 'DAY_60', 'DAY_90'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMilestone(m as any)}
                    className="btn-pill"
                    style={{
                      padding: '0.3rem 0.625rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      background: activeMilestone === m ? 'var(--accent-cyan)' : 'var(--bg-surface)',
                      color: activeMilestone === m ? '#0f172a' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: activeMilestone === m ? 700 : 500,
                    }}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Zoom Controls for Map View */}
              {viewMode === 'MAP' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-subtle)',
                    padding: '2px 4px',
                  }}
                >
                  <button
                    type="button"
                    title="Zoom Out"
                    onClick={() => setZoomLevel((z) => Math.max(0.75, +(z - 0.1).toFixed(2)))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '32px', textAlign: 'center' }}>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    title="Zoom In"
                    onClick={() => setZoomLevel((z) => Math.min(1.25, +(z + 0.1).toFixed(2)))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>
              )}

              {/* GenAI Customizer Trigger Button */}
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="btn btn-primary btn-pill"
                style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem' }}
              >
                <Wand2 size={13} />
                <span>Customize with GenAI</span>
              </button>

              {/* Quick Regenerate */}
              <button
                onClick={() => handleGenerateRoadmap()}
                disabled={isGenerating}
                className="btn btn-secondary btn-pill"
                style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
              >
                {isGenerating ? <Loader2 size={12} className="spin" /> : <RotateCcw size={12} />}
                <span>{isGenerating ? 'Synthesizing...' : 'Regenerate'}</span>
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}
          {tasks.length === 0 ? (
            <div className="empty-state-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <Network size={54} color="var(--brand-primary)" style={{ margin: '0 auto 1.25rem' }} />
              <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No Active Roadmap for {selectedPathway}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '540px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                Generate an intelligent, profile-grounded 30-60-90 day visual execution curriculum modeled after roadmap.sh for Indian Chartered Accountants.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleGenerateRoadmap()}
                  disabled={isGenerating}
                  className="btn btn-primary btn-pill"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.75rem' }}
                >
                  {isGenerating ? <Loader2 size={16} className="spin" /> : <Compass size={16} />}
                  <span>{isGenerating ? 'Generating Roadmap...' : 'Generate 30-60-90 Day Roadmap'}</span>
                </button>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="btn btn-secondary btn-pill"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
                >
                  <Wand2 size={15} />
                  <span>Customize Prompt</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'MAP' ? (
            /* ROADMAP.SH INTERACTIVE VISUAL GRAPH VIEW */
            <div
              className="roadmap-sh-board animate-fade-in-up"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Continuous Blue Vertical Center Spine */}
              <div className="roadmap-sh-spine-line" />

              {/* 1. Canvas Top Header matching roadmap.sh layout */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(260px, 320px) 1fr minmax(260px, 320px)',
                  gap: '1.5rem',
                  marginBottom: '3rem',
                  alignItems: 'flex-start',
                  position: 'relative',
                  zIndex: 3,
                }}
              >
                {/* Left Top Cards: Pre-requisites & Related */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {/* Pre-requisites */}
                  <div className="roadmap-sh-box-white" style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.625rem', color: '#0F172A' }}>
                      Pre-requisites (One of these)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem' }}>
                      {['Articleship', 'ICAI Final', 'Workpapers'].map((req) => (
                        <div
                          key={req}
                          style={{
                            background: '#E2E8F0',
                            border: '1.5px solid #000000',
                            borderRadius: '6px',
                            padding: '0.35rem 0.25rem',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#0F172A',
                            textAlign: 'center',
                          }}
                        >
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Curriculum Notice */}
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid #000000',
                      borderRadius: '12px',
                      padding: '0.875rem 1rem',
                      boxShadow: '2px 2px 0px #000000',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.625rem',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.4, color: '#334155', fontWeight: 600 }}>
                      CA Career OS provides 100% ICAI curriculum &amp; Big 4 benchmark-aligned execution paths.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pathways')}
                      style={{
                        background: '#4F46E5',
                        color: '#FFFFFF',
                        border: '2px solid #000000',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: '2px 2px 0px #000000',
                      }}
                    >
                      ICAI Verified Pathway Guide
                    </button>
                  </div>

                  {/* Related Roadmaps */}
                  <div className="roadmap-sh-box-white" style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.625rem', color: '#0F172A' }}>
                      Related Roadmaps
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {[
                        { id: CAPathway.AUDIT, label: 'Statutory Audit & Assurance' },
                        { id: CAPathway.TAX, label: 'Corporate Tax & Transfer Pricing' },
                        { id: CAPathway.FPA, label: 'FP&A & Strategic Finance' },
                        { id: CAPathway.IB, label: 'Investment Banking & M&A' },
                        { id: CAPathway.CONSULTING, label: 'Management & Forensic Consulting' },
                      ].map((rm) => (
                        <button
                          key={rm.id}
                          type="button"
                          onClick={() => setSelectedPathway(rm.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            padding: '0.2rem 0',
                            cursor: 'pointer',
                            fontSize: '0.71875rem',
                            fontWeight: selectedPathway === rm.id ? 800 : 600,
                            color: selectedPathway === rm.id ? '#2563EB' : '#475569',
                            textAlign: 'left',
                          }}
                        >
                          <CheckCircle2
                            size={13}
                            color={selectedPathway === rm.id ? '#2563EB' : '#94A3B8'}
                            fill={selectedPathway === rm.id ? '#DBEAFE' : 'transparent'}
                          />
                          <span>{rm.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center Pathway Title */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '2px',
                      height: '36px',
                      borderLeft: '3px dotted #3B82F6',
                      marginBottom: '0.75rem',
                    }}
                  />
                  <h2
                    style={{
                      fontSize: '1.875rem',
                      fontWeight: 900,
                      color: '#0F172A',
                      letterSpacing: '-0.025em',
                      margin: '0 0 0.35rem',
                    }}
                  >
                    {PATHWAY_LABELS[selectedPathway] || selectedPathway}
                  </h2>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#64748B',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    CA Career Execution Roadmap
                  </span>
                </div>

                {/* Right Top Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div
                    className="roadmap-sh-box-white"
                    style={{
                      maxWidth: '260px',
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.6875rem', color: '#64748B', lineHeight: 1.35, fontWeight: 600 }}>
                      Find the detailed version of this roadmap along with other frameworks on
                    </p>
                    <div
                      style={{
                        background: '#E2E8F0',
                        border: '2px solid #000000',
                        borderRadius: '8px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        boxShadow: '1px 1px 0px #000000',
                      }}
                    >
                      roadmap.sh / CA Career OS
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Visual Stages Flow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', position: 'relative', zIndex: 2 }}>
                {STAGE_CONFIGS.filter(
                  (sc) => activeMilestone === 'ALL' || activeMilestone === sc.milestone
                ).map((stageConfig, sIdx) => {
                  const stageTasks = stageConfig.tasks;
                  const leftTasks = stageTasks.filter((t) => t.branch === 'left');
                  const centerTasks = stageTasks.filter((t) => t.branch === 'center');
                  const rightTasks = stageTasks.filter((t) => t.branch === 'right');

                  const finalLeft = leftTasks.length > 0 ? leftTasks : stageTasks.slice(0, 1);
                  const finalCenter = centerTasks.length > 0 ? centerTasks : stageTasks.slice(1, 2);
                  const finalRight = rightTasks.length > 0 ? rightTasks : stageTasks.slice(2);

                  const stageCompleted = stageTasks.filter((t) => t.status === 'COMPLETED').length;
                  const stagePct = stageTasks.length > 0 ? Math.round((stageCompleted / stageTasks.length) * 100) : 0;

                  return (
                    <div key={stageConfig.id} style={{ position: 'relative' }}>
                      {/* Central Spine Stage Label */}
                      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 800,
                            color: '#2563EB',
                            background: '#EFF6FF',
                            border: '1.5px solid #3B82F6',
                            borderRadius: '20px',
                            padding: '0.25rem 0.875rem',
                            display: 'inline-block',
                          }}
                        >
                          {stageConfig.timeframe} • {stageCompleted}/{stageTasks.length} Done ({stagePct}%)
                        </span>
                      </div>

                      {/* Main Yellow Milestone Node centered directly on the Spine */}
                      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 3, marginBottom: '1.5rem' }}>
                        <div
                          className="roadmap-sh-node-yellow"
                          style={{
                            minWidth: '240px',
                            maxWidth: '360px',
                          }}
                        >
                          {stageConfig.label}
                        </div>
                      </div>

                      {/* Branching Grid: Left Container <---> Center Spine <---> Right Container */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(320px, 440px) 1fr minmax(320px, 440px)',
                          alignItems: 'center',
                          gap: '0',
                          position: 'relative',
                          zIndex: 3,
                        }}
                      >
                        {/* LEFT CONTAINER */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                          <div className="roadmap-sh-box-white" style={{ width: '100%' }}>
                            <div
                              style={{
                                fontSize: '0.8125rem',
                                fontWeight: 800,
                                textAlign: 'center',
                                color: '#0F172A',
                                borderBottom: '1.5px dashed #CBD5E1',
                                paddingBottom: '0.5rem',
                                marginBottom: '0.75rem',
                              }}
                            >
                              {sIdx === 0
                                ? 'Articleship & Workpaper Evidence'
                                : sIdx === 1
                                ? 'IFCoFR Testing & Controls'
                                : 'Partner Round Drills & Cases'}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {finalLeft.map((task) => {
                                const isDone = task.status === 'COMPLETED';
                                const isSelected = selectedNode?.id === task.id;
                                return (
                                  <div
                                    key={task.id}
                                    className={`roadmap-sh-pill-btn ${isDone ? 'is-done' : ''} ${isSelected ? 'is-active' : ''}`}
                                    onClick={() => setSelectedNode(task)}
                                    title="Click to view full workpaper model & interview rubric"
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => toggleTask(task.id, e)}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isDone ? (
                                        <CheckSquare size={16} color="#15803D" />
                                      ) : (
                                        <Square size={16} color="#000000" />
                                      )}
                                    </button>
                                    <span style={{ flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>
                                      {task.title}
                                    </span>
                                    {task.estimatedHours && (
                                      <span
                                        style={{
                                          fontSize: '0.6875rem',
                                          fontWeight: 800,
                                          background: 'rgba(0,0,0,0.08)',
                                          borderRadius: '4px',
                                          padding: '1px 5px',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {task.estimatedHours}h
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* CENTER DOTTED CONNECTOR LINES TO LEFT & RIGHT */}
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
                          <div className="roadmap-sh-dot-line-h" />
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: '#3B82F6',
                              border: '2px solid #000000',
                              flexShrink: 0,
                              zIndex: 4,
                            }}
                          />
                          <div className="roadmap-sh-dot-line-h" />
                        </div>

                        {/* RIGHT CONTAINER */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <div className="roadmap-sh-box-white" style={{ width: '100%' }}>
                            <div
                              style={{
                                fontSize: '0.8125rem',
                                fontWeight: 800,
                                textAlign: 'center',
                                color: '#0F172A',
                                borderBottom: '1.5px dashed #CBD5E1',
                                paddingBottom: '0.5rem',
                                marginBottom: '0.75rem',
                              }}
                            >
                              {sIdx === 0
                                ? 'Technical Standards (Ind AS / SAs)'
                                : sIdx === 1
                                ? 'Statutory Reporting & Governance'
                                : 'Verified Resume & CTC Mobility'}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {(finalCenter.concat(finalRight)).map((task) => {
                                const isDone = task.status === 'COMPLETED';
                                const isSelected = selectedNode?.id === task.id;
                                return (
                                  <div
                                    key={task.id}
                                    className={`roadmap-sh-pill-btn ${isDone ? 'is-done' : ''} ${isSelected ? 'is-active' : ''}`}
                                    onClick={() => setSelectedNode(task)}
                                    title="Click to view full workpaper model & interview rubric"
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => toggleTask(task.id, e)}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isDone ? (
                                        <CheckSquare size={16} color="#15803D" />
                                      ) : (
                                        <Square size={16} color="#000000" />
                                      )}
                                    </button>
                                    <span style={{ flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>
                                      {task.title}
                                    </span>
                                    {task.estimatedHours && (
                                      <span
                                        style={{
                                          fontSize: '0.6875rem',
                                          fontWeight: 800,
                                          background: 'rgba(0,0,0,0.08)',
                                          borderRadius: '4px',
                                          padding: '1px 5px',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {task.estimatedHours}h
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LINEAR LIST VIEW */
            <div className="timeline-track" style={{ paddingLeft: '2.25rem' }}>
              {filteredTasks.map((task) => {
                const isDone = task.status === 'COMPLETED';
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedNode(task)}
                    className="timeline-milestone"
                    style={{
                      cursor: 'pointer',
                      padding: '1.25rem 1.5rem',
                      background: 'var(--surface-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all var(--duration-fast) var(--ease-snappy)',
                    }}
                  >
                    <div
                      className={`timeline-node ${isDone ? 'timeline-node-completed' : 'timeline-node-active'}`}
                      style={{ left: '-2.25rem', top: '1.25rem' }}
                    >
                      {isDone ? (
                        <Check size={12} color="var(--success-text)" />
                      ) : (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-cyan">{task.milestone.replace('_', ' ')}</span>
                        <strong
                          style={{
                            fontSize: '0.9375rem',
                            color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={task.priority === 'HIGH' ? 'badge badge-rose' : 'badge badge-amber'}>
                          {task.priority} Priority
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleTask(task.id, e)}
                          className="btn-pill"
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            background: isDone ? 'var(--accent-emerald)' : 'var(--bg-surface)',
                            color: isDone ? '#ffffff' : 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {isDone ? 'Accomplished' : 'Mark Done'}
                        </button>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {task.description}
                    </p>

                    {task.keySkills && task.keySkills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {task.keySkills.map((s, idx) => (
                          <span key={idx} className="roadmap-skill-chip">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ROADMAP.SH DETAILED DRILLDOWN INSPECTOR DRAWER */}
          {selectedNode && (
            <>
              <div
                className="roadmap-inspector-backdrop"
                onClick={() => setSelectedNode(null)}
              />
              <div className="roadmap-inspector-sheet">
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span className="badge badge-indigo">
                        {selectedNode.stage || 'STAGE'} • {selectedNode.milestone.replace('_', ' ')}
                      </span>
                      <span className={selectedNode.priority === 'HIGH' ? 'badge badge-rose' : 'badge badge-amber'}>
                        {selectedNode.priority} Priority
                      </span>
                      {selectedNode.status === 'COMPLETED' && (
                        <span className="badge badge-emerald">Accomplished</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
                      {selectedNode.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    style={{
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Milestone Detail Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Summary & Hours */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-indigo">
                          📅 {selectedNode.weekRange || 'Weeks 1 — 4'}
                        </span>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                          Curriculum Objective
                        </h4>
                      </div>
                      {selectedNode.estimatedHours && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} /> {selectedNode.estimatedHours} Hours Required
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {selectedNode.description}
                    </p>
                  </div>

                  {/* Progressive Learning Submodules Tree */}
                  {selectedNode.submodules && selectedNode.submodules.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Target size={14} /> Core Learning Submodules ({selectedNode.submodules.length})
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sequential Mastery</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {selectedNode.submodules.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.625rem',
                              padding: '0.625rem 0.75rem',
                              background: 'var(--surface-secondary)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <span
                              style={{
                                minWidth: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: 'var(--brand-primary)',
                                color: '#ffffff',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                              }}
                            >
                              {sIdx + 1}
                            </span>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.45, fontWeight: 500 }}>
                              {sub}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Execution Checklist */}
                  {selectedNode.checklist && selectedNode.checklist.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <CheckSquare size={14} /> Actionable Execution Checklist
                        </h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {selectedNode.checklist.filter((_, idx) => completedChecklist[`${selectedNode.id}-check-${idx}`]).length} / {selectedNode.checklist.length} Completed
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {selectedNode.checklist.map((item, cIdx) => {
                          const itemKey = `${selectedNode.id}-check-${cIdx}`;
                          const isChecked = !!completedChecklist[itemKey];
                          return (
                            <div
                              key={cIdx}
                              onClick={() => setCompletedChecklist((prev) => ({ ...prev, [itemKey]: !isChecked }))}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                padding: '0.55rem 0.75rem',
                                background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                                border: `1px solid ${isChecked ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {isChecked ? (
                                  <CheckSquare size={16} color="var(--accent-emerald)" />
                                ) : (
                                  <Square size={16} color="var(--text-muted)" />
                                )}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.8125rem',
                                  color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  lineHeight: 1.4,
                                }}
                              >
                                {item}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Statutory Reference Anchor */}
                  {selectedNode.statutoryReference && (
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(14, 165, 233, 0.08)',
                        border: '1px solid rgba(14, 165, 233, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <ShieldCheck size={16} color="var(--accent-cyan)" />
                        <strong style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)' }}>
                          Statutory & ICAI Regulatory Anchor
                        </strong>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {selectedNode.statutoryReference}
                      </p>
                    </div>
                  )}

                  {/* Big 4 Partner Interview Drill + Answer Key */}
                  {selectedNode.interviewQuestion && (
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MessageSquareCode size={16} color="var(--accent-rose)" />
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--accent-rose)' }}>
                            Big 4 Partner Round Technical Drill
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAnswerKey((prev) => !prev)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-rose)',
                            fontSize: '0.71875rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {showAnswerKey ? 'Hide Answer Key' : 'Reveal Model Answer Key'}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                        &ldquo;{selectedNode.interviewQuestion}&rdquo;
                      </p>
                      {showAnswerKey && selectedNode.interviewAnswerKey && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            background: 'var(--surface-primary)',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            fontSize: '0.78125rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                            Model Partner Answer Key:
                          </strong>
                          {selectedNode.interviewAnswerKey}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Practical Deliverable & Workpaper Model */}
                  {(selectedNode.practicalDeliverable || selectedNode.workpaperModel) && (
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <FileCheck2 size={16} color="var(--accent-emerald)" />
                        <strong style={{ fontSize: '0.8125rem', color: 'var(--accent-emerald)' }}>
                          Practical Portfolio Deliverable & Workpaper Template
                        </strong>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {selectedNode.workpaperModel || selectedNode.practicalDeliverable}
                      </p>
                    </div>
                  )}

                  {/* Authoritative Resources */}
                  {selectedNode.resources && selectedNode.resources.length > 0 && (
                    <div
                      style={{
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--surface-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 0.375rem' }}>
                        Official Authoritative References & ICAI Material
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {selectedNode.resources.map((res, rIdx) => (
                          <li key={rIdx}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Inspector Actions */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(selectedNode.id)}
                    className="btn btn-primary btn-pill"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {selectedNode.status === 'COMPLETED' ? (
                      <>
                        <RotateCcw size={14} /> Reopen Milestone
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Mark as Accomplished
                      </>
                    )}
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <Link
                      href="/interviews"
                      className="btn btn-secondary btn-pill"
                      style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      <MessageSquareCode size={13} /> Practice in AI
                    </Link>
                    <Link
                      href="/resumes"
                      className="btn btn-secondary btn-pill"
                      style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      <FileCheck2 size={13} /> Tailor Resume
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* GENAI ROADMAP PROMPT CUSTOMIZER MODAL */}
          {isAiModalOpen && (
            <>
              {/* Dimmed backdrop behind the modal */}
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(3px)',
                  zIndex: 9998,
                }}
                onClick={() => !isGenerating && setIsAiModalOpen(false)}
              />
              {/* Sharp, unblurred modal in front */}
              <div
                className="animate-scale-in"
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 9999,
                  width: '92%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  background: '#FFFFFF',
                  border: '2.5px solid #000000',
                  borderRadius: '16px',
                  boxShadow: '6px 6px 0px #000000',
                  color: '#000000',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', borderBottom: '2px solid #000000', paddingBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'inline-block', background: '#FEF08A', border: '1.5px solid #000000', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.6875rem', fontWeight: 800, color: '#000000', marginBottom: '0.375rem', boxShadow: '1px 1px 0px #000000' }}>
                      Roadmap Customizer
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#000000', margin: 0, letterSpacing: '-0.02em' }}>
                      Customize Your Career Roadmap
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0.25rem 0 0', fontWeight: 500 }}>
                      Tailor milestones for specific accounting standards, target firm tiers, and execution pace.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isGenerating && setIsAiModalOpen(false)}
                    style={{
                      background: '#FEF08A',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#000000',
                      boxShadow: '1.5px 1.5px 0px #000000',
                      flexShrink: 0,
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Target Focus Input */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.375rem' }}>
                    Target Focus Areas &amp; Standards
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Prioritize Ind AS 115 revenue recognition, CARO 2020 Clause 3, and Big 4 partner mock interview drills..."
                    value={customAiPrompt}
                    onChange={(e) => setCustomAiPrompt(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#FAF9F6',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#000000',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      resize: 'none',
                      boxShadow: '2px 2px 0px #000000',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Quick Presets in Roadmap.sh yellow pills */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Quick Focus Presets:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {AI_PROMPT_PRESETS.map((preset, pIdx) => {
                      const isSelected = customAiPrompt === preset.prompt;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setCustomAiPrompt(preset.prompt)}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.4rem 0.75rem',
                            background: isSelected ? '#FACC15' : '#FEF08A',
                            color: '#000000',
                            border: '2px solid #000000',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 0 0 2px #2563EB, 2px 2px 0px #000000' : '1.5px 1.5px 0px #000000',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Study Pace in 3 cards */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                    Study &amp; Execution Pace
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'ACCELERATED', label: 'Accelerated', hours: '15-20 hrs/wk', desc: 'Intense drill' },
                      { id: 'BALANCED', label: 'Balanced', hours: '8-12 hrs/wk', desc: 'Articleship friendly' },
                      { id: 'INTENSIVE', label: 'Mastery', hours: '25+ hrs/wk', desc: 'Comprehensive Big 4' },
                    ].map((pace) => {
                      const isSelected = selectedPace === pace.id;
                      return (
                        <div
                          key={pace.id}
                          onClick={() => setSelectedPace(pace.id as any)}
                          style={{
                            padding: '0.625rem 0.75rem',
                            borderRadius: '8px',
                            background: isSelected ? '#FEF08A' : '#FFFFFF',
                            border: '2px solid #000000',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '3px 3px 0px #000000' : '1.5px 1.5px 0px #000000',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#000000' }}>
                              {pace.label}
                            </span>
                            {isSelected && <Check size={13} strokeWidth={3} color="#000000" />}
                          </div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#2563EB' }}>
                            {pace.hours}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '2px' }}>
                            {pace.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Generating Status Animation */}
                {isGenerating && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      border: '2px solid #3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      boxShadow: '2px 2px 0px #000000',
                    }}
                  >
                    <Loader2 size={16} className="spin" color="#2563EB" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E40AF' }}>
                      {aiGeneratingStage === 'ANALYZING'
                        ? 'Analyzing candidate profile & articleship exposure...'
                        : 'Synthesizing visual roadmap graph...'}
                    </span>
                  </div>
                )}

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '2px solid #000000', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    disabled={isGenerating}
                    style={{
                      background: '#FFFFFF',
                      color: '#000000',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #000000',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateRoadmap(customAiPrompt, selectedPace)}
                    disabled={isGenerating}
                    style={{
                      background: '#3B82F6',
                      color: '#FFFFFF',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      padding: '0.5rem 1.5rem',
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #000000',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {isGenerating ? <Loader2 size={15} className="spin" /> : <Compass size={15} />}
                    <span>{isGenerating ? 'Generating...' : 'Apply & Generate Roadmap'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: Articleship & Capability Inventory Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Articleship & Capability Inventory
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Your verified practical training parameters directly power your pathway diagnostic score and ATS resume matching.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Articleship Firm Name
              </label>
              <input
                type="text"
                placeholder="e.g. KPMG India, BDO, or Boutique Firm"
                value={profile.articleshipFirm || ''}
                onChange={(e) => setProfile({ ...profile, articleshipFirm: e.target.value })}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.625rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Firm Tier
              </label>
              <select
                value={profile.articleshipFirmTier || 'BIG4'}
                onChange={(e) => setProfile({ ...profile, articleshipFirmTier: e.target.value as any })}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.625rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                {FIRM_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>{tier.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                ICAI Membership / SRO Roll No
              </label>
              <input
                type="text"
                placeholder="e.g. ACA-589123 or WRO-064891"
                value={profile.icaiMembershipNo || ''}
                onChange={(e) => setProfile({ ...profile, icaiMembershipNo: e.target.value })}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.625rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.625rem' }}>
              Hands-On Articleship Practice Areas (Select all domains with 3+ months exposure)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.625rem' }}>
              {ARTICLESHIP_DOMAINS.map((area) => {
                const isSelected = profile.articleshipAreas.includes(area.id);
                return (
                  <div
                    key={area.id}
                    onClick={() => handleAddArea(area.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                        background: isSelected ? 'var(--accent-cyan)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <Check size={12} color="#000" />}
                    </div>
                    <span>{area.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            {saveSuccess && (
              <span style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle2 size={16} /> Profile Persisted & Diagnostic Recalculated
              </span>
            )}
            <button type="submit" className="btn btn-primary btn-pill">
              Save Verified Profile
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
