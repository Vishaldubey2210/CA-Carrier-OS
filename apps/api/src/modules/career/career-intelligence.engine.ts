import {
  CAPathway,
  CandidateProfileData,
  PathwayFitReport,
  SkillGapAnalysisReport,
  CriticalSkillGap,
  CareerRoadmapTaskItem,
} from '@ca-career-os/shared';
import { randomUUID } from 'node:crypto';

export interface PathwayRequirementMatrix {
  pathway: CAPathway;
  title: string;
  primaryDomains: string[];
  requiredSkills: Array<{ name: string; category: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }>;
  typicalRoles: string[];
  learningActivities: string[];
}

export const PATHWAY_REQUIREMENTS: Record<CAPathway, PathwayRequirementMatrix> = {
  [CAPathway.AUDIT]: {
    pathway: CAPathway.AUDIT,
    title: 'Statutory Audit & Assurance',
    primaryDomains: ['STATUTORY_AUDIT', 'INTERNAL_AUDIT', 'IFC_TESTING', 'CARO_2020'],
    requiredSkills: [
      { name: 'Ind AS / IFRS Standards', category: 'Accounting Standards', priority: 'HIGH' },
      { name: 'Standards on Auditing (SAs)', category: 'Auditing', priority: 'HIGH' },
      { name: 'Internal Financial Controls (IFC)', category: 'Risk & Controls', priority: 'HIGH' },
      { name: 'CARO 2020 Reporting', category: 'Compliance', priority: 'MEDIUM' },
      { name: 'Audit Sampling & Workpaper Prep', category: 'Auditing', priority: 'MEDIUM' },
    ],
    typicalRoles: [
      'Senior Associate — Statutory Audit (Big 4 / Top 10)',
      'Assurance Senior — Listed Engagements',
      'Quality & Risk Assurance Specialist',
    ],
    learningActivities: [
      'Practice ICAI Ind AS 115 & 116 Disclosure Checklist walkthrough',
      'Draft a comprehensive CARO 2020 checklist with test of details',
    ],
  },
  [CAPathway.TAX]: {
    pathway: CAPathway.TAX,
    title: 'Direct & International Tax',
    primaryDomains: ['DIRECT_TAX', 'CORPORATE_TAX', 'TRANSFER_PRICING', 'TAX_AUDIT'],
    requiredSkills: [
      { name: 'Corporate Tax Assessment & Filing', category: 'Direct Tax', priority: 'HIGH' },
      { name: 'Transfer Pricing (Form 3CEB)', category: 'International Tax', priority: 'HIGH' },
      { name: 'Tax Audit (Form 3CD)', category: 'Direct Tax', priority: 'HIGH' },
      { name: 'DTAA & BEPS Pillar 2 Framework', category: 'International Tax', priority: 'MEDIUM' },
      { name: 'Litigation & CIT(A) Representation', category: 'Dispute Resolution', priority: 'MEDIUM' },
    ],
    typicalRoles: [
      'Tax Senior — Corporate & International Tax',
      'Transfer Pricing Consultant',
      'Direct Tax Manager — Industry / Big 4',
    ],
    learningActivities: [
      'Complete Form 3CD Clause-by-Clause working papers on manufacturing co.',
      'Prepare Transfer Pricing economic benchmarking study using database tools',
    ],
  },
  [CAPathway.FPA]: {
    pathway: CAPathway.FPA,
    title: 'FP&A & Corporate Financial Planning',
    primaryDomains: ['CORP_FIN_FPA', 'BUDGETING_FORECASTING', 'MIS_REPORTING'],
    requiredSkills: [
      { name: '3-Statement Financial Modeling', category: 'Financial Modeling', priority: 'HIGH' },
      { name: 'Annual Operating Plan (AOP) & Budgeting', category: 'Corporate Finance', priority: 'HIGH' },
      { name: 'Variance Analysis & Cohort Metrics', category: 'Analytics', priority: 'HIGH' },
      { name: 'Advanced Excel & PowerBI Dashboards', category: 'Tools', priority: 'MEDIUM' },
      { name: 'Board MIS & Management Reporting', category: 'Advisory', priority: 'MEDIUM' },
    ],
    typicalRoles: [
      'FP&A Senior Analyst — Tech / FinTech',
      'Finance Business Partner — Enterprise Division',
      'Manager — Strategic Planning & Performance',
    ],
    learningActivities: [
      'Construct a 3-statement integrated dynamic model with scenario analysis',
      'Build an executive PowerBI revenue & gross margin variance dashboard',
    ],
  },
  [CAPathway.CORP_FIN]: {
    pathway: CAPathway.CORP_FIN,
    title: 'Corporate Finance & M&A Due Diligence',
    primaryDomains: ['M_AND_A_VALUATION', 'DUE_DILIGENCE', 'VALUATION'],
    requiredSkills: [
      { name: 'Financial Due Diligence (Quality of Earnings)', category: 'M&A', priority: 'HIGH' },
      { name: 'Discounted Cash Flow (DCF) Valuation', category: 'Valuation', priority: 'HIGH' },
      { name: 'Trading Comps & Transaction Multiples', category: 'Valuation', priority: 'HIGH' },
      { name: 'Debt Syndication & Term Sheet Structuring', category: 'Financing', priority: 'MEDIUM' },
      { name: 'Working Capital Target & Net Debt Adjustments', category: 'M&A', priority: 'MEDIUM' },
    ],
    typicalRoles: [
      'Associate — Transaction Advisory Services (FDD)',
      'M&A Strategy Analyst — Corporate Development',
      'Valuation Associate — Equity & Business Valuation',
    ],
    learningActivities: [
      'Conduct a Quality of Earnings (QoE) adjusted EBITDA exercise on case target',
      'Build a DCF sensitivity matrix with WACC and terminal growth variables',
    ],
  },
  [CAPathway.IB]: {
    pathway: CAPathway.IB,
    title: 'Investment Banking & Capital Markets',
    primaryDomains: ['INVESTMENT_BANKING', 'EQUITY_RESEARCH'],
    requiredSkills: [
      { name: 'Merger Modeling (Accretion/Dilution)', category: 'Investment Banking', priority: 'HIGH' },
      { name: 'LBO (Leveraged Buyout) Modeling', category: 'Financial Modeling', priority: 'HIGH' },
      { name: 'Information Memorandum (IM) Pitchbooks', category: 'Advisory', priority: 'HIGH' },
      { name: 'Capital Structure & IPO Process', category: 'Capital Markets', priority: 'MEDIUM' },
    ],
    typicalRoles: [
      'Investment Banking Analyst — Sector Coverage',
      'Equity Research Associate',
      'Private Equity Junior Associate',
    ],
    learningActivities: [
      'Build an Accretion/Dilution merger model with synergy estimates',
      'Draft a 15-slide institutional pitch deck for Series B debt/equity raise',
    ],
  },
  [CAPathway.CONSULTING]: {
    pathway: CAPathway.CONSULTING,
    title: 'Management Consulting & Risk Advisory',
    primaryDomains: ['MANAGEMENT_CONSULTING', 'RISK_ADVISORY'],
    requiredSkills: [
      { name: 'Enterprise Risk Management (COSO)', category: 'Risk Advisory', priority: 'HIGH' },
      { name: 'Business Process Re-engineering (BPR)', category: 'Operations', priority: 'HIGH' },
      { name: 'SOX 404 & Internal Controls Audit', category: 'Controls', priority: 'HIGH' },
      { name: 'Cost Optimization & Working Capital Strategy', category: 'Advisory', priority: 'MEDIUM' },
    ],
    typicalRoles: [
      'Consultant — Finance Transformation & Strategy',
      'Senior Consultant — Risk & Internal Audit (Big 4)',
      'Internal Audit Lead — Global Shared Services',
    ],
    learningActivities: [
      'Develop an Enterprise Risk Register and risk heat map for retail company',
      'Design Procure-to-Pay (P2P) process flow diagram with control gates',
    ],
  },
  [CAPathway.PRACTICE]: {
    pathway: CAPathway.PRACTICE,
    title: 'Independent Practice & SME Advisory',
    primaryDomains: ['TAX_AUDIT', 'GST_COMPLIANCE', 'ROC_COMPLIANCE', 'ACCOUNTING'],
    requiredSkills: [
      { name: 'ICAI Code of Ethics & COP Compliance', category: 'Regulatory', priority: 'HIGH' },
      { name: 'GST Audit & Annual Return (GSTR-9/9C)', category: 'Indirect Tax', priority: 'HIGH' },
      { name: 'ROC Annual Compliance & Company Law', category: 'Corporate Law', priority: 'HIGH' },
      { name: 'SME Statutory & Bank Concurrent Audits', category: 'Auditing', priority: 'HIGH' },
      { name: 'Client Engagement Letters & UDIN Governance', category: 'Practice Mgmt', priority: 'MEDIUM' },
    ],
    typicalRoles: [
      'Proprietor / Partner — Chartered Accountancy Firm',
      'Statutory & Tax Auditor for Mid-Market Enterprises',
      'Independent Virtual CFO & Tax Advisor',
    ],
    learningActivities: [
      'Review ICAI Certificate of Practice (Form 6) and firm empanelment checklist',
      'Draft standard engagement letter, client KYC vault, and UDIN logbook',
    ],
  },
};

