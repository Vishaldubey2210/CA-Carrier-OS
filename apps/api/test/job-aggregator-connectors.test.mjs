import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GreenhouseConnector } from '../dist/modules/jobs/connectors/greenhouse.connector.js';
import { LeverConnector } from '../dist/modules/jobs/connectors/lever.connector.js';
import { AshbyConnector } from '../dist/modules/jobs/connectors/ashby.connector.js';
import { AdzunaConnector } from '../dist/modules/jobs/connectors/adzuna.connector.js';
import { JoobleConnector } from '../dist/modules/jobs/connectors/jooble.connector.js';
import { IcaiConnector } from '../dist/modules/jobs/connectors/icai.connector.js';
import { JobSourceRegistryService } from '../dist/modules/jobs/connectors/job-source-registry.service.js';
import { JobDeduplicationService } from '../dist/modules/jobs/job-deduplication.service.js';
import { JobFreshnessService } from '../dist/modules/jobs/job-freshness.service.js';
import { JobIngestionOrchestratorService } from '../dist/modules/jobs/job-ingestion-orchestrator.service.js';
import { JobsService } from '../dist/modules/jobs/jobs.service.js';
import { CAPathway } from '@ca-career-os/shared';

describe('Multi-Source Job & Articleship Aggregator Architecture Suite', () => {
  const mockPrisma = {
    isDatabaseConnected: () => false,
  };

  const registry = new JobSourceRegistryService(mockPrisma);
  const dedup = new JobDeduplicationService();
  const freshness = new JobFreshnessService();
  const orchestrator = new JobIngestionOrchestratorService(mockPrisma, registry, dedup, freshness);
  const jobsService = new JobsService(mockPrisma, registry, dedup, freshness, orchestrator);

  // 1. Greenhouse Connector
  test('1. Greenhouse connector normalizes roles and extracts CA taxonomy', async () => {
    const connector = new GreenhouseConnector();
    assert.equal(connector.providerId, 'greenhouse');
    assert.equal(connector.providerType, 'GREENHOUSE');
    assert.equal(connector.getStatus(), 'ACTIVE');

    const result = await connector.fetchJobs({ limit: 10 });
    assert.ok(result.jobs.length > 0, 'Should fetch normalized jobs');
    
    const first = result.jobs[0];
    assert.ok(first.externalJobId);
    assert.ok(first.companyName);
    assert.ok(first.canonicalUrl);
    assert.equal(first.channel, 'EXTERNAL');
    assert.equal(first.sourceProvider, 'GREENHOUSE');
    assert.ok(first.attribution.includes('Greenhouse'));
  });

  // 2. Lever Connector
  test('2. Lever connector normalizes postings and captures Articleship opportunities', async () => {
    const connector = new LeverConnector();
    assert.equal(connector.providerId, 'lever');
    assert.equal(connector.providerType, 'LEVER');

    const result = await connector.fetchJobs({ limit: 10 });
    assert.ok(result.jobs.length > 0);
    const articleshipJob = result.jobs.find(j => j.opportunityType === 'ARTICLESHIP');
    assert.ok(articleshipJob, 'Should discover CA articleship positions from Lever site');
    assert.ok(articleshipJob.title.includes('Article'));
    assert.equal(articleshipJob.channel, 'EXTERNAL');
  });

  // 3. Ashby Connector
  test('3. Ashby connector normalizes job board items with accurate pathway mapping', async () => {
    const connector = new AshbyConnector();
    assert.equal(connector.providerId, 'ashby');
    assert.equal(connector.providerType, 'ASHBY');

    const result = await connector.fetchJobs({ limit: 5 });
    assert.ok(result.jobs.length > 0);
    const first = result.jobs[0];
    assert.ok(first.companyName.includes('Postman'));
    assert.equal(first.caPathway, CAPathway.TAX);
  });

  // 4. Adzuna Connector
  test('4. Adzuna connector stays in PENDING_CREDENTIALS mode when credentials missing', async () => {
    delete process.env.ADZUNA_APP_ID;
    delete process.env.ADZUNA_APP_KEY;
    const connector = new AdzunaConnector();
    assert.equal(connector.getStatus(), 'PENDING_CREDENTIALS');

    const result = await connector.fetchJobs();
    assert.equal(result.jobs.length, 0, 'Should skip live calls when pending credentials');
  });

  // 5. Jooble Connector
  test('5. Jooble connector stays in PENDING_CREDENTIALS mode when key missing', async () => {
    delete process.env.JOOBLE_API_KEY;
    const connector = new JoobleConnector();
    assert.equal(connector.getStatus(), 'PENDING_CREDENTIALS');

    const result = await connector.fetchJobs();
    assert.equal(result.jobs.length, 0);
  });

  // 6. ICAI Connector (LINK_ONLY)
  test('6. ICAI connector operates in compliant LINK_ONLY mode without unauthorized scraping', async () => {
    const connector = new IcaiConnector();
    assert.equal(connector.getStatus(), 'LINK_ONLY');

    const result = await connector.fetchJobs();
    assert.ok(result.jobs.length >= 2, 'Should provide official campus and SSP articleship links');
    const campus = result.jobs.find(j => j.externalJobId.includes('cmib'));
    assert.ok(campus);
    assert.equal(campus.canonicalUrl, 'https://cajobs.icai.org/');
    assert.ok(campus.attribution.includes('ICAI'));
  });

  // 7. Deduplication Stage 1: Exact Identity
  test('7. Deduplication Stage 1: Catches exact provider ID and canonical URL matches', () => {
    const existing = [
      {
        id: 'job-101',
        title: 'Statutory Audit Senior',
        companyName: 'Deloitte India',
        locationCity: 'Mumbai',
        sourceProvider: 'GREENHOUSE',
        externalJobId: 'ext-999',
        canonicalUrl: 'https://boards.greenhouse.io/deloitte/jobs/999',
        fingerprint: 'fp-101',
      },
    ];

    const candidateSameId = {
      title: 'Audit Senior',
      companyName: 'Deloitte',
      locationCity: 'Mumbai',
      rawDescription: 'Audit description',
      sourceProvider: 'GREENHOUSE',
      externalJobId: 'ext-999',
    };

    const res = dedup.evaluateDuplicate(candidateSameId, existing);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.matchStage, 'STAGE_1_EXACT');
    assert.equal(res.existingJobId, 'job-101');
  });

  // 8. Deduplication Stage 2: Normalized Identity
  test('8. Deduplication Stage 2: Catches company alias and normalized title overlap', () => {
    const existing = [
      {
        id: 'job-102',
        title: 'Senior Associate — Direct Tax',
        normalizedTitle: 'Direct Tax & Litigation Specialist',
        companyName: 'Grant Thornton Bharat LLP',
        locationCity: 'Bengaluru',
        rawDescription: 'Tax compliance and litigation',
        sourceProvider: 'DIRECT_EMPLOYER',
      },
    ];

    const candidateAlias = {
      title: 'Direct Tax Specialist',
      companyName: 'Grant Thornton',
      locationCity: 'Bengaluru',
      rawDescription: 'Tax compliance and litigation work',
      sourceProvider: 'LEVER',
    };

    const res = dedup.evaluateDuplicate(candidateAlias, existing);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.matchStage, 'STAGE_2_NORMALIZED');
    assert.equal(res.existingJobId, 'job-102');
  });

  // 9. Deduplication Stage 3: Similarity Comparison
  test('9. Deduplication Stage 3: Detects cross-provider token similarity above threshold', () => {
    const existing = [
      {
        id: 'job-103',
        title: 'FP&A Manager — Strategic SaaS Finance',
        normalizedTitle: 'FP&A & Corporate Finance Manager',
        companyName: 'Razorpay Software Pvt Ltd',
        locationCity: 'Bengaluru',
        rawDescription: 'Drive annual budgeting, rolling forecasts, variance attribution, unit economics, gross margins, and SaaS burn rates.',
        sourceProvider: 'DIRECT_EMPLOYER',
      },
    ];

    const candidateSyndicated = {
      title: 'Manager FP&A (SaaS Unit Economics)',
      companyName: 'Razorpay',
      locationCity: 'Bengaluru',
      rawDescription: 'Drive annual budgeting, rolling forecasts, variance attribution, unit economics, gross margins, and SaaS burn rates across product pods.',
      sourceProvider: 'GREENHOUSE',
    };

    const res = dedup.evaluateDuplicate(candidateSyndicated, existing);
    assert.equal(res.isDuplicate, true);
    assert.equal(res.confidenceScore >= 0.65, true);
  });

  // 10. Distinct Vacancies
  test('10. Distinct vacancies at same employer are NOT falsely deduplicated', () => {
    const existing = [
      {
        id: 'job-104',
        title: 'Statutory Audit Senior Associate (Ind AS)',
        normalizedTitle: 'Statutory Audit Senior / Manager',
        companyName: 'PwC India',
        locationCity: 'Mumbai',
        rawDescription: 'Lead statutory audit of listed entities under Companies Act 2013 and Standards on Auditing.',
        sourceProvider: 'DIRECT_EMPLOYER',
      },
    ];

    const distinctJob = {
      title: 'Transfer Pricing Associate (Form 3CEB)',
      companyName: 'PwC India',
      locationCity: 'Mumbai',
      rawDescription: 'Transfer pricing benchmarking studies, Section 92C documentation, and international tax compliance.',
      sourceProvider: 'DIRECT_EMPLOYER',
    };

    const res = dedup.evaluateDuplicate(distinctJob, existing);
    assert.equal(res.isDuplicate, false, 'Distinct roles must not be falsely merged');
  });

  // 11. Freshness State Machine
  test('11. Freshness State Machine accurately marks STALE (>30d), EXPIRED, and UNAVAILABLE', () => {
    const now = Date.now();

    // Active
    const activeStatus = freshness.evaluateFreshness({
      lastVerifiedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
    assert.equal(activeStatus, 'SOURCE_ACTIVE');

    // Stale (> 30 days)
    const staleStatus = freshness.evaluateFreshness({
      lastVerifiedAt: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(),
    });
    assert.equal(staleStatus, 'STALE');

    // Expired past date
    const expiredStatus = freshness.evaluateFreshness({
      expiresAt: new Date(now - 1000).toISOString(),
    });
    assert.equal(expiredStatus, 'EXPIRED');

    // Transient network timeout preserves UNAVAILABLE without expiring
    const unavailableStatus = freshness.evaluateFreshness({
      verificationStatus: 'UNAVAILABLE',
      lastVerifiedAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    });
    assert.equal(unavailableStatus, 'UNAVAILABLE');
  });

  // 12. Ingestion Orchestrator & Distributed Lock
  test('12. Ingestion Orchestrator runs synchronization and suppresses concurrent overlapping runs', async () => {
    const testMap = new Map();
    const result = await orchestrator.triggerSynchronization(undefined, testMap);
    assert.equal(result.success, true);
    assert.ok(result.totalIngested > 0, 'Should ingest real vacancies');
    assert.ok(testMap.size > 0);

    // Overlapping lock test
    orchestrator.isSyncRunning = true;
    orchestrator.lastSyncStartTime = Date.now();
    const lockedResult = await orchestrator.triggerSynchronization(undefined, testMap);
    assert.equal(lockedResult.success, false);
    assert.ok(lockedResult.reports[0].errorMessage.includes('already in progress'));
    orchestrator.isSyncRunning = false;
  });

  // 13. Unified Search API: Channel Filtering
  test('13. Unified Search API accurately isolates ENTERPRISE vs EXTERNAL channels', async () => {
    const all = await jobsService.listJobs({});
    assert.ok(all.jobs.some(j => j.channel === 'ENTERPRISE'), 'Should contain Native Enterprise listings');
    assert.ok(all.jobs.some(j => j.channel === 'EXTERNAL'), 'Should contain External Opportunities');

    const enterpriseOnly = await jobsService.listJobs({ channel: 'ENTERPRISE_ONLY' });
    assert.ok(enterpriseOnly.jobs.every(j => j.channel === 'ENTERPRISE'));

    const externalOnly = await jobsService.listJobs({ channel: 'EXTERNAL_ONLY' });
    assert.ok(externalOnly.jobs.every(j => j.channel === 'EXTERNAL'));
  });

  // 14. Unified Search API: Opportunity Type Filtering
  test('14. Unified Search API filters Articleship and Industrial Training opportunities', async () => {
    const articleship = await jobsService.listJobs({ opportunityType: 'ARTICLESHIP' });
    assert.ok(articleship.jobs.length > 0, 'Must return articleship positions for CA students');
    assert.ok(articleship.jobs.every(j => j.opportunityType === 'ARTICLESHIP'));

    const industrial = await jobsService.listJobs({ opportunityType: 'INDUSTRIAL_TRAINING' });
    assert.ok(industrial.jobs.length > 0, 'Must return industrial training positions');
    assert.ok(industrial.jobs.every(j => j.opportunityType === 'INDUSTRIAL_TRAINING'));
  });

  // 15. Candidate Moderation & Operational Health
  test('15. Candidate moderation reporting flags job for review and health report is accurate', async () => {
    const all = await jobsService.listJobs({});
    const target = all.jobs[0];

    const reportRes = await jobsService.reportJob(target.id, 'SCAM_SUSPICION', 'Suspicious registration fee claim', 'user-cand-01');
    assert.equal(reportRes.success, true);
    assert.ok(reportRes.ticketRef.startsWith('MOD-'));

    const reloaded = await jobsService.getJobById(target.id);
    assert.equal(reloaded.verificationStatus, 'REVIEW_REQUIRED');

    const health = jobsService.getAggregatorHealth();
    assert.ok(health.totalSources >= 6);
    assert.ok(health.totalEnterpriseJobs > 0);
    assert.ok(health.totalExternalJobs > 0);
    assert.ok(health.totalArticleshipOpportunities > 0);
  });
});
