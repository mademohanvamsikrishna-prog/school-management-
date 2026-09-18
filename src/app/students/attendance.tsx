/**
 * Attendance — Student attendance page (redesigned to match reference UI).
 * Data sources (unchanged):
 *   GET /attendance/student/{id}/summary  → AttendanceSummary
 *   GET /attendance/student/{id}/records  → AttendanceRecord[]
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  getAttendanceSummary,
  getAttendanceRecords,
  type AttendanceRecord,
} from '../../services/attendance';

const IS_WEB = Platform.OS === 'web';

// ─── Color palette (Attendance-only, does NOT touch global theme) ─────────────
const C = {
  bg: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  textDark: '#0F172A',
  textMid: '#334155',
  textSub: '#64748B',
  textLight: '#94A3B8',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dayName(dateStr: string): string {
  const d = new Date(dateStr);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

// ─── SVG Multi-segment Donut (web) ───────────────────────────────────────────
function MultiDonutWeb({
  present, absent, late, size = 160, stroke = 22,
}: { present: number; absent: number; late: number; size?: number; stroke?: number }) {
  const total = present + absent + late || 1;
  const pPct = present / total;
  const aPct = absent / total;
  const lPct = late / total;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const pLen = pPct * circ;
  const aLen = aPct * circ;
  const lLen = lPct * circ;
  const aRotate = pPct * 360 - 90;
  const lRotate = (pPct + aPct) * 360 - 90;
  const pct = Math.round((present / total) * 100);

  return (
    // @ts-ignore
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* @ts-ignore */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        {/* Track */}
        {/* @ts-ignore */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF2FF" strokeWidth={stroke} />
        {/* Present (green) */}
        {pLen > 0 && (
          // @ts-ignore
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.success} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ - pLen}
            strokeLinecap="butt" transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
        {/* Absent (red) */}
        {aLen > 0 && (
          // @ts-ignore
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.error} strokeWidth={stroke}
            strokeDasharray={`${aLen} ${circ - aLen}`} strokeDashoffset={0}
            strokeLinecap="butt" transform={`rotate(${aRotate} ${cx} ${cy})`}
          />
        )}
        {/* Late (amber) */}
        {lLen > 0 && (
          // @ts-ignore
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.warning} strokeWidth={stroke}
            strokeDasharray={`${lLen} ${circ - lLen}`} strokeDashoffset={0}
            strokeLinecap="butt" transform={`rotate(${lRotate} ${cx} ${cy})`}
          />
        )}
      </svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: C.textDark }}>{pct}%</Text>
        <Text style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>Attendance Rate</Text>
      </View>
    </View>
  );
}

