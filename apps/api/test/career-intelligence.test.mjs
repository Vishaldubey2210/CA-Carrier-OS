import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CareerService } from '../dist/modules/career/career.service.js';
import {
  calculateProfileCompletion,
  runCareerDiagnostic,
  generateRoadmapTasks,
  PATHWAY_REQUIREMENTS,
} from '../dist/modules/career/career-intelligence.engine.js';
import {
  CAPathway,
  UserRole,
  WorkspaceType,
} from '@ca-career-os/shared';

describe('Phase 2: Candidate Profile & Career Intelligence Test Suite', () => {
  const mockPrisma = {
    isDatabaseConnected: () => false,
  };

  const careerService = new CareerService(mockPrisma);

  const candidateId = 'usr-candidate-101';
  const workspaceId = 'ws-personal-101';

  test('1. Create and update candidate profile with articleship capability inventory', async () => {
    // 1. Initial profile fetch returns default structure
    const initial = await careerService.getProfile(candidateId, workspaceId);
    assert.equal(initial.userId, candidateId);
    assert.equal(initial.workspaceId, workspaceId);
    assert.equal(initial.caFinalStatus, 'QUALIFIED');

    // 2. Save complete profile with Big 4 articleship in Statutory Audit & IFC
    const saved = await careerService.saveProfile(candidateId, workspaceId, {
      icaiMembershipNo: 'ACA-601234',
      caFinalStatus: 'QUALIFIED',
      attemptsCount: 1,
      articleshipFirm: 'Deloitte Haskins & Sells',
      articleshipFirmTier: 'BIG4',
      articleshipWeeks: 156,
      articleshipAreas: ['STATUTORY_AUDIT', 'IFC_TESTING', 'CARO_2020'],
      skills: [
        { name: 'Ind AS / IFRS Standards', category: 'Accounting Standards', proficiency: 'ADVANCED', verified: true },
        { name: 'Standards on Auditing (SAs)', category: 'Auditing', proficiency: 'ADVANCED', verified: true },
        { name: 'Internal Financial Controls (IFC)', category: 'Controls', proficiency: 'INTERMEDIATE', verified: false },
      ],
      softwareProficiencies: ['AdvancedExcel', 'SAP_FICO', 'Alteryx'],
      preferredPathways: [CAPathway.AUDIT, CAPathway.CORP_FIN],
      targetCities: ['Mumbai', 'Bengaluru'],
      targetSalaryMin: 1400000,
      targetSalaryMax: 1800000,
      summary: 'Chartered Accountant with 3 years articleship experience in listed manufacturing and BFSI audits at Deloitte.',
    });

    assert.equal(saved.icaiMembershipNo, 'ACA-601234');
    assert.equal(saved.articleshipFirmTier, 'BIG4');
    assert.equal(saved.articleshipAreas.length, 3);
    assert.equal(saved.skills.length, 3);
    assert.ok(saved.profileCompletionPct >= 80);
  });

  test('2. Validate required and optional fields via Zod schema', async () => {
    // Valid partial profile
    const valid = await careerService.saveProfile(candidateId, workspaceId, {
      caFinalStatus: 'FINALIST',
      articleshipAreas: ['DIRECT_TAX', 'TAX_AUDIT'],
      skills: [],
      softwareProficiencies: ['TallyPrime'],
      preferredPathways: [],
      targetCities: ['Delhi NCR'],
    });
    assert.equal(valid.caFinalStatus, 'FINALIST');
    assert.equal(valid.articleshipWeeks, 156); // default value preserved
  });

  test('3. Preserve supported profile data across reloads', async () => {
    const fetched = await careerService.getProfile(candidateId, workspaceId);
    assert.equal(fetched.userId, candidateId);
    assert.equal(fetched.articleshipAreas.length, 2);
    assert.ok(fetched.softwareProficiencies.includes('TallyPrime'));
  });

  test('4. Reject invalid profile input (e.g. invalid status or negative attempts)', async () => {
    await assert.rejects(
      async () => {
        await careerService.saveProfile(candidateId, workspaceId, {
          caFinalStatus: 'INVALID_STATUS',
          articleshipAreas: [],
          skills: [],
          softwareProficiencies: [],
          preferredPathways: [],
          targetCities: [],
        });
      },
      (err) => err.name === 'ZodError'
    );

    await assert.rejects(
      async () => {
        await careerService.saveProfile(candidateId, workspaceId, {
          caFinalStatus: 'QUALIFIED',
          attemptsCount: -3, // Invalid negative count
          articleshipAreas: [],
          skills: [],
          softwareProficiencies: [],
          preferredPathways: [],
          targetCities: [],
        });
      },
      (err) => err.name === 'ZodError'
    );
  });

  test('5. Enforce profile completion indicator accurately based on weighted fields', () => {
    // Minimal empty profile
    const scoreEmpty = calculateProfileCompletion({});
    assert.equal(scoreEmpty, 0);

    // Profile with only status
    const scoreStatus = calculateProfileCompletion({ caFinalStatus: 'QUALIFIED' });
    assert.equal(scoreStatus, 15);

    // Fully populated profile
    const scoreFull = calculateProfileCompletion({
      caFinalStatus: 'QUALIFIED',
      icaiMembershipNo: 'ACA-123',
      articleshipFirm: 'PwC India',
      articleshipFirmTier: 'BIG4',
      articleshipAreas: ['STATUTORY_AUDIT', 'IFC_TESTING', 'CARO_2020'],
      skills: [
        { name: 'S1', category: 'C', proficiency: 'ADVANCED' },
        { name: 'S2', category: 'C', proficiency: 'ADVANCED' },
        { name: 'S3', category: 'C', proficiency: 'ADVANCED' },
      ],
      targetCities: ['Mumbai'],
      preferredPathways: ['AUDIT'],
    });
    assert.ok(scoreFull >= 80);
  });

  test('6. Generate reproducible, explainable career recommendations from defined inputs', async () => {
    // Save audit-heavy profile
    const profile = await careerService.saveProfile(candidateId, workspaceId, {
      caFinalStatus: 'QUALIFIED',
      articleshipFirm: 'EY India',
      articleshipFirmTier: 'BIG4',
      articleshipWeeks: 156,
      articleshipAreas: ['STATUTORY_AUDIT', 'INTERNAL_AUDIT', 'IFC_TESTING'],
      skills: [
        { name: 'Ind AS / IFRS Standards', category: 'Accounting Standards', proficiency: 'ADVANCED' },
        { name: 'Standards on Auditing (SAs)', category: 'Auditing', proficiency: 'ADVANCED' },
      ],
      softwareProficiencies: ['AdvancedExcel'],
      preferredPathways: [CAPathway.AUDIT],
      targetCities: ['Mumbai'],
    });

    const report = await careerService.runDiagnostic(candidateId, workspaceId);
    assert.equal(report.candidateId, profile.id);
    assert.ok(report.pathwayFitReports.length >= 6);

    // Statutory Audit should be top recommended due to Big 4 + Audit areas + Ind AS skills
    assert.equal(report.topRecommendedPathway, CAPathway.AUDIT);
    const auditReport = report.pathwayFitReports.find((p) => p.pathway === CAPathway.AUDIT);
    assert.ok(auditReport);
    assert.ok(auditReport.fitScore >= 80);
    assert.equal(auditReport.matchCategory, 'STRONG_MATCH');
    assert.ok(auditReport.whyItSuits.some((r) => r.includes('Articleship exposure')));
    assert.ok(auditReport.whyItSuits.some((r) => r.includes('BIG4')));
    assert.ok(auditReport.matchingSkills.includes('Ind AS / IFRS Standards'));
    assert.ok(auditReport.typicalRoles.length > 0);
  });

  test('7. Skill gap analysis identifies critical missing skills with priorities', async () => {
    const report = await careerService.runDiagnostic(candidateId, workspaceId);
    assert.ok(report.criticalGaps.length > 0);

    report.criticalGaps.forEach((gap) => {
      assert.ok(gap.skill);
      assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(gap.priority));
      assert.ok(gap.rationale);
      assert.ok(gap.recommendedAction);
    });
  });

  test('8. Handle missing or incomplete profile information gracefully', () => {
    // Blank profile
    const blankProfile = {
      id: 'blank-id',
      userId: 'blank-user',
      workspaceId: 'blank-ws',
      caFinalStatus: 'FINALIST',
      articleshipWeeks: 156,
      articleshipAreas: [],
      skills: [],
      softwareProficiencies: [],
      preferredPathways: [],
      targetCities: [],
      profileCompletionPct: 15,
      updatedAt: new Date().toISOString(),
    };

    const report = runCareerDiagnostic(blankProfile);
    assert.ok(report.pathwayFitReports.length >= 6);
    // Even with 0 articleship, returns valid baseline scores and role examples
    report.pathwayFitReports.forEach((p) => {
      assert.ok(p.fitScore >= 25);
      assert.ok(p.typicalRoles.length > 0);
    });
  });

  test('9. Generate 30-60-90 day personalized roadmap with associated milestones and tasks', async () => {
    const roadmap = await careerService.generateRoadmap(candidateId, workspaceId, CAPathway.AUDIT);
    assert.ok(roadmap.id);
    assert.equal(roadmap.targetPathway, CAPathway.AUDIT);
    assert.ok(roadmap.tasks.length >= 6);

    const day30Tasks = roadmap.tasks.filter((t) => t.milestone === 'DAY_30');
    const day60Tasks = roadmap.tasks.filter((t) => t.milestone === 'DAY_60');
    const day90Tasks = roadmap.tasks.filter((t) => t.milestone === 'DAY_90');

    assert.ok(day30Tasks.length > 0);
    assert.ok(day60Tasks.length > 0);
    assert.ok(day90Tasks.length > 0);
    assert.equal(roadmap.progressPct, 0);
  });

  test('10. Prevent accidental duplicate tasks during roadmap regeneration (Idempotent)', async () => {
    // Regenerate roadmap for CORP_FIN
    const roadmap1 = await careerService.generateRoadmap(candidateId, workspaceId, CAPathway.CORP_FIN);
    const count1 = roadmap1.tasks.length;

    // Regenerate roadmap again
    const roadmap2 = await careerService.generateRoadmap(candidateId, workspaceId, CAPathway.CORP_FIN);
    const count2 = roadmap2.tasks.length;

    // Must not accumulate or double task count
    assert.equal(count1, count2);
  });

  test('11. Update task completion and roadmap progress correctly', async () => {
    const roadmap = await careerService.getRoadmap(candidateId, workspaceId);
    const firstTask = roadmap.tasks[0];
    assert.ok(firstTask);

    // Complete first task
    const updatedTask = await careerService.updateTaskStatus(
      candidateId,
      workspaceId,
      firstTask.id,
      'COMPLETED'
    );
    assert.equal(updatedTask.status, 'COMPLETED');
    assert.ok(updatedTask.completedAt);

    // Re-fetch roadmap to verify progress percentage recalculation
    const refreshed = await careerService.getRoadmap(candidateId, workspaceId);
    assert.ok(refreshed.progressPct > 0);
  });

  test('12. Handle missing career catalog data gracefully with fallback requirements', () => {
    const fallbackTasks = generateRoadmapTasks(CAPathway.AUDIT, 'test-rm', []);
    assert.ok(fallbackTasks.length >= 5);
  });
});
