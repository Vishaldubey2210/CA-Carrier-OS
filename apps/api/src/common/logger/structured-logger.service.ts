import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service.js';
import { redactSensitiveData, sanitizeString } from './redaction.util.js';

export type SupportedLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LOG_LEVEL_SEVERITY: Record<SupportedLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
};

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly serviceName = 'ca-career-os-api';
  private readonly environment: string;
  private readonly minSeverity: number;
  private readonly format: 'json' | 'pretty';

  constructor(private context: string = 'Application') {
    this.environment = process.env.NODE_ENV || 'development';
    
    const configuredLevel = (process.env.LOG_LEVEL?.toLowerCase() || (this.environment === 'production' ? 'info' : 'debug')) as SupportedLogLevel;
    this.minSeverity = LOG_LEVEL_SEVERITY[configuredLevel] ?? LOG_LEVEL_SEVERITY.info;

    const configuredFormat = process.env.LOG_FORMAT?.toLowerCase();
    this.format = configuredFormat === 'json' || (this.environment === 'production' && configuredFormat !== 'pretty') ? 'json' : 'pretty';
  }

  setContext(context: string): void {
    this.context = context;
  }

  private shouldLog(level: SupportedLogLevel): boolean {
    return LOG_LEVEL_SEVERITY[level] >= this.minSeverity;
  }

  private writeLog(level: SupportedLogLevel, message: any, context?: string, meta?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const effectiveContext = context || this.context;
    const store = RequestContextService.getStore();
    const correlationId = store?.correlationId || 'none';
    const workspaceId = store?.workspaceId;
    const userId = store?.userId;

    const timestamp = new Date().toISOString();
    const sanitizedMsg = typeof message === 'string' ? sanitizeString(message) : redactSensitiveData(message);
    const sanitizedMeta = meta ? redactSensitiveData(meta) : undefined;

    if (this.format === 'json') {
      const logRecord: Record<string, any> = {
        timestamp,
        level,
        service: this.serviceName,
        env: this.environment,
        context: effectiveContext,
        correlationId,
        message: sanitizedMsg,
      };

      if (workspaceId) logRecord.workspaceId = workspaceId;
      if (userId) logRecord.userId = userId;
      if (sanitizedMeta) logRecord.meta = sanitizedMeta;

      const output = JSON.stringify(logRecord) + '\n';
      if (level === 'error' || level === 'fatal') {
        process.stderr.write(output);
      } else {
        process.stdout.write(output);
      }
    } else {
      // Human-readable dev format
      const colorMap: Record<SupportedLogLevel, string> = {
        debug: '\x1b[36m[DEBUG]\x1b[0m',
        info: '\x1b[32m[INFO]\x1b[0m',
        warn: '\x1b[33m[WARN]\x1b[0m',
        error: '\x1b[31m[ERROR]\x1b[0m',
        fatal: '\x1b[35m[FATAL]\x1b[0m',
      };

      const metaStr = sanitizedMeta ? ` | meta: ${JSON.stringify(sanitizedMeta)}` : '';
      const corrStr = correlationId !== 'none' ? ` [${correlationId}]` : '';
      const formatted = `${timestamp} ${colorMap[level]} [${effectiveContext}]${corrStr} ${sanitizedMsg}${metaStr}\n`;

      if (level === 'error' || level === 'fatal') {
        process.stderr.write(formatted);
      } else {
        process.stdout.write(formatted);
      }
    }
  }

  log(message: any, context?: string, meta?: any): void {
    this.writeLog('info', message, context, meta);
  }

  info(message: any, context?: string, meta?: any): void {
    this.writeLog('info', message, context, meta);
  }

  error(message: any, trace?: string, context?: string, meta?: any): void {
    const errorMeta = trace ? { ...(meta || {}), stack: trace } : meta;
    this.writeLog('error', message, context, errorMeta);
  }

  warn(message: any, context?: string, meta?: any): void {
    this.writeLog('warn', message, context, meta);
  }

  debug(message: any, context?: string, meta?: any): void {
    this.writeLog('debug', message, context, meta);
  }

  verbose(message: any, context?: string, meta?: any): void {
    this.writeLog('debug', message, context, meta);
  }

  fatal(message: any, context?: string, meta?: any): void {
    this.writeLog('fatal', message, context, meta);
  }
}
