/**
 * Assignments — list student assignments using marks/exams data.
 * Shows exam subjects as assignments with marks obtained.
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
import { getExams, getStudentMarks } from '../../services/marks';

const IS_WEB = Platform.OS === 'web';

export default function AssignmentsScreen() {
  const { user } = useAuth();
  const { data: exams, loading: eLoading, error, refetch } = useApi(getExams);
  const { data: marks, loading: mLoading } = useApi(
    async () => (user ? getStudentMarks(user.id) : []),
    [user]
  );

  const [selectedExamId, setSelectedExamId] = useState<string | 'all'>('all');

  const displayMarks = useMemo(() => {
    if (!marks) return [];
    if (selectedExamId === 'all') return marks;
    const examName = exams?.find(e => e.id === selectedExamId)?.name;
    return marks.filter(m => m.exam_name === examName);
  }, [marks, selectedExamId, exams]);

  if (eLoading || mLoading) return <LoadingScreen message="Loading assignments..." />;
  if (error) return <ErrorScreen error={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Assignments</Text>
          <Text style={styles.pageSub}>Your exam assignments and scores</Text>
        </View>

        {/* Exam filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SIZES.md }}>
          <TouchableOpacity
            style={[styles.examChip, selectedExamId === 'all' && styles.examChipActive]}
            onPress={() => setSelectedExamId('all')}
          >
            <Text style={[styles.examChipText, selectedExamId === 'all' && styles.examChipTextActive]}>All</Text>
          </TouchableOpacity>
          {(exams ?? []).map(e => (
            <TouchableOpacity
              key={e.id}
              style={[styles.examChip, selectedExamId === e.id && styles.examChipActive]}
              onPress={() => setSelectedExamId(e.id)}
            >
              <Text style={[styles.examChipText, selectedExamId === e.id && styles.examChipTextActive]}>{e.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Assignment cards */}
        {displayMarks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No assignments</Text>
            <Text style={styles.emptySub}>
              {marks?.length === 0
                ? 'No assignment results have been entered yet.'
                : 'No assignments for the selected exam.'}
            </Text>
          </View>
        ) : (
          displayMarks.map((mark, idx) => {
            const pct = mark.max_marks ? Math.round((mark.marks_obtained / mark.max_marks) * 100) : 0;
            const submitted = true; // All marks records mean assignment was evaluated
            const isGood = pct >= 60;
            return (
              <View key={mark.id} style={[styles.card, { borderLeftColor: isGood ? COLORS.success : COLORS.error }]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectChipText}>{mark.subject_name ?? 'Subject'}</Text>
                    {mark.exam_name && <Text style={styles.examLabel}>📝 {mark.exam_name}</Text>}
                    {mark.exam_date && <Text style={styles.dateLabel}>📅 {mark.exam_date}</Text>}
                  </View>
                  <View style={styles.scoreBox}>
                    <Text style={[styles.scoreVal, { color: isGood ? COLORS.success : COLORS.error }]}>
                      {mark.marks_obtained}/{mark.max_marks ?? '?'}
                    </Text>
                    <View style={[styles.gradeBadge, { backgroundColor: isGood ? '#ECFDF5' : '#FEF2F2' }]}>
                      <Text style={[styles.gradeText, { color: isGood ? COLORS.success : COLORS.error }]}>
                        {mark.grade} · {pct}%
                      </Text>
                    </View>
                  </View>
                </View>
                {mark.remarks && (
                  <Text style={styles.remarks} numberOfLines={2}>💬 {mark.remarks}</Text>
                )}
                <View style={styles.cardFooter}>
                  <View style={[styles.submittedBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.submittedText, { color: COLORS.success }]}>✅ Evaluated</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },
  examChip: {
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, marginRight: SIZES.sm,
    borderRadius: SIZES.radiusRound, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  examChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  examChipText: { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '600' },
  examChipTextActive: { color: '#fff' },
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    marginBottom: SIZES.md, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.md },
  subjectChipText: { ...FONTS.body1, color: COLORS.textDark, fontWeight: '700', marginBottom: 4 },
  examLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  dateLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  scoreBox: { alignItems: 'flex-end', gap: 6 },
  scoreVal: { ...FONTS.h3, fontWeight: '800' },
  gradeBadge: { paddingHorizontal: SIZES.sm, paddingVertical: 3, borderRadius: SIZES.radiusSm },
  gradeText: { fontSize: 12, fontWeight: '700' },
  remarks: { ...FONTS.caption, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: SIZES.sm },
  cardFooter: { marginTop: SIZES.sm, flexDirection: 'row' },
  submittedBadge: { paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound },
  submittedText: { fontSize: 12, fontWeight: '700' },
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
