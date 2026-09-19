import { Platform } from 'react-native';

/**
 * Runtime environment configuration.
 *
 * API_BASE_URL resolution priority:
 *  1. EXPO_PUBLIC_API_BASE_URL  — set in Vercel / CI environment at build time.
 *     Example: https://school-management-production-1d29.up.railway.app/api/v1
 *  2. Railway production fallback — used when the env var is not set.
 *     Defaults to: https://school-management-production-1d29.up.railway.app/api/v1
 *
 * To test locally against a local backend, create a .env.local file:
 *   EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
 */
const _localFallback = Platform.select({
  web:     'https://school-management-production-1d29.up.railway.app/api/v1',
  android: 'https://school-management-production-1d29.up.railway.app/api/v1',
  default: 'https://school-management-production-1d29.up.railway.app/api/v1',
}) as string;

export const ENV = {
  API_BASE_URL: (process.env.EXPO_PUBLIC_API_BASE_URL ?? _localFallback),
  TIMEOUT_MS: 10000,
  APP_NAME: 'School Management System',
  APP_VERSION: '1.0.0',
};

