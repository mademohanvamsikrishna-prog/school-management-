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
import { getClassTimetable } from '../../services/timetable';
import { getTimetableDay } from '../../utils/timetableDay';
import { getMyProfile } from '../../services/profile';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApi(getDashboardSummary);
  const { data: events, loading: eventsLoading } = useApi(() => getEvents(true));
  const { data: profile } = useApi(getMyProfile);

  // We need the classId to fetch the timetable. Wait until profile is loaded.
  const classId = profile?.student_profile?.class_id;
  
  // Convert JS Date.getDay() (0=Sun … 6=Sat) to the backend format (1=Mon … 6=Sat).
  // getTimetableDay returns undefined for Sunday — we must not call the API in that case
  // because the backend only accepts days 1-6 and returns a 422 error for day=7.
  const jsDay = new Date().getDay();
  const backendDay = getTimetableDay(jsDay); // undefined on Sunday

  const { data: timetable, loading: timetableLoading } = useApi(
    async () => {
      // Skip the API call on Sunday or if the class is not yet known.
      // Returning [] shows the "No classes scheduled for today" empty state.
      if (!classId || backendDay === undefined) return [];
      return getClassTimetable(classId, backendDay);
    },
    [classId, backendDay]
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
        subtitle={profile?.student_profile?.class_name || 'Loading...'}
        avatarUrl={user.avatarUrl}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Attendance */}
        <DashboardSection title="Attendance" actionText="View Details" onAction={() => router.push('/students/academics')}>
          <View style={styles.row}>
            <StatCard title="Overall" value={`${summary.attendance_percentage || 0}%`} icon="📊" style={styles.flex1} />
            <StatCard title="Present" value={summary.present_days || 0} icon="✅" color={COLORS.success} style={styles.flex1} />
            <StatCard title="Absent" value={summary.absent_days || 0} icon="❌" color={COLORS.error} style={styles.flex1} />
          </View>
        </DashboardSection>

        {/* Timetable */}
        <DashboardSection title="Today's Timetable">
          {timetable && timetable.length > 0 ? (
            timetable.slice(0, 2).map((entry) => (
              <View key={entry.id} style={styles.timetableItem}>
                <View style={styles.timeBlock}>
                  <StatCard title={`${entry.start_time} - ${entry.end_time}`} value={entry.subject_name || 'Unknown'} subtitle={`Room: ${entry.room_number}`} style={{flex: 1}} />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No classes scheduled for today.</Text>
          )}
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions">
          <View style={styles.quickActions}>
            <QuickActionButton title="Attendance" icon="📅" onPress={() => router.push('/students/academics')} />
            <QuickActionButton title="Marks" icon="📝" onPress={() => router.push('/students/academics')} />
            <QuickActionButton title="Events" icon="🎉" onPress={() => router.push('/students/events')} />
            <QuickActionButton title="Profile" icon="👤" onPress={() => router.push('/students/profile')} />
          </View>
        </DashboardSection>

        {/* Events */}
        <DashboardSection title="Upcoming Events" actionText="View All" onAction={() => router.push('/students/events')}>
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
  timeBlock: {
    flexDirection: 'row',
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