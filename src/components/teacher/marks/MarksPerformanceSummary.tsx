import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryData {
  totalStudents: number;
  classAverage: number;
  passedCount: number;
  passRate: number;
  needsImprovementCount: number;
}

interface MarksPerformanceSummaryProps {
  data: SummaryData;
}

export const MarksPerformanceSummary: React.FC<MarksPerformanceSummaryProps> = ({ data }) => {
  return (
    <View style={styles.gridContainer}>
      {/* 1. Total Students */}
      <View style={[styles.card, { borderLeftColor: '#3B82F6' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>TOTAL STUDENTS</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Text style={{ fontSize: 16 }}>👨‍🎓</Text>
          </View>
        </View>
        <Text style={styles.metricVal}>{data.totalStudents}</Text>
        <Text style={styles.subText}>Enrolled in class</Text>
      </View>

      {/* 2. Class Average */}
      <View style={[styles.card, { borderLeftColor: '#7C3AED' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>CLASS AVERAGE</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#F5F3FF' }]}>
            <Text style={{ fontSize: 16 }}>📊</Text>
          </View>
        </View>
        <View style={styles.valRow}>
          <Text style={styles.metricVal}>{data.classAverage.toFixed(1)}%</Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>↑ 5.2%</Text>
          </View>
        </View>
        <Text style={styles.subText}>vs. previous assessment</Text>
      </View>

      {/* 3. Passed */}
      <View style={[styles.card, { borderLeftColor: '#10B981' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>PASSED</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#D1FAE5' }]}>
            <Text style={{ fontSize: 16 }}>✅</Text>
          </View>
        </View>
        <View style={styles.valRow}>
          <Text style={styles.metricVal}>{data.passedCount}</Text>
          <Text style={styles.totalSlash}>/ {data.totalStudents}</Text>
        </View>
        <Text style={styles.subText}>{data.passRate.toFixed(1)}% Pass Rate</Text>
      </View>

      {/* 4. Needs Improvement */}
      <View style={[styles.card, { borderLeftColor: '#F59E0B' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>NEEDS IMPROVEMENT</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
          </View>
        </View>
        <Text style={[styles.metricVal, { color: data.needsImprovementCount > 0 ? '#D97706' : '#0F172A' }]}>
          {data.needsImprovementCount}
        </Text>
        <Text style={styles.subText}>Below 50% threshold</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  metricVal: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  totalSlash: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  trendBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
});
