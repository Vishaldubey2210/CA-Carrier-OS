import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { createErrorResponse, ApiErrorResponse } from '@ca-career-os/shared';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware.js';
import { RequestContextService } from '../context/request-context.service.js';
import { redactSensitiveData, sanitizeString } from '../logger/redaction.util.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithCorrelationId>();

    const correlationId =
      request?.correlationId ||
      RequestContextService.getCorrelationId();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';
    let details: Array<{ field: string; issue: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      errorCode = HttpStatus[status] || 'HTTP_ERROR';

      if (typeof res === 'string') {
        errorMessage = res;
      } else if (typeof res === 'object' && res !== null) {
        const anyRes = res as Record<string, any>;
        errorMessage = anyRes.message || exception.message;
        if (Array.isArray(anyRes.message)) {
          errorMessage = 'Validation failed';
          details = anyRes.message.map((msg: string) => ({
            field: 'request',
            issue: sanitizeString(String(msg)),
          }));
        }
        if (anyRes.error) {
          errorCode = String(anyRes.error).replace(/\s+/g, '_').toUpperCase();
        }
        if (anyRes.code && typeof anyRes.code === 'string') {
          errorCode = anyRes.code;
        }
        if (anyRes.details && Array.isArray(anyRes.details)) {
          details = anyRes.details;
        }
      }
    } else if (
      exception &&
      typeof exception === 'object' &&
      (('name' in exception && (exception as any).name === 'ZodError') || 'issues' in exception)
    ) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'BAD_REQUEST';
      errorMessage = 'Validation failed';
      const zodIssues = (exception as any).issues || [];
      details = zodIssues.map((issue: any) => ({
        field: Array.isArray(issue.path) ? issue.path.join('.') : 'request',
        issue: sanitizeString(issue.message || 'Invalid value'),
      }));
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Map Prisma error codes to standardized HTTP responses
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          errorCode = 'CONFLICT';
          const target = (exception.meta?.target as string[]) || [];
          const field = Array.isArray(target) ? target.join(', ') : 'field';
          errorMessage = `A record with this ${field || 'value'} already exists`;
          details = [{ field: field || 'record', issue: 'Unique constraint violation' }];
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          errorCode = 'NOT_FOUND';
          errorMessage = 'The requested resource was not found';
          break;
        }
        case 'P2003': {
          status = HttpStatus.CONFLICT;
          errorCode = 'CONFLICT';
          errorMessage = 'Foreign key constraint violation on related entity';
          break;
        }
        case 'P2014': {
          status = HttpStatus.CONFLICT;
          errorCode = 'CONFLICT';
          errorMessage = 'The requested action would violate required relation integrity';
          break;
        }
        case 'P2024': {
          status = HttpStatus.SERVICE_UNAVAILABLE;
          errorCode = 'SERVICE_UNAVAILABLE';
          errorMessage = 'Database connection pool timed out. Please retry shortly.';
          break;
        }
        default: {
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          errorCode = 'DATABASE_ERROR';
          errorMessage =
            process.env.NODE_ENV === 'production'
              ? 'Database operation failed'
              : `Database error (${exception.code}): ${exception.message}`;
          break;
        }
      }
      this.logger.error(
        `Prisma error [${exception.code}] on ${request?.method} ${request?.originalUrl} (correlation: ${correlationId}): ${exception.message}`
      );
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      errorCode = 'SERVICE_UNAVAILABLE';
      errorMessage = 'Database service is currently unavailable. Please try again shortly.';
      this.logger.error(`Prisma connection error: ${exception.message}`);
    } else if (exception instanceof Error) {
      errorMessage =
        process.env.NODE_ENV === 'production'
          ? `An unexpected error occurred. Reference ID: ${correlationId}`
          : sanitizeString(exception.message);
      this.logger.error(
        `Unhandled error [${correlationId}] on ${request?.method} ${request?.originalUrl}: ${exception.message}`,
        exception.stack
      );
    }

    // Ensure response has x-request-id header
    if (correlationId && !response.headersSent) {
      response.setHeader('x-request-id', correlationId);
    }

    const errorPayload: ApiErrorResponse = createErrorResponse(
      errorCode,
      errorMessage,
      details,
      correlationId
    );

    response.status(status).json(errorPayload);
  }
}
