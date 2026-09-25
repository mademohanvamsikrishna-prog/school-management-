import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AttendanceAnalyticsPanelProps {
  className: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export const AttendanceAnalyticsPanel: React.FC<AttendanceAnalyticsPanelProps> = ({
  className,
  totalStudents,
  presentCount,
  absentCount,
  attendanceRate,
}) => {
  // Demo recent attendance history records
  const recentRecords = [
    { date: 'Sep 24, 2026', present: totalStudents, total: totalStudents, pct: 100, statusColor: '#10B981' },
    { date: 'Sep 23, 2026', present: Math.max(0, totalStudents - 1), total: totalStudents, pct: totalStudents > 0 ? Math.round(((totalStudents - 1) / totalStudents) * 100) : 67, statusColor: '#F59E0B' },
    { date: 'Sep 22, 2026', present: totalStudents, total: totalStudents, pct: 100, statusColor: '#10B981' },
  ];

  // Weekly bar chart data
  const weekBars = [
    { day: 'Mon', pct: 100, color: '#7C3AED' },
    { day: 'Tue', pct: 67,  color: '#F59E0B' },
    { day: 'Wed', pct: 100, color: '#7C3AED' },
    { day: 'Thu', pct: 100, color: '#7C3AED' },
    { day: 'Fri', pct: 0,   color: '#CBD5E1' },
  ];

  return (
    <View style={styles.panelContainer}>
      {/* 1. Class Summary Card */}
      <View style={styles.card}>
        <View style={styles.classHeaderRow}>
          <View style={styles.classIconBox}>
            <Text style={{ fontSize: 20 }}>🏫</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.classNameText}>{className || 'Class 10 - A'}</Text>
            <Text style={styles.classSubText}>Class Teacher</Text>
          </View>
        </View>

        <View style={styles.classCountsRow}>
          <View style={styles.miniStatBox}>
            <Text style={styles.miniStatVal}>{totalStudents}</Text>
            <Text style={styles.miniStatLbl}>Total</Text>
          </View>
          <View style={styles.miniStatBox}>
            <Text style={[styles.miniStatVal, { color: '#10B981' }]}>{presentCount}</Text>
            <Text style={styles.miniStatLbl}>Present</Text>
          </View>
          <View style={styles.miniStatBox}>
            <Text style={[styles.miniStatVal, { color: '#EF4444' }]}>{absentCount}</Text>
            <Text style={styles.miniStatLbl}>Absent</Text>
          </View>
        </View>

        {/* Circular Percentage Indicator */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeCircle}>
            <Text style={styles.gaugePctText}>{attendanceRate}%</Text>
            <Text style={styles.gaugeLabelText}>Attendance Rate</Text>
          </View>
          <Text style={styles.gaugeSubtext}>
            {presentCount} of {totalStudents} present
          </Text>
        </View>
      </View>

      {/* 2. Attendance Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Attendance Overview</Text>
          <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterDropdownText}>This Week ▼</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.chartContainer}>
          {weekBars.map((bar) => (
            <View key={bar.day} style={styles.barItem}>
              <Text style={styles.barPctText}>{bar.pct > 0 ? `${bar.pct}%` : '-'}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(bar.pct, 4)}%`,
                      backgroundColor: bar.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barDayText}>{bar.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Recent Attendance Card */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Recent Attendance</Text>
        </View>

        <View style={styles.recentList}>
          {recentRecords.map((rec, index) => (
            <TouchableOpacity key={index} style={styles.recentRow} activeOpacity={0.7}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentDate}>{rec.date}</Text>
                <Text style={styles.recentCount}>
                  {rec.present} / {rec.total} present
                </Text>
              </View>
              <View
                style={[
                  styles.recentBadge,
                  { backgroundColor: `${rec.statusColor}20` },
                ]}
              >
                <Text style={[styles.recentBadgeText, { color: rec.statusColor }]}>
                  {rec.pct}%
                </Text>
              </View>
              <Text style={styles.recentArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. Note Card */}
      <View style={[styles.card, styles.noteCard]}>
        <View style={styles.noteTitleRow}>
          <Text style={{ fontSize: 18 }}>📝</Text>
          <Text style={styles.noteTitle}>Note</Text>
        </View>
        <Text style={styles.noteBody}>
          You can add individual remarks for each student. After marking, don&apos;t
          forget to submit the attendance.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    width: 340,
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  classHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  classIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  classNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  classSubText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '700',
    marginTop: 2,
  },
  classCountsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  miniStatBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniStatVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  miniStatLbl: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  gaugeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F3FF',
    borderWidth: 6,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  gaugePctText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#7C3AED',
  },
  gaugeLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  gaugeSubtext: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  filterDropdown: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterDropdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    paddingTop: 20,
  },
  barItem: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barPctText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  barTrack: {
    width: 24,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  recentList: {
    gap: 12,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  recentDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  recentCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  recentArrow: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '800',
  },
  noteCard: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7C3AED',
  },
  noteBody: {
    fontSize: 12,
    color: '#6B21A8',
    lineHeight: 18,
    fontWeight: '600',
  },
});
