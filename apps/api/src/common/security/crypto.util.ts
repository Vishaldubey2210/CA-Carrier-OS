import {
  scrypt,
  randomBytes,
  timingSafeEqual,
  createHmac,
  createHash,
} from 'node:crypto';
import { promisify } from 'node:util';
import { JwtTokenPayload } from '@ca-career-os/shared';

const scryptAsync = promisify(scrypt);

/**
 * Hash password using standard Node.js scrypt with cryptographic salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Constant-time verification of password against salt:hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }
  const [salt, key] = parts;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  if (keyBuffer.length !== derivedKey.length) {
    return false;
  }
  return timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Generate a cryptographically random token string
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Securely hash tokens (e.g. refresh tokens, reset tokens) before storing in DB
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Sign a lightweight, production-grade JWT using HMAC-SHA256
 */
export function signJwt(
  payload: JwtTokenPayload,
  secret: string,
  expiresInSeconds: number
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64url');

  return `${dataToSign}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 JWT in constant time
 */
export function verifyJwt(token: string, secret: string): JwtTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = createHmac('sha256', secret)
      .update(dataToSign)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as JwtTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
