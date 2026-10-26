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
 * GenAI Roadmap Synthesizer: Generates deterministic, multi-branch, 30-60-90 day visual graph roadmap
 * matching the visual tree architecture of roadmap.sh for Indian Chartered Accountants.
 */
export interface GenerateRoadmapOptions {
  profile?: CandidateProfileData;
  customPrompt?: string;
  focusAreas?: string[];
  pace?: 'ACCELERATED' | 'BALANCED' | 'INTENSIVE';
}

export function generateRoadmapTasks(
  pathway: CAPathway,
  roadmapId: string,
  missingSkills: string[] = [],
  options?: GenerateRoadmapOptions
): CareerRoadmapTaskItem[] {
  const req = PATHWAY_REQUIREMENTS[pathway] || PATHWAY_REQUIREMENTS[CAPathway.AUDIT];
  const customPrompt = options?.customPrompt?.trim();
  const tasks: CareerRoadmapTaskItem[] = [];

  // Pathway-Specific Curated GenAI Graph Nodes
  const PATHWAY_CURRICULUM: Record<
    CAPathway,
    {
      s1_center: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s1_left: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s1_right: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s2_center: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s2_left: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s2_right: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s3_center: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s3_left: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
      s3_right: { title: string; desc: string; skills: string[]; ref: string; q: string; del: string; hrs: number };
    }
  > = {
    [CAPathway.AUDIT]: {
      s1_center: {
        title: 'Master Ind AS 115 & 116 Financial Reporting',
        desc: 'Deep-dive review of 5-step revenue recognition criteria, contract assets, and ROU lease modifications per Ind AS 116.',
        skills: ['Ind AS 115 Revenue', 'Ind AS 116 Leases', 'Materiality Benchmarks'],
        ref: 'Companies Act 2013 Sec 134(5)(e), SA 315 & SA 330',
        q: 'How do you test variable consideration constraint under Ind AS 115 with return rights?',
        del: 'Technical workpaper memorandum on revenue cut-off and lease discount rate curves.',
        hrs: 24,
      },
      s1_left: {
        title: 'Structure & Audit Certified Form 108 Articleship Log',
        desc: 'Quantify 3-year statutory audit exposure, listed client turnover handled, and internal controls tested under Form 108 regulations.',
        skills: ['Form 108 Exposure', 'Audit Engagement Log', 'ICAI Attestation'],
        ref: 'ICAI Chartered Accountants Regulations 1988 (Reg 46)',
        q: 'What statutory audit procedures did you independently lead during your 3-year articleship?',
        del: 'Attested Articleship Capability Log with quantifiable turnover metrics.',
        hrs: 16,
      },
      s1_right: {
        title: 'CARO 2020 Statutory Reporting Diagnostic',
        desc: 'Exhaustive verification of 21 clauses with special emphasis on Clause 3(i) Title Deeds, 3(ix) Debt Defaults, and 3(xxi) Group Audit Qualifications.',
        skills: ['CARO 2020 Clauses', 'Auditor Adverse Remarks', 'Whistleblower Disclosures'],
        ref: 'Companies (Auditor’s Report) Order 2020',
        q: 'When must an auditor include qualifications in CARO 2020 Clause 3(xxi) for group audit consolidation?',
        del: 'Consolidated CARO audit checklist with model reporting paragraphs.',
        hrs: 18,
      },
      s2_center: {
        title: 'Internal Financial Controls (IFCoFR) RACM Simulation',
        desc: 'Execute end-to-end Risk and Control Matrix (RACM) design, control walkthroughs, and operating effectiveness testing in ERP systems.',
        skills: ['IFCoFR Testing', 'RACM Matrix', 'Design vs Operating Effectiveness'],
        ref: 'Companies Act Sec 143(3)(i) & ICAI IFCoFR Guidance Note',
        q: 'Walk me through testing automated IT application controls (ITAC) in SAP S/4HANA.',
        del: 'Complete Order-to-Cash (O2C) RACM workpaper pack with sample deficiency matrix.',
        hrs: 28,
      },
      s2_left: {
        title: 'Practical Case Study: CARO Clause 3(xxi) Group Audit',
        desc: 'Simulate high-stakes group audit consolidation case evaluating subsidiary qualification impacts and component auditor communications.',
        skills: ['SA 600 Component Audit', 'Group Consolidation', 'Audit Committee Memo'],
        ref: 'SA 600 Using the Work of Another Auditor & SA 705',
        q: 'How do you communicate with component auditors when dealing with modified subsidiary accounts?',
        del: 'Audit Committee Briefing Memorandum detailing consolidation adjustments.',
        hrs: 22,
      },
      s2_right: {
        title: 'Big 4 Assurance Practice Networking & Mentor Outreach',
        desc: 'Connect with Senior Managers and Partners currently hiring for Statutory Audit practices across Mumbai, Bengaluru, and NCR.',
        skills: ['Executive Presence', 'Partner Pitch', 'Assurance Practice Trends'],
        ref: 'Big 4 & Top 10 Indian Assurance Hiring Benchmarks',
        q: 'Why do you choose statutory audit assurance over advisory or FP&A corporate finance?',
        del: 'Scheduled advisory calls with 3 verified CA mentors in tier-1 assurance firms.',
        hrs: 12,
      },
      s3_center: {
        title: 'Execute Big 4 Technical Partner Round Mock Simulation',
        desc: 'Interactive 8-turn technical mock evaluating Ind AS judgments, audit skepticism, fraud risk procedures, and client handling under pressure.',
        skills: ['8-Turn Partner Drill', 'Professional Skepticism', 'Audit Opinion Formulation'],
        ref: 'SA 700 / SA 705 / SA 706 Audit Opinion Standards',
        q: 'Client management refuses to book impairment on overseas plant. What opinion do you formulate?',
        del: 'Scored STAR evaluation report with rubric accuracy >= 85%.',
        hrs: 20,
      },
      s3_left: {
        title: 'Finalize Zero-Fabrication Audited Resume (ADR-009)',
        desc: 'Export verified, mathematically constrained resume with zero AI hallucinations, locked strictly to attested Form 108 engagement records.',
        skills: ['ADR-009 Attestation', 'Quantified Audit Highlights', 'Non-Solicitation Grounding'],
        ref: 'ICAI Code of Ethics Clauses 6 & 7 of First Schedule',
        q: 'Verify every transaction number and client industry cited on page 1 of your CV.',
        del: 'Cryptographically locked PDF resume signed with candidate attestation.',
        hrs: 10,
      },
      s3_right: {
        title: 'CTC Unbundling & Blindfolded Partner Offer Negotiation',
        desc: 'Analyze compensation proposals under Section 115BAC New Tax Regime, separating guaranteed cash take-home from variable bonuses.',
        skills: ['Sec 115BAC New Tax Regime', 'Statutory PF & Gratuity', 'Blindfolded Job Mobility'],
        ref: 'Income Tax Act 1961 Section 115BAC & Indian Labour Code',
        q: 'What is your net monthly take-home expectation after EPF and slab deductions?',
        del: 'Comparative Offer Assessment Model analyzing corporate vs firm compensations.',
        hrs: 8,
      },
    },
    [CAPathway.TAX]: {
      s1_center: {
        title: 'Master Corporate Tax Assessment & Section 92C Transfer Pricing',
        desc: 'Detailed computation of corporate tax under Section 115BAA/115BAB and transfer pricing arm’s length price (ALP) determination.',
        skills: ['Corporate Tax 115BAA', 'Transfer Pricing Sec 92C', 'Arm’s Length Price'],
        ref: 'Income Tax Act 1961 Section 92C & Rule 10B',
        q: 'Which transfer pricing method is most appropriate for contract software development services?',
        del: 'Benchmarking economic analysis workpaper with TNMM search strategy.',
        hrs: 24,
      },
      s1_left: {
        title: 'Audit Form 3CD & 3CEB Articleship Verification',
        desc: 'Catalog exposure across Form 3CD Clause 21, Clause 34 (TDS), Clause 44 (GST expenditure), and Form 3CEB cross-border records.',
        skills: ['Form 3CD Working Papers', 'Clause 44 Disclosures', 'Form 3CEB Certification'],
        ref: 'ICAI Guidance Note on Tax Audit under Section 44AB',
        q: 'How do you audit and report expenditure incurred with unregistered entities under Clause 44?',
        del: 'Tax audit documentation file addressing high-risk reporting clauses.',
        hrs: 16,
      },
      s1_right: {
        title: 'International Tax & BEPS Pillar Two Framework',
        desc: 'Evaluate 15% global minimum tax rules (GloBE), DTAA beneficial ownership, and Equalisation Levy provisions.',
        skills: ['BEPS Pillar 2 GloBE', 'DTAA Article 12 FTS/Royalty', 'MLI Anti-Abuse'],
        ref: 'OECD BEPS Pillar Two Model Rules & Section 90(2)',
        q: 'How does MLI Principal Purpose Test (PPT) affect treaty benefits on intercompany royalty payments?',
        del: 'Cross-border tax structuring memorandum on treaty residency and PE exposure.',
        hrs: 18,
      },
      s2_center: {
        title: 'Tax Dispute Resolution & Faceless CIT(A) Simulation',
        desc: 'Draft comprehensive appeal submissions, grounds of appeal, and statement of facts for Section 143(3) and Section 148 reassessment notices.',
        skills: ['Faceless Assessment', 'CIT(A) Submissions', 'Sec 148 Reassessment'],
        ref: 'Income Tax Act Section 144B & Section 250',
        q: 'Draft grounds of appeal against Section 56(2)(viib) angel tax addition for startup client.',
        del: 'Complete Written Submission pack for CIT(Appeals) including judicial citations.',
        hrs: 28,
      },
      s2_left: {
        title: 'Indirect Tax Impact & GSTR-9C Annual Reconciliation',
        desc: 'Perform reconciliation between audited financial statements and GST portal filings, identifying input tax credit (ITC) reversals under Rule 42/43.',
        skills: ['GSTR-9C Reconciliation', 'Rule 42/43 ITC Reversals', 'GST Notice Resolution'],
        ref: 'CGST Act 2017 Section 35(5) and Section 44',
        q: 'How do you handle ITC discrepancies between GSTR-2B and financial ledgers during annual filing?',
        del: 'GSTR-9C reconciliation workpaper with DRC-03 tax liability computation.',
        hrs: 20,
      },
      s2_right: {
        title: 'Direct Tax Partner & MNC In-House Counsel Discovery',
        desc: 'Build strategic connections with International Tax Partners and Head of Tax executives at Fortune 500 GCCs.',
        skills: ['Tax Advisory Branding', 'GCC Career Navigation', 'Partner Conversations'],
        ref: 'MNC Corporate Tax & Transfer Pricing Practice Standards',
        q: 'How do you balance aggressive tax optimization with corporate governance mandates?',
        del: 'Mentor advisory debrief with a Big 4 International Tax Senior Manager.',
        hrs: 12,
      },
      s3_center: {
        title: 'Direct Tax Technical Partner Round Mock Interview',
        desc: 'Defend complex tax positions in high-stakes partner interview covering Section 14A disallowance, Transfer Pricing adjustments, and GAAR.',
        skills: ['GAAR Defense', 'Sec 14A Disallowances', 'Technical Oral Advocacy'],
        ref: 'Chapter X-A GAAR & Judicial Precedents of Delhi/Bombay High Court',
        q: 'Can Section 14A disallowance exceed exempt income earned during the financial year?',
        del: 'Technical mock evaluation scorecard with partner rubric rating >= 85%.',
        hrs: 20,
      },
      s3_left: {
        title: 'Lock Zero-Fabrication Tax Specialist Resume (ADR-009)',
        desc: 'Attest and export verified direct tax resume emphasizing transfer pricing, Form 3CD, and litigation representation experience.',
        skills: ['Tax Metric Verification', 'ADR-009 Attestation', 'ICAI Ethics'],
        ref: 'ADR-009 Provenance Rule',
        q: 'Confirm factual accuracy of tax savings and transfer pricing ticket sizes listed.',
        del: 'Candidate signed-off PDF resume for direct tax hiring teams.',
        hrs: 10,
      },
      s3_right: {
        title: 'Corporate Tax CTC Calculator & Negotiation Strategy',
        desc: 'Unbundle salary structures with variable retention bonuses, car lease benefits, and National Pension System (NPS) tax deductions.',
        skills: ['Section 80CCD(2) Corporate NPS', 'CTC Optimization', 'Offer Evaluation'],
        ref: 'Income Tax Act Section 80CCD(2)',
        q: 'Calculate tax savings from employer NPS contribution of 14% basic under 115BAC.',
        del: 'Personalized Net Monthly Take-Home Comparison Sheet.',
        hrs: 8,
      },
    },
    [CAPathway.FPA]: {
      s1_center: {
        title: 'Master Rolling Forecasts & Price-Volume-Mix Variance',
        desc: 'Construct 12-month rolling P&L forecasts and decompose financial performance using deterministic Price-Volume-Mix (PVM) analytics.',
        skills: ['Rolling 12M Forecasts', 'PVM Variance Analysis', 'Financial Modeling'],
        ref: 'FP&A Practice Framework & SaaS Unit Economics',
        q: 'How do you isolate mix impact from volume impact when operating across multi-tier products?',
        del: 'Interactive Excel/PowerBI dynamic variance bridge model.',
        hrs: 24,
      },
      s1_left: {
        title: 'Audit Management Reporting & MIS Exposure in Articleship',
        desc: 'Record exposure in constructing monthly management dashboards, budget vs actual variance packs, and board review decks.',
        skills: ['Board MIS Packs', 'Budget vs Actuals', 'KPI Governance'],
        ref: 'Form 108 Articleship MIS & Advisory Portfolio',
        q: 'What financial metrics did executive leadership look at first in your monthly MIS?',
        del: 'Attested summary of financial reporting artifacts built during training.',
        hrs: 16,
      },
      s1_right: {
        title: 'SaaS & Enterprise Unit Economics Mastery',
        desc: 'Analyze Annual Recurring Revenue (ARR), Customer Acquisition Cost (CAC), Lifetime Value (LTV), Net Retention Rate (NRR), and Rule of 40.',
        skills: ['SaaS Metrics (ARR/NRR)', 'CAC Payback Period', 'Burn Multiple'],
        ref: 'Strategic Finance & Venture Capital Benchmarks',
        q: 'Why can a business with 130% Net Dollar Retention afford a 24-month CAC payback?',
        del: 'B2B enterprise SaaS metrics diagnostic workbook.',
        hrs: 18,
      },
      s2_center: {
        title: 'Advanced Three-Statement Dynamic Financial Modeling',
        desc: 'Build fully integrated dynamic 3-statement financial model with working capital schedules, debt waterfalls, and scenario toggles.',
        skills: ['3-Statement Integration', 'Debt Amortization Schedules', 'Scenario Managers'],
        ref: 'FAST Modeling Standard & Wall Street Prep Methodology',
        q: 'How does a ₹50 Cr inventory write-down flow through the 3 financial statements?',
        del: 'Audited dynamic financial model template with sensitivity tornado charts.',
        hrs: 28,
      },
      s2_left: {
        title: 'Strategic Cost Optimization & Zero-Based Budgeting (ZBB)',
        desc: 'Implement zero-based budgeting framework across SG&A cost centers and identify operational expenditure run-rate efficiencies.',
        skills: ['Zero-Based Budgeting', 'SG&A Rationalization', 'Run-Rate Modeling'],
        ref: 'McKinsey / BCG Corporate Turnaround Frameworks',
        q: 'How do you convince department heads to reset OPEX baselines under ZBB without hurting growth?',
        del: 'Executive Cost Reduction Playbook for mid-market enterprise.',
        hrs: 20,
      },
      s2_right: {
        title: 'Strategic Finance & Head of FP&A Executive Networking',
        desc: 'Engage with VP Finance, Strategic Finance Leads, and FP&A Directors at venture-funded startups and listed enterprises.',
        skills: ['Finance Business Partnering', 'CFO Engagement', 'Commercial Acumen'],
        ref: 'Modern Finance Business Partnering Competency Model',
        q: 'How do you push back against business heads projecting unrealistic revenue growth?',
        del: 'Networking debrief with two Senior FP&A leaders in hyper-growth tech companies.',
        hrs: 12,
      },
      s3_center: {
        title: 'FP&A Technical Case Interview & Live Business Modeling Drill',
        desc: 'Undergo 8-turn technical drill: live scenario restructuring, unit economics defense, and CFO-level executive communication.',
        skills: ['Live Case Solving', 'Executive Decision Support', 'Stress-Test Defense'],
        ref: 'Corporate Finance Institute (CFI) & Big 4 Advisory Rubrics',
        q: 'Company margins dropped 400 bps despite 20% revenue growth. What are your first 3 analytical steps?',
        del: 'Executive presentation deck addressing revenue leakages and working capital bloat.',
        hrs: 20,
      },
      s3_left: {
        title: 'Export Zero-Fabrication FP&A Resume (ADR-009)',
        desc: 'Certify verified modeling certifications, financial systems used (SAP, NetSuite, PowerBI), and attested articleship financial analytics.',
        skills: ['Verified Tool Proficiencies', 'ADR-009 Attestation', 'Commercial Achievements'],
        ref: 'ADR-009 Grounding Standard',
        q: 'Attest to financial model scale and budget size managed.',
        del: 'Verified FP&A Candidate Resume signed off for tech recruiters.',
        hrs: 10,
      },
      s3_right: {
        title: 'ESOP Realism & Corporate Finance CTC Evaluation',
        desc: 'Evaluate stock options (ESOPs), vesting cliffs, strike price discount, and guaranteed cash components in tech company offers.',
        skills: ['ESOP Valuation & Taxation', 'Perquisite Tax Sec 17(2)', 'Offer Comparison'],
        ref: 'Income Tax Act Section 17(2)(vi) ESOP Perquisites',
        q: 'What is the real pre-tax cash equivalent of a ₹15L ESOP grant with 4-year vesting?',
        del: 'Comprehensive Startup vs Corporate Offer Comparison Matrix.',
        hrs: 8,
      },
    },
    [CAPathway.CORP_FIN]: {
      s1_center: {
        title: 'Master ICAI Valuation Standards (IVS 301) & DCF Modeling',
        desc: 'Comprehensive implementation of Discounted Cash Flow (DCF), Weighted Average Cost of Capital (WACC), and terminal value models per IVS 301.',
        skills: ['IVS 301 Valuation', 'WACC Computation', 'Terminal Value Multiples'],
        ref: 'ICAI Valuation Standards (IVS 102, 103, 301)',
        q: 'How do you compute cost of equity when target company is unlisted and illiquid?',
        del: 'Comprehensive DCF valuation model with Monte Carlo simulation.',
        hrs: 24,
      },
      s1_left: {
        title: 'Audit Form 108 Corporate Finance & Valuation Engagements',
        desc: 'Catalog valuation reports, fairness opinions, and statutory balance sheet restructuring performed during 3-year training.',
        skills: ['Valuation Engagements', 'Form 108 Evidence', 'Registered Valuer Support'],
        ref: 'Companies (Registered Valuers and Valuation) Rules 2017',
        q: 'What valuation methods did you apply for Section 56(2)(viib) or FEMA compliance?',
        del: 'Attested corporate finance experience log with regulatory standards referenced.',
        hrs: 16,
      },
      s1_right: {
        title: 'Capital Structuring & Debt Syndication Modeling',
        desc: 'Evaluate debt service coverage ratio (DSCR), interest coverage, leverage covenants, and credit rating agency criteria.',
        skills: ['DSCR & Covenants', 'Debt Waterfall', 'Credit Rating Methodologies'],
        ref: 'RBI Prudential Framework for Stressed Assets & Basel III',
        q: 'How do you structure mezzanine debt to avoid violating senior lender DSCR covenants?',
        del: 'Project finance debt syndication information memorandum model.',
        hrs: 18,
      },
      s2_center: {
        title: 'M&A Accretion / Dilution & LBO Financial Modeling',
        desc: 'Construct full merger accretion/dilution model with synergies, goodwill calculation, debt repayment schedules, and returns (IRR / MoIC).',
        skills: ['Accretion / Dilution', 'Purchase Price Allocation', 'LBO Return Analysis'],
        ref: 'Ind AS 103 Business Combinations & Wall Street Valuation Standards',
        q: 'What conditions cause an all-stock acquisition to be dilutive to the acquirer’s EPS?',
        del: 'Dynamic M&A transaction model with sensitivity matrix on purchase multiples.',
        hrs: 28,
      },
      s2_left: {
        title: 'Commercial Due Diligence & Quality of Earnings (QoE)',
        desc: 'Identify pro-forma EBITDA adjustments, non-recurring expenses, and debt-like items in target company financial statements.',
        skills: ['QoE Adjustments', 'Normalized Working Capital', 'Debt-Like Items'],
        ref: 'Big 4 Transaction Advisory Services Methodology',
        q: 'Why is owner compensation adjustment considered a pro-forma EBITDA normalization?',
        del: 'Sample Quality of Earnings report draft with EBITDA bridge.',
        hrs: 20,
      },
      s2_right: {
        title: 'Investment Banking & Corporate Treasury Networking',
        desc: 'Connect with Corporate Finance Partners, Private Equity Associates, and Treasury Directors across major financial hubs.',
        skills: ['IB Deal Pitching', 'Executive Networking', 'PE/VC Industry Insights'],
        ref: 'Corporate Finance & Investment Banking Placement Benchmarks',
        q: 'How do you articulate valuation judgment under uncertain macroeconomic outlooks?',
        del: 'Advisory debrief notes with an Investment Banking Vice President.',
        hrs: 12,
      },
      s3_center: {
        title: 'Corporate Finance Technical Partner Round Mock Interview',
        desc: 'Simulate high-stakes partner drill on valuation methodologies, M&A structuring, Ind AS 103 accounting, and capital allocation.',
        skills: ['Deal Defense', 'Valuation Defense', 'Executive Negotiation'],
        ref: 'Big 4 Corporate Finance & Boutique IB Partner Evaluation Criteria',
        q: 'Enterprise Value is ₹1,000 Cr. Company has ₹200 Cr debt, ₹50 Cr cash, and ₹30 Cr pension deficit. Compute Equity Value.',
        del: 'STAR evaluation scorecard with partner rubric rating >= 85%.',
        hrs: 20,
      },
      s3_left: {
        title: 'Finalize Zero-Fabrication Corporate Finance Resume (ADR-009)',
        desc: 'Lock verified resume highlighting deal experience, valuation tickets, and financial modeling proficiencies attested under ADR-009.',
        skills: ['Deal Experience Attestation', 'ADR-009 Compliance', 'ICAI Ethical Standards'],
        ref: 'ADR-009 Zero-Fabrication Specification',
        q: 'Attest to transaction values and modeling contributions listed on your resume.',
        del: 'Cryptographically certified PDF resume for investment banks and PE funds.',
        hrs: 10,
      },
      s3_right: {
        title: 'IB / PE Compensation Structure & In-Hand Take-Home Analysis',
        desc: 'Compute net cash flow after performance-linked deal bonuses, deferred carry components, and Section 115BAC deductions.',
        skills: ['Carried Interest Realism', 'Deal Bonus Mechanics', 'Blindfolded Job Mobility'],
        ref: 'Income Tax Act 1961 Section 115BAC & SEBI AIF Regulations',
        q: 'How do you evaluate deal bonuses versus guaranteed base pay when switching firms?',
        del: 'Investment Banking Compensation & Net In-Hand Model.',
        hrs: 8,
      },
    },
    [CAPathway.IB]: {
      s1_center: {
        title: 'Financial Due Diligence (FDD) & Normalized EBITDA Bridge',
        desc: 'Perform deep-dive Quality of Earnings (QoE) analyses, identify run-rate adjustments, and establish normalized EBITDA baselines.',
        skills: ['Quality of Earnings (QoE)', 'EBITDA Normalization', 'FDD Methodology'],
        ref: 'Big 4 Transaction Advisory Standard Operating Procedures',
        q: 'What constitutes a valid pro-forma EBITDA adjustment during buy-side due diligence?',
        del: 'Detailed QoE bridge spreadsheet with audit-trail references for all adjustments.',
        hrs: 24,
      },
      s1_left: {
        title: 'Audit Form 108 Articleship Due Diligence & M&A Support Log',
        desc: 'Catalogue exposure in data room management, vendor due diligence reports, and financial reviews during articleship.',
        skills: ['Virtual Data Room (VDR)', 'Vendor Due Diligence', 'Form 108 Certification'],
        ref: 'ICAI Guidelines on Articleship Exposure in Transaction Advisory',
        q: 'Describe your role in analyzing target company contracts and contingent liabilities.',
        del: 'Attested Articleship Transaction Support Portfolio.',
        hrs: 16,
      },
      s1_right: {
        title: 'Normalized Working Capital (NWC) Peg Modeling',
        desc: 'Calculate 12-month trailing average working capital, seasonal adjustments, and target working capital pegs for SPA closing.',
        skills: ['NWC Peg Calculation', 'Cash-Free Debt-Free SPA', 'Closing Adjustments'],
        ref: 'Share Purchase Agreement (SPA) Financial Mechanics',
        q: 'How does an aggressive working capital peg impact the net purchase price at closing?',
        del: 'NWC Peg calculation model with monthly seasonal fluctuation adjustments.',
        hrs: 18,
      },
      s2_center: {
        title: 'Debt-Like Items & Contingent Liability Assessment',
        desc: 'Exhaustive audit of off-balance-sheet commitments, unprovided tax disputes, employee severance liabilities, and earnouts.',
        skills: ['Debt-Like Deductions', 'Ind AS 37 Provisions', 'Contingent Liability Scrutiny'],
        ref: 'Ind AS 37 Provisions, Contingent Liabilities & Contingent Assets',
        q: 'How do you treat an open Section 148 reassessment notice in a debt-like items schedule?',
        del: 'Comprehensive Debt and Debt-Like Items schedule ready for SPA insertion.',
        hrs: 28,
      },
      s2_left: {
        title: 'Vendor Due Diligence (VDD) Report Drafting Simulation',
        desc: 'Draft executive summary, historical performance analysis, customer concentration risks, and margin sustainability chapters.',
        skills: ['VDD Report Drafting', 'Customer Churn Analysis', 'Executive Writing'],
        ref: 'Big 4 Transaction Services Report Writing Standards',
        q: 'How do you present significant revenue concentration in top 3 clients to prospective buyers?',
        del: 'Executive-ready 15-page Vendor Due Diligence teaser and chapter summary.',
        hrs: 20,
      },
      s2_right: {
        title: 'Private Equity & Transaction Advisory Practice Networking',
        desc: 'Network with M&A Partners, TAS Directors, and Private Equity investment associates hiring for deal advisory roles.',
        skills: ['Deal Sourcing Presence', 'PE Sector Specialization', 'Partner Outreach'],
        ref: 'M&A Advisory & Private Equity Recruitment Benchmarks',
        q: 'What transaction sectors in India do you believe are currently most attractive for buyouts?',
        del: 'Scheduled conversations with 3 practicing M&A / TAS professionals.',
        hrs: 12,
      },
      s3_center: {
        title: 'FDD Partner Round Technical Mock Case Interview',
        desc: 'Defend deal findings, QoE adjustments, and SPA purchase price recommendations in intense partner-level interview simulation.',
        skills: ['Partner Defense', 'SPA Negotiation Tactics', 'Client Advisory Mastery'],
        ref: 'Big 4 TAS Partner Case Evaluation Standard',
        q: 'Target revenue grew 50% but DSO increased from 45 to 110 days. What is your diagnosis?',
        del: 'Technical partner drill scorecard with rubric rating >= 85%.',
        hrs: 20,
      },
      s3_left: {
        title: 'Lock Zero-Fabrication FDD Specialist Resume (ADR-009)',
        desc: 'Certify verified due diligence engagements, transaction values, and financial analysis skills with strict candidate attestation.',
        skills: ['Transaction Provenance', 'ADR-009 Attestation', 'Non-Solicitation Ethical Compliance'],
        ref: 'ADR-009 Zero-Fabrication Rule',
        q: 'Confirm deal participation without violating client non-disclosure agreements.',
        del: 'Certified PDF resume tailored for Big 4 Deal Advisory and PE funds.',
        hrs: 10,
      },
      s3_right: {
        title: 'Deal Advisory CTC Unbundling & Variable Bonus Realism',
        desc: 'Compute net take-home salary considering deal closure bonuses, utilization multipliers, and Section 115BAC tax deductions.',
        skills: ['Utilization Incentives', 'Deal Bonus Mechanics', 'Candidate Blindfolded Mobility'],
        ref: 'Income Tax Act Section 115BAC & Variable Compensation Codes',
        q: 'How do you benchmark base salary versus discretionary deal bonus packages?',
        del: 'Deal Advisory Compensation Analysis & In-Hand Projection Sheet.',
        hrs: 8,
      },
    },
    [CAPathway.CONSULTING]: {
      s1_center: {
        title: 'Finance Target Operating Model (TOM) & Chart of Accounts',
        desc: 'Design finance organizational structures, shared service frameworks, and standardized enterprise ERP charts of accounts.',
        skills: ['Finance TOM Design', 'Chart of Accounts (COA)', 'Shared Services'],
        ref: 'Global Capability Center (GCC) Operating Standards',
        q: 'How do you design an ERP chart of accounts that supports both Ind AS and US GAAP reporting?',
        del: 'Global Chart of Accounts structure document with multi-entity segmentation.',
        hrs: 24,
      },
      s1_left: {
        title: 'Articleship Management Consulting & Process Audit Review',
        desc: 'Document exposure across standard operating procedure (SOP) design, internal audit walkthroughs, and ERP migrations.',
        skills: ['SOP Development', 'Process Flowcharting', 'Form 108 Evidence'],
        ref: 'Form 108 Internal Audit & Management Advisory Log',
        q: 'Walk me through a business process where your audit findings led to operational redesign.',
        del: 'Attested Process Improvement Portfolio from articleship training.',
        hrs: 16,
      },
      s1_right: {
        title: 'Fast-Close Financial Reporting Acceleration Framework',
        desc: 'Reduce month-end financial closing cycle from 15 days to 3 business days using automation, accrual estimation, and parallel processing.',
        skills: ['Month-End Fast Close', 'Continuous Accounting', 'RPA in Finance'],
        ref: 'APQC Financial Management Benchmarks',
        q: 'What are the top three bottlenecks causing delays in financial close and consolidation?',
        del: 'Day-by-Day Month-End Close Acceleration Roadmap with RACI matrix.',
        hrs: 18,
      },
      s2_center: {
        title: 'ERP Financial Transformation & Systems Implementation (SAP/Oracle)',
        desc: 'Formulate functional specifications for SAP S/4HANA FI/CO or Oracle Fusion Finance, including automatic bank reconciliation and revenue engines.',
        skills: ['ERP Functional Specs', 'SAP S/4HANA FI/CO', 'Data Migration Strategy'],
        ref: 'Enterprise Architecture & Financial Systems Implementation Framework',
        q: 'How do you manage legacy GL balance migration while ensuring historical auditability?',
        del: 'Complete Functional Specification Document (FSD) for automated financial close.',
        hrs: 28,
      },
      s2_left: {
        title: 'Working Capital Transformation & Cash Flow Optimization',
        desc: 'Optimize Days Sales Outstanding (DSO), Days Payable Outstanding (DPO), and Days Sales of Inventory (DSI) across global entities.',
        skills: ['Working Capital Optimization', 'Cash Conversion Cycle (CCC)', 'Supply Chain Finance'],
        ref: 'Working Capital Management & Treasury Standards',
        q: 'How do you extend supplier DPO without straining vendor relationships or incurring price surcharges?',
        del: 'Working Capital Optimization Strategy Deck with ₹100 Cr liquidity impact model.',
        hrs: 20,
      },
      s2_right: {
        title: 'Management Consulting & CFO Advisory Partner Outreach',
        desc: 'Connect with Partners, Principals, and Practice Leads at MBB, Big 4 CFO Advisory, and Top Tier transformation consultancies.',
        skills: ['Consulting Case Prep', 'Executive Gravitas', 'Practice Networking'],
        ref: 'Strategy & Management Consulting Hiring Benchmarks',
        q: 'Why should a client hire external finance transformation consultants instead of using internal teams?',
        del: 'Advisory debrief with two Senior Management Consultants in Finance Advisory.',
        hrs: 12,
      },
      s3_center: {
        title: 'Consulting Partner Round Case Interview Simulation',
        desc: 'Undergo structured partner case interview evaluating hypothesis-driven problem solving, pyramid principle communication, and change management.',
        skills: ['Pyramid Principle', 'Hypothesis-Driven Approach', 'Partner Communication'],
        ref: 'Case in Point & Big 4 Advisory Interview Rubrics',
        q: 'A listed retail company wants to cut finance operational cost by 30% in 12 months. Structure your approach.',
        del: 'Executive case presentation deck with partner evaluation score >= 85%.',
        hrs: 20,
      },
      s3_left: {
        title: 'Lock Zero-Fabrication Transformation Resume (ADR-009)',
        desc: 'Certify verified ERP implementations, process reengineering results, and financial metrics under ADR-009 compliance standards.',
        skills: ['Verified Transformation Metrics', 'ADR-009 Attestation', 'ICAI Ethical Grounding'],
        ref: 'ADR-009 Zero-Fabrication Standard',
        q: 'Attest to quantitative efficiency gains and team sizes cited in your resume.',
        del: 'Certified PDF resume tailored for Management Consulting and GCC leadership.',
        hrs: 10,
      },
      s3_right: {
        title: 'Consulting Compensation & Performance Multiplier Analytics',
        desc: 'Compute net take-home salary considering performance bonuses, per diem allowances, and Section 115BAC deductions.',
        skills: ['Consulting Bonus Formulas', 'Per Diem Economics', 'Candidate Blindfold Mobility'],
        ref: 'Income Tax Act 1961 Section 115BAC',
        q: 'What is the real cash value of consulting performance multipliers versus high base corporate offers?',
        del: 'Consulting vs Corporate Leadership Compensation Analysis Model.',
        hrs: 8,
      },
    },
    [CAPathway.PRACTICE]: {
      s1_center: {
        title: 'Master Statutory UDIN, ACK & MCA Filing Compliance',
        desc: 'Operational mastery over ICAI UDIN generation, MCA V3 portal filings, Form 3CD, and statutory auditor reporting requirements.',
        skills: ['UDIN Generation', 'MCA V3 Portal', 'Statutory Registers'],
        ref: 'ICAI Unique Document Identification Number (UDIN) Guidelines',
        q: 'When must a UDIN be generated, and what are the consequences of non-generation within 60 days?',
        del: 'Firm Statutory Compliance Master Schedule with automated deadline tracking.',
        hrs: 24,
      },
      s1_left: {
        title: 'Catalog Form 108 Sole Proprietorship / Partnership Experience',
        desc: 'Document statutory audit mandates, GST filings, and direct tax assessments handled during training to build practice credentials.',
        skills: ['Practice Mandates', 'Client Management', 'Form 108 Certification'],
        ref: 'ICAI Council Guidelines for Public Practice',
        q: 'How many statutory company audits did you assist in from planning to signing during training?',
        del: 'Attested Practice Exposure Inventory for firm registration.',
        hrs: 16,
      },
      s1_right: {
        title: 'ICAI Ethical Governance & Non-Solicitation Architecture',
        desc: 'Strict adherence to Clauses 6 & 7 of Part I of the First Schedule of CA Act 1949: zero commercial advertising and ethical client onboarding.',
        skills: ['Clause 6 & 7 Ethics', 'Non-Solicitation', 'Tender Guidelines'],
        ref: 'Chartered Accountants Act 1949 (First Schedule)',
        q: 'What professional details can a practicing CA legally include on their firm website or visiting card?',
        del: 'ICAI Ethical Compliance Self-Audit Checklist for public practitioners.',
        hrs: 18,
      },
      s2_center: {
        title: 'Launch CA Practice Firm OS: Client Master & Filing Calendar',
        desc: 'Deploy automated tracking for GSTR-3B, Tax Audit 44AB, Advance Tax, and TDS filings with automated alerts and entity segregation.',
        skills: ['Client Master Registry', 'Due Date Compliance', 'Filing Repository'],
        ref: 'Practice Firm OS Architecture & ICAI Minimum Audit Fee Guidelines',
        q: 'How do you safeguard client confidential audit working papers from unauthorized access?',
        del: 'Configured Practice Firm OS workspace with 20 active client profiles.',
        hrs: 28,
      },
      s2_left: {
        title: 'Peer Review & Quality Review Board (QRB) Readiness Audit',
        desc: 'Implement SQC 1 (Standard on Quality Control) policies, independent partner reviews, and documentation retention guidelines.',
        skills: ['SQC 1 Quality Control', 'Peer Review Board', 'Audit Working Papers'],
        ref: 'ICAI Peer Review Board Statement & Standard on Quality Control (SQC 1)',
        q: 'What quality control procedures are mandatory before releasing an audit report on a public company?',
        del: 'SQC 1 Firm Quality Manual with standardized engagement letter templates.',
        hrs: 20,
      },
      s2_right: {
        title: 'Practitioner Mentorship & Senior Managing Partner Discovery',
        desc: 'Connect with established Senior Partners of 25+ year-old firms to learn ethical practice scaling, retainer pricing, and partner equity models.',
        skills: ['Retainer Pricing Models', 'Partnership Deeds', 'Firm Succession'],
        ref: 'ICAI Guidelines on Networking, Merger and Demerger of CA Firms',
        q: 'How do you transition a sole proprietorship into a multi-partner partnership firm under ICAI rules?',
        del: 'Practice strategy debrief with two Managing Partners of registered firms.',
        hrs: 12,
      },
      s3_center: {
        title: 'Execute Practice Partner Diagnostic & Client Pitch Simulation',
        desc: 'Simulate high-stakes client advisory consultation evaluating statutory compliance advice, audit fee estimation, and engagement risk.',
        skills: ['Engagement Risk Assessment', 'Advisory Value Pricing', 'Client Communication'],
        ref: 'ICAI Minimum Fee Recommendation & Code of Ethics',
        q: 'Prospective client has past tax evasion proceedings. What client acceptance procedures must you follow?',
        del: 'Comprehensive Client Acceptance & Engagement Risk Evaluation Memorandum.',
        hrs: 20,
      },
      s3_left: {
        title: 'Lock Verified Practice Credentials & Profile (ADR-009)',
        desc: 'Certify verified ICAI membership credentials, COP status, and practice capabilities without misleading advertising or false claims.',
        skills: ['COP Attestation', 'Ethical Credentials', 'ADR-009 Compliance'],
        ref: 'ADR-009 Zero-Fabrication Standard & CA Act 1949',
        q: 'Attest to membership number and Certificate of Practice issuance date.',
        del: 'Verified Practitioner Profile ready for institutional and banking panel empanelment.',
        hrs: 10,
      },
      s3_right: {
        title: 'Firm Retainer Billing & GST Invoicing Infrastructure',
        desc: 'Configure SAC 998311 / 998314 billing system with automatic B2B GST e-invoicing, Input Tax Credit compliance, and collections tracking.',
        skills: ['SAC Code 998311 Billing', 'B2B GST Invoicing', 'Retainer Cash Flow'],
        ref: 'CGST Act 2017 & Service Accounting Codes (SAC 998311 / 998314)',
        q: 'What is the applicable SAC code for statutory audit versus financial advisory services?',
        del: 'Automated Firm Billing System with GST-compliant invoice templates.',
        hrs: 8,
      },
    },
  };

  const curr = PATHWAY_CURRICULUM[pathway] || PATHWAY_CURRICULUM[CAPathway.AUDIT];

  // Helper to serialize rich node metadata in description safely
  const buildNode = (
    milestone: 'DAY_30' | 'DAY_60' | 'DAY_90',
    category: string,
    priority: 'HIGH' | 'MEDIUM',
    data: { title: string; desc: string; skills: string[]; ref: string; q?: string; del?: string; hrs: number },
    stage: 'FOUNDATION' | 'APPLICATION' | 'MASTERY',
    branch: 'left' | 'center' | 'right'
  ): CareerRoadmapTaskItem => {
    // If a customPrompt mentions specific skills, highlight them
    const skills = [...data.skills];
    if (customPrompt && customPrompt.length > 3) {
      if (!skills.some((s) => customPrompt.toLowerCase().includes(s.toLowerCase()))) {
        skills.unshift(customPrompt.substring(0, 24));
      }
    }

    const weekRange =
      milestone === 'DAY_30'
        ? branch === 'center'
          ? 'Week 1 — Week 2'
          : branch === 'left'
          ? 'Week 1 — Week 3'
          : 'Week 2 — Week 4'
        : milestone === 'DAY_60'
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

    // Detailed learning submodules
    let submodules: string[] = [];
    if (data.title.includes('115') || data.title.includes('Revenue')) {
      submodules = [
        'Ind AS 115.9: Five-step model verification & contract enforceability criteria',
        'Ind AS 115.22: Identifying distinct performance obligations in multi-element arrangements',
        'Ind AS 115.56: Variable consideration constraint & estimation of return assets/refund liabilities',
        'Ind AS 115.73: Allocating transaction price using Standalone Selling Prices (SSP)',
        'Ind AS 116.22: Right-of-Use (ROU) asset recognition & incremental borrowing rate (IBR) curves',
      ];
    } else if (data.title.includes('CARO') || data.title.includes('Statutory Reporting')) {
      submodules = [
        'Clause 3(i): Verification of title deeds of immovable properties not held in company name',
        'Clause 3(ii): Working capital limit scrutiny (> ₹5 Cr sanctioned limits against current assets)',
        'Clause 3(ix): Scrutiny of defaults in repayment of loans/borrowings to banks or financial institutions',
        'Clause 3(xvii): Cash losses incurred in financial year and immediately preceding financial year',
        'Clause 3(xxi): Group audit qualification mapping across parent and subsidiaries per SA 600',
      ];
    } else if (data.title.includes('RACM') || data.title.includes('IFCoFR')) {
      submodules = [
        'Entity Level Controls (ELC) review & COSO 2013 framework governance benchmarking',
        'Process walkthroughs: Order-to-Cash (O2C) and Procure-to-Pay (P2P) cycles',
        'IT General Controls (ITGC) & Automated Application Controls (ITAC) in SAP S/4HANA',
        'Segregation of Duties (SoD) matrix validation and privileged user access controls',
        'Control Deficiency vs Significant Deficiency vs Material Weakness classification',
      ];
    } else if (data.title.includes('Partner Round') || data.title.includes('Simulation')) {
      submodules = [
        'SA 240: Auditor responsibilities relating to fraud in audit of financial statements',
        'SA 700 / SA 705 / SA 706: Formulating unmodified, qualified, adverse, or disclaimer opinions',
        'SA 701: Communicating Key Audit Matters (KAM) in independent auditor report',
        'Challenging management assumptions: Impairment testing under Ind AS 36 & goodwill valuation',
        'Professional skepticism drills: Responding to client management pressure & scope limits',
      ];
    } else if (data.title.includes('Transfer Pricing') || data.title.includes('Corporate Tax')) {
      submodules = [
        'Section 115BAA/115BAB: Effective corporate tax rate computations & MAT exemption mechanics',
        'Section 92C Rule 10B: Transactional Net Margin Method (TNMM) and Comparable Uncontrolled Price (CUP)',
        'Form 3CD Clauses 21, 34 (TDS reconciliation), and 44 (GST expenditure analysis)',
        'Master File & Local File documentation thresholds per Section 92D and Rule 10DA',
        'Safe Harbour Rules & Advance Pricing Agreement (APA) strategic considerations',
      ];
    } else if (data.title.includes('Forecast') || data.title.includes('Variance')) {
      submodules = [
        '12-Month Rolling Forecast Architecture: Decoupling budgets from dynamic driver plans',
        'Deterministic Price-Volume-Mix (PVM) mathematical decomposition across product lines',
        'Working Capital Modeling: Days Sales Outstanding (DSO) and Inventory Turnover sensitivity',
        'Executive Dashboard Wireframing: PowerBI / Tableau integration with SAP ERP tables',
        'Board Deck Synthesis: Translating operational variances into EBITDA expansion levers',
      ];
    } else if (data.title.includes('Valuation') || data.title.includes('DCF')) {
      submodules = [
        'ICAI Valuation Standard (IVS 301): Free Cash Flow to Firm (FCFF) forecasting guidelines',
        'Capital Asset Pricing Model (CAPM): Beta deleveraging/releveraging and size premium adjustments',
        'Weighted Average Cost of Capital (WACC): Cost of debt, effective tax shield, and debt weighting',
        'Terminal Value calculation: Gordon Growth Model vs Exit Multiple Method comparison',
        'Section 56(2)(viib) Angel Tax & FEMA pricing regulations for foreign equity issuances',
      ];
    } else {
      submodules = [
        `Core Technical Principles & Regulatory Mandate for ${data.title.split(' ')[1] || 'Domain'}`,
        'Practical Field Execution: Workpaper documentation and evidentiary standards',
        'Cross-Functional Impact: Integration with statutory filings and financial statements',
        'Risk Management & Defensibility against regulatory scrutiny or partner review',
        'Executive Communication: Presenting conclusions to C-suite and Audit Committees',
      ];
    }

    // Concrete execution checklist
    const checklist = [
      `Review statutory standards and ICAI technical pronouncements relevant to ${data.title.split(' ')[1] || 'module'}`,
      `Inspect sample company workpapers and test cases to identify high-risk non-compliance areas`,
      `Execute hands-on simulation drill and draft formal working paper memorandum (${data.del?.split(' ')[0] || 'Technical Document'})`,
      `Validate findings against Big 4 quality criteria and regulatory reporting requirements`,
    ];

    // Big 4 Partner Interview Model Answer Key
    const interviewAnswerKey =
      data.q
        ? `Partner Evaluation Rubric: High-scoring candidates must immediately quote the statutory section/standard (${data.ref.split(' ')[0] || 'Applicable Standard'}). Structure the answer using the STAR method: 1) State the accounting position under the standard; 2) Detail the audit or analytical evidence gathered; 3) Formulate the practical judgment or disclosure requirement without hesitation. Common trap to avoid: Do not accept management representations without corroborative third-party evidence.`
        : 'Demonstrate deep statutory grounding, cite specific standard paragraphs, and articulate commercial business judgment.';

    // Practical Workpaper Deliverable Model
    const workpaperModel = data.del || 'Standard Big 4 Practice Working Paper Pack and Audit Memo';

    // Curated Authoritative Study References
    const resources = [
      `ICAI Technical Guide on ${pathway} Standards`,
      `Companies Act 2013 & Relevant Statutory Rules`,
      `NFRA Financial Reporting Audit Quality Review Reports`,
    ];

    const jsonMetadata = JSON.stringify({
      summary: data.desc,
      keySkills: skills,
      stage,
      branch,
      estimatedHours: data.hrs,
      statutoryReference: data.ref,
      interviewQuestion: data.q || '',
      interviewAnswerKey,
      practicalDeliverable: data.del || '',
      workpaperModel,
      prerequisites: stage === 'FOUNDATION' ? [] : ['Prerequisite Stage Completed'],
      weekRange,
      submodules,
      checklist,
      resources,
    });

    return {
      id: randomUUID(),
      roadmapId,
      milestone,
      title: data.title,
      description: jsonMetadata,
      category,
      priority,
      status: 'PENDING',
      keySkills: skills,
      stage,
      branch,
      estimatedHours: data.hrs,
      statutoryReference: data.ref,
      interviewQuestion: data.q,
      interviewAnswerKey,
      practicalDeliverable: data.del,
      workpaperModel,
      prerequisites: stage === 'FOUNDATION' ? [] : ['Previous stage milestones'],
      weekRange,
      submodules,
      checklist,
      resources,
    };
  };

  // STAGE 01: DAY 1 - 30 (Foundation & Statutory Rigor)
  tasks.push(buildNode('DAY_30', 'SKILL_UPGRADE', 'HIGH', curr.s1_center, 'FOUNDATION', 'center'));
  tasks.push(buildNode('DAY_30', 'APPLICATION_PREP', 'HIGH', curr.s1_left, 'FOUNDATION', 'left'));
  tasks.push(buildNode('DAY_30', 'STATUTORY_COMPLIANCE', 'MEDIUM', curr.s1_right, 'FOUNDATION', 'right'));

  // STAGE 02: DAY 31 - 60 (Practical Case Execution & Workpapers)
  tasks.push(buildNode('DAY_60', 'CASE_SIMULATION', 'HIGH', curr.s2_center, 'APPLICATION', 'center'));
  tasks.push(buildNode('DAY_60', 'SKILL_UPGRADE', 'HIGH', curr.s2_left, 'APPLICATION', 'left'));
  tasks.push(buildNode('DAY_60', 'NETWORKING', 'MEDIUM', curr.s2_right, 'APPLICATION', 'right'));

  // STAGE 03: DAY 61 - 90 (Big 4 Partner Drills & Offer Readiness)
  tasks.push(buildNode('DAY_90', 'PARTNER_ROUND', 'HIGH', curr.s3_center, 'MASTERY', 'center'));
  tasks.push(buildNode('DAY_90', 'APPLICATION_PREP', 'HIGH', curr.s3_left, 'MASTERY', 'left'));
  tasks.push(buildNode('DAY_90', 'CAREER_MOBILITY', 'MEDIUM', curr.s3_right, 'MASTERY', 'right'));

  // If there are missing skills from diagnostic, inject a focused bridge node
  if (missingSkills.length > 0) {
    const missingTop = missingSkills[0];
    tasks.push(
      buildNode(
        'DAY_30',
        'SKILL_UPGRADE',
        'HIGH',
        {
          title: `Bridge Critical Skill Gap: ${missingTop}`,
          desc: `Targeted study, practical workpaper exercises, and case simulations to achieve Big 4 partner competency in ${missingTop}.`,
          skills: [missingTop, 'Core Competency', 'Practical Application'],
          ref: 'Diagnostic Skill Gap Assessment Rubric',
          q: `Explain how you developed practical exposure in ${missingTop} following your articleship?`,
          del: `Completed capstone workpaper project demonstrating mastery of ${missingTop}.`,
          hrs: 15,
        },
        'FOUNDATION',
        'left'
      )
    );
  }

  return tasks;
}
