import crypto from 'crypto';
import { config } from '../config/env.ts';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

const DEFAULT_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Base64Url encoding helper
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64Url decoding helper
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Password Hashing with Salted PBKDF2
 */
export function hashPassword(
  password: string,
  providedSalt?: string
): { hash: string; salt: string } {
  const salt = providedSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  );
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * Constant-time password verification to prevent timing attacks
 */
export function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): boolean {
  try {
    // Check with standard iterations
    const derivedKey = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST
    );
    const candidateBuf = Buffer.from(derivedKey.toString('hex'), 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');

    if (candidateBuf.length === storedBuf.length && crypto.timingSafeEqual(candidateBuf, storedBuf)) {
      return true;
    }

    // Support legacy seed salt iterations (10,000 rounds)
    const legacyKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    const legacyCandidateBuf = Buffer.from(legacyKey.toString('hex'), 'hex');
    if (legacyCandidateBuf.length === storedBuf.length && crypto.timingSafeEqual(legacyCandidateBuf, storedBuf)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Generates an HMAC-SHA256 signed tamper-proof JWT
 */
export function generateAuthToken(
  claims: { sub: string; email: string; role: 'user' | 'admin' },
  ttlMs: number = DEFAULT_TOKEN_TTL_MS
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Date.now();
  const payload: AuthTokenPayload = {
    sub: claims.sub,
    email: claims.email.toLowerCase().trim(),
    role: claims.role,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ttlMs) / 1000),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac('sha256', config.authSecret);
  hmac.update(dataToSign);
  const signature = hmac
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies the HMAC-SHA256 signature and expiration of a JWT
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const hmac = crypto.createHmac('sha256', config.authSecret);
    hmac.update(dataToSign);
    const expectedSignature = hmac
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Constant-time signature comparison to eliminate timing side-channels
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: AuthTokenPayload = JSON.parse(payloadJson);

    // Validate expiration
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Cookie parsing utility
 */
export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  const items = cookieHeader.split(';');

  for (const item of items) {
    const parts = item.split('=');
    const name = parts[0]?.trim();
    if (name) {
      cookies[name] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  }

  return cookies;
}

/**
 * Cookie serialization helper for secure HTTP-only cookies
 */
export function serializeSessionCookie(
  token: string,
  maxAgeSeconds: number = 24 * 60 * 60
): string {
  const parts = [
    `car911_session=${encodeURIComponent(token)}`,
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (config.isProduction) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function serializeClearSessionCookie(): string {
  const parts = [
    'car911_session=',
    'Max-Age=0',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (config.isProduction) {
    parts.push('Secure');
  }

  return parts.join('; ');
}
