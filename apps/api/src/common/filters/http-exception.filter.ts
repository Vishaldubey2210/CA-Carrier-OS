import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { createErrorResponse, ApiErrorResponse } from '@ca-career-os/shared';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithCorrelationId>();

    const correlationId = request?.correlationId;
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
            issue: msg,
          }));
        }
        if (anyRes.error) {
          errorCode = String(anyRes.error).replace(/\s+/g, '_').toUpperCase();
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
        issue: issue.message || 'Invalid value',
      }));
    } else if (exception instanceof Error) {
      errorMessage =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception.message;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
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
