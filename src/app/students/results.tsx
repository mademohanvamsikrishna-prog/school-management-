/**
 * Results — redesigned Academic Results dashboard.
 * Data: GET /marks/exams  +  GET /marks/student/{id}
 * Auth: inherited from _layout.tsx (AuthGuard)
 *
 * Only this file was modified in the redesign.
 */
import React, { useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { getExams, getStudentMarks, type Exam, type MarkRecord } from '../../services/marks';

const IS_WEB = Platform.OS === 'web';

// ─── Grade helpers ─────────────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  switch (grade?.toUpperCase()) {
    case 'A+': return '#4F46E5';
    case 'A':  return '#10B981';
    case 'B+': return '#3B82F6';
    case 'B':  return '#F59E0B';
    case 'C+': case 'C': return '#F97316';
    default:   return '#EF4444';
  }
}

function gradeBg(grade: string): string {
  switch (grade?.toUpperCase()) {
    case 'A+': return '#EEF2FF';
    case 'A':  return '#ECFDF5';
    case 'B+': return '#EFF6FF';
    case 'B':  return '#FFFBEB';
    case 'C+': case 'C': return '#FFF7ED';
    default:   return '#FEF2F2';
  }
}

// Subject emoji icons — deterministic by index
const SUBJECT_ICONS = ['🌐', '🔬', '⚗️', '📖', '💻', '🌍', '📐', '🎨', '🏛️', '🎵'];

function subjectIcon(idx: number): string {
  return SUBJECT_ICONS[idx % SUBJECT_ICONS.length];
}

function pctColor(p: number): string {
  if (p >= 85) return '#4F46E5';
  if (p >= 70) return '#10B981';
  if (p >= 55) return '#F59E0B';
  return '#EF4444';
}

