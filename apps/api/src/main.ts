import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { env } from './common/config/env.config.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Enable CORS with strict origin validation
  const configuredOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  const allowedOrigins = new Set([
    ...configuredOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server proxy rewrites, curl, health probes)
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      // Allow preview deployments if explicitly permitted
      if (process.env.CORS_ALLOW_VERCEL_PREVIEWS === 'true' && /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-request-id',
      'x-correlation-id',
      'x-workspace-id',
    ],
  });

  // Global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(env.PORT, '0.0.0.0');
  logger.log(`🚀 CA Career OS API running on http://localhost:${env.PORT}`);
  logger.log(`Health check: http://localhost:${env.PORT}/api/v1/health`);
  logger.log(`Readiness check: http://localhost:${env.PORT}/api/v1/health/ready`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
