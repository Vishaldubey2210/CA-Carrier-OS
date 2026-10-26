import test from 'node:test';
import assert from 'node:assert/strict';
import { apiClient, ApiError } from '../src/lib/api-client.ts';
import { reportFrontendError } from '../src/lib/error-reporter.ts';

test('Frontend API Client Resilience & Error Normalization Suite', async (t) => {
  const originalFetch = globalThis.fetch;

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test('1. apiClient normalizes paths with canonical /api/v1 prefix', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (url) => {
      requestedUrl = String(url);
      return new Response(JSON.stringify({ success: true, data: { test: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'x-request-id': 'corr-url-1' },
      });
    };

    await apiClient.get('/auth/me');
    assert.ok(requestedUrl.includes('/api/v1/auth/me'));
  });

  await t.test('2. apiClient extracts correlation ID from response headers and attaches to ApiError', async () => {
    const correlationId = 'corr-err-uuid-999';
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Session expired' },
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': correlationId,
          },
        }
      );
    };

    await assert.rejects(
      async () => {
        await apiClient.get('/protected/profile');
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.code, 'UNAUTHORIZED');
        assert.strictEqual(err.message, 'Session expired');
        assert.strictEqual(err.correlationId, correlationId);
        return true;
      }
    );
  });

  await t.test('3. apiClient handles non-JSON HTML/plain-text errors gracefully (e.g. 502/504)', async () => {
    globalThis.fetch = async () => {
      return new Response('<html><body>502 Bad Gateway from Cloudflare Proxy</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      });
    };

    await assert.rejects(
      async () => {
        await apiClient.get('/health/ready');
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.strictEqual(err.statusCode, 502);
        assert.ok(err.message.includes('502 Bad Gateway'));
        return true;
      }
    );
  });

  await t.test('4. apiClient automatically retries idempotent GET requests on 503 Service Unavailable', async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return new Response('503 Service Unavailable', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      return new Response(JSON.stringify({ success: true, data: { status: 'healthy' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const res = await apiClient.get('/health', { retries: 1 });
    assert.strictEqual(callCount, 2);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.status, 'healthy');
  });

  await t.test('5. apiClient does NOT automatically retry non-idempotent POST mutations on failure', async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      return new Response(
        JSON.stringify({ success: false, error: { code: 'CONFLICT', message: 'Duplicate record' } }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    await assert.rejects(
      async () => {
        await apiClient.post('/jobs/apply', { jobId: 'job-123' });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 409);
        return true;
      }
    );

    // POST mutation must only have been attempted once
    assert.strictEqual(callCount, 1);
  });

  await t.test('6. apiClient enforces request timeout and throws TIMEOUT error', async () => {
    globalThis.fetch = async (_, { signal }) => {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(new DOMException('The user aborted a request.', 'AbortError'));
        });
      });
    };

    await assert.rejects(
      async () => {
        await apiClient.get('/slow-endpoint', { timeoutMs: 50, retries: 0 });
      },
      (err) => {
        assert.ok(err instanceof ApiError);
        assert.strictEqual(err.code, 'TIMEOUT');
        assert.ok(err.message.includes('timed out'));
        return true;
      }
    );
  });
});

test('Frontend Observability: reportFrontendError Suite', async (t) => {
  await t.test('1. reportFrontendError sanitizes sensitive metadata and outputs structured report', () => {
    const err = new Error('Failed to tailor resume');
    const report = reportFrontendError(err, {
      componentName: 'ResumeTailorModal',
      correlationId: 'client-corr-55',
      metadata: {
        candidateId: 'cand-123',
        password: 'AttemptedPasswordSecret',
        otpCode: '123456',
        pan_number: 'ABCDE1234F',
        normalNote: 'Job title: Tax Specialist',
      },
    });

    assert.strictEqual(report.name, 'Error');
    assert.strictEqual(report.message, 'Failed to tailor resume');
    assert.strictEqual(report.correlationId, 'client-corr-55');
    assert.strictEqual(report.sanitized, true);

    const meta = report.context.metadata;
    assert.strictEqual(meta.candidateId, 'cand-123');
    assert.strictEqual(meta.normalNote, 'Job title: Tax Specialist');
    assert.strictEqual(meta.password, '[REDACTED]');
    assert.strictEqual(meta.otpCode, '[REDACTED]');
    assert.strictEqual(meta.pan_number, '[REDACTED]');
  });
});
