import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { HealthService } from '../dist/modules/health/health.service.js';
import { validateEnv } from '../dist/common/config/env.config.js';
import { createSuccessResponse, createErrorResponse } from '@ca-career-os/shared';

describe('API Foundation & Health Tests', () => {
  test('validateEnv provides default valid environment in dev/test', () => {
    const config = validateEnv();
    assert.equal(typeof config.PORT, 'number');
    assert.ok(config.DATABASE_URL.includes('postgresql://'));
    assert.ok(config.JWT_SECRET.length >= 16);
  });

  test('HealthService returns liveness status', () => {
    const mockPrisma = {
      checkHealth: async () => ({ status: 'up', latencyMs: 5 }),
    };
    const healthService = new HealthService(mockPrisma);
    const liveness = healthService.getLiveness();

    assert.equal(liveness.status, 'healthy');
    assert.equal(typeof liveness.uptimeSeconds, 'number');
    assert.ok(liveness.timestamp);
  });

  test('HealthService returns readiness status with services', async () => {
    const mockPrisma = {
      checkHealth: async () => ({ status: 'up', latencyMs: 3 }),
    };
    const healthService = new HealthService(mockPrisma);
    const readiness = await healthService.getReadiness();

    assert.equal(readiness.status, 'healthy');
    assert.equal(readiness.services.database.status, 'up');
    assert.equal(readiness.services.redis.status, 'up');
  });

  test('HealthService gracefully handles degraded database in test/development', async () => {
    const mockPrisma = {
      checkHealth: async () => ({ status: 'down', message: 'Connection refused' }),
    };
    const healthService = new HealthService(mockPrisma);
    const readiness = await healthService.getReadiness();

    assert.equal(readiness.status, 'degraded');
    assert.equal(readiness.services.database.status, 'degraded');
    assert.ok(readiness.services.database.message.includes('Connection refused'));
  });

  test('createSuccessResponse formats envelope correctly with correlation ID', () => {
    const res = createSuccessResponse({ message: 'ok' }, { correlationId: 'req-123' });
    assert.equal(res.success, true);
    assert.deepEqual(res.data, { message: 'ok' });
    assert.equal(res.meta.correlationId, 'req-123');
  });

  test('createErrorResponse formats envelope correctly', () => {
    const err = createErrorResponse('NOT_FOUND', 'Entity not found', undefined, 'req-456');
    assert.equal(err.success, false);
    assert.equal(err.error.code, 'NOT_FOUND');
    assert.equal(err.error.message, 'Entity not found');
    assert.equal(err.error.correlationId, 'req-456');
  });
});
