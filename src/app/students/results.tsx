/**
 * Results / Report Cards — per-exam, per-subject breakdown.
 * Uses GET /marks/exams and GET /marks/student/{id}.
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

function gradeColor(grade: string): string {
  switch (grade?.toUpperCase()) {
    case 'A+': case 'A': return '#10B981';
    case 'B+': case 'B': return '#3B82F6';
    case 'C+': case 'C': return '#F59E0B';
    default: return '#EF4444';
  }
}

export default function ResultsScreen() {
  const { user } = useAuth();
  const { data: exams, loading: eLoading, error: eError, refetch } = useApi(getExams);
  const { data: marks, loading: mLoading } = useApi(
    async () => (user ? getStudentMarks(user.id) : []),
    [user]
  );

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const loading = eLoading || mLoading;

  const examMarks = useMemo(() => {
    if (!marks) return [];
    if (!selectedExamId) return marks;
    return marks.filter(m => m.exam_name === exams?.find(e => e.id === selectedExamId)?.name);
  }, [marks, selectedExamId, exams]);

  const overall = useMemo(() => {
    if (!examMarks || examMarks.length === 0) return null;
    const scored = examMarks.reduce((s, m) => s + (m.marks_obtained ?? 0), 0);
    const total  = examMarks.reduce((s, m) => s + (m.max_marks ?? 100), 0);
    const pct    = total > 0 ? Math.round((scored / total) * 100) : 0;
    return { scored, total, pct };
  }, [examMarks]);

  if (loading) return <LoadingScreen message="Loading results..." />;
  if (eError) return <ErrorScreen error={eError} onRetry={refetch} />;

  const completedExams = (exams ?? []).filter(e => e.status === 'completed');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Results & Report Cards</Text>
          <Text style={styles.pageSub}>Your academic performance</Text>
        </View>

        {/* Exam selector */}
        {completedExams.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>SELECT EXAM</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examPicker}>
              <TouchableOpacity
                style={[styles.examChip, !selectedExamId && styles.examChipActive]}
                onPress={() => setSelectedExamId(null)}
              >
                <Text style={[styles.examChipText, !selectedExamId && styles.examChipTextActive]}>All Exams</Text>
              </TouchableOpacity>
              {completedExams.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.examChip, selectedExamId === e.id && styles.examChipActive]}
                  onPress={() => setSelectedExamId(e.id)}
                >
                  <Text style={[styles.examChipText, selectedExamId === e.id && styles.examChipTextActive]}>
                    {e.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Overall summary card */}
        {overall && (
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Overall Performance</Text>
            <View style={styles.summaryRow}>
              <OverallStat label="Scored"     value={String(overall.scored)} color={COLORS.primary} />
              <OverallStat label="Total"      value={String(overall.total)}  color={COLORS.textSecondary} />
              <OverallStat label="Percentage" value={`${overall.pct}%`}      color={overall.pct >= 75 ? COLORS.success : COLORS.error} />
              <OverallStat label="Subjects"   value={String(examMarks.length)} color={COLORS.info} />
            </View>
          </View>
        )}

        {/* Marks table */}
        <Text style={[styles.sectionLabel, { marginTop: SIZES.md }]}>SUBJECT-WISE MARKS</Text>

        {examMarks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No results yet</Text>
            <Text style={styles.emptySub}>Results will appear after exams are evaluated.</Text>
          </View>
        ) : (
          <>
            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { flex: 2 }]}>Subject</Text>
              <Text style={styles.thCell}>Obtained</Text>
              <Text style={styles.thCell}>Max</Text>
              <Text style={styles.thCell}>%</Text>
              <Text style={styles.thCell}>Grade</Text>
            </View>

            {examMarks.map((mark, idx) => {
              const pct = mark.max_marks ? Math.round((mark.marks_obtained / mark.max_marks) * 100) : 0;
              const gc  = gradeColor(mark.grade);
              return (
                <View key={mark.id} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.subjectName} numberOfLines={1}>{mark.subject_name ?? 'Subject'}</Text>
                    {mark.exam_name && <Text style={styles.examName}>{mark.exam_name}</Text>}
                  </View>
                  <Text style={styles.tdCell}>{mark.marks_obtained}</Text>
                  <Text style={styles.tdCell}>{mark.max_marks ?? '—'}</Text>
                  <Text style={[styles.tdCell, { color: pct >= 75 ? COLORS.success : COLORS.error, fontWeight: '700' }]}>
                    {pct}%
                  </Text>
                  <View style={[styles.gradeChip, { backgroundColor: gc + '22', borderColor: gc }]}>
                    <Text style={[styles.gradeText, { color: gc }]}>{mark.grade}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function OverallStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.overallStat}>
      <Text style={[styles.overallVal, { color }]}>{value}</Text>
      <Text style={styles.overallLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 1, marginBottom: SIZES.sm,
  },
  examPicker: { marginBottom: SIZES.md },
  examChip: {
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusRound, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card, marginRight: SIZES.sm,
  },
  examChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  examChipText: { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '600' },
  examChipTextActive: { color: '#fff' },
  summaryCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.md, ...SHADOWS.small,
  },
  cardTitle: { ...FONTS.h4, color: COLORS.textDark, marginBottom: SIZES.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  overallStat: { alignItems: 'center' },
  overallVal: { ...FONTS.h3, fontWeight: '800' },
  overallLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  tableHeader: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md, backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 2,
  },
  thCell: { flex: 1, ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md, borderRadius: SIZES.radiusSm, marginBottom: 2,
  },
  tableRowAlt: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  subjectName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },
  examName: { ...FONTS.caption, color: COLORS.textLight, marginTop: 1 },
  tdCell: { flex: 1, ...FONTS.body2, color: COLORS.textDark, textAlign: 'center' },
  gradeChip: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: SIZES.radiusSm, borderWidth: 1 },
  gradeText: { fontSize: 12, fontWeight: '800' },
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
