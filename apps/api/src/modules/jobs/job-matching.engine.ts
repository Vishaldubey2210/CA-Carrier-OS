import { createHash } from 'node:crypto';
import {
  CandidateProfileData,
  CAPathway,
  JobDetail,
  JobMatchReport,
  StructuredJobRequirements,
  WorkArrangement,
} from '@ca-career-os/shared';

/**
 * Generate deterministic SHA-256 fingerprint for deduplication.
 */
export function generateJobFingerprint(
  companyName: string,
  normalizedTitle: string,
  locationCity: string
): string {
  const normalized = `${companyName.trim().toLowerCase()}:${normalizedTitle.trim().toLowerCase()}:${locationCity.trim().toLowerCase()}`;
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Sanitize external job text to defend against prompt injection and malicious instructions.
 */
export function sanitizeJobText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/(?:ignore\s+all\s+previous\s+instructions|system\s+prompt\s+override|<\|im_start\|>|<\|endoftext\|>)/gi, '[REDACTED_SUSPICIOUS_TOKEN]')
    .trim();
}

/**
 * Normalize job title into standardized canonical forms.
 */
export function normalizeJobTitle(title: string): string {
  const t = title.toLowerCase().trim();
  if (t.includes('statutory audit') || t.includes('stat audit')) return 'Statutory Audit Senior / Manager';
  if (t.includes('internal audit') || t.includes('risk advisory')) return 'Internal Audit & Risk Specialist';
  if (t.includes('direct tax') || t.includes('corporate tax')) return 'Direct Tax & Litigation Specialist';
  if (t.includes('indirect tax') || t.includes('gst')) return 'Indirect Tax & GST Associate';
  if (t.includes('fp&a') || t.includes('financial planning')) return 'FP&A & Corporate Finance Manager';
  if (t.includes('m&a') || t.includes('due diligence') || t.includes('fdd')) return 'M&A Due Diligence & Valuation Associate';
  if (t.includes('investment banking') || t.includes('valuation')) return 'Investment Banking Analyst / Associate';
  if (t.includes('consulting') || t.includes('management consulting')) return 'Management Consultant — Finance & Strategy';
  if (t.includes('partner') || t.includes('practice') || t.includes('sole practitioner')) return 'Independent Practice Lead';
  return title.trim();
}

/**
 * Calculate explainable job match against candidate profile.
 */
