import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimetableEntryItem, PERIOD_SLOTS } from './TimetableGrid';

interface TodaysSchedulePanelProps {
  todayEntries: TimetableEntryItem[];
  dateString: string;
}

export const TodaysSchedulePanel: React.FC<TodaysSchedulePanelProps> = ({
  todayEntries,
  dateString,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000); // update every 30 sec
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Helper to parse "08:30" to minutes from midnight
  const parseMins = (timeStr: string) => {
    const [h, m] = timeStr.slice(0, 5).split(':').map(Number);
    return h * 60 + m;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardHeaderTitle}>TODAY&apos;S SCHEDULE</Text>
          <Text style={styles.dateSubText}>{dateString}</Text>
        </View>
        <Text style={{ fontSize: 20 }}>🗓️</Text>
      </View>

      <View style={styles.scheduleList}>
        {PERIOD_SLOTS.filter((s) => !s.isBreak).map((slot) => {
          const entry = todayEntries.find((e) => {
            const startClean = e.start_time.slice(0, 5);
            return startClean === slot.startTime;
          });

          const startMins = parseMins(slot.startTime);
          const endMins = parseMins(slot.endTime);

          let status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' = 'UPCOMING';
          let minsLeft = 0;

          if (currentMinutes >= endMins) {
            status = 'COMPLETED';
          } else if (currentMinutes >= startMins && currentMinutes < endMins) {
            status = 'CURRENT';
            minsLeft = endMins - currentMinutes;
          } else {
            status = 'UPCOMING';
          }

          if (!entry) {
            return (
              <View key={slot.periodNum} style={styles.itemFree}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{slot.startTime}</Text>
                  <Text style={styles.timeSub}>{slot.endTime}</Text>
                </View>

                <View style={styles.dividerDot} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.freeText}>{slot.label} — Free Period</Text>
                </View>

                <View style={[styles.statusBadge, styles.badgeFree]}>
                  <Text style={styles.badgeFreeText}>Free</Text>
                </View>
              </View>
            );
          }

          return (
            <View
              key={slot.periodNum}
              style={[
                styles.item,
                status === 'CURRENT' && styles.itemCurrent,
                status === 'COMPLETED' && styles.itemCompleted,
              ]}
            >
              <View style={styles.timeCol}>
                <Text style={styles.timeText}>{slot.startTime}</Text>
                <Text style={styles.timeSub}>{slot.endTime}</Text>
              </View>

              <View
                style={[
                  styles.statusDot,
                  status === 'CURRENT'
                    ? { backgroundColor: '#7C3AED' }
                    : status === 'COMPLETED'
                    ? { backgroundColor: '#94A3B8' }
                    : { backgroundColor: '#3B82F6' },
                ]}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.subjectText} numberOfLines={1}>
                  {entry.subject_name}
                </Text>
                <Text style={styles.classText} numberOfLines={1}>
                  {entry.class_name} • Room {entry.room_number || '101'}
                </Text>
              </View>

              {status === 'CURRENT' ? (
                <View style={[styles.statusBadge, styles.badgeCurrent]}>
                  <Text style={styles.badgeCurrentText}>{minsLeft} min left</Text>
                </View>
              ) : status === 'COMPLETED' ? (
                <View style={[styles.statusBadge, styles.badgeDone]}>
                  <Text style={styles.badgeDoneText}>Completed</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.badgeUpcoming]}>
                  <Text style={styles.badgeUpcomingText}>Upcoming</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  dateSubText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  scheduleList: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  itemCurrent: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
    borderWidth: 1.5,
  },
  itemCompleted: {
    opacity: 0.6,
  },
  itemFree: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
    gap: 10,
  },
  timeCol: {
    width: 44,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeSub: {
    fontSize: 10,
    color: '#64748B',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  classText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  freeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCurrent: { backgroundColor: '#7C3AED' },
  badgeCurrentText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  badgeDone: { backgroundColor: '#E2E8F0' },
  badgeDoneText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  badgeUpcoming: { backgroundColor: '#EFF6FF' },
  badgeUpcomingText: { color: '#2563EB', fontSize: 11, fontWeight: '700' },
  badgeFree: { backgroundColor: '#F1F5F9' },
  badgeFreeText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
});
