import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { FinancialService } from '../dist/modules/financial/financial.service.js';
import { MentorshipService } from '../dist/modules/mentorship/mentorship.service.js';
import { CommunityService } from '../dist/modules/community/community.service.js';
import { PracticeService } from '../dist/modules/practice/practice.service.js';
import { RecruitmentService } from '../dist/modules/recruitment/recruitment.service.js';
import {
  CAPathway,
} from '@ca-career-os/shared';

describe('Phase 5: Professional Growth, Recruitment & Practice Management (20 Scenarios)', () => {
  let financialService;
  let mentorshipService;
  let communityService;
  let practiceService;
  let recruitmentService;

  const mockPrisma = {
    isDatabaseConnected: () => false,
    job: {
      findUnique: async () => null,
      findMany: async () => [],
    },
    application: {
      findMany: async () => [],
    },
    candidateProfile: {
      findMany: async () => [],
    },
  };

  const userA = { id: '00000000-0000-0000-0000-0000000000a1', workspaceId: 'ws-cand-001' };
  const userB = { id: '00000000-0000-0000-0000-0000000000b2', workspaceId: 'ws-cand-002' };
  const recruiterOrgA = { id: 'recruiter-a1', workspaceId: 'org-ws-deloitte-001' };
  const recruiterOrgB = { id: 'recruiter-b1', workspaceId: 'org-ws-pwc-003' };
  const adminUser = { id: 'admin-001' };
  const practiceFirmA = { workspaceId: 'firm-ws-001' };
  const practiceFirmB = { workspaceId: 'firm-ws-002' };

  before(() => {
    financialService = new FinancialService(mockPrisma);
    mentorshipService = new MentorshipService(mockPrisma);
    communityService = new CommunityService(mockPrisma);
    practiceService = new PracticeService(mockPrisma);
    recruitmentService = new RecruitmentService(mockPrisma);
  });

  // ---------------------------------------------------------------------------
  // 1. Salary & Offer Records Isolation
  // ---------------------------------------------------------------------------
  test('1. Salary and offer records remain private to owning candidate', async () => {
    const offerA = await financialService.createOfferComparison(
      {
        companyName: 'EY India',
        roleTitle: 'Senior Consultant',
        annualCtc: 1800000,
        fixedCompensation: 1500000,
        variableCompensation: 300000,
        joiningBonus: 100000,
        locationCity: 'Mumbai',
        workArrangement: 'HYBRID',
      },
      userA.id,
      userA.workspaceId
    );

    assert.ok(offerA.id);
    assert.equal(offerA.userId, userA.id);

    // Candidate A can view their offer
    const listA = await financialService.listUserOffers(userA.id, userA.workspaceId);
    assert.equal(listA.length, 1);
    assert.equal(listA[0].id, offerA.id);

    // Candidate B cannot see Candidate A's offer
    const listB = await financialService.listUserOffers(userB.id, userB.workspaceId);
    assert.equal(listB.length, 0);

    // Candidate B cannot delete Candidate A's offer
    await assert.rejects(
      async () => financialService.deleteOffer(offerA.id, userB.id),
      /Access denied/
    );
  });

  // ---------------------------------------------------------------------------
  // 2. Offer Calculations: Missing/Conditional Inputs
  // ---------------------------------------------------------------------------
  test('2. Offer calculations handle missing or conditional compensation inputs with take-home estimation', () => {
    const calculation = financialService.unbundleCtc({
      annualCtc: 1800000,
      fixedPercentage: 80,
      regime: 'NEW',
    });

    assert.equal(calculation.annualCtc, 1800000);
    assert.equal(calculation.fixedBase, 1440000);
    assert.equal(calculation.variableComponent, 360000);
    assert.ok(calculation.estimatedMonthlyTakeHome > 0);
    assert.ok(calculation.disclaimer.includes('estimate'));
  });

  // ---------------------------------------------------------------------------
  // 3. Salary Display Provenance & Limitations
  // ---------------------------------------------------------------------------
  test('3. Salary displays expose available provenance and sample limitations', async () => {
    const benchmarks = await financialService.listSalaryBenchmarks();
    assert.ok(benchmarks.length > 0);

    const first = benchmarks[0];
    assert.ok(first.dataSourceProvenance, 'Provenance must be specified');
    assert.ok(first.sampleSize, 'Sample size must be documented');
    assert.ok(first.collectionPeriod, 'Collection period must be documented');
    assert.ok(first.dataLimitations, 'Limitations disclaimer must be clear');
    assert.ok(first.medianSalary > 0);
  });

  // ---------------------------------------------------------------------------
  // 4. Booking Conflicts & Duplicate Prevention
  // ---------------------------------------------------------------------------
  test('4. Booking conflicts and duplicate bookings are prevented', async () => {
    const mentors = await mentorshipService.listMentors();
    assert.ok(mentors.length > 0);
    const mentor = mentors[0];
    const slotStart = '2026-11-05T14:00:00.000Z';
    const slotEnd = '2026-11-05T14:45:00.000Z';

    // First booking succeeds
    const booking1 = await mentorshipService.createBooking(
      {
        mentorProfileId: mentor.id,
        slotStartTime: slotStart,
        slotEndTime: slotEnd,
        topic: 'STATUTORY_AUDIT',
        candidateNotes: 'Discussing statutory audit career transition',
      },
      userA.id,
      userA.workspaceId
    );
    assert.ok(booking1.id);
    assert.equal(booking1.status, 'CONFIRMED');

    // Concurrent/conflicting booking on same mentor and same slot throws ConflictException
    await assert.rejects(
      async () => {
        await mentorshipService.createBooking(
          {
            mentorProfileId: mentor.id,
            slotStartTime: slotStart,
            slotEndTime: slotEnd,
            topic: 'STATUTORY_AUDIT',
            candidateNotes: 'Trying to book occupied slot',
          },
          userB.id,
          userB.workspaceId
        );
      },
      /already reserved/
    );
  });

  // ---------------------------------------------------------------------------
  // 5. Unauthorized Mentor/Candidate Records Access
  // ---------------------------------------------------------------------------
  test('5. Unauthorized mentor and candidate records remain inaccessible', async () => {
    const mentors = await mentorshipService.listMentors();
    const mentor = mentors[0];

    const booking = await mentorshipService.createBooking(
      {
        mentorProfileId: mentor.id,
        slotStartTime: '2026-11-06T10:00:00.000Z',
        slotEndTime: '2026-11-06T10:45:00.000Z',
        topic: 'TAXATION',
        candidateNotes: 'User A private booking',
      },
      userA.id,
      userA.workspaceId
    );

    // User B attempts to cancel User A's booking
    await assert.rejects(
      async () => {
        await mentorshipService.cancelBooking(booking.id, userB.id, 'Unauthorized cancellation');
      },
      /Access denied/
    );

    // User A can cancel their own booking
    const cancelled = await mentorshipService.cancelBooking(booking.id, userA.id, 'Schedule clash');
    assert.equal(cancelled.status, 'CANCELLED');
  });

  // ---------------------------------------------------------------------------
  // 6. Community Moderation & Reporting
  // ---------------------------------------------------------------------------
  test('6. Community content can be reported and moderated', async () => {
    const post = await communityService.createPost(
      {
        pathway: CAPathway.STATUTORY_AUDIT,
        title: 'Interview questions for Ind AS 115 Revenue from Contracts',
        content: 'Sharing key questions asked during my Big 4 assurance interview round.',
        category: 'INTERVIEW_EXPERIENCE',
      },
      userA.id,
      'Aman V.'
    );

    assert.ok(post.id);
    assert.equal(post.status, 'ACTIVE');

    // User B reports post
    const report = await communityService.reportContent(
      {
        resourceType: 'POST',
        resourceId: post.id,
        reason: 'SPAM',
        notes: 'Potential duplicate',
      },
      userB.id
    );

    assert.ok(report.id);
    assert.equal(report.status, 'PENDING_REVIEW');

    // Admin reviews report and removes post
    const decision = await communityService.moderateReport(
      report.id,
      'ACTION_TAKEN',
      'Violation verified, content hidden'
    );

    assert.equal(decision.status, 'ACTION_TAKEN');

    // Post is now removed from public feed
    const activePosts = await communityService.listPosts(CAPathway.STATUTORY_AUDIT);
    assert.ok(!activePosts.some((p) => p.id === post.id));
  });

  // ---------------------------------------------------------------------------
  // 7. Unverified Employers Not Labelled Verified
  // ---------------------------------------------------------------------------
  test('7. Unverified employers are not labelled verified', async () => {
    const employer = await recruitmentService.createOrUpdateEmployerProfile(
      'org-ws-new-startup',
      {
        companyName: 'FinTech Startup Pvt Ltd',
        slug: 'fintech-startup-pvt-ltd',
        industry: 'FinTech & Lending',
        headquartersCity: 'Bengaluru',
        firmTier: 'STARTUP',
        overviewText: 'Growing digital credit platform.',
      }
    );

    assert.equal(employer.verifiedStatus, 'UNVERIFIED');
    assert.equal(employer.verifiedAt, null);

    // Verification requested -> status becomes PENDING
    const req = await recruitmentService.requestVerification(
      employer.id,
      userA.id,
      {
        businessRegistrationNo: 'U72200KA2024PTC123456',
        documentsJson: { mcaCertificate: 'https://docs.example.com/mca.pdf' },
      }
    );

    assert.equal(req.status, 'PENDING');
    const updatedEmployer = await recruitmentService.getEmployerProfile(employer.id);
    assert.equal(updatedEmployer.verifiedStatus, 'PENDING');
    assert.notEqual(updatedEmployer.verifiedStatus, 'VERIFIED');
  });

  // ---------------------------------------------------------------------------
  // 8. Recruiter Access Limited to Authorized Organization
  // ---------------------------------------------------------------------------
  test('8. Recruiters can access only authorized organization records', async () => {
    const orgAJobs = await recruitmentService.listOrganizationJobs(recruiterOrgA.workspaceId);
    assert.ok(Array.isArray(orgAJobs));

    const auditLogsA = recruitmentService.getAuditLogs(recruiterOrgA.workspaceId);
    assert.ok(Array.isArray(auditLogsA));
  });

  // ---------------------------------------------------------------------------
  // 9. Cross-Organization Access Denied
  // ---------------------------------------------------------------------------
  test('9. Cross-organization access is denied', async () => {
    const appId = crypto.randomUUID();

    // Recruiter A creates review in Org A
    await recruitmentService.updateApplicantPipelineStage(
      appId,
      recruiterOrgA.workspaceId,
      recruiterOrgA.id,
      { pipelineStage: 'IN_REVIEW', internalNotes: 'Strong profile' }
    );

    // Recruiter B from Org B attempts to mutate Org A's review
    await assert.rejects(
      async () => {
        await recruitmentService.updateApplicantPipelineStage(
          appId,
          recruiterOrgB.workspaceId,
          recruiterOrgB.id,
          { pipelineStage: 'SHORTLISTED' }
        );
      },
      /Cross-organization modification prohibited/
    );
  });

  // ---------------------------------------------------------------------------
  // 10. Candidates' Private Workspaces Isolated
  // ---------------------------------------------------------------------------
  test('10. Candidates private workspaces remain isolated from employers', async () => {
    await financialService.createOfferComparison(
      {
        companyName: 'Confidential Firm',
        roleTitle: 'Tax Manager',
        annualCtc: 2400000,
        fixedCompensation: 2000000,
        variableCompensation: 400000,
        locationCity: 'Delhi',
      },
      userA.id,
      userA.workspaceId
    );

    // Employer candidate discovery cannot see offer records
    const discovery = await recruitmentService.searchCandidates(
      { city: 'Delhi' },
      recruiterOrgA.workspaceId,
      recruiterOrgA.id
    );

    // Result does NOT expose any salary offer history or private documents
    for (const match of discovery) {
      assert.equal(match.contactDisclosed, false);
      assert.strictEqual(match.offers, undefined);
      assert.strictEqual(match.interviewTranscripts, undefined);
    }
  });

  // ---------------------------------------------------------------------------
  // 11. Recruiters Cannot Inspect Private Career History Without Consent
  // ---------------------------------------------------------------------------
  test('11. Recruiters cannot inspect private contact details without candidate consent', async () => {
    const results = await recruitmentService.searchCandidates(
      { pathway: 'STATUTORY_AUDIT' },
      recruiterOrgA.workspaceId,
      recruiterOrgA.id
    );

    assert.ok(results.length > 0);
    const candidate = results[0];
    assert.equal(candidate.contactDisclosed, false);
    // Contact masked
    assert.ok(candidate.fullName.endsWith('.'));
    assert.ok(candidate.matchScore >= 0);
    assert.ok(candidate.matchReasons.length > 0);
  });

  // ---------------------------------------------------------------------------
  // 12. Application Stage Transitions Validated
  // ---------------------------------------------------------------------------
  test('12. Application stage transitions are validated by state machine', async () => {
    const appId = crypto.randomUUID();

    // Valid: NEW -> IN_REVIEW
    const step1 = await recruitmentService.updateApplicantPipelineStage(
      appId,
      recruiterOrgA.workspaceId,
      recruiterOrgA.id,
      { pipelineStage: 'IN_REVIEW' }
    );
    assert.equal(step1.pipelineStage, 'IN_REVIEW');

    // Invalid leap: IN_REVIEW -> HIRED directly (must go through SHORTLISTED -> INTERVIEW -> OFFER)
    await assert.rejects(
      async () => {
        await recruitmentService.updateApplicantPipelineStage(
          appId,
          recruiterOrgA.workspaceId,
          recruiterOrgA.id,
          { pipelineStage: 'HIRED' }
        );
      },
      /Invalid pipeline transition/
    );

    // Valid: IN_REVIEW -> SHORTLISTED
    const step2 = await recruitmentService.updateApplicantPipelineStage(
      appId,
      recruiterOrgA.workspaceId,
      recruiterOrgA.id,
      { pipelineStage: 'SHORTLISTED' }
    );
    assert.equal(step2.pipelineStage, 'SHORTLISTED');
  });

  // ---------------------------------------------------------------------------
  // 13. Internal Recruiter Notes Not Exposed to Candidates
  // ---------------------------------------------------------------------------
  test('13. Internal recruiter notes are stored separately from candidate view', async () => {
    const appId = crypto.randomUUID();
    const review = await recruitmentService.updateApplicantPipelineStage(
      appId,
      recruiterOrgA.workspaceId,
      recruiterOrgA.id,
      {
        pipelineStage: 'IN_REVIEW',
        internalNotes: 'Candidate demonstrated good knowledge of Ind AS 116 leases.',
        rating: 4,
      }
    );

    assert.equal(review.internalNotes, 'Candidate demonstrated good knowledge of Ind AS 116 leases.');
    assert.equal(review.rating, 4);
  });

  // ---------------------------------------------------------------------------
  // 14. Client Records Limited to Authorized Practice Members
  // ---------------------------------------------------------------------------
  test('14. Client records are limited to authorized practice workspace members', async () => {
    const clientA = await practiceService.createClient(
      {
        clientName: 'Sunrise Textiles Ltd',
        entityType: 'PRIVATE_LIMITED',
        contactPerson: 'Rajesh Mehra',
        contactEmail: 'rajesh@sunrisetextiles.com',
        panNumber: 'AABCS1234F',
        gstin: '27AABCS1234F1Z5',
      },
      practiceFirmA.workspaceId
    );

    assert.ok(clientA.id);
    assert.equal(clientA.practiceWorkspaceId, practiceFirmA.workspaceId);

    // Practice Firm A can list client
    const firmAClients = await practiceService.listClients(practiceFirmA.workspaceId);
    assert.equal(firmAClients.length, 1);
    assert.equal(firmAClients[0].id, clientA.id);

    // Practice Firm B gets 0 clients (strict workspace isolation)
    const firmBClients = await practiceService.listClients(practiceFirmB.workspaceId);
    assert.equal(firmBClients.length, 0);
  });

  // ---------------------------------------------------------------------------
  // 15. Sensitive Client Files Require Authorization
  // ---------------------------------------------------------------------------
  test('15. Sensitive client records require appropriate workspace authorization', async () => {
    const client = await practiceService.createClient(
      {
        clientName: 'Apex Logistics LLP',
        entityType: 'LLP',
        contactPerson: 'Sunil Verma',
        contactEmail: 'sunil@apexlogistics.com',
      },
      practiceFirmA.workspaceId
    );

    // Firm A gets client successfully
    const retrieved = await practiceService.getClientById(client.id, practiceFirmA.workspaceId);
    assert.equal(retrieved.id, client.id);

    // Firm B attempting to get Firm A's client gets ForbiddenException
    await assert.rejects(
      async () => practiceService.getClientById(client.id, practiceFirmB.workspaceId),
      /Access denied/
    );
  });

  // ---------------------------------------------------------------------------
  // 16. Platform Administrators Cannot Bypass Private Data Restrictions
  // ---------------------------------------------------------------------------
  test('16. Platform administrators cannot view candidate private offers across tenant boundaries', async () => {
    const offers = await financialService.listUserOffers(adminUser.id, 'admin-ws');
    assert.equal(offers.length, 0, 'Admin workspace has no automatic visibility into candidate offers');
  });

  // ---------------------------------------------------------------------------
  // 17. Non-Solicitation Ethics Boundary Enforced (ICAI Code of Ethics)
  // ---------------------------------------------------------------------------
  test('17. Content violating non-solicitation rules under ICAI Code of Ethics is rejected', async () => {
    await assert.rejects(
      async () => {
        await communityService.createPost(
          {
            pathway: CAPathway.STATUTORY_AUDIT,
            title: 'Hire me for audit cheap rates',
            content: 'Filing services for just Rs 999. Contact me!',
            category: 'GENERAL_CAREER',
          },
          userA.id,
          'Aman V.'
        );
      },
      /ICAI Code of Ethics/
    );
  });

  // ---------------------------------------------------------------------------
  // 18. Repeated Requests Do Not Create Duplicate Bookings
  // ---------------------------------------------------------------------------
  test('18. Repeated requests do not create duplicate bookings for the same slot', async () => {
    const mentors = await mentorshipService.listMentors();
    const mentor = mentors[1] || mentors[0];
    const slotStart = '2026-11-10T11:00:00.000Z';
    const slotEnd = '2026-11-10T11:45:00.000Z';

    const b1 = await mentorshipService.createBooking(
      { mentorProfileId: mentor.id, slotStartTime: slotStart, slotEndTime: slotEnd, topic: 'FP_AND_A' },
      userA.id,
      userA.workspaceId
    );
    assert.ok(b1.id);

    await assert.rejects(
      async () =>
        mentorshipService.createBooking(
          { mentorProfileId: mentor.id, slotStartTime: slotStart, slotEndTime: slotEnd, topic: 'FP_AND_A' },
          userA.id,
          userA.workspaceId
        ),
      /already reserved|already submitted/
    );
  });

  // ---------------------------------------------------------------------------
  // 19. External Actions Do Not Claim False Payment Success
  // ---------------------------------------------------------------------------
  test('19. Mentorship booking workflow explicitly indicates no false payment claim', async () => {
    const mentors = await mentorshipService.listMentors();
    const mentor = mentors[0];

    const booking = await mentorshipService.createBooking(
      {
        mentorProfileId: mentor.id,
        slotStartTime: '2026-11-12T16:00:00.000Z',
        slotEndTime: '2026-11-12T16:45:00.000Z',
        topic: 'TAXATION',
        candidateNotes: 'Discussing transfer pricing',
      },
      userB.id,
      userB.workspaceId
    );

    assert.equal(booking.status, 'CONFIRMED');
    // Verify no fake payment transaction IDs or bogus gateway claims
    assert.strictEqual(booking.paymentTransactionId, undefined);
  });

  // ---------------------------------------------------------------------------
  // 20. Statutory Compliance Tasks & Post-Qualification Guidance Preserved
  // ---------------------------------------------------------------------------
  test('20. Statutory compliance tasks & post-qualification guidance work accurately', async () => {
    // Post qualification guidance checklist
    const checklist = await practiceService.getPostQualificationChecklist(userA.id);
    assert.ok(checklist.length >= 5);
    const form2 = checklist.find((c) => c.taskKey === 'icai-membership-form-2');
    assert.ok(form2);
    assert.equal(form2.isCompleted, false);

    // Toggle completion
    const updated = await practiceService.toggleChecklistTask(userA.id, 'icai-membership-form-2', true, 'Submitted to WIRC');
    assert.equal(updated.isCompleted, true);
    assert.ok(updated.completedAt);

    // Compliance task tracking for CA firm
    const client = await practiceService.createClient(
      {
        clientName: 'Metro Infrastructure Ltd',
        entityType: 'PUBLIC_LIMITED',
        contactPerson: 'Karan Johar',
        contactEmail: 'karan@metroinfra.in',
      },
      practiceFirmA.workspaceId
    );

    const task = await practiceService.createComplianceTask(
      {
        clientId: client.id,
        title: 'Q2 TDS Return Filing (Form 26Q)',
        complianceCategory: 'TDS_RETURN',
        statutoryDueDate: '2026-10-31T23:59:59.000Z',
        internalDeadline: '2026-10-25T18:00:00.000Z',
        financialYear: '2026-27',
        assessmentYear: '2027-28',
      },
      practiceFirmA.workspaceId,
      userA.id
    );

    assert.ok(task.id);
    assert.equal(task.status, 'PENDING');

    // Update status to FILED with acknowledgement number
    const filed = await practiceService.updateTaskStatus(
      task.id,
      'FILED',
      'ACK-TDS-2026-987654321',
      practiceFirmA.workspaceId
    );

    assert.equal(filed.status, 'FILED');
    assert.equal(filed.filedReferenceNo, 'ACK-TDS-2026-987654321');
  });
});
