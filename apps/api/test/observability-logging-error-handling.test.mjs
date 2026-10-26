import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeString, redactSensitiveData, isSensitiveKey } from '../dist/common/logger/redaction.util.js';
import { RequestContextService } from '../dist/common/context/request-context.service.js';
import { StructuredLoggerService } from '../dist/common/logger/structured-logger.service.js';
import { HttpExceptionFilter } from '../dist/common/filters/http-exception.filter.js';
import { Prisma } from '@prisma/client';
import { HttpStatus, HttpException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ZodError, z } from 'zod';
import { RazorpayService } from '../dist/modules/billing/razorpay.service.js';
import { BillingService } from '../dist/modules/billing/billing.service.js';

test('Observability & Privacy: Redaction and Log Sanitization Suite', async (t) => {
  await t.test('1. sanitizeString strips ASCII control characters to prevent log injection', () => {
    const maliciousInput = 'AdminUser\r\n[CRITICAL] Server compromised!\x00\x1B';
    const sanitized = sanitizeString(maliciousInput);
    assert.strictEqual(sanitized, 'AdminUser[CRITICAL] Server compromised!');
    assert.ok(!sanitized.includes('\r'));
    assert.ok(!sanitized.includes('\n'));
    assert.ok(!sanitized.includes('\x00'));
    assert.ok(!sanitized.includes('\x1B'));
  });

  await t.test('2. sanitizeString truncates strings longer than 4000 characters', () => {
    const hugeString = 'A'.repeat(5000);
    const sanitized = sanitizeString(hugeString);
    assert.strictEqual(sanitized.length, 4000 + '... [TRUNCATED]'.length);
    assert.ok(sanitized.endsWith('... [TRUNCATED]'));
  });

  await t.test('3. isSensitiveKey accurately identifies credentials and security tokens', () => {
    assert.strictEqual(isSensitiveKey('password'), true);
    assert.strictEqual(isSensitiveKey('user_password_hash'), true);
    assert.strictEqual(isSensitiveKey('otpCode'), true);
    assert.strictEqual(isSensitiveKey('jwtToken'), true);
    assert.strictEqual(isSensitiveKey('authorization'), true);
    assert.strictEqual(isSensitiveKey('cookie'), true);
    assert.strictEqual(isSensitiveKey('razorpay_signature'), true);
    assert.strictEqual(isSensitiveKey('database_url'), true);
    assert.strictEqual(isSensitiveKey('smtp_pass'), true);

    // Non-sensitive keys
    assert.strictEqual(isSensitiveKey('firstName'), false);
    assert.strictEqual(isSensitiveKey('status'), false);
    assert.strictEqual(isSensitiveKey('createdAt'), false);
  });

  await t.test('4. redactSensitiveData deep-masks secrets and sanitizes embedded strings', () => {
    const payload = {
      email: 'ca.candidate@example.com',
      password: 'SuperSecretPassword123!',
      otp: '482910',
      nested: {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        database_url: 'postgresql://admin:secretPass@db.railway.internal:5432/production',
        authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
      metadata: {
        normalField: 'Valid text\r\nwith control chars\x00',
      },
    };

    const redacted = redactSensitiveData(payload);

    assert.strictEqual(redacted.email, 'ca.candidate@example.com');
    assert.strictEqual(redacted.password, '[REDACTED]');
    assert.strictEqual(redacted.otp, '[REDACTED]');
    assert.strictEqual(redacted.nested.refreshToken, '[REDACTED]');
    assert.strictEqual(redacted.nested.database_url, '[REDACTED]');
    assert.strictEqual(redacted.metadata.normalField, 'Valid textwith control chars');
  });

  await t.test('5. redactSensitiveData strips credentials from connection strings and Bearer tokens in raw strings', () => {
    const rawLog = 'Connecting to postgresql://postgres:prodPass123@db.railway.com:5432/ca_db with token Bearer secret_token_xyz_123';
    const redacted = redactSensitiveData(rawLog);

    assert.ok(!redacted.includes('prodPass123'));
    assert.ok(!redacted.includes('secret_token_xyz_123'));
    assert.ok(redacted.includes('postgresql://[REDACTED_USER]:[REDACTED_PASSWORD]@[REDACTED_HOST]'));
    assert.ok(redacted.includes('Bearer [REDACTED_TOKEN]'));
  });
});

test('Request Context & Correlation Tracking Suite', async (t) => {
  await t.test('1. RequestContextService propagates correlationId across async boundaries', async () => {
    const correlationId = 'test-corr-uuid-12345';

    await RequestContextService.run({ correlationId, workspaceId: 'ws-999' }, async () => {
      // Direct access inside scope
      assert.strictEqual(RequestContextService.getCorrelationId(), correlationId);
      assert.strictEqual(RequestContextService.getWorkspaceId(), 'ws-999');

      // Async delay boundary
      await new Promise((resolve) => setTimeout(resolve, 10));

      assert.strictEqual(RequestContextService.getCorrelationId(), correlationId);
      assert.strictEqual(RequestContextService.getWorkspaceId(), 'ws-999');
    });

    // Outside scope returns fallback
    assert.strictEqual(RequestContextService.getCorrelationId(), 'no-correlation-id');
  });
});

test('API Error Filter & Prisma Exception Mapping Suite', async (t) => {
  const filter = new HttpExceptionFilter();

  function mockHost(requestOverrides = {}) {
    let capturedStatus = 0;
    let capturedJson = null;
    let capturedHeaders = {};

    const res = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(payload) {
        capturedJson = payload;
        return this;
      },
      setHeader(k, v) {
        capturedHeaders[k.toLowerCase()] = v;
      },
      headersSent: false,
    };

    const req = {
      method: 'POST',
      originalUrl: '/api/v1/auth/register',
      correlationId: 'req-corr-7788',
      ...requestOverrides,
    };

    const host = {
      switchToHttp() {
        return {
          getRequest: () => req,
          getResponse: () => res,
        };
      },
    };

    return { host, getStatus: () => capturedStatus, getJson: () => capturedJson, getHeaders: () => capturedHeaders };
  }

  await t.test('1. Maps standard NestJS HttpException to standardized envelope and real status', () => {
    const { host, getStatus, getJson, getHeaders } = mockHost();
    const exception = new NotFoundException('The requested job listing was not found');

    filter.catch(exception, host);

    assert.strictEqual(getStatus(), HttpStatus.NOT_FOUND);
    const json = getJson();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'NOT_FOUND');
    assert.strictEqual(json.error.message, 'The requested job listing was not found');
    assert.strictEqual(json.error.correlationId, 'req-corr-7788');
    assert.strictEqual(getHeaders()['x-request-id'], 'req-corr-7788');
  });

  await t.test('2. Maps ZodError to 400 Bad Request with field-level details', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    let zodErr;
    try {
      schema.parse({ email: 'invalid-email', age: 16 });
    } catch (e) {
      zodErr = e;
    }

    const { host, getStatus, getJson } = mockHost();
    filter.catch(zodErr, host);

    assert.strictEqual(getStatus(), HttpStatus.BAD_REQUEST);
    const json = getJson();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'BAD_REQUEST');
    assert.strictEqual(json.error.message, 'Validation failed');
    assert.ok(Array.isArray(json.error.details));
    assert.strictEqual(json.error.details.length, 2);
  });

  await t.test('3. Maps Prisma P2002 (Unique constraint violation) to 409 Conflict', () => {
    const prismaErr = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      {
        code: 'P2002',
        clientVersion: '6.4.0',
        meta: { target: ['email'] },
      }
    );

    const { host, getStatus, getJson } = mockHost();
    filter.catch(prismaErr, host);

    assert.strictEqual(getStatus(), HttpStatus.CONFLICT);
    const json = getJson();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'CONFLICT');
    assert.ok(json.error.message.includes('email'));
    assert.strictEqual(json.error.details[0].field, 'email');
  });

  await t.test('4. Maps Prisma P2025 (Record not found) to 404 Not Found', () => {
    const prismaErr = new Prisma.PrismaClientKnownRequestError(
      'An operation failed because it depends on one or more records that were required but not found',
      {
        code: 'P2025',
        clientVersion: '6.4.0',
      }
    );

    const { host, getStatus, getJson } = mockHost();
    filter.catch(prismaErr, host);

    assert.strictEqual(getStatus(), HttpStatus.NOT_FOUND);
    const json = getJson();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'NOT_FOUND');
    assert.strictEqual(json.error.message, 'The requested resource was not found');
  });

  await t.test('5. Maps Prisma Initialization / Database down error to 503 Service Unavailable', () => {
    const initErr = new Prisma.PrismaClientInitializationError(
      'Can not reach database server at localhost:5432. Connection refused.',
      '6.4.0'
    );

    const { host, getStatus, getJson } = mockHost();
    filter.catch(initErr, host);

    assert.strictEqual(getStatus(), HttpStatus.SERVICE_UNAVAILABLE);
    const json = getJson();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'SERVICE_UNAVAILABLE');
    assert.strictEqual(json.error.message, 'Database service is currently unavailable. Please try again shortly.');
  });
});

