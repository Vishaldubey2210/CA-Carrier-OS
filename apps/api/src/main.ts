import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './common/config/env.config.js';
import { StructuredLoggerService } from './common/logger/structured-logger.service.js';
import { configureApp } from './setup-app.js';

async function bootstrap() {
  const logger = new StructuredLoggerService('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  });

  // Apply unified CORS, filters, and interceptors
  configureApp(app);

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const handleShutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Initiating graceful shutdown...`);
    const shutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10000ms. Forcing process termination.');
      process.exit(1);
    }, 10000);
    shutdownTimer.unref();

    try {
      await app.close();
      logger.log('HTTP server and background dependencies cleanly closed.');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during graceful shutdown: ${err?.message}`);
      process.exit(1);
    }
  };

  process.once('SIGTERM', () => handleShutdown('SIGTERM'));
  process.once('SIGINT', () => handleShutdown('SIGINT'));

  await app.listen(env.PORT, '0.0.0.0');
  logger.log(`🚀 CA Career OS API running on http://localhost:${env.PORT}`);
  logger.log(`Health check: http://localhost:${env.PORT}/api/v1/health`);
  logger.log(`Readiness check: http://localhost:${env.PORT}/api/v1/health/ready`);
}

bootstrap().catch((err) => {
  const bootstrapLogger = new StructuredLoggerService('Bootstrap');
  bootstrapLogger.fatal(`Fatal bootstrap error: ${err?.message || err}`, undefined, { error: err });
  process.exit(1);
});
