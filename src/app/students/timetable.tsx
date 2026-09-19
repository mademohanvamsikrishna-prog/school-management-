/**
 * Timetable — redesigned weekly class timetable.
 * Data: GET /timetable/class/{class_id}  via getClassTimetable()
 * Auth: inherited from _layout.tsx (AuthGuard) — unchanged
 *
 * Only this file was modified in the redesign.
 */
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';
import { getClassTimetable, TimetableEntry } from '../../services/timetable';

const IS_WEB = Platform.OS === 'web';

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_ABR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day  = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function fmtDate(d: Date): string {
  return `${MONTH_ABR[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDateRange(s: Date, e: Date): string {
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${MONTH_ABR[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${fmtDate(s)} – ${fmtDate(e)}, ${e.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** "HH:MM" | "HH:MM:SS" → minutes since midnight */
function toMinutes(t: string): number {
  const p = t.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

/** "HH:MM" | "HH:MM:SS" → "08:30 AM" */
function fmtTime(t: string): string {
  const p  = t.split(':');
  const h  = parseInt(p[0], 10);
  const m  = p[1];
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ap}`;
}

function fmtCountdown(diffMin: number): string {
  if (diffMin <= 0) return 'Starting now';
  if (diffMin < 60) return `Starts in ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `Starts in ${h}h ${m}m` : `Starts in ${h}h`;
}

// ─── Subject colour palette (deterministic by name) ───────────────────────────

const PALETTE = [
  { bg: '#EEF2FF', accent: '#4F46E5', icon: '📘' },
  { bg: '#F0FDF4', accent: '#10B981', icon: '🔬' },
  { bg: '#FFFBEB', accent: '#F59E0B', icon: '📝' },
  { bg: '#FFF1F2', accent: '#F43F5E', icon: '📖' },
  { bg: '#F0F9FF', accent: '#0EA5E9', icon: '🌐' },
  { bg: '#FDF4FF', accent: '#A855F7', icon: '🎨' },
  { bg: '#F0FFF4', accent: '#22C55E', icon: '🔢' },
  { bg: '#FEF3C7', accent: '#D97706', icon: '🏛️' },
];

function getPalette(name?: string) {
  if (!name) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return PALETTE[h % PALETTE.length];
}

function isBreakEntry(e: TimetableEntry): boolean {
  return (e.subject_name ?? '').trim().toLowerCase() === 'break';
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TimetableScreen() {
  const { data: profile, loading: pLoading } = useApi(getMyProfile);
  const classId = profile?.student_profile?.class_id;

  // Week & day state
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(new Date());

  // Live clock tick every minute for countdown accuracy
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayDate = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const todayDayNum = useMemo(() => {
    const d = todayDate.getDay();
    return d >= 1 && d <= 6 ? d : 1;
  }, [todayDate]);

  const [selectedDay, setSelectedDay] = useState<number>(todayDayNum);

  const isCurrentWeek = weekOffset === 0;

  // Mon–Sat for the currently displayed week
  const weekDates = useMemo(() => {
    const base = addDays(getMonday(new Date()), weekOffset * 7);
    return Array.from({ length: 6 }, (_, i) => addDays(base, i));
  }, [weekOffset]);

  // Fetch timetable
  const { data: entries, loading: tLoading, error, refetch } = useApi(
    async () => {
      if (!classId) return [];
      return getClassTimetable(classId);
    },
    [classId],
  );

  const loading = pLoading || tLoading;

  // Group by day_of_week (1=Mon … 6=Sat)
  const byDay = useMemo(() => {
    const map: Record<number, TimetableEntry[]> = {};
    for (let d = 1; d <= 6; d++) map[d] = [];
    (entries ?? []).forEach(e => {
      if (e.day_of_week >= 1 && e.day_of_week <= 6) map[e.day_of_week]!.push(e);
    });
    for (let d = 1; d <= 6; d++) map[d]!.sort((a, b) => a.start_time.localeCompare(b.start_time));
    return map;
  }, [entries]);

  // All unique time-slots sorted
  const timeSlots = useMemo(() => {
    const seen = new Map<string, { start: string; end: string }>();
    (entries ?? []).forEach(e => {
      const k = `${e.start_time}|${e.end_time}`;
      if (!seen.has(k)) seen.set(k, { start: e.start_time, end: e.end_time });
    });
    return [...seen.values()].sort((a, b) => a.start.localeCompare(b.start));
  }, [entries]);

  // Stats
  const stats = useMemo(() => {
    const todayClasses   = (byDay[selectedDay] ?? []).filter(e => !isBreakEntry(e)).length;
    let weeklyClasses = 0;
    let freePeriods   = 0;
    for (let d = 1; d <= 6; d++) {
      weeklyClasses += (byDay[d] ?? []).filter(e => !isBreakEntry(e)).length;
    }
    if (timeSlots.length > 0) {
      for (let d = 1; d <= 6; d++) {
        const dayArr = byDay[d] ?? [];
        for (const slot of timeSlots) {
          const has = dayArr.some(e => e.start_time === slot.start && e.end_time === slot.end);
          if (!has) freePeriods++;
        }
      }
    }
    return { todayClasses, weeklyClasses, freePeriods };
  }, [byDay, selectedDay, timeSlots]);

  // Next class (only meaningful for current week)
  const nextClass = useMemo(() => {
    if (!isCurrentWeek) return null;
    const nowMin  = now.getHours() * 60 + now.getMinutes();
    const dayArr  = (byDay[todayDayNum] ?? []).filter(e => !isBreakEntry(e));
    for (const e of dayArr) {
      const endMin   = toMinutes(e.end_time);
      const startMin = toMinutes(e.start_time);
      if (endMin > nowMin) return { entry: e, startMin, endMin, inProgress: startMin <= nowMin };
    }
    return null;
  }, [byDay, now, isCurrentWeek, todayDayNum]);

  // ── Early returns ──────────────────────────────────────────────────────
  if (loading) return <LoadingScreen message="Loading timetable..." />;
  if (error)   return <ErrorScreen error={error} onRetry={refetch} />;

  if (!classId) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.emptyCenter}>
          <Text style={s.emptyIcon}>🗓️</Text>
          <Text style={s.emptyTitle}>No class assigned</Text>
          <Text style={s.emptySub}>Your class information is not available yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const className  = profile?.student_profile?.class_name ?? '';
  const section    = profile?.student_profile?.section ?? '';
  const weekStart  = weekDates[0];
  const weekEnd    = weekDates[5];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* ══ 1. HEADER ════════════════════════════════════════════════════ */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.calIconBox}>
              <Text style={s.calIconText}>🗓️</Text>
            </View>
            <View>
              <Text style={s.pageTitle}>Weekly Timetable</Text>
              <Text style={s.pageSub}>
                {className
                  ? `${className}${section ? ` · ${section}` : ''}  ·  Today's schedule`
                  : "Today's schedule"}
              </Text>
            </View>
          </View>

          <View style={s.weekNav}>
            <TouchableOpacity
              style={s.navBtn}
              onPress={() => setWeekOffset(o => o - 1)}
              accessibilityLabel="Previous week"
            >
              <Text style={s.navBtnText}>‹</Text>
            </TouchableOpacity>

            <View style={s.dateRangeBox}>
              <Text style={s.dateRangeIcon}>📅</Text>
              <Text style={s.dateRangeText}>{fmtDateRange(weekStart, weekEnd)}</Text>
            </View>

            <TouchableOpacity
              style={s.navBtn}
              onPress={() => setWeekOffset(o => o + 1)}
              accessibilityLabel="Next week"
            >
              <Text style={s.navBtnText}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.todayBtn}
              onPress={() => { setWeekOffset(0); setSelectedDay(todayDayNum); }}
              accessibilityLabel="Return to current week"
            >
              <Text style={s.todayBtnText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ 2. STAT CARDS ════════════════════════════════════════════════ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.statsRow}>
            <StatCard
              icon="📚" iconBg="#DCFCE7"
              label="Today's Classes"
              value={String(stats.todayClasses)}
              sub="classes today"
            />
            <StatCard
              icon="📊" iconBg="#EDE9FE"
              label="Weekly Classes"
              value={String(stats.weeklyClasses)}
              sub="total classes this week"
            />
            <StatCard
              icon="☕" iconBg="#FEF9C3"
              label="Free Periods"
              value={String(stats.freePeriods)}
              sub="free periods this week"
            />
            <StatCard
              icon="⏰" iconBg="#DBEAFE"
              label="Next Class"
              value={nextClass ? fmtTime(nextClass.entry.start_time) : '—'}
              sub={nextClass ? (nextClass.entry.subject_name ?? 'Class') : 'No upcoming class'}
              accent
            />
          </View>
        </ScrollView>

        {/* ══ 3. NEXT CLASS CARD ═══════════════════════════════════════════ */}
        <NextClassCard nextClass={nextClass} now={now} />

        {/* ══ 4. DAY SELECTOR ══════════════════════════════════════════════ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.daySelectorScroll}>
          <View style={s.daySelector}>
            {weekDates.map((date, idx) => {
              const dayNum     = idx + 1;
              const isToday    = isCurrentWeek && isSameDay(date, todayDate);
              const isSelected = dayNum === selectedDay;
              return (
                <TouchableOpacity
                  key={dayNum}
                  style={[
                    s.dayPill,
                    isToday    && !isSelected && s.dayPillToday,
                    isSelected && s.dayPillSelected,
                  ]}
                  onPress={() => setSelectedDay(dayNum)}
                  accessibilityLabel={`${DAY_FULL[idx]}, ${fmtDate(date)}`}
                >
                  <Text style={[s.dayPillName, isSelected && s.dayPillTextSel]}>
                    {DAY_SHORT[idx]}
                  </Text>
                  <Text style={[s.dayPillDate, isSelected && s.dayPillTextSel]}>
                    {fmtDate(date)}
                  </Text>
                  {isToday && (
                    <View style={[s.todayBadge, isSelected && s.todayBadgeSel]}>
                      <Text style={[s.todayBadgeTxt, isSelected && s.todayBadgeTxtSel]}>
                        Today
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* ══ 5. TIMETABLE GRID / MOBILE LIST ═════════════════════════════ */}
        {IS_WEB ? (
          <TimetableGrid
            byDay={byDay}
            timeSlots={timeSlots}
            weekDates={weekDates}
            selectedDay={selectedDay}
            todayDate={todayDate}
            isCurrentWeek={isCurrentWeek}
          />
        ) : (
          <MobileDayView entries={byDay[selectedDay] ?? []} />
        )}

        {/* ══ 6. MOTIVATIONAL FOOTER ═══════════════════════════════════════ */}
        <View style={s.footerCard}>
          <View style={s.footerIconBox}>
            <Text style={s.footerIconText}>🎓</Text>
          </View>
          <View style={s.footerBody}>
            <Text style={s.footerQuote}>"Discipline today creates success tomorrow."</Text>
            <Text style={s.footerSub}>Keep following your timetable and stay consistent!</Text>
          </View>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string; iconBg: string;
  label: string; value: string; sub: string;
  accent?: boolean;
}

