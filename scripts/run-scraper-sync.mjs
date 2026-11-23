#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables using Node 20+ built-in support
try {
  const envPath = path.join(rootDir, '.env');
  if (process.loadEnvFile && fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
} catch (e) {
  // Ignored if running inside CI with injected env vars
}

async function runScraperSync() {
  console.log('🚀 [Scraper Daemon] Initializing Multi-Portal & XML Job Ingestion...');

  // Dynamically import compiled modules
  const { MultiPortalScraperConnector } = await import(
    path.join(rootDir, 'apps/api/dist/modules/jobs/connectors/multi-portal-scraper.connector.js')
  );
  const { XmlFeedConnector } = await import(
    path.join(rootDir, 'apps/api/dist/modules/jobs/connectors/xml-feed.connector.js')
  );
  const { EmailService } = await import(
    path.join(rootDir, 'apps/api/dist/modules/email/email.service.js')
  );

  const multiPortal = new MultiPortalScraperConnector();
  const xmlFeed = new XmlFeedConnector();
  const emailService = new EmailService();

  const sourceBreakdown = [];
  const allScrapedJobs = [];

  // 1. Run Multi-Portal Scraper (17 portals: ICAI, Big 4, Specialized CA boards)
  console.log('📡 [1/2] Fetching from 17 CA portals & Big 4 career boards...');
  const multiStart = Date.now();
  try {
    const multiRes = await multiPortal.fetchJobs({ limit: 50 });
    const durationMs = Date.now() - multiStart;
    allScrapedJobs.push(...multiRes.jobs);
    sourceBreakdown.push({
      sourceName: 'ICAI & Big 4 Multi-Portal Scraper (17 Portals)',
      providerType: 'MULTI_PORTAL_SCRAPER',
      status: 'SUCCESS',
      fetchedCount: multiRes.jobs.length,
      ingestedCount: multiRes.jobs.length,
      duplicateCount: 0,
      durationMs,
    });
    console.log(`✅ Multi-Portal Scraper extracted ${multiRes.jobs.length} jobs in ${durationMs}ms`);
  } catch (err) {
    sourceBreakdown.push({
      sourceName: 'ICAI & Big 4 Multi-Portal Scraper (17 Portals)',
      providerType: 'MULTI_PORTAL_SCRAPER',
      status: 'FAILED',
      fetchedCount: 0,
      ingestedCount: 0,
      duplicateCount: 0,
      durationMs: Date.now() - multiStart,
    });
    console.error(`❌ Multi-Portal Scraper error: ${err.message}`);
  }

  // 2. Run XML Feeds
  console.log('📡 [2/2] Ingesting verified RSS/XML feeds...');
  const xmlStart = Date.now();
  try {
    const xmlRes = await xmlFeed.fetchJobs({ limit: 50 });
    const durationMs = Date.now() - xmlStart;
    allScrapedJobs.push(...xmlRes.jobs);
    sourceBreakdown.push({
      sourceName: 'RSS/XML Verified Finance Feeds (8 Feeds)',
      providerType: 'XML_FEED',
      status: 'SUCCESS',
      fetchedCount: xmlRes.jobs.length,
      ingestedCount: xmlRes.jobs.length,
      duplicateCount: 0,
      durationMs,
    });
    console.log(`✅ XML Feed Ingestion extracted ${xmlRes.jobs.length} jobs in ${durationMs}ms`);
  } catch (err) {
    sourceBreakdown.push({
      sourceName: 'RSS/XML Verified Finance Feeds (8 Feeds)',
      providerType: 'XML_FEED',
      status: 'FAILED',
      fetchedCount: 0,
      ingestedCount: 0,
      duplicateCount: 0,
      durationMs: Date.now() - xmlStart,
    });
    console.error(`❌ XML Feed Ingestion error: ${err.message}`);
  }

  // 3. Merge with existing storage
  const storageFilePath = path.join(rootDir, 'data', 'jobs_store.json');
  const webStoragePath = path.join(rootDir, 'apps/web/src/data/jobs_store.json');

  let existingJobs = [];
  if (fs.existsSync(storageFilePath)) {
    try {
      existingJobs = JSON.parse(fs.readFileSync(storageFilePath, 'utf-8'));
    } catch {
      existingJobs = [];
    }
  }

  // Map by fingerprint/id to deduplicate
  const jobMap = new Map();
  for (const j of existingJobs) {
    if (j?.id) jobMap.set(j.id, j);
  }

  let newCount = 0;
  for (const nj of allScrapedJobs) {
    if (!jobMap.has(nj.id)) {
      jobMap.set(nj.id, nj);
      newCount++;
    }
  }

  const mergedJobs = Array.from(jobMap.values());
  fs.writeFileSync(storageFilePath, JSON.stringify(mergedJobs, null, 2), 'utf-8');
  if (fs.existsSync(path.dirname(webStoragePath))) {
    fs.writeFileSync(webStoragePath, JSON.stringify(mergedJobs, null, 2), 'utf-8');
  }

  console.log(`💾 Saved ${mergedJobs.length} total jobs (${newCount} newly ingested) to disk.`);

  // 4. Send Email Notification via SMTP if configured
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  if (recipient && process.env.SMTP_PASS) {
    console.log(`📧 Dispatching scraping executive alert to ${recipient}...`);
    try {
      const emailResult = await emailService.sendScrapingSummaryAlert({
        totalScraped: allScrapedJobs.length,
        newOpportunitiesCount: newCount,
        durationMs: Date.now() - multiStart,
        recipientEmail: recipient,
        sources: sourceBreakdown,
        timestamp: new Date().toLocaleString('en-IN'),
      });
      console.log(`✅ Email alert successfully dispatched (MessageId: ${emailResult.messageId})`);
    } catch (emailErr) {
      console.error(`⚠️ Failed to dispatch email alert: ${emailErr.message}`);
    }
  } else {
    console.log('ℹ️ SMTP credentials not fully provided; skipping email dispatch.');
  }

  console.log('✨ [Scraper Daemon] Ingestion run completed successfully.');
}

runScraperSync().catch((err) => {
  console.error('💥 Fatal error in scraper daemon:', err);
  process.exit(1);
});