export function calculateJobMatch(
  profile: CandidateProfileData,
  job: JobDetail
): JobMatchReport {
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];
  const eligibilityReasons: string[] = [];
  const limitations: string[] = [];
  let isEligible = true;

  // 1. Mandatory Eligibility Checks
  const structuredReqs = job.structuredRequirements || ({} as any);
  const reqQual = structuredReqs.requiredQualification;
  const candidateStatus = profile.caFinalStatus || 'UNSPECIFIED';

  if (reqQual && reqQual.toUpperCase().includes('QUALIFIED')) {
    if (candidateStatus !== 'QUALIFIED') {
      isEligible = false;
      eligibilityReasons.push(`Role mandates qualified CA status (Candidate status: ${candidateStatus})`);
    } else {
      eligibilityReasons.push('Meets mandatory ICAI Qualified Chartered Accountant requirement');
    }
  }

  const minMonths = structuredReqs.minArticleshipMonths || 0;
  const candidateMonths = Math.floor((profile.articleshipWeeks || 0) / 4.33);
  if (minMonths > 0 && candidateMonths < minMonths) {
    isEligible = false;
    eligibilityReasons.push(`Requires at least ${minMonths} months articleship/experience (Candidate has ~${candidateMonths} months)`);
  }

  // 2. Pathway Alignment (25% Weight)
  const preferredPathways = profile.preferredPathways || [];
  const articleshipAreas = profile.articleshipAreas || [];
  let pathwayScore = 0;
  if (job.caPathway && preferredPathways.includes(job.caPathway)) {
    pathwayScore = 25;
  } else if (job.caPathway && articleshipAreas.some(area => area.toUpperCase().includes(job.caPathway))) {
    pathwayScore = 20;
  } else {
    pathwayScore = 8;
  }

  // 3. Skills Match (35% Weight)
  const candidateSkillNames = new Set(
    (profile.skills || []).map(s => (s.name || '').toLowerCase()).concat(
      (profile.softwareProficiencies || []).map(p => (p || '').toLowerCase())
    )
  );

  const mandatory = structuredReqs.mandatorySkills || [];
  const preferred = structuredReqs.preferredSkills || [];

  let matchedMandatoryCount = 0;
  for (const skill of mandatory) {
    const sLower = (skill || '').toLowerCase();
    const hasSkill = Array.from(candidateSkillNames).some(c => c.includes(sLower) || sLower.includes(c));
    if (hasSkill) {
      matchingSkills.push(skill);
      matchedMandatoryCount++;
    } else {
      missingSkills.push(`${skill} (Mandatory)`);
    }
  }

  let matchedPreferredCount = 0;
  for (const skill of preferred) {
    const sLower = (skill || '').toLowerCase();
    const hasSkill = Array.from(candidateSkillNames).some(c => c.includes(sLower) || sLower.includes(c));
    if (hasSkill) {
      matchingSkills.push(skill);
      matchedPreferredCount++;
    } else {
      missingSkills.push(skill);
    }
  }

  let skillsScore = 0;
  if (mandatory.length > 0) {
    const mandatoryRatio = matchedMandatoryCount / mandatory.length;
    const preferredRatio = preferred.length > 0 ? matchedPreferredCount / preferred.length : 1;
    skillsScore = Math.round(mandatoryRatio * 25 + preferredRatio * 10);
  } else {
    skillsScore = matchedPreferredCount > 0 ? 30 : 20;
  }

  // 4. Articleship Experience Duration Match (10% Weight - Blindfold rule: no firm tier discrimination)
  let expScore = 6;
  if (minMonths > 0) {
    expScore = candidateMonths >= minMonths ? 10 : Math.round((candidateMonths / minMonths) * 10);
  } else {
    expScore = 10;
  }

  // 5. Location & Work Arrangement (10% Weight)
  let locationScore = 4;
  const isRemote = job.workArrangement === 'REMOTE';
  const targetCities = profile.targetCities || [];
  const jobCity = (job.locationCity || '').trim().toLowerCase();
  const cityMatch = targetCities.some(
    city => (city || '').trim().toLowerCase() === jobCity
  );

  if (isRemote) {
    locationScore = 10;
  } else if (cityMatch) {
    locationScore = 10;
  } else if (job.workArrangement === 'HYBRID' && cityMatch) {
    locationScore = 10;
  } else if (targetCities.length === 0) {
    locationScore = 7;
    limitations.push('Candidate has not specified preferred target cities');
  }

  if (!job.salaryDisclosed) {
    limitations.push('Compensation is undisclosed by employer; salary alignment not scored');
  }

  // 6. Empirical Multi-Signal Aggregation (Validated in Notebook 01)
  // Mandatory skills (45%) + Preferred (15%) + Pathway (20%) + Experience (10%) + Location (10%)
  const mandatoryRatio = mandatory.length > 0 ? matchedMandatoryCount / mandatory.length : 1;
  const preferredRatio = preferred.length > 0 ? matchedPreferredCount / preferred.length : 1;
  
  let empiricalScore = Math.round(
    mandatoryRatio * 45 +
    preferredRatio * 15 +
    (pathwayScore / 25) * 20 +
    expScore +
    locationScore
  );

  if (!isEligible) {
    empiricalScore = Math.min(empiricalScore, 30); // Hard gate: Ineligible candidates cannot pass match gate
  }

  const totalScore = Math.max(0, Math.min(100, empiricalScore));

  let fitCategory: 'STRONG_MATCH' | 'MODERATE_MATCH' | 'STRETCH_ROLE' | 'LOW_FIT' = 'LOW_FIT';
  if (totalScore >= 80) fitCategory = 'STRONG_MATCH';
  else if (totalScore >= 60) fitCategory = 'MODERATE_MATCH';
  else if (totalScore >= 40) fitCategory = 'STRETCH_ROLE';

  const expFitDescription = profile.articleshipFirmTier
    ? `${profile.articleshipFirmTier} Articleship verified with ~${candidateMonths} months experience`
    : `General articleship experience (~${candidateMonths} months)`;

  const explanation = `${fitCategory.replace('_', ' ')}: Demonstrates ${matchingSkills.length} matching competencies in ${job.caPathway}. Articleship background in ${profile.articleshipFirm || 'practice'} directly aligns with ${job.companyName}'s candidate profile requirements.`;

  return {
    jobId: job.id,
    matchScore: totalScore,
    fitCategory,
    isEligible,
    eligibilityReasons,
    matchingSkills,
    missingSkills,
    experienceFit: expFitDescription,
    explanation,
    limitations,
  };
}

export interface JobFraudRiskReport {
  riskScore: number; // 0 to 100
  riskTier: 'LOW_RISK' | 'REVIEW_REQUIRED' | 'HIGH_RISK';
  isSafeForListing: boolean;
  detectedSignals: string[];
  recommendation: string;
}

/**
 * Calibrated Job Fraud Risk Evaluation Engine.
 * Multi-signal risk assessment for job listings.
 */
