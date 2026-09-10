/**
 * ScreenStates.tsx — Shared loading, error, and empty state components.
 *
 * Use these in any screen that calls useApi() so users always get
 * proper feedback instead of a blank screen.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(getSomething);
 *   if (loading) return <LoadingScreen />;
 *   if (error)   return <ErrorScreen error={error} onRetry={refetch} />;
 *   if (!data)   return <EmptyScreen message="No data available." />;
 */
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiError } from '../services/types';

// ---------------------------------------------------------------------------
// LoadingScreen
// ---------------------------------------------------------------------------

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ErrorScreen
// ---------------------------------------------------------------------------

interface ErrorScreenProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  const isNetwork = error.statusCode === 0 || error.statusCode === 408;

  return (
    <View style={styles.center}>
      <Text style={styles.errorIcon}>{isNetwork ? '📡' : '⚠️'}</Text>
      <Text style={styles.errorTitle}>
        {isNetwork ? 'Connection Problem' : 'Something went wrong'}
      </Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// EmptyScreen
// ---------------------------------------------------------------------------

interface EmptyScreenProps {
  message?: string;
  icon?: string;
}

export function EmptyScreen({
  message = 'No data available.',
  icon = '📭',
}: EmptyScreenProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f4f7fb',
  },

  // Loading
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },

  // Error
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Empty
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
