/**
 * auth.ts — Typed API calls for the authentication endpoints.
 *
 * These functions call the real backend.
 * They do NOT contain any navigation logic — that belongs in AuthContext.
 */
import { api } from './api';
import { AuthSession } from './types';
import { ENV } from '../config/env';


export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshPayload {
  refresh_token: string;
}

/** Backend shape of the /auth/login and /auth/refresh response */
interface BackendTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    is_active: boolean;
    avatar_url?: string;
    role: {
      id: string;
      name: string;
      description?: string;
    };
    permissions: string[];
  };
}

/**
 * Map the backend token response to the frontend AuthSession shape.
 * role.name is extracted so the rest of the app sees a flat role string.
 */
function mapToSession(raw: BackendTokenResponse): AuthSession {
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    tokenType: raw.token_type,
    user: {
      id: raw.user.id,
      email: raw.user.email,
      name: raw.user.name,
      role: raw.user.role.name as AuthSession['user']['role'],
      permissions: raw.user.permissions,
      avatarUrl: raw.user.avatar_url,
    },
  };
}

/**
 * POST /api/v1/auth/login
 * Returns a mapped AuthSession on success.
 * Throws ApiError on failure (handled by AuthContext).
 *
 * Uses LOGIN_TIMEOUT_MS (90 s) instead of the default TIMEOUT_MS so that
 * cold-starting free-tier hosts (Railway / Render) have enough time to wake up.
 */
export async function loginApi(payload: LoginPayload): Promise<AuthSession> {
  const raw = await api.post<BackendTokenResponse>(
    '/auth/login',
    payload,
    undefined,            // no extra headers
    ENV.LOGIN_TIMEOUT_MS  // 90 s cold-start timeout
  );
  return mapToSession(raw);
}

/**
 * Returns true when an ApiError looks like a cold-start timeout rather than
 * a genuine connectivity failure.  Use this in the login screen to show a
 * friendlier "Server is waking up…" message.
 *
 *   statusCode 408 → AbortController fired (our own timeout)
 *   statusCode 0   → fetch() itself rejected (no network at all)
 */
export function isWakingUp(err: unknown): boolean {
  const e = err as { statusCode?: number };
  return e?.statusCode === 408;
}


/**
 * GET /api/v1/auth/me
 * Requires a valid Bearer token (api client adds it automatically).
 */
export async function getMeApi(): Promise<BackendTokenResponse['user']> {
  return api.get<BackendTokenResponse['user']>('/auth/me');
}

/**
 * POST /api/v1/auth/refresh
 * Rotate the refresh token — returns a new AuthSession.
 */
export async function refreshApi(refreshToken: string): Promise<AuthSession> {
  const raw = await api.post<BackendTokenResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return mapToSession(raw);
}

/**
 * POST /api/v1/auth/logout
 * Revokes the refresh token on the server (best-effort, no throw on failure).\
 */
export async function logoutApi(refreshToken: string): Promise<void> {
  try {
    await api.post<void>('/auth/logout', { refresh_token: refreshToken });
  } catch {
    // Swallow errors — local session is cleared regardless
  }
}

/**
 * GET /wake
 * Fire-and-forget ping that pre-warms the server on app load.
 * Call this as early as possible (e.g. in _layout.tsx) so the
 * Railway/Render cold-start completes before the user clicks Login.
 * Never throws — failure is silently swallowed.
 */
export function wakeServer(): void {
  const baseUrl = ENV.API_BASE_URL.replace(/\/api\/v1$/, '');
  fetch(`${baseUrl}/wake`, { method: 'GET' }).catch(() => {
    // Best-effort only — don't block anything
  });
}

