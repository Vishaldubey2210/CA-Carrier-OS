import { PostQualificationChecklistItem } from '@ca-career-os/shared';

export const CURATED_POST_QUALIFICATION_ITEMS: Omit<PostQualificationChecklistItem, 'id' | 'userId' | 'isCompleted' | 'completedAt' | 'notes'>[] = [
  {
    category: 'ICAI_MEMBERSHIP_FORM_2',
    taskKey: 'icai-membership-form-2',
    title: 'Apply for ICAI Associate Membership (Form 2)',
    description:
      'Submit Form 2 via ICAI Self Service Portal (SSP) with passing certificates for CA Final (Both Groups), GMCS / MCS completion letter, and practical training completion confirmation.',
    officialPortalUrl: 'https://eservices.icai.org/EForms/configuredHtml/166/50014/login.html',
    lastVerifiedDate: '2025-02-01',
    dueDate: null,
  },
  {
    category: 'COP_FORM_6',
    taskKey: 'icai-cop-form-6',
    title: 'Certificate of Practice Application (Form 6)',
    description:
      'Required if intending to practice as a proprietor or partner in public practice. Distinguish between Full-Time COP (Rule 190) and Part-Time COP. Fee payable annually in April.',
    officialPortalUrl: 'https://eservices.icai.org',
    lastVerifiedDate: '2025-02-01',
    dueDate: null,
  },
  {
    category: 'CAMPUS_PLACEMENT_REGISTRATION',
    taskKey: 'icai-campus-placement',
    title: 'Register for ICAI National Campus Placement Program',
    description:
      'Mandatory registration window on the Committee for Members in Industry & Business (CMI&B) portal. Upload approved CV, select primary/secondary interview centers, and attend orientation sessions.',
    officialPortalUrl: 'https://cmib.icai.org',
    lastVerifiedDate: '2025-01-15',
    dueDate: null,
  },
  {
    category: 'CABF_BENEVOLENT_FUND',
    taskKey: 'icai-cabf-enrolment',
    title: 'Enrol in Chartered Accountants Benevolent Fund (CABF)',
    description:
      'Recommended life membership contribution providing financial assistance to CA members and dependent families in cases of medical distress or unforeseen bereavement.',
    officialPortalUrl: 'https://www.icai.org/post/chartered-accountants-benevolent-fund-cabf',
    lastVerifiedDate: '2025-01-10',
    dueDate: null,
  },
  {
    category: 'PRACTICE_PREPARATION',
    taskKey: 'cpe-credit-tracking-setup',
    title: 'Setup Mandatory Continuing Professional Education (CPE) Tracker',
    description:
      'Under ICAI CPE Advisory, members holding COP must earn at least 30-40 Structured/Unstructured CPE credit hours annually to maintain good standing.',
    officialPortalUrl: 'https://www.cpeicai.org',
    lastVerifiedDate: '2025-02-01',
    dueDate: null,
  },
];
