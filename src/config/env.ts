import { Platform } from 'react-native';

/**
 * Runtime environment configuration.
 *
 * API_BASE_URL resolution priority:
 *  1. EXPO_PUBLIC_API_BASE_URL  — set in Vercel / CI environment at build time.
 *     Example: https://school-api.onrender.com/api/v1
 *  2. Platform-specific localhost fallback — local development only.
 *     This value is NEVER reached in a Vercel/Render production build because
 *     EXPO_PUBLIC_API_BASE_URL will always be set there.
 *
 * To test locally against a different backend, create a .env.local file:
 *   EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
 */
const _localFallback = Platform.select({
  web:     'http://localhost:8000/api/v1',
  android: 'http://10.0.2.2:8000/api/v1',
  default: 'http://localhost:8000/api/v1',
}) as string;

export const ENV = {
  API_BASE_URL: (process.env.EXPO_PUBLIC_API_BASE_URL ?? _localFallback),
  TIMEOUT_MS: 10000,
  APP_NAME: 'School Management System',
  APP_VERSION: '1.0.0',
};

