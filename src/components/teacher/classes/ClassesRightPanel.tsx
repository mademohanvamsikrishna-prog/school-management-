import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface TodayScheduleItem {
  id: string;
  time: string;
  subject: string;
  className: string;
  room: string;
  isCurrent?: boolean;
}

export interface ClassDistribution {
  className: string;
  count: number;
  percentage: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  className: string;
  date: string;
  tag?: string;
}

interface ClassesRightPanelProps {
  todaySchedule: TodayScheduleItem[];
  totalStudents: number;
  classDistributions: ClassDistribution[];
  recentActivities: RecentActivityItem[];
  onNavigateToTimetable: () => void;
  onNavigateToStudents: () => void;
}

export const ClassesRightPanel: React.FC<ClassesRightPanelProps> = ({
  todaySchedule,
  totalStudents,
  classDistributions,
  recentActivities,
  onNavigateToTimetable,
  onNavigateToStudents,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0); // 0 = Mon, 1 = Tue, etc.

  const weekDays = [
    { label: 'Mon', date: '22' },
    { label: 'Tue', date: '23' },
    { label: 'Wed', date: '24' },
    { label: 'Thu', date: '25' },
    { label: 'Fri', date: '26' },
  ];

  const CLASS_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <View style={styles.container}>
      {/* 1. WEEKLY OVERVIEW CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>WEEKLY OVERVIEW</Text>
          <TouchableOpacity onPress={onNavigateToTimetable}>
            <Text style={styles.viewLinkText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {/* Compact Week Day Selector */}
        <View style={styles.weekRow}>
          {weekDays.map((day, idx) => {
            const isSelected = idx === selectedDayIdx;
            return (
              <TouchableOpacity
                key={day.label}
                style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
                onPress={() => setSelectedDayIdx(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>
                  {day.label}
                </Text>
                <Text style={[styles.dayDate, isSelected && styles.dayDateActive]}>
                  {day.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule list */}
        <View style={styles.scheduleList}>
          {todaySchedule.length === 0 ? (
            <View style={styles.emptySchedule}>
              <Text style={styles.emptyScheduleText}>No classes scheduled for this day.</Text>
            </View>
          ) : (
            todaySchedule.map((item) => (
              <View key={item.id} style={styles.scheduleItem}>
                <View style={styles.scheduleHeaderRow}>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                  <View
                    style={[
                      styles.scheduleBadge,
                      item.isCurrent ? styles.badgeCurrent : styles.badgeUpcoming,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scheduleBadgeText,
                        item.isCurrent ? styles.badgeCurrentText : styles.badgeUpcomingText,
                      ]}
                    >
                      {item.isCurrent ? 'Current' : 'Upcoming'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.scheduleSubject}>{item.subject}</Text>
                <Text style={styles.scheduleMeta}>
                  {item.className} | {item.room}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* 2. STUDENTS BY CLASS CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>STUDENTS BY CLASS</Text>
          <TouchableOpacity onPress={onNavigateToStudents}>
            <Text style={styles.viewLinkText}>View Details →</Text>
          </TouchableOpacity>
        </View>

        {/* Donut Chart Visual */}
        <View style={styles.donutContainer}>
          <View style={styles.donutOuter}>
            <View style={styles.donutInner}>
              <Text style={styles.donutTotal}>{totalStudents}</Text>
              <Text style={styles.donutLabel}>Students</Text>
            </View>
          </View>
        </View>

        {/* Legend List */}
        <View style={styles.legendContainer}>
          {classDistributions.map((c, idx) => {
            const color = CLASS_COLORS[idx % CLASS_COLORS.length];
            return (
              <View key={c.className} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendName}>{c.className}</Text>
                <Text style={styles.legendCount}>
                  {c.count} ({c.percentage.toFixed(0)}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 3. RECENT CLASS ACTIVITIES CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>RECENT CLASS ACTIVITIES</Text>
          <TouchableOpacity>
            <Text style={styles.viewLinkText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentActivities.map((act) => (
            <View key={act.id} style={styles.activityItem}>
              <View style={styles.activityIconWrap}>
                <Text style={{ fontSize: 15 }}>📌</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {act.title}
                </Text>
                <View style={styles.activityMetaRow}>
                  <Text style={styles.activityClass}>{act.className}</Text>
                  <Text style={styles.activityDate}>• {act.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  viewLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dayBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayBtnActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dayDateActive: {
    color: '#FFFFFF',
  },
  scheduleList: {
    gap: 10,
  },
  scheduleItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  scheduleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeCurrent: {
    backgroundColor: '#D1FAE5',
  },
  badgeCurrentText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeUpcoming: {
    backgroundColor: '#EFF6FF',
  },
  badgeUpcomingText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },
  scheduleSubject: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  emptySchedule: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyScheduleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  donutOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    alignItems: 'center',
  },
  donutTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  donutLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  legendContainer: {
    gap: 8,
    marginTop: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  legendCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activityClass: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  activityDate: {
    fontSize: 11,
    color: '#64748B',
  },
});
