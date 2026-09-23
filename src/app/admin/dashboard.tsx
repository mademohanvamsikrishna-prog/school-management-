/**
 * AdminDashboard — Premium School Management Portal
 *
 * Visual design mirrors the Student Dashboard:
 *  - Slate/indigo color palette (#F8FAFC background, #4F46E5 accent)
 *  - Top navbar with breadcrumb + search + profile pill
 *  - Dynamic StatCards for: Total Students, Teachers, Attendance Rate, Fee Collection Rate
 *  - DonutChart for attendance distribution
 *  - Finance KPI row + breakdown cards
 *  - Quick Action cards with accent borders
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getAnalyticsOverview, AnalyticsOverview } from '../../services/admin';

const IS_WEB = Platform.OS === 'web';

// ── Palette (mirrors student dashboard) ─────────────────────────────────────
const P = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  indigo: '#4F46E5',
  indigoBg: '#EEF2FF',
  green: '#10B981',
  greenBg: '#ECFDF5',
  amber: '#F59E0B',
  amberBg: '#FFFBEB',
  red: '#EF4444',
  redBg: '#FEF2F2',
  cyan: '#0891B2',
  cyanBg: '#ECFEFF',
  purple: '#7C3AED',
  purpleBg: '#F5F3FF',
};

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  accent: string;
  accentBg: string;
  trend?: string;
  trendUp?: boolean;
}

function AdminStatCard({ title, value, subtitle, icon, accent, accentBg, trend, trendUp }: StatCardProps) {
  return (
    <View style={[styles.statCard]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconBg, { backgroundColor: accentBg }]}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>
        {trend && (
          <View style={[styles.trendPill, { backgroundColor: trendUp ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.trendText, { color: trendUp ? '#15803D' : '#DC2626' }]}>
              {trendUp ? '↑' : '↓'} {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ── MiniDonut ─────────────────────────────────────────────────────────────────
// Pure CSS-style visual (web-safe progress ring using borders)
function AttendanceRing({ pct }: { pct: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  if (!IS_WEB) {
    // Native fallback: progress bar
    return (
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: P.indigo }}>{pct}%</Text>
        <View style={{ width: '100%', height: 8, backgroundColor: P.indigoBg, borderRadius: 4 }}>
          <View style={{ width: `${pct}%` as any, height: 8, backgroundColor: P.indigo, borderRadius: 4 }} />
        </View>
        <Text style={{ fontSize: 12, color: P.textSec }}>Present rate</Text>
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#EEF2FF" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke="#4F46E5" strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: P.indigo }}>{pct}%</Text>
        <Text style={{ fontSize: 9, color: P.textSec, fontWeight: '600' }}>PRESENT</Text>
      </View>
    </View>
  );
}

// ── QuickAction ───────────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: string;
  label: string;
  desc: string;
  accent: string;
  accentBg: string;
  onPress: () => void;
}

function QuickAction({ icon, label, desc, accent, accentBg, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={[styles.quickAction, { borderLeftColor: accent, borderLeftWidth: 3 }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.qaIconBg, { backgroundColor: accentBg }]}>
        <Text style={styles.qaIcon}>{icon}</Text>
      </View>
      <View style={styles.qaText}>
        <Text style={styles.qaLabel}>{label}</Text>
        <Text style={styles.qaDesc}>{desc}</Text>
      </View>
      <Text style={[styles.qaArrow, { color: accent }]}>›</Text>
    </TouchableOpacity>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const isDesktop = width >= 1024;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsOverview();
      setAnalytics(data);
    } catch (e) {
      console.warn('Analytics load failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => {
    if (IS_WEB) {
      if (window.confirm('Logout from the admin portal?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Logout', 'Exit the admin portal?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
      ]);
    }
  };

  const s = analytics;
  const attRate = s?.attendance.overall_percentage ?? 0;
  const collRate = s?.finance.collection_rate ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      {IS_WEB && (
        <View style={styles.topNavbar}>
          <View>
            <Text style={styles.navBreadcrumb}>PORTAL / ADMIN / OVERVIEW</Text>
            <Text style={styles.navHeading}>Principal Dashboard</Text>
          </View>

          <View style={styles.navRight}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Search students, teachers, classes...</Text>
            </View>

            <TouchableOpacity
              style={styles.navIconBtn}
              onPress={() => router.push('/admin/analytics' as any)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 18 }}>📊</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profilePill} onPress={handleLogout} activeOpacity={0.85}>
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInit}>{user?.name?.[0] ?? 'A'}</Text>
              </View>
              <View>
                <Text style={styles.pillName}>{user?.name ?? 'Admin'}</Text>
                <Text style={styles.pillRole}>Principal · Admin</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={IS_WEB ? ({ flex: 1, height: '100%', overflowY: 'auto' } as any) : { flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, isDesktop ? styles.desktopScroll : styles.mobileScroll]}
      >
        {/* ── Welcome Banner ──────────────────────────────────────────────── */}
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={styles.welcomeGreeting}>Good morning, Principal 👋</Text>
            <Text style={styles.welcomeSub}>Here's your school overview for today · Academic Year 2026–2027</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={load} activeOpacity={0.8}>
            <Text style={styles.refreshText}>⟳ Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* ── KPI Stat Cards ───────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" color={P.indigo} />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <AdminStatCard
                title="Total Students"
                value={s?.enrollment.students ?? 0}
                subtitle="Active enrolments"
                icon="🎓"
                accent={P.indigo}
                accentBg={P.indigoBg}
                trend="12 new"
                trendUp={true}
              />
              <AdminStatCard
                title="Total Teachers"
                value={s?.enrollment.teachers ?? 0}
                subtitle="Academic staff"
                icon="👩‍🏫"
                accent={P.purple}
                accentBg={P.purpleBg}
              />
              <AdminStatCard
                title="Attendance Rate"
                value={`${attRate}%`}
                subtitle={`${s?.attendance.present_records ?? 0} present today`}
                icon="📊"
                accent={attRate >= 75 ? P.green : P.amber}
                accentBg={attRate >= 75 ? P.greenBg : P.amberBg}
                trend={`${attRate}% overall`}
                trendUp={attRate >= 75}
              />
              <AdminStatCard
                title="Fee Collection"
                value={`${collRate}%`}
                subtitle={`₹${(s?.finance.total_collected ?? 0).toLocaleString('en-IN')} collected`}
                icon="💳"
                accent={P.cyan}
                accentBg={P.cyanBg}
                trend={`₹${(s?.finance.total_outstanding ?? 0).toLocaleString('en-IN')} pending`}
                trendUp={collRate >= 70}
              />
              <AdminStatCard
                title="Total Classes"
                value={s?.enrollment.classes ?? 0}
                subtitle="Active sections"
                icon="🏫"
                accent={P.amber}
                accentBg={P.amberBg}
              />
              <AdminStatCard
                title="Parents"
                value={s?.enrollment.parents ?? 0}
                subtitle="Registered guardians"
                icon="👨‍👩‍👧"
                accent={P.green}
                accentBg={P.greenBg}
              />
            </View>

            {/* ── Analytics Row (Donut + Finance Breakdown) ────────────────── */}
            <View style={[styles.analyticsRow, isDesktop && styles.analyticsRowDesktop]}>
              {/* Attendance Donut */}
              <View style={[styles.analyticsCard, styles.donutCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Attendance Overview</Text>
                  <View style={[styles.liveBadge]}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                  </View>
                </View>
                <View style={styles.donutCenter}>
                  <AttendanceRing pct={attRate} />
                </View>
                <View style={styles.donutLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: P.indigo }]} />
                    <Text style={styles.legendLabel}>Present — {s?.attendance.present_records ?? 0}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FCA5A5' }]} />
                    <Text style={styles.legendLabel}>
                      Absent — {(s?.attendance.total_records ?? 0) - (s?.attendance.present_records ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Finance Breakdown */}
              <View style={[styles.analyticsCard, styles.financeCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Finance Summary</Text>
                  <View style={[styles.statusBadge, { backgroundColor: P.cyanBg }]}>
                    <Text style={[styles.statusText, { color: P.cyan }]}>2026–2027</Text>
                  </View>
                </View>

                <View style={styles.finRow}>
                  <View style={styles.finLeft}>
                    <Text style={styles.finLabel}>Total Invoiced</Text>
                    <Text style={styles.finMeta}>All fee categories</Text>
                  </View>
                  <Text style={[styles.finAmount, { color: P.text }]}>
                    ₹{(s?.finance.total_invoiced ?? 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.finRow}>
                  <View style={styles.finLeft}>
                    <Text style={styles.finLabel}>Collected</Text>
                    <Text style={styles.finMeta}>Paid invoices</Text>
                  </View>
                  <Text style={[styles.finAmount, { color: P.green }]}>
                    ₹{(s?.finance.total_collected ?? 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.finRow}>
                  <View style={styles.finLeft}>
                    <Text style={styles.finLabel}>Outstanding</Text>
                    <Text style={styles.finMeta}>Pending + Overdue</Text>
                  </View>
                  <Text style={[styles.finAmount, { color: P.red }]}>
                    ₹{(s?.finance.total_outstanding ?? 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Collection Rate Progress Bar */}
                <View style={styles.progSection}>
                  <View style={styles.progHeader}>
                    <Text style={styles.progLabel}>Collection Rate</Text>
                    <Text style={[styles.progPct, { color: P.cyan }]}>{collRate}%</Text>
                  </View>
                  <View style={styles.progTrack}>
                    <View style={[styles.progFill, { width: `${collRate}%` as any, backgroundColor: P.cyan }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* ── Quick Actions ────────────────────────────────────────────── */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={[styles.actionsGrid, isDesktop && styles.actionsGridDesktop]}>
              <QuickAction
                icon="👥"
                label="Manage Users"
                desc="Add teachers, students, parents"
                accent={P.indigo}
                accentBg={P.indigoBg}
                onPress={() => router.push('/admin/users' as any)}
              />
              <QuickAction
                icon="🏫"
                label="Manage Classes"
                desc="Sections, rosters, teacher assignments"
                accent={P.purple}
                accentBg={P.purpleBg}
                onPress={() => router.push('/admin/classes' as any)}
              />
              <QuickAction
                icon="📊"
                label="Analytics"
                desc="Academic performance overview"
                accent={P.cyan}
                accentBg={P.cyanBg}
                onPress={() => router.push('/admin/analytics' as any)}
              />
              <QuickAction
                icon="🚪"
                label="Logout"
                desc="Exit admin portal"
                accent={P.red}
                accentBg={P.redBg}
                onPress={handleLogout}
              />
            </View>
          </>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: P.bg },

  // ── Navbar
  topNavbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 28, paddingVertical: 14,
    backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border,
  },
  navBreadcrumb: { fontSize: 11, fontWeight: '600', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  navHeading: { fontSize: 18, fontWeight: '800', color: P.text, letterSpacing: -0.3 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, minWidth: 280, borderWidth: 1, borderColor: P.border,
  },
  searchIcon: { fontSize: 13 },
  searchPlaceholder: { fontSize: 12, color: P.textMuted, fontWeight: '500' },
  navIconBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: P.bg,
    borderWidth: 1, borderColor: P.border, justifyContent: 'center', alignItems: 'center',
  },
  profilePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: P.bg, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 14, borderWidth: 1, borderColor: P.border,
  },
  avatarFallback: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: P.indigo, justifyContent: 'center', alignItems: 'center',
  },
  avatarInit: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  pillName: { fontSize: 12, fontWeight: '700', color: P.text },
  pillRole: { fontSize: 10, fontWeight: '500', color: P.textSec },

  // ── Scroll
  scroll: { paddingBottom: 40 },
  desktopScroll: { paddingHorizontal: 32, paddingTop: 28, maxWidth: 1400, alignSelf: 'center', width: '100%' },
  mobileScroll: { paddingHorizontal: 16, paddingTop: 20 },

  // ── Welcome Banner
  welcomeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: P.indigo, borderRadius: 16, padding: 20, marginBottom: 24,
  },
  welcomeGreeting: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  welcomeSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  refreshText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // ── Loading
  loadingRow: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  loadingText: { fontSize: 14, color: P.textSec },

  // ── Stat Cards
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  statCard: {
    backgroundColor: P.card, borderRadius: 16, padding: 18, flex: 1,
    minWidth: 160, borderWidth: 1, borderColor: P.border,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statIcon: { fontSize: 18 },
  trendPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  trendText: { fontSize: 10, fontWeight: '700' },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 2 },
  statTitle: { fontSize: 13, fontWeight: '600', color: P.textSec, marginBottom: 2 },
  statSubtitle: { fontSize: 11, color: P.textMuted, fontWeight: '500' },

  // ── Analytics Row
  analyticsRow: { flexDirection: 'column', gap: 16, marginBottom: 28 },
  analyticsRowDesktop: { flexDirection: 'row' },
  analyticsCard: {
    backgroundColor: P.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: P.border,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
  donutCard: { flex: 1 },
  financeCard: { flex: 1.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: P.text },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  liveText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700' },
  donutCenter: { alignItems: 'center', marginBottom: 16 },
  donutLegend: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: P.textSec, fontWeight: '500' },

  // Finance rows
  finRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  finLeft: {},
  finLabel: { fontSize: 14, fontWeight: '600', color: P.text },
  finMeta: { fontSize: 11, color: P.textMuted, marginTop: 1 },
  finAmount: { fontSize: 16, fontWeight: '800' },
  progSection: { marginTop: 16 },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progLabel: { fontSize: 13, fontWeight: '600', color: P.textSec },
  progPct: { fontSize: 13, fontWeight: '800' },
  progTrack: { height: 8, backgroundColor: P.border, borderRadius: 4, overflow: 'hidden' },
  progFill: { height: 8, borderRadius: 4 },

  // ── Quick Actions
  sectionTitle: { fontSize: 17, fontWeight: '800', color: P.text, marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionsGridDesktop: { flexWrap: 'nowrap' },
  quickAction: {
    flex: 1, minWidth: 200,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: P.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: P.border,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1,
  },
  qaIconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  qaIcon: { fontSize: 20 },
  qaText: { flex: 1 },
  qaLabel: { fontSize: 14, fontWeight: '700', color: P.text },
  qaDesc: { fontSize: 11, color: P.textMuted, marginTop: 2 },
  qaArrow: { fontSize: 22, fontWeight: '300' },
});
