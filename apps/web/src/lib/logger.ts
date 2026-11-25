/**
 * EZapply — Production-Grade Universal Structured Logger
 * Operates across Next.js Client Components, Server Components, and Serverless API Routes.
 * Automatic privacy redaction, correlation tracking, and JSON serialization in production.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  correlationId?: string;
  meta?: Record<string, any>;
  durationMs?: number;
}

const SENSITIVE_KEYS = [
  /password/i,
  /token/i,
  /secret/i,
  /otp/i,
  /credential/i,
  /auth_pass/i,
  /smtp_pass/i,
  /pan_number/i,
  /credit_card/i,
];

function sanitizeMeta(meta?: Record<string, any>): Record<string, any> | undefined {
  if (!meta || typeof meta !== 'object') return meta;
  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.some((pattern) => pattern.test(key))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'string' && val.length > 300) {
      sanitized[key] = `${val.slice(0, 300)}... [TRUNCATED]`;
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      sanitized[key] = sanitizeMeta(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

class UniversalLogger {
  private isProduction = process.env.NODE_ENV === 'production';

  private output(level: LogLevel, context: string, message: string, meta?: Record<string, any>, correlationId?: string, durationMs?: number) {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      correlationId: correlationId || (typeof window !== 'undefined' ? localStorage?.getItem?.('ca_os_corr') || undefined : undefined),
      meta: sanitizeMeta(meta),
      ...(durationMs !== undefined ? { durationMs } : {}),
    };

    if (this.isProduction || typeof window === 'undefined') {
      // Vercel Serverless & Production runtime structured JSON
      const jsonLine = JSON.stringify(payload);
      if (level === 'ERROR') {
        console.error(jsonLine);
      } else if (level === 'WARN') {
        console.warn(jsonLine);
      } else {
        console.log(jsonLine);
      }
    } else {
      // Development Browser Pretty Console
      const color =
        level === 'ERROR'
          ? '#ef4444'
          : level === 'WARN'
          ? '#f59e0b'
          : level === 'INFO'
          ? '#10b981'
          : '#6b7280';
      console.log(
        `%c[${payload.level}] [${payload.context}] ${payload.message}`,
        `color: ${color}; font-weight: bold;`,
        payload.meta || ''
      );
    }
  }

  debug(context: string, message: string, meta?: Record<string, any>, correlationId?: string) {
    if (!this.isProduction) {
      this.output('DEBUG', context, message, meta, correlationId);
    }
  }

  info(context: string, message: string, meta?: Record<string, any>, correlationId?: string, durationMs?: number) {
    this.output('INFO', context, message, meta, correlationId, durationMs);
  }

  warn(context: string, message: string, meta?: Record<string, any>, correlationId?: string, durationMs?: number) {
    this.output('WARN', context, message, meta, correlationId, durationMs);
  }

  error(context: string, message: string, errorOrMeta?: any, correlationId?: string, durationMs?: number) {
    const meta = errorOrMeta instanceof Error
      ? { name: errorOrMeta.name, message: errorOrMeta.message, stack: errorOrMeta.stack?.split('\n').slice(0, 3).join(' ') }
      : errorOrMeta;
    this.output('ERROR', context, message, meta, correlationId, durationMs);
  }
}

export const logger = new UniversalLogger();
