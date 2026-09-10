import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { ChildSelector } from '../../components/ChildSelector';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';
import { getAttendanceRecords } from '../../services/attendance';
import { getStudentMarks } from '../../services/marks';

export default function ChildrenAcademicsScreen() {
  const { data: profile, loading: profileLoading } = useApi(getMyProfile);
  const children = profile?.parent_profile?.children || [];
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  if (children.length > 0 && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const { data: attendance, loading: attLoading } = useApi(
    async () => selectedChildId ? getAttendanceRecords(selectedChildId) : [], 
    [selectedChildId]
  );
  
  const { data: marks, loading: marksLoading } = useApi(
    async () => selectedChildId ? getStudentMarks(selectedChildId) : [],
    [selectedChildId]
  );

  const loading = profileLoading || attLoading || marksLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Child Academics" showBack />
      
      <View style={styles.container}>
        {children.length > 0 && (
          <ChildSelector 
            childrenList={children as any}
            selectedChildId={selectedChildId || ''}
            onSelectChild={setSelectedChildId} 
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: SIZES.xl}} />
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
            {attendance && attendance.length > 0 ? (
              attendance.slice(0, 5).map(record => (
                <View key={record.id} style={styles.card}>
                  <Text style={styles.dateText}>{record.date}</Text>
                  <Text style={[styles.statusText, { color: record.status === 'present' ? COLORS.success : COLORS.error }]}>
                    {record.status.toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No attendance records found.</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: SIZES.lg }]}>Recent Marks</Text>
            {marks && marks.length > 0 ? (
              marks.map(mark => (
                 <StatCard 
                   key={mark.id}
                   title={mark.subject_name || 'Subject'} 
                   value={`${mark.marks_obtained}/${mark.max_marks}`} 
                   subtitle={`Grade: ${mark.grade} | ${mark.exam_name}`} 
                   style={{marginBottom: SIZES.sm}}
                 />
              ))
            ) : (
              <Text style={styles.emptyText}>No marks found.</Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.md },
  content: { paddingBottom: SIZES.xl },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SIZES.md, color: COLORS.textDark },
  card: {
    backgroundColor: '#fff', padding: SIZES.md, borderRadius: SIZES.sm, 
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1
  },
  dateText: { fontSize: 16, color: COLORS.text },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: COLORS.textLight, fontStyle: 'italic' },
});
