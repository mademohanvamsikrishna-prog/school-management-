/**
 * Exams — list all exams from GET /marks/exams.
 * Grouped by status: upcoming, ongoing, completed.
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
import { getExams, type Exam } from '../../services/marks';

const IS_WEB = Platform.OS === 'web';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  upcoming:  { label: 'Upcoming',  color: '#3B82F6', bg: '#EFF6FF', icon: '📅' },
  ongoing:   { label: 'Ongoing',   color: '#F59E0B', bg: '#FFFBEB', icon: '✍️'  },
  completed: { label: 'Completed', color: '#10B981', bg: '#ECFDF5', icon: '✅' },
};

type FilterType = 'all' | Exam['status'];

export default function ExamsScreen() {
  const { data: exams, loading, error, refetch } = useApi(getExams);
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(
    () => (exams ?? []).filter(e => filter === 'all' || e.status === filter),
    [exams, filter]
  );

  const counts = useMemo(() => ({
    upcoming:  (exams ?? []).filter(e => e.status === 'upcoming').length,
    ongoing:   (exams ?? []).filter(e => e.status === 'ongoing').length,
    completed: (exams ?? []).filter(e => e.status === 'completed').length,
  }), [exams]);

  if (loading) return <LoadingScreen message="Loading exams..." />;
  if (error) return <ErrorScreen error={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Exams</Text>
          <Text style={styles.pageSub}>Upcoming and completed examinations</Text>
        </View>

        {/* Summary chips */}
        <View style={styles.summaryRow}>
          <SummaryChip label="Upcoming"  count={counts.upcoming}  color="#3B82F6" />
          <SummaryChip label="Ongoing"   count={counts.ongoing}   color="#F59E0B" />
          <SummaryChip label="Completed" count={counts.completed} color="#10B981" />
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'upcoming', 'ongoing', 'completed'] as FilterType[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exam cards */}
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No exams</Text>
            <Text style={styles.emptySub}>No {filter === 'all' ? '' : filter + ' '}exams found.</Text>
          </View>
        ) : (
          filtered.map(exam => <ExamCard key={exam.id} exam={exam} />)
        )}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  const cfg = STATUS_CONFIG[exam.status] ?? STATUS_CONFIG.upcoming;
  return (
    <View style={[styles.examCard, { borderLeftColor: cfg.color }]}>
      <View style={styles.examTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.examName}>{exam.name}</Text>
          <Text style={styles.examMeta}>
            {exam.term} · {exam.academic_year}
          </Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
          <Text style={styles.statusChipIcon}>{cfg.icon}</Text>
          <Text style={[styles.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.examDates}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <Text style={styles.dateValue}>{exam.start_date}</Text>
        </View>
        <View style={styles.dateSep} />
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>End Date</Text>
          <Text style={styles.dateValue}>{exam.end_date}</Text>
        </View>
      </View>
    </View>
  );
}

function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.summaryChip, { borderColor: color }]}>
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  summaryRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  summaryChip: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    padding: SIZES.sm, alignItems: 'center', borderWidth: 2, ...SHADOWS.small,
  },
  summaryCount: { ...FONTS.h3, fontWeight: '800' },
  summaryLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },

  filterRow: {
    flexDirection: 'row', gap: SIZES.xs, marginBottom: SIZES.md,
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: SIZES.radiusSm - 2, alignItems: 'center' },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: '#fff' },

  examCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    marginBottom: SIZES.md, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  examTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm },
  examName: { ...FONTS.h4, color: COLORS.textDark, marginBottom: 4 },
  examMeta: { ...FONTS.caption, color: COLORS.textSecondary },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound,
  },
  statusChipIcon: { fontSize: 12 },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.sm },
  examDates: { flexDirection: 'row', alignItems: 'center' },
  dateItem: { flex: 1 },
  dateLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  dateValue: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600', marginTop: 2 },
  dateSep: { width: 1, height: 32, backgroundColor: COLORS.border, marginHorizontal: SIZES.md },

  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
