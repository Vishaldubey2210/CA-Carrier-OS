import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware.js';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithCorrelationId>();
    const res = http.getResponse();

    const { method, originalUrl } = req;
    const correlationId = req.correlationId || 'none';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(
            JSON.stringify({
              level: 'info',
              correlationId,
              method,
              url: originalUrl,
              statusCode,
              durationMs: duration,
              timestamp: new Date().toISOString(),
            })
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const statusCode = err.status || 500;
          this.logger.error(
            JSON.stringify({
              level: 'error',
              correlationId,
              method,
              url: originalUrl,
              statusCode,
              durationMs: duration,
              errorName: err.name,
              timestamp: new Date().toISOString(),
            })
          );
        },
      })
    );
  }
}