function StatCard({ icon, iconBg, label, value, sub, accent }: StatCardProps) {
  return (
    <View style={[s.statCard, accent && s.statCardAccent]}>
      <View style={[s.statIconBox, { backgroundColor: iconBg }]}>
        <Text style={s.statIconText}>{icon}</Text>
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, accent && s.statValueAccent]}>{value}</Text>
      <Text style={s.statSub}>{sub}</Text>
    </View>
  );
}

// ─── NextClassCard ────────────────────────────────────────────────────────────

interface NextClassInfo {
  entry: TimetableEntry;
  startMin: number;
  endMin: number;
  inProgress: boolean;
}

function NextClassCard({ nextClass, now }: { nextClass: NextClassInfo | null; now: Date }) {
  if (!nextClass) {
    return (
      <View style={s.nextCard}>
        <Text style={s.nextCardTitle}>Next Class</Text>
        <View style={s.nextCardEmpty}>
          <Text style={s.nextCardEmptyIcon}>✅</Text>
          <Text style={s.nextCardEmptyText}>No more classes today. Great work!</Text>
        </View>
      </View>
    );
  }

  const { entry, startMin, inProgress } = nextClass;
  const pal     = getPalette(entry.subject_name);
  const nowMin  = now.getHours() * 60 + now.getMinutes();
  const diffMin = startMin - nowMin;
  const statusLabel = inProgress ? '🟢  In Progress' : fmtCountdown(diffMin);

  return (
    <View style={s.nextCard}>
      <Text style={s.nextCardTitle}>Next Class</Text>
      <View style={s.nextCardBody}>
        {/* Subject icon */}
        <View style={[s.nextSubjectIcon, { backgroundColor: pal.bg }]}>
          <Text style={{ fontSize: 24 }}>{pal.icon}</Text>
        </View>

        {/* Name + time */}
        <View style={s.nextSubjectInfo}>
          <Text style={[s.nextSubjectName, { color: pal.accent }]}>
            {entry.subject_name ?? 'Subject'}
          </Text>
          <Text style={s.nextSubjectTime}>
            🕐  {fmtTime(entry.start_time)}  –  {fmtTime(entry.end_time)}
          </Text>
        </View>

        {/* Teacher */}
        {entry.teacher_name ? (
          <View style={s.nextMeta}>
            <Text style={s.nextMetaIcon}>👤</Text>
            <View>
              <Text style={s.nextMetaVal}>{entry.teacher_name}</Text>
              <Text style={s.nextMetaLbl}>Teacher</Text>
            </View>
          </View>
        ) : null}

        {/* Room */}
        {entry.room_number ? (
          <View style={s.nextMeta}>
            <Text style={s.nextMetaIcon}>📍</Text>
            <View>
              <Text style={s.nextMetaVal}>Room {entry.room_number}</Text>
              <Text style={s.nextMetaLbl}>Classroom</Text>
            </View>
          </View>
        ) : null}

        {/* Status badge */}
        <View style={[s.nextStatus, inProgress ? s.nextStatusActive : s.nextStatusSoon]}>
          <Text style={[s.nextStatusTxt, inProgress && s.nextStatusTxtActive]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── TimetableGrid (Desktop) ──────────────────────────────────────────────────

interface GridProps {
  byDay: Record<number, TimetableEntry[]>;
  timeSlots: { start: string; end: string }[];
  weekDates: Date[];
  selectedDay: number;
  todayDate: Date;
  isCurrentWeek: boolean;
}

const TIME_COL_W = 110;
const DAY_COL_W  = 155;

function TimetableGrid({ byDay, timeSlots, weekDates, selectedDay, todayDate, isCurrentWeek }: GridProps) {
  if (timeSlots.length === 0) {
    return (
      <View style={s.emptyGrid}>
        <Text style={s.emptyGridIcon}>🗓️</Text>
        <Text style={s.emptyGridText}>No timetable data is available yet.</Text>
        <Text style={s.emptyGridSub}>Check back later or contact your school administrator.</Text>
      </View>
    );
  }

  return (
    <View style={s.gridCard}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ minWidth: TIME_COL_W + DAY_COL_W * 6 + 8 }}>

          {/* Header row */}
          <View style={s.gridHeaderRow}>
            <View style={[s.gridTimeCell, s.gridHeaderCell]}>
              <Text style={s.gridHeaderTimeLabel}>Time</Text>
            </View>
            {weekDates.map((date, idx) => {
              const dayNum     = idx + 1;
              const isToday    = isCurrentWeek && isSameDay(date, todayDate);
              const isSelected = dayNum === selectedDay;
              return (
                <View
                  key={dayNum}
                  style={[
                    s.gridDayCell,
                    s.gridHeaderCell,
                    isToday    && !isSelected && s.gridHeaderToday,
                    isSelected && s.gridHeaderSelected,
                  ]}
                >
                  <Text style={[s.gridHeaderDayName, (isSelected || isToday) && s.gridHeaderDayNameActive]}>
                    {DAY_SHORT[idx]}
                  </Text>
                  <Text style={[s.gridHeaderDayDate, (isSelected || isToday) && s.gridHeaderDayNameActive]}>
                    {fmtDate(date)}
                  </Text>
                  {isToday && (
                    <View style={s.gridTodayTag}>
                      <Text style={s.gridTodayTagTxt}>Today</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Data rows */}
          {timeSlots.map((slot, rowIdx) => (
            <View key={`${slot.start}|${slot.end}`} style={[s.gridRow, rowIdx % 2 === 1 && s.gridRowAlt]}>
              {/* Time label */}
              <View style={s.gridTimeCell}>
                <Text style={s.gridTimeLabelMain}>{fmtTime(slot.start)}</Text>
                <Text style={s.gridTimeLabelSep}>–</Text>
                <Text style={s.gridTimeLabelSub}>{fmtTime(slot.end)}</Text>
              </View>

              {/* Day cells */}
              {weekDates.map((_, idx) => {
                const dayNum = idx + 1;
                const entry  = (byDay[dayNum] ?? []).find(
                  e => e.start_time === slot.start && e.end_time === slot.end,
                );
                const isSelected = dayNum === selectedDay;

                if (!entry) {
                  return (
                    <View key={dayNum} style={[s.gridDayCell, s.gridEmptyCell, isSelected && s.gridEmptyCellSel]}>
                      <Text style={s.gridEmptyIcon}>○</Text>
                      <Text style={s.gridEmptyText}>No classes</Text>
                    </View>
                  );
                }

                if (isBreakEntry(entry)) {
                  return (
                    <View key={dayNum} style={[s.gridDayCell, s.gridBreakCell]}>
                      <Text style={s.gridBreakIcon}>☕</Text>
                      <Text style={s.gridBreakText}>Break</Text>
                    </View>
                  );
                }

                const pal = getPalette(entry.subject_name);
                return (
                  <View
                    key={dayNum}
                    style={[
                      s.gridDayCell,
                      s.gridClassCell,
                      { backgroundColor: pal.bg, borderLeftColor: pal.accent },
                      isSelected && s.gridClassCellSel,
                    ]}
                  >
                    <View style={s.gridClassHeader}>
                      <Text style={{ fontSize: 11 }}>{pal.icon}</Text>
                      <Text style={[s.gridClassSubject, { color: pal.accent }]} numberOfLines={2}>
                        {entry.subject_name ?? 'Subject'}
                      </Text>
                    </View>
                    {entry.teacher_name ? (
                      <Text style={s.gridClassMeta} numberOfLines={1}>
                        👤 {entry.teacher_name}
                      </Text>
                    ) : null}
                    {entry.room_number ? (
                      <Text style={s.gridClassMeta} numberOfLines={1}>
                        📍 Room {entry.room_number}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── MobileDayView ────────────────────────────────────────────────────────────

function MobileDayView({ entries }: { entries: TimetableEntry[] }) {
  if (entries.length === 0) {
    return (
      <View style={s.mobileEmpty}>
        <Text style={s.mobileEmptyIcon}>📅</Text>
        <Text style={s.mobileEmptyText}>No classes scheduled for this day.</Text>
      </View>
    );
  }

  return (
    <View style={s.mobileList}>
      {entries.map(entry => {
        if (isBreakEntry(entry)) {
          return (
            <View key={entry.id} style={s.mobileBreak}>
              <Text style={s.mobileBreakIcon}>☕</Text>
              <Text style={s.mobileBreakText}>
                Break  {fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}
              </Text>
            </View>
          );
        }
        const pal = getPalette(entry.subject_name);
        return (
          <View
            key={entry.id}
            style={[s.mobilePeriodCard, { backgroundColor: pal.bg, borderLeftColor: pal.accent }]}
          >
            <View style={s.mobilePeriodHeader}>
              <Text style={{ fontSize: 20 }}>{pal.icon}</Text>
              <View style={{ flex: 1, marginLeft: SIZES.sm }}>
                <Text style={[s.mobilePeriodSubject, { color: pal.accent }]}>
                  {entry.subject_name ?? 'Subject'}
                </Text>
                <Text style={s.mobilePeriodTime}>
                  {fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}
                </Text>
              </View>
            </View>
            {entry.teacher_name ? (
              <Text style={s.mobilePeriodMeta}>👤 {entry.teacher_name}</Text>
            ) : null}
            {entry.room_number ? (
              <Text style={s.mobilePeriodMeta}>📍 Room {entry.room_number}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },

  // ── Header
  header: {
    flexDirection: IS_WEB ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: IS_WEB ? 'center' : 'flex-start',
    marginBottom: SIZES.lg,
    gap: SIZES.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  calIconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE',
    justifyContent: 'center', alignItems: 'center',
  },
  calIconText: { fontSize: 26 },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark },
  pageSub:   { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  weekNav: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    flexWrap: 'wrap',
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.small,
  },
  navBtnText: { fontSize: 20, color: COLORS.textDark, lineHeight: 24 },
  dateRangeBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.card, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SIZES.md, paddingVertical: 8,
    ...SHADOWS.small,
  },
  dateRangeIcon: { fontSize: 14 },
  dateRangeText: { ...FONTS.caption, color: COLORS.textDark, fontWeight: '600' },
  todayBtn: {
    backgroundColor: '#4F46E5', paddingHorizontal: SIZES.md,
    paddingVertical: 8, borderRadius: 10, ...SHADOWS.small,
  },
  todayBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Stat cards
  statsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.lg },
  statCard: {
    width: IS_WEB ? 200 : 160,
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  statCardAccent: { borderColor: '#C7D2FE' },
  statIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.sm },
  statIconText: { fontSize: 20 },
  statLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.5 },
  statValueAccent: { color: '#4F46E5' },
  statSub: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },

  // ── Next class card
  nextCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.md, marginBottom: SIZES.lg,
    borderWidth: 1, borderColor: '#C7D2FE', ...SHADOWS.medium,
  },
  nextCardTitle: { ...FONTS.h4, color: COLORS.textDark, marginBottom: SIZES.sm },
  nextCardEmpty: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, paddingVertical: SIZES.md },
  nextCardEmptyIcon: { fontSize: 28 },
  nextCardEmptyText: { ...FONTS.body1, color: COLORS.textSecondary },

  nextCardBody: {
    flexDirection: IS_WEB ? 'row' : 'column',
    alignItems: IS_WEB ? 'center' : 'flex-start',
    gap: SIZES.md, flexWrap: 'wrap',
  },
  nextSubjectIcon: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  nextSubjectInfo: { flex: IS_WEB ? 1 : 0 },
  nextSubjectName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  nextSubjectTime: { ...FONTS.body2, color: COLORS.textSecondary },

  nextMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextMetaIcon: { fontSize: 18 },
  nextMetaVal: { ...FONTS.body2, fontWeight: '600', color: COLORS.textDark },
  nextMetaLbl: { ...FONTS.caption, color: COLORS.textSecondary },

  nextStatus: {
    paddingHorizontal: SIZES.md, paddingVertical: 6,
    borderRadius: SIZES.radiusRound, borderWidth: 1,
  },
  nextStatusSoon: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  nextStatusActive: { backgroundColor: '#EEF2FF', borderColor: '#A5B4FC' },
  nextStatusTxt: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  nextStatusTxtActive: { color: '#4F46E5' },

  // ── Day selector
  daySelectorScroll: { marginBottom: SIZES.lg },
  daySelector: { flexDirection: 'row', gap: SIZES.sm, paddingBottom: 4 },
  dayPill: {
    alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
    minWidth: 80,
  },
  dayPillToday: { borderColor: '#A5B4FC', backgroundColor: '#EEF2FF' },
  dayPillSelected: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  dayPillName: { ...FONTS.caption, fontWeight: '700', color: COLORS.textDark },
  dayPillDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  dayPillTextSel: { color: '#fff' },
  todayBadge: {
    marginTop: 4, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, backgroundColor: '#EEF2FF',
  },
  todayBadgeSel: { backgroundColor: 'rgba(255,255,255,0.3)' },
  todayBadgeTxt: { fontSize: 9, fontWeight: '700', color: '#4F46E5' },
  todayBadgeTxtSel: { color: '#fff' },

  // ── Grid card wrapper
  gridCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SIZES.lg, overflow: 'hidden', ...SHADOWS.small,
  },

  // ── Grid header
  gridHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  gridHeaderCell: {
    padding: SIZES.sm, alignItems: 'center', justifyContent: 'center',
  },
  gridHeaderToday:    { backgroundColor: '#EEF2FF' },
  gridHeaderSelected: { backgroundColor: '#4F46E5' },
  gridHeaderTimeLabel: { ...FONTS.caption, color: COLORS.textLight, fontWeight: '700' },
  gridHeaderDayName: { ...FONTS.caption, fontWeight: '700', color: COLORS.textDark },
  gridHeaderDayDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  gridHeaderDayNameActive: { color: '#4F46E5' },

  gridTodayTag: {
    marginTop: 2, paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 3, backgroundColor: '#4F46E5',
  },
  gridTodayTagTxt: { fontSize: 8, fontWeight: '800', color: '#fff' },

  // ── Grid rows
  gridRow:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  gridRowAlt: { backgroundColor: '#FAFAFA' },

  gridTimeCell: {
    width: TIME_COL_W, padding: SIZES.sm, justifyContent: 'center', alignItems: 'center',
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  gridDayCell: { width: DAY_COL_W, padding: SIZES.sm, borderRightWidth: 1, borderRightColor: '#F1F5F9' },
  gridTimeLabelMain: { fontSize: 11, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
  gridTimeLabelSep:  { fontSize: 10, color: COLORS.textLight, textAlign: 'center' },
  gridTimeLabelSub:  { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },

  // Grid cells
  gridEmptyCell: { justifyContent: 'center', alignItems: 'center', minHeight: 72 },
  gridEmptyCellSel: { backgroundColor: '#FAFAFE' },
  gridEmptyIcon: { fontSize: 14, color: COLORS.textLight, marginBottom: 2 },
  gridEmptyText: { fontSize: 10, color: COLORS.textLight, fontStyle: 'italic' },

  gridBreakCell: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center',
    minHeight: 56, gap: 4,
  },
  gridBreakIcon: { fontSize: 14 },
  gridBreakText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },

  gridClassCell: {
    borderRadius: SIZES.radiusSm, padding: SIZES.sm,
    borderLeftWidth: 3, minHeight: 72, gap: 3, ...SHADOWS.small,
  },
  gridClassCellSel: { ...SHADOWS.medium },
  gridClassHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: 3 },
  gridClassSubject: { fontSize: 12, fontWeight: '700', flex: 1 },
  gridClassMeta: { fontSize: 10, color: COLORS.textSecondary },

  // Empty state
  emptyGrid: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.xl, alignItems: 'center', marginBottom: SIZES.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  emptyGridIcon: { fontSize: 48, marginBottom: SIZES.sm },
  emptyGridText: { ...FONTS.h4, color: COLORS.textDark, marginBottom: 4, textAlign: 'center' },
  emptyGridSub:  { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },

  // ── Mobile list
  mobileList: { gap: SIZES.sm, marginBottom: SIZES.lg },
  mobileEmpty: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.xl,
    alignItems: 'center', marginBottom: SIZES.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  mobileEmptyIcon: { fontSize: 40, marginBottom: SIZES.sm },
  mobileEmptyText: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },

  mobileBreak: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#F8FAFC', borderRadius: SIZES.radiusSm,
    padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border,
  },
  mobileBreakIcon: { fontSize: 18 },
  mobileBreakText: { ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '600' },

  mobilePeriodCard: {
    borderRadius: SIZES.radius, padding: SIZES.md,
    borderLeftWidth: 4, ...SHADOWS.small,
  },
  mobilePeriodHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  mobilePeriodSubject: { fontSize: 15, fontWeight: '700' },
  mobilePeriodTime: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  mobilePeriodMeta: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },

  // ── Footer card
  footerCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: '#EEF2FF', borderRadius: SIZES.radius,
    padding: SIZES.lg, borderWidth: 1, borderColor: '#C7D2FE', ...SHADOWS.small,
  },
  footerIconBox: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
  },
  footerIconText: { fontSize: 26 },
  footerBody: { flex: 1 },
  footerQuote: { fontSize: 15, fontWeight: '700', color: '#312E81', marginBottom: 4 },
  footerSub:   { ...FONTS.caption, color: '#4F46E5' },

  // ── Global empty / no class state
  emptyCenter: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: SIZES.sm, padding: SIZES.xl,
  },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { ...FONTS.h3, color: COLORS.textDark },
  emptySub:   { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
