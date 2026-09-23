/**
 * TeacherTimetableScreen — Full weekly timetable for the teacher.
 * Mirrors /students/timetable — day tabs, period cards, today highlighted.
 *
 * API: GET /teacher/me/timetable  (no day filter → all days)
 */
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Platform,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F1F5F9', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleLight: '#F5F3FF',
  indigo: '#4F46E5', indigoLight: '#EEF2FF',
  green: '#10B981', amber: '#F59E0B',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function todayBackendDay(): number | undefined {
  const d = new Date().getDay();
  if (d === 0) return undefined;
  return d;
}

async function fetchTimetable() {
  return await apiClient.get<any[]>('/teacher/me/timetable');
}

const SUBJECT_COLORS = [
  { bg: '#EEF2FF', text: '#4F46E5', dot: '#4F46E5' },
  { bg: '#F5F3FF', text: '#7C3AED', dot: '#7C3AED' },
  { bg: '#D1FAE5', text: '#059669', dot: '#10B981' },
  { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
  { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  { bg: '#E0F2FE', text: '#0369A1', dot: '#0EA5E9' },
];

function subjectColor(subjectName: string) {
  const idx = Math.abs([...subjectName].reduce((a, c) => a + c.charCodeAt(0), 0)) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[idx];
}

function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export default function TeacherTimetableScreen() {
  const todayDay = todayBackendDay();
  const [activeDay, setActiveDay] = useState<number>(todayDay ?? 1);

  const { data: entries, loading, error, refetch } = useApi(fetchTimetable);

  const byDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (let d = 1; d <= 6; d++) map[d] = [];
    (entries ?? []).forEach((e: any) => {
      if (map[e.day_of_week]) map[e.day_of_week].push(e);
    });
    for (let d = 1; d <= 6; d++) {
      map[d].sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [entries]);

  const todayEntries = byDay[activeDay] ?? [];

  if (loading) return <LoadingScreen message="Loading timetable…" />;
  if (error)   return <ErrorScreen error={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={ttStyles.safeArea}>
      {/* Header */}
      <View style={ttStyles.pageHeader}>
        <View>
          <Text style={ttStyles.pageTitle}>My Timetable</Text>
          <Text style={ttStyles.pageSubtitle}>
            {(entries ?? []).length} periods · {DAY_FULL[(activeDay ?? 1) - 1]}
          </Text>
        </View>
        {todayDay !== undefined && (
          <View style={ttStyles.todayBadge}>
            <Text style={ttStyles.todayBadgeText}>Today: {DAYS[(todayDay) - 1]}</Text>
          </View>
        )}
      </View>

      {/* Day tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ttStyles.dayTabsScroll}>
        <View style={ttStyles.dayTabs}>
          {DAYS.map((day, i) => {
            const dayNum = i + 1;
            const isToday = dayNum === todayDay;
            const isActive = dayNum === activeDay;
            const count = (byDay[dayNum] ?? []).length;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  ttStyles.dayTab,
                  isActive && ttStyles.dayTabActive,
                  isToday && !isActive && ttStyles.dayTabToday,
                ]}
                onPress={() => setActiveDay(dayNum)}
              >
                <Text style={[ttStyles.dayTabLabel, isActive && ttStyles.dayTabLabelActive]}>{day}</Text>
                {count > 0 && (
                  <View style={[ttStyles.periodCountBadge, isActive && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                    <Text style={[ttStyles.periodCountText, isActive && { color: '#FFF' }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Period list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ttStyles.listPad}>
        {todayEntries.length === 0 ? (
          <View style={ttStyles.emptyState}>
            <Text style={ttStyles.emptyIcon}>🗓️</Text>
            <Text style={ttStyles.emptyText}>No classes on {DAY_FULL[(activeDay ?? 1) - 1]}</Text>
            <Text style={ttStyles.emptySubText}>Enjoy your free day!</Text>
          </View>
        ) : (
          todayEntries.map((entry: any, idx: number) => {
            const subName = entry.subject_name ?? entry.subject?.name ?? 'Subject';
            const clsName = entry.class_name ?? entry.class_room?.name ?? 'Class';
            const col = subjectColor(subName);
            return (
              <View key={entry.id ?? idx} style={[ttStyles.periodCard, { borderLeftColor: col.dot }]}>
                <View style={ttStyles.periodTimeCol}>
                  <Text style={ttStyles.periodStart}>{formatTime(entry.start_time)}</Text>
                  <View style={ttStyles.periodTimeLine} />
                  <Text style={ttStyles.periodEnd}>{formatTime(entry.end_time)}</Text>
                </View>

                <View style={[ttStyles.periodContent, { backgroundColor: col.bg }]}>
                  <View style={[ttStyles.periodDot, { backgroundColor: col.dot }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[ttStyles.periodSubject, { color: col.text }]}>{subName}</Text>
                    <View style={ttStyles.periodMeta}>
                      <Text style={ttStyles.periodMetaTxt}>📚 {clsName}</Text>
                      {entry.room_number && (
                        <Text style={ttStyles.periodMetaTxt}>🚪 {entry.room_number}</Text>
                      )}
                    </View>
                  </View>
                  <View style={ttStyles.durationBadge}>
                    <Text style={[ttStyles.durationTxt, { color: col.text }]}>
                      {calcDuration(entry.start_time, entry.end_time)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function calcDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim();
}

const ttStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingTop: IS_WEB ? SIZES.lg : SIZES.xl,
    paddingBottom: SIZES.md,
  },
  pageTitle: { ...FONTS.h2, color: C.textDark, fontWeight: '700' },
  pageSubtitle: { ...FONTS.body2, color: C.textSub, marginTop: 2 },
  todayBadge: {
    backgroundColor: C.purpleLight,
    borderRadius: 20,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
  },
  todayBadgeText: { ...FONTS.caption, color: C.purple, fontWeight: '700' },

  dayTabsScroll: { maxHeight: 60 },
  dayTabs: { flexDirection: 'row', paddingHorizontal: SIZES.lg, gap: SIZES.sm, paddingBottom: SIZES.sm },
  dayTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayTabActive: { backgroundColor: C.purple, borderColor: C.purple },
  dayTabToday: { borderColor: C.purple, borderWidth: 2 },
  dayTabLabel: { ...FONTS.body2, color: C.textSub, fontWeight: '700' },
  dayTabLabelActive: { color: '#FFF' },
  periodCountBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  periodCountText: { fontSize: 10, fontWeight: '700', color: C.purple },

  listPad: { paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, paddingBottom: 80, gap: SIZES.sm },

  periodCard: {
    flexDirection: 'row',
    gap: SIZES.md,
    borderLeftWidth: 4,
    paddingLeft: SIZES.sm,
  },
  periodTimeCol: { width: 58, alignItems: 'center', paddingTop: 4 },
  periodStart: { ...FONTS.caption, color: C.textSub, fontWeight: '700', fontSize: 11 },
  periodTimeLine: { width: 1, flex: 1, backgroundColor: C.border, marginVertical: 3 },
  periodEnd: { ...FONTS.caption, color: C.textLight, fontSize: 10 },
  periodContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  periodDot: { width: 8, height: 8, borderRadius: 4, marginRight: 2 },
  periodSubject: { ...FONTS.body1, fontWeight: '700', marginBottom: 3 },
  periodMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  periodMetaTxt: { ...FONTS.caption, color: C.textSub },
  durationBadge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationTxt: { fontSize: 11, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { ...FONTS.h4, color: C.textMid },
  emptySubText: { ...FONTS.body2, color: C.textSub },
});

