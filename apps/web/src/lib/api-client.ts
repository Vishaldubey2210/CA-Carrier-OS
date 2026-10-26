/**
 * CA Career OS — Centralized Typed API Client
 * Standardized network communication with canonical /api/v1 routing,
 * cookie credentials, typed response envelopes, correlation ID extraction,
 * timeout controls, safe idempotent retries, and offline detection.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    correlationId?: string;
  };
  meta?: {
    correlationId?: string;
    timestamp?: string;
    pagination?: any;
  };
  timestamp?: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly correlationId?: string;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: any,
    correlationId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.correlationId = correlationId;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  retries?: number;
}

class ApiClient {
  private readonly defaultTimeoutMs = 15000; // 15 seconds default timeout

  private normalizeUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    // Ensure canonical /api/v1 prefix
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (!cleanEndpoint.startsWith('/api/v1')) {
      cleanEndpoint = `/api/v1${cleanEndpoint}`;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3000';
    const url = new URL(cleanEndpoint, origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return `${url.pathname}${url.search}`;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // 1. Instant offline detection in browser
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new ApiError(
        0,
        'OFFLINE',
        'You appear to be offline. Please verify your network connection and try again.'
      );
    }

    const {
      params,
      headers,
      timeoutMs = this.defaultTimeoutMs,
      retries,
      signal: userSignal,
      ...restOptions
    } = options;

    const method = (restOptions.method || 'GET').toUpperCase();
    const url = this.normalizeUrl(endpoint, params);

    // Only allow retries on idempotent read requests (GET, HEAD)
    const isIdempotent = method === 'GET' || method === 'HEAD';
    const maxRetries = retries !== undefined ? retries : (isIdempotent ? 1 : 0);

    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(restOptions.body && !(restOptions.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...((headers as Record<string, string>) || {}),
    };

    // Attach Bearer token and active workspace ID if available in browser session
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('ca_os_token');
        const userStr = localStorage.getItem('ca_os_user');
        if (token && !defaultHeaders['Authorization'] && !defaultHeaders['authorization']) {
          defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else if (userStr) {
          // Zero-token demo session fallback
          defaultHeaders['x-demo-mode'] = 'true';
        }
        const activeWsStr = localStorage.getItem('ca_os_active_ws');
        if (activeWsStr && !defaultHeaders['x-workspace-id']) {
          const activeWs = JSON.parse(activeWsStr);
          if (activeWs?.id) {
            defaultHeaders['x-workspace-id'] = activeWs.id;
          }
        }
      } catch {
        // Fallback gracefully on storage access errors
      }
    }

    let attempt = 0;
    while (true) {
      attempt++;

      // Set up timeout via AbortController
      const controller = new AbortController();
      let timedOut = false;
      const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      // Chain user's signal if supplied
      if (userSignal) {
        userSignal.addEventListener('abort', () => controller.abort());
      }

      try {
        const response = await fetch(url, {
          ...restOptions,
          headers: defaultHeaders,
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const correlationId =
          response.headers.get('x-request-id') ||
          response.headers.get('x-correlation-id') ||
          undefined;

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!response.ok) {
          // Transparent 401 recovery for demo sessions: automatically acquire fresh demo token and retry once
          if (response.status === 401 && attempt === 1 && typeof window !== 'undefined') {
            try {
              const userStr = localStorage.getItem('ca_os_user');
              const role = userStr ? JSON.parse(userStr)?.role : 'CANDIDATE';
              const demoRes = await fetch('/api/v1/auth/demo-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: role || 'CANDIDATE' }),
              });
              if (demoRes.ok) {
                const demoJson = await demoRes.json();
                const newToken = demoJson.data?.accessToken;
                const newWsId = demoJson.data?.defaultWorkspaceId;
                if (newToken) {
                  localStorage.setItem('ca_os_token', newToken);
                  defaultHeaders['Authorization'] = `Bearer ${newToken}`;
                  if (newWsId && !defaultHeaders['x-workspace-id']) {
                    defaultHeaders['x-workspace-id'] = newWsId;
                  }
                  continue; // Retry request with fresh token
                }
              }
            } catch {
              // Proceed with standard error
            }
          }

          let errorData: any = {};
          if (isJson) {
            try {
              errorData = await response.json();
            } catch {
              // Fallback if JSON parsing fails
            }
          } else {
            // Read non-JSON error (e.g. 502/504 plain text/HTML from proxy)
            try {
              const rawText = await response.text();
              const snippet = rawText.replace(/<[^>]*>?/gm, '').trim().slice(0, 200);
              errorData = { message: snippet || `HTTP ${response.status} Error` };
            } catch {
              // Ignore text read error
            }
          }

          const message =
            errorData?.error?.message ||
            errorData?.message ||
            `Request failed with HTTP ${response.status}`;

          const code =
            errorData?.error?.code ||
            (response.status === 400
              ? 'BAD_REQUEST'
              : response.status === 401
              ? 'UNAUTHORIZED'
              : response.status === 403
              ? 'FORBIDDEN'
              : response.status === 404
              ? 'NOT_FOUND'
              : response.status === 409
              ? 'CONFLICT'
              : response.status === 422
              ? 'UNPROCESSABLE_ENTITY'
              : response.status === 429
              ? 'TOO_MANY_REQUESTS'
              : response.status === 503
              ? 'SERVICE_UNAVAILABLE'
              : `HTTP_${response.status}`);

          const finalCorrId = errorData?.error?.correlationId || correlationId;

          // Safe bounded retry for transient 502/503/504 on idempotent requests
          if (
            isIdempotent &&
            attempt <= maxRetries &&
            (response.status === 502 || response.status === 503 || response.status === 504)
          ) {
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
            continue;
          }

          throw new ApiError(
            response.status,
            code,
            message,
            errorData?.error?.details || errorData?.errors,
            finalCorrId
          );
        }

        if (isJson) {
          const payload = await response.json();
          if (typeof payload?.success === 'boolean') {
            return payload as ApiResponse<T>;
          }
          return {
            success: true,
            data: payload as T,
            meta: { correlationId, timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: undefined as unknown as T,
          meta: { correlationId, timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err instanceof ApiError) {
          throw err;
        }

        if (timedOut) {
          throw new ApiError(
            0,
            'TIMEOUT',
            `Request timed out after ${timeoutMs / 1000} seconds. Please check your connectivity and try again.`
          );
        }

        // Handle retry on network disconnect for idempotent queries
        if (isIdempotent && attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
          continue;
        }

        throw new ApiError(
          0,
          'NETWORK_ERROR',
          err?.message || 'Network communication failure. Please verify server connectivity.'
        );
      }
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
