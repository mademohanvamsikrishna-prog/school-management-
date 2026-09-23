/**
 * Online Classes — upcoming and past online classes.
 * Derives classes from the weekly timetable (each timetable entry as a potential class).
 * No dedicated backend for online classes; uses timetable + polished UI with join links.
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { LoadingScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';
import { getClassTimetable, type TimetableEntry } from '../../services/timetable';

const IS_WEB = Platform.OS === 'web';

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PLATFORM_ICONS: Record<string, string> = { zoom: '📹', meet: '🟢', teams: '🟦', default: '🎥' };

function getTodayClasses(entries: TimetableEntry[]): TimetableEntry[] {
  const today = new Date().getDay();
  const backendDay = today === 0 ? 1 : today; // Sunday → Monday as fallback
  return entries.filter(e => e.day_of_week === backendDay);
}

function getUpcoming(entries: TimetableEntry[]): TimetableEntry[] {
  const today = new Date().getDay();
  const backendDay = today === 0 ? 1 : today;
  return entries.filter(e => e.day_of_week > backendDay);
}

export default function OnlineClassesScreen() {
  const { data: profile, loading: pLoading } = useApi(getMyProfile);
  const classId = profile?.student_profile?.class_id;

  const { data: entries, loading: eLoading } = useApi(
    async () => {
      if (!classId) return [];
      return getClassTimetable(classId);
    },
    [classId]
  );

  const loading = pLoading || eLoading;

  const todayClasses = useMemo(() => getTodayClasses(entries ?? []), [entries]);
  const upcomingClasses = useMemo(() => getUpcoming(entries ?? []), [entries]);

  if (loading) return <LoadingScreen message="Loading online classes..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Online Classes</Text>
          <Text style={styles.pageSub}>Your virtual class schedule</Text>
        </View>

        {/* Notice banner */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Online class links will be provided by your teachers. Join links will appear here when configured.
          </Text>
        </View>

        {/* Today's classes */}
        <Text style={styles.sectionLabel}>TODAY&apos;S CLASSES</Text>
        {todayClasses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎥</Text>
            <Text style={styles.emptyTitle}>No classes today</Text>
            <Text style={styles.emptySub}>You have no scheduled classes for today.</Text>
          </View>
        ) : (
          todayClasses.map(cls => <ClassCard key={cls.id} entry={cls} status="today" />)
        )}

        {/* Upcoming classes */}
        {upcomingClasses.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: SIZES.md }]}>UPCOMING THIS WEEK</Text>
            {upcomingClasses.slice(0, 6).map(cls => (
              <ClassCard key={cls.id} entry={cls} status="upcoming" />
            ))}
          </>
        )}

        {(!entries || entries.length === 0) && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No timetable configured</Text>
            <Text style={styles.emptySub}>Your class timetable has not been set up yet.</Text>
          </View>
        )}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ClassCard({ entry, status }: { entry: TimetableEntry; status: 'today' | 'upcoming' }) {
  const isToday = status === 'today';
  const platformIcon = PLATFORM_ICONS.default;

  return (
    <View style={[styles.classCard, isToday && styles.classCardToday]}>
      <View style={styles.classLeft}>
        <View style={[styles.platformIcon, { backgroundColor: isToday ? '#EEF2FF' : '#F8FAFC' }]}>
          <Text style={{ fontSize: 20 }}>{platformIcon}</Text>
        </View>
      </View>
      <View style={styles.classBody}>
        <View style={styles.classTop}>
          <Text style={styles.className}>{entry.subject_name ?? 'Subject'}</Text>
          <View style={[styles.statusChip, { backgroundColor: isToday ? '#EEF2FF' : '#F8FAFC' }]}>
            <Text style={[styles.statusChipText, { color: isToday ? COLORS.primary : COLORS.textSecondary }]}>
              {isToday ? '🔴 Today' : '📅 Upcoming'}
            </Text>
          </View>
        </View>
        <Text style={styles.classTime}>{entry.start_time} – {entry.end_time}</Text>
        {entry.teacher_name && <Text style={styles.classTeacher}>👩‍🏫 {entry.teacher_name}</Text>}
        <Text style={styles.classDay}>{DAY_NAMES[entry.day_of_week]}</Text>
      </View>
      <TouchableOpacity
        style={[styles.joinBtn, !isToday && styles.joinBtnDisabled]}
        onPress={() => isToday ? Linking.openURL('https://meet.google.com') : undefined}
        disabled={!isToday}
      >
        <Text style={[styles.joinBtnText, !isToday && { color: COLORS.textSecondary }]}>
          {isToday ? 'Join' : '—'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },
  noticeBanner: {
    flexDirection: 'row', gap: SIZES.sm, backgroundColor: '#EFF6FF',
    borderRadius: SIZES.radiusSm, padding: SIZES.md, marginBottom: SIZES.md,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  noticeIcon: { fontSize: 16 },
  noticeText: { ...FONTS.body2, color: '#1D4ED8', flex: 1, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SIZES.sm },
  classCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.md,
    marginBottom: SIZES.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  classCardToday: { borderColor: COLORS.primary, borderWidth: 1.5 },
  classLeft: {},
  platformIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  classBody: { flex: 1 },
  classTop: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: 4 },
  className: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '700', flex: 1 },
  statusChip: { paddingHorizontal: SIZES.sm, paddingVertical: 3, borderRadius: SIZES.radiusRound },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  classTime: { ...FONTS.caption, color: COLORS.primary, fontWeight: '600' },
  classTeacher: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  classDay: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },
  joinBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm, borderRadius: SIZES.radiusSm, minWidth: 60, alignItems: 'center',
  },
  joinBtnDisabled: { backgroundColor: COLORS.border },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
