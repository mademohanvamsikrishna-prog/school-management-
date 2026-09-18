import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const IS_WEB = Platform.OS === 'web';

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View
        style={[styles.skeletonHeader, IS_WEB && (styles.shimmer as any)]}
      />

      {/* 5 Stat Cards Skeleton */}
      <View style={styles.statsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[styles.statSkeleton, IS_WEB && (styles.shimmer as any)]}
          />
        ))}
      </View>

      {/* Middle 2 Charts Skeleton */}
      <View style={styles.chartsGrid}>
        <View
          style={[styles.chartSkeleton, IS_WEB && (styles.shimmer as any)]}
        />
        <View
          style={[styles.chartSkeleton, IS_WEB && (styles.shimmer as any)]}
        />
      </View>

      {/* Bottom 2 Charts Skeleton */}
      <View style={styles.chartsGrid}>
        <View
          style={[styles.chartSkeleton, IS_WEB && (styles.shimmer as any)]}
        />
        <View
          style={[styles.chartSkeleton, IS_WEB && (styles.shimmer as any)]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  shimmer: {
    background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
  },
  skeletonHeader: {
    height: 140,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  statSkeleton: {
    flex: 1,
    minWidth: 180,
    height: 150,
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartsGrid: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  chartSkeleton: {
    flex: 1,
    minWidth: 320,
    height: 320,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
