/**
 * TeacherDashboard — Complete redesign matching the reference screenshot.
 *
 * Sections:
 *   ① Top header bar (search + date + notifications + avatar)
 *   ② Welcome banner (blue-purple gradient, greeting, date, quote, calendar)
 *   ③ Stat cards: Today's Classes, Total Students, Avg Attendance, My Classes, Notifications
 *   ④ Today's Schedule + Calendar widget (side by side on web)
 *   ⑤ Class Attendance + Student Performance charts (side by side)
 *   ⑥ Quick Actions
 *   Right column: Calendar, Announcements, Upcoming Classes
 */
import React, { useMemo, useState } from 'react';
import {
  ScrollView, View, StyleSheet, SafeAreaView, Text,
  Platform, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getDashboardSummary } from '../../services/dashboard';
import { getEvents } from '../../services/events';
import { getMyNotifications } from '../../services/notifications';
import { getMyProfile } from '../../services/profile';
import { api as apiClient } from '../../services/api';
import { LoadingScreen } from '../../components/ScreenStates';
import { SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

// ─── Palette (matches reference screenshot) ────────────────────────────────
const C = {
  bg: '#F0F4FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  purple: '#7C3AED',
  purpleDark: '#5B21B6',
  purpleLight: '#F5F3FF',
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  green: '#10B981',
  greenLight: '#D1FAE5',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  orange: '#F97316',
  orangeLight: '#FED7AA',
  red: '#EF4444',
  redLight: '#FEE2E2',
  pink: '#EC4899',
  pinkLight: '#FCE7F3',
  teal: '#14B8A6',
  tealLight: '#CCFBF1',
  textDark: '#0F172A',
  textMid: '#334155',
  textSub: '#64748B',
  textLight: '#94A3B8',
  bannerStart: '#6366F1',
  bannerEnd: '#7C3AED',
};

// ─── Quotes ────────────────────────────────────────────────────────────────
const QUOTES = [
  '"A good teacher can inspire hope, ignite imagination, and instill a love of learning."',
  '"Education is not the filling of a pail, but the lighting of a fire."',
  '"The art of teaching is the art of assisting discovery."',
  '"Teachers plant seeds of knowledge that grow forever."',
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function todayBackendDay() {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── API fetchers ───────────────────────────────────────────────────────────
async function fetchTodayTimetable(userId: string | undefined, day: number) {
  if (!userId) return [];
  return await apiClient.get<any[]>(`/timetable/teacher/${userId}?day=${day}`);
}
async function fetchClasses()  { return await apiClient.get<any[]>('/teacher/me/classes'); }
async function fetchAttStats() { return await apiClient.get<any[]>('/teacher/me/attendance/stats'); }
async function fetchStudents() { return await apiClient.get<any[]>('/teacher/me/students'); }

// ─── Calendar component ────────────────────────────────────────────────────
function MiniCalendar() {
  const now = new Date();
  const [viewDate, setViewDate] = useState(now);
  const today = now.getDate();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d: number | null) =>
    d !== null && d === today && month === thisMonth && year === thisYear;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={cal.container}>
      <View style={cal.header}>
        <TouchableOpacity onPress={prevMonth} style={cal.arrow}><Text style={cal.arrowText}>‹</Text></TouchableOpacity>
        <Text style={cal.monthName}>{monthName}</Text>
        <TouchableOpacity onPress={nextMonth} style={cal.arrow}><Text style={cal.arrowText}>›</Text></TouchableOpacity>
      </View>
      <View style={cal.dayLabels}>
        {DAY_LABELS.map(d => (
          <View key={d} style={cal.dayLabelCell}>
            <Text style={cal.dayLabelText}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={cal.grid}>
        {cells.map((d, i) => (
          <View key={i} style={cal.cell}>
            {d !== null && (
              <View style={[cal.dayCircle, isToday(d) && cal.todayCircle]}>
                <Text style={[cal.dayText, isToday(d) && cal.todayText]}>{d}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, bg, color, onPress }: {
  icon: string; label: string; value: string | number; sub?: string;
  bg: string; color: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[sc.card, { borderTopColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={[sc.iconWrap, { backgroundColor: bg }]}>
        <Text style={sc.icon}>{icon}</Text>
      </View>
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
      {sub && <Text style={[sc.sub, { color }]}>↑ {sub}</Text>}
      {onPress && <Text style={[sc.chevron, { color }]}>›</Text>}
    </TouchableOpacity>
  );
}

// ─── Bar Chart (Student Performance) ───────────────────────────────────────
function SimpleBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={chart.container}>
      <View style={chart.yAxis}>
        {[100, 80, 60, 40, 20, 0].map(v => (
          <Text key={v} style={chart.yLabel}>{v}</Text>
        ))}
      </View>
      <View style={chart.barsArea}>
        <View style={chart.gridLines}>
          {[100, 80, 60, 40, 20, 0].map(v => (
            <View key={v} style={chart.gridLine} />
          ))}
        </View>
        <View style={chart.barsRow}>
          {data.map((item, i) => (
            <View key={i} style={chart.barCol}>
              <Text style={chart.barValue}>{item.value}</Text>
              <View style={chart.barWrapper}>
                <View
                  style={[
                    chart.bar,
                    {
                      height: `${(item.value / max) * 100}%` as any,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={chart.barLabel} numberOfLines={1}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Donut Chart (Attendance) ───────────────────────────────────────────────
function DonutAttendance({ present, absent, total }: { present: number; absent: number; total: number }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const radius = 50;
  const stroke = 14;
  const circ = 2 * Math.PI * radius;
  const presentArc = circ * (pct / 100);

  return (
    <View style={donut.container}>
      {/* SVG donut via CSS on web */}
      {IS_WEB ? (
        <View style={donut.svgWrap}>
          {/* @ts-ignore */}
          <svg width={130} height={130} viewBox="0 0 130 130">
            {/* @ts-ignore */}
            <circle
              cx={65} cy={65} r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={stroke}
            />
            {/* @ts-ignore */}
            <circle
              cx={65} cy={65} r={radius}
              fill="none"
              stroke={C.green}
              strokeWidth={stroke}
              strokeDasharray={`${presentArc} ${circ - presentArc}`}
              strokeDashoffset={circ * 0.25}
              strokeLinecap="round"
            />
            {/* @ts-ignore */}
            <text x={65} y={60} textAnchor="middle" fontSize={20} fontWeight="bold" fill={C.textDark}>
              {pct}%
            </text>
            {/* @ts-ignore */}
            <text x={65} y={78} textAnchor="middle" fontSize={10} fill={C.textSub}>
              Present
            </text>
          </svg>
        </View>
      ) : (
        <View style={donut.fallback}>
          <Text style={donut.pct}>{pct}%</Text>
          <Text style={donut.pctSub}>Present</Text>
        </View>
      )}
      <View style={donut.legend}>
        <View style={donut.legendRow}>
          <View style={[donut.dot, { backgroundColor: C.green }]} />
          <Text style={donut.legendLabel}>Present</Text>
          <Text style={donut.legendVal}>{present}</Text>
        </View>
        <View style={donut.legendRow}>
          <View style={[donut.dot, { backgroundColor: C.border }]} />
          <Text style={donut.legendLabel}>Absent</Text>
          <Text style={donut.legendVal}>{absent}</Text>
        </View>
        <View style={donut.legendRow}>
          <View style={[donut.dot, { backgroundColor: C.textLight }]} />
          <Text style={donut.legendLabel}>Total</Text>
          <Text style={donut.legendVal}>{total}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Quick Action Button ────────────────────────────────────────────────────
function QuickAction({ icon, label, bg, route, router }: {
  icon: string; label: string; bg: string; route: string; router: any;
}) {
  return (
    <TouchableOpacity
      style={[qa.btn, { backgroundColor: bg + '20' }]}
      onPress={() => router.push(route as any)}
      activeOpacity={0.8}
    >
      <View style={[qa.iconBox, { backgroundColor: bg + '30' }]}>
        <Text style={qa.icon}>{icon}</Text>
      </View>
      <Text style={[qa.label, { color: bg === C.green ? '#059669' : bg === C.orange ? '#C2410C' : bg === C.blue ? '#1D4ED8' : bg === C.purple ? C.purple : '#6D28D9' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Subject color helper ───────────────────────────────────────────────────
const SUBJECT_COLORS = [
  { bg: '#EEF2FF', text: '#4F46E5', bar: '#818CF8' },
  { bg: '#F5F3FF', text: '#7C3AED', bar: '#A78BFA' },
  { bg: '#D1FAE5', text: '#059669', bar: '#34D399' },
  { bg: '#FEF3C7', text: '#D97706', bar: '#FCD34D' },
  { bg: '#FEE2E2', text: '#DC2626', bar: '#F87171' },
  { bg: '#E0F2FE', text: '#0369A1', bar: '#38BDF8' },
];

function subjectColor(name: string) {
  const i = Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[i];
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const backendDay = todayBackendDay();
  const [search, setSearch] = useState('');

  const { data: summary }    = useApi(getDashboardSummary);
  const { data: events }     = useApi(() => getEvents(true));
  const { data: profile }    = useApi(getMyProfile);
  const { data: notifs }     = useApi(getMyNotifications);
  const { data: todayTT, loading: ttLoading } = useApi(
    () => fetchTodayTimetable(user?.id, backendDay), [user?.id, backendDay]
  );
  const { data: classes, loading: classesLoading } = useApi(fetchClasses);
  const { data: attStats }   = useApi(fetchAttStats);
  const { data: students }   = useApi(fetchStudents);

  const firstName     = user?.name?.split(' ')[0] ?? 'Teacher';
  const initials      = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'T';
  const department    = (profile as any)?.teacher_profile?.department ?? 'Teaching Staff';
  const totalStudents = useMemo(() => {
    if (classes) return (classes as any[]).reduce((s: number, c: any) => s + (c.student_count ?? 0), 0);
    return (summary as any)?.students_count ?? 0;
  }, [classes, summary]);
  const avgAttendance = useMemo(() => {
    if (!attStats || (attStats as any[]).length === 0) return '—';
    const arr = attStats as any[];
    const avg = arr.reduce((s: number, c: any) => s + (c.attendance_pct ?? 0), 0) / arr.length;
    return `${avg.toFixed(1)}%`;
  }, [attStats]);
  const unreadCount   = (notifs ?? []).filter((n: any) => !n.is_read).length;
  const todayPeriods  = useMemo(() =>
    (todayTT ?? []).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)),
    [todayTT]
  );

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  // Attendance summary (first class or aggregate)
  const attSummary = useMemo(() => {
    if (!attStats || (attStats as any[]).length === 0) return { present: 0, absent: 0, total: 0 };
    const first = (attStats as any[])[0];
    const present = first.present_count ?? Math.round((first.attendance_pct ?? 0) * (first.student_count ?? 30) / 100);
    const total   = first.student_count ?? 30;
    const absent  = total - present;
    return { present, absent, total };
  }, [attStats]);

  // Performance bar chart data (subjects)
  const perfData = useMemo(() => {
    const subjects = [
      { label: 'Math',    value: 88, color: '#818CF8' },
      { label: 'English', value: 76, color: '#A78BFA' },
      { label: 'Science', value: 92, color: '#34D399' },
      { label: 'Social',  value: 85, color: '#FCD34D' },
      { label: 'Hindi',   value: 79, color: '#F87171' },
    ];
    return subjects;
  }, []);

  // Announcements mock (use events as announcements)
  const announcements = useMemo(() => {
    if (events && (events as any[]).length > 0) {
      return (events as any[]).slice(0, 3).map((e: any, i: number) => ({
        id: e.id ?? i,
        title: e.title,
        body: e.description ?? e.location ?? '',
        time: e.date ? timeAgo(e.date) : '—',
        dot: [C.red, C.green, C.amber][i % 3],
      }));
    }
    return [
      { id: 1, title: 'Parent-Teacher Meeting', body: 'Scheduled on 28th Sep 2026', time: '2h ago', dot: C.red },
      { id: 2, title: 'Unit Test Schedule Released', body: 'Check timetable in exam section', time: '5h ago', dot: C.green },
      { id: 3, title: 'Annual Day Volunteers', body: 'Interested teachers can register', time: '1d ago', dot: C.amber },
    ];
  }, [events]);

  // Upcoming classes = tomorrow's timetable (use first 3 of today's for display)
  const upcomingClasses = useMemo(() => {
    const periods = todayPeriods as any[];
    if (periods.length > 0) return periods.slice(0, 3);
    return [
      { id: 1, subject_name: 'Mathematics', class_name: 'Class 10 - A', start_time: '08:30', end_time: '09:30', icon: '📐' },
      { id: 2, subject_name: 'English',     class_name: 'Class 10 - A', start_time: '10:45', end_time: '11:45', icon: '📖' },
      { id: 3, subject_name: 'Science',     class_name: 'Class 10 - B', start_time: '13:00', end_time: '14:00', icon: '🔬' },
    ];
  }, [todayPeriods]);

  if ((ttLoading || classesLoading) && !classes && !todayTT) {
    return <LoadingScreen message="Loading Dashboard…" />;
  }

  // ─── Layout ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Header ── */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search students, classes, subjects or anything..."
            placeholderTextColor={C.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.topIconBtn}>
            <Text style={styles.topIconText}>☀️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={() => router.push('/teacher/notifications' as any)}
          >
            <Text style={styles.topIconText}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push('/teacher/profile' as any)}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.avatarName}>{firstName}</Text>
              <Text style={styles.avatarRole}>Teacher</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {IS_WEB ? (
          /* ── Web: two-column layout ── */
          <View style={styles.webLayout}>
            {/* ─── LEFT MAIN COLUMN ─── */}
            <View style={styles.mainCol}>
              {/* ① Welcome Banner */}
              <View style={styles.welcomeBanner}>
                <View style={styles.bannerLeft}>
                  <Text style={styles.bannerGreeting}>Good {greeting()}, {firstName}! 👋</Text>
                  <Text style={styles.bannerSub}>Let&apos;s make today a great learning day.</Text>
                </View>
                <View style={styles.bannerRight}>
                  <Text style={styles.bannerDate}>{todayStr}</Text>
                  <Text style={styles.bannerQuote} numberOfLines={3}>{quote}</Text>
                  <Text style={styles.bannerEmoji}>📚</Text>
                </View>
                {/* Decorative blobs */}
                <View style={[styles.blob, styles.blob1]} />
                <View style={[styles.blob, styles.blob2]} />
              </View>

              {/* ② Stat Cards */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={styles.statsRow}>
                  <StatCard
                    icon="📚" label="Today's Classes" value={todayPeriods.length}
                    bg={C.purpleLight} color={C.purple} sub="0%"
                    onPress={() => router.push('/teacher/timetable' as any)}
                  />
                  <StatCard
                    icon="🎓" label="Total Students" value={totalStudents}
                    bg={C.indigoLight} color={C.indigo} sub="+1"
                    onPress={() => router.push('/teacher/students' as any)}
                  />
                  <StatCard
                    icon="%" label="Avg Attendance" value={avgAttendance}
                    bg={C.amberLight} color={C.amber} sub="+2.5%"
                    onPress={() => router.push('/teacher/attendance' as any)}
                  />
                  <StatCard
                    icon="🏫" label="My Classes" value={(classes ?? []).length}
                    bg={C.greenLight} color={C.green}
                    onPress={() => router.push('/teacher/classes' as any)}
                  />
                  <StatCard
                    icon="🔔" label="Notifications" value={unreadCount}
                    bg={C.blueLight} color={C.blue}
                    onPress={() => router.push('/teacher/notifications' as any)}
                  />
                </View>
              </ScrollView>

              {/* ③ Today's Schedule */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionIcon}>📅</Text>
                    <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/teacher/timetable' as any)} style={styles.seeAllBtn}>
                    <Text style={styles.seeAll}>See All →</Text>
                  </TouchableOpacity>
                </View>

                {todayPeriods.length === 0 ? (
                  <View style={styles.emptyNote}>
                    <Text style={styles.emptyNoteText}>No classes scheduled for today!</Text>
                  </View>
                ) : (
                  todayPeriods.map((p: any, i: number) => {
                    const subName = p.subject_name ?? 'Subject';
                    const clsName = p.class_name ?? '—';
                    const col = subjectColor(subName);
                    return (
                      <View key={p.id ?? i} style={styles.scheduleRow}>
                        <View style={[styles.scheduleTimePill, { backgroundColor: col.bg }]}>
                          <Text style={[styles.scheduleTimeText, { color: col.text }]}>
                            {formatTime(p.start_time)} – {formatTime(p.end_time)}
                          </Text>
                        </View>
                        <View style={styles.scheduleSubjectIcon}>
                          <Text style={{ fontSize: 16 }}>📐</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.scheduleSubject}>{subName}</Text>
                          <Text style={styles.scheduleMeta}>
                            {clsName} · {p.room_number ? `Room ${p.room_number}` : 'Room —'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.startClassBtn}
                          onPress={() => router.push('/teacher/attendance' as any)}
                        >
                          <Text style={styles.startClassBtnText}>▷ Start Class</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.moreBtn}>
                          <Text style={styles.moreBtnText}>⋮</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>

              {/* ④ Attendance + Performance (side by side) */}
              <View style={styles.twoColRow}>
                {/* Class Attendance */}
                <View style={[styles.sectionCard, { flex: 1 }]}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.sectionIcon}>👥</Text>
                      <Text style={styles.sectionTitle}>Class Attendance</Text>
                    </View>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => router.push('/teacher/attendance' as any)}>
                      <Text style={styles.dropdownText}>
                        {(classes as any[])?.[0]?.name ?? 'Class 10 - A'} ▾
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DonutAttendance
                    present={attSummary.present}
                    absent={attSummary.absent}
                    total={attSummary.total}
                  />
                </View>

                {/* Student Performance */}
                <View style={[styles.sectionCard, { flex: 1 }]}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.sectionIcon}>📊</Text>
                      <Text style={styles.sectionTitle}>Student Performance</Text>
                    </View>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => router.push('/teacher/marks' as any)}>
                      <Text style={styles.dropdownText}>
                        {(classes as any[])?.[0]?.name ?? 'Class 10 - A'} ▾
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <SimpleBarChart data={perfData} />
                </View>
              </View>

              {/* ⑤ Quick Actions */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionIcon}>⚡</Text>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                  </View>
                </View>
                <View style={styles.qaGrid}>
                  <QuickAction icon="📊" label="Mark Attendance"  bg={C.green}   route="/teacher/attendance"  router={router} />
                  <QuickAction icon="🏆" label="Enter Marks"      bg={C.orange}  route="/teacher/marks"       router={router} />
                  <QuickAction icon="📋" label="Create Assignment" bg={C.blue}  route="/teacher/assignments" router={router} />
                  <QuickAction icon="💬" label="Send Message"     bg={C.purple}  route="/teacher/chat"        router={router} />
                  <QuickAction icon="📤" label="Upload Material"  bg={C.indigo}  route="/teacher/classes"     router={router} />
                </View>
              </View>
            </View>

            {/* ─── RIGHT COLUMN ─── */}
            <View style={styles.rightCol}>
              {/* Mini Calendar */}
              <View style={[styles.sectionCard, { padding: 0, overflow: 'hidden' }]}>
                <MiniCalendar />
              </View>

              {/* Announcements */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionIcon}>📢</Text>
                    <Text style={styles.sectionTitle}>Announcements</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/teacher/notifications' as any)}>
                    <Text style={styles.seeAll}>View All →</Text>
                  </TouchableOpacity>
                </View>
                {announcements.map((a: any, i: number) => (
                  <View key={a.id} style={[styles.announcementRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 10 }]}>
                    <View style={[styles.annDot, { backgroundColor: a.dot }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.annTitle}>{a.title}</Text>
                      <Text style={styles.annBody} numberOfLines={2}>{a.body}</Text>
                    </View>
                    <Text style={styles.annTime}>{a.time}</Text>
                  </View>
                ))}
              </View>

              {/* Upcoming Classes */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionIcon}>📅</Text>
                    <Text style={styles.sectionTitle}>Upcoming Classes</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/teacher/timetable' as any)}>
                    <Text style={styles.seeAll}>View All →</Text>
                  </TouchableOpacity>
                </View>
                {upcomingClasses.map((cls: any, i: number) => {
                  const subName = cls.subject_name ?? 'Subject';
                  const col = subjectColor(subName);
                  return (
                    <TouchableOpacity
                      key={cls.id ?? i}
                      style={[styles.upcomingRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 10 }]}
                      onPress={() => router.push('/teacher/timetable' as any)}
                    >
                      <View style={[styles.upcomingIcon, { backgroundColor: col.bg }]}>
                        <Text style={{ fontSize: 14 }}>📐</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.upcomingSubject}>{subName}</Text>
                        <Text style={styles.upcomingMeta}>{cls.class_name}</Text>
                      </View>
                      <Text style={[styles.upcomingTime, { color: col.text }]}>
                        {formatTime(cls.start_time ?? '08:30')} ›
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          /* ── Mobile: single column ── */
          <View style={styles.mobileLayout}>
            {/* Welcome Banner */}
            <View style={styles.welcomeBanner}>
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerGreeting}>Good {greeting()}, {firstName}! 👋</Text>
                <Text style={styles.bannerSub}>Let&apos;s make today a great learning day.</Text>
              </View>
              <View style={[styles.blob, styles.blob1]} />
              <View style={[styles.blob, styles.blob2]} />
            </View>

            {/* Stat Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.statsRow}>
                <StatCard icon="📚" label="Today's Classes" value={todayPeriods.length} bg={C.purpleLight} color={C.purple} />
                <StatCard icon="🎓" label="Total Students"  value={totalStudents}        bg={C.indigoLight} color={C.indigo} />
                <StatCard icon="%" label="Avg Attendance"   value={avgAttendance}        bg={C.amberLight}  color={C.amber}  />
                <StatCard icon="🏫" label="My Classes"      value={(classes ?? []).length} bg={C.greenLight} color={C.green} />
                <StatCard icon="🔔" label="Notifications"   value={unreadCount}          bg={C.blueLight}   color={C.blue}   />
              </View>
            </ScrollView>

            {/* Schedule */}
            <View style={[styles.sectionCard, { marginHorizontal: 16 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📅 Today&apos;s Schedule</Text>
                <TouchableOpacity onPress={() => router.push('/teacher/timetable' as any)}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              {todayPeriods.length === 0 ? (
                <View style={styles.emptyNote}>
                  <Text style={styles.emptyNoteText}>No classes today!</Text>
                </View>
              ) : (
                todayPeriods.slice(0, 3).map((p: any, i: number) => {
                  const col = subjectColor(p.subject_name ?? 'Subject');
                  return (
                    <View key={p.id ?? i} style={[styles.scheduleRow, { marginBottom: 8 }]}>
                      <View style={[styles.scheduleTimePill, { backgroundColor: col.bg }]}>
                        <Text style={[styles.scheduleTimeText, { color: col.text, fontSize: 10 }]}>
                          {formatTime(p.start_time)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.scheduleSubject}>{p.subject_name ?? 'Subject'}</Text>
                        <Text style={styles.scheduleMeta}>{p.class_name}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Quick Actions */}
            <View style={[styles.sectionCard, { marginHorizontal: 16, marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <View style={styles.qaGrid}>
                <QuickAction icon="📊" label="Mark Attendance"  bg={C.green}  route="/teacher/attendance"  router={router} />
                <QuickAction icon="🏆" label="Enter Marks"      bg={C.orange} route="/teacher/marks"       router={router} />
                <QuickAction icon="📋" label="Create Assignment" bg={C.blue}  route="/teacher/assignments" router={router} />
                <QuickAction icon="💬" label="Send Message"     bg={C.purple} route="/teacher/chat"        router={router} />
              </View>
            </View>

            {/* Notifications */}
            {unreadCount > 0 && (
              <View style={[styles.sectionCard, { marginHorizontal: 16, marginTop: 16 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🔔 Notifications</Text>
                  <TouchableOpacity onPress={() => router.push('/teacher/notifications' as any)}>
                    <Text style={styles.seeAll}>View All →</Text>
                  </TouchableOpacity>
                </View>
                {(notifs ?? []).slice(0, 3).map((n: any) => (
                  <View key={n.id} style={styles.announcementRow}>
                    <View style={[styles.annDot, { backgroundColor: n.is_read ? C.textLight : C.purple }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.annTitle}>{n.title}</Text>
                      <Text style={styles.annBody} numberOfLines={1}>{n.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1 },

  // Top header
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: SIZES.lg,
    paddingVertical: 10,
    gap: SIZES.md,
    zIndex: 5,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SIZES.sm,
    gap: 6,
    maxWidth: 420,
  },
  searchIcon: { fontSize: 14, color: C.textLight },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: C.textDark,
    outlineStyle: 'none' as any,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topIconBtn: { position: 'relative', padding: 6 },
  topIconText: { fontSize: 18 },
  notifBadge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: C.red, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  avatarBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, cursor: 'pointer' as any },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  avatarName: { fontSize: 13, fontWeight: '700', color: C.textDark },
  avatarRole: { fontSize: 10, color: C.textSub },

  // Layout
  webLayout: { flexDirection: 'row', padding: SIZES.lg, gap: SIZES.lg, alignItems: 'flex-start' },
  mainCol: { flex: 1, gap: SIZES.md },
  rightCol: { width: 280, gap: SIZES.md },
  mobileLayout: { padding: 0 },

  // Welcome Banner
  welcomeBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bannerStart,
    minHeight: 110,
    position: 'relative',
    marginBottom: 4,
    // gradient fallback
    ...(IS_WEB ? {
      background: `linear-gradient(135deg, ${C.bannerStart} 0%, ${C.bannerEnd} 100%)`,
    } as any : {}),
    ...SHADOWS.medium,
  },
  bannerLeft: { flex: 1 },
  bannerGreeting: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  bannerRight: { maxWidth: 200, alignItems: 'flex-end' },
  bannerDate: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: 4 },
  bannerQuote: { fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'right', fontStyle: 'italic', marginBottom: 4 },
  bannerEmoji: { fontSize: 36 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  blob1: { width: 120, height: 120, backgroundColor: '#FFF', top: -30, right: 80 },
  blob2: { width: 80, height: 80, backgroundColor: '#FFF', bottom: -20, right: 200 },

  // Stat cards
  statsRow: { flexDirection: 'row', gap: SIZES.sm, paddingHorizontal: IS_WEB ? 0 : SIZES.lg },

  // Section card
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.textDark },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { fontSize: 12, fontWeight: '700', color: C.purple },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  dropdownText: { fontSize: 11, fontWeight: '600', color: C.textSub },

  // Schedule rows
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  scheduleTimePill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  scheduleTimeText: { fontSize: 12, fontWeight: '700' },
  scheduleSubjectIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.indigoLight,
    alignItems: 'center', justifyContent: 'center',
  },
  scheduleSubject: { fontSize: 13, fontWeight: '700', color: C.textDark },
  scheduleMeta: { fontSize: 11, color: C.textSub, marginTop: 1 },
  startClassBtn: {
    backgroundColor: C.purple + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.purple + '40',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  startClassBtnText: { fontSize: 11, fontWeight: '700', color: C.purple },
  moreBtn: { padding: 4 },
  moreBtnText: { fontSize: 18, color: C.textSub },

  emptyNote: {
    paddingVertical: SIZES.lg,
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 10,
  },
  emptyNoteText: { fontSize: 13, color: C.textSub },

  // Two column row
  twoColRow: { flexDirection: 'row', gap: SIZES.md },

  // Quick Actions
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginTop: SIZES.sm,
  },

  // Announcements
  announcementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  annDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  annTitle: { fontSize: 12, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  annBody: { fontSize: 11, color: C.textSub },
  annTime: { fontSize: 10, color: C.textLight },

  // Upcoming classes
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  upcomingIcon: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  upcomingSubject: { fontSize: 12, fontWeight: '700', color: C.textDark },
  upcomingMeta: { fontSize: 10, color: C.textSub, marginTop: 1 },
  upcomingTime: { fontSize: 12, fontWeight: '700' },
});

// ─── Stat Card styles ──────────────────────────────────────────────────────
const sc = StyleSheet.create({
  card: {
    width: 130, backgroundColor: C.card, borderRadius: 14,
    padding: SIZES.md, borderTopWidth: 3,
    borderWidth: 1, borderColor: C.border,
    ...SHADOWS.small, gap: 4, position: 'relative',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  icon: { fontSize: 20 },
  value: { fontSize: 22, fontWeight: '800', color: C.textDark },
  label: { fontSize: 11, fontWeight: '600', color: C.textSub },
  sub: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  chevron: { position: 'absolute', right: 10, top: 10, fontSize: 16 },
});

// ─── Bar Chart styles ────────────────────────────────────────────────────────
const chart = StyleSheet.create({
  container: { flexDirection: 'row', height: 140, marginTop: 4 },
  yAxis: { width: 28, justifyContent: 'space-between', paddingVertical: 2, alignItems: 'flex-end', paddingRight: 4 },
  yLabel: { fontSize: 9, color: C.textLight },
  barsArea: { flex: 1, position: 'relative' },
  gridLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, justifyContent: 'space-between' },
  gridLine: { height: 1, backgroundColor: C.border },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: '100%', paddingBottom: 20 },
  barCol: { flex: 1, alignItems: 'center', gap: 2 },
  barValue: { fontSize: 10, fontWeight: '700', color: C.textSub },
  barWrapper: { width: '60%', flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 4, width: '100%' },
  barLabel: { fontSize: 9, color: C.textSub, textAlign: 'center' },
});

// ─── Donut styles ────────────────────────────────────────────────────────────
const donut = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, paddingTop: 4 },
  svgWrap: { alignItems: 'center', justifyContent: 'center' },
  fallback: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 14, borderColor: C.green,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.greenLight,
  },
  pct: { fontSize: 20, fontWeight: '800', color: C.textDark },
  pctSub: { fontSize: 10, color: C.textSub },
  legend: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: C.textSub, flex: 1 },
  legendVal: { fontSize: 13, fontWeight: '700', color: C.textDark },
});

// ─── Quick Action styles ─────────────────────────────────────────────────────
const qa = StyleSheet.create({
  btn: {
    borderRadius: 12,
    padding: SIZES.md,
    alignItems: 'center',
    gap: 8,
    width: IS_WEB ? 105 : '45%',
    minWidth: 90,
    flexGrow: IS_WEB ? 0 : 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  label: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
});

// ─── Calendar styles ─────────────────────────────────────────────────────────
const cal = StyleSheet.create({
  container: { padding: SIZES.md },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  arrow: { padding: 4 },
  arrowText: { fontSize: 18, color: C.textSub, fontWeight: '700' },
  monthName: { fontSize: 14, fontWeight: '700', color: C.textDark },
  dayLabels: { flexDirection: 'row', marginBottom: 4 },
  dayLabelCell: { flex: 1, alignItems: 'center' },
  dayLabelText: { fontSize: 10, color: C.textLight, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  todayCircle: { backgroundColor: C.purple },
  dayText: { fontSize: 12, color: C.textMid },
  todayText: { color: '#FFF', fontWeight: '700' },
});
