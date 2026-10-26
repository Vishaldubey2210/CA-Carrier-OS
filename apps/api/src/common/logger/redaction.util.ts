/**
 * CA Career OS — Centralized Privacy & Security Redaction Utility
 * Sanitizes control characters (log injection prevention) and masks
 * credentials, authentication tokens, connection strings, and PII.
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /pass/i,
  /otp/i,
  /secret/i,
  /token/i,
  /jwt/i,
  /authorization/i,
  /cookie/i,
  /hash/i,
  /salt/i,
  /key/i,
  /credential/i,
  /database_url/i,
  /connectionstring/i,
  /razorpay/i,
  /smtp_pass/i,
  /signature/i,
  /credit_card/i,
  /cvv/i,
];

const CONTROL_CHAR_REGEX = /[\x00-\x1F\x7F]/g;
const MAX_STRING_LENGTH = 4000;

/**
 * Sanitize a string against control character injection and length overflow.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return String(val);
  const cleaned = val.replace(CONTROL_CHAR_REGEX, '');
  if (cleaned.length > MAX_STRING_LENGTH) {
    return cleaned.slice(0, MAX_STRING_LENGTH) + '... [TRUNCATED]';
  }
  return cleaned;
}

/**
 * Checks whether an object key is sensitive and must be masked.
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Deep-redact sensitive fields and sanitize strings in any object/array.
 * Handles circular references safely.
 */
export function redactSensitiveData(data: any, seen = new WeakSet()): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Redact Bearer tokens in raw strings
    let sanitized = sanitizeString(data);
    sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED_TOKEN]');
    sanitized = sanitized.replace(/postgresql:\/\/[^:]+:[^@]+@[^/]+/gi, 'postgresql://[REDACTED_USER]:[REDACTED_PASSWORD]@[REDACTED_HOST]');
    return sanitized;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (data instanceof Error) {
    return {
      name: sanitizeString(data.name),
      message: sanitizeString(data.message),
      stack: process.env.NODE_ENV === 'production' ? undefined : sanitizeString(data.stack || ''),
    };
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (data instanceof Buffer) {
    return `[Buffer ${data.length} bytes]`;
  }

  if (seen.has(data)) {
    return '[Circular Reference]';
  }
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, seen));
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactSensitiveData(value, seen);
    }
  }

  return result;
}
