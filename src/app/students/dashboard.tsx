/**
 * StudentDashboard — visual redesign (Acade-style).
 *
 * DESIGN ONLY: All API calls, hooks, services, and routing are 100% unchanged.
 * Only the visual presentation layer has been modified.
 *
 * Data sources (unchanged):
 *  - getDashboardSummary  → attendance %, present_days, absent_days
 *  - getClassTimetable    → today's timetable entries
 *  - getEvents            → notice board / upcoming events
 *  - getMyProfile         → class name, student profile info
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
import { getClassTimetable } from '../../services/timetable';
import { getTimetableDay } from '../../utils/timetableDay';
import { getMyProfile } from '../../services/profile';
import { getStudentMarks } from '../../services/marks';

const IS_WEB = Platform.OS === 'web';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // ─── All existing API hooks (unchanged) ──────────────────────────────────
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApi(getDashboardSummary);
  const { data: events, loading: eventsLoading } = useApi(() => getEvents(true));
  const { data: profile } = useApi(getMyProfile);

  const classId = profile?.student_profile?.class_id;
  const jsDay = new Date().getDay();
  const backendDay = getTimetableDay(jsDay);

  const { data: timetable, loading: timetableLoading } = useApi(
    async () => {
      if (!classId || backendDay === undefined) return [];
      return getClassTimetable(classId, backendDay);
    },
    [classId, backendDay]
  );

  const { data: marks } = useApi(
    async () => (user ? getStudentMarks(user.id) : []),
    [user]
  );

  // ─── Derived values ───────────────────────────────────────────────────────
  const attendancePct = summary?.attendance_percentage ?? 0;
  const presentDays   = summary?.present_days ?? 0;
  const absentDays    = summary?.absent_days ?? 0;

  const avgMarksPct = useMemo(() => {
    if (!marks || marks.length === 0) return 0;
    const scored = marks.reduce((sum, m) => sum + (m.marks_obtained ?? 0), 0);
    const total  = marks.reduce((sum, m) => sum + (m.max_marks ?? 100), 0);
    return total > 0 ? Math.round((scored / total) * 100) : 0;
  }, [marks]);

  const firstName = user?.name?.split(' ')[0] ?? 'Student';
  const className = profile?.student_profile?.class_name ?? '';

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
        // WEB LAYOUT — sidebar is owned by _layout.tsx
        // ══════════════════════════════════════
        <View style={styles.webMain}>
          {/* Top header bar */}
          <WebHeader user={user} />

          {/* Scrollable content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.webContentPad}
          >
            {/* Welcome + class */}
            <View style={styles.welcomeRow}>
              <View>
                <Text style={styles.welcomeTitle}>
                  Welcome, {firstName} 👋
                </Text>
                {className ? (
                  <Text style={styles.welcomeSub}>{className}</Text>
                ) : null}
              </View>
            </View>

            {/* TODAY'S TIMETABLE */}
            <SectionLabel label="TODAY'S TIMETABLE" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timetableRow}
            >
              {timetable && timetable.length > 0 ? (
                timetable.map((entry) => (
                  <TimetableCard key={entry.id} entry={entry} />
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No classes scheduled today.</Text>
                </View>
              )}
            </ScrollView>

            {/* SECOND ROW — Attendance | Notice Board */}
            <View style={styles.gridRow}>
              {/* Attendance card */}
              <View style={[styles.card, styles.donutCard]}>
                <Text style={styles.cardTitle}>Attendance</Text>
                <Text style={styles.cardSub}>This Semester</Text>
                <View style={styles.donutWrap}>
                  <DonutChart
                    percentage={attendancePct}
                    size={150}
                    strokeWidth={16}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.legend}>
                  <LegendDot color={COLORS.primary}   label="Present"    />
                  <LegendDot color="#F59E0B"           label="Not marked" />
                  <LegendDot color="#E2E8F0"           label="Absent"     />
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

            {/* THIRD ROW — Test Report | Attendance Stats */}
            <View style={styles.gridRow}>
              {/* Test report / Marks card */}
              <View style={[styles.card, styles.donutCard]}>
                <Text style={styles.cardTitle}>Test report</Text>
                <Text style={styles.cardSub}>
                  {marks && marks.length > 0 ? `CA ${marks.length}, overall` : 'No exams yet'}
                </Text>
                <View style={styles.donutWrap}>
                  <DonutChart
                    percentage={avgMarksPct}
                    size={150}
                    strokeWidth={16}
                    color="#6366F1"
                  />
                </View>
              </View>

              {/* Attendance stats */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Attendance Stats</Text>
                <Text style={styles.cardSub}>This semester</Text>
                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  <AttendanceStat label="Days Present" value={presentDays}        color={COLORS.success} />
                  <AttendanceStat label="Days Absent"  value={absentDays}         color={COLORS.error}   />
                  <AttendanceStat label="Overall %"    value={`${attendancePct}%`} color={COLORS.primary} />
                  {summary.upcoming_exams !== undefined && (
                    <AttendanceStat label="Upcoming Exams" value={summary.upcoming_exams} color={COLORS.warning} />
                  )}
                </View>
              </View>
            </View>

            {/* Bottom spacer */}
            <View style={{ height: SIZES.xl }} />
          </ScrollView>
        </View>
      ) : (
        // ══════════════════════════════════════
        // MOBILE LAYOUT — keeps existing tab-based nav
        // ══════════════════════════════════════
        <>
          {/* Header */}
          <View style={styles.mobileHeader}>
            <View>
              <Text style={styles.mobileGreeting}>Good Morning, {firstName} 👋</Text>
              {className ? <Text style={styles.mobileSub}>{className}</Text> : null}
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
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {firstName[0]}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mobileContent}>

            {/* Timetable — horizontal scroll */}
            <SectionLabel label="TODAY'S TIMETABLE" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timetableRow}>
              {timetable && timetable.length > 0 ? (
                timetable.map((entry) => (
                  <TimetableCard key={entry.id} entry={entry} compact />
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No classes today.</Text>
                </View>
              )}
            </ScrollView>

            {/* Attendance donut */}
            <SectionLabel label="ATTENDANCE" actionText="View Details" onAction={() => router.push('/students/academics')} />
            <View style={[styles.card, { alignItems: 'center', paddingVertical: SIZES.xl }]}>
              <DonutChart percentage={attendancePct} size={130} strokeWidth={14} />
              <View style={[styles.legend, { marginTop: SIZES.md }]}>
                <LegendDot color={COLORS.primary} label="Present" />
                <LegendDot color="#F59E0B"         label="Not marked" />
                <LegendDot color="#E2E8F0"         label="Absent" />
              </View>
            </View>

            {/* Quick stats row */}
            <View style={styles.mobileStatsRow}>
              <View style={[styles.miniStatCard, { borderLeftColor: COLORS.success }]}>
                <Text style={styles.miniStatVal}>{presentDays}</Text>
                <Text style={styles.miniStatLabel}>Present</Text>
              </View>
              <View style={[styles.miniStatCard, { borderLeftColor: COLORS.error }]}>
                <Text style={styles.miniStatVal}>{absentDays}</Text>
                <Text style={styles.miniStatLabel}>Absent</Text>
              </View>
              {summary.upcoming_exams !== undefined && (
                <View style={[styles.miniStatCard, { borderLeftColor: COLORS.warning }]}>
                  <Text style={styles.miniStatVal}>{summary.upcoming_exams}</Text>
                  <Text style={styles.miniStatLabel}>Exams</Text>
                </View>
              )}
            </View>

            {/* Test/Marks card */}
            {marks && marks.length > 0 && (
              <>
                <SectionLabel label="TEST REPORT" actionText="See All" onAction={() => router.push('/students/academics')} />
                <View style={[styles.card, { alignItems: 'center', paddingVertical: SIZES.xl }]}>
                  <DonutChart percentage={avgMarksPct} size={130} strokeWidth={14} color="#6366F1" />
                  <Text style={[styles.cardSub, { marginTop: SIZES.sm }]}>
                    Average across {marks.length} subject{marks.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </>
            )}

            {/* Events / Notice board */}
            <SectionLabel label="NOTICE BOARD" actionText="View All" onAction={() => router.push('/students/events')} />
            <View style={[styles.card, { gap: SIZES.md }]}>
              {events && events.length > 0 ? (
                events.slice(0, 4).map((ev, idx) => (
                  <NoticeItem key={ev.id} event={ev} idx={idx} />
                ))
              ) : (
                <Text style={styles.emptyText}>No upcoming events.</Text>
              )}
            </View>

            {/* Quick Actions */}
            <SectionLabel label="QUICK ACTIONS" />
            <View style={styles.quickRow}>
              {[
                { label: 'Attendance', icon: '📊', route: '/students/academics' },
                { label: 'Marks',      icon: '📝', route: '/students/academics' },
                { label: 'Events',     icon: '📅', route: '/students/events'   },
                { label: 'Profile',    icon: '👤', route: '/students/profile'  },
              ].map((qa) => (
                <TouchableOpacity
                  key={qa.label}
                  style={styles.quickBtn}
                  onPress={() => router.push(qa.route as any)}
                >
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

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Top header bar (web only) */
function WebHeader({ user }: { user: { name: string; avatarUrl?: string } }) {
  const firstName = user.name.split(' ')[0];
  return (
    <View style={styles.webHeader}>
      <View style={{ flex: 1 }} />
      {/* Right cluster */}
      <View style={styles.webHeaderRight}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { position: 'relative' }]}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
        {/* User pill */}
        <View style={styles.userPill}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.pillAvatar} />
          ) : (
            <View style={[styles.pillAvatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                {firstName[0]}
              </Text>
            </View>
          )}
          <Text style={styles.pillName}>{user.name}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>▾</Text>
        </View>
      </View>
    </View>
  );
}

/** Timetable entry card */
function TimetableCard({ entry, compact }: { entry: any; compact?: boolean }) {
  return (
    <View style={[styles.ttCard, compact && styles.ttCardCompact]}>
      <Text style={styles.ttTime}>
        {entry.start_time} – {entry.end_time}
      </Text>
      <Text style={styles.ttSubject} numberOfLines={2}>
        {entry.subject_name ?? 'Subject'}
      </Text>
      {entry.room_number ? (
        <Text style={styles.ttRoom} numberOfLines={1}>
          {entry.room_number}
        </Text>
      ) : null}
    </View>
  );
}

/** Section label + optional action */
function SectionLabel({
  label,
  actionText,
  onAction,
}: {
  label: string;
  actionText?: string;
  onAction?: () => void;
}) {
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

/** Notice board item */
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
        <Text style={styles.noticeTitle} numberOfLines={2}>
          {event.title}
        </Text>
        {event.date ? (
          <Text style={styles.noticeDate}>{event.date} · {event.time ?? ''}</Text>
        ) : null}
      </View>
    </View>
  );
}

/** Legend dot + label */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

/** Attendance stat row (web) */
function AttendanceStat({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  // ── Web root ─────────────────────────────────────────────────────────────
  webRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
  },
  webMain: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
    zIndex: 5,
  },
  webHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  iconBtn: {
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusRound,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
  },
  pillAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  pillName: {
    ...FONTS.body2,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  webContentPad: {
    padding: SIZES.xl,
  },

  // ── Welcome ──────────────────────────────────────────────────────────────
  welcomeRow: {
    marginBottom: SIZES.lg,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  welcomeSub: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
    marginTop: SIZES.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  sectionAction: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ── Timetable ─────────────────────────────────────────────────────────────
  timetableRow: {
    gap: SIZES.md,
    paddingBottom: SIZES.md,
    paddingRight: SIZES.md,
  },
  ttCard: {
    width: 190,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
    gap: 6,
  },
  ttCardCompact: {
    width: 150,
  },
  ttTime: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  ttSubject: {
    ...FONTS.body1,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 20,
  },
  ttRoom: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
    marginBottom: SIZES.md,
  },
  cardTitle: {
    ...FONTS.h4,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  cardSub: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },

  // ── Grid rows (web) ───────────────────────────────────────────────────────
  gridRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.xs,
  },
  donutCard: {
    width: 280,
    alignItems: 'center',
  },
  noticeCard: {
    flex: 1,
    maxHeight: 300,
  },
  donutWrap: {
    marginTop: SIZES.md,
    marginBottom: SIZES.md,
  },

  // ── Legend ────────────────────────────────────────────────────────────────
  legend: {
    flexDirection: 'row',
    gap: SIZES.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },

  // ── Notice board ──────────────────────────────────────────────────────────
  noticeItem: {
    flexDirection: 'row',
    gap: SIZES.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  noticeLine: {
    width: 3,
    borderRadius: 4,
    alignSelf: 'stretch',
  },
  noticeAuthor: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  noticeTitle: {
    ...FONTS.body2,
    color: COLORS.textDark,
    fontWeight: '500',
    lineHeight: 18,
  },
  noticeDate: {
    ...FONTS.caption,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // ── Stat rows (web) ───────────────────────────────────────────────────────
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statLabel: {
    flex: 1,
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  statValue: {
    ...FONTS.body2,
    fontWeight: '700',
  },

  // ── Mobile layout ─────────────────────────────────────────────────────────
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  mobileGreeting: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  mobileSub: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  bellBtn: {
    position: 'relative',
    padding: SIZES.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  mobileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  mobileContent: {
    padding: SIZES.md,
  },
  mobileStatsRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderLeftWidth: 3,
    ...SHADOWS.small,
  },
  miniStatVal: {
    ...FONTS.h3,
    color: COLORS.textDark,
  },
  miniStatLabel: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ── Quick actions (mobile) ────────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  quickBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    width: '22%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  quickLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Shared ────────────────────────────────────────────────────────────────
  emptyCard: {
    width: 220,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});