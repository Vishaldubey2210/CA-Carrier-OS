import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

@Injectable()
export class AuthRateLimiter {
  private readonly attempts = new Map<string, AttemptRecord>();
  private readonly maxFailures = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly lockoutMs = 15 * 60 * 1000; // 15 minutes lockout

  /**
   * Check if identifier is currently locked out
   */
  checkRateLimit(key: string): void {
    const record = this.attempts.get(key);
    if (!record) return;

    const now = Date.now();
    if (record.lockedUntil && record.lockedUntil > now) {
      const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      throw new HttpException(
        `Too many failed authentication attempts. Account temporarily locked. Please try again in ${waitSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Clean up window expiry
    if (now - record.firstAttemptAt > this.windowMs) {
      this.attempts.delete(key);
    }
  }

  /**
   * Record a failed attempt
   */
  recordFailure(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now - record.firstAttemptAt > this.windowMs) {
      this.attempts.set(key, { count: 1, firstAttemptAt: now });
      return;
    }

    record.count += 1;
    if (record.count >= this.maxFailures) {
      record.lockedUntil = now + this.lockoutMs;
    }
  }

  /**
   * Reset attempts on successful authentication
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * For testing purposes
   */
  clearAll(): void {
    this.attempts.clear();
  }
}

export const globalAuthRateLimiter = new AuthRateLimiter();
