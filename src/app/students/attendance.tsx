/**
 * Attendance — dedicated full attendance page.
 * Shows summary stats + full history from:
 *   GET /attendance/student/{id}/summary
 *   GET /attendance/student/{id}/records
 */
import React, { useState } from 'react';
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
import { DonutChart } from '../../components/DonutChart';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getAttendanceSummary, getAttendanceRecords } from '../../services/attendance';

const IS_WEB = Platform.OS === 'web';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');

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

  const attendancePct = summary?.percentage ?? 0;
  const presentDays   = summary?.present_days ?? 0;
  const absentDays    = summary?.absent_days ?? 0;
  const totalDays     = summary?.total_days ?? (presentDays + absentDays);

  const filtered = (records ?? []).filter(r =>
    filter === 'all' ? true : r.status === filter
  );

  const STATUS_COLORS: Record<string, string> = {
    present: COLORS.success,
    absent:  COLORS.error,
    late:    COLORS.warning,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Page title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Attendance</Text>
          <Text style={styles.pageSub}>Your attendance record this semester</Text>
        </View>

        {/* Summary cards row */}
        <View style={styles.statsRow}>
          <StatMini label="Present" value={String(presentDays)} color={COLORS.success} />
          <StatMini label="Absent"  value={String(absentDays)}  color={COLORS.error} />
          <StatMini label="Total"   value={String(totalDays)}   color={COLORS.primary} />
        </View>

        {/* Donut chart card */}
        <View style={styles.donutCard}>
          <Text style={styles.cardTitle}>Overall Attendance</Text>
          <View style={styles.donutRow}>
            <DonutChart percentage={attendancePct} size={IS_WEB ? 160 : 130} strokeWidth={16} color={COLORS.primary} />
            <View style={styles.donutMeta}>
              <Text style={styles.pctBig}>{attendancePct}%</Text>
              <Text style={styles.pctLabel}>Attendance Rate</Text>
              <View style={[styles.pill, { backgroundColor: attendancePct >= 75 ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.pillText, { color: attendancePct >= 75 ? COLORS.success : COLORS.error }]}>
                  {attendancePct >= 75 ? '✅ Good Standing' : '⚠️ Below 75%'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'present', 'absent', 'late'] as const).map(f => (
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

        {/* Records list */}
        <View style={styles.recordsList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No records found</Text>
              <Text style={styles.emptySub}>No attendance records match this filter.</Text>
            </View>
          ) : (
            filtered.map(rec => (
              <View key={rec.id} style={styles.recordRow}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[rec.status] ?? COLORS.border }]} />
                <Text style={styles.recordDate}>{rec.date}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[rec.status] ?? COLORS.border }]}>
                  <Text style={styles.statusBadgeText}>{rec.status.toUpperCase()}</Text>
                </View>
                {rec.remarks ? <Text style={styles.recordRemark} numberOfLines={1}>{rec.remarks}</Text> : null}
              </View>
            ))
          )}
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statMini, { borderTopColor: color }]}>
      <Text style={[styles.statMiniVal, { color }]}>{value}</Text>
      <Text style={styles.statMiniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  statMini: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm, padding: SIZES.md,
    borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  statMiniVal: { ...FONTS.h3, fontWeight: '700' },
  statMiniLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  donutCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.md, ...SHADOWS.small,
  },
  cardTitle: { ...FONTS.h4, color: COLORS.textDark, marginBottom: SIZES.md },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.lg },
  donutMeta: { flex: 1, gap: SIZES.sm },
  pctBig: { fontSize: 36, fontWeight: '800', color: COLORS.textDark },
  pctLabel: { ...FONTS.body2, color: COLORS.textSecondary },
  pill: { alignSelf: 'flex-start', paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound },
  pillText: { fontSize: 12, fontWeight: '700' },
  filterRow: {
    flexDirection: 'row', gap: SIZES.xs, marginBottom: SIZES.md,
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: SIZES.radiusSm - 2, alignItems: 'center' },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: '#fff' },
  recordsList: { gap: SIZES.xs },
  recordRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  recordDate: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusRound },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  recordRemark: { ...FONTS.caption, color: COLORS.textSecondary, flex: 1 },
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
