import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  JobAlertsService,
  MockEmailAdapter,
} from '../dist/modules/jobs/job-alerts.service.js';
import {
  DocumentIntelligenceService,
  MockOcrAdapter,
} from '../dist/modules/resumes/document-intelligence.service.js';
import {
  CAPathway,
  JobAlertPreferencesSchema,
  DocumentUploadSchema,
  Form108ExtractionSchema,
} from '@ca-career-os/shared';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('Remediation M-006: Smart Job Alerts & Document OCR Test Suite', () => {
  const candidateId = '00000000-0000-0000-0000-0000000000c1';
  const candidateEmail = 'candidate.priya@cacareeros.com';

  const mockJobs = [
    {
      id: 'job-gt-01',
      title: 'Senior Associate — Statutory Audit',
      companyName: 'Grant Thornton Bharat LLP',
      locationCity: 'Mumbai',
      caPathway: CAPathway.AUDIT,
      salaryMin: 1400000,
      salaryMax: 1800000,
      rawDescription: 'Lead statutory audit engagements under SAs and Ind AS.',
    },
    {
      id: 'job-pwc-02',
      title: 'Manager — Financial Due Diligence',
      companyName: 'PwC India',
      locationCity: 'Bengaluru',
      caPathway: CAPathway.IB,
      salaryMin: 2200000,
      salaryMax: 2800000,
      rawDescription: 'Perform buy-side Quality of Earnings (QoE) and M&A advisory.',
    },
    {
      id: 'job-kpmg-03',
      title: 'Senior Consultant — Indirect Tax & GST',
      companyName: 'KPMG India',
      locationCity: 'Delhi NCR',
      caPathway: CAPathway.TAX,
      salaryMin: 1600000,
      salaryMax: 2000000,
      rawDescription: 'GST litigation, advisory, and ITC optimization.',
    },
  ];

  // ---------------------------------------------------------------------------
  // A. Smart Job Alerts (F-006)
  // ---------------------------------------------------------------------------

  test('1. Job alert preferences schema validation & defaults', async () => {
    const alertsService = new JobAlertsService();

    // Default preferences
    const defaults = await alertsService.getPreferences(candidateId);
    assert.equal(defaults.enabled, true);
    assert.equal(defaults.frequency, 'DAILY');

    // Save customized preferences
    const custom = await alertsService.savePreferences(candidateId, {
      pathways: [CAPathway.AUDIT],
      minSalary: 1200000,
      preferredCities: ['Mumbai'],
      keywords: ['Statutory Audit'],
      frequency: 'WEEKLY',
      enabled: true,
    });

    assert.deepEqual(custom.pathways, [CAPathway.AUDIT]);
    assert.equal(custom.minSalary, 1200000);
    assert.equal(custom.frequency, 'WEEKLY');

    // Invalid frequency rejection
    assert.throws(() => {
      JobAlertPreferencesSchema.parse({ frequency: 'HOURLY' });
    });
  });

  test('2. Alert matching & filtering against candidate criteria', async () => {
    const alertsService = new JobAlertsService();
    const mockEmail = new MockEmailAdapter();
    alertsService.setEmailAdapter(mockEmail);

    await alertsService.savePreferences(candidateId, {
      pathways: [CAPathway.AUDIT],
      minSalary: 1200000,
      preferredCities: ['Mumbai'],
      keywords: ['Audit'],
      frequency: 'DAILY',
      enabled: true,
    });

    const result = await alertsService.processJobAlerts(candidateId, candidateEmail, mockJobs);
    assert.equal(result.status, 'DELIVERED_MOCK');
    assert.equal(result.eligibleJobsCount, 1);
    assert.equal(result.newlyAlertedCount, 1);
    assert.ok(result.deliveryId);
    assert.equal(mockEmail.dispatchedEmails.length, 1);
    assert.equal(mockEmail.dispatchedEmails[0].to, candidateEmail);
    assert.ok(mockEmail.dispatchedEmails[0].bodyText.includes('Grant Thornton'));
  });

  test('3. Deduplication: previously alerted jobs are never alerted twice', async () => {
    const alertsService = new JobAlertsService();
    const mockEmail = new MockEmailAdapter();
    alertsService.setEmailAdapter(mockEmail);

    await alertsService.savePreferences(candidateId, {
      pathways: [CAPathway.AUDIT],
      enabled: true,
    });

    // Run 1: Delivers GT job
    const run1 = await alertsService.processJobAlerts(candidateId, candidateEmail, mockJobs);
    assert.equal(run1.status, 'DELIVERED_MOCK');
    assert.equal(run1.newlyAlertedCount, 1);

    // Run 2 with same jobs: Deduplicated!
    const run2 = await alertsService.processJobAlerts(candidateId, candidateEmail, mockJobs);
    assert.equal(run2.status, 'DUPLICATE_SKIPPED');
    assert.equal(run2.newlyAlertedCount, 0);
    // Still only 1 email dispatched total
    assert.equal(mockEmail.dispatchedEmails.length, 1);
  });

  test('4. Transient failure & retry: succeeds on retry attempt', async () => {
    const alertsService = new JobAlertsService();
    const mockEmail = new MockEmailAdapter();
    // Simulate 1 transient network failure before succeeding
    mockEmail.setTransientFailures(1);
    alertsService.setEmailAdapter(mockEmail);

    await alertsService.savePreferences('cand-transient-01', {
      pathways: [CAPathway.IB],
      enabled: true,
    });

    const result = await alertsService.processJobAlerts('cand-transient-01', candidateEmail, mockJobs);
    assert.equal(result.status, 'DELIVERED_MOCK');
    assert.equal(result.attempts, 2, 'Should succeed on attempt 2 after 1 transient error');
    assert.equal(mockEmail.dispatchedEmails.length, 1);
  });

  test('5. Permanent failure handling: max retries reached & PII redacted', async () => {
    const alertsService = new JobAlertsService();
    const mockEmail = new MockEmailAdapter();
    mockEmail.setPermanentFailure(true);
    alertsService.setEmailAdapter(mockEmail);

    await alertsService.savePreferences('cand-perm-fail', {
      pathways: [CAPathway.TAX],
      enabled: true,
    });

    const result = await alertsService.processJobAlerts('cand-perm-fail', candidateEmail, mockJobs);
    assert.equal(result.status, 'FAILED');
    assert.equal(result.attempts, 3, 'Should exhaust all 3 retry attempts');
    assert.ok(result.error);
    // Verify no raw emails are leaked in error message
    assert.ok(!result.error.includes(candidateEmail));
  });

  // ---------------------------------------------------------------------------
  // B. Smart Document Intelligence (F-038)
  // ---------------------------------------------------------------------------

  test('6. Document upload MIME and magic byte signature validation', async () => {
    const docService = new DocumentIntelligenceService();

    // Valid synthetic PDF buffer starting with %PDF- (0x25 0x50 0x44 0x46 0x2D)
    const validPdfBuffer = Buffer.from('%PDF-1.7\nSample Form 108 Articleship Content');
    const validResult = await docService.processDocument({
      fileName: 'Form108_Articleship.pdf',
      mimeType: 'application/pdf',
      documentType: 'FORM_108',
      base64Content: validPdfBuffer.toString('base64'),
    });

    assert.equal(validResult.success, true);
    assert.equal(validResult.fileSignatureValid, true);
    assert.equal(validResult.metadata.mimeType, 'application/pdf');

    // Spoofed file: .pdf extension with plain text / invalid magic bytes
    const spoofedBuffer = Buffer.from('NOT_A_REAL_PDF_HEADER_MALICIOUS');
    await assert.rejects(
      async () => {
        await docService.processDocument({
          fileName: 'malicious.pdf',
          mimeType: 'application/pdf',
          documentType: 'FORM_108',
          base64Content: spoofedBuffer.toString('base64'),
        });
      },
      (err) => err.message.includes('File signature mismatch')
    );
  });

  test('7. Max file size enforcement (files > 10MB rejected)', async () => {
    const docService = new DocumentIntelligenceService();

    // Synthetic buffer exceeding 10MB
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024, '%PDF-1.4');
    await assert.rejects(
      async () => {
        await docService.processDocument({
          fileName: 'oversized.pdf',
          mimeType: 'application/pdf',
          documentType: 'FORM_108',
          base64Content: oversizedBuffer.toString('base64'),
        });
      },
      (err) => err.message.includes('exceeds maximum allowed limit of 10MB')
    );
  });

  test('8. Form 108 Articleship Completion extraction schema validation', async () => {
    const docService = new DocumentIntelligenceService();
    const pdfBuffer = Buffer.from('%PDF-1.7\nDeloitte Haskins Form 108');

    const result = await docService.processDocument({
      fileName: 'Form_108_Deloitte.pdf',
      mimeType: 'application/pdf',
      documentType: 'FORM_108',
      base64Content: pdfBuffer.toString('base64'),
    });

    assert.equal(result.success, true);
    assert.ok(result.extractedForm108);
    assert.equal(result.extractedForm108.firmName, 'Deloitte Haskins & Sells LLP');
    assert.equal(result.extractedForm108.firmRegistrationNumber, '117366W');
    assert.equal(result.extractedForm108.principalName, 'K. R. Ramanathan');
    assert.equal(result.extractedForm108.totalWeeksServed, 156);
    assert.equal(result.extractedForm108.isMock, true);
    assert.equal(result.extractedForm108.isOcrExtracted, true);
    assert.ok(result.extractedForm108.confidence > 0.9);

    // Verify Zod schema validation passes
    const validated = Form108ExtractionSchema.safeParse(result.extractedForm108);
    assert.equal(validated.success, true);
  });

  test('9. Low-confidence / unreadable document handling (requires manual review)', async () => {
    const docService = new DocumentIntelligenceService();
    // Synthetic PDF with corrupted marker
    const corruptedBuffer = Buffer.from('%PDF-1.7\nCORRUPTED_UNREADABLE_SCAN');

    const result = await docService.processDocument({
      fileName: 'blurry_scan.pdf',
      mimeType: 'application/pdf',
      documentType: 'FORM_108',
      base64Content: corruptedBuffer.toString('base64'),
    });

    assert.equal(result.success, false);
    assert.equal(result.requiresManualReview, true);
    assert.ok(result.confidence < 0.6);
    assert.ok(result.error?.includes('Manual review required'));
  });

  test('10. Temporary file secure handling and guaranteed cleanup in finally block', async () => {
    const docService = new DocumentIntelligenceService();
    const pdfBuffer = Buffer.from('%PDF-1.7\nTest Cleanup');

    const tmpDirBefore = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith('ocr_'));

    await docService.processDocument({
      fileName: 'test_cleanup.pdf',
      mimeType: 'application/pdf',
      documentType: 'FORM_108',
      base64Content: pdfBuffer.toString('base64'),
    });

    const tmpDirAfter = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith('ocr_'));
    assert.equal(
      tmpDirAfter.length,
      tmpDirBefore.length,
      'Temporary OCR file must be cleaned up immediately after processing'
    );
  });
});
