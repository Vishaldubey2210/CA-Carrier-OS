/**
 * CA Career OS — Frontend Observability & Error Reporter
 * Captures runtime UI/client exceptions with privacy sanitization
 * (redacting passwords, OTPs, auth tokens, financial records, and resume text).
 */

export interface ErrorReportContext {
  componentName?: string;
  action?: string;
  correlationId?: string;
  statusCode?: number;
  route?: string;
  metadata?: Record<string, any>;
}

export interface ClientErrorReport {
  timestamp: string;
  message: string;
  name: string;
  route: string;
  correlationId?: string;
  context?: ErrorReportContext;
  sanitized: true;
}

const SENSITIVE_PATTERNS = [
  /password/i,
  /otp/i,
  /token/i,
  /secret/i,
  /credit_card/i,
  /resume_text/i,
  /pan_number/i,
  /gstin/i,
];

function sanitizeContext(ctx?: ErrorReportContext): ErrorReportContext | undefined {
  if (!ctx) return undefined;
  const cleaned: ErrorReportContext = { ...ctx };

  if (cleaned.metadata) {
    const safeMeta: Record<string, any> = {};
    for (const [key, val] of Object.entries(cleaned.metadata)) {
      if (SENSITIVE_PATTERNS.some((p) => p.test(key))) {
        safeMeta[key] = '[REDACTED]';
      } else if (typeof val === 'string' && val.length > 500) {
        safeMeta[key] = val.slice(0, 500) + '... [TRUNCATED]';
      } else {
        safeMeta[key] = val;
      }
    }
    cleaned.metadata = safeMeta;
  }

  return cleaned;
}

export function reportFrontendError(error: unknown, context: ErrorReportContext = {}): ClientErrorReport {
  const isErrorObj = error instanceof Error;
  const message = isErrorObj ? error.message : String(error || 'Unknown client error');
  const name = isErrorObj ? error.name : 'ClientException';
  const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'server';

  const report: ClientErrorReport = {
    timestamp: new Date().toISOString(),
    name,
    message,
    route: currentRoute,
    correlationId: context.correlationId,
    context: sanitizeContext(context),
    sanitized: true,
  };

  // Structured client-side logging (safe for browser console in development)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(
      `%c[CA-OS ERROR] ${report.name}: ${report.message}`,
      'color: #ef4444; font-weight: bold;',
      report
    );
  } else {
    // In production, emit safe structured message to console without leaking credentials or stack traces
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: 'error',
        source: 'frontend',
        name: report.name,
        message: report.message,
        correlationId: report.correlationId,
        route: report.route,
        timestamp: report.timestamp,
      })
    );
  }

  return report;
}
