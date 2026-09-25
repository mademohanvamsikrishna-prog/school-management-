import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SummaryData {
  totalStudents: number;
  activeStudents: number;
  activePct: number;
  inactiveStudents: number;
  inactivePct: number;
  myClassesCount: number;
}

interface StudentsSummaryCardsProps {
  data: SummaryData;
}

export const StudentsSummaryCards: React.FC<StudentsSummaryCardsProps> = ({ data }) => {
  return (
    <View style={styles.gridContainer}>
      {/* CARD 1: TOTAL STUDENTS */}
      <View style={[styles.card, { borderLeftColor: '#3B82F6' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>TOTAL STUDENTS</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Text style={{ fontSize: 16 }}>👨‍🎓</Text>
          </View>
        </View>
        <Text style={styles.metricVal}>{data.totalStudents}</Text>
        <Text style={styles.subText}>Across {data.myClassesCount} Classes</Text>
      </View>

      {/* CARD 2: ACTIVE STUDENTS */}
      <View style={[styles.card, { borderLeftColor: '#10B981' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>ACTIVE STUDENTS</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#D1FAE5' }]}>
            <Text style={{ fontSize: 16 }}>✅</Text>
          </View>
        </View>
        <View style={styles.valRow}>
          <Text style={styles.metricVal}>{data.activeStudents}</Text>
          <View style={styles.pctBadgeGreen}>
            <Text style={styles.pctBadgeGreenText}>{data.activePct.toFixed(1)}%</Text>
          </View>
        </View>
        <Text style={styles.subText}>Enrolled & Active</Text>
      </View>

      {/* CARD 3: INACTIVE STUDENTS */}
      <View style={[styles.card, { borderLeftColor: '#EF4444' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>INACTIVE STUDENTS</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ fontSize: 16 }}>🚫</Text>
          </View>
        </View>
        <View style={styles.valRow}>
          <Text style={[styles.metricVal, { color: data.inactiveStudents > 0 ? '#DC2626' : '#0F172A' }]}>
            {data.inactiveStudents}
          </Text>
          <View style={styles.pctBadgeRed}>
            <Text style={styles.pctBadgeRedText}>{data.inactivePct.toFixed(1)}%</Text>
          </View>
        </View>
        <Text style={styles.subText}>Withdrawn / On Leave</Text>
      </View>

      {/* CARD 4: MY CLASSES */}
      <View style={[styles.card, { borderLeftColor: '#F59E0B' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>MY CLASSES</Text>
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Text style={{ fontSize: 16 }}>🏫</Text>
          </View>
        </View>
        <Text style={styles.metricVal}>{data.myClassesCount}</Text>
        <Text style={styles.subText}>Classes Assigned</Text>
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
  pctBadgeGreen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pctBadgeGreenText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  pctBadgeRed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pctBadgeRedText: {
    color: '#DC2626',
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
