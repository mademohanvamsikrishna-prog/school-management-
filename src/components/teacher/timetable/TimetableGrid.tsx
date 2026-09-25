import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export interface TimetableEntryItem {
  id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  day_of_week: int; // 1=Mon...6=Sat
  start_time: string; // e.g. "08:30" or "08:30:00"
  end_time: string; // e.g. "09:15" or "09:15:00"
  room_number: string;
}

export interface PeriodSlotDef {
  periodNum: number;
  label: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

export const PERIOD_SLOTS: PeriodSlotDef[] = [
  { periodNum: 1, label: 'Period 1', startTime: '08:30', endTime: '09:15' },
  { periodNum: 2, label: 'Period 2', startTime: '09:20', endTime: '10:05' },
  { periodNum: 3, label: 'Period 3', startTime: '10:10', endTime: '10:55' },
  { periodNum: 4, label: 'Period 4', startTime: '11:00', endTime: '11:45' },
  { periodNum: 0, label: 'Lunch Break', startTime: '11:45', endTime: '12:30', isBreak: true },
  { periodNum: 5, label: 'Period 5', startTime: '12:30', endTime: '13:15' },
  { periodNum: 6, label: 'Period 6', startTime: '13:20', endTime: '14:05' },
  { periodNum: 7, label: 'Period 7', startTime: '14:10', endTime: '14:55' },
  { periodNum: 8, label: 'Period 8', startTime: '15:00', endTime: '15:45' },
];

export const DAYS_DEF = [
  { dayNum: 1, shortName: 'Mon', fullName: 'Monday' },
  { dayNum: 2, shortName: 'Tue', fullName: 'Tuesday' },
  { dayNum: 3, shortName: 'Wed', fullName: 'Wednesday' },
  { dayNum: 4, shortName: 'Thu', fullName: 'Thursday' },
  { dayNum: 5, shortName: 'Fri', fullName: 'Friday' },
  { dayNum: 6, shortName: 'Sat', fullName: 'Saturday' },
];

const SUBJECT_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  mathematics: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  maths: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  math: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  physics: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  chemistry: { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8' },
  english: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  computer: { bg: '#CCFBF1', text: '#0D9488', border: '#99F6E4' },
  science: { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
  biology: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  social: { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' },
  history: { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' },
  hindi: { bg: '#FDF4FF', text: '#C026D3', border: '#F5D0FE' },
  telugu: { bg: '#FDF4FF', text: '#C026D3', border: '#F5D0FE' },
};

export function getSubjectColor(subjectName: string) {
  const lower = subjectName.toLowerCase();
  for (const key of Object.keys(SUBJECT_COLOR_MAP)) {
    if (lower.includes(key)) return SUBJECT_COLOR_MAP[key];
  }
  // Fallback hash color generator
  const colors = [
    { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
    { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
    { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8' },
    { bg: '#CCFBF1', text: '#0D9488', border: '#99F6E4' },
  ];
  const charSum = [...lower].reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[charSum % colors.length];
}

interface TimetableGridProps {
  entries: TimetableEntryItem[];
  currentDayNum: number;
  highlightToday: boolean;
  onCellClick: (entry: TimetableEntryItem) => void;
  searchQuery?: string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  currentDayNum,
  highlightToday,
  onCellClick,
  searchQuery = '',
}) => {
  // Build lookup matrix: dayNum -> periodNum -> TimetableEntryItem
  const matrix = useMemo(() => {
    const map: Record<number, Record<number, TimetableEntryItem>> = {};
    for (let d = 1; d <= 6; d++) map[d] = {};

    entries.forEach((e) => {
      const d = e.day_of_week;
      const startTimeClean = e.start_time.slice(0, 5); // "08:30"
      // Find matching period
      const slot = PERIOD_SLOTS.find((s) => !s.isBreak && s.startTime === startTimeClean);
      if (slot && slot.periodNum > 0 && map[d]) {
        map[d][slot.periodNum] = e;
      }
    });

    return map;
  }, [entries]);

  // Extract distinct subjects present for Legend
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.subject_name) set.add(e.subject_name);
    });
    return Array.from(set);
  }, [entries]);

  return (
    <View style={styles.container}>
      {/* Horizontally scrollable timetable table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ minWidth: 920 }}>
          {/* Header Row */}
          <View style={styles.thRow}>
            <View style={styles.periodColHeader}>
              <Text style={styles.thLabel}>TIME / PERIOD</Text>
            </View>

            {DAYS_DEF.slice(0, 5).map((d) => {
              const isToday = highlightToday && d.dayNum === currentDayNum;
              return (
                <View
                  key={d.dayNum}
                  style={[styles.dayHeaderCell, isToday && styles.dayHeaderToday]}
                >
                  <Text style={[styles.dayHeaderShort, isToday && styles.dayHeaderTodayText]}>
                    {d.shortName}
                  </Text>
                  <Text style={[styles.dayHeaderFull, isToday && styles.dayHeaderTodaySub]}>
                    {d.fullName}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Slots Rows */}
          {PERIOD_SLOTS.map((slot) => {
            if (slot.isBreak) {
              return (
                <View key="lunch-break" style={styles.lunchRow}>
                  <View style={styles.periodColCell}>
                    <Text style={styles.lunchTimeText}>11:45 - 12:30</Text>
                    <Text style={styles.lunchLabelText}>Lunch Break</Text>
                  </View>
                  <View style={styles.lunchSpan}>
                    <Text style={styles.lunchSpanText}>🍱 LUNCH BREAK & REST PERIOD ☕</Text>
                  </View>
                </View>
              );
            }

            return (
              <View key={slot.periodNum} style={styles.trRow}>
                {/* Period Time Column */}
                <View style={styles.periodColCell}>
                  <Text style={styles.periodLabelText}>{slot.label}</Text>
                  <Text style={styles.periodTimeText}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </View>

                {/* Day Cells */}
                {DAYS_DEF.slice(0, 5).map((d) => {
                  const entry = matrix[d.dayNum]?.[slot.periodNum];
                  const isToday = highlightToday && d.dayNum === currentDayNum;

                  if (!entry) {
                    return (
                      <View
                        key={d.dayNum}
                        style={[styles.cell, styles.cellEmpty, isToday && styles.cellTodayBg]}
                      >
                        <Text style={styles.freePeriodText}>Free Period</Text>
                      </View>
                    );
                  }

                  const col = getSubjectColor(entry.subject_name);
                  const isMatched =
                    searchQuery.trim().length > 0 &&
                    (entry.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      entry.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      entry.room_number.toLowerCase().includes(searchQuery.toLowerCase()));

                  return (
                    <TouchableOpacity
                      key={d.dayNum}
                      style={[
                        styles.cell,
                        styles.cellOccupied,
                        { backgroundColor: col.bg, borderColor: col.border },
                        isMatched && styles.cellMatched,
                      ]}
                      onPress={() => onCellClick(entry)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.colorIndicator, { backgroundColor: col.text }]} />
                      <Text style={[styles.cellSubject, { color: col.text }]} numberOfLines={1}>
                        {entry.subject_name}
                      </Text>
                      <Text style={styles.cellClass} numberOfLines={1}>
                        {entry.class_name}
                      </Text>
                      <Text style={styles.cellRoom} numberOfLines={1}>
                        🚪 {entry.room_number ? `Room ${entry.room_number}` : 'Room 101'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Part 25: Dynamic Subject Legend */}
      <View style={styles.legendBar}>
        <Text style={styles.legendTitle}>SUBJECT LEGEND:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legendRow}>
            {uniqueSubjects.map((subName) => {
              const col = getSubjectColor(subName);
              return (
                <View key={subName} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: col.text }]} />
                  <Text style={styles.legendText}>{subName}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  thRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  periodColHeader: {
    width: 140,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  thLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  dayHeaderCell: {
    flex: 1,
    minWidth: 140,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  dayHeaderToday: {
    backgroundColor: '#F5F3FF',
  },
  dayHeaderShort: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayHeaderTodayText: {
    color: '#7C3AED',
  },
  dayHeaderFull: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dayHeaderTodaySub: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  periodColCell: {
    width: 140,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  periodLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  periodTimeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  lunchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  lunchTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  lunchLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 2,
  },
  lunchSpan: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  lunchSpanText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 1,
  },
  cell: {
    flex: 1,
    minWidth: 140,
    minHeight: 80,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    justifyContent: 'center',
    position: 'relative',
  },
  cellEmpty: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTodayBg: {
    backgroundColor: '#FAF5FF',
  },
  freePeriodText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  cellOccupied: {
    borderRadius: 12,
    margin: 4,
    borderWidth: 1,
  },
  cellMatched: {
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  colorIndicator: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  cellSubject: {
    fontSize: 13,
    fontWeight: '800',
    paddingLeft: 10,
  },
  cellClass: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    paddingLeft: 10,
    marginTop: 2,
  },
  cellRoom: {
    fontSize: 10,
    color: '#64748B',
    paddingLeft: 10,
    marginTop: 2,
  },
  legendBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
