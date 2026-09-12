/**
 * Leave Requests — submit leave + view history.
 * Uses GET /leave/types, POST /leave/requests, GET /leave/requests/mine.
 */
import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import {
  getLeaveTypes,
  applyForLeave,
  getMyLeaveRequests,
  type LeaveType,
  type LeaveRequestOut,
} from '../../services/leave';

const IS_WEB = Platform.OS === 'web';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:  { label: 'Pending',  color: '#F59E0B', bg: '#FFFBEB', icon: '⏳' },
  approved: { label: 'Approved', color: '#10B981', bg: '#ECFDF5', icon: '✅' },
  rejected: { label: 'Rejected', color: '#EF4444', bg: '#FEF2F2', icon: '❌' },
};

export default function LeaveScreen() {
  const { data: types, loading: tLoading, error: tError } = useApi(getLeaveTypes);
  const { data: requests, loading: rLoading, refetch } = useApi(getMyLeaveRequests);

  const [tab, setTab] = useState<'apply' | 'history'>('history');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diff);
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    if (!selectedTypeId || !startDate || !endDate || !reason.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await applyForLeave({ leave_type_id: selectedTypeId, start_date: startDate, end_date: endDate, days_count: daysCount, reason });
      setSuccessMsg('Leave request submitted successfully!');
      setSelectedTypeId('');
      setStartDate('');
      setEndDate('');
      setReason('');
      refetch();
      setTab('history');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (tLoading || rLoading) return <LoadingScreen message="Loading leave..." />;
  if (tError) return <ErrorScreen error={tError} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Leave Requests</Text>
          <Text style={styles.pageSub}>Apply for leave and track your requests</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
            <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>📋 History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'apply' && styles.tabActive]} onPress={() => setTab('apply')}>
            <Text style={[styles.tabText, tab === 'apply' && styles.tabTextActive]}>➕ Apply</Text>
          </TouchableOpacity>
        </View>

        {tab === 'apply' ? (
          /* ── Apply form ── */
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Leave Request</Text>

            {successMsg ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✅ {successMsg}</Text>
              </View>
            ) : null}

            <FieldLabel label="Leave Type *" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {(types ?? []).map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, selectedTypeId === t.id && styles.typeChipSelected]}
                  onPress={() => setSelectedTypeId(t.id)}
                >
                  <Text style={[styles.typeChipText, selectedTypeId === t.id && styles.typeChipTextSelected]}>
                    {t.name}
                  </Text>
                  <Text style={[styles.typeChipSub, selectedTypeId === t.id && { color: 'rgba(255,255,255,0.8)' }]}>
                    Max {t.max_days}d · {t.is_paid ? 'Paid' : 'Unpaid'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={IS_WEB ? styles.dateRowWeb : styles.dateRowMobile}>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Start Date *" />
                <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight} />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel label="End Date *" />
                <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight} />
              </View>
            </View>

            {daysCount > 0 && (
              <View style={styles.daysBadge}>
                <Text style={styles.daysBadgeText}>{daysCount} day{daysCount !== 1 ? 's' : ''} selected</Text>
              </View>
            )}

            <FieldLabel label="Reason *" />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="State your reason for leave..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          /* ── History ── */
          <>
            {(!requests || requests.length === 0) ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🗂️</Text>
                <Text style={styles.emptyTitle}>No leave requests</Text>
                <Text style={styles.emptySub}>You haven't submitted any leave requests yet.</Text>
                <TouchableOpacity style={styles.applyLink} onPress={() => setTab('apply')}>
                  <Text style={styles.applyLinkText}>Apply for Leave →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              requests.map(req => {
                const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                return (
                  <View key={req.id} style={[styles.reqCard, { borderLeftColor: cfg.color }]}>
                    <View style={styles.reqTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqType}>{req.type}</Text>
                        <Text style={styles.reqDates}>{req.start} → {req.end} ({req.days} day{req.days !== 1 ? 's' : ''})</Text>
                      </View>
                      <View style={[styles.reqBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={styles.reqBadgeIcon}>{cfg.icon}</Text>
                        <Text style={[styles.reqBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: COLORS.border, padding: 4, marginBottom: SIZES.md, gap: 4,
  },
  tab: { flex: 1, paddingVertical: SIZES.sm, alignItems: 'center', borderRadius: SIZES.radiusSm - 2 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  // Form
  formCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  formTitle: { ...FONTS.h4, color: COLORS.textDark, marginBottom: SIZES.md },
  successBanner: { backgroundColor: '#ECFDF5', borderRadius: SIZES.radiusSm, padding: SIZES.md, marginBottom: SIZES.md },
  successText: { ...FONTS.body2, color: COLORS.success, fontWeight: '600' },
  fieldLabel: { ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, marginTop: SIZES.sm },
  typeScroll: { marginBottom: SIZES.sm },
  typeChip: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, marginRight: SIZES.sm,
    backgroundColor: '#F8FAFC',
  },
  typeChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },
  typeChipTextSelected: { color: '#fff' },
  typeChipSub: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  dateRowWeb: { flexDirection: 'row', gap: SIZES.md },
  dateRowMobile: { flexDirection: 'column' },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSm,
    padding: SIZES.md, fontSize: 14, color: COLORS.textDark,
    backgroundColor: '#F8FAFC', marginBottom: SIZES.sm,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  daysBadge: {
    backgroundColor: '#EEF2FF', paddingHorizontal: SIZES.sm, paddingVertical: 4,
    borderRadius: SIZES.radiusRound, alignSelf: 'flex-start', marginBottom: SIZES.sm,
  },
  daysBadgeText: { ...FONTS.caption, color: COLORS.primary, fontWeight: '700' },
  submitBtn: {
    backgroundColor: COLORS.primary, paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusSm, alignItems: 'center', marginTop: SIZES.sm,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  // History
  reqCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4,
    marginBottom: SIZES.sm, ...SHADOWS.small,
  },
  reqTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm },
  reqType: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '700' },
  reqDates: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },
  reqBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound },
  reqBadgeIcon: { fontSize: 12 },
  reqBadgeText: { fontSize: 12, fontWeight: '700' },
  // Empty
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
  applyLink: { marginTop: SIZES.sm },
  applyLinkText: { ...FONTS.body2, color: COLORS.primary, fontWeight: '700' },
});