function fmtDate(s: string | undefined): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return s; }
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function ResultsScreen() {
  const { user } = useAuth();
  const { data: exams, loading: eLoading, error: eError, refetch } = useApi(getExams);
  const { data: marks, loading: mLoading } = useApi(
    async () => (user ? getStudentMarks(user.id) : []),
    [user],
  );

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const loading = eLoading || mLoading;

  const completedExams = useMemo(() => (exams ?? []).filter(e => e.status === 'completed'), [exams]);

  // Marks for the selected exam chip (null = all)
  const examMarks = useMemo(() => {
    if (!marks) return [];
    if (!selectedExamId) return marks;
    const examName = exams?.find(e => e.id === selectedExamId)?.name;
    return marks.filter(m => m.exam_name === examName);
  }, [marks, selectedExamId, exams]);

  // Summary
  const overall = useMemo(() => {
    if (!examMarks || examMarks.length === 0) return null;
    const scored = examMarks.reduce((s, m) => s + (m.marks_obtained ?? 0), 0);
    const total  = examMarks.reduce((s, m) => s + (m.max_marks ?? 100), 0);
    const pct    = total > 0 ? Math.round((scored / total) * 100) : 0;
    return { scored, total, pct, count: examMarks.length };
  }, [examMarks]);

  // Grade distribution
  const gradeDist = useMemo(() => {
    const map: Record<string, number> = {};
    examMarks.forEach(m => {
      const g = (m.grade ?? 'N/A').toUpperCase();
      map[g] = (map[g] ?? 0) + 1;
    });
    const total = examMarks.length;
    return Object.entries(map)
      .sort((a, b) => {
        const order = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      })
      .map(([grade, count]) => ({
        grade,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }, [examMarks]);

  if (loading) return <LoadingScreen message="Loading academic results..." />;
  if (eError)  return <ErrorScreen error={eError} onRetry={refetch} />;

  const noData = examMarks.length === 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* ══ 1. HEADER ════════════════════════════════════════════════════ */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.iconBox}>
              <Text style={s.iconText}>📊</Text>
            </View>
            <View>
              <Text style={s.pageTitle}>Academic Results</Text>
              <Text style={s.pageSub}>View your exam results, performance and progress.</Text>
            </View>
          </View>
        </View>

        {/* ══ 2. EXAM FILTER CHIPS ═════════════════════════════════════════ */}
        {completedExams.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
            <View style={s.chipRow}>
              <TouchableOpacity
                style={[s.chip, !selectedExamId && s.chipActive]}
                onPress={() => setSelectedExamId(null)}
              >
                <Text style={[s.chipText, !selectedExamId && s.chipTextActive]}>All Exams</Text>
              </TouchableOpacity>
              {completedExams.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[s.chip, selectedExamId === e.id && s.chipActive]}
                  onPress={() => setSelectedExamId(e.id)}
                >
                  <Text style={[s.chipText, selectedExamId === e.id && s.chipTextActive]}>
                    {e.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ══ 3. SUMMARY STAT CARDS ════════════════════════════════════════ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsScroll}>
          <View style={s.statsRow}>
            {/* Overall % */}
            <View style={s.statCard}>
              <View style={[s.statIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Text style={s.statIcon}>📈</Text>
              </View>
              <Text style={s.statLabel}>Overall Percentage</Text>
              <Text style={[s.statValue, { color: '#4F46E5' }]}>
                {overall ? `${overall.pct}%` : '—'}
              </Text>
              <Text style={s.statSub}>
                {overall ? `${overall.scored} / ${overall.total} marks` : 'No data yet'}
              </Text>
            </View>

            {/* Total Marks */}
            <View style={s.statCard}>
              <View style={[s.statIconBox, { backgroundColor: '#FDF4FF' }]}>
                <Text style={s.statIcon}>⭐</Text>
              </View>
              <Text style={s.statLabel}>Total Marks</Text>
              <Text style={[s.statValue, { color: '#A855F7' }]}>
                {overall ? `${overall.scored} / ${overall.total}` : '—'}
              </Text>
              <Text style={s.statSub}>
                Across {overall ? overall.count : 0} subject{overall?.count !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Best Subject */}
            <View style={s.statCard}>
              <View style={[s.statIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Text style={s.statIcon}>🏆</Text>
              </View>
              <Text style={s.statLabel}>Best Subject</Text>
              {(() => {
                if (!examMarks.length) return (
                  <>
                    <Text style={[s.statValue, { color: '#F97316' }]}>—</Text>
                    <Text style={s.statSub}>No data yet</Text>
                  </>
                );
                const best = [...examMarks].sort((a, b) => {
                  const pa = a.max_marks ? (a.marks_obtained / a.max_marks) : 0;
                  const pb = b.max_marks ? (b.marks_obtained / b.max_marks) : 0;
                  return pb - pa;
                })[0];
                const bp = best.max_marks ? Math.round((best.marks_obtained / best.max_marks) * 100) : 0;
                return (
                  <>
                    <Text style={[s.statValue, { color: '#F97316', fontSize: 16 }]} numberOfLines={1}>
                      {best.subject_name ?? 'Subject'}
                    </Text>
                    <Text style={s.statSub}>{bp}% • Grade {best.grade}</Text>
                  </>
                );
              })()}
            </View>

            {/* Grade Count */}
            <View style={s.statCard}>
              <View style={[s.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={s.statIcon}>🎓</Text>
              </View>
              <Text style={s.statLabel}>Top Grades</Text>
              <Text style={[s.statValue, { color: '#10B981' }]}>
                {examMarks.filter(m => ['A+', 'A'].includes((m.grade ?? '').toUpperCase())).length}
              </Text>
              <Text style={s.statSub}>A / A+ grades earned</Text>
            </View>
          </View>
        </ScrollView>

        {/* ══ 4. SUBJECT-WISE + PERFORMANCE OVERVIEW ══════════════════════ */}
        {noData ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>📊</Text>
            <Text style={s.emptyTitle}>No results yet</Text>
            <Text style={s.emptySub}>Results will appear after exams are evaluated.</Text>
          </View>
        ) : (
          <View style={[s.twoCol, IS_WEB && s.twoColWeb]}>

            {/* Subject-wise Results */}
            <View style={[s.sectionCard, IS_WEB && s.subjectCardWeb]}>
              <SectionHeader icon="📋" title="Subject-wise Results" sub="Detailed marks per subject" />

              {/* Table head */}
              <View style={s.tableHead}>
                <Text style={[s.thCell, s.tcSubject]}>Subject</Text>
                <Text style={[s.thCell, s.tcMax]}>Max</Text>
                <Text style={[s.thCell, s.tcObtained]}>Obtained</Text>
                <Text style={[s.thCell, s.tcPct]}>%</Text>
                <Text style={[s.thCell, s.tcGrade]}>Grade</Text>
              </View>

              {examMarks.map((mark, idx) => {
                const p  = mark.max_marks ? Math.round((mark.marks_obtained / mark.max_marks) * 100) : 0;
                const gc = gradeColor(mark.grade);
                const gb = gradeBg(mark.grade);
                return (
                  <View key={mark.id} style={[s.tableRow, idx % 2 === 1 && s.tableRowAlt]}>
                    <View style={[s.tcSubject, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                      <View style={[s.subjectIconBox, { backgroundColor: gb }]}>
                        <Text style={{ fontSize: 14 }}>{subjectIcon(idx)}</Text>
                      </View>
                      <Text style={s.subjectName} numberOfLines={1}>
                        {mark.subject_name ?? 'Subject'}
                      </Text>
                    </View>
                    <Text style={[s.tdCell, s.tcMax]}>{mark.max_marks ?? '—'}</Text>
                    <Text style={[s.tdCell, s.tcObtained]}>{mark.marks_obtained}</Text>
                    <Text style={[s.tdCell, s.tcPct, { color: pctColor(p), fontWeight: '700' }]}>{p}%</Text>
                    <View style={s.tcGrade}>
                      <View style={[s.gradeBadge, { backgroundColor: gb }]}>
                        <Text style={[s.gradeText, { color: gc }]}>{mark.grade ?? '—'}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Right column: Performance Overview + Grade Distribution */}
            <View style={[s.rightCol, IS_WEB && s.rightColWeb]}>

              {/* Performance Overview */}
              <View style={s.sectionCard}>
                <SectionHeader icon="📉" title="Performance Overview" sub="Subject-wise score breakdown" />
                <PerformanceChart marks={examMarks} />
              </View>

              {/* Grade Distribution */}
              <View style={s.sectionCard}>
                <SectionHeader icon="🥇" title="Grade Distribution" sub="Grades across subjects" />
                <GradeDistribution dist={gradeDist} total={examMarks.length} />
              </View>

            </View>
          </View>
        )}

        {/* ══ 5. RECENT EXAMINATIONS ══════════════════════════════════════ */}
        <View style={s.sectionCard}>
          <SectionHeader icon="📅" title="Recent Examinations" sub="Your latest exam records" />

          {completedExams.length === 0 ? (
            <View style={s.transEmpty}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptySub}>No examinations completed yet.</Text>
            </View>
          ) : IS_WEB ? (
            <>
              <View style={s.transHead}>
                <Text style={[s.transThCell, s.teExam]}>Exam Name</Text>
                <Text style={[s.transThCell, s.teTerm]}>Term</Text>
                <Text style={[s.transThCell, s.teDate]}>Date</Text>
                <Text style={[s.transThCell, s.tePct]}>Percentage</Text>
                <Text style={[s.transThCell, s.teStatus]}>Status</Text>
              </View>
              {completedExams.map((exam, idx) => {
                // Find marks for this exam
                const eMarks = (marks ?? []).filter(m => m.exam_name === exam.name);
                const eScored = eMarks.reduce((s, m) => s + (m.marks_obtained ?? 0), 0);
                const eTotal  = eMarks.reduce((s, m) => s + (m.max_marks ?? 100), 0);
                const ePct    = eTotal > 0 ? Math.round((eScored / eTotal) * 100) : 0;
                return (
                  <View key={exam.id} style={[s.transRow, idx % 2 === 1 && s.transRowAlt]}>
                    <Text style={[s.transTd, s.teExam]}>{exam.name}</Text>
                    <Text style={[s.transTd, s.teTerm]}>{exam.term ?? '—'}</Text>
                    <Text style={[s.transTd, s.teDate]}>{fmtDate(exam.end_date)}</Text>
                    <Text style={[s.transTd, s.tePct, { color: pctColor(ePct), fontWeight: '700' }]}>
                      {eMarks.length > 0 ? `${ePct}%` : '—'}
                    </Text>
                    <View style={s.teStatus}>
                      <View style={s.publishedBadge}>
                        <Text style={s.publishedText}>✓  Published</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
            completedExams.map(exam => {
              const eMarks  = (marks ?? []).filter(m => m.exam_name === exam.name);
              const eScored = eMarks.reduce((s, m) => s + (m.marks_obtained ?? 0), 0);
              const eTotal  = eMarks.reduce((s, m) => s + (m.max_marks ?? 100), 0);
              const ePct    = eTotal > 0 ? Math.round((eScored / eTotal) * 100) : 0;
              return (
                <View key={exam.id} style={s.examMobileCard}>
                  <View style={s.examMobileTop}>
                    <Text style={s.examMobileName}>{exam.name}</Text>
                    <View style={s.publishedBadge}>
                      <Text style={s.publishedText}>✓  Published</Text>
                    </View>
                  </View>
                  <View style={s.examMobileRow}>
                    <Text style={s.examMobileMeta}>{exam.term ?? 'Term'} · {fmtDate(exam.end_date)}</Text>
                    <Text style={[s.examMobilePct, { color: pctColor(ePct) }]}>
                      {eMarks.length > 0 ? `${ePct}%` : '—'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ══ 6. MOTIVATIONAL FOOTER ══════════════════════════════════════ */}
        <View style={s.footerCard}>
          <Text style={{ fontSize: 40 }}>🎓</Text>
          <View style={s.footerBody}>
            <Text style={s.footerQuote}>
              "Success is the sum of small efforts, repeated day in and day out."
            </Text>
            <Text style={s.footerSub}>Keep learning, keep growing! 🌟</Text>
          </View>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <View style={s.sectionHeaderRow}>
      <Text style={s.sectionHeaderIcon}>{icon}</Text>
      <View>
        <Text style={s.sectionHeaderTitle}>{title}</Text>
        <Text style={s.sectionHeaderSub}>{sub}</Text>
      </View>
    </View>
  );
}

// ── Performance bar chart (pure React Native, no external libs)
function PerformanceChart({ marks }: { marks: MarkRecord[] }) {
  if (!marks.length) return (
    <View style={s.chartEmpty}>
      <Text style={s.chartEmptyText}>No data to display</Text>
    </View>
  );

  const maxBar = 120; // px height of tallest bar
  return (
    <View style={s.chartWrap}>
      {marks.map((m, idx) => {
        const p  = m.max_marks ? Math.round((m.marks_obtained / m.max_marks) * 100) : 0;
        const bh = Math.max(4, Math.round((p / 100) * maxBar));
        const col = pctColor(p);
        const label = (m.subject_name ?? 'Sub').substring(0, 4);
        return (
          <View key={m.id} style={s.chartBar}>
            <Text style={[s.chartBarPct, { color: col }]}>{p}%</Text>
            <View style={s.chartBarTrack}>
              <View style={[s.chartBarFill, { height: bh, backgroundColor: col }]} />
            </View>
            <Text style={s.chartBarLabel} numberOfLines={1}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Grade distribution rows + mini donut-style ring
function GradeDistribution({ dist, total }: { dist: { grade: string; count: number; pct: number }[]; total: number }) {
  if (!dist.length) return (
    <View style={s.chartEmpty}>
      <Text style={s.chartEmptyText}>No grade data</Text>
    </View>
  );

  return (
    <View style={s.gradeDistWrap}>
      {/* Left: donut-style label */}
      <View style={s.gradeDonutWrap}>
        <View style={s.gradeDonut}>
          <Text style={s.gradeDonutNum}>{total}</Text>
          <Text style={s.gradeDonutSub}>Subjects</Text>
        </View>
      </View>

      {/* Right: legend rows */}
      <View style={s.gradeLegendWrap}>
        {dist.map(({ grade, count, pct }) => (
          <View key={grade} style={s.gradeLegendRow}>
            <View style={[s.gradeLegendDot, { backgroundColor: gradeColor(grade) }]} />
            <Text style={s.gradeLegendGrade}>{grade} ({count})</Text>
            <View style={s.gradeLegendBarTrack}>
              <View style={[s.gradeLegendBarFill, { width: `${pct}%` as any, backgroundColor: gradeColor(grade) }]} />
            </View>
            <Text style={s.gradeLegendPct}>{pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },

  // ── Header
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SIZES.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#EDE9FE', borderWidth: 1, borderColor: '#C4B5FD',
    justifyContent: 'center', alignItems: 'center',
  },
  iconText:  { fontSize: 26 },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark },
  pageSub:   { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  // ── Exam filter chips
  chipScroll: { marginBottom: SIZES.lg },
  chipRow:    { flexDirection: 'row', gap: SIZES.sm },
  chip: {
    paddingHorizontal: SIZES.md, paddingVertical: 7,
    borderRadius: SIZES.radiusRound, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  chipActive:     { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText:       { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  // ── Stat cards row
  statsScroll: { marginBottom: SIZES.lg },
  statsRow:    { flexDirection: 'row', gap: SIZES.sm },
  statCard: {
    width: IS_WEB ? 195 : 170,
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  statIconBox: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.sm,
  },
  statIcon:  { fontSize: 20 },
  statLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.3, marginBottom: 2 },
  statSub:   { ...FONTS.caption, color: COLORS.textLight },

  // ── Two-column layout
  twoCol:    { gap: SIZES.md, marginBottom: SIZES.md },
  twoColWeb: { flexDirection: 'row', alignItems: 'flex-start' },

  // ── Section card
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SIZES.md, ...SHADOWS.small, overflow: 'hidden',
  },
  subjectCardWeb: { flex: 3, marginBottom: 0 },
  rightCol:       { gap: SIZES.md },
  rightColWeb:    { flex: 2 },

  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm,
    padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sectionHeaderIcon:  { fontSize: 18, marginTop: 2 },
  sectionHeaderTitle: { ...FONTS.h4, color: COLORS.textDark },
  sectionHeaderSub:   { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },

  // ── Subject-wise table
  tableHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  thCell:     { ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '700' },
  tableRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: 10 },
  tableRowAlt:{ backgroundColor: '#FAFAFA' },

  tcSubject:  { flex: 3 },
  tcMax:      { flex: 1, textAlign: 'center' as any },
  tcObtained: { flex: 1, textAlign: 'center' as any },
  tcPct:      { flex: 1, textAlign: 'center' as any },
  tcGrade:    { flex: 1, alignItems: 'center' },

  subjectIconBox: {
    width: 30, height: 30, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  subjectName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600', flex: 1 },
  tdCell:      { ...FONTS.body2, color: COLORS.textDark, textAlign: 'center' as any },

  gradeBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: SIZES.radiusRound,
  },
  gradeText: { fontSize: 11, fontWeight: '800' },

  // ── Performance bar chart
  chartWrap: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around',
    paddingHorizontal: SIZES.md, paddingBottom: SIZES.md, paddingTop: SIZES.sm,
    minHeight: 160,
  },
  chartBar: { alignItems: 'center', flex: 1, gap: 4 },
  chartBarPct: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },
  chartBarTrack: {
    width: IS_WEB ? 28 : 22, height: 120,
    backgroundColor: '#F1F5F9', borderRadius: 6,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  chartBarFill:  { width: '100%', borderRadius: 6 },
  chartBarLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' as any },
  chartEmpty:    { padding: SIZES.lg, alignItems: 'center' },
  chartEmptyText:{ ...FONTS.body2, color: COLORS.textSecondary },

  // ── Grade distribution
  gradeDistWrap:   { flexDirection: 'row', padding: SIZES.md, gap: SIZES.md, alignItems: 'center' },
  gradeDonutWrap:  { alignItems: 'center', justifyContent: 'center' },
  gradeDonut: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#EEF2FF', borderWidth: 6, borderColor: '#C7D2FE',
    justifyContent: 'center', alignItems: 'center',
  },
  gradeDonutNum: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  gradeDonutSub: { fontSize: 9, color: COLORS.textSecondary, textAlign: 'center' as any },

  gradeLegendWrap:    { flex: 1, gap: 6 },
  gradeLegendRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradeLegendDot:     { width: 8, height: 8, borderRadius: 4 },
  gradeLegendGrade:   { fontSize: 11, fontWeight: '700', color: COLORS.textDark, width: 52 },
  gradeLegendBarTrack:{ flex: 1, height: 5, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  gradeLegendBarFill: { height: '100%', borderRadius: 3 },
  gradeLegendPct:     { fontSize: 11, color: COLORS.textSecondary, width: 34, textAlign: 'right' as any },

  // ── Recent Examinations
  transEmpty: { padding: SIZES.xl, alignItems: 'center' },
  transHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  transThCell: { ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '700' },
  transRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: 10 },
  transRowAlt: { backgroundColor: '#FAFAFA' },
  transTd:     { ...FONTS.body2, color: COLORS.textDark },

  teExam:   { flex: 3 },
  teTerm:   { flex: 1 },
  teDate:   { flex: 2 },
  tePct:    { flex: 1, textAlign: 'center' as any },
  teStatus: { flex: 1, alignItems: 'flex-end' },

  publishedBadge:{ backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusRound },
  publishedText: { fontSize: 11, fontWeight: '700', color: '#10B981' },

  examMobileCard: {
    padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  examMobileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  examMobileName:{ ...FONTS.body2, color: COLORS.textDark, fontWeight: '600', flex: 1 },
  examMobileRow: { flexDirection: 'row', justifyContent: 'space-between' },
  examMobileMeta:{ ...FONTS.caption, color: COLORS.textSecondary },
  examMobilePct: { ...FONTS.body2, fontWeight: '700' },

  // ── Motivational footer
  footerCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: '#EEF2FF', borderRadius: SIZES.radius,
    padding: SIZES.lg, borderWidth: 1, borderColor: '#C7D2FE', ...SHADOWS.small,
  },
  footerBody:  { flex: 1 },
  footerQuote: { fontSize: 14, fontWeight: '600', color: '#312E81', fontStyle: 'italic', marginBottom: 4 },
  footerSub:   { ...FONTS.caption, color: '#4F46E5' },

  // ── Empty state
  emptyCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.xl, alignItems: 'center', gap: SIZES.sm,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.md, ...SHADOWS.small,
  },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub:   { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' as any },
});
