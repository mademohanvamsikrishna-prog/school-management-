import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getAnalyticsOverview } from '../../services/admin';

interface QuickAction { label: string; icon: string; route: string; color: string }

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Manage Users', icon: '👥', route: '/admin/users', color: '#4361EE' },
  { label: 'Manage Classes', icon: '🏫', route: '/admin/classes', color: '#3F37C9' },
  { label: 'Analytics', icon: '📊', route: '/admin/analytics', color: '#FF9800' },
];

export default function AdminDashboard() {
  const { data: analytics, loading } = useApi(getAnalyticsOverview);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Admin Dashboard" subtitle="School Management" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.route}
              style={[styles.actionCard, { borderLeftColor: action.color, borderLeftWidth: 4 }]}
              onPress={() => router.push(action.route as any)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.actionCard, { borderLeftColor: COLORS.error, borderLeftWidth: 4 }]}
            onPress={handleLogout}
          >
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={[styles.actionLabel, { color: COLORS.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>School Overview</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : analytics ? (
          <>
            <View style={styles.statsRow}>
              <StatCard title="Students" value={String(analytics.enrollment.students)} subtitle="Active" style={styles.halfCard} />
              <StatCard title="Teachers" value={String(analytics.enrollment.teachers)} subtitle="Active" style={styles.halfCard} />
            </View>
            <View style={styles.statsRow}>
              <StatCard title="Parents" value={String(analytics.enrollment.parents)} subtitle="Registered" style={styles.halfCard} />
              <StatCard title="Classes" value={String(analytics.enrollment.classes)} subtitle="Total" style={styles.halfCard} />
            </View>

            <Text style={styles.sectionTitle}>Attendance</Text>
            <StatCard
              title="Overall Attendance"
              value={`${analytics.attendance.overall_percentage}%`}
              subtitle={`${analytics.attendance.present_records} present / ${analytics.attendance.total_records} total`}
            />

            <Text style={styles.sectionTitle}>Finance Summary</Text>
            <View style={styles.financeCard}>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Total Invoiced</Text>
                <Text style={styles.finValue}>₹{analytics.finance.total_invoiced.toLocaleString()}</Text>
              </View>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Collected</Text>
                <Text style={[styles.finValue, { color: COLORS.success }]}>₹{analytics.finance.total_collected.toLocaleString()}</Text>
              </View>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Outstanding</Text>
                <Text style={[styles.finValue, { color: COLORS.error }]}>₹{analytics.finance.total_outstanding.toLocaleString()}</Text>
              </View>
              <View style={styles.finRow}>
                <Text style={styles.finLabel}>Collection Rate</Text>
                <Text style={[styles.finValue, { color: COLORS.primary }]}>{analytics.finance.collection_rate}%</Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.sm, marginTop: SIZES.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  actionCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md,
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
  statsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.sm },
  halfCard: { flex: 1 },
  financeCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  finLabel: { fontSize: 15, color: COLORS.textSecondary },
  finValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
});
