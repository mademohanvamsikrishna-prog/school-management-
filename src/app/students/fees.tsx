/**
 * Fees — fee invoice dashboard.
 * Uses GET /finance/student/{id}/invoices and POST /finance/pay/simulate.
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getStudentInvoices, simulatePayment, type FeeInvoice } from '../../services/finance';

const IS_WEB = Platform.OS === 'web';

const STATUS_CONFIG: Record<FeeInvoice['status'], { label: string; color: string; bg: string }> = {
  paid:     { label: 'Paid',    color: '#10B981', bg: '#ECFDF5' },
  pending:  { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  overdue:  { label: 'Overdue', color: '#EF4444', bg: '#FEF2F2' },
};

export default function FeesScreen() {
  const { user } = useAuth();
  const { data: invoices, loading, error, refetch } = useApi(
    async () => (user ? getStudentInvoices(user.id) : []),
    [user]
  );
  const [payingId, setPayingId] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (!invoices) return { total: 0, paid: 0, pending: 0, overdue: 0 };
    return {
      total:   invoices.reduce((s, i) => s + i.amount, 0),
      paid:    invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
      pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
      overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
    };
  }, [invoices]);

  const handlePay = async (invoice: FeeInvoice) => {
    const confirm = IS_WEB
      ? window.confirm(`Simulate payment of ₹${invoice.amount} for "${invoice.title}"?`)
      : await new Promise<boolean>(resolve =>
          Alert.alert('Pay Now', `Simulate payment of ₹${invoice.amount} for "${invoice.title}"?`, [
            { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Pay', onPress: () => resolve(true) },
          ])
        );
    if (!confirm) return;

    setPayingId(invoice.id);
    try {
      await simulatePayment(invoice.id, invoice.amount);
      Alert.alert('✅ Payment Recorded', `Simulated payment of ₹${invoice.amount} recorded.`);
      refetch();
    } catch {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <LoadingScreen message="Loading fees..." />;
  if (error) return <ErrorScreen error={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Fees & Payments</Text>
          <Text style={styles.pageSub}>Your fee invoices and payment status</Text>
        </View>

        {/* Summary banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerMain}>
            <Text style={styles.bannerLabel}>Total Fees</Text>
            <Text style={styles.bannerAmount}>₹{summary.total.toLocaleString()}</Text>
          </View>
          <View style={styles.bannerDivider} />
          <View style={styles.bannerStats}>
            <BannerStat label="Paid"    value={`₹${summary.paid.toLocaleString()}`}    color="#10B981" />
            <BannerStat label="Pending" value={`₹${summary.pending.toLocaleString()}`} color="#F59E0B" />
            <BannerStat label="Overdue" value={`₹${summary.overdue.toLocaleString()}`} color="#EF4444" />
          </View>
        </View>

        {/* Progress bar */}
        {summary.total > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Payment Progress</Text>
              <Text style={styles.progressPct}>{Math.round((summary.paid / summary.total) * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(100, (summary.paid / summary.total) * 100)}%` as any }]} />
            </View>
          </View>
        )}

        {/* Invoice list */}
        <Text style={styles.sectionLabel}>INVOICES</Text>
        {(!invoices || invoices.length === 0) ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No invoices</Text>
            <Text style={styles.emptySub}>No fee invoices found for your account.</Text>
          </View>
        ) : (
          invoices.map(invoice => {
            const cfg = STATUS_CONFIG[invoice.status];
            const isPaying = payingId === invoice.id;
            return (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invoiceTitle}>{invoice.title}</Text>
                    {invoice.category_name && (
                      <Text style={styles.invoiceCategory}>{invoice.category_name}</Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <View style={styles.invoiceBottom}>
                  <View>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>₹{invoice.amount.toLocaleString()}</Text>
                  </View>
                  <View>
                    <Text style={styles.amountLabel}>Due Date</Text>
                    <Text style={styles.dueDate}>{invoice.due_date}</Text>
                  </View>
                  {invoice.status !== 'paid' && (
                    <TouchableOpacity
                      style={[styles.payBtn, isPaying && styles.payBtnDisabled]}
                      onPress={() => handlePay(invoice)}
                      disabled={isPaying}
                    >
                      {isPaying ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.payBtnText}>Pay Now</Text>
                      )}
                    </TouchableOpacity>
                  )}
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

function BannerStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.bannerStatItem}>
      <Text style={[styles.bannerStatVal, { color }]}>{value}</Text>
      <Text style={styles.bannerStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },
  bannerCard: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius, padding: SIZES.lg,
    marginBottom: SIZES.md, ...SHADOWS.medium,
  },
  bannerMain: { marginBottom: SIZES.md },
  bannerLabel: { ...FONTS.body2, color: 'rgba(255,255,255,0.7)' },
  bannerAmount: { fontSize: 34, fontWeight: '800', color: '#fff', marginTop: 4 },
  bannerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: SIZES.md },
  bannerStats: { flexDirection: 'row', justifyContent: 'space-between' },
  bannerStatItem: { alignItems: 'center' },
  bannerStatVal: { ...FONTS.h4, fontWeight: '700' },
  bannerStatLabel: { ...FONTS.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  progressCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.md, ...SHADOWS.small,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  progressLabel: { ...FONTS.body2, color: COLORS.textSecondary },
  progressPct: { ...FONTS.body2, color: COLORS.primary, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SIZES.sm },
  invoiceCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  invoiceTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.sm, gap: SIZES.sm },
  invoiceTitle: { ...FONTS.body1, color: COLORS.textDark, fontWeight: '600' },
  invoiceCategory: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound },
  statusText: { fontSize: 12, fontWeight: '700' },
  invoiceBottom: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  amountLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  amountValue: { ...FONTS.h4, color: COLORS.textDark, fontWeight: '700' },
  dueDate: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500' },
  payBtn: {
    marginLeft: 'auto' as any, backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm, minWidth: 80, alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
