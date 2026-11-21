import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { StructuredLdJsonConnector } from '../dist/modules/jobs/connectors/structured-ld-json.connector.js';

describe('Schema.org JSON-LD & 5,000 CA Firms Extractor Suite', () => {
  let connector;

  beforeEach(() => {
    connector = new StructuredLdJsonConnector();
  });

  test('1. Connector initializes with JSON_LD provider and ACTIVE status', () => {
    assert.equal(connector.providerId, 'ld_json_directory');
    assert.equal(connector.providerType, 'JSON_LD');
    assert.equal(connector.getStatus(), 'ACTIVE');
  });

  test('2. ExtractLdJsonJobs extracts pure structured data from HTML script tag', () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "CA Articleship Trainee — Statutory Audit & Ind AS",
            "description": "Opportunity for CA Intermediate candidates who cleared both groups to join our statutory audit practice in Mumbai.",
            "datePosted": "2026-11-20T10:00:00Z",
            "validThrough": "2026-12-31T23:59:59Z",
            "employmentType": "INTERN",
            "hiringOrganization": {
              "@type": "Organization",
              "name": "BSR & Co. LLP",
              "sameAs": "https://home.kpmg/in"
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mumbai",
                "addressRegion": "Maharashtra",
                "addressCountry": "IN"
              }
            },
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "INR",
              "value": {
                "@type": "QuantitativeValue",
                "value": 25000,
                "unitText": "MONTH"
              }
            }
          }
          </script>
        </head>
        <body>
          <h1>Careers at BSR</h1>
        </body>
      </html>
    `;

    const mockFirm = {
      firmName: 'BSR & Co. LLP',
      frn: '101248W',
      category: 'Tier 1 (Big 4)',
      region: 'WIRC',
      primaryCity: 'Mumbai',
      email: 'articleship@bsraffiliates.com',
      website: 'https://home.kpmg/in',
      keyPracticeAreas: 'Statutory Audit, US GAAP, Risk Advisory',
      monthlyStipendRange: '₹20,000 - ₹30,000',
    };

    const jobs = connector.extractLdJsonJobs(mockHtml, mockFirm);
    assert.equal(jobs.length, 1);

    const job = jobs[0];
    assert.equal(job.title, 'CA Articleship Trainee — Statutory Audit & Ind AS');
    assert.equal(job.companyName, 'BSR & Co. LLP');
    assert.equal(job.locationCity, 'Mumbai');
    assert.equal(job.opportunityType, 'ARTICLESHIP');
    assert.equal(job.caPathway, 'AUDIT');
    assert.equal(job.salaryDisclosed, true);
  });

  test('3. FetchJobs indexes CA firms from the 5,000 database without breaking', async () => {
    const result = await connector.fetchJobs({ limit: 5 });
    assert.ok(result.jobs.length >= 1);
    assert.ok(result.totalFound >= 1);
    assert.ok(result.jobs.every((j) => j.opportunityType === 'ARTICLESHIP'));
  });

  test('4. VerifyFreshness reports SOURCE_ACTIVE with HTTP 200', async () => {
    const fresh = await connector.verifyFreshness('ca-direct-123', 'https://home.kpmg/in');
    assert.equal(fresh.status, 'SOURCE_ACTIVE');
    assert.equal(fresh.httpStatus, 200);
  });
});
