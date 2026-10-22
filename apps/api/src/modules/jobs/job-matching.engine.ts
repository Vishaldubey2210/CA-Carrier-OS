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
  const reqQual = job.structuredRequirements.requiredQualification;
  if (reqQual && reqQual.toUpperCase().includes('QUALIFIED')) {
    if (profile.caFinalStatus !== 'QUALIFIED') {
      isEligible = false;
      eligibilityReasons.push(`Role mandates qualified CA status (Candidate status: ${profile.caFinalStatus})`);
    } else {
      eligibilityReasons.push('Meets mandatory ICAI Qualified Chartered Accountant requirement');
    }
  }

  const minMonths = job.structuredRequirements.minArticleshipMonths || 0;
  const candidateMonths = Math.floor(profile.articleshipWeeks / 4.33);
  if (minMonths > 0 && candidateMonths < minMonths) {
    isEligible = false;
    eligibilityReasons.push(`Requires at least ${minMonths} months articleship/experience (Candidate has ~${candidateMonths} months)`);
  }

  // 2. Pathway Alignment (25% Weight)
  let pathwayScore = 0;
  if (profile.preferredPathways.includes(job.caPathway)) {
    pathwayScore = 25;
  } else if (profile.articleshipAreas.some(area => area.toUpperCase().includes(job.caPathway))) {
    pathwayScore = 20;
  } else {
    pathwayScore = 8;
  }

  // 3. Skills Match (35% Weight)
  const candidateSkillNames = new Set(
    (profile.skills || []).map(s => s.name.toLowerCase()).concat(
      (profile.softwareProficiencies || []).map(p => p.toLowerCase())
    )
  );

  const mandatory = job.structuredRequirements.mandatorySkills || [];
  const preferred = job.structuredRequirements.preferredSkills || [];

  let matchedMandatoryCount = 0;
  for (const skill of mandatory) {
    const sLower = skill.toLowerCase();
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
    const sLower = skill.toLowerCase();
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

  // 4. Articleship Firm Tier & Experience Match (25% Weight)
  let expScore = 15;
  const preferredTiers = (job.structuredRequirements.preferredFirmTiers || []).map(t => t.toUpperCase());
  if (profile.articleshipFirmTier && preferredTiers.includes(profile.articleshipFirmTier.toUpperCase())) {
    expScore = 25;
  } else if (profile.articleshipFirmTier === 'BIG4') {
    expScore = 23;
  } else if (profile.articleshipFirmTier === 'TOP10') {
    expScore = 20;
  }

  // 5. Location & Work Arrangement (15% Weight)
  let locationScore = 5;
  const isRemote = job.workArrangement === 'REMOTE';
  const cityMatch = (profile.targetCities || []).some(
    city => city.toLowerCase() === job.locationCity.toLowerCase()
  );

  if (isRemote) {
    locationScore = 15;
  } else if (cityMatch) {
    locationScore = 15;
  } else if (job.workArrangement === 'HYBRID' && cityMatch) {
    locationScore = 15;
  } else if (profile.targetCities.length === 0) {
    locationScore = 10;
    limitations.push('Candidate has not specified preferred target cities');
  }

  if (!job.salaryDisclosed) {
    limitations.push('Compensation is undisclosed by employer; salary alignment not scored');
  }

  // Aggregate Raw Score
  let totalScore = pathwayScore + skillsScore + expScore + locationScore;
  if (!isEligible) {
    totalScore = Math.min(totalScore, 48); // Cap score if mandatory eligibility conditions fail
  }

  totalScore = Math.max(0, Math.min(100, totalScore));

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
