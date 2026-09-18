/**
 * Leave Requests — Student-scoped leave application and management.
 *
 * Uses /api/v1/students/dashboard/leaves (not the generic staff leave endpoints).
 *
 * Features:
 *   - History tab  : list with pull-to-refresh + status filter chips
 *   - Apply tab    : form → POST /leaves
 *   - Cancel       : PATCH status=cancelled (optimistic UI)
 *   - Delete       : confirmation alert → DELETE (optimistic removal)
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import {
  createLeaveRequest,
  getLeaveRequests,
  cancelLeaveRequest,
  deleteLeaveRequest,
  type StudentLeave,
  type LeaveStatus,
  type StudentLeaveCreate,
} from '../../services/dashboardCrud';

const IS_WEB = Platform.OS === 'web';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: '#FFFBEB', icon: '⏳' },
  approved:  { label: 'Approved',  color: '#10B981', bg: '#ECFDF5', icon: '✅' },
  rejected:  { label: 'Rejected',  color: '#EF4444', bg: '#FEF2F2', icon: '❌' },
  cancelled: { label: 'Cancelled', color: '#94A3B8', bg: '#F1F5F9', icon: '🚫' },
};

const LEAVE_TYPES = ['Medical', 'Casual', 'Family Emergency', 'Study Leave', 'Personal'] as const;
type LeaveTypeOpt = typeof LEAVE_TYPES[number];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function calcDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, diff);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function LeaveScreen() {
  const { data: resp, loading, refetch } = useApi(() => getLeaveRequests({ limit: 50 }));
  const [tab, setTab] = useState<'history' | 'apply'>('history');
  const [statusFilter, setStatusFilter] = useState<'all' | LeaveStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Optimistic local list
  const [localItems, setLocalItems] = useState<StudentLeave[] | null>(null);
  const items: StudentLeave[] = localItems ?? (resp?.items ?? []);

  const filtered = useMemo(
    () => (statusFilter === 'all' ? items : items.filter(l => l.status === statusFilter)),
    [items, statusFilter],
  );

  // ---- Apply form state ----
  const [leaveType, setLeaveType] = useState<LeaveTypeOpt>('Medical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const daysCount = useMemo(() => calcDays(startDate, endDate), [startDate, endDate]);

  // ---- Stats ----
  const stats = useMemo(
    () => ({
      pending:  items.filter(l => l.status === 'pending').length,
      approved: items.filter(l => l.status === 'approved').length,
      rejected: items.filter(l => l.status === 'rejected').length,
    }),
    [items],
  );

  // -------------------------------------------------------------------------
  // Refresh
  // -------------------------------------------------------------------------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLocalItems(null);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // -------------------------------------------------------------------------
  // Submit leave application
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Invalid dates', 'End date must be on or after start date.');
      return;
    }
    if (reason.trim().length < 10) {
      Alert.alert('Reason too short', 'Please provide at least 10 characters for the reason.');
      return;
    }
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const payload: StudentLeaveCreate = {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_count: daysCount || 1,
        reason: reason.trim(),
      };
      const created = await createLeaveRequest(payload);
      // Optimistic prepend
      setLocalItems(prev => [created, ...(prev ?? items)]);
      setSuccessMsg('Leave request submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('Medical');
      setTab('history');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Cancel (PATCH status=cancelled)
  // -------------------------------------------------------------------------
  const handleCancel = (item: StudentLeave) => {
    Alert.alert('Cancel Leave', 'Cancel this leave request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          // Optimistic
          setLocalItems(prev =>
            (prev ?? items).map(l =>
              l.id === item.id ? { ...l, status: 'cancelled' as LeaveStatus } : l,
            ),
          );
          try {
            await cancelLeaveRequest(item.id);
          } catch (err: any) {
            setLocalItems(null);
            await refetch();
            Alert.alert('Error', err?.message ?? 'Could not cancel leave request.');
          }
        },
      },
    ]);
  };

  // -------------------------------------------------------------------------
  // Delete (confirmed)
  // -------------------------------------------------------------------------
  const handleDelete = (item: StudentLeave) => {
    Alert.alert(
      'Delete Leave Request',
      'Permanently delete this leave request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLocalItems(prev => (prev ?? items).filter(l => l.id !== item.id));
            try {
              await deleteLeaveRequest(item.id);
            } catch (err: any) {
              setLocalItems(null);
              await refetch();
              Alert.alert('Error', err?.message ?? 'Could not delete leave request.');
            }
          },
        },
      ],
    );
  };

  // ---------------------------------------------------------------------------
  // Render — History tab
  // ---------------------------------------------------------------------------
  const renderHistory = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Pending',  count: stats.pending,  color: '#F59E0B' },
          { label: 'Approved', count: stats.approved, color: '#10B981' },
          { label: 'Rejected', count: stats.rejected, color: '#EF4444' },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.count}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Status filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map(s => {
            const cfg = s === 'all' ? null : STATUS_CONFIG[s];
            const active = statusFilter === s;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.chip,
                  active && { backgroundColor: cfg?.color ?? COLORS.primary },
                ]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.chipText, active && { color: '#fff' }]}>
                  {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Loading */}
      {loading && !refreshing && (
        <View style={styles.centeredBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No leave requests</Text>
          <Text style={styles.emptySub}>
            {statusFilter === 'all'
              ? 'Tap "Apply for Leave" to submit your first request.'
              : `No ${STATUS_CONFIG[statusFilter as LeaveStatus]?.label} requests.`}
          </Text>
        </View>
      )}

      {/* Cards */}
      {filtered.map(leave => {
        const cfg = STATUS_CONFIG[leave.status] ?? STATUS_CONFIG.pending;
        const isPending = leave.status === 'pending';
        const isDeletable = leave.status !== 'approved';

        return (
          <View key={leave.id} style={[styles.leaveCard, { borderLeftColor: cfg.color }]}>
            {/* Header */}
            <View style={styles.leaveCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaveType}>{leave.leave_type}</Text>
                <Text style={styles.leaveDates}>
                  📅 {leave.start_date} → {leave.end_date}
                  {'   '}({leave.days_count} day{leave.days_count !== 1 ? 's' : ''})
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={styles.statusBadgeIcon}>{cfg.icon}</Text>
                <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>

            {/* Reason */}
            <Text style={styles.leaveReason} numberOfLines={3}>{leave.reason}</Text>

            {/* Rejection reason */}
            {leave.rejection_reason && (
              <View style={styles.rejectionBox}>
                <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                <Text style={styles.rejectionText}>{leave.rejection_reason}</Text>
              </View>
            )}

            {/* Applied on */}
            <Text style={styles.leaveApplied}>
              Applied: {new Date(leave.created_at).toLocaleDateString()}
            </Text>

            {/* Actions */}
            <View style={styles.leaveActions}>
              {isPending && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={() => handleCancel(leave)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
              {isDeletable && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(leave)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      <View style={{ height: SIZES.xxl }} />
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // Render — Apply tab
  // ---------------------------------------------------------------------------
  const renderApply = () => (
    <ScrollView contentContainerStyle={styles.tabContent} keyboardShouldPersistTaps="handled">
      {/* Success banner */}
      {successMsg ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ {successMsg}</Text>
        </View>
      ) : null}

      {/* Leave type selector */}
      <Text style={styles.fieldLabel}>Leave Type *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {LEAVE_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, leaveType === t && styles.chipActive]}
              onPress={() => setLeaveType(t)}
            >
              <Text style={[styles.chipText, leaveType === t && { color: '#fff' }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Dates */}
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Start Date * (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-10-01"
            value={startDate}
            onChangeText={setStartDate}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>End Date * (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-10-03"
            value={endDate}
            onChangeText={setEndDate}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Days count indicator */}
      {daysCount > 0 && (
        <View style={styles.daysBox}>
          <Text style={styles.daysText}>Duration: {daysCount} day{daysCount !== 1 ? 's' : ''}</Text>
        </View>
      )}

      {/* Reason */}
      <Text style={styles.fieldLabel}>Reason * (min 10 characters)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Explain the reason for your leave..."
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={5}
        placeholderTextColor="#94A3B8"
      />
      <Text style={styles.charCount}>{reason.length} / 10+ chars</Text>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>Submit Leave Request</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: SIZES.xxl }} />
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Leave Requests</Text>
          <Text style={styles.pageSub}>{items.length} total requests</Text>
        </View>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => setTab('apply')}
          activeOpacity={0.8}
        >
          <Text style={styles.applyBtnText}>+ Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(['history', 'apply'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t === 'history' ? '📋 History' : '📝 Apply for Leave'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'history' ? renderHistory() : renderApply()}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },

  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: IS_WEB ? SIZES.xl : SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  pageTitle: { ...FONTS.h3, color: COLORS.textDark, fontWeight: '700' },
  pageSub:   { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  applyBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm, borderRadius: SIZES.radiusRound,
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabBtnActive:     { borderBottomColor: COLORS.primary },
  tabBtnText:       { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '600' },
  tabBtnTextActive: { color: COLORS.primary, fontWeight: '800' },

  tabContent: { padding: IS_WEB ? SIZES.xl : SIZES.md },

  statsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    padding: SIZES.md, borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', ...SHADOWS.small,
  },
  statVal:   { ...FONTS.h3, fontWeight: '800' },
  statLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },

  chipScroll: { marginBottom: SIZES.md },
  chipRow:    { flexDirection: 'row', gap: SIZES.xs },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:   { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },

  centeredBox: { alignItems: 'center', paddingVertical: SIZES.xxl },
  emptyCard:   { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon:   { fontSize: 48 },
  emptyTitle:  { ...FONTS.h4, color: COLORS.textDark },
  emptySub:    { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },

  leaveCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    marginBottom: SIZES.md, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  leaveCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm, marginBottom: SIZES.sm },
  leaveType:    { ...FONTS.body1, color: COLORS.textDark, fontWeight: '700' },
  leaveDates:   { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound,
  },
  statusBadgeIcon: { fontSize: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  leaveReason: { ...FONTS.body2, color: COLORS.textSecondary, marginBottom: SIZES.sm },
  rejectionBox: {
    backgroundColor: '#FEF2F2', borderRadius: SIZES.radiusSm,
    padding: SIZES.sm, marginBottom: SIZES.sm, borderWidth: 1, borderColor: '#FCA5A5',
  },
  rejectionLabel: { ...FONTS.caption, color: '#EF4444', fontWeight: '700', marginBottom: 2 },
  rejectionText:  { ...FONTS.body2, color: '#991B1B' },
  leaveApplied:   { ...FONTS.caption, color: COLORS.textLight, marginBottom: SIZES.sm },
  leaveActions:   { flexDirection: 'row', gap: SIZES.xs },
  actionBtn: {
    paddingHorizontal: SIZES.md, paddingVertical: 7, borderRadius: SIZES.radiusSm,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn:     { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#F59E0B', flex: 1 },
  cancelBtnText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  deleteBtn:     { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444' },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  // Apply form
  successBanner: {
    backgroundColor: '#ECFDF5', borderRadius: SIZES.radiusSm, padding: SIZES.md,
    marginBottom: SIZES.lg, borderWidth: 1, borderColor: '#10B981',
  },
  successText: { ...FONTS.body2, color: '#065F46', fontWeight: '600' },
  fieldLabel:  { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600', marginBottom: 6, marginTop: SIZES.md },
  dateRow:     { flexDirection: 'row', gap: SIZES.sm },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSm,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: COLORS.textDark, backgroundColor: '#F8FAFC',
  },
  textArea:  { height: 110, textAlignVertical: 'top' },
  charCount: { ...FONTS.caption, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  daysBox: {
    backgroundColor: '#EEF2FF', padding: SIZES.sm, borderRadius: SIZES.radiusSm,
    marginTop: SIZES.sm, alignItems: 'center',
  },
  daysText: { ...FONTS.body2, color: COLORS.primary, fontWeight: '700' },
  submitBtn: {
    marginTop: SIZES.xl, backgroundColor: COLORS.primary, borderRadius: SIZES.radiusSm,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
});
