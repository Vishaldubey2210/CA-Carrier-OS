/**
 * CA Career OS — Centralized Typed API Client
 * Standardized network communication with canonical /api/v1 routing,
 * cookie credentials, typed response envelopes, and error normalization.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private normalizeUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    // Ensure canonical /api/v1 prefix
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (!cleanEndpoint.startsWith('/api/v1')) {
      cleanEndpoint = `/api/v1${cleanEndpoint}`;
    }

    const url = new URL(cleanEndpoint, typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3000');

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
    const { params, headers, ...restOptions } = options;
    const url = this.normalizeUrl(endpoint, params);

    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
      ...((restOptions.body && !(restOptions.body instanceof FormData)) ? { 'Content-Type': 'application/json' } : {}),
      ...(headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: defaultHeaders,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!response.ok) {
        let errorData: any = {};
        if (isJson) {
          try {
            errorData = await response.json();
          } catch {
            // Non-parseable JSON error
          }
        }
        const message = errorData?.error?.message || errorData?.message || `Request failed with HTTP ${response.status}`;
        const code = errorData?.error?.code || `HTTP_${response.status}`;
        throw new ApiError(response.status, code, message, errorData?.error?.details || errorData?.errors);
      }

      if (isJson) {
        const payload = await response.json();
        // If NestJS wrapped in createSuccessResponse: payload is { success: true, data: ... }
        if (typeof payload?.success === 'boolean') {
          return payload as ApiResponse<T>;
        }
        return { success: true, data: payload as T, timestamp: new Date().toISOString() };
      }

      return { success: true, data: undefined as unknown as T, timestamp: new Date().toISOString() };
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(0, 'NETWORK_ERROR', err?.message || 'Network communication failure');
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
