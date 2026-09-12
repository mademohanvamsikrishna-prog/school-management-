/**
 * ParentDashboard — Acade-style visual redesign.
 *
 * DESIGN ONLY: All API calls, hooks, services, routing, and ChildSelector logic are unchanged.
 * Sidebar is owned by _layout.tsx — this file renders only the main content area.
 */
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingScreen } from '../../components/ScreenStates';
import { DonutChart } from '../../components/DonutChart';
import { ChildSelector } from '../../components/ChildSelector';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getDashboardSummary } from '../../services/dashboard';
import { getEvents } from '../../services/events';
import { getMyProfile } from '../../services/profile';
import { getStudentInvoices } from '../../services/finance';

const IS_WEB = Platform.OS === 'web';

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // ─── All existing API hooks (unchanged) ──────────────────────────────────
  const { data: summary, loading: summaryLoading } = useApi(getDashboardSummary);
  const { data: events, loading: eventsLoading } = useApi(() => getEvents(true));
  const { data: profile, loading: profileLoading } = useApi(getMyProfile);

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const children = profile?.parent_profile?.children || [];

  // Automatically select the first child when data loads (unchanged logic)
  if (children.length > 0 && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const { data: invoices, loading: invoicesLoading } = useApi(
    async () => {
      if (!selectedChildId) return [];
      return getStudentInvoices(selectedChildId);
    },
    [selectedChildId]
  );

  // ─── Derived values ───────────────────────────────────────────────────────
  const firstName = user?.name?.split(' ')[0] ?? 'Parent';
  const selectedChildSummary = summary?.children_summaries?.find(c => c.id === selectedChildId);
  const selectedChild = children.find(c => c.id === selectedChildId);
  const attendancePct = selectedChildSummary?.attendance_percentage ?? 0;

  const pendingFees = invoices?.filter(f => f.status !== 'paid') ?? [];
  const totalDue = pendingFees.reduce((sum, f) => sum + (f.amount ?? 0), 0);

  const isLoading = summaryLoading || eventsLoading || profileLoading || invoicesLoading;

  if (isLoading || !summary || !user || !profile) {
    return <LoadingScreen message="Loading Dashboard..." />;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {IS_WEB ? (
        // ══════════════════════════════════════
        // WEB — sidebar owned by _layout.tsx
        // ══════════════════════════════════════
        <View style={styles.webMain}>
          {/* Top header bar */}
          <WebHeader user={user} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.webContentPad}>
            {/* Welcome */}
            <View style={styles.welcomeRow}>
              <Text style={styles.welcomeTitle}>Welcome, {firstName} 👋</Text>
              <Text style={styles.welcomeSub}>Parent Portal</Text>
            </View>

            {/* Child Selector */}
            {children.length > 0 && (
              <ChildSelector
                childrenList={children as any}
                selectedChildId={selectedChildId || ''}
                onSelectChild={setSelectedChildId}
              />
            )}

            {/* ATTENDANCE + NOTICE BOARD */}
            <View style={styles.gridRow}>
              {/* Child Attendance Donut */}
              <View style={[styles.card, styles.donutCard]}>
                <Text style={styles.cardTitle}>
                  {selectedChild?.name.split(' ')[0] ?? 'Child'}'s Attendance
                </Text>
                <Text style={styles.cardSub}>This Semester</Text>
                <View style={styles.donutWrap}>
                  <DonutChart
                    percentage={attendancePct}
                    size={150}
                    strokeWidth={16}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.legend}>
                  <LegendDot color={COLORS.primary} label="Present" />
                  <LegendDot color="#F59E0B"         label="Not marked" />
                  <LegendDot color="#E2E8F0"         label="Absent" />
                </View>
              </View>

              {/* Notice Board */}
              <View style={[styles.card, styles.noticeCard]}>
                <Text style={styles.cardTitle}>Notice board</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {events && events.length > 0 ? (
                    events.slice(0, 6).map((ev, idx) => (
                      <NoticeItem key={ev.id} event={ev} idx={idx} />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No notices.</Text>
                  )}
                </ScrollView>
              </View>
            </View>

            {/* FEES + QUICK STATS */}
            <View style={styles.gridRow}>
              {/* Fee Summary */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Fee Summary</Text>
                <Text style={styles.cardSub}>
                  {pendingFees.length > 0 ? `₹${totalDue} pending` : 'All fees paid ✓'}
                </Text>
                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  {invoices && invoices.length > 0 ? (
                    invoices.slice(0, 4).map((fee) => (
                      <FeeLine key={fee.id} fee={fee} onPress={() => router.push('/parents/fees')} />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No fee records.</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.payBtn} onPress={() => router.push('/parents/fees')}>
                  <Text style={styles.payBtnText}>View All Fees →</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Stats */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Quick Stats</Text>
                <Text style={styles.cardSub}>Your child's overview</Text>
                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  <StatRow label="Attendance" value={`${attendancePct}%`} color={COLORS.primary} />
                  <StatRow label="Pending Fees" value={`₹${totalDue}`} color={totalDue > 0 ? COLORS.error : COLORS.success} />
                  <StatRow label="Total Invoices" value={invoices?.length ?? 0} color={COLORS.info} />
                  {children.length > 1 && (
                    <StatRow label="Children" value={children.length} color={COLORS.primary} />
                  )}
                </View>
              </View>
            </View>

            <View style={{ height: SIZES.xl }} />
          </ScrollView>
        </View>
      ) : (
        // ══════════════════════════════════════
        // MOBILE
        // ══════════════════════════════════════
        <>
          <MobileHeader user={user} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mobileContent}>
            {children.length > 0 && (
              <ChildSelector
                childrenList={children as any}
                selectedChildId={selectedChildId || ''}
                onSelectChild={setSelectedChildId}
              />
            )}

            <SectionLabel label="ATTENDANCE" actionText="Details" onAction={() => router.push('/parents/children')} />
            <View style={[styles.card, { alignItems: 'center', paddingVertical: SIZES.xl }]}>
              <DonutChart percentage={attendancePct} size={130} strokeWidth={14} />
              <Text style={[styles.cardSub, { marginTop: SIZES.sm }]}>
                {selectedChild?.name.split(' ')[0] ?? 'Child'}'s attendance this semester
              </Text>
            </View>

            <View style={styles.mobileStatsRow}>
              <View style={[styles.miniStatCard, { borderLeftColor: COLORS.primary }]}>
                <Text style={styles.miniStatVal}>{attendancePct}%</Text>
                <Text style={styles.miniStatLabel}>Attendance</Text>
              </View>
              <View style={[styles.miniStatCard, { borderLeftColor: COLORS.error }]}>
                <Text style={styles.miniStatVal}>₹{totalDue}</Text>
                <Text style={styles.miniStatLabel}>Pending</Text>
              </View>
            </View>

            <SectionLabel label="FEES" actionText="Pay Now" onAction={() => router.push('/parents/fees')} />
            <View style={[styles.card, { gap: SIZES.sm }]}>
              {invoices && invoices.length > 0 ? (
                invoices.slice(0, 3).map((fee) => (
                  <FeeLine key={fee.id} fee={fee} onPress={() => router.push('/parents/fees')} />
                ))
              ) : (
                <Text style={styles.emptyText}>No pending fees.</Text>
              )}
            </View>

            <SectionLabel label="NOTICE BOARD" actionText="View All" onAction={() => router.push('/parents/children')} />
            <View style={[styles.card, { gap: SIZES.md }]}>
              {events && events.length > 0 ? (
                events.slice(0, 4).map((ev, idx) => (
                  <NoticeItem key={ev.id} event={ev} idx={idx} />
                ))
              ) : (
                <Text style={styles.emptyText}>No upcoming events.</Text>
              )}
            </View>

            <SectionLabel label="QUICK ACTIONS" />
            <View style={styles.quickRow}>
              {[
                { label: 'Attendance', icon: '📅', route: '/parents/children' },
                { label: 'Marks',      icon: '📝', route: '/parents/children' },
                { label: 'Fees',       icon: '💳', route: '/parents/fees'     },
                { label: 'Profile',    icon: '👤', route: '/parents/profile'  },
              ].map((qa) => (
                <TouchableOpacity key={qa.label} style={styles.quickBtn} onPress={() => router.push(qa.route as any)}>
                  <Text style={{ fontSize: 26 }}>{qa.icon}</Text>
                  <Text style={styles.quickLabel}>{qa.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: SIZES.xxl }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function WebHeader({ user }: { user: { name: string; avatarUrl?: string } }) {
  const firstName = user.name.split(' ')[0];
  return (
    <View style={styles.webHeader}>
      <View style={{ flex: 1 }} />
      <View style={styles.webHeaderRight}>
        <TouchableOpacity style={styles.iconBtn}><Text style={{ fontSize: 18 }}>🔍</Text></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <View style={styles.userPill}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.pillAvatar} />
          ) : (
            <View style={[styles.pillAvatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{firstName[0]}</Text>
            </View>
          )}
          <Text style={styles.pillName}>{user.name}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>▾</Text>
        </View>
      </View>
    </View>
  );
}

function MobileHeader({ user }: { user: { name: string; avatarUrl?: string } }) {
  const firstName = user.name.split(' ')[0];
  return (
    <View style={styles.mobileHeader}>
      <View>
        <Text style={styles.mobileGreeting}>Welcome, {firstName} 👋</Text>
        <Text style={styles.mobileSub}>Parent Portal</Text>
      </View>
      <View style={styles.mobileHeaderRight}>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
          <View style={styles.bellDot} />
        </TouchableOpacity>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.mobileAvatar} />
        ) : (
          <View style={[styles.mobileAvatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{firstName[0]}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function SectionLabel({ label, actionText, onAction }: { label: string; actionText?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const NOTICE_COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#EC4899'];

function NoticeItem({ event, idx }: { event: any; idx: number }) {
  const accentColor = NOTICE_COLORS[idx % NOTICE_COLORS.length];
  return (
    <View style={styles.noticeItem}>
      <View style={[styles.noticeLine, { backgroundColor: accentColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.noticeAuthor, { color: accentColor }]} numberOfLines={1}>
          {event.type ? event.type.toUpperCase() : 'NOTICE'}
        </Text>
        <Text style={styles.noticeTitle} numberOfLines={2}>{event.title}</Text>
        {event.date ? <Text style={styles.noticeDate}>{event.date} · {event.time ?? ''}</Text> : null}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function FeeLine({ fee, onPress }: { fee: any; onPress: () => void }) {
  const isPaid = fee.status === 'paid';
  return (
    <TouchableOpacity style={styles.feeLine} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.feeName} numberOfLines={1}>{fee.title}</Text>
        <Text style={styles.feeDue}>Due: {fee.due_date}</Text>
      </View>
      <View style={[styles.feeChip, { backgroundColor: isPaid ? '#D1FAE5' : '#FEF3C7' }]}>
        <Text style={[styles.feeChipText, { color: isPaid ? '#065F46' : '#92400E' }]}>
          {isPaid ? 'Paid' : `₹${fee.amount}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function StatRow({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },

  webMain: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  webHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small, zIndex: 5,
  },
  webHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBtn: {
    padding: SIZES.sm, borderRadius: SIZES.radiusSm,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border,
  },
  notifDot: {
    position: 'absolute', top: 6, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.card,
  },
  userPill: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#F8FAFC', borderRadius: SIZES.radiusRound,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SIZES.sm, paddingVertical: 6,
  },
  pillAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.background },
  pillName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },
  webContentPad: { padding: SIZES.xl },

  welcomeRow: { marginBottom: SIZES.lg },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.3 },
  welcomeSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SIZES.sm, marginTop: SIZES.xs,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  sectionAction: { ...FONTS.body2, color: COLORS.primary, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small, marginBottom: SIZES.md,
  },
  cardTitle: { ...FONTS.h4, color: COLORS.textDark, marginBottom: 2 },
  cardSub: { ...FONTS.caption, color: COLORS.textSecondary },

  gridRow: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.xs },
  donutCard: { width: 280, alignItems: 'center' },
  noticeCard: { flex: 1, maxHeight: 300 },
  donutWrap: { marginTop: SIZES.md, marginBottom: SIZES.md },

  legend: { flexDirection: 'row', gap: SIZES.md, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...FONTS.caption, color: COLORS.textSecondary },

  noticeItem: {
    flexDirection: 'row', gap: SIZES.sm,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  noticeLine: { width: 3, borderRadius: 4, alignSelf: 'stretch' },
  noticeAuthor: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  noticeTitle: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500', lineHeight: 18 },
  noticeDate: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },

  feeLine: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  feeName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500' },
  feeDue: { ...FONTS.caption, color: COLORS.textLight, marginTop: 1 },
  feeChip: { borderRadius: 12, paddingHorizontal: SIZES.sm, paddingVertical: 3 },
  feeChipText: { fontSize: 11, fontWeight: '700' },
  payBtn: {
    marginTop: SIZES.md, backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm, paddingVertical: SIZES.sm,
    alignItems: 'center',
  },
  payBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  statRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statLabel: { flex: 1, ...FONTS.body2, color: COLORS.textSecondary },
  statValue: { ...FONTS.body2, fontWeight: '700' },

  // Mobile
  mobileHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  mobileGreeting: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  mobileSub: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  mobileHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  bellBtn: {
    position: 'relative', padding: SIZES.sm,
    backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  bellDot: {
    position: 'absolute', top: 6, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.card,
  },
  mobileAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: COLORS.primary },
  mobileContent: { padding: SIZES.md },
  mobileStatsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  miniStatCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    padding: SIZES.md, borderLeftWidth: 3, ...SHADOWS.small,
  },
  miniStatVal: { ...FONTS.h3, color: COLORS.textDark },
  miniStatLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, justifyContent: 'space-between', marginBottom: SIZES.md },
  quickBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.md, width: '22%', aspectRatio: 1,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  quickLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textDark, textAlign: 'center', marginTop: 4 },
  emptyText: { ...FONTS.body2, color: COLORS.textLight, fontStyle: 'italic' },
});
