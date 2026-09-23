/**
 * ErrorBoundary — React error boundary with fallback UI.
 *
 * Catches unhandled React render errors instead of showing a white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourScreen />
 *   </ErrorBoundary>
 *
 * Or wrap the root layout in app/_layout.tsx.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // In production, send to error tracking service (Sentry, etc.)
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. Our team has been notified.
          </Text>

          {__DEV__ && this.state.error && (
            <ScrollView style={styles.debugBox} showsVerticalScrollIndicator={false}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>{this.state.error.toString()}</Text>
              {this.state.errorInfo?.componentStack && (
                <Text style={styles.debugText}>{this.state.errorInfo.componentStack}</Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.resetBtn} onPress={this.handleReset}>
            <Text style={styles.resetText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center',
    justifyContent: 'center', padding: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  debugBox: {
    backgroundColor: '#1E293B', borderRadius: 10, padding: 12,
    maxHeight: 180, width: '100%', marginBottom: 20,
  },
  debugTitle: { color: '#94A3B8', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  debugText: { color: '#CBD5E1', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
  resetBtn: {
    backgroundColor: '#4F46E5', paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 12,
  },
  resetText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
