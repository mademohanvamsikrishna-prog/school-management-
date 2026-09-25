import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AttendanceSummaryCardsProps {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalStudents: number;
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  presentCount,
  absentCount,
  lateCount,
  totalStudents,
}) => {
  const presentPct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const absentPct  = totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0;
  const latePct    = totalStudents > 0 ? Math.round((lateCount / totalStudents) * 100) : 0;

  return (
    <View style={styles.gridContainer}>
      {/* 1. Present Card */}
      <View style={[styles.card, styles.cardPresent]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: '#10B98120' }]}>
            <Text style={{ fontSize: 18, color: '#10B981' }}>✓</Text>
          </View>
          <Text style={[styles.pctText, { color: '#059669' }]}>{presentPct}%</Text>
        </View>
        <Text style={styles.countNumber}>{presentCount}</Text>
        <Text style={styles.cardLabel}>Present</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${presentPct}%`, backgroundColor: '#10B981' }]} />
        </View>
      </View>

      {/* 2. Absent Card */}
      <View style={[styles.card, styles.cardAbsent]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: '#EF444420' }]}>
            <Text style={{ fontSize: 18, color: '#EF4444' }}>✕</Text>
          </View>
          <Text style={[styles.pctText, { color: '#DC2626' }]}>{absentPct}%</Text>
        </View>
        <Text style={styles.countNumber}>{absentCount}</Text>
        <Text style={styles.cardLabel}>Absent</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${absentPct}%`, backgroundColor: '#EF4444' }]} />
        </View>
      </View>

      {/* 3. Late Card */}
      <View style={[styles.card, styles.cardLate]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: '#F59E0B20' }]}>
            <Text style={{ fontSize: 18, color: '#F59E0B' }}>⏰</Text>
          </View>
          <Text style={[styles.pctText, { color: '#D97706' }]}>{latePct}%</Text>
        </View>
        <Text style={styles.countNumber}>{lateCount}</Text>
        <Text style={styles.cardLabel}>Late</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${latePct}%`, backgroundColor: '#F59E0B' }]} />
        </View>
      </View>

      {/* 4. Total Students Card */}
      <View style={[styles.card, styles.cardTotal]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: '#7C3AED20' }]}>
            <Text style={{ fontSize: 18, color: '#7C3AED' }}>🎓</Text>
          </View>
          <Text style={[styles.pctText, { color: '#7C3AED' }]}>100%</Text>
        </View>
        <Text style={styles.countNumber}>{totalStudents}</Text>
        <Text style={styles.cardLabel}>Total Students</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%', backgroundColor: '#7C3AED' }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardPresent: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cardAbsent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  cardLate: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  cardTotal: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontSize: 12,
    fontWeight: '800',
  },
  countNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
