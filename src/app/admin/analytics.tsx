import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getAnalyticsOverview } from '../../services/admin';

export default function AnalyticsScreen() {
  const { data: analytics, loading } = useApi(getAnalyticsOverview);

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <AppHeader title="Analytics" showBack />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  if (!analytics) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="School Analytics" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>👥 Enrollment</Text>
        <View style={styles.row}>
          <StatCard title="Students" value={String(analytics.enrollment.students)} style={styles.half} />
          <StatCard title="Teachers" value={String(analytics.enrollment.teachers)} style={styles.half} />
        </View>
        <View style={styles.row}>
          <StatCard title="Parents" value={String(analytics.enrollment.parents)} style={styles.half} />
          <StatCard title="Classes" value={String(analytics.enrollment.classes)} style={styles.half} />
        </View>

        <Text style={styles.sectionTitle}>📅 Attendance</Text>
        <StatCard title="Overall Attendance Rate" value={`${analytics.attendance.overall_percentage}%`}
          subtitle={`${analytics.attendance.present_records} present out of ${analytics.attendance.total_records} total records`} />

        <Text style={styles.sectionTitle}>💰 Finance</Text>
        <View style={styles.finCard}>
          {[
            ['Total Invoiced', `₹${analytics.finance.total_invoiced.toLocaleString()}`, COLORS.text],
            ['Collected', `₹${analytics.finance.total_collected.toLocaleString()}`, COLORS.success],
            ['Outstanding', `₹${analytics.finance.total_outstanding.toLocaleString()}`, COLORS.error],
            ['Collection Rate', `${analytics.finance.collection_rate}%`, COLORS.primary],
          ].map(([label, value, color]) => (
            <View key={String(label)} style={styles.finRow}>
              <Text style={styles.finLabel}>{label}</Text>
              <Text style={[styles.finValue, { color: color as string }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.sm, marginTop: SIZES.md },
  row: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.sm },
  half: { flex: 1 },
  finCard: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  finLabel: { fontSize: 15, color: COLORS.textSecondary },
  finValue: { fontSize: 16, fontWeight: 'bold' },
});
