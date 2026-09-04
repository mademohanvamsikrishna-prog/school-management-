import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { AuthSession } from '../services/types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'staff';
  permissions: string[];
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = '@auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore saved session on app load
    const restoreSession = async () => {
      try {
        const rawSession = await storage.getItem(SESSION_KEY);
        if (rawSession) {
          const session: AuthSession = JSON.parse(rawSession);
          setUser(session.user);
          setToken(session.accessToken);
          await api.setAuthToken(session.accessToken);
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (session: AuthSession) => {
    setUser(session.user);
    setToken(session.accessToken);
    await api.setAuthToken(session.accessToken);
    await storage.setItem(SESSION_KEY, JSON.stringify(session));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await api.setAuthToken(null);
    await storage.removeItem(SESSION_KEY);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