// Native donut fallback
function MultiDonutNative({ present, absent, late, size = 130, stroke = 14 }: { present: number; absent: number; late: number; size?: number; stroke?: number }) {
  const total = present + absent + late || 1;
  const pct = Math.round((present / total) * 100);
  const inner = size - stroke * 2;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: C.success, position: 'absolute', opacity: present > 0 ? 1 : 0 }} />
      <View style={{ width: inner, height: inner, borderRadius: inner / 2, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.textDark }}>{pct}%</Text>
        <Text style={{ fontSize: 10, color: C.textSub }}>Attendance</Text>
      </View>
    </View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, badge, badgeColor, iconBg }: {
  icon: string; value: string | number; label: string;
  badge: string; badgeColor: string; iconBg: string;
}) {
  return (
    <View style={sc.card}>
      <View style={[sc.iconBox, { backgroundColor: iconBg }]}>
        <Text style={sc.icon}>{icon}</Text>
      </View>
      <View style={sc.info}>
        <Text style={sc.value}>{value}</Text>
        <Text style={sc.label}>{label}</Text>
      </View>
      <Text style={[sc.badge, { color: badgeColor }]}>{badge}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: IS_WEB ? 16 : 12, flexDirection: 'row', alignItems: 'center', gap: 10,
    ...SHADOWS.small, minWidth: IS_WEB ? 150 : 100,
  },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  info: { flex: 1 },
  value: { fontSize: IS_WEB ? 22 : 18, fontWeight: '800', color: C.textDark },
  label: { fontSize: 11, color: C.textSub, marginTop: 1 },
  badge: { fontSize: 12, fontWeight: '700' },
});

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const MAP: Record<string, { bg: string; text: string; label: string }> = {
    present:  { bg: C.successLight, text: C.success, label: '● Present' },
    absent:   { bg: C.errorLight,   text: C.error,   label: '● Absent' },
    late:     { bg: C.warningLight, text: C.warning,  label: '● Late' },
    half_day: { bg: C.warningLight, text: C.warning,  label: '● Half Day' },
  };
  const s = MAP[status] ?? { bg: '#F1F5F9', text: C.textSub, label: status };
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: s.bg, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: s.text }}>{s.label}</Text>
    </View>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function AttendanceCalendar({ records, year, month, onPrev, onNext, selectedDay, onSelectDay }: {
  records: AttendanceRecord[]; year: number; month: number;
  onPrev: () => void; onNext: () => void;
  selectedDay: number | null; onSelectDay: (d: number) => void;
}) {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const statusMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const r of records) {
      const d = new Date(r.date);
      if (d.getFullYear() === year && d.getMonth() === month) map[d.getDate()] = r.status;
    }
    return map;
  }, [records, year, month]);

  const dotColor: Record<string, string> = { present: C.success, absent: C.error, late: C.warning, half_day: C.warning };

  const cells: Array<{ day: number; type: 'prev' | 'cur' | 'next' }> = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'cur' });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDay + 1, type: 'next' });

  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <View>
      <View style={cal.header}>
        <TouchableOpacity onPress={onPrev} style={cal.navBtn}><Text style={cal.navIcon}>‹</Text></TouchableOpacity>
        <Text style={cal.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={onNext} style={cal.navBtn}><Text style={cal.navIcon}>›</Text></TouchableOpacity>
      </View>
      <View style={cal.dayRow}>
        {DAYS.map(d => <View key={d} style={cal.dayCell}><Text style={cal.dayLabel}>{d}</Text></View>)}
      </View>
      {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, row) => (
        <View key={row} style={cal.week}>
          {cells.slice(row * 7, row * 7 + 7).map((cell, col) => {
            const sel = cell.type === 'cur' && selectedDay === cell.day;
            const tod = cell.type === 'cur' && isToday(cell.day);
            const st = cell.type === 'cur' ? statusMap[cell.day] : undefined;
            return (
              <TouchableOpacity key={col} style={[cal.dateCell, sel && cal.selCell]}
                onPress={() => cell.type === 'cur' && onSelectDay(cell.day)} activeOpacity={0.7}>
                <Text style={[cal.dateText, cell.type !== 'cur' && cal.dimText, sel && cal.selText, tod && !sel && cal.todayText]}>
                  {cell.day}
                </Text>
                {st && <View style={[cal.dot, { backgroundColor: dotColor[st] ?? C.textLight }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
const cal = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 16, color: C.textMid, lineHeight: 20 },
  monthLabel: { fontSize: 14, fontWeight: '700', color: C.textDark },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: C.textSub },
  week: { flexDirection: 'row' },
  dateCell: { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: 20, marginHorizontal: 1 },
  selCell: { backgroundColor: C.primary },
  dateText: { fontSize: 12, fontWeight: '500', color: C.textDark },
  dimText: { color: C.textLight },
  selText: { color: '#FFF', fontWeight: '700' },
  todayText: { color: C.primary, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
});

// ─── Legend row ───────────────────────────────────────────────────────────────
function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 8 }} />
      <Text style={{ fontSize: 13, color: C.textMid, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

// ─── Summary row ──────────────────────────────────────────────────────────────
function SummaryRow({ color, label, count, pct }: { color: string; label: string; count: number; pct: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 10 }} />
      <Text style={{ flex: 1, fontSize: 14, color: C.textMid, fontWeight: '500' }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '800', color: C.textDark, marginRight: 16 }}>{count}</Text>
      <Text style={{ fontSize: 13, color: C.textSub, minWidth: 36, textAlign: 'right' }}>{pct}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AttendanceScreen() {
  const { user } = useAuth();

  const today = new Date();
  const [calYear, setCalYear]     = useState(today.getFullYear());
  const [calMonth, setCalMonth]   = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');

  const { data: summary, loading: sLoading, error: sError, refetch } = useApi(
    async () => (user ? getAttendanceSummary(user.id) : null),
    [user]
  );
  const { data: records, loading: rLoading } = useApi(
    async () => (user ? getAttendanceRecords(user.id, 60) : []),
    [user]
  );

  if (sLoading || rLoading) return <LoadingScreen message="Loading attendance..." />;
  if (sError) return <ErrorScreen error={sError} onRetry={refetch} />;

  const presentDays = summary?.present_days ?? 0;
  const absentDays  = summary?.absent_days  ?? 0;
  const lateDays    = summary?.late_days    ?? 0;
  const totalDays   = summary?.total_days   ?? (presentDays + absentDays + lateDays);
  const pct         = summary?.percentage   ?? (totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0);
  const isGood      = pct >= 75;

  const allRecords = records ?? [];
  const filtered = statusFilter === 'all' ? allRecords : allRecords.filter(r => r.status === statusFilter);

  const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dim = new Date(calYear, calMonth + 1, 0).getDate();
  const dateRangeLabel = `${MON[calMonth]} 1, ${calYear} - ${MON[calMonth]} ${dim}, ${calYear}`;

  const screenWidth = Dimensions.get('window').width;
  const isWide = IS_WEB && screenWidth > 900;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── PAGE HEADER ───────────────────────────────── */}
        <View style={[s.pageHeader, isWide && s.pageHeaderWide]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.titleIcon}><Text style={{ fontSize: 20 }}>📊</Text></View>
            <View>
              <Text style={s.pageTitle}>Attendance</Text>
              <Text style={s.pageSub}>Track your classes, maintain your streak and stay on top!</Text>
            </View>
          </View>
          <View style={s.semBadge}>
            <Text style={s.semText}>📅 Semester 3 (Jul – Dec 2026)</Text>
            <Text style={{ fontSize: 10, color: C.textSub }}>▾</Text>
          </View>
        </View>

        {/* ── STAT CARDS ─────────────────────────────────── */}
        <View style={[s.statsRow, isWide && s.statsRowWide]}>
          <StatCard icon="🧑‍🎓" value={presentDays} label="Present"
            badge={`↑ ${pct}%`} badgeColor={C.success} iconBg={C.successLight} />
          <StatCard icon="🙁" value={absentDays} label="Absent"
            badge={`↓ ${totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0}%`}
            badgeColor={C.error} iconBg={C.errorLight} />
          <StatCard icon="⏰" value={lateDays} label="Late"
            badge={`${totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0}%`}
            badgeColor={C.amber} iconBg={C.amberLight} />
          <StatCard icon="📚" value={totalDays} label="Total Classes"
            badge="This Semester" badgeColor={C.textSub} iconBg={C.purpleLight} />
        </View>

        {/* ── MIDDLE ROW ─────────────────────────────────── */}
        <View style={[s.midRow, isWide && s.midRowWide]}>

          {/* Overall Attendance card */}
          <View style={[s.card, isWide && { flex: 1.2, minWidth: 280 }]}>
            <Text style={s.cardTitle}>Overall Attendance</Text>
            <View style={s.donutSection}>
              {IS_WEB
                ? <MultiDonutWeb present={presentDays} absent={absentDays} late={lateDays} size={160} stroke={22} />
                : <MultiDonutNative present={presentDays} absent={absentDays} late={lateDays} />
              }
              <View style={{ flex: 1 }}>
                <View style={[s.standBadge, { backgroundColor: isGood ? C.successLight : C.errorLight }]}>
                  <Text style={[s.standText, { color: isGood ? C.success : C.error }]}>
                    {isGood ? '📊 Good Standing! 🎉' : '⚠️ Below 75%'}
                  </Text>
                </View>
                <View style={{ height: 12 }} />
                <LegendRow color={C.success} label={`Present (${presentDays})`} />
                <LegendRow color={C.error}   label={`Absent (${absentDays})`} />
                <LegendRow color={C.warning} label={`Late (${lateDays})`} />
              </View>
            </View>
          </View>

          {/* Calendar card */}
          <View style={[s.card, isWide && { flex: 1.4, minWidth: 280 }]}>
            <Text style={s.cardTitle}>Monthly View</Text>
            <View style={{ height: 12 }} />
            <AttendanceCalendar
              records={allRecords} year={calYear} month={calMonth}
              onPrev={prevMonth} onNext={nextMonth}
              selectedDay={selectedDay} onSelectDay={setSelectedDay}
            />
          </View>

          {/* Right column */}
          <View style={[isWide && { flex: 1, gap: 16 }, !isWide && { gap: 12 }]}>
            {/* Keep Going card */}
            <View style={[s.card, { backgroundColor: '#F5F3FF' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 24 }}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: C.textDark }}>Keep Going!</Text>
                  <Text style={{ fontSize: 12, color: C.textSub, marginTop: 4, lineHeight: 18 }}>
                    "Discipline today creates{'\n'}success tomorrow."
                  </Text>
                </View>
                <Text style={{ fontSize: 28 }}>⛰️</Text>
              </View>
            </View>

            {/* Summary card */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Attendance Summary</Text>
              <View style={{ height: 12 }} />
              <SummaryRow color={C.success} label="Present" count={presentDays}
                pct={`${pct}%`} />
              <View style={{ height: 1, backgroundColor: C.border }} />
              <SummaryRow color={C.error} label="Absent" count={absentDays}
                pct={`${totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0}%`} />
              <View style={{ height: 1, backgroundColor: C.border }} />
              <SummaryRow color={C.warning} label="Late" count={lateDays}
                pct={`${totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0}%`} />
            </View>
          </View>
        </View>

        {/* ── RECORDS TABLE ──────────────────────────────── */}
        <View style={s.card}>
          {/* Header */}
          <View style={[s.recHeader, isWide && s.recHeaderWide]}>
            <View>
              <Text style={s.cardTitle}>Attendance Records</Text>
              <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Your daily attendance details</Text>
            </View>
            <View style={s.recControls}>
              {/* Filter chips */}
              <View style={s.filterGroup}>
                {(['all', 'present', 'absent', 'late'] as const).map(f => (
                  <TouchableOpacity key={f}
                    style={[s.fChip, statusFilter === f && s.fChipActive]}
                    onPress={() => setStatusFilter(f)}>
                    <Text style={[s.fChipText, statusFilter === f && s.fChipTextActive]}>
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Date range */}
              <View style={s.dateRange}>
                <Text style={{ fontSize: 12, marginRight: 4 }}>📅</Text>
                <Text style={{ fontSize: 12, color: C.textDark, fontWeight: '500' }}>{dateRangeLabel}</Text>
              </View>
              {/* Export */}
              <TouchableOpacity style={s.exportBtn}>
                <Text style={s.exportText}>⬇ Export</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Table head */}
          <View style={s.tHead}>
            {['Date','Day','Status','Remarks','Action'].map((h, i) => (
              <Text key={h} style={[s.th, i === 0 && { flex: 2 }, i === 4 && { textAlign: 'right' }]}>{h}</Text>
            ))}
          </View>

          {/* Rows */}
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 14, color: C.textSub }}>📋 No records found for this filter.</Text>
            </View>
          ) : filtered.map((rec, idx) => (
            <View key={rec.id} style={[s.tRow, idx % 2 === 0 && s.tRowAlt]}>
              <Text style={[s.td, { flex: 2 }]}>{rec.date}</Text>
              <Text style={[s.td, { flex: 1, color: C.textSub }]}>{dayName(rec.date)}</Text>
              <View style={{ flex: 2 }}><StatusPill status={rec.status} /></View>
              <Text style={[s.td, { flex: 2, color: C.textSub }]}>{rec.remarks || '—'}</Text>
              <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: C.primary, fontWeight: '600' }}>📄 View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: IS_WEB ? 28 : 16, paddingBottom: 40 },

  pageHeader: { flexDirection: 'column', gap: 12, marginBottom: 20 },
  pageHeaderWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  pageTitle: { fontSize: IS_WEB ? 26 : 22, fontWeight: '800', color: C.textDark },
  pageSub: { fontSize: 13, color: C.textSub, marginTop: 2 },
  semBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, ...SHADOWS.small },
  semText: { fontSize: 13, fontWeight: '600', color: C.textDark },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statsRowWide: { flexWrap: 'nowrap' },

  midRow: { flexDirection: 'column', gap: 16, marginBottom: 20 },
  midRowWide: { flexDirection: 'row', alignItems: 'flex-start' },

  card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: IS_WEB ? 20 : 16, ...SHADOWS.small, marginBottom: IS_WEB ? 0 : 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  donutSection: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 16 },
  standBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start' },
  standText: { fontSize: 12, fontWeight: '700' },

  recHeader: { flexDirection: 'column', gap: 12, marginBottom: 16 },
  recHeaderWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recControls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },

  filterGroup: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: C.border, padding: 3, gap: 2 },
  fChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  fChipActive: { backgroundColor: C.card, ...SHADOWS.small },
  fChipText: { fontSize: 12, color: C.textSub, fontWeight: '500' },
  fChipTextActive: { color: C.textDark, fontWeight: '700' },

  dateRange: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  exportBtn: { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  exportText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  tHead: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: C.border, marginBottom: 4 },
  th: { flex: 1, fontSize: 12, fontWeight: '700', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.5 },
  tRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderColor: '#F1F5F9', gap: 4 },
  tRowAlt: { backgroundColor: '#FAFBFC' },
  td: { flex: 1, fontSize: 13, color: C.textDark, fontWeight: '500' },
});
