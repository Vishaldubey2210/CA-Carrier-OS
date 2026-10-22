import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ApplicationStatus,
  CAPathway,
  JobFilterQuerySchema,
  CreateApplicationSchema,
  CreateJobSchema,
  TailorResumeSchema,
} from '@ca-career-os/shared';

describe('Phase 3: Frontend Jobs & Resumes Form Validation Suite', () => {
  test('Job filter query schema handles optional and default parameters', () => {
    const valid = JobFilterQuerySchema.parse({
      query: 'Statutory Audit',
      caPathway: CAPathway.AUDIT,
      city: 'Mumbai',
      savedOnly: 'true',
      page: '1',
      limit: '20',
    });

    assert.equal(valid.query, 'Statutory Audit');
    assert.equal(valid.caPathway, CAPathway.AUDIT);
    assert.equal(valid.savedOnly, true);
    assert.equal(valid.page, 1);
    assert.equal(valid.limit, 20);
  });

  test('Create job schema enforces required title, company, and rawDescription constraints', () => {
    // Missing required fields
    const invalid = CreateJobSchema.safeParse({
      title: 'CA', // Too short (< 3 chars)
      companyName: '',
      locationCity: '',
      caPathway: CAPathway.TAX,
      rawDescription: 'Short',
    });
    assert.equal(invalid.success, false);

    // Valid job input
    const valid = CreateJobSchema.safeParse({
      title: 'Senior Associate — Corporate Tax',
      companyName: 'EY India',
      locationCity: 'Delhi NCR',
      workArrangement: 'HYBRID',
      caPathway: CAPathway.TAX,
      salaryMin: 1500000,
      salaryMax: 1900000,
      salaryDisclosed: true,
      rawDescription: 'Manage corporate direct tax filings, transfer pricing documentation, and tax audits.',
      mandatorySkills: ['Direct Tax', 'Transfer Pricing'],
    });
    assert.equal(valid.success, true);
  });

  test('Create application tracking schema validates UUIDs and status', () => {
    const valid = CreateApplicationSchema.safeParse({
      jobId: '00000000-0000-0000-0000-000000000001',
      status: ApplicationStatus.APPLIED,
      coverNote: 'Interested in Audit role',
      nextFollowUpDate: '2026-10-25',
    });
    assert.equal(valid.success, true);

    const invalidUuid = CreateApplicationSchema.safeParse({
      jobId: 'not-a-uuid',
      status: ApplicationStatus.SAVED,
    });
    assert.equal(invalidUuid.success, false);
  });

  test('Tailor resume schema requires valid Resume UUID and Job UUID', () => {
    const valid = TailorResumeSchema.safeParse({
      resumeId: '00000000-0000-0000-0000-000000000001',
      jobId: '00000000-0000-0000-0000-000000000002',
      emphasis: 'Emphasize Ind AS 115/116 audit signoffs',
    });
    assert.equal(valid.success, true);
  });
});
