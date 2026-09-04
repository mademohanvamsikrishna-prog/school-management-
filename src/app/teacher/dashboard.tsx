import React from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { DashboardSection } from '../../components/DashboardSection';
import { StatCard } from '../../components/StatCard';
import { EventCard } from '../../components/EventCard';
import { QuickActionButton } from '../../components/QuickActionButton';
import { COLORS, SIZES } from '../../constants/theme';
import { teachers, mockEvents, mockTimetable } from '../../mock';

export default function TeacherDashboard() {
  const router = useRouter();
  const teacher = teachers[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`Good Morning, ${teacher.name.split(' ')[0]}`}
        subtitle={`${teacher.department} Department`}
        avatarUrl={teacher.avatarUrl}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Today's Classes */}
        <DashboardSection title="Today's Classes">
          {mockTimetable.slice(0, 2).map((entry) => (
            <View key={entry.id} style={styles.timetableItem}>
               <StatCard 
                 title={`${entry.startTime} - ${entry.endTime}`} 
                 value={entry.subjectName} 
                 subtitle={`Class: 10-A | ${entry.roomNumber}`} 
               />
            </View>
          ))}
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions">
          <View style={styles.quickActions}>
            <QuickActionButton title="Mark Attendance" icon="✅" onPress={() => {}} />
            <QuickActionButton title="Enter Marks" icon="📝" onPress={() => {}} />
            <QuickActionButton title="My Classes" icon="👥" onPress={() => router.push('/teacher/classes')} />
            <QuickActionButton title="Tasks" icon="📋" onPress={() => router.push('/teacher/tasks')} />
          </View>
        </DashboardSection>

        {/* Pending Tasks */}
        <DashboardSection title="Pending Tasks">
          <View style={styles.row}>
            <StatCard title="Assignments" value="12" subtitle="To Review" icon="📄" color={COLORS.warning} style={styles.flex1} />
            <StatCard title="Requests" value="3" subtitle="Pending" icon="📩" color={COLORS.info} style={styles.flex1} />
          </View>
        </DashboardSection>

        {/* Events */}
        <DashboardSection title="Upcoming Events">
          <View style={{ gap: SIZES.md }}>
            {mockEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
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
});
