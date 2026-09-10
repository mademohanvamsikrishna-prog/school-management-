/**
 * AuthContext — real backend integration.
 *
 * Responsibilities:
 *  - Restore session on app load (token from storage → /auth/me validation)
 *  - login()  — call POST /auth/login, persist session, update state
 *  - logout() — call POST /auth/logout (revoke refresh token), clear local state
 *  - Expose role-aware user state for navigation guards
 *
 * What this does NOT do:
 *  - Automatic token refresh (access tokens are 24h by default; add interceptor in P4+ if needed)
 *  - Navigation — callers handle that after login()/logout() resolves
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { loginApi, getMeApi, logoutApi } from '../services/auth';
import { AuthSession } from '../services/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'staff';
  permissions: string[];
  avatarUrl?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Call with email + password. Throws ApiError on failure — caller handles UI errors. */
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** True if the current user has the given permission code. */
  hasPermission: (code: string) => boolean;
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const SESSION_KEY = '@auth_session';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // -------------------------------------------------------------------------
  // Session restoration on app load
  // -------------------------------------------------------------------------
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const raw = await storage.getItem(SESSION_KEY);
        if (!raw) return;

        const session: AuthSession = JSON.parse(raw);
        if (!session?.accessToken || !session?.user) return;

        // Set token in api client first so /auth/me call is authenticated
        await api.setAuthToken(session.accessToken);

        // Validate token against backend — this also checks if user is still active
        try {
          const me = await getMeApi();
          const restoredUser: AuthUser = {
            id: me.id,
            email: me.email,
            name: me.name,
            role: (me as any).role?.name ?? session.user.role,
            permissions: me.permissions ?? session.user.permissions,
            avatarUrl: me.avatar_url,
          };
          setUser(restoredUser);
          setToken(session.accessToken);
        } catch (err: unknown) {
          // 401 → token expired or invalid → clear session silently
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[Auth] Session validation failed, clearing:', msg);
          await _clearLocalSession();
        }
      } catch (err) {
        console.warn('[Auth] Failed to restore session:', err);
        await _clearLocalSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const _clearLocalSession = async () => {
    setUser(null);
    setToken(null);
    await api.setAuthToken(null);
    await storage.removeItem(SESSION_KEY);
  };

  const _persistSession = async (session: AuthSession) => {
    await storage.setItem(SESSION_KEY, JSON.stringify(session));
    await api.setAuthToken(session.accessToken);
  };

  // -------------------------------------------------------------------------
  // login
  // -------------------------------------------------------------------------

  const login = async (email: string, password: string): Promise<void> => {
    // Throws ApiError on 401/403 — caught in the login screen
    const session = await loginApi({ email, password });

    const authUser: AuthUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      permissions: session.user.permissions,
      avatarUrl: session.user.avatarUrl,
    };

    setUser(authUser);
    setToken(session.accessToken);
    await _persistSession(session);
  };

  // -------------------------------------------------------------------------
  // logout
  // -------------------------------------------------------------------------

  const logout = async (): Promise<void> => {
    try {
      const raw = await storage.getItem(SESSION_KEY);
      if (raw) {
        const session: AuthSession = JSON.parse(raw);
        if (session?.refreshToken) {
          // Best-effort server-side revocation
          await logoutApi(session.refreshToken);
        }
      }
    } catch {
      // Swallow — local session is always cleared
    } finally {
      await _clearLocalSession();
    }
  };

  // -------------------------------------------------------------------------
  // hasPermission
  // -------------------------------------------------------------------------

  const hasPermission = (code: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin wildcard
    return user.permissions.includes(code);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
