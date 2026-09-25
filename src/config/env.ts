import { Platform } from 'react-native';

/**
 * Runtime environment configuration.
 *
 * API_BASE_URL resolution priority:
 *  1. EXPO_PUBLIC_API_BASE_URL  — set in Vercel / CI at build time (recommended).
 *  2. Railway production URL    — hard-coded fallback so Vercel builds work even
 *     if EXPO_PUBLIC_API_BASE_URL is not configured in the dashboard.
 *  3. localhost                 — only used when running `expo start` locally.
 *
 * To override locally, create a .env.local file:
 *   EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
 */

const RAILWAY_URL = 'https://school-management-production-1d29.up.railway.app/api/v1';

const _localFallback = Platform.select({
  web:     'http://localhost:8000/api/v1',
  android: 'http://10.0.2.2:8000/api/v1',
  default: 'http://localhost:8000/api/v1',
}) as string;

// In a real browser on Vercel, `window` exists but there is no local server.
// Detect that case and always use Railway instead of localhost.
const _isProductionBrowser =
  typeof window !== 'undefined' &&
  typeof window.location !== 'undefined' &&
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1') &&
  !window.location.hostname.includes('10.0.2.2');

const _effectiveFallback = _isProductionBrowser ? RAILWAY_URL : _localFallback;

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? _effectiveFallback,
  /** Default timeout for all API requests (ms). */
  TIMEOUT_MS: 90_000,
  /**
   * Dedicated timeout for the login request (ms).
   * Free-tier hosts (Railway, Render) can take 30-60 s to cold-start.
   * 90 s gives them enough headroom while still failing fast if the
   * server is genuinely unreachable.
   */
  LOGIN_TIMEOUT_MS: 90_000,
  APP_NAME: 'School Management System',
  APP_VERSION: '1.0.0',
};


