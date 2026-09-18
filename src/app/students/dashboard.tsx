/**
 * StudentDashboard — Premium 3D Academic Portal
 *
 * Implements ONLY:
 *  - Welcome / Student Information
 *  - Quick Statistics (Attendance, CGPA, Pending Assignments, Pending Fees, Class Rank)
 *  - Attendance Visualization (Donut + Subject-wise bars + Threshold Warning)
 *  - Academic / CGPA Visualization (Animated Line Chart + Semester Progression)
 *  - Assignment Statistics (Multi-segment Donut + Status Breakdown)
 *  - Fee Statistics (Donut + Paid vs Remaining Breakdown)
 *  - Class Rank Visualization (Rank #12 / 120 + Historical Sparkline)
 *
 * Preserves existing sidebar navigation and routes.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Platform,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import {
  fetchStudentDashboardData,
  type StudentDashboardData,
} from '../../services/studentDashboard';
import {
  WelcomeHeader,
  StatCard,
  AttendanceChart,
  AcademicChart,
  AssignmentChart,
  FeeChart,
  RankCard,
  DashboardSkeleton,
  DashboardError,
} from '../../components/students/dashboard';

const IS_WEB = Platform.OS === 'web';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();

  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStudentDashboardData(user.id);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load student dashboard:', err);
      setError(err?.message || 'Could not load student dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DashboardError message={error} onRetry={loadData} />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navbar on Web */}
      {IS_WEB && (
        <View style={styles.topNavbar}>
          <View style={styles.navTitleCol}>
            <Text style={styles.navBreadcrumb}>Portal / Student / Overview</Text>
            <Text style={styles.navHeading}>Academic Dashboard</Text>
          </View>

          <View style={styles.navActionRow}>
            {/* Quick search input simulation */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Search courses, exams, fees...</Text>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/students/notifications')}
              style={styles.navIconButton}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
              <View style={styles.bellDot} />
            </TouchableOpacity>

            {/* User profile pill */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/students/profile')}
              style={styles.userProfilePill}
            >
              {data.student.avatar ? (
                <Image source={{ uri: data.student.avatar }} style={styles.navAvatar} />
              ) : (
                <View style={styles.navAvatarFallback}>
                  <Text style={styles.navAvatarInit}>{data.student.firstName[0]}</Text>
                </View>
              )}
              <View style={styles.navUserTextCol}>
                <Text style={styles.navUserName}>{data.student.name}</Text>
                <Text style={styles.navUserRole}>Student • {data.student.class}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Scrollable Content */}
      <ScrollView
        style={IS_WEB ? ({ flex: 1, height: '100%', overflowY: 'auto' } as any) : { flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[
          styles.scrollContainer,
          isDesktop ? styles.desktopContainer : isTablet ? styles.tabletContainer : styles.mobileContainer,
        ]}
      >
        {/* 1. Welcome Section */}
        <WelcomeHeader
          student={data.student}
          onProfilePress={() => router.push('/students/profile')}
        />

        {/* 2. Quick Statistics Row (5 Cards) */}
        <View style={styles.statsGrid}>
          {/* Attendance */}
          <StatCard
            title="Attendance"
            value={`${data.attendance.overall}%`}
            subtitle={`${data.attendance.presentDays} of ${data.attendance.totalDays} sessions`}
            badgeText={data.attendance.statusText}
            icon="📊"
            colorScheme="indigo"
            visualIndicator={{
              type: 'progress',
              progressPct: data.attendance.overall,
              secondaryText: 'Minimum 75% target',
            }}
            animationDelay={0.05}
            onPress={() => router.push('/students/attendance')}
          />

          {/* CGPA */}
          <StatCard
            title="Academic CGPA"
            value={data.academics.cgpa}
            unit="/ 10"
            subtitle="Cumulative Grade Average"
            badgeText={data.academics.status}
            icon="🎓"
            colorScheme="purple"
            visualIndicator={{
              type: 'trend',
              trendText: data.academics.cgpaTrend,
              trendPositive: data.academics.trendPositive,
              secondaryText: 'Consistent growth',
            }}
            animationDelay={0.1}
            onPress={() => router.push('/students/results')}
          />

          {/* Pending Assignments */}
          <StatCard
            title="Assignments"
            value={data.assignments.pending}
            subtitle={`${data.assignments.completed} completed coursework`}
            badgeText={data.assignments.urgentCount > 0 ? `${data.assignments.urgentCount} Due Soon` : 'On Track'}
            icon="📋"
            colorScheme="amber"
            visualIndicator={{
              type: 'progress',
              progressPct: Math.round(
                (data.assignments.completed / Math.max(1, data.assignments.total)) * 100
              ),
              secondaryText: `${data.assignments.overdue} overdue task`,
            }}
            animationDelay={0.15}
            onPress={() => router.push('/students/assignments')}
          />

          {/* Pending Fees */}
          <StatCard
            title="Fee Dues"
            value={`${data.fees.currency}${data.fees.remaining.toLocaleString('en-IN')}`}
            subtitle={`Total ${data.fees.currency}${data.fees.total.toLocaleString('en-IN')}`}
            badgeText={`${data.fees.percentagePaid}% Paid`}
            icon="💳"
            colorScheme="emerald"
            visualIndicator={{
              type: 'progress',
              progressPct: data.fees.percentagePaid,
              secondaryText: 'Term 2 pending',
            }}
            animationDelay={0.2}
            onPress={() => router.push('/students/fees')}
          />

          {/* Class Rank */}
          <StatCard
            title="Class Rank"
            value={`#${data.rank.current}`}
            unit={`/ ${data.rank.totalStudents}`}
            subtitle="Overall Academic Standing"
            badgeText={`Top ${100 - data.rank.percentile}%`}
            icon="🏆"
            colorScheme="cyan"
            visualIndicator={{
              type: 'trend',
              trendText: data.rank.trend,
              trendPositive: data.rank.trendImproved,
              secondaryText: '90th Percentile',
            }}
            animationDelay={0.25}
            onPress={() => router.push('/students/results')}
          />
        </View>

        {/* 3. Middle Visualizations Grid (Attendance Chart | Academic CGPA Chart) */}
        <View style={styles.chartGridRow}>
          <AttendanceChart attendance={data.attendance} />
          <AcademicChart academics={data.academics} />
        </View>

        {/* 4. Lower Visualizations Grid (Assignment Statistics | Fee Breakdown) */}
        <View style={styles.chartGridRow}>
          <AssignmentChart assignments={data.assignments} />
          <FeeChart fees={data.fees} />
        </View>

        {/* 5. Class Rank Detailed Historical Visualization */}
        <RankCard rank={data.rank} />

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    height: '100%',
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navTitleCol: {},
  navBreadcrumb: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  navActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 260,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 13,
  },
  searchPlaceholder: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  navIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
  },
  navAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navAvatarInit: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  navUserTextCol: {
    alignItems: 'flex-start',
  },
  navUserName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  navUserRole: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  scrollContainer: {
    paddingVertical: 24,
  },
  desktopContainer: {
    paddingHorizontal: 32,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  tabletContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  mobileContainer: {
    paddingHorizontal: 16,
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  chartGridRow: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
});