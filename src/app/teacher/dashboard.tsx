/**
 * TeacherDashboard — Acade-style visual redesign.
 *
 * DESIGN ONLY: All API calls, hooks, services, and routing are unchanged.
 * Sidebar is owned by _layout.tsx — this file renders only the main content area.
 */
import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { DonutChart } from '../../components/DonutChart';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getDashboardSummary } from '../../services/dashboard';
import { getEvents } from '../../services/events';
import { getTeacherTimetable } from '../../services/timetable';
import { getMyProfile } from '../../services/profile';

const IS_WEB = Platform.OS === 'web';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // ─── All existing API hooks (unchanged) ──────────────────────────────────
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApi(getDashboardSummary);
  const { data: events, loading: eventsLoading } = useApi(() => getEvents(true));
  const { data: profile } = useApi(getMyProfile);

  const jsDay = new Date().getDay();
  const backendDay = jsDay === 0 ? 7 : jsDay;

  const { data: timetable, loading: timetableLoading } = useApi(
    async () => {
      if (!user) return [];
      return getTeacherTimetable(user.id, backendDay);
    },
    [user, backendDay]
  );

  // ─── Derived values ───────────────────────────────────────────────────────
  const firstName = user?.name?.split(' ')[0] ?? 'Teacher';
  const department = profile?.teacher_profile?.department ?? 'Staff';
  const totalClasses = summary?.total_classes ?? 0;
  const studentsCount = summary?.students_count ?? 0;

  // ─── Loading / error states ───────────────────────────────────────────────
  const isLoading = summaryLoading || eventsLoading || timetableLoading;
  const firstError = summary === null && !summaryLoading
    ? { statusCode: 0, message: 'Could not load dashboard data.' }
    : null;

  if (isLoading) return <LoadingScreen message="Loading Dashboard..." />;
  if (firstError) return <ErrorScreen error={firstError} onRetry={refetchSummary} />;
  if (!summary || !user) return <LoadingScreen message="Loading Dashboard..." />;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {IS_WEB ? (
        // ══════════════════════════════════════
        // WEB — sidebar owned by _layout.tsx
        // ══════════════════════════════════════
        <View style={styles.webMain}>
          {/* Top header bar */}
          <WebHeader user={user} subtitle={`${department} Department`} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.webContentPad}>
            {/* Welcome */}
            <View style={styles.welcomeRow}>
              <Text style={styles.welcomeTitle}>Welcome, {firstName} 👋</Text>
              <Text style={styles.welcomeSub}>{department} Department</Text>
            </View>

            {/* TODAY'S CLASSES */}
            <SectionLabel label="TODAY'S CLASSES" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timetableRow}>
              {timetable && timetable.length > 0 ? (
                timetable.map((entry) => (
                  <TimetableCard key={entry.id} entry={entry} isTeacher />
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No classes scheduled today.</Text>
                </View>
              )}
            </ScrollView>

            {/* STATS ROW */}
            <View style={styles.gridRow}>
              {/* Classes & Students card */}
              <View style={[styles.card, styles.donutCard]}>
                <Text style={styles.cardTitle}>Overview</Text>
                <Text style={styles.cardSub}>This Semester</Text>
                <View style={styles.donutWrap}>
                  <DonutChart
                    percentage={totalClasses > 0 ? Math.min(100, (totalClasses / 10) * 100) : 0}
                    size={150}
                    strokeWidth={16}
                    color={COLORS.primary}
                    centerLabel={`${totalClasses}`}
                    centerSublabel="Classes"
                  />
                </View>
                <View style={styles.legend}>
                  <LegendDot color={COLORS.primary} label={`${totalClasses} Classes`} />
                  <LegendDot color={COLORS.success} label={`${studentsCount} Students`} />
                </View>
              </View>

              {/* Notice Board */}
              <View style={[styles.card, styles.noticeCard]}>
                <Text style={styles.cardTitle}>Notice board</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {events && events.length > 0 ? (
                    events.slice(0, 6).map((ev, idx) => (
                      <NoticeItem key={ev.id} event={ev} idx={idx} />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No notices.</Text>
                  )}
                </ScrollView>
              </View>
            </View>

            {/* STATS CARD */}
            <View style={[styles.card]}>
              <Text style={styles.cardTitle}>Teaching Stats</Text>
              <Text style={styles.cardSub}>This semester</Text>
              <View style={styles.statsGrid}>
                <StatPill label="Classes Assigned" value={totalClasses} color={COLORS.info} />
                <StatPill label="Total Students" value={studentsCount} color={COLORS.success} />
                {summary.upcoming_exams !== undefined && (
                  <StatPill label="Upcoming Exams" value={summary.upcoming_exams} color={COLORS.warning} />
                )}
              </View>
            </View>

            <View style={{ height: SIZES.xl }} />
          </ScrollView>
        </View>
      ) : (
        // ══════════════════════════════════════
        // MOBILE
        // ══════════════════════════════════════
        <>
          <MobileHeader user={user} subtitle={`${department} Department`} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mobileContent}>
            <SectionLabel label="TODAY'S CLASSES" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timetableRow}>
              {timetable && timetable.length > 0 ? (
                timetable.map((entry) => (
                  <TimetableCard key={entry.id} entry={entry} compact isTeacher />
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No classes today.</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.mobileStatsRow}>
              <View style={[styles.miniStatCard, { borderLeftColor: COLORS.info }]}>
                <Text style={styles.miniStatVal}>{totalClasses}</Text>
                <Text style={styles.miniStatLabel}>Classes</Text>
              </View>
              <View style={[styles.miniStatCard, { borderLeftColor: COLORS.success }]}>
                <Text style={styles.miniStatVal}>{studentsCount}</Text>
                <Text style={styles.miniStatLabel}>Students</Text>
              </View>
            </View>

            <SectionLabel label="NOTICE BOARD" actionText="View All" onAction={() => router.push('/teacher/classes')} />
            <View style={[styles.card, { gap: SIZES.sm }]}>
              {events && events.length > 0 ? (
                events.slice(0, 4).map((ev, idx) => (
                  <NoticeItem key={ev.id} event={ev} idx={idx} />
                ))
              ) : (
                <Text style={styles.emptyText}>No upcoming events.</Text>
              )}
            </View>

            <SectionLabel label="QUICK ACTIONS" />
            <View style={styles.quickRow}>
              {[
                { label: 'Classes',    icon: '👥', route: '/teacher/classes'  },
                { label: 'Tasks',      icon: '📋', route: '/teacher/tasks'    },
                { label: 'Messages',   icon: '💬', route: '/teacher/chat'     },
                { label: 'Profile',    icon: '👤', route: '/teacher/profile'  },
              ].map((qa) => (
                <TouchableOpacity key={qa.label} style={styles.quickBtn} onPress={() => router.push(qa.route as any)}>
                  <Text style={{ fontSize: 26 }}>{qa.icon}</Text>
                  <Text style={styles.quickLabel}>{qa.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: SIZES.xxl }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function WebHeader({ user, subtitle }: { user: { name: string; avatarUrl?: string }; subtitle?: string }) {
  const firstName = user.name.split(' ')[0];
  return (
    <View style={styles.webHeader}>
      <View style={{ flex: 1 }} />
      <View style={styles.webHeaderRight}>
        <TouchableOpacity style={styles.iconBtn}><Text style={{ fontSize: 18 }}>🔍</Text></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <View style={styles.userPill}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.pillAvatar} />
          ) : (
            <View style={[styles.pillAvatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{firstName[0]}</Text>
            </View>
          )}
          <Text style={styles.pillName}>{user.name}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>▾</Text>
        </View>
      </View>
    </View>
  );
}

function MobileHeader({ user, subtitle }: { user: { name: string; avatarUrl?: string }; subtitle?: string }) {
  const firstName = user.name.split(' ')[0];
  return (
    <View style={styles.mobileHeader}>
      <View>
        <Text style={styles.mobileGreeting}>Good Morning, {firstName} 👋</Text>
        {subtitle ? <Text style={styles.mobileSub}>{subtitle}</Text> : null}
      </View>
      <View style={styles.mobileHeaderRight}>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
          <View style={styles.bellDot} />
        </TouchableOpacity>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.mobileAvatar} />
        ) : (
          <View style={[styles.mobileAvatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{firstName[0]}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function TimetableCard({ entry, compact, isTeacher }: { entry: any; compact?: boolean; isTeacher?: boolean }) {
  return (
    <View style={[styles.ttCard, compact && styles.ttCardCompact]}>
      <Text style={styles.ttTime}>{entry.start_time} – {entry.end_time}</Text>
      <Text style={styles.ttSubject} numberOfLines={2}>{entry.subject_name ?? 'Subject'}</Text>
      {isTeacher && entry.class_name ? (
        <Text style={styles.ttRoom} numberOfLines={1}>{entry.class_name}</Text>
      ) : entry.room_number ? (
        <Text style={styles.ttRoom} numberOfLines={1}>{entry.room_number}</Text>
      ) : null}
    </View>
  );
}

function SectionLabel({ label, actionText, onAction }: { label: string; actionText?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const NOTICE_COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#EC4899'];

function NoticeItem({ event, idx }: { event: any; idx: number }) {
  const accentColor = NOTICE_COLORS[idx % NOTICE_COLORS.length];
  return (
    <View style={styles.noticeItem}>
      <View style={[styles.noticeLine, { backgroundColor: accentColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.noticeAuthor, { color: accentColor }]} numberOfLines={1}>
          {event.type ? event.type.toUpperCase() : 'NOTICE'}
        </Text>
        <Text style={styles.noticeTitle} numberOfLines={2}>{event.title}</Text>
        {event.date ? <Text style={styles.noticeDate}>{event.date} · {event.time ?? ''}</Text> : null}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <View style={[styles.statPill, { borderColor: color + '30', backgroundColor: color + '10' }]}>
      <Text style={[styles.statPillVal, { color }]}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },

  webMain: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  webHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small, zIndex: 5,
  },
  webHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBtn: {
    padding: SIZES.sm, borderRadius: SIZES.radiusSm,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border,
  },
  notifDot: {
    position: 'absolute', top: 6, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.card,
  },
  userPill: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#F8FAFC', borderRadius: SIZES.radiusRound,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SIZES.sm, paddingVertical: 6,
  },
  pillAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.background },
  pillName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },
  webContentPad: { padding: SIZES.xl },

  welcomeRow: { marginBottom: SIZES.lg },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.3 },
  welcomeSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SIZES.sm, marginTop: SIZES.xs,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  sectionAction: { ...FONTS.body2, color: COLORS.primary, fontWeight: '600' },

  timetableRow: { gap: SIZES.md, paddingBottom: SIZES.md, paddingRight: SIZES.md },
  ttCard: {
    width: 190, backgroundColor: COLORS.card,
    borderRadius: SIZES.radius, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small, gap: 6,
  },
  ttCardCompact: { width: 150 },
  ttTime: { fontSize: 12, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.2 },
  ttSubject: { ...FONTS.body1, fontWeight: '700', color: COLORS.textDark, lineHeight: 20 },
  ttRoom: { ...FONTS.caption, color: COLORS.textSecondary },

  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small, marginBottom: SIZES.md,
  },
  cardTitle: { ...FONTS.h4, color: COLORS.textDark, marginBottom: 2 },
  cardSub: { ...FONTS.caption, color: COLORS.textSecondary },

  gridRow: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.xs },
  donutCard: { width: 280, alignItems: 'center' },
  noticeCard: { flex: 1, maxHeight: 300 },
  donutWrap: { marginTop: SIZES.md, marginBottom: SIZES.md },

  legend: { flexDirection: 'row', gap: SIZES.md, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...FONTS.caption, color: COLORS.textSecondary },

  noticeItem: {
    flexDirection: 'row', gap: SIZES.sm,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  noticeLine: { width: 3, borderRadius: 4, alignSelf: 'stretch' },
  noticeAuthor: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  noticeTitle: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500', lineHeight: 18 },
  noticeDate: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },

  statsGrid: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.md, flexWrap: 'wrap' },
  statPill: {
    flex: 1, minWidth: 140, borderRadius: SIZES.radius,
    borderWidth: 1, padding: SIZES.md, alignItems: 'center',
  },
  statPillVal: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  statPillLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },

  // Mobile
  mobileHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  mobileGreeting: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  mobileSub: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  mobileHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  bellBtn: {
    position: 'relative', padding: SIZES.sm,
    backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  bellDot: {
    position: 'absolute', top: 6, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.card,
  },
  mobileAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: COLORS.primary },
  mobileContent: { padding: SIZES.md },
  mobileStatsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  miniStatCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    padding: SIZES.md, borderLeftWidth: 3, ...SHADOWS.small,
  },
  miniStatVal: { ...FONTS.h3, color: COLORS.textDark },
  miniStatLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, justifyContent: 'space-between', marginBottom: SIZES.md },
  quickBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.md, width: '22%', aspectRatio: 1,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  quickLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textDark, textAlign: 'center', marginTop: 4 },
  emptyCard: {
    width: 220, backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.xl, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { ...FONTS.body2, color: COLORS.textLight, fontStyle: 'italic' },
});
