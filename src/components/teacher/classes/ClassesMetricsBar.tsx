import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ClassesSummaryData {
  myClassesCount: number;
  totalStudents: number;
  subjectsCount: number;
  weeklyPeriods: number;
  studentsGrowthPct?: string;
}

interface ClassesMetricsBarProps {
  data: ClassesSummaryData;
}

export const ClassesMetricsBar: React.FC<ClassesMetricsBarProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      {/* CARD 1: My Classes */}
      <View style={[styles.metricCard, styles.cardBlue]}>
        <View style={[styles.iconContainer, styles.iconBlue]}>
          <Text style={styles.iconText}>🏫</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.metricValue}>{data.myClassesCount}</Text>
          <Text style={styles.metricTitle}>My Classes</Text>
          <Text style={styles.metricSubtitle}>Assigned to you</Text>
        </View>
      </View>

      {/* CARD 2: Total Students */}
      <View style={[styles.metricCard, styles.cardGreen]}>
        <View style={[styles.iconContainer, styles.iconGreen]}>
          <Text style={styles.iconText}>👨‍🎓</Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.valWithBadgeRow}>
            <Text style={styles.metricValue}>{data.totalStudents}</Text>
            <View style={styles.growthBadge}>
              <Text style={styles.growthBadgeText}>{data.studentsGrowthPct || '↑ 12%'}</Text>
            </View>
          </View>
          <Text style={styles.metricTitle}>Total Students</Text>
          <Text style={styles.metricSubtitle}>Enrolled across classes</Text>
        </View>
      </View>

      {/* CARD 3: Subjects */}
      <View style={[styles.metricCard, styles.cardOrange]}>
        <View style={[styles.iconContainer, styles.iconOrange]}>
          <Text style={styles.iconText}>📚</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.metricValue}>{data.subjectsCount}</Text>
          <Text style={styles.metricTitle}>Subjects</Text>
          <Text style={styles.metricSubtitle}>You teach</Text>
        </View>
      </View>

      {/* CARD 4: Weekly Periods */}
      <View style={[styles.metricCard, styles.cardPurple]}>
        <View style={[styles.iconContainer, styles.iconPurple]}>
          <Text style={styles.iconText}>⏰</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.metricValue}>{data.weeklyPeriods}</Text>
          <Text style={styles.metricTitle}>Weekly Periods</Text>
          <Text style={styles.metricSubtitle}>Total teaching hours</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  cardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBlue: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  iconGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  iconOrange: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  iconPurple: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  iconText: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  valWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  growthBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  growthBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
});
