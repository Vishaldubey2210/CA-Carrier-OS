import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { AppModule } from '../src/app.module.js';
import { StructuredLoggerService } from '../src/common/logger/structured-logger.service.js';
import { configureApp } from '../src/setup-app.js';

let cachedServer: Express | null = null;

async function bootstrapServerless(): Promise<Express> {
  const expressApp = express();
  const logger = new StructuredLoggerService('VercelServerless');

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger,
    bufferLogs: true,
  });

  configureApp(app);
  await app.init();
  return expressApp;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!cachedServer) {
    cachedServer = await bootstrapServerless();
  }
  return (cachedServer as any)(req, res);
}
