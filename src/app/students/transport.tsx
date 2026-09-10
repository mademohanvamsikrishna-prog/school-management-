import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getTransportRoutes, getMyTransportAssignment } from '../../services/transport';

export default function TransportScreen() {
  const { data: assignment, loading: assignmentLoading } = useApi(getMyTransportAssignment);
  const { data: routes, loading: routesLoading } = useApi(getTransportRoutes);

  const loading = assignmentLoading || routesLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Transport" />
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* My assignment */}
          <Text style={styles.sectionTitle}>My Assignment</Text>
          {assignment?.assigned ? (
            <View style={styles.assignmentCard}>
              <View style={styles.assignRow}>
                <Text style={styles.assignLabel}>Route</Text>
                <Text style={styles.assignValue}>{assignment.route_name}</Text>
              </View>
              <View style={styles.assignRow}>
                <Text style={styles.assignLabel}>Pickup Stop</Text>
                <Text style={styles.assignValue}>{assignment.pickup_stop || 'N/A'}</Text>
              </View>
              <View style={styles.assignRow}>
                <Text style={styles.assignLabel}>Academic Year</Text>
                <Text style={styles.assignValue}>{assignment.academic_year}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.noAssign}>No transport assigned. Contact the school office.</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: SIZES.lg }]}>Available Routes</Text>
          {(routes || []).length === 0 ? (
            <EmptyState title="No routes" description="No transport routes configured." icon="🚌" />
          ) : (
            (routes || []).map(route => (
              <View key={route.id} style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <View style={[styles.badge, { backgroundColor: route.is_active ? COLORS.success : COLORS.error }]}>
                    <Text style={styles.badgeText}>{route.is_active ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>
                <Text style={styles.routeDetail}>Departure: {route.start_time}</Text>
                <Text style={styles.routeDetail}>Bus: {route.vehicle_reg || 'Not assigned'} · Stops: {route.stop_count}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1 },
  content: { padding: SIZES.md, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.sm },
  assignmentCard: { backgroundColor: COLORS.primary, borderRadius: SIZES.md, padding: SIZES.md, marginBottom: SIZES.sm },
  assignRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  assignLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  assignValue: { color: '#fff', fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 1 },
  noAssign: { color: COLORS.textSecondary, fontStyle: 'italic' },
  routeCard: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  routeName: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  routeDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
