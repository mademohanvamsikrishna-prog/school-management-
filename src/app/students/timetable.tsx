/**
 * Timetable — full weekly class timetable.
 * Fetches all days for the student's class from GET /timetable/class/{class_id}.
 * Highlights today's column.
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';
import { getClassTimetable } from '../../services/timetable';

const IS_WEB = Platform.OS === 'web';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** JS getDay() → backend day (1=Mon ... 6=Sat, 0→undefined for Sunday) */
function todayBackendDay(): number | undefined {
  const d = new Date().getDay();
  if (d === 0) return undefined;
  return d; // JS: 1=Mon...6=Sat matches backend
}

export default function TimetableScreen() {
  const { data: profile, loading: pLoading } = useApi(getMyProfile);
  const classId = profile?.student_profile?.class_id;
  const todayDay = todayBackendDay();

  // Fetch all days (no day filter)
  const { data: entries, loading: tLoading, error, refetch } = useApi(
    async () => {
      if (!classId) return [];
      return getClassTimetable(classId);
    },
    [classId]
  );

  const loading = pLoading || tLoading;

  // Group by day_of_week
  const byDay = useMemo(() => {
    const map: Record<number, typeof entries> = {};
    for (let d = 1; d <= 6; d++) map[d] = [];
    (entries ?? []).forEach(e => {
      if (!map[e.day_of_week]) map[e.day_of_week] = [];
      map[e.day_of_week]!.push(e);
    });
    // Sort each day by start_time
    for (let d = 1; d <= 6; d++) {
      map[d]!.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [entries]);

  if (loading) return <LoadingScreen message="Loading timetable..." />;
  if (error) return <ErrorScreen error={error} onRetry={refetch} />;

  if (!classId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyIcon}>🗓️</Text>
          <Text style={styles.emptyTitle}>No class assigned</Text>
          <Text style={styles.emptySub}>Your class information is not available yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Weekly Timetable</Text>
          <Text style={styles.pageSub}>
            {profile?.student_profile?.class_name ?? 'Class'} · {todayDay ? `Today: ${DAY_FULL[todayDay - 1]}` : 'Sunday — No classes'}
          </Text>
        </View>

        {IS_WEB ? (
          // ── Desktop: horizontal scrollable grid ──────────────────────────
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.gridWrap}>
              {/* Day header row */}
              <View style={styles.gridHeaderRow}>
                {DAYS.map((day, idx) => {
                  const dayNum = idx + 1;
                  const isToday = dayNum === todayDay;
                  return (
                    <View key={day} style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
                      <Text style={[styles.dayHeaderText, isToday && styles.dayHeaderTextToday]}>{day}</Text>
                      {isToday && <View style={styles.todayDot} />}
                    </View>
                  );
                })}
              </View>

              {/* Period columns */}
              <View style={styles.gridBody}>
                {DAYS.map((_, idx) => {
                  const dayNum = idx + 1;
                  const isToday = dayNum === todayDay;
                  const dayEntries = byDay[dayNum] ?? [];
                  return (
                    <View key={dayNum} style={[styles.dayColumn, isToday && styles.dayColumnToday]}>
                      {dayEntries.length === 0 ? (
                        <View style={styles.noPeriodCard}>
                          <Text style={styles.noPeriodText}>No class</Text>
                        </View>
                      ) : (
                        dayEntries.map((entry, i) => (
                          <PeriodCard key={entry.id} entry={entry} index={i} isToday={isToday} />
                        ))
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        ) : (
          // ── Mobile: vertical per-day list ─────────────────────────────────
          DAYS.map((day, idx) => {
            const dayNum = idx + 1;
            const isToday = dayNum === todayDay;
            const dayEntries = byDay[dayNum] ?? [];
            return (
              <View key={dayNum} style={[styles.mobileDaySection, isToday && styles.mobileDaySectionToday]}>
                <View style={styles.mobileDayHeader}>
                  <Text style={[styles.mobileDayLabel, isToday && styles.mobileDayLabelToday]}>{DAY_FULL[idx]}</Text>
                  {isToday && <View style={styles.todayChip}><Text style={styles.todayChipText}>Today</Text></View>}
                </View>
                {dayEntries.length === 0 ? (
                  <Text style={styles.noPeriodText}>No classes scheduled</Text>
                ) : (
                  dayEntries.map((entry, i) => (
                    <PeriodCard key={entry.id} entry={entry} index={i} isToday={isToday} />
                  ))
                )}
              </View>
            );
          })
        )}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PERIOD_COLORS = ['#EEF2FF', '#F0FDF4', '#FFF7ED', '#FEF2F2', '#F0F9FF', '#FDF4FF'];
const PERIOD_ACCENTS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7'];

function PeriodCard({ entry, index, isToday }: { entry: any; index: number; isToday: boolean }) {
  const bg = PERIOD_COLORS[index % PERIOD_COLORS.length];
  const accent = PERIOD_ACCENTS[index % PERIOD_ACCENTS.length];
  return (
    <View style={[styles.periodCard, { backgroundColor: bg, borderLeftColor: accent }]}>
      <Text style={[styles.periodTime, { color: accent }]}>
        {entry.start_time} – {entry.end_time}
      </Text>
      <Text style={styles.periodSubject} numberOfLines={2}>{entry.subject_name ?? 'Subject'}</Text>
      {entry.teacher_name && (
        <Text style={styles.periodTeacher}>👩‍🏫 {entry.teacher_name}</Text>
      )}
      {entry.room_number && (
        <Text style={styles.periodRoom}>📍 Room {entry.room_number}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  // Web grid
  gridWrap: { flex: 1 },
  gridHeaderRow: { flexDirection: 'row', marginBottom: SIZES.sm },
  dayHeader: {
    width: 180, padding: SIZES.md, alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    marginRight: SIZES.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  dayHeaderToday: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayHeaderText: { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '700' },
  dayHeaderTextToday: { color: '#fff' },
  todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginTop: 4 },
  gridBody: { flexDirection: 'row' },
  dayColumn: { width: 180, marginRight: SIZES.sm, gap: SIZES.sm },
  dayColumnToday: {},
  noPeriodCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  noPeriodText: { ...FONTS.caption, color: COLORS.textLight, fontStyle: 'italic' },

  // Period card
  periodCard: {
    borderRadius: SIZES.radiusSm, padding: SIZES.md, marginBottom: SIZES.sm,
    borderLeftWidth: 4, ...SHADOWS.small,
  },
  periodTime: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, marginBottom: 4 },
  periodSubject: { ...FONTS.body2, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  periodTeacher: { ...FONTS.caption, color: COLORS.textSecondary },
  periodRoom: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },

  // Mobile day sections
  mobileDaySection: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.md,
    marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  mobileDaySectionToday: { borderColor: COLORS.primary, borderWidth: 2 },
  mobileDayHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.sm },
  mobileDayLabel: { ...FONTS.h4, color: COLORS.textDark },
  mobileDayLabelToday: { color: COLORS.primary },
  todayChip: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.sm, paddingVertical: 3, borderRadius: SIZES.radiusRound },
  todayChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Empty state
  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.sm, padding: SIZES.xl },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h3, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
