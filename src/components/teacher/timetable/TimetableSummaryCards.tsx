import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryData {
  todayClassesCount: number;
  totalPeriodsPerDay: number;
  freePeriodsCount: number;
  weeklyClassesCount: number;
  nextClassSubject: string | null;
  nextClassTime: string | null;
  nextClassRoom?: string | null;
}

interface TimetableSummaryCardsProps {
  data: SummaryData;
}

export const TimetableSummaryCards: React.FC<TimetableSummaryCardsProps> = ({ data }) => {
  return (
    <View style={styles.gridContainer}>
      {/* 1. Today's Classes */}
      <View style={[styles.card, { borderLeftColor: '#3B82F6' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>TODAY&apos;S CLASSES</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Text style={{ fontSize: 16 }}>📚</Text>
          </View>
        </View>
        <View style={styles.valRow}>
          <Text style={styles.metricVal}>{data.todayClassesCount}</Text>
          <Text style={styles.subSlash}>/ {data.totalPeriodsPerDay}</Text>
        </View>
        <Text style={styles.subText}>Out of {data.totalPeriodsPerDay} periods</Text>
      </View>

      {/* 2. Free Periods */}
      <View style={[styles.card, { borderLeftColor: '#10B981' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>FREE PERIODS</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#D1FAE5' }]}>
            <Text style={{ fontSize: 16 }}>☕</Text>
          </View>
        </View>
        <Text style={styles.metricVal}>{data.freePeriodsCount}</Text>
        <Text style={styles.subText}>Free Periods Today</Text>
      </View>

      {/* 3. Total Weekly Classes */}
      <View style={[styles.card, { borderLeftColor: '#7C3AED' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>TOTAL WEEKLY CLASSES</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#F5F3FF' }]}>
            <Text style={{ fontSize: 16 }}>🗓️</Text>
          </View>
        </View>
        <Text style={styles.metricVal}>{data.weeklyClassesCount}</Text>
        <Text style={styles.subText}>Total Weekly Classes</Text>
      </View>

      {/* 4. Next Class */}
      <View style={[styles.card, { borderLeftColor: '#F59E0B' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>NEXT CLASS</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 16 }}>⏰</Text>
          </View>
        </View>
        {data.nextClassSubject ? (
          <>
            <Text style={styles.nextSubjectText} numberOfLines={1}>
              {data.nextClassSubject}
            </Text>
            <Text style={styles.nextTimeText}>
              {data.nextClassTime} {data.nextClassRoom ? `• ${data.nextClassRoom}` : ''}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.nextSubjectText, { color: '#64748B', fontSize: 16 }]}>
              No more classes today
            </Text>
            <Text style={styles.subText}>Schedule clear for the rest of today</Text>
          </>
        )}
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
    gap: 6,
  },
  metricVal: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subSlash: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  nextSubjectText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  nextTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 4,
  },
});
