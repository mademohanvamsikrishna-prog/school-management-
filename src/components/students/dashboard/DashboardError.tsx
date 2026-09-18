import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
}

const IS_WEB = Platform.OS === 'web';

export const DashboardError: React.FC<DashboardErrorProps> = ({
  message = 'Unable to load dashboard data. Please verify your network connection.',
  onRetry,
}) => {
  return (
    <View
      style={[styles.container, IS_WEB && (styles.webContainer as any)]}
      {...(IS_WEB ? { className: 'glass-panel' } : {})}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>📡</Text>
      </View>
      <Text style={styles.title}>Data Sync Notice</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onRetry}
        style={styles.retryBtn}
      >
        <Text style={styles.retryBtnIcon}>🔄</Text>
        <Text style={styles.retryBtnText}>Retry Dashboard Sync</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 36,
    margin: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  webContainer: {
    animation: 'fadeIn 0.5s ease-out',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 20,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2,
  },
  retryBtnIcon: {
    fontSize: 14,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
