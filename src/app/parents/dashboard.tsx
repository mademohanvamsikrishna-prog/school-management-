import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { DashboardSection } from '../../components/DashboardSection';
import { StatCard } from '../../components/StatCard';
import { EventCard } from '../../components/EventCard';
import { QuickActionButton } from '../../components/QuickActionButton';
import { ChildSelector } from '../../components/ChildSelector';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getDashboardSummary } from '../../services/dashboard';
import { getEvents } from '../../services/events';
import { getMyProfile } from '../../services/profile';
import { getStudentInvoices } from '../../services/finance';

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: summary, loading: summaryLoading } = useApi(getDashboardSummary);
  const { data: events, loading: eventsLoading } = useApi(() => getEvents(true));
  const { data: profile, loading: profileLoading } = useApi(getMyProfile);

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const children = profile?.parent_profile?.children || [];

  // Automatically select the first child when data loads
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

  const isLoading = summaryLoading || eventsLoading || profileLoading || invoicesLoading;

  if (isLoading || !summary || !user || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedChildSummary = summary.children_summaries?.find(c => c.id === selectedChildId);
  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        avatarUrl={user.avatarUrl}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {children.length > 0 && (
          <ChildSelector 
            childrenList={children as any} // Requires id, name, avatarUrl (can be mocked or fetched)
            selectedChildId={selectedChildId || ''}
            onSelectChild={setSelectedChildId} 
          />
        )}
        
        {/* Attendance */}
        {selectedChildSummary && (
          <DashboardSection title={`${selectedChild?.name.split(' ')[0]}'s Attendance`} actionText="View Details" onAction={() => router.push('/parents/children')}>
            <View style={styles.row}>
              <StatCard title="Overall" value={`${selectedChildSummary.attendance_percentage || 0}%`} icon="📊" style={styles.flex1} />
            </View>
          </DashboardSection>
        )}

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions">
          <View style={styles.quickActions}>
            <QuickActionButton title="Attendance" icon="📅" onPress={() => router.push('/parents/children')} />
            <QuickActionButton title="Marks" icon="📝" onPress={() => router.push('/parents/children')} />
            <QuickActionButton title="Fees" icon="💳" onPress={() => router.push('/parents/fees')} />
            <QuickActionButton title="Profile" icon="👤" onPress={() => router.push('/parents/profile')} />
          </View>
        </DashboardSection>

        {/* Fees */}
        <DashboardSection title="Fee Summary" actionText="Pay Now" onAction={() => router.push('/parents/fees')}>
           {invoices && invoices.length > 0 ? (
             invoices.slice(0, 3).map((fee) => (
               <View key={fee.id} style={styles.feeItem}>
                  <StatCard 
                    title={fee.title} 
                    value={`₹${fee.amount}`} 
                    subtitle={`Due: ${fee.due_date}`}
                    color={fee.status === 'paid' ? COLORS.success : COLORS.warning}
                  />
               </View>
             ))
           ) : (
             <Text style={styles.emptyText}>No pending fees.</Text>
           )}
        </DashboardSection>

        {/* Events */}
        <DashboardSection title="School Events">
          <View style={{ gap: SIZES.md }}>
            {events && events.length > 0 ? (
              events.slice(0, 3).map((event) => (
                <EventCard key={event.id} {...event} />
              ))
            ) : (
               <Text style={styles.emptyText}>No upcoming events.</Text>
            )}
          </View>
        </DashboardSection>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingVertical: SIZES.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.sm,
    color: COLORS.textLight,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  flex1: {
    flex: 1,
  },
  feeItem: {
    marginBottom: SIZES.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    justifyContent: 'space-between',
  },
  emptyText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    padding: SIZES.sm,
  }
});