/**
 * Calculate deterministic profile completion percentage
 */
export function calculateProfileCompletion(profile: Partial<CandidateProfileData>): number {
  let score = 0;

  // 1. Personal & CA status (25%)
  if (profile.caFinalStatus) score += 15;
  if (profile.icaiMembershipNo || profile.attemptsCount !== undefined) score += 10;

  // 2. Articleship capability inventory (35%)
  if (profile.articleshipFirm) score += 10;
  if (profile.articleshipFirmTier) score += 10;
  if (profile.articleshipAreas && profile.articleshipAreas.length > 0) {
    score += Math.min(15, profile.articleshipAreas.length * 5);
  }

  // 3. Skills inventory (25%)
  if (profile.skills && profile.skills.length > 0) {
    score += Math.min(25, profile.skills.length * 5);
  }

  // 4. Career Preferences & Target Cities (15%)
  if (profile.targetCities && profile.targetCities.length > 0) score += 8;
  if (profile.preferredPathways && profile.preferredPathways.length > 0) score += 7;

  return Math.min(100, Math.round(score));
}

/**
 * Run deterministic 6+ pathway diagnostic assessment
 */
export function runCareerDiagnostic(profile: CandidateProfileData): SkillGapAnalysisReport {
  const reports: PathwayFitReport[] = [];
  const candidateSkillNames = new Set((profile.skills || []).map((s) => s.name.toLowerCase()));
  const candidateAreas = new Set((profile.articleshipAreas || []).map((a) => a.toUpperCase()));

  for (const pathwayKey of Object.keys(PATHWAY_REQUIREMENTS) as CAPathway[]) {
    const req = PATHWAY_REQUIREMENTS[pathwayKey];
    let score = 40; // baseline for qualified CA
    const whyItSuits: string[] = [];
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    // Articleship domain match (+25%)
    let domainMatches = 0;
    for (const d of req.primaryDomains) {
      if (candidateAreas.has(d.toUpperCase())) {
        domainMatches += 1;
      }
    }
    if (domainMatches > 0) {
      const boost = Math.min(25, domainMatches * 15);
      score += boost;
      whyItSuits.push(`Articleship exposure in ${domainMatches} core domain(s) for ${req.title} (+${boost}%)`);
    }

    // Firm tier bonus (+10% for Big 4 / Top 10)
    if (profile.articleshipFirmTier === 'BIG4' || profile.articleshipFirmTier === 'TOP10') {
      score += 10;
      whyItSuits.push(`Tier-1 Articleship training at ${profile.articleshipFirmTier} firm (+10%)`);
    }

    // Skills match (+25%)
    for (const skillReq of req.requiredSkills) {
      const hasSkill = Array.from(candidateSkillNames).some(
        (cs) => cs.includes(skillReq.name.toLowerCase()) || skillReq.name.toLowerCase().includes(cs)
      );

      if (hasSkill) {
        matchingSkills.push(skillReq.name);
        score += 5;
      } else {
        missingSkills.push(skillReq.name);
      }
    }

    // Candidate stated preference bonus (+10%)
    if (profile.preferredPathways && profile.preferredPathways.includes(pathwayKey)) {
      score += 10;
      whyItSuits.push(`Candidate explicitly declared interest in ${req.title} (+10%)`);
    }

    const finalFitScore = Math.min(98, Math.max(25, Math.round(score)));

    let matchCategory: PathwayFitReport['matchCategory'] = 'POTENTIAL_MATCH';
    if (finalFitScore >= 80) matchCategory = 'STRONG_MATCH';
    else if (finalFitScore >= 65) matchCategory = 'GOOD_MATCH';
    else if (finalFitScore < 50) matchCategory = 'PIVOT_REQUIRED';

    reports.push({
      pathway: pathwayKey,
      title: req.title,
      fitScore: finalFitScore,
      matchCategory,
      whyItSuits: whyItSuits.length > 0 ? whyItSuits : ['Baseline foundation from ICAI chartered accountancy curriculum'],
      matchingSkills,
      missingSkills,
      typicalRoles: req.typicalRoles,
      learningActivities: req.learningActivities,
    });
  }

  // Sort descending by fitScore
  reports.sort((a, b) => b.fitScore - a.fitScore);
  const topRecommended = reports[0]?.pathway || CAPathway.AUDIT;

  // Compile critical gaps for top 2 pathways
  const criticalGaps: CriticalSkillGap[] = [];
  for (const report of reports.slice(0, 2)) {
    const matrix = PATHWAY_REQUIREMENTS[report.pathway];
    for (const missing of report.missingSkills) {
      const spec = matrix.requiredSkills.find((s) => s.name === missing);
      criticalGaps.push({
        skill: missing,
        pathway: report.pathway,
        priority: spec?.priority || 'MEDIUM',
        rationale: `Core requirement for ${report.title} hiring evaluations`,
        recommendedAction: `Complete practical case studies and certification modules in ${missing}`,
      });
    }
  }

  return {
    candidateId: profile.id,
    pathwayFitReports: reports,
    topRecommendedPathway: topRecommended,
    criticalGaps,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate 30-60-90 Day Actionable Roadmap for selected pathway
 */
export function generateRoadmapTasks(
  pathway: CAPathway,
  roadmapId: string,
  missingSkills: string[]
): CareerRoadmapTaskItem[] {
  const req = PATHWAY_REQUIREMENTS[pathway] || PATHWAY_REQUIREMENTS[CAPathway.AUDIT];
  const tasks: CareerRoadmapTaskItem[] = [];

  // Day 30: Foundation & Core Technical Skill Bridging
  tasks.push({
    id: randomUUID(),
    roadmapId,
    milestone: 'DAY_30',
    title: `Master ${req.requiredSkills[0]?.name || 'Core Standards'}`,
    description: `Complete deep-dive review and practical workpaper documentation for ${req.requiredSkills[0]?.name}.`,
    category: 'SKILL_UPGRADE',
    priority: 'HIGH',
    status: 'PENDING',
  });
  tasks.push({
    id: randomUUID(),
    roadmapId,
    milestone: 'DAY_30',
    title: 'Audit & Certify Articleship Diary',
    description: 'Structure articleship client projects, quantifying business impact and regulatory sign-offs.',
    category: 'APPLICATION_PREP',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
  });

  // Day 60: Practical Exercises & Tailored Artifacts
  tasks.push({
    id: randomUUID(),
    roadmapId,
    milestone: 'DAY_60',
    title: `Practical Case Study: ${req.learningActivities[0] || 'Technical Simulation'}`,
    description: req.learningActivities[0] || 'Execute a full technical case study aligned with Big 4 expectations.',
    category: 'SKILL_UPGRADE',
    priority: 'HIGH',
    status: 'PENDING',
  });
  tasks.push({
    id: randomUUID(),
    roadmapId,
    milestone: 'DAY_60',
    title: 'Targeted Professional Networking',
    description: `Connect with 5 Senior Managers and Partners currently hiring for ${req.typicalRoles[0]}.`,
    category: 'NETWORKING',
    priority: 'MEDIUM',
    status: 'PENDING',
  });

  // Day 90: Interview Mastery & Offer Evaluation
  tasks.push({
    id: randomUUID(),
    roadmapId,
    milestone: 'DAY_90',
    title: 'Execute Mock Partner Round Simulation',
    description: 'Participate in structured case interview evaluating technical judgments and situational responses.',
    category: 'APPLICATION_PREP',
    priority: 'HIGH',
    status: 'PENDING',
  });
  tasks.push({
    id: randomUUID(),
    roadmapId,
    milestone: 'DAY_90',
    title: 'Finalize Zero-Fabrication Tailored Resume',
    description: `Lock and export verified resume variant tailored specifically for ${req.title}.`,
    category: 'APPLICATION_PREP',
    priority: 'MEDIUM',
    status: 'PENDING',
  });

  // Add tasks for any missing skills
  missingSkills.slice(0, 2).forEach((skill, index) => {
    tasks.push({
      id: randomUUID(),
      roadmapId,
      milestone: index === 0 ? 'DAY_30' : 'DAY_60',
      title: `Bridge Skill Gap: ${skill}`,
      description: `Targeted study and practical exercises to achieve intermediate competency in ${skill}.`,
      category: 'SKILL_UPGRADE',
      priority: 'HIGH',
      status: 'PENDING',
    });
  });

  return tasks;
}
