import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestStore {
  correlationId: string;
  workspaceId?: string;
  userId?: string;
  clientIp?: string;
  method?: string;
  url?: string;
  startTime?: number;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestStore>();

@Injectable()
export class RequestContextService {
  /**
   * Run an asynchronous function within the supplied request store context.
   */
  static run<T>(store: RequestStore, callback: () => T): T {
    return asyncLocalStorage.run(store, callback);
  }

  /**
   * Get the current store from AsyncLocalStorage.
   */
  static getStore(): RequestStore | undefined {
    return asyncLocalStorage.getStore();
  }

  /**
   * Get the current correlation / request ID, or generate a safe fallback.
   */
  static getCorrelationId(): string {
    const store = asyncLocalStorage.getStore();
    return store?.correlationId || 'no-correlation-id';
  }

  /**
   * Get the active workspace ID from context if present.
   */
  static getWorkspaceId(): string | undefined {
    return asyncLocalStorage.getStore()?.workspaceId;
  }

  /**
   * Get the active user ID from context if present.
   */
  static getUserId(): string | undefined {
    return asyncLocalStorage.getStore()?.userId;
  }

  /**
   * Enrich the current context with additional fields (e.g. after auth guard identifies user/workspace).
   */
  static setContext(fields: Partial<RequestStore>): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      Object.assign(store, fields);
    }
  }
}
