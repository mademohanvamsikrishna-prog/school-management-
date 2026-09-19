/**
 * Fees — redesigned Fee Management dashboard.
 * Data: GET /finance/student/{id}/invoices
 * Payment: POST /finance/pay/simulate
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

const STATUS_CFG: Record<FeeInvoice['status'], { label: string; color: string; bg: string }> = {
  paid:    { label: 'Paid',    color: '#10B981', bg: '#ECFDF5' },
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  overdue: { label: 'Overdue', color: '#EF4444', bg: '#FEF2F2' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDate(s: string): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FeesScreen() {
  const { user } = useAuth();
  const { data: invoices, loading, error, refetch } = useApi(
    async () => (user ? getStudentInvoices(user.id) : []),
    [user],
  );
  const [payingId, setPayingId] = useState<string | null>(null);

  // ── Summary numbers ──────────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!invoices) return { total: 0, paid: 0, pending: 0, overdue: 0, outstanding: 0 };
    const total   = invoices.reduce((s, i) => s + i.amount, 0);
    const paid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
    return { total, paid, pending, overdue, outstanding: pending + overdue };
  }, [invoices]);

  const nextDue = useMemo(() => {
    if (!invoices) return null;
    const unpaid = invoices
      .filter(i => i.status !== 'paid' && i.due_date)
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
    return unpaid.length > 0 ? unpaid[0].due_date : null;
  }, [invoices]);

  const paidPct    = pct(summary.paid, summary.total);
  const pendingPct = 100 - paidPct;

  const paidInvoices = useMemo(
    () => (invoices ?? []).filter(i => i.status === 'paid').sort((a, b) => b.due_date.localeCompare(a.due_date)),
    [invoices],
  );
  const unpaidInvoices = useMemo(
    () => (invoices ?? []).filter(i => i.status !== 'paid'),
    [invoices],
  );

  // ── Preserve existing payment flow exactly ────────────────────────────────
  const handlePay = async (invoice: FeeInvoice) => {
    const confirmed = IS_WEB
      ? window.confirm(`Simulate payment of ₹${invoice.amount} for "${invoice.title}"?`)
      : await new Promise<boolean>(resolve =>
          Alert.alert(
            'Pay Now',
            `Simulate payment of ₹${invoice.amount} for "${invoice.title}"?`,
            [
              { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Pay', onPress: () => resolve(true) },
            ],
          ),
        );
    if (!confirmed) return;

    setPayingId(invoice.id);
    try {
      await simulatePayment(invoice.id, invoice.amount);
      if (IS_WEB) {
        window.alert('✅ Payment Recorded — Simulated payment recorded successfully.');
      } else {
        Alert.alert('✅ Payment Recorded', `Simulated payment of ₹${invoice.amount} recorded.`);
      }
      refetch();
    } catch {
      if (IS_WEB) {
        window.alert('Error: Failed to process payment. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to process payment. Please try again.');
      }
    } finally {
      setPayingId(null);
    }
  };

  const handlePayFees = () => {
    const first = unpaidInvoices[0];
    if (first) handlePay(first);
  };

  // ── Early returns ─────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen message="Loading fee information..." />;
  if (error)   return <ErrorScreen error={error} onRetry={refetch} />;

  const noData  = !invoices || invoices.length === 0;
  const allPaid = !noData && summary.outstanding === 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* ══ 1. HEADER ════════════════════════════════════════════════════ */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.iconBox}>
              <Text style={s.iconText}>💳</Text>
            </View>
            <View>
              <Text style={s.pageTitle}>Fee Management</Text>
              <Text style={s.pageSub}>View your fee details, payments, and upcoming dues.</Text>
            </View>
          </View>
        </View>

        {/* ══ 2. SUMMARY STAT CARDS ═══════════════════════════════════════ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsScroll}>
          <View style={s.statsRow}>
            <FeeStatCard
              icon="💰" iconBg="#EDE9FE"
              label="Total Fees"
              value={fmtCurrency(summary.total)}
              sub="For current academic year"
            />
            <FeeStatCard
              icon="✅" iconBg="#DCFCE7"
              label="Paid Amount"
              value={fmtCurrency(summary.paid)}
              sub={`${paidPct}% of total fees`}
              valueColor="#10B981"
            />
            <FeeStatCard
              icon="⏳" iconBg="#FEF9C3"
              label="Pending Amount"
              value={fmtCurrency(summary.outstanding)}
              sub={`${pendingPct}% remaining`}
              valueColor={summary.outstanding > 0 ? '#F59E0B' : '#10B981'}
            />
            <FeeStatCard
              icon="📅" iconBg="#DBEAFE"
              label="Next Due Date"
              value={nextDue ? fmtDate(nextDue) : 'No dues'}
              sub={nextDue ? 'Upcoming payment' : 'All clear!'}
              valueColor={nextDue ? '#4F46E5' : '#10B981'}
            />
          </View>
        </ScrollView>

        {/* ══ 3. OUTSTANDING BALANCE CARD ═════════════════════════════════ */}
        {noData ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>💳</Text>
            <Text style={s.emptyTitle}>No fee records</Text>
            <Text style={s.emptySub}>No fee invoices found for your account.</Text>
          </View>
        ) : allPaid ? (
          <View style={[s.balanceCard, s.balanceCardAllPaid]}>
            <View style={s.allPaidRow}>
              <Text style={{ fontSize: 32 }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.balanceTitlePaid}>Outstanding Balance</Text>
                <Text style={s.allPaidHeading}>All fees paid!</Text>
                <Text style={s.allPaidSub}>You're fully up to date with all payments.</Text>
              </View>
              <View style={s.allPaidBadge}>
                <Text style={s.allPaidBadgeText}>✓  Paid</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={s.balanceCard}>
            <View style={[s.balanceInner, IS_WEB && s.balanceInnerWeb]}>
              {/* Left — amount + button */}
              <View style={s.balanceLeft}>
                <Text style={s.balanceTitle}>Outstanding Balance</Text>
                <Text style={s.balanceAmount}>{fmtCurrency(summary.outstanding)}</Text>
                <Text style={s.balanceReminder}>
                  Please complete your pending payment before the due date.
                </Text>
                <TouchableOpacity
                  style={[s.payFeesBtn, payingId !== null && s.payFeesBtnDisabled]}
                  onPress={handlePayFees}
                  disabled={payingId !== null}
                  accessibilityLabel="Pay outstanding fees"
                >
                  {payingId ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={s.payFeesBtnText}>Pay Fees  →</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Right — progress */}
              <View style={s.balanceRight}>
                <View style={s.progressLabelRow}>
                  <Text style={s.progressLabelGreen}>{paidPct}% paid</Text>
                  <Text style={s.progressLabelGray}>{pendingPct}% remaining</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${paidPct}%` as any }]} />
                </View>
                <View style={s.progressMetaRow}>
                  <Text style={s.progressMetaL}>{fmtCurrency(summary.paid)} paid</Text>
                  <Text style={s.progressMetaR}>{fmtCurrency(summary.outstanding)} pending</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ══ 4. FEE BREAKDOWN + PAYMENT OVERVIEW ═════════════════════════ */}
        {!noData && (
          <View style={[s.twoCol, IS_WEB && s.twoColWeb]}>

            {/* Fee Breakdown */}
            <View style={[s.sectionCard, IS_WEB && s.breakdownCardWeb]}>
              <CardHeader icon="📋" title="Fee Breakdown" sub="Detailed view of your fee components" />

              {/* Column headers */}
              <View style={s.tableHead}>
                <Text style={[s.thCell, s.tcName]}>Fee Component</Text>
                <Text style={[s.thCell, s.tcAmt]}>Amount</Text>
                <Text style={[s.thCell, s.tcStatus]}>Status</Text>
              </View>

              {invoices!.map((inv, idx) => {
                const cfg = STATUS_CFG[inv.status];
                return (
                  <View
                    key={inv.id}
                    style={[s.tableRow, idx % 2 === 1 && s.tableRowAlt]}
                  >
                    <View style={s.tcName}>
                      <Text style={s.tdName} numberOfLines={2}>{inv.title}</Text>
                      {inv.category_name ? (
                        <Text style={s.tdSub}>{inv.category_name}</Text>
                      ) : null}
                    </View>
                    <Text style={[s.tdAmt, s.tcAmt]}>{fmtCurrency(inv.amount)}</Text>
                    <View style={s.tcStatus}>
                      <StatusBadge status={inv.status} />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Payment Overview */}
            <View style={[s.sectionCard, IS_WEB && s.overviewCardWeb]}>
              <CardHeader icon="📊" title="Payment Overview" sub="Visual summary of your fee payments" />
              <PaymentOverview
                paidPct={paidPct}
                pendingPct={pendingPct}
                paid={summary.paid}
                outstanding={summary.outstanding}
                total={summary.total}
              />
            </View>
          </View>
        )}

        {/* ══ 5. RECENT TRANSACTIONS ══════════════════════════════════════ */}
        <View style={s.sectionCard}>
          <CardHeader icon="🧾" title="Recent Transactions" sub="Your latest fee payment history" />

          {paidInvoices.length === 0 ? (
            <View style={s.transEmpty}>
              <Text style={s.transEmptyIcon}>📭</Text>
              <Text style={s.transEmptyText}>No payment transactions yet.</Text>
            </View>
          ) : IS_WEB ? (
            <>
              <View style={s.transHead}>
                <Text style={[s.transThCell, s.ttId]}>Receipt ID</Text>
                <Text style={[s.transThCell, s.ttDate]}>Date</Text>
                <Text style={[s.transThCell, s.ttDesc]}>Description</Text>
                <Text style={[s.transThCell, s.ttAmt]}>Amount</Text>
                <Text style={[s.transThCell, s.ttStatus]}>Status</Text>
              </View>
              {paidInvoices.map((inv, idx) => {
                const receiptId = `RCP-${inv.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;
                return (
                  <View key={inv.id} style={[s.transRow, idx % 2 === 1 && s.transRowAlt]}>
                    <Text style={[s.transTd, s.ttId, s.ttIdText]}>{receiptId}</Text>
                    <Text style={[s.transTd, s.ttDate]}>{fmtDate(inv.due_date)}</Text>
                    <Text style={[s.transTd, s.ttDesc]} numberOfLines={2}>{inv.title}</Text>
                    <Text style={[s.transTd, s.ttAmt, s.transTdBold]}>{fmtCurrency(inv.amount)}</Text>
                    <View style={s.ttStatus}>
                      <View style={s.successBadge}>
                        <Text style={s.successBadgeText}>✓  Successful</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
            paidInvoices.map(inv => {
              const receiptId = `RCP-${inv.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;
              return (
                <View key={inv.id} style={s.transMobileCard}>
                  <View style={s.transMobileTop}>
                    <Text style={s.transMobileId}>{receiptId}</Text>
                    <View style={s.successBadge}>
                      <Text style={s.successBadgeText}>✓  Paid</Text>
                    </View>
                  </View>
                  <Text style={s.transMobileDesc}>{inv.title}</Text>
                  <View style={s.transMobileBottom}>
                    <Text style={s.transMobileDate}>{fmtDate(inv.due_date)}</Text>
                    <Text style={s.transMobileAmt}>{fmtCurrency(inv.amount)}</Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Outstanding invoices with Pay Now buttons */}
          {unpaidInvoices.length > 0 && (
            <View style={s.unpaidSection}>
              <Text style={s.unpaidSectionLabel}>OUTSTANDING INVOICES</Text>
              {unpaidInvoices.map(inv => {
                const cfg = STATUS_CFG[inv.status];
                const isPaying = payingId === inv.id;
                return (
                  <View key={inv.id} style={s.unpaidRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.unpaidTitle}>{inv.title}</Text>
                      <Text style={s.unpaidDue}>Due: {fmtDate(inv.due_date)}</Text>
                    </View>
                    <Text style={[s.unpaidAmt, { color: cfg.color }]}>
                      {fmtCurrency(inv.amount)}
                    </Text>
                    <StatusBadge status={inv.status} />
                    <TouchableOpacity
                      style={[s.payNowBtn, (isPaying || payingId !== null) && s.payNowBtnDisabled]}
                      onPress={() => handlePay(inv)}
                      disabled={isPaying || payingId !== null}
                      accessibilityLabel={`Pay ${inv.title}`}
                    >
                      {isPaying ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={s.payNowBtnText}>Pay Now</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ══ 6. HELP CARD ═════════════════════════════════════════════════ */}
        <View style={s.helpCard}>
          <View style={s.helpIconBox}>
            <Text style={{ fontSize: 26 }}>🎧</Text>
          </View>
          <View style={s.helpBody}>
            <Text style={s.helpTitle}>Need help with a payment?</Text>
            <Text style={s.helpSub}>
              Contact the school accounts office or reach out to your class teacher.
            </Text>
          </View>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <View style={s.cardHeader}>
      <Text style={s.cardHeaderIcon}>{icon}</Text>
      <View>
        <Text style={s.cardTitle}>{title}</Text>
        <Text style={s.cardSub}>{sub}</Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: FeeInvoice['status'] }) {
  const cfg = STATUS_CFG[status];
  return (
    <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

interface FeeStatCardProps {
  icon: string; iconBg: string;
  label: string; value: string; sub: string;
  valueColor?: string;
}

function FeeStatCard({ icon, iconBg, label, value, sub, valueColor }: FeeStatCardProps) {
  return (
    <View style={s.statCard}>
      <View style={[s.statIconBox, { backgroundColor: iconBg }]}>
        <Text style={s.statIcon}>{icon}</Text>
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      <Text style={s.statSub}>{sub}</Text>
    </View>
  );
}

// Payment Overview — segmented bar + legend (cross-platform, no external libs)
interface PaymentOverviewProps {
  paidPct: number; pendingPct: number;
  paid: number; outstanding: number; total: number;
}

function PaymentOverview({ paidPct, pendingPct, paid, outstanding, total }: PaymentOverviewProps) {
  // Visual ring using the 4-border quadrant trick (cross-platform, no dependencies)
  const SIZE = 130;
  const STROKE = 18;
  const INNER = SIZE - STROKE * 2;

  const q1 = paidPct > 0;    // 0–25%
  const q2 = paidPct > 25;   // 25–50%
  const q3 = paidPct > 50;   // 50–75%
  const q4 = paidPct > 75;   // 75–100%

  const G = '#10B981';
  const GRAY = '#E9F0FB';

  return (
    <View style={s.overview}>
      {/* Donut ring */}
      <View style={s.overviewRingWrap}>
        <View
          style={[
            s.overviewRing,
            {
              width: SIZE, height: SIZE, borderRadius: SIZE / 2,
              borderWidth: STROKE,
              borderTopColor:    q1 ? G : GRAY,
              borderRightColor:  q2 ? G : GRAY,
              borderBottomColor: q3 ? G : GRAY,
              borderLeftColor:   q4 ? G : GRAY,
            },
          ]}
        />
        {/* Donut hole with centre label */}
        <View
          style={[
            s.overviewRingInner,
            { width: INNER, height: INNER, borderRadius: INNER / 2 },
          ]}
        >
          <Text style={s.overviewCenterVal}>{fmtCurrency(total)}</Text>
          <Text style={s.overviewCenterSub}>Total Fees</Text>
        </View>
      </View>

      {/* Segmented progress bar */}
      <View style={s.overviewBar}>
        {paidPct > 0 && (
          <View style={[s.overviewBarPaid, { flex: paidPct }]} />
        )}
        {pendingPct > 0 && (
          <View style={[s.overviewBarPending, { flex: pendingPct }]} />
        )}
      </View>

      {/* Legend */}
      <View style={s.legendWrap}>
        <View style={s.legendRow}>
          <View style={[s.legendDot, { backgroundColor: G }]} />
          <View style={{ flex: 1 }}>
            <Text style={s.legendLabel}>Paid Amount</Text>
            <Text style={s.legendValue}>
              {fmtCurrency(paid)} ({paidPct}%)
            </Text>
          </View>
        </View>
        <View style={s.legendRow}>
          <View style={[s.legendDot, { backgroundColor: '#F59E0B' }]} />
          <View style={{ flex: 1 }}>
            <Text style={s.legendLabel}>Pending Amount</Text>
            <Text style={s.legendValue}>
              {fmtCurrency(outstanding)} ({pendingPct}%)
            </Text>
          </View>
        </View>
        <View style={s.legendRow}>
          <View style={[s.legendDot, { backgroundColor: GRAY }]} />
          <View style={{ flex: 1 }}>
            <Text style={s.legendLabel}>Total Fees</Text>
            <Text style={s.legendValue}>{fmtCurrency(total)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },

  // ── Header
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SIZES.lg },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#EDE9FE', borderWidth: 1, borderColor: '#C4B5FD',
    justifyContent: 'center', alignItems: 'center',
  },
  iconText:  { fontSize: 26 },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark },
  pageSub:   { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  // ── Stat cards
  statsScroll: { marginBottom: SIZES.lg },
  statsRow:    { flexDirection: 'row', gap: SIZES.sm },
  statCard: {
    width: IS_WEB ? 200 : 168,
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

  // ── Balance card
  balanceCard: {
    backgroundColor: '#EEF2FF', borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: '#C7D2FE',
    padding: SIZES.lg, marginBottom: SIZES.lg, ...SHADOWS.small,
  },
  balanceCardAllPaid: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  balanceInner:    { flexDirection: 'column', gap: SIZES.lg },
  balanceInnerWeb: { flexDirection: 'row', gap: SIZES.xl, alignItems: 'center' },
  balanceLeft:  { flex: 1 },
  balanceRight: { flex: IS_WEB ? 1 : 0 },

  balanceTitle: { ...FONTS.h4, color: '#4F46E5', marginBottom: SIZES.xs },
  balanceTitlePaid: { ...FONTS.h4, color: '#16A34A', marginBottom: SIZES.xs },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: '#4F46E5', letterSpacing: -0.5, marginBottom: SIZES.sm },
  balanceReminder: { ...FONTS.caption, color: '#6366F1', marginBottom: SIZES.md },

  payFeesBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#4F46E5', paddingHorizontal: SIZES.lg,
    paddingVertical: 10, borderRadius: SIZES.radiusSm, minWidth: 120,
    alignItems: 'center', ...SHADOWS.small,
  },
  payFeesBtnDisabled: { opacity: 0.6 },
  payFeesBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  allPaidRow:    { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  allPaidHeading: { fontSize: 20, fontWeight: '800', color: '#16A34A', marginBottom: 4 },
  allPaidSub:    { ...FONTS.caption, color: '#15803D' },
  allPaidBadge:  { backgroundColor: '#16A34A', paddingHorizontal: SIZES.md, paddingVertical: 6, borderRadius: SIZES.radiusRound },
  allPaidBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.xs },
  progressLabelGreen: { ...FONTS.caption, color: '#10B981', fontWeight: '700' },
  progressLabelGray:  { ...FONTS.caption, color: COLORS.textSecondary },
  progressTrack: {
    height: 10, backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5, overflow: 'hidden', marginBottom: SIZES.xs,
  },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 5 },
  progressMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMetaL: { ...FONTS.caption, color: '#10B981', fontWeight: '600' },
  progressMetaR: { ...FONTS.caption, color: '#F59E0B', fontWeight: '600' },

  // ── Two-column layout
  twoCol:    { gap: SIZES.md, marginBottom: SIZES.md },
  twoColWeb: { flexDirection: 'row', alignItems: 'flex-start' },

  // ── Shared section card
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SIZES.md, ...SHADOWS.small, overflow: 'hidden',
  },
  breakdownCardWeb: { flex: 3, marginBottom: 0 },
  overviewCardWeb:  { flex: 2, marginBottom: 0 },

  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm,
    padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  cardHeaderIcon: { fontSize: 18, marginTop: 2 },
  cardTitle: { ...FONTS.h4, color: COLORS.textDark },
  cardSub:   { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },

  // ── Fee breakdown table
  tableHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  thCell:    { ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '700' },
  tableRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  tcName:   { flex: 3, paddingRight: SIZES.sm },
  tcAmt:    { flex: 2, textAlign: 'right' as any, paddingRight: SIZES.sm },
  tcStatus: { flex: 2, alignItems: 'flex-end' },
  tdName:   { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },
  tdSub:    { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  tdAmt:    { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },

  // ── Status badge
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: SIZES.radiusRound, alignSelf: 'flex-start',
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  // ── Payment Overview
  overview: { padding: SIZES.md, alignItems: 'center' },

  overviewRingWrap: {
    width: 130, height: 130, position: 'relative',
    justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md,
  },
  overviewRing: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  overviewRingInner: {
    position: 'absolute',
    backgroundColor: COLORS.card,
    justifyContent: 'center', alignItems: 'center',
  },
  overviewCenterVal: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, textAlign: 'center' },
  overviewCenterSub: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },

  overviewBar: {
    width: '100%', height: 8, borderRadius: 4,
    flexDirection: 'row', overflow: 'hidden',
    backgroundColor: '#E9F0FB', marginBottom: SIZES.md,
  },
  overviewBarPaid:    { backgroundColor: '#10B981', borderRadius: 4 },
  overviewBarPending: { backgroundColor: '#F59E0B', borderRadius: 4 },

  legendWrap: { width: '100%', gap: SIZES.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...FONTS.caption, color: COLORS.textSecondary },
  legendValue: { ...FONTS.caption, color: COLORS.textDark, fontWeight: '600' },

  // ── Transactions
  transEmpty: { padding: SIZES.xl, alignItems: 'center', gap: SIZES.sm },
  transEmptyIcon: { fontSize: 36 },
  transEmptyText: { ...FONTS.body2, color: COLORS.textSecondary },

  transHead: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  transThCell: { ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '700' },
  transRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
  transRowAlt: { backgroundColor: '#FAFAFA' },
  transTd:     { ...FONTS.caption, color: COLORS.textDark },
  transTdBold: { fontWeight: '700' },
  ttId:        { flex: 2 },
  ttDate:      { flex: 2 },
  ttDesc:      { flex: 3 },
  ttAmt:       { flex: 2, textAlign: 'right' as any },
  ttStatus:    { flex: 2, alignItems: 'flex-end' },
  ttIdText:    { color: '#4F46E5', fontWeight: '600' },

  successBadge:     { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusRound },
  successBadgeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },

  // Mobile transaction card
  transMobileCard: {
    padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  transMobileTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  transMobileId:     { ...FONTS.caption, color: '#4F46E5', fontWeight: '600' },
  transMobileDesc:   { ...FONTS.body2, color: COLORS.textDark, marginBottom: 4 },
  transMobileBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transMobileDate:   { ...FONTS.caption, color: COLORS.textSecondary },
  transMobileAmt:    { ...FONTS.body2, fontWeight: '700', color: COLORS.textDark },

  // Outstanding invoices
  unpaidSection: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    marginTop: SIZES.sm, paddingTop: SIZES.sm,
  },
  unpaidSectionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 1, marginHorizontal: SIZES.md, marginBottom: SIZES.sm,
  },
  unpaidRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  unpaidTitle:  { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },
  unpaidDue:    { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  unpaidAmt:    { ...FONTS.body2, fontWeight: '700' },
  payNowBtn: {
    backgroundColor: '#4F46E5', paddingHorizontal: SIZES.md,
    paddingVertical: 6, borderRadius: SIZES.radiusSm, minWidth: 80, alignItems: 'center',
  },
  payNowBtnDisabled: { opacity: 0.5 },
  payNowBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // ── Help card
  helpCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: '#EEF2FF', borderRadius: SIZES.radius,
    padding: SIZES.lg, borderWidth: 1, borderColor: '#C7D2FE', ...SHADOWS.small,
  },
  helpIconBox: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
  },
  helpBody:  { flex: 1 },
  helpTitle: { fontSize: 15, fontWeight: '700', color: '#312E81', marginBottom: 4 },
  helpSub:   { ...FONTS.caption, color: '#4F46E5' },

  // ── Empty state
  emptyCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.xl, alignItems: 'center', gap: SIZES.sm,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.lg, ...SHADOWS.small,
  },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub:   { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
