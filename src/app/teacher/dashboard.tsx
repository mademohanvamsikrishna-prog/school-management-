/**
 * TeacherDashboard — Rebuilt using the Student block-component pattern.
 *
 * Blocks:
 *   ① Welcome banner (teacher name, department, today's date)
 *   ② Stat cards: Today's Classes, Total Students, Avg Attendance %, Pending notifications
 *   ③ Today's timetable (horizontal scroll period cards)
 *   ④ Class attendance overview (per-class bar)
 *   ⑤ Quick actions: Mark Attendance, Enter Marks, View Students, Message, Timetable
 *   ⑥ Upcoming events
 *
 * APIs (all existing or newly added):
 *   GET /dashboard/summary
 *   GET /teacher/me/timetable?day={today}
 *   GET /teacher/me/classes
 *   GET /teacher/me/attendance/stats
 *   GET /events?upcoming_only=true
 *   GET /notifications/me
 *   GET /profile/me
 */
import React, { useMemo } from 'react';
import {
  ScrollView, View, StyleSheet, SafeAreaView, Text,
  Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getDashboardSummary } from '../../services/dashboard';
import { getEvents } from '../../services/events';
import { getMyNotifications } from '../../services/notifications';
import { getMyProfile } from '../../services/profile';
import { api as apiClient } from '../../services/api';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

