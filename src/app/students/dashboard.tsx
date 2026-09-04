import React from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { DashboardSection } from '../../components/DashboardSection';
import { StatCard } from '../../components/StatCard';
import { EventCard } from '../../components/EventCard';
import { QuickActionButton } from '../../components/QuickActionButton';
import { COLORS, SIZES } from '../../constants/theme';
import { students, mockAttendanceSummary, mockTimetable, mockEvents } from '../../mock';

export default function StudentDashboard() {
  const router = useRouter();
  const student = students[0];
  const attendance = mockAttendanceSummary[student.id];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`Good Morning, ${student.name.split(' ')[0]}`}
        subtitle={student.className}
        avatarUrl={student.avatarUrl}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Attendance */}
        <DashboardSection title="Attendance" actionText="View Details" onAction={() => router.push('/students/academics')}>
          <View style={styles.row}>
            <StatCard title="Overall" value={`${attendance?.percentage || 0}%`} icon="📊" style={styles.flex1} />
            <StatCard title="Present" value={attendance?.presentDays || 0} icon="✅" color={COLORS.success} style={styles.flex1} />
            <StatCard title="Absent" value={attendance?.absentDays || 0} icon="❌" color={COLORS.error} style={styles.flex1} />
          </View>
        </DashboardSection>

        {/* Timetable */}
        <DashboardSection title="Today's Timetable">
          {mockTimetable.slice(0, 2).map((entry) => (
            <View key={entry.id} style={styles.timetableItem}>
              <View style={styles.timeBlock}>
                <StatCard title={entry.startTime} value={entry.subjectName} subtitle={`Room: ${entry.roomNumber}`} style={{flex: 1}} />
              </View>
            </View>
          ))}
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions">
          <View style={styles.quickActions}>
            <QuickActionButton title="Attendance" icon="📅" onPress={() => router.push('/students/academics')} />
            <QuickActionButton title="Timetable" icon="🕒" onPress={() => {}} />
            <QuickActionButton title="Marks" icon="📝" onPress={() => {}} />
            <QuickActionButton title="Exams" icon="📜" onPress={() => {}} />
          </View>
        </DashboardSection>

        {/* Events */}
        <DashboardSection title="Upcoming Events" actionText="View All" onAction={() => router.push('/students/events')}>
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
  timeBlock: {
    flexDirection: 'row',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    justifyContent: 'space-between',
  },
});