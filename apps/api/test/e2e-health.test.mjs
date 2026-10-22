import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { HttpExceptionFilter } from '../dist/common/filters/http-exception.filter.js';
import { LoggingInterceptor } from '../dist/common/interceptors/logging.interceptor.js';
import { TransformInterceptor } from '../dist/common/interceptors/transform.interceptor.js';

describe('API Server E2E Smoke Tests', () => {
  let app;
  const testPort = 4099;

  test('NestJS application boots and responds to HTTP health checks', async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
    await app.listen(testPort);

    try {
      // Test liveness probe
      const liveRes = await fetch(`http://127.0.0.1:${testPort}/api/v1/health`);
      assert.equal(liveRes.status, 200);
      const liveBody = await liveRes.json();
      assert.equal(liveBody.success, true);
      assert.equal(liveBody.data.status, 'healthy');
      assert.ok(liveRes.headers.get('x-request-id'));

      // Test readiness probe
      const readyRes = await fetch(`http://127.0.0.1:${testPort}/api/v1/health/ready`);
      assert.equal(readyRes.status, 200);
      const readyBody = await readyRes.json();
      assert.equal(readyBody.success, true);
      assert.ok(readyBody.data.status === 'healthy' || readyBody.data.status === 'degraded');
      assert.ok(readyBody.data.services.database);
    } finally {
      await app.close();
    }
  });
});