// ─── Local palette (teacher = purple accent) ──────────────────────────────────
const C = {
  bg: '#F1F5F9', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleLight: '#F5F3FF', purpleDark: '#5B21B6',
  indigo: '#4F46E5', indigoLight: '#EEF2FF',
  green: '#10B981', greenLight: '#D1FAE5',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  red: '#EF4444', redLight: '#FEE2E2',
  blue: '#3B82F6', blueLight: '#EFF6FF',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

// ─── API helpers ──────────────────────────────────────────────────────────────
async function fetchTodayTimetable(userId: string | undefined, day: number) {
  if (!userId) return [];
  return await apiClient.get<any[]>(`/timetable/teacher/${userId}?day=${day}`);
}
async function fetchClasses()  { return await apiClient.get<any[]>('/teacher/me/classes'); }
async function fetchAttStats() { return await apiClient.get<any[]>('/teacher/me/attendance/stats'); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function todayStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function todayBackendDay() {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, bg, color }: {
  icon: string; label: string; value: string | number; sub?: string; bg: string; color: string;
}) {
  return (
    <View style={[statStyles.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <View style={[statStyles.iconWrap, { backgroundColor: bg }]}>
        <Text style={statStyles.icon}>{icon}</Text>
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
      {sub && <Text style={statStyles.sub}>{sub}</Text>}
    </View>
  );
}

function QuickAction({ icon, label, route, router }: {
  icon: string; label: string; route: string; router: any;
}) {
  return (
    <TouchableOpacity style={qaStyles.btn} onPress={() => router.push(route as any)} activeOpacity={0.8}>
      <View style={qaStyles.iconBox}><Text style={{ fontSize: 22 }}>{icon}</Text></View>
      <Text style={qaStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const backendDay = todayBackendDay();

  const { data: summary,  loading: summaryLoading,  refetch } = useApi(getDashboardSummary);
  const { data: events,   loading: eventsLoading  } = useApi(() => getEvents(true));
  const { data: profile                            } = useApi(getMyProfile);
  const { data: notifs                             } = useApi(getMyNotifications);
  const { data: todayTT,  loading: ttLoading       } = useApi(
    () => fetchTodayTimetable(user?.id, backendDay), [user?.id, backendDay]
  );
  const { data: classes,  loading: classesLoading  } = useApi(fetchClasses);
  const { data: attStats                           } = useApi(fetchAttStats);

  const isLoading = summaryLoading || eventsLoading || ttLoading || classesLoading;

  const firstName   = user?.name?.split(' ')[0] ?? 'Teacher';
  const department  = profile?.teacher_profile?.department ?? 'Staff';
  const employeeId  = profile?.teacher_profile?.employee_id ?? '—';
  const totalStudents = useMemo(() => {
    if (!classes) return summary?.students_count ?? 0;
    return (classes as any[]).reduce((sum: number, c: any) => sum + (c.student_count ?? 0), 0);
  }, [classes, summary]);
  const avgAttendance = useMemo(() => {
    if (!attStats || (attStats as any[]).length === 0) return '—';
    const avg = (attStats as any[]).reduce((s: number, c: any) => s + (c.attendance_pct ?? 0), 0) / (attStats as any[]).length;
    return `${avg.toFixed(1)}%`;
  }, [attStats]);
  const unreadCount  = (notifs ?? []).filter((n: any) => !n.is_read).length;
  const todayPeriods = useMemo(() => (todayTT ?? []).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)), [todayTT]);

  if (isLoading && !summary) return <LoadingScreen message="Loading Dashboard…" />;

  const SUBJECT_COLORS = ['#EEF2FF', '#F5F3FF', '#D1FAE5', '#FEF3C7', '#FEE2E2', '#E0F2FE'];
  const SUBJECT_TEXT   = ['#4F46E5', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0369A1'];
  function periodColor(subject: string) {
    const i = Math.abs([...subject].reduce((a, c) => a + c.charCodeAt(0), 0)) % SUBJECT_COLORS.length;
    return { bg: SUBJECT_COLORS[i], text: SUBJECT_TEXT[i] };
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ① Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.bannerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.welcomeGreet}>Good {greeting()}, {firstName}! 👋</Text>
              <Text style={styles.welcomeSub}>{department} · ID {employeeId}</Text>
              <Text style={styles.welcomeDate}>{todayStr()}</Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.notifBell} onPress={() => router.push('/teacher/notifications' as any)}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              <View style={styles.notifDot}>
                <Text style={styles.notifDotText}>{unreadCount}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ② Stat Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={styles.statsRow}>
            <StatCard icon="📚" label="Today's Classes"  value={todayPeriods.length}    bg={C.purpleLight} color={C.purple} />
            <StatCard icon="🎓" label="Total Students"   value={totalStudents}          bg={C.indigoLight} color={C.indigo} />
            <StatCard icon="📊" label="Avg Attendance"   value={avgAttendance}          bg={C.greenLight}  color={C.green}  sub="across classes" />
            <StatCard icon="🏫" label="My Classes"       value={(classes ?? []).length} bg={C.amberLight}  color={C.amber}  />
            <StatCard icon="🔔" label="Notifications"    value={unreadCount}            bg={C.redLight}    color={C.red}    sub="unread" />
          </View>
        </ScrollView>

        {/* ③ Today's Timetable */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Today&apos;s Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/teacher/timetable' as any)}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {todayPeriods.length === 0 ? (
            <View style={styles.emptyNote}>
              <Text style={styles.emptyNoteText}>No classes today. Enjoy your day!</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.periodRow}>
                {todayPeriods.map((p: any, i: number) => {
                  const subName = p.subject_name ?? p.subject?.name ?? 'Subject';
                  const col = periodColor(subName);
                  return (
                    <View key={p.id ?? i} style={[styles.periodCard, { backgroundColor: col.bg }]}>
                      <Text style={[styles.periodSubject, { color: col.text }]}>{subName}</Text>
                      <Text style={styles.periodClass}>{p.class_name ?? p.class_room?.name ?? '—'}</Text>
                      <Text style={styles.periodTime}>
                        {formatTime(p.start_time)} – {formatTime(p.end_time)}
                      </Text>
                      {p.room_number && (
                        <Text style={styles.periodRoom}>🚪 {p.room_number}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* ④ Class Attendance Overview */}
        {(attStats ?? []).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📊 Class Attendance</Text>
              <TouchableOpacity onPress={() => router.push('/teacher/attendance' as any)}>
                <Text style={styles.seeAll}>Mark →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.attCard}>
              {(attStats as any[]).map((cls: any) => {
                const pct = cls.attendance_pct ?? 0;
                const barColor = pct >= 85 ? C.green : pct >= 70 ? C.amber : C.red;
                return (
                  <View key={cls.class_id} style={styles.attRow}>
                    <View style={styles.attRowLeft}>
                      <Text style={styles.attClassName}>{cls.class_name}</Text>
                      <Text style={styles.attMeta}>{cls.student_count} students</Text>
                    </View>
                    <View style={styles.attBarWrap}>
                      <View style={[styles.attBarFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: barColor }]} />
                    </View>
                    <Text style={[styles.attPct, { color: barColor }]}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ⑤ Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.qaGrid}>
            <QuickAction icon="📊" label="Mark Attendance"  route="/teacher/attendance"  router={router} />
            <QuickAction icon="🏆" label="Enter Marks"      route="/teacher/marks"       router={router} />
            <QuickAction icon="🎓" label="My Students"      route="/teacher/students"    router={router} />
            <QuickAction icon="🗓️" label="Timetable"        route="/teacher/timetable"   router={router} />
            <QuickAction icon="💬" label="Messages"         route="/teacher/chat"        router={router} />
            <QuickAction icon="📋" label="Tasks"            route="/teacher/tasks"       router={router} />
          </View>
        </View>

        {/* ⑥ Upcoming Events */}
        {(events ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
            <View style={styles.eventsCard}>
              {(events as any[]).slice(0, 3).map((ev: any, i: number) => (
                <View key={ev.id ?? i} style={[styles.eventRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.border }]}>
                  <View style={[styles.eventDateBox, { backgroundColor: C.purpleLight }]}>
                    <Text style={[styles.eventDate, { color: C.purple }]}>
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <Text style={styles.eventMeta}>{ev.time} · {ev.location}</Text>
                  </View>
                  <View style={[styles.eventTypeBadge, { backgroundColor: C.purpleLight }]}>
                    <Text style={[styles.eventTypeText, { color: C.purple }]}>{ev.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 40 },

  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: SIZES.lg,
    backgroundColor: C.purple,
    borderRadius: 20,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, flex: 1 },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  welcomeGreet: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  welcomeSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  welcomeDate: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  notifBell: { position: 'relative', padding: SIZES.sm },
  notifDot: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: C.red, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  notifDotText: { fontSize: 9, fontWeight: '800', color: '#FFF' },

  statsScroll: { marginBottom: SIZES.sm },
  statsRow: { flexDirection: 'row', paddingHorizontal: SIZES.lg, gap: SIZES.sm },

  section: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  sectionTitle: { ...FONTS.h4, color: C.textDark, fontWeight: '700' },
  seeAll: { ...FONTS.body2, color: C.purple, fontWeight: '700' },

  emptyNote: {
    backgroundColor: C.card, borderRadius: 12, padding: SIZES.lg,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  emptyNoteText: { ...FONTS.body2, color: C.textSub },

  periodRow: { flexDirection: 'row', gap: SIZES.sm },
  periodCard: {
    width: 148, borderRadius: 14, padding: SIZES.md,
    gap: 4, ...SHADOWS.small,
  },
  periodSubject: { ...FONTS.body2, fontWeight: '700' },
  periodClass: { ...FONTS.caption, color: C.textSub },
  periodTime: { ...FONTS.caption, color: C.textSub, marginTop: 4 },
  periodRoom: { ...FONTS.caption, color: C.textLight },

  attCard: {
    backgroundColor: C.card, borderRadius: 14, padding: SIZES.md,
    borderWidth: 1, borderColor: C.border, gap: SIZES.md, ...SHADOWS.small,
  },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  attRowLeft: { width: 100 },
  attClassName: { ...FONTS.body2, color: C.textDark, fontWeight: '700' },
  attMeta: { ...FONTS.caption, color: C.textSub },
  attBarWrap: {
    flex: 1, height: 8, backgroundColor: '#F1F5F9',
    borderRadius: 4, overflow: 'hidden',
  },
  attBarFill: { height: 8, borderRadius: 4 },
  attPct: { width: 40, textAlign: 'right', fontSize: 13, fontWeight: '700' },

  qaGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm,
    marginTop: SIZES.sm,
  },

  eventsCard: {
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden', ...SHADOWS.small,
  },
  eventRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  eventDateBox: { borderRadius: 10, paddingHorizontal: SIZES.sm, paddingVertical: 6, alignItems: 'center', minWidth: 54 },
  eventDate: { fontSize: 12, fontWeight: '700' },
  eventTitle: { ...FONTS.body2, color: C.textDark, fontWeight: '700' },
  eventMeta: { ...FONTS.caption, color: C.textSub, marginTop: 1 },
  eventTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  eventTypeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
});

const statStyles = StyleSheet.create({
  card: {
    width: 130, backgroundColor: C.card, borderRadius: 14,
    padding: SIZES.md, gap: 4, ...SHADOWS.small,
    borderWidth: 1, borderColor: C.border,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  icon: { fontSize: 18 },
  value: { fontSize: 24, fontWeight: '800', color: C.textDark },
  label: { ...FONTS.caption, color: C.textSub, fontWeight: '600' },
  sub: { ...FONTS.caption, color: C.textLight },
});

const qaStyles = StyleSheet.create({
  btn: {
    width: '30%',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: SIZES.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOWS.small,
    flexGrow: 1,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.purpleLight, alignItems: 'center', justifyContent: 'center',
  },
  label: { ...FONTS.caption, color: C.textMid, fontWeight: '700', textAlign: 'center' },
});