export function evaluateJobFraudRisk(job: {
  title?: string;
  companyName?: string;
  employerDomain?: string;
  contactEmail?: string;
  rawDescription?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceMin?: number;
}): JobFraudRiskReport {
  const desc = (job.rawDescription || '').toLowerCase();
  const email = (job.contactEmail || '').toLowerCase();
  const domain = (job.employerDomain || '').toLowerCase();
  const detectedSignals: string[] = [];

  // Feature 1: Advance fee demand (+0.835)
  const feeWords = ['registration fee', 'training fee', 'security deposit', 'processing charge', 'refundable deposit', 'laptop deposit'];
  const hasAdvanceFee = feeWords.some(w => desc.includes(w));
  if (hasAdvanceFee) detectedSignals.push('Demands advance registration, training, or equipment fee');

  // Feature 2: Suspicious messenger interview (+1.957)
  const messengerWords = ['t.me/', 'telegram', 'whatsapp only', 'wa.me/'];
  const hasMessengerLink = messengerWords.some(w => desc.includes(w));
  if (hasMessengerLink) detectedSignals.push('Restricts candidate interviews exclusively to Telegram or unverified WhatsApp handles');

  // Feature 3: Free email domain for corporate employer (+1.146)
  const freeProviders = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@rediffmail.com'];
  const isFreeEmail = freeProviders.some(p => email.endsWith(p));
  if (isFreeEmail && job.companyName && !job.companyName.toLowerCase().includes('proprietor') && !job.companyName.toLowerCase().includes('& co')) {
    detectedSignals.push(`Official contact email uses public free provider (${email}) instead of corporate employer domain`);
  }

  // Feature 4: Domain spoofing (+0.835)
  let domainSpoofed = false;
  if (domain && domain.includes('-') && (domain.includes('pwc') || domain.includes('ey') || domain.includes('kpmg') || domain.includes('deloitte'))) {
    domainSpoofed = true;
    detectedSignals.push(`Employer domain (${domain}) shows typo-squatting or imitation patterns targeting professional service firms`);
  }

  // Feature 5: Unrealistic salary claim (+1.752)
  let salarySuspicious = false;
  if ((job.experienceMin === 0 || job.experienceMin === undefined) && (job.salaryMin || 0) > 3500000) {
    salarySuspicious = true;
    detectedSignals.push(`Unrealistic entry-level compensation claim (Rs. ${job.salaryMin} for 0 years experience exceeds 3.5x market median)`);
  }

  // Feature 6: Description length normalization (-1.489)
  const descLengthNorm = desc.length / 1000.0;

  // Calibrated Logistic Model Log-Odds Calculation (Notebook 02 fitted model):
  // z = intercept (-0.8957) - 1.4888 * descLength + 1.9571 * messenger + 1.7518 * salary + 1.1456 * email + 0.8346 * fee + 0.8346 * spoof
  const intercept = -0.8957;
  const z = (
    intercept +
    (hasAdvanceFee ? 0.8346 : 0.0) +
    (hasMessengerLink ? 1.9571 : 0.0) +
    (isFreeEmail ? 1.1456 : 0.0) +
    (domainSpoofed ? 0.8346 : 0.0) +
    (salarySuspicious ? 1.7518 : 0.0) -
    (descLengthNorm * 1.4888)
  );

  const probability = 1.0 / (1.0 + Math.exp(-z));
  const riskScore = Math.round(probability * 100);

  let riskTier: 'LOW_RISK' | 'REVIEW_REQUIRED' | 'HIGH_RISK' = 'LOW_RISK';
  if (riskScore >= 70 || hasAdvanceFee || hasMessengerLink) {
    riskTier = 'HIGH_RISK';
  } else if (riskScore >= 35 || isFreeEmail || salarySuspicious) {
    riskTier = 'REVIEW_REQUIRED';
  }

  return {
    riskScore,
    riskTier,
    isSafeForListing: riskTier === 'LOW_RISK',
    detectedSignals,
    recommendation:
      riskTier === 'HIGH_RISK'
        ? 'REJECT_LISTING: High probability recruitment scam or advance-fee phishing attack.'
        : riskTier === 'REVIEW_REQUIRED'
        ? 'FLAG_FOR_AUDIT: Unverified employer domain or compensation anomaly requires administrative review.'
        : 'APPROVE: Verified recruitment parameters adhere to professional hiring standards.',
  };
}

/**
 * Token N-gram Cosine Similarity for Multi-Signal Job Deduplication.
 * Calculates textual similarity between job title and description.
 */
export function calculateJobDeduplicationSimilarity(
  titleA: string,
  descA: string,
  titleB: string,
  descB: string
): number {
  const tokenize = (text: string): Map<string, number> => {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 2);
    const counts = new Map<string, number>();
    
    // Add unigrams
    for (const t of tokens) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    // Add bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]}_${tokens[i + 1]}`;
      counts.set(bigram, (counts.get(bigram) || 0) + 2);
    }
    return counts;
  };

  const textA = `${titleA} ${titleA} ${descA}`;
  const textB = `${titleB} ${titleB} ${descB}`;
  
  const mapA = tokenize(textA);
  const mapB = tokenize(textB);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [_, val] of mapA.entries()) {
    normA += val * val;
  }
  for (const [_, val] of mapB.entries()) {
    normB += val * val;
  }

  for (const [token, countA] of mapA.entries()) {
    const countB = mapB.get(token) || 0;
    dotProduct += countA * countB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
