import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { RequestContextService } from '../context/request-context.service.js';

export interface RequestWithCorrelationId extends Request {
  correlationId?: string;
}

const VALID_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithCorrelationId, res: Response, next: NextFunction): void {
    const rawHeader =
      (req.headers['x-request-id'] as string) ||
      (req.headers['x-correlation-id'] as string);

    // Validate and sanitize externally supplied request ID; generate safe UUID if invalid or absent
    const correlationId =
      rawHeader && VALID_ID_PATTERN.test(rawHeader)
        ? rawHeader
        : randomUUID();

    req.correlationId = correlationId;
    res.setHeader('x-request-id', correlationId);

    RequestContextService.run(
      {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        clientIp: req.ip,
        startTime: Date.now(),
      },
      () => {
        next();
      }
    );
  }
}

