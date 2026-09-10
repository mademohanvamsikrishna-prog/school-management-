import React from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { DashboardSection } from '../../components/DashboardSection';
import { StatCard } from '../../components/StatCard';
import { EventCard } from '../../components/EventCard';
import { QuickActionButton } from '../../components/QuickActionButton';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getDashboardSummary } from '../../services/dashboard';
import { getEvents } from '../../services/events';
import { getTeacherTimetable } from '../../services/timetable';
import { getMyProfile } from '../../services/profile';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApi(getDashboardSummary);
  const { data: events, loading: eventsLoading } = useApi(() => getEvents(true));
  const { data: profile } = useApi(getMyProfile);

  // Today's day of week (1=Monday ... 6=Saturday) - mapping JS getDay (0=Sun, 1=Mon) to backend format
  const jsDay = new Date().getDay();
  const backendDay = jsDay === 0 ? 7 : jsDay; 

  const { data: timetable, loading: timetableLoading } = useApi(
    async () => {
      if (!user) return [];
      return getTeacherTimetable(user.id, backendDay);
    },
    [user, backendDay]
  );

  const isLoading = summaryLoading || eventsLoading || timetableLoading;
  const firstError = summary === null && !summaryLoading
    ? { statusCode: 0, message: 'Could not load dashboard data.' }
    : null;

  if (isLoading) {
    return <LoadingScreen message="Loading Dashboard..." />;
  }

  if (firstError) {
    return <ErrorScreen error={firstError} onRetry={refetchSummary} />;
  }

  if (!summary || !user) {
    return <LoadingScreen message="Loading Dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`Good Morning, ${user.name.split(' ')[0]}`}
        subtitle={`${profile?.teacher_profile?.department || 'Staff'} Department`}
        avatarUrl={user.avatarUrl}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Today's Classes */}
        <DashboardSection title="Today's Classes">
          {timetable && timetable.length > 0 ? (
            timetable.slice(0, 2).map((entry) => (
              <View key={entry.id} style={styles.timetableItem}>
                 <StatCard 
                   title={`${entry.start_time} - ${entry.end_time}`} 
                   value={entry.subject_name || 'Unknown'} 
                   subtitle={`Class: ${entry.class_name || 'Unknown'} | ${entry.room_number}`} 
                 />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No classes scheduled for today.</Text>
          )}
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions">
          <View style={styles.quickActions}>
            <QuickActionButton title="Mark Attendance" icon="✅" onPress={() => router.push('/teacher/classes')} />
            <QuickActionButton title="Enter Marks" icon="📝" onPress={() => router.push('/teacher/classes')} />
            <QuickActionButton title="My Classes" icon="👥" onPress={() => router.push('/teacher/classes')} />
            <QuickActionButton title="Profile" icon="👤" onPress={() => router.push('/teacher/profile')} />
          </View>
        </DashboardSection>

        {/* Pending Tasks */}
        <DashboardSection title="Overview">
          <View style={styles.row}>
            <StatCard title="Classes" value={summary.total_classes?.toString() || "0"} subtitle="Assigned" icon="👥" color={COLORS.info} style={styles.flex1} />
            <StatCard title="Students" value={summary.students_count?.toString() || "0"} subtitle="Total" icon="🎓" color={COLORS.success} style={styles.flex1} />
          </View>
        </DashboardSection>

        {/* Events */}
        <DashboardSection title="Upcoming Events">
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
  timetableItem: {
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
