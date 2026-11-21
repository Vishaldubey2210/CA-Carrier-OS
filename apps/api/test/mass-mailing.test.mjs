import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MassMailingService } from '../dist/modules/mass-mailing/mass-mailing.service.js';

describe('Mass Mailing & Automated Outreach Suite', () => {
  let service;

  beforeEach(() => {
    service = new MassMailingService();
  });

  test('1. SanitizeAppPassword strips whitespace from 16-char Google App Password', () => {
    const raw = 'abcd efgh ijkl mnop';
    const clean = service.sanitizeAppPassword(raw);
    assert.equal(clean, 'abcdefghijklmnop');
    assert.equal(clean.length, 16);
  });

  test('2. MaskEmail hides private local-part for secure client display', () => {
    const masked = service.maskEmail('rahul.sharma@gmail.com');
    assert.equal(masked, 'r***a@gmail.com');
  });

  test('3. VerifySmtp validates format and completes handshake in dev mode', async () => {
    const res = await service.verifySmtp({
      email: 'ca.student@gmail.com',
      appPassword: 'abcd efgh ijkl mnop',
      host: 'smtp.gmail.com',
      port: 587,
    });

    assert.equal(res.verified, true);
    assert.equal(res.maskedEmail, 'c***t@gmail.com');
    assert.equal(res.host, 'smtp.gmail.com');
    assert.equal(res.port, 587);
  });

  test('4. Save and Retrieve SMTP config persists masked credentials', async () => {
    await service.saveSmtpConfig({
      email: 'candidate.verified@gmail.com',
      appPassword: 'wxyz wxyz wxyz wxyz',
      host: 'smtp.gmail.com',
      port: 587,
      senderName: 'Pooja Verma',
    });

    const saved = service.getSavedSmtpConfig();
    assert.ok(saved);
    assert.equal(saved.email, 'candidate.verified@gmail.com');
    assert.equal(saved.senderName, 'Pooja Verma');
    assert.equal(saved.isVerified, true);
    assert.equal(saved.maskedEmail, 'c***d@gmail.com');
  });

  test('5. GetTargetFirms filters 5,000 CA firms database by region, city and search', () => {
    const all = service.getTargetFirms({ limit: 10 });
    assert.ok(all.total > 0);
    assert.equal(all.firms.length, 10);

    const wirc = service.getTargetFirms({ region: 'WIRC', limit: 5 });
    assert.ok(wirc.firms.every((f) => f.region === 'WIRC'));

    const searchRes = service.getTargetFirms({ search: 'BSR', limit: 5 });
    assert.ok(searchRes.firms.length > 0);
    assert.ok(searchRes.firms.some((f) => f.firmName.includes('BSR')));
  });

  test('6. PersonalizeText correctly interpolates candidate and firm placeholders', () => {
    const template = 'Dear {firm_name} Recruitment Team, I am {candidate_name} ({cro_number}) from {city}.';
    const firm = {
      firmName: 'BDO India LLP',
      email: 'articleship@bdo.in',
      primaryCity: 'Mumbai',
    };
    const candidate = {
      candidateName: 'Aman Gupta',
      icaiRegNo: 'WRO0786543',
      interStatus: 'Both Groups Cleared',
      city: 'Mumbai',
    };

    const personalized = service.personalizeText(template, firm, candidate);
    assert.equal(personalized, 'Dear BDO India LLP Recruitment Team, I am Aman Gupta (WRO0786543) from Mumbai.');
  });

  test('7. ExecuteCampaign dispatches emails with pacing delay and structured log stream', async () => {
    const campaignReq = {
      smtpConfig: {
        email: 'test.sender@gmail.com',
        appPassword: 'mock mock mock mock',
        host: 'smtp.gmail.com',
        port: 587,
      },
      subject: 'Application for Articleship | {candidate_name} | {firm_name}',
      bodyTemplate: 'Respected Team at {firm_name},\nI am {candidate_name}. Please find my CV.',
      recipients: [
        {
          firmName: 'BSR & Co. LLP',
          email: 'articleship@bsraffiliates.com',
          primaryCity: 'Mumbai',
        },
        {
          firmName: 'Singhi & Co.',
          email: 'articleship@singhico.com',
          primaryCity: 'Kolkata',
        },
      ],
      candidateDetails: {
        candidateName: 'Rohan Mehta',
        icaiRegNo: 'CRO0987654',
        interStatus: 'Both Groups Cleared',
        city: 'Mumbai',
      },
      throttleDelayMs: 300,
    };

    const result = await service.executeCampaign(campaignReq);
    assert.ok(result.campaignId);
    assert.equal(result.totalQueued, 2);
    assert.equal(result.totalSent, 2);
    assert.equal(result.totalFailed, 0);
    assert.ok(result.logs.length >= 4);

    const successLogs = result.logs.filter((l) => l.level === 'SUCCESS');
    assert.equal(successLogs.length, 2);
  });
});

