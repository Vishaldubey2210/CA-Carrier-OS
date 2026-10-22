import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { HttpExceptionFilter } from '../dist/common/filters/http-exception.filter.js';
import { LoggingInterceptor } from '../dist/common/interceptors/logging.interceptor.js';
import { TransformInterceptor } from '../dist/common/interceptors/transform.interceptor.js';

describe('End-to-End Real HTTP User Journeys & Security Gates', () => {
  let app;
  let baseUrl;
  let candidateUser;
  let candidateToken;
  let candidateWorkspaceId;

  let secondaryUser;
  let secondaryToken;
  let secondaryWorkspaceId;

  let testJobId;
  let createdAppId;
  let createdResumeId;
  let createdClientId;

  before(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
    await app.listen(0);
    const port = app.getHttpServer().address().port;
    baseUrl = `http://127.0.0.1:${port}/api/v1`;
  });

  after(async () => {
    if (app) {
      await app.close();
    }
  });

  // Helper to extract response payload whether wrapped in envelope or not
  function extractData(body) {
    return body && typeof body === 'object' && 'data' in body ? body.data : body;
  }

  // -------------------------------------------------------------------------
  // Journey 1: Registration and Login
  // Runtime environment: Real HTTP server, in-memory auth store (PostgreSQL fallback), Bcrypt hashing
  // -------------------------------------------------------------------------
  test('Journey 1: Registration and Login via HTTP endpoints', async () => {
    const regPayload = {
      email: 'priya.sharma.e2e@cacareeros.com',
      password: 'Password@2026Secure!',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'CANDIDATE',
    };

    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });

    assert.equal(regRes.status, 201, 'Registration should return 201 Created');
    const rawRegBody = await regRes.json();
    const regData = extractData(rawRegBody);

    assert.ok(regData.accessToken, 'Access token must be returned');
    assert.ok(regData.defaultWorkspaceId, 'Personal workspace ID must be provisioned');
    assert.equal(regData.user.email, regPayload.email.toLowerCase());

    candidateUser = regData.user;
    candidateToken = regData.accessToken;
    candidateWorkspaceId = regData.defaultWorkspaceId;

    // Login with registered credentials
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: regPayload.email,
        password: regPayload.password,
      }),
    });

    assert.equal(loginRes.status, 200, 'Login should return 200 OK');
    const rawLoginBody = await loginRes.json();
    const loginData = extractData(rawLoginBody);
    assert.ok(loginData.accessToken, 'Login should return valid JWT accessToken');

    // Register secondary user for tenant isolation boundary tests
    const reg2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rohit.mehta.e2e@cacareeros.com',
        password: 'Password@2026Secure!',
        firstName: 'Rohit',
        lastName: 'Mehta',
        role: 'CANDIDATE',
      }),
    });
    const reg2Data = extractData(await reg2Res.json());
    secondaryUser = reg2Data.user;
    secondaryToken = reg2Data.accessToken;
    secondaryWorkspaceId = reg2Data.defaultWorkspaceId;
  });

  // -------------------------------------------------------------------------
  // Journey 2: Saving and Reopening Candidate Profile
  // Runtime environment: Real HTTP server, in-memory candidate profile store
  // -------------------------------------------------------------------------
  test('Journey 2: Saving and reopening candidate profile', async () => {
    const profilePayload = {
      caFinalStatus: 'QUALIFIED',
      articleshipFirmTier: 'BIG4',
      articleshipWeeks: 156,
      articleshipAreas: ['Statutory Audit', 'Ind AS Financial Reporting'],
      preferredPathways: ['AUDIT_ASSURANCE', 'FINANCIAL_REPORTING'],
      targetCities: ['Mumbai', 'Bengaluru'],
      targetSalaryMin: 1200000,
      targetSalaryMax: 1800000,
      summary: 'Chartered Accountant with 3 years articleship experience in Big 4 core audit.',
      skills: [
        { name: 'Statutory Audit', category: 'CORE_ACCOUNTING', level: 'ADVANCED' },
        { name: 'Ind AS', category: 'FINANCIAL_REPORTING', level: 'INTERMEDIATE' },
      ],
      softwareProficiencies: ['SAP ERP', 'MS Excel Advanced'],
    };

    const saveRes = await fetch(`${baseUrl}/career/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify(profilePayload),
    });

    assert.equal(saveRes.status, 200, 'Saving profile should return 200 OK');
    const saveData = extractData(await saveRes.json());
    assert.equal(saveData.articleshipWeeks, 156);
    assert.equal(saveData.articleshipFirmTier, 'BIG4');

    // Reopen profile
    const getRes = await fetch(`${baseUrl}/career/profile`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
    });

    assert.equal(getRes.status, 200, 'Reopening profile should return 200 OK');
    const getData = extractData(await getRes.json());
    assert.equal(getData.caFinalStatus, 'QUALIFIED');
    assert.deepEqual(getData.articleshipAreas, ['Statutory Audit', 'Ind AS Financial Reporting']);
  });

  // -------------------------------------------------------------------------
  // Journey 3: Searching Jobs and Saving a Job
  // Runtime environment: Real HTTP server, curated job fixtures
  // -------------------------------------------------------------------------
  test('Journey 3: Searching for jobs and saving a job', async () => {
    const searchRes = await fetch(`${baseUrl}/jobs?limit=5`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
    });

    assert.equal(searchRes.status, 200, 'Job search should return 200 OK');
    const searchData = extractData(await searchRes.json());
    assert.ok(Array.isArray(searchData), 'Jobs data should be an array');
    assert.ok(searchData.length > 0, 'Should find jobs in catalog');

    const targetJob = searchData[0];
    testJobId = targetJob.id;
    assert.ok(testJobId, 'Job ID must be present');

    // Save job
    const saveJobRes = await fetch(`${baseUrl}/jobs/${testJobId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({ notes: 'Priority application for Big 4 Senior Associate' }),
    });

    assert.ok(saveJobRes.status === 200 || saveJobRes.status === 201, 'Saving job should return 200 or 201');
    const saveJobData = extractData(await saveJobRes.json());
    assert.equal(saveJobData.jobId, testJobId);

    // Verify job in saved jobs list
    const savedListRes = await fetch(`${baseUrl}/jobs/saved`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
    });

    assert.equal(savedListRes.status, 200);
    const savedListData = extractData(await savedListRes.json());
    const foundSaved = savedListData.some((s) => s.jobId === testJobId || s.id === testJobId);
    assert.ok(foundSaved, 'Saved job must appear in saved jobs list');
  });

  // -------------------------------------------------------------------------
  // Journey 4: Creating and Updating an Application
  // Runtime environment: Real HTTP server, in-memory application store
  // -------------------------------------------------------------------------
  test('Journey 4: Creating or updating an application', async () => {
    const appPayload = {
      jobId: testJobId,
      customCompany: 'KPMG India',
      customRole: 'Manager - Statutory Audit',
      customLocation: 'Gurugram',
      appliedAt: new Date().toISOString(),
      status: 'APPLIED',
    };

    const createRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify(appPayload),
    });

    assert.equal(createRes.status, 201, 'Creating application should return 201');
    const createData = extractData(await createRes.json());
    assert.equal(createData.status, 'APPLIED');
    createdAppId = createData.id;
    assert.ok(createdAppId, 'Created application must have an ID');

    // Update application status to INTERVIEWING
    const updateRes = await fetch(`${baseUrl}/applications/${createdAppId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({
        status: 'INTERVIEWING',
        notes: 'Technical assessment round cleared',
      }),
    });

    assert.equal(updateRes.status, 200, 'Status update should return 200');
    const updateData = extractData(await updateRes.json());
    assert.equal(updateData.status, 'INTERVIEWING');
  });

  // -------------------------------------------------------------------------
  // Journey 5: Generating and Reopening a Career Roadmap
  // Runtime environment: Real HTTP server, deterministic career intelligence engine
  // -------------------------------------------------------------------------
  test('Journey 5: Generating and reopening career roadmap', async () => {
    const genRes = await fetch(`${baseUrl}/career/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({ targetPathway: 'AUDIT_ASSURANCE' }),
    });

    assert.equal(genRes.status, 201, 'Generating roadmap should return 201');
    const genData = extractData(await genRes.json());
    assert.equal(genData.targetPathway, 'AUDIT_ASSURANCE');
    assert.ok(Array.isArray(genData.tasks), 'Roadmap should contain tasks');
    assert.ok(genData.tasks.length > 0, 'Tasks must not be empty');

    // Reopen roadmap
    const getRes = await fetch(`${baseUrl}/career/roadmap`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
    });

    assert.equal(getRes.status, 200, 'Reopening roadmap should return 200');
    const getData = extractData(await getRes.json());
    assert.equal(getData.targetPathway, 'AUDIT_ASSURANCE');
  });

  // -------------------------------------------------------------------------
  // Journey 6: Creating a Resume and Tailoring with Zero-Fabrication Guard
  // Runtime environment: Real HTTP server, ATS scoring engine
  // -------------------------------------------------------------------------
  test('Journey 6: Creating a resume from verified profile and tailoring', async () => {
    const resumePayload = {
      title: 'Chartered Accountant - Core Audit',
      targetRole: 'Audit Senior',
      summary: 'ACA with 3 years articleship experience in statutory audit under Ind AS.',
      skills: ['Statutory Audit', 'Ind AS', 'IFRS', 'Tax Audit', 'SAP ERP'],
      certifications: ['Chartered Accountant (ICAI)'],
      workExperience: [
        {
          role: 'Senior Articled Assistant',
          organization: 'Deloitte Haskins & Sells',
          duration: '2022 - 2025',
          description: 'Led statutory audits for listed manufacturing and IT companies.',
        },
      ],
      education: [
        {
          degree: 'Chartered Accountant',
          institution: 'The Institute of Chartered Accountants of India',
          year: 2025,
        },
      ],
    };

    const createRes = await fetch(`${baseUrl}/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify(resumePayload),
    });

    assert.ok(createRes.status === 200 || createRes.status === 201, 'Resume creation should return 200 or 201');
    const createData = extractData(await createRes.json());
    createdResumeId = createData.id;
    assert.ok(createdResumeId, 'Created resume must have an ID');

    // Tailor resume for job
    const tailorRes = await fetch(`${baseUrl}/resumes/tailor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({
        resumeId: createdResumeId,
        jobId: testJobId,
      }),
    });

    assert.ok(tailorRes.status === 200 || tailorRes.status === 201, 'Resume tailoring should return 200 or 201');
    const tailorData = extractData(await tailorRes.json());
    assert.ok(tailorData.id, 'Tailored version ID should be generated');
  });

  // -------------------------------------------------------------------------
  // Journey 7: Creating and Reviewing a Practice Client
  // Runtime environment: Real HTTP server, in-memory practice management store
  // -------------------------------------------------------------------------
  test('Journey 7: Creating and reviewing a practice client', async () => {
    const clientPayload = {
      clientName: 'Apex Logistics Private Limited',
      entityType: 'PVT_LTD',
      panNumber: 'AAACA1234F',
      gstin: '27AAACA1234F1Z5',
      cin: 'U74999MH2019PTC123456',
      contactPerson: 'Mr. Arvind Gupta',
      contactEmail: 'accounts@apexlogistics.in',
      contactPhone: '+91 98200 12345',
    };

    const createRes = await fetch(`${baseUrl}/practice/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify(clientPayload),
    });

    assert.ok(createRes.status === 200 || createRes.status === 201, 'Creating client should return 200 or 201');
    const createData = extractData(await createRes.json());
    assert.equal(createData.clientName, 'Apex Logistics Private Limited');
    createdClientId = createData.id;
    assert.ok(createdClientId, 'Created client ID must exist');

    // Review client details
    const getRes = await fetch(`${baseUrl}/practice/clients/${createdClientId}`, {
      headers: {
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
    });

    assert.equal(getRes.status, 200, 'Fetching client should return 200');
    const getData = extractData(await getRes.json());
    assert.equal(getData.panNumber, 'AAACA1234F');
  });

  // -------------------------------------------------------------------------
  // Journey 8: Honest Empty States When Server Returns No Records
  // Runtime environment: Real HTTP server, isolated new workspace
  // -------------------------------------------------------------------------
  test('Journey 8: Honest empty states for unpopulated collections', async () => {
    // Secondary user has no applications, saved jobs, or practice clients
    const appsRes = await fetch(`${baseUrl}/applications`, {
      headers: {
        Authorization: `Bearer ${secondaryToken}`,
        'x-workspace-id': secondaryWorkspaceId,
      },
    });
    assert.equal(appsRes.status, 200);
    const appsData = extractData(await appsRes.json());
    assert.deepEqual(appsData, [], 'Empty collection must return empty array, not fake items');

    const savedRes = await fetch(`${baseUrl}/jobs/saved`, {
      headers: {
        Authorization: `Bearer ${secondaryToken}`,
        'x-workspace-id': secondaryWorkspaceId,
      },
    });
    assert.equal(savedRes.status, 200);
    const savedData = extractData(await savedRes.json());
    assert.deepEqual(savedData, [], 'Saved jobs must be an empty array for fresh user');

    const clientsRes = await fetch(`${baseUrl}/practice/clients`, {
      headers: {
        Authorization: `Bearer ${secondaryToken}`,
        'x-workspace-id': secondaryWorkspaceId,
      },
    });
    assert.equal(clientsRes.status, 200);
    const clientsData = extractData(await clientsRes.json());
    assert.deepEqual(clientsData, [], 'Practice clients must be empty for fresh workspace');
  });

  // -------------------------------------------------------------------------
  // Journey 9: Correct Error States for Invalid Payloads & Missing Endpoints
  // Runtime environment: Real HTTP server, global exception filter
  // -------------------------------------------------------------------------
  test('Journey 9: Correct error states for unavailable APIs and malformed requests', async () => {
    // 404 for unavailable/missing API endpoint
    const notFoundRes = await fetch(`${baseUrl}/non-existent-career-service`);
    assert.equal(notFoundRes.status, 404, 'Unknown endpoint should return 404 Not Found');
    const notFoundBody = await notFoundRes.json();
    assert.equal(notFoundBody.success, false);
    assert.ok(notFoundBody.error, 'Error envelope must be present');

    // 400 for malformed validation payload
    const badReqRes = await fetch(`${baseUrl}/career/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({
        articleshipWeeks: -5, // Invalid negative number
      }),
    });
    assert.equal(badReqRes.status, 400, 'Invalid payload must return 400 Bad Request');
    const badReqBody = await badReqRes.json();
    assert.equal(badReqBody.success, false);

    // 401 for unauthenticated access
    const unauthRes = await fetch(`${baseUrl}/applications`);
    assert.equal(unauthRes.status, 401, 'Request without token must return 401 Unauthorized');
  });

  // -------------------------------------------------------------------------
  // Journey 10: Authorization Boundaries (Candidate Blindfold Rule & Cross-Tenant Isolation)
  // Runtime environment: Real HTTP server, WorkspaceGuard & JwtAuthGuard
  // -------------------------------------------------------------------------
  test('Journey 10: Candidate Blindfold Rule and cross-user authorization boundaries', async () => {
    // Secondary user attempts to access primary user's candidate profile using candidate's workspace ID
    const blindfoldRes = await fetch(`${baseUrl}/career/profile`, {
      headers: {
        Authorization: `Bearer ${secondaryToken}`,
        'x-workspace-id': candidateWorkspaceId, // Cross-tenant leak attempt
      },
    });

    assert.equal(blindfoldRes.status, 403, 'Cross-user personal workspace access must return 403 Forbidden');
    const blindfoldBody = await blindfoldRes.json();
    assert.equal(blindfoldBody.success, false);
    assert.match(
      blindfoldBody.error.message,
      /strictly isolated|Access denied/i,
      'Blindfold rule enforcement message must be returned'
    );

    // Secondary user attempts to access primary user's practice client
    const crossClientRes = await fetch(`${baseUrl}/practice/clients/${createdClientId}`, {
      headers: {
        Authorization: `Bearer ${secondaryToken}`,
        'x-workspace-id': secondaryWorkspaceId,
      },
    });
    assert.equal(crossClientRes.status, 403, 'Cross-tenant client inspection must return 403 Forbidden');
  });

  // -------------------------------------------------------------------------
  // Journey 11: Payment Checkout Session Initiation Without Live Charges
  // Runtime environment: Real HTTP server, Razorpay Sandbox Adapter
  // -------------------------------------------------------------------------
  test('Journey 11: Payment behavior in Razorpay sandbox without real charges', async () => {
    const checkoutRes = await fetch(`${baseUrl}/billing/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({
        planTier: 'PRO_CANDIDATE',
        billingCycle: 'MONTHLY',
      }),
    });

    assert.ok(checkoutRes.status === 200 || checkoutRes.status === 201, 'Initiating checkout should return 200 or 201');
    const checkoutData = extractData(await checkoutRes.json());
    assert.ok(checkoutData.orderId, 'Razorpay order ID must be generated');
    assert.equal(checkoutData.currency, 'INR');
    assert.equal(checkoutData.amountPaise, 99900, 'Amount must be denominated in paise (₹999.00 for PRO_CANDIDATE)');
    assert.ok(checkoutData.keyId.startsWith('rzp_test_'), 'Must use sandbox keyId in test mode');
  });

  // -------------------------------------------------------------------------
  // Journey 12: Form 108 Document Upload Validation (MIME, Magic Bytes, Size Limits)
  // Runtime environment: Real HTTP server, DocumentIntelligenceService & Mock OCR Adapter
  // -------------------------------------------------------------------------
  test('Journey 12: Form 108 document upload validation with synthetic data', async () => {
    // 1. Rejection of invalid non-PDF file
    const invalidFileRes = await fetch(`${baseUrl}/resumes/upload-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({
        fileName: 'malicious_script.exe',
        fileSizeBytes: 500,
        mimeType: 'application/x-msdownload',
        base64Content: Buffer.from('MZ_EXECUTABLE_HEADER').toString('base64'),
      }),
    });

    assert.equal(invalidFileRes.status, 400, 'Non-PDF/invalid MIME type must return 400 Bad Request');

    // 2. Acceptance and OCR extraction of synthetic Form 108 Articleship Completion PDF
    const syntheticPdfHeader = '%PDF-1.7 Form 108 ICAI Articleship Completion Certificate Synthetic Test';
    const validPdfRes = await fetch(`${baseUrl}/resumes/upload-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({
        fileName: 'Form108_Articleship_Completion_Synthetic.pdf',
        fileSizeBytes: 1024,
        mimeType: 'application/pdf',
        base64Content: Buffer.from(syntheticPdfHeader).toString('base64'),
        documentType: 'FORM_108',
      }),
    });

    assert.ok(validPdfRes.status === 200 || validPdfRes.status === 201, 'Valid synthetic Form 108 upload should return 200 or 201');
    const validPdfData = extractData(await validPdfRes.json());
    assert.equal(validPdfData.success, true);
    assert.equal(validPdfData.fileSignatureValid, true);
    assert.ok(validPdfData.confidence >= 0.9, 'Confidence score must be >= 90% for valid scan');
    assert.equal(validPdfData.metadata.isMock, true, 'Indicates mock OCR provider is active');
    assert.equal(validPdfData.extractedForm108.firmName, 'Deloitte Haskins & Sells LLP');

    // 3. Rejection of oversized file (> 10MB)
    const oversizedRes = await fetch(`${baseUrl}/resumes/upload-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
        'x-workspace-id': candidateWorkspaceId,
      },
      body: JSON.stringify({
        fileName: 'giant_archive.pdf',
        fileSizeBytes: 12 * 1024 * 1024, // 12MB
        mimeType: 'application/pdf',
        base64Content: Buffer.from('%PDF-1.7').toString('base64'),
      }),
    });

    assert.equal(oversizedRes.status, 400, 'Files > 10MB must be rejected with 400 Bad Request');
  });
});
