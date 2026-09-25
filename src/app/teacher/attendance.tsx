/**
 * TeacherAttendanceScreen — Redesigned Mark Attendance Page matching reference design.
 *
 * Preserves all backend API endpoints, authentication, student roster retrieval, and mark submission:
 *   GET  /api/v1/teacher/me/classes
 *   GET  /api/v1/teacher/class/{id}/students
 *   GET  /api/v1/teacher/me/attendance/stats
 *   POST /api/v1/attendance/class/{id}/mark
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  Platform, Alert, useWindowDimensions,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen } from '../../components/ScreenStates';
import { AttendanceTopHeader } from '../../components/teacher/attendance/AttendanceTopHeader';
import { AttendanceBanner } from '../../components/teacher/attendance/AttendanceBanner';
import { AttendanceControls } from '../../components/teacher/attendance/AttendanceControls';
import { AttendanceSummaryCards } from '../../components/teacher/attendance/AttendanceSummaryCards';
import { StudentAttendanceTable, AttStatus } from '../../components/teacher/attendance/StudentAttendanceTable';
import { AttendanceAnalyticsPanel } from '../../components/teacher/attendance/AttendanceAnalyticsPanel';

const IS_WEB = Platform.OS === 'web';

async function fetchClasses() {
  return await apiClient.get<any[]>('/teacher/me/classes');
}
async function fetchClassStudents(classId: string) {
  return await apiClient.get<any[]>(`/teacher/class/${classId}/students`);
}
async function fetchAttendanceStats() {
  return await apiClient.get<any[]>('/teacher/me/attendance/stats');
}

export default function TeacherAttendanceScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [topSearch, setTopSearch] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch classes
  const { data: classes, loading: classesLoading } = useApi(async () => {
    const list = await fetchClasses();
    if (list && list.length > 0 && !selectedClassId) {
      setSelectedClassId(list[0].id);
    }
    return list;
  });

  // Fetch students for selected class
  const { data: students, loading: studentsLoading, refetch } = useApi(
    async () => {
      if (!selectedClassId) return [];
      const roster = await fetchClassStudents(selectedClassId);
      // Default everyone to present
      const initStatuses: Record<string, AttStatus> = {};
      const initRemarks: Record<string, string> = {};
      roster.forEach((st: any) => {
        initStatuses[st.id] = 'present';
        initRemarks[st.id] = '';
      });
      setStatuses(initStatuses);
      setRemarks(initRemarks);
      setSubmitted(false);
      return roster;
    },
    [selectedClassId]
  );

  // Fetch attendance stats for analytics
  const { data: statsData } = useApi(fetchAttendanceStats);

  const selectedClass = (classes ?? []).find((c: any) => c.id === selectedClassId);
  const currentClassStats = (statsData ?? []).find((s: any) => s.class_id === selectedClassId);

  // Dynamic counts
  const studentList = students ?? [];
  const totalCount = studentList.length;
  const presentCount = studentList.filter(s => (statuses[s.id] ?? 'present') === 'present').length;
  const absentCount  = studentList.filter(s => (statuses[s.id] ?? 'present') === 'absent').length;
  const lateCount    = studentList.filter(s => (statuses[s.id] ?? 'present') === 'late').length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : (currentClassStats?.attendance_pct ?? 100);

  // Quick actions
  const handleMarkAllPresent = () => {
    const next: Record<string, AttStatus> = {};
    studentList.forEach(s => { next[s.id] = 'present'; });
    setStatuses(next);
  };

  const handleMarkAllAbsent = () => {
    const next: Record<string, AttStatus> = {};
    studentList.forEach(s => { next[s.id] = 'absent'; });
    setStatuses(next);
  };

  const handleReset = () => {
    const nextStatuses: Record<string, AttStatus> = {};
    const nextRemarks: Record<string, string> = {};
    studentList.forEach(s => {
      nextStatuses[s.id] = 'present';
      nextRemarks[s.id] = '';
    });
    setStatuses(nextStatuses);
    setRemarks(nextRemarks);
    setSubmitted(false);
  };

  const handleStatusChange = (studentId: string, status: AttStatus) => {
    setStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRemarks(prev => ({ ...prev, [studentId]: remark }));
  };

  // Submit Handler
  async function handleSubmit() {
    if (!selectedClassId || studentList.length === 0) return;
    setSubmitting(true);
    try {
      const records = studentList.map((s: any) => ({
        student_id: s.id,
        status: statuses[s.id] ?? 'present',
        remarks: remarks[s.id] || undefined,
      }));

      await apiClient.post(`/attendance/class/${selectedClassId}/mark`, {
        class_id: selectedClassId,
        date: selectedDate,
        records,
      });

      setSubmitted(true);
      if (!IS_WEB) {
        Alert.alert('Success', 'Attendance marked successfully!');
      }
    } catch (err: any) {
      const errMsg = err?.message || err?.detail || 'Failed to submit attendance.';
      if (!IS_WEB) {
        Alert.alert('Error', errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <AttendanceTopHeader
        searchQuery={topSearch}
        onSearchChange={setTopSearch}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* Main Banner */}
        <AttendanceBanner />

        {/* Page Content Grid */}
        <View style={[styles.mainLayoutGrid, isDesktop && styles.desktopLayout]}>
          {/* Main Workspace Column */}
          <View style={styles.leftWorkspace}>
            {/* Controls: Select Class, Select Date, Quick Actions */}
            <AttendanceControls
              classes={classes ?? []}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onMarkAllPresent={handleMarkAllPresent}
              onMarkAllAbsent={handleMarkAllAbsent}
              onReset={handleReset}
              loadingClasses={classesLoading}
            />

            {/* Attendance Summary Cards */}
            <AttendanceSummaryCards
              presentCount={presentCount}
              absentCount={absentCount}
              lateCount={lateCount}
              totalStudents={totalCount}
            />

            {/* Student Roster Table */}
            {studentsLoading ? (
              <LoadingScreen message="Loading student roster..." />
            ) : !selectedClassId ? (
              <View style={styles.emptyNoteCard}>
                <Text style={{ fontSize: 36 }}>📊</Text>
                <Text style={styles.emptyNoteTitle}>No Class Selected</Text>
                <Text style={styles.emptyNoteSub}>
                  Please select a class from the options above to mark attendance.
                </Text>
              </View>
            ) : studentList.length === 0 ? (
              <View style={styles.emptyNoteCard}>
                <Text style={{ fontSize: 36 }}>🎓</Text>
                <Text style={styles.emptyNoteTitle}>No Enrolled Students</Text>
                <Text style={styles.emptyNoteSub}>
                  There are no students currently enrolled in {selectedClass?.name ?? 'this class'}.
                </Text>
              </View>
            ) : (
              <StudentAttendanceTable
                students={studentList}
                statuses={statuses}
                remarks={remarks}
                onStatusChange={handleStatusChange}
                onRemarkChange={handleRemarkChange}
                selectedClassName={selectedClass?.name ?? 'Class 10 - A'}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitted={submitted}
                onResetSubmitted={() => {
                  setSubmitted(false);
                  refetch();
                }}
              />
            )}
          </View>

          {/* Right Analytics Panel Column */}
          <View style={isDesktop ? styles.rightPanelDesktop : styles.rightPanelMobile}>
            <AttendanceAnalyticsPanel
              className={selectedClass?.name ?? 'Class 10 - A'}
              totalStudents={totalCount}
              presentCount={presentCount}
              absentCount={absentCount}
              attendanceRate={attendanceRate}
            />
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  scrollBody: {
    padding: 24,
  },
  mainLayoutGrid: {
    flexDirection: 'column',
    gap: 24,
  },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftWorkspace: {
    flex: 1,
    minWidth: 320,
  },
  rightPanelDesktop: {
    width: 340,
  },
  rightPanelMobile: {
    width: '100%',
    marginTop: 12,
  },
  emptyNoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    gap: 8,
  },
  emptyNoteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyNoteSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
  },
});
