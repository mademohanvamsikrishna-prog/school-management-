/**
 * Homework — homework assignments derived from exam subjects + events.
 * Uses GET /marks/exams (for upcoming exams as pseudo-homework tasks).
 * For features requiring a dedicated homework backend, shows proper empty state.
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
import { LoadingScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getEvents } from '../../services/events';

const IS_WEB = Platform.OS === 'web';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FFFBEB', icon: '⏳' },
  submitted: { label: 'Submitted', color: '#10B981', bg: '#ECFDF5', icon: '✅' },
  overdue:   { label: 'Overdue',   color: '#EF4444', bg: '#FEF2F2', icon: '🔴' },
};

type HWStatus = keyof typeof STATUS_CONFIG;

export default function HomeworkScreen() {
  const { data: events, loading } = useApi(() => getEvents(false));
  const [filter, setFilter] = useState<'all' | HWStatus>('all');

  // Derive homework-like items from events (type=homework or academic announcements)
  const homeworkItems = useMemo(() => {
    if (!events) return [];
    const today = new Date().toISOString().slice(0, 10);
    return events
      .filter(e => e.type === 'homework' || e.type === 'academic' || e.type === 'assignment')
      .map((e, i) => {
        const due = e.date;
        let status: HWStatus = 'pending';
        if (due < today) status = 'overdue';
        return {
          id: e.id,
          title: e.title,
          description: e.description ?? '',
          subject: e.type?.toUpperCase() ?? 'GENERAL',
          dueDate: due,
          assignedDate: e.date,
          status,
        };
      });
  }, [events]);

  const filtered = useMemo(() => (
    filter === 'all' ? homeworkItems : homeworkItems.filter(h => h.status === filter)
  ), [homeworkItems, filter]);

  if (loading) return <LoadingScreen message="Loading homework..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Homework</Text>
          <Text style={styles.pageSub}>Your assigned homework and tasks</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {(['pending', 'submitted', 'overdue'] as HWStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = homeworkItems.filter(h => h.status === s).length;
            return (
              <View key={s} style={[styles.statCard, { borderTopColor: cfg.color }]}>
                <Text style={[styles.statVal, { color: cfg.color }]}>{count}</Text>
                <Text style={styles.statLabel}>{cfg.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {(['all', 'pending', 'submitted', 'overdue'] as const).map(f => (
            <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Items */}
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No homework found</Text>
            <Text style={styles.emptySub}>
              {filter === 'all'
                ? 'No homework assignments have been posted yet.'
                : `No ${filter} homework found.`}
            </Text>
          </View>
        ) : (
          filtered.map(hw => {
            const cfg = STATUS_CONFIG[hw.status];
            return (
              <View key={hw.id} style={[styles.hwCard, { borderLeftColor: cfg.color }]}>
                <View style={styles.hwTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.subjectChip}>
                      <Text style={styles.subjectText}>{hw.subject}</Text>
                    </View>
                    <Text style={styles.hwTitle}>{hw.title}</Text>
                    {hw.description ? (
                      <Text style={styles.hwDesc} numberOfLines={2}>{hw.description}</Text>
                    ) : null}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={styles.statusIcon}>{cfg.icon}</Text>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <View style={styles.hwBottom}>
                  <Text style={styles.hwDate}>📅 Due: {hw.dueDate}</Text>
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
  statsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    padding: SIZES.md, borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', ...SHADOWS.small,
  },
  statVal: { ...FONTS.h3, fontWeight: '800' },
  statLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  filterRow: {
    flexDirection: 'row', gap: SIZES.xs, marginBottom: SIZES.md,
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: SIZES.radiusSm - 2, alignItems: 'center' },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: '#fff' },
  hwCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    marginBottom: SIZES.md, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  hwTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm, marginBottom: SIZES.sm },
  subjectChip: {
    backgroundColor: '#EEF2FF', paddingHorizontal: SIZES.sm, paddingVertical: 3,
    borderRadius: SIZES.radiusRound, alignSelf: 'flex-start', marginBottom: 6,
  },
  subjectText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  hwTitle: { ...FONTS.body1, color: COLORS.textDark, fontWeight: '700' },
  hwDesc: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  hwBottom: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm },
  hwDate: { ...FONTS.caption, color: COLORS.textSecondary },
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
