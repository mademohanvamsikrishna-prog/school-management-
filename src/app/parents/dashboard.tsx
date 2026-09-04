import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { DashboardSection } from '../../components/DashboardSection';
import { StatCard } from '../../components/StatCard';
import { EventCard } from '../../components/EventCard';
import { QuickActionButton } from '../../components/QuickActionButton';
import { ChildSelector } from '../../components/ChildSelector';
import { COLORS, SIZES } from '../../constants/theme';
import { parents, students, mockAttendanceSummary, mockEvents, mockFees } from '../../mock';

export default function ParentDashboard() {
  const router = useRouter();
  const parent = parents[0];
  const parentChildren = students.filter(s => parent.childrenIds.includes(s.id));
  const [selectedChildId, setSelectedChildId] = useState(parentChildren[0].id);
  
  const selectedChild = parentChildren.find(c => c.id === selectedChildId);
  const attendance = mockAttendanceSummary[selectedChildId];
  const fees = mockFees.filter(f => f.studentId === selectedChildId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`Welcome, ${parent.name.split(' ')[0]}`}
        avatarUrl={parent.avatarUrl}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        <ChildSelector 
          childrenList={parentChildren} 
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId} 
        />
        
        {/* Attendance */}
        <DashboardSection title={`${selectedChild?.name.split(' ')[0]}'s Attendance`} actionText="View Details" onAction={() => {}}>
          <View style={styles.row}>
            <StatCard title="Overall" value={`${attendance?.percentage || 0}%`} icon="📊" style={styles.flex1} />
            <StatCard title="Present" value={attendance?.presentDays || 0} icon="✅" color={COLORS.success} style={styles.flex1} />
          </View>
        </DashboardSection>

        {/* Quick Actions */}
        <DashboardSection title="Quick Actions">
          <View style={styles.quickActions}>
            <QuickActionButton title="Attendance" icon="📅" onPress={() => {}} />
            <QuickActionButton title="Marks" icon="📝" onPress={() => {}} />
            <QuickActionButton title="Fees" icon="💳" onPress={() => router.push('/parents/fees')} />
            <QuickActionButton title="Events" icon="🎉" onPress={() => {}} />
          </View>
        </DashboardSection>

        {/* Fees */}
        <DashboardSection title="Fee Summary" actionText="Pay Now" onAction={() => router.push('/parents/fees')}>
          {fees.map((fee) => (
            <View key={fee.id} style={styles.feeItem}>
               <StatCard 
                 title={fee.title} 
                 value={`₹${fee.amount}`} 
                 subtitle={`Due: ${fee.dueDate}`}
                 color={fee.status === 'paid' ? COLORS.success : COLORS.warning}
               />
            </View>
          ))}
        </DashboardSection>

        {/* Events */}
        <DashboardSection title="School Events">
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
  feeItem: {
    marginBottom: SIZES.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    justifyContent: 'space-between',
  },
});
