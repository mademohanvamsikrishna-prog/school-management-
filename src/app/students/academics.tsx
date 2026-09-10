import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { StatCard } from '../../components/StatCard';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getAttendanceRecords } from '../../services/attendance';
import { getStudentMarks } from '../../services/marks';

export default function AcademicsScreen() {
  const { user } = useAuth();
  const { data: attendance, loading: attLoading } = useApi(
    async () => user ? getAttendanceRecords(user.id) : [], 
    [user]
  );
  const { data: marks, loading: marksLoading } = useApi(
    async () => user ? getStudentMarks(user.id) : [],
    [user]
  );

  const loading = attLoading || marksLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Academics" showBack />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  content: { padding: SIZES.md, paddingBottom: SIZES.xl },
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
