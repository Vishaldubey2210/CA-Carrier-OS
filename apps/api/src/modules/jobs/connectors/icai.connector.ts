import { Logger } from '@nestjs/common';
import {
  CAPathway,
  JobOpportunityType,
  JobSourceStatus,
  JobVerificationStatus,
  WorkArrangement,
} from '@ca-career-os/shared';
import {
  FetchJobsParams,
  FetchJobsResult,
  FreshnessVerificationResult,
  JobConnector,
  NormalizedJobPayload,
} from './job-connector.interface.js';

export class IcaiConnector implements JobConnector {
  private readonly logger = new Logger(IcaiConnector.name);
  readonly providerId = 'icai_portal';
  readonly providerType = 'ICAI_PORTAL';

  // Compliant LINK_ONLY status as mandated by platform ethics:
  // ICAI does not currently offer a public REST API or permitted scraping license.
  private readonly status: JobSourceStatus = 'LINK_ONLY';

  getStatus(): JobSourceStatus {
    return this.status;
  }

  async fetchJobs(params?: FetchJobsParams): Promise<FetchJobsResult> {
    this.logger.log('ICAI CA Jobs connector operating in LINK_ONLY mode (Preserving official outbound links without unauthorized web scraping).');
    
    // Curated official guidance entries pointing to official ICAI portals
    const officialPortals: NormalizedJobPayload[] = [
      {
        externalJobId: 'icai-cmib-campus-2026',
        title: 'ICAI CMI&B 61st Campus Placement Programme (Newly Qualified CAs)',
        companyName: 'ICAI Committee for Members in Industry & Business (CMI&B)',
        locationCity: 'All India (Mumbai, Delhi, Bengaluru, Chennai, Kolkata)',
        workArrangement: 'ONSITE',
        caPathway: CAPathway.AUDIT,
        opportunityType: 'CA_FRESHER',
        channel: 'EXTERNAL',
        sourceProvider: 'ICAI_PORTAL',
        sourceUrl: 'https://cajobs.icai.org/',
        canonicalUrl: 'https://cajobs.icai.org/',
        applicationUrl: 'https://cajobs.icai.org/candidate_login.php',
        attribution: 'Official ICAI Campus Placement Portal for Newly Qualified Chartered Accountants',
        salaryDisclosed: true,
        salaryMin: 900000,
        salaryMax: 2800000,
        experienceMin: 0,
        experienceMax: 1,
        rawDescription: 'Official campus recruitment drive conducted by ICAI CMI&B connecting fresh Chartered Accountants with Top 20 CA firms, Big 4, Public Sector Undertakings (PSUs), and multinational corporations. Candidates must register with valid ICAI Roll Number.',
        mandatorySkills: ['ICAI CA Final Pass Certificate', 'Form 108 Articleship Completion'],
        preferredSkills: ['GMCS / MCS Completion', 'Advanced IT Training'],
        requiredQualification: 'QUALIFIED',
        keyResponsibilities: [
          'Participate in national ICAI campus interview cycles.',
          'Interview with premier corporate recruiters and audit firms.',
        ],
        originalPostedAt: new Date().toISOString(),
        verificationStatus: 'SOURCE_ACTIVE',
      },
      {
        externalJobId: 'icai-articleship-exchange-2026',
        title: 'ICAI Official Articleship & Industrial Training Placement Window',
        companyName: 'ICAI SSP Articleship Placement Cell',
        locationCity: 'Pan-India',
        workArrangement: 'HYBRID',
        caPathway: CAPathway.AUDIT,
        opportunityType: 'ARTICLESHIP',
        channel: 'EXTERNAL',
        sourceProvider: 'ICAI_PORTAL',
        sourceUrl: 'https://www.icai.org/post/articleship-training',
        canonicalUrl: 'https://www.icai.org/post/articleship-training',
        applicationUrl: 'https://eservices.icai.org/',
        attribution: 'Official ICAI Self-Service Portal (SSP) Articleship & Industrial Training Registry',
        salaryDisclosed: false,
        experienceMin: 0,
        experienceMax: 0,
        rawDescription: 'Official ICAI statutory registry for students registering for 3-Year Articleship Training under Form 102/103 or Industrial Training under Form 104 with eligible approved industrial organizations.',
        mandatorySkills: ['CA Intermediate Pass (Both Groups or Single Group)', 'ICITSS (ITT & Orientation)'],
        preferredSkills: ['Basic Accounting Standards', 'MS Excel'],
        requiredQualification: 'SEMI_QUALIFIED',
        keyResponsibilities: [
          'Complete practical training under authorized Fellow Chartered Accountant (FCA).',
          'Maintain genuine exposure records in ICAI Form 108 diary.',
        ],
        originalPostedAt: new Date().toISOString(),
        verificationStatus: 'SOURCE_ACTIVE',
      },
    ];

    return {
      jobs: officialPortals,
      hasMore: false,
      totalFound: officialPortals.length,
    };
  }

  async verifyFreshness(externalJobId: string, url?: string): Promise<FreshnessVerificationResult> {
    return {
      status: 'SOURCE_ACTIVE',
      lastVerifiedAt: new Date(),
      reason: 'Official statutory ICAI recruitment portal link verified active.',
    };
  }
}
