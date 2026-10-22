import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  UserRole,
  WorkspaceType,
  EnvConfigSchema,
  createSuccessResponse,
  createErrorResponse,
} from '../dist/index.js';

describe('Shared Library Unit Tests', () => {
  test('Enums export expected domain values', () => {
    assert.equal(UserRole.CANDIDATE, 'CANDIDATE');
    assert.equal(UserRole.RECRUITER, 'RECRUITER');
    assert.equal(WorkspaceType.PERSONAL, 'PERSONAL');
    assert.equal(WorkspaceType.ORGANIZATION, 'ORGANIZATION');
  });

  test('EnvConfigSchema validates defaults safely', () => {
    const config = EnvConfigSchema.parse({});
    assert.equal(config.NODE_ENV, 'development');
    assert.equal(config.PORT, 4000);
    assert.equal(config.WEB_PORT, 3000);
    assert.ok(config.DATABASE_URL.includes('postgresql://'));
  });

  test('createSuccessResponse creates valid standardized envelope', () => {
    const res = createSuccessResponse({ user: 'CA Rahul' }, { correlationId: 'test-req-123', page: 1, limit: 10, total: 25 });
    assert.equal(res.success, true);
    assert.deepEqual(res.data, { user: 'CA Rahul' });
    assert.equal(res.meta.correlationId, 'test-req-123');
    assert.equal(res.meta.pagination?.totalPages, 3);
  });

  test('createErrorResponse creates valid standardized error envelope', () => {
    const err = createErrorResponse('VALIDATION_FAILED', 'Invalid input', [{ field: 'email', issue: 'Invalid email' }], 'test-req-456');
    assert.equal(err.success, false);
    assert.equal(err.error.code, 'VALIDATION_FAILED');
    assert.equal(err.error.message, 'Invalid input');
    assert.equal(err.error.details?.[0].field, 'email');
    assert.equal(err.error.correlationId, 'test-req-456');
  });
});
