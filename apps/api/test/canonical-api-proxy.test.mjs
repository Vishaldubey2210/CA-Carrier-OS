import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { HttpExceptionFilter } from '../dist/common/filters/http-exception.filter.js';
import { LoggingInterceptor } from '../dist/common/interceptors/logging.interceptor.js';
import { TransformInterceptor } from '../dist/common/interceptors/transform.interceptor.js';

describe('Remediation M-002: Canonical API Route & Security Verification', () => {
  let app;
  const testPort = 4098;
  const baseUrl = `http://127.0.0.1:${testPort}`;

  before(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
    await app.listen(testPort);
  });

  after(async () => {
    if (app) {
      await app.close();
    }
  });

  test('1. Liveness health probe responds at /api/v1/health', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'healthy');
  });

  test('2. Readiness health probe responds at /api/v1/health/ready', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health/ready`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.status === 'healthy' || body.data.status === 'degraded');
    assert.ok(body.data.services.database);
  });

  test('3. Jobs canonical route responds at /api/v1/jobs', async () => {
    const res = await fetch(`${baseUrl}/api/v1/jobs`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
  });

  test('4. Billing plans canonical route responds at /api/v1/billing/plans', async () => {
    const res = await fetch(`${baseUrl}/api/v1/billing/plans`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.some((p) => p.tier === 'PRO_CANDIDATE'));
  });

  test('5. Salary benchmarks canonical route responds at /api/v1/financial/salary-benchmarks', async () => {
    const res = await fetch(`${baseUrl}/api/v1/financial/salary-benchmarks`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('6. Mentorship mentors canonical route responds at /api/v1/mentorship/mentors', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mentorship/mentors`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('7. Interviews questions canonical route responds at /api/v1/interviews/questions', async () => {
    const res = await fetch(`${baseUrl}/api/v1/interviews/questions`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('8. Auth canonical route responds at /api/v1/auth/login and rejects invalid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@cacareeros.com', password: 'InvalidPassword123!' }),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('Invalid email or password'));
  });

  test('9. Root bare route /jobs returns 404 (duplicate root route successfully eliminated)', async () => {
    const res = await fetch(`${baseUrl}/jobs`);
    assert.equal(res.status, 404);
  });

  test('10. Root bare route /billing/plans returns 404 (duplicate root route successfully eliminated)', async () => {
    const res = await fetch(`${baseUrl}/billing/plans`);
    assert.equal(res.status, 404);
  });
});
