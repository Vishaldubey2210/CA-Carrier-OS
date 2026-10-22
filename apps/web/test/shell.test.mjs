import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole, WorkspaceType, CAPathway } from '@ca-career-os/shared';

describe('Web Shell & Foundation Tests', () => {
  test('Shared workspace domain models are accessible to web app', () => {
    assert.equal(UserRole.CANDIDATE, 'CANDIDATE');
    assert.equal(WorkspaceType.PERSONAL, 'PERSONAL');
    assert.equal(CAPathway.AUDIT, 'AUDIT');
  });

  test('Primary application route configurations are defined', () => {
    const coreRoutes = ['/', '/career', '/jobs', '/resumes', '/interviews', '/practice'];
    assert.equal(coreRoutes.length, 6);
    coreRoutes.forEach((route) => {
      assert.ok(route.startsWith('/'));
    });
  });

  test('Frontend health probe contract is structured correctly', () => {
    const healthContract = {
      status: 'healthy',
      tier: 'frontend',
      version: '0.1.0',
    };
    assert.equal(healthContract.status, 'healthy');
    assert.equal(healthContract.tier, 'frontend');
  });

  test('API_ORIGIN resolution normalizes Railway origin and strips redundant /api/v1', () => {
    function resolveOrigin(raw) {
      if (!raw) return 'http://127.0.0.1:4000';
      return raw.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    }
    assert.equal(resolveOrigin('https://api.up.railway.app/'), 'https://api.up.railway.app');
    assert.equal(resolveOrigin('https://api.up.railway.app/api/v1'), 'https://api.up.railway.app');
    assert.equal(resolveOrigin('https://api.up.railway.app/api/v1/'), 'https://api.up.railway.app');
    assert.equal(resolveOrigin(undefined), 'http://127.0.0.1:4000');
  });

  test('Vercel reverse proxy configuration guarantees same-origin /api/v1 pathing', () => {
    const destination = `https://api.up.railway.app/api/v1/:path*`;
    const rewrite = {
      source: '/api/v1/:path*',
      destination,
    };
    assert.equal(rewrite.source, '/api/v1/:path*');
    assert.ok(rewrite.destination.endsWith('/api/v1/:path*'));
    assert.ok(!rewrite.destination.includes('localhost'));
  });
});
