/**
 * AuthGuard.tsx — Role-based route guard for Expo Router layouts.
 *
 * Drop this inside any section _layout.tsx to enforce authentication
 * and role restrictions. Unauthenticated users are redirected to /
 * (the login screen). Authenticated users whose role isn't in
 * allowedRoles are also redirected to their own home dashboard.
 *
 * Usage:
 *   <AuthGuard allowedRoles={['teacher', 'staff', 'admin']}>
 *     <Tabs>...</Tabs>
 *   </AuthGuard>
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { AppRole, getRoleRoute } from '../../config/routes';

interface AuthGuardProps {
  /** Roles that are permitted to access this section. */
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Still restoring session — show a minimal spinner
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Not logged in → go to login screen
  if (!isAuthenticated || !user) {
    return <Redirect href="/" />;
  }

  // Logged in but wrong role → redirect to the user's own home screen
  const userRole = user.role as AppRole;
  if (!allowedRoles.includes(userRole)) {
    const homeRoute = getRoleRoute(userRole);
    // If no home route found (unknown role) just push back to login
    return <Redirect href={(homeRoute ?? '/') as never} />;
  }

  // All checks passed — render the section normally
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7fb',
  },
});