test('Billing & Webhook Resilience Suite', async (t) => {
  const rzp = new RazorpayService();
  const billing = new BillingService(null, rzp);

  await t.test('1. Invalid webhook signature throws 401 Unauthorized without crashing', async () => {
    const rawBody = JSON.stringify({ event: 'payment.captured', id: 'evt_1' });
    const invalidSig = 'forged_fake_signature_hex';

    await assert.rejects(
      async () => {
        await billing.processWebhook(rawBody, invalidSig, JSON.parse(rawBody));
      },
      (err) => {
        const statusCode = typeof err.getStatus === 'function' ? err.getStatus() : err.status;
        assert.strictEqual(statusCode, 401);
        assert.ok(err.message.includes('Invalid Razorpay webhook signature'));
        return true;
      }
    );
  });

  await t.test('2. Valid webhook processes successfully and deduplicates duplicate event idempotently', async () => {
    const eventId = `evt_test_${Date.now()}`;
    const payloadObj = {
      id: eventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            notes: {
              workspaceId: 'ws_demo_1',
              planTier: 'PRO_CANDIDATE',
              billingCycle: 'ANNUAL',
            },
          },
        },
      },
    };
    const rawBody = JSON.stringify(payloadObj);
    const validSignature = rzp.generateTestSignature(rawBody);

    // First attempt: should succeed and activate
    const res1 = await billing.processWebhook(rawBody, validSignature, payloadObj);
    assert.strictEqual(res1.status, 'PROCESSED');
    assert.strictEqual(res1.eventId, eventId);

    // Second attempt (duplicate webhook delivery from payment gateway): must be ignored idempotently
    const res2 = await billing.processWebhook(rawBody, validSignature, payloadObj);
    assert.strictEqual(res2.status, 'IGNORED');
    assert.strictEqual(res2.actionTaken, 'ALREADY_PROCESSED');
  });
});
