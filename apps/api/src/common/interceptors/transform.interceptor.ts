import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createSuccessResponse, ApiResponse } from '@ca-career-os/shared';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware.js';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest<RequestWithCorrelationId>();
    const correlationId = req?.correlationId;

    return next.handle().pipe(
      map((data) => {
        // If data is already an envelope response, return as is
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }
        return createSuccessResponse(data, { correlationId });
      })
    );
  }
}
