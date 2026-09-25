/**
 * Teacher Portal → My Classes Page (/teacher/classes)
 * Premium Classroom Management Workspace with distinct editorial styling.
 * Exactly ONE sidebar (from TeacherLayout) and ONE top header.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';

// UI Subcomponents
import { StudentsTopHeader } from '../../components/teacher/students/StudentsTopHeader';
import { ClassesHeroBanner } from '../../components/teacher/classes/ClassesHeroBanner';
import { ClassesMetricsBar } from '../../components/teacher/classes/ClassesMetricsBar';
import { ClassesControlsBar, ClassTabType } from '../../components/teacher/classes/ClassesControlsBar';
import { ClassesTable, ClassRowItem, SubjectItem } from '../../components/teacher/classes/ClassesTable';
import { ClassesRightPanel, TodayScheduleItem, RecentActivityItem } from '../../components/teacher/classes/ClassesRightPanel';
import { ClassesTeachingBanner } from '../../components/teacher/classes/ClassesTeachingBanner';
import { AddClassModal } from '../../components/teacher/classes/AddClassModal';
import { EditClassModal } from '../../components/teacher/classes/EditClassModal';
import { ViewClassModal } from '../../components/teacher/classes/ViewClassModal';

const IS_WEB = Platform.OS === 'web';

// API Fetchers
async function fetchTeacherClasses() {
  return await apiClient.get<any[]>('/teacher/me/classes');
}
async function fetchTeacherTimetable() {
  return await apiClient.get<any[]>('/teacher/me/timetable');
}
async function fetchTeacherSubjects() {
  return await apiClient.get<any[]>('/teacher/me/subjects');
}
async function fetchTeacherAttendanceStats() {
  return await apiClient.get<any[]>('/teacher/me/attendance/stats');
}

// Initial Rich Default Classes
const DEFAULT_CLASSES: ClassRowItem[] = [
  {
    id: 'class-10a',
    name: 'Class 10 - A',
    gradeLevel: 10,
    section: 'A',
    roomNumber: '101',
    capacity: 40,
    studentCount: 38,
    teacherName: 'Ms. Sreeja',
    isClassTeacher: true,
    subjects: [
      { id: 'sub-1', name: 'Mathematics', code: 'MATH101' },
      { id: 'sub-2', name: 'Physics', code: 'PHY101' },
      { id: 'sub-4', name: 'English', code: 'ENG101' },
      { id: 'sub-5', name: 'Computer Science', code: 'CS101' },
    ],
    weeklyPeriods: 8,
    attendanceAvg: 85,
    status: 'ACTIVE',
    academicYear: '2025 – 2026',
  },
  {
    id: 'class-10b',
    name: 'Class 10 - B',
    gradeLevel: 10,
    section: 'B',
    roomNumber: '102',
    capacity: 40,
    studentCount: 32,
    teacherName: 'Mr. Arvind Rao',
    isClassTeacher: false,
    subjects: [
      { id: 'sub-1', name: 'Mathematics', code: 'MATH101' },
      { id: 'sub-2', name: 'Physics', code: 'PHY101' },
      { id: 'sub-3', name: 'Chemistry', code: 'CHEM101' },
    ],
    weeklyPeriods: 10,
    attendanceAvg: 91,
    status: 'ACTIVE',
    academicYear: '2025 – 2026',
  },
  {
    id: 'class-9a',
    name: 'Class 9 - A',
    gradeLevel: 9,
    section: 'A',
    roomNumber: '201',
    capacity: 45,
    studentCount: 50,
    teacherName: 'Ms. Sreeja',
    isClassTeacher: true,
    subjects: [
      { id: 'sub-1', name: 'Mathematics', code: 'MATH101' },
      { id: 'sub-4', name: 'English', code: 'ENG101' },
      { id: 'sub-6', name: 'Biology', code: 'BIO101' },
      { id: 'sub-5', name: 'Computer Science', code: 'CS101' },
    ],
    weeklyPeriods: 10,
    attendanceAvg: 88,
    status: 'ACTIVE',
    academicYear: '2025 – 2026',
  },
];

const DEFAULT_SCHEDULE: TodayScheduleItem[] = [
  {
    id: 'sch-1',
    time: '08:30 – 09:20 AM',
    subject: 'Mathematics',
    className: 'Class 10-A',
    room: 'Room 101',
    isCurrent: true,
  },
  {
    id: 'sch-2',
    time: '10:10 – 11:00 AM',
    subject: 'English',
    className: 'Class 9-A',
    room: 'Room 102',
    isCurrent: false,
  },
  {
    id: 'sch-3',
    time: '12:30 – 01:15 PM',
    subject: 'Computer Science',
    className: 'Class 10-B',
    room: 'Lab-1',
    isCurrent: false,
  },
];

const DEFAULT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    title: 'Unit Test - Mathematics',
    className: 'Class 10-A',
    date: 'Sep 20, 2026',
  },
  {
    id: 'act-2',
    title: 'Assignment Submitted',
    className: 'Class 9-A',
    date: 'Sep 18, 2026',
  },
  {
    id: 'act-3',
    title: 'Parent-Teacher Meeting',
    className: 'Class 10-B',
    date: 'Sep 15, 2026',
  },
];

export default function MyClassesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Primary Data State
  const [classesList, setClassesList] = useState<ClassRowItem[]>(DEFAULT_CLASSES);
  const [todaySchedule, setTodaySchedule] = useState<TodayScheduleItem[]>(DEFAULT_SCHEDULE);
  const [recentActivities] = useState<RecentActivityItem[]>(DEFAULT_ACTIVITIES);

  // Tabs & Filters State
  const [activeTab, setActiveTab] = useState<ClassTabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState('2025 – 2026');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRowItem | null>(null);
  const [viewingClass, setViewingClass] = useState<ClassRowItem | null>(null);

  // API Calls
  const { data: apiClasses, loading: classesLoading, error: classesError, refetch } = useApi(fetchTeacherClasses);
  const { data: apiTimetable } = useApi(fetchTeacherTimetable);
  const { data: apiSubjects } = useApi(fetchTeacherSubjects);
  const { data: apiAttendanceStats } = useApi(fetchTeacherAttendanceStats);

  // Synchronize Backend Data
  useEffect(() => {
    if (apiClasses && Array.isArray(apiClasses) && apiClasses.length > 0) {
      const formatted: ClassRowItem[] = apiClasses.map((c: any) => {
        // Attendance lookup
        const attStat = Array.isArray(apiAttendanceStats)
          ? apiAttendanceStats.find((a: any) => a.class_id === c.id)
          : null;
        const attendanceAvg = attStat ? attStat.attendance_rate : 88;

        // Timetable periods lookup
        const periodCount = Array.isArray(apiTimetable)
          ? apiTimetable.filter((t: any) => t.class_id === c.id).length || 8
          : 8;

        return {
          id: c.id,
          name: c.name || `Class ${c.grade_level || 10}-${c.section || 'A'}`,
          gradeLevel: c.grade_level || 10,
          section: c.section || 'A',
          roomNumber: c.room_number || '101',
          capacity: c.capacity || 40,
          studentCount: c.student_count || 35,
          teacherName: c.is_class_teacher ? (user?.name || 'Ms. Sreeja') : 'Faculty Teacher',
          isClassTeacher: !!c.is_class_teacher,
          subjects: [
            { id: 'sub-1', name: 'Mathematics', code: 'MATH101' },
            { id: 'sub-2', name: 'Physics', code: 'PHY101' },
            { id: 'sub-4', name: 'English', code: 'ENG101' },
          ],
          weeklyPeriods: periodCount,
          attendanceAvg,
          status: 'ACTIVE',
          academicYear: '2025 – 2026',
        };
      });

      setClassesList(formatted);
    }
  }, [apiClasses, apiAttendanceStats, apiTimetable, user]);

  // Synchronize Timetable for Right Panel
  useEffect(() => {
    if (apiTimetable && Array.isArray(apiTimetable) && apiTimetable.length > 0) {
      const scheduleItems: TodayScheduleItem[] = apiTimetable.slice(0, 5).map((t: any, idx: number) => ({
        id: t.id || `slot-${idx}`,
        time: `${t.start_time || '09:00'} – ${t.end_time || '09:50'}`,
        subject: t.subject_name || 'Mathematics',
        className: t.class_name || 'Class 10-A',
        room: t.room_number ? `Room ${t.room_number}` : 'Room 101',
        isCurrent: idx === 0,
      }));
      setTodaySchedule(scheduleItems);
    }
  }, [apiTimetable]);

  // Filtered Options for Filter Bar
  const availableClassOptions = useMemo(() => {
    return classesList.map((c) => ({
      id: c.id,
      name: c.name,
      section: c.section,
    }));
  }, [classesList]);

  const availableSections = useMemo(() => ['A', 'B', 'C', 'D'], []);

  // Filtered Classes Data
  const filteredClasses = useMemo(() => {
    return classesList.filter((c) => {
      // Tab filter
      if (activeTab === 'ACTIVE' && c.status !== 'ACTIVE') return false;
      if (activeTab === 'INACTIVE' && c.status !== 'INACTIVE') return false;

      // Status filter
      if (selectedStatus === 'ACTIVE' && c.status !== 'ACTIVE') return false;
      if (selectedStatus === 'INACTIVE' && c.status !== 'INACTIVE') return false;

      // Class filter
      if (selectedClassId && c.id !== selectedClassId) return false;

      // Section filter
      if (selectedSection && c.section !== selectedSection) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesSection = (c.section || '').toLowerCase().includes(q);
        const matchesTeacher = (c.teacherName || '').toLowerCase().includes(q);
        const matchesSubject = c.subjects.some((s) => s.name.toLowerCase().includes(q));

        if (!matchesName && !matchesSection && !matchesTeacher && !matchesSubject) {
          return false;
        }
      }

      return true;
    });
  }, [classesList, activeTab, selectedStatus, selectedClassId, selectedSection, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const all = classesList.length;
    const active = classesList.filter((c) => c.status === 'ACTIVE').length;
    const inactive = classesList.filter((c) => c.status === 'INACTIVE').length;
    return { all, active, inactive };
  }, [classesList]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const myClassesCount = classesList.length;
    const totalStudents = classesList.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const weeklyPeriods = classesList.reduce((sum, c) => sum + (c.weeklyPeriods || 0), 0);

    // Collect unique subjects
    const subjectSet = new Set<string>();
    classesList.forEach((c) => {
      c.subjects.forEach((s) => subjectSet.add(s.name));
    });

    return {
      myClassesCount,
      totalStudents: totalStudents || 120,
      subjectsCount: subjectSet.size || 5,
      weeklyPeriods: weeklyPeriods || 28,
      studentsGrowthPct: '↑ 12% this term',
    };
  }, [classesList]);

  // Class Distributions for Right Panel Donut
  const classDistributions = useMemo(() => {
    const total = summaryMetrics.totalStudents || 1;
    return classesList.map((c) => ({
      className: c.name,
      count: c.studentCount || 30,
      percentage: ((c.studentCount || 30) / total) * 100,
    }));
  }, [classesList, summaryMetrics.totalStudents]);

  // Handlers for Navigation
  const handleNavigateToStudents = (classId: string, className: string) => {
    router.push(`/teacher/students?class=${encodeURIComponent(className)}` as any);
  };

  const handleNavigateToAttendance = (classId: string, className: string) => {
    router.push(`/teacher/attendance?class=${encodeURIComponent(className)}` as any);
  };

  const handleNavigateToResults = (classId: string, className: string) => {
    router.push(`/teacher/marks?class=${encodeURIComponent(className)}` as any);
  };

  const handleNavigateToTimetable = (classId?: string, className?: string) => {
    if (className) {
      router.push(`/teacher/timetable?class=${encodeURIComponent(className)}` as any);
    } else {
      router.push('/teacher/timetable' as any);
    }
  };

  const handleExploreTeachingTools = () => {
    router.push('/teacher/assignments' as any);
  };

  // CRUD Actions
  const handleAddClassSave = (newClassData: Partial<ClassRowItem>) => {
    const created: ClassRowItem = {
      id: `class-${Date.now()}`,
      name: newClassData.name || 'Class 10 - C',
      gradeLevel: newClassData.gradeLevel || 10,
      section: newClassData.section || 'C',
      roomNumber: newClassData.roomNumber || '103',
      capacity: newClassData.capacity || 40,
      studentCount: 0,
      teacherName: newClassData.teacherName || user?.name || 'Ms. Sreeja',
      isClassTeacher: true,
      subjects: newClassData.subjects || [{ id: 'sub-1', name: 'Mathematics', code: 'MATH101' }],
      weeklyPeriods: newClassData.weeklyPeriods || 8,
      attendanceAvg: 100,
      status: newClassData.status || 'ACTIVE',
      academicYear: newClassData.academicYear || '2025 – 2026',
    };

    setClassesList((prev) => [created, ...prev]);

    if (IS_WEB) {
      alert('Class created successfully.');
    } else {
      Alert.alert('Success', 'Class created successfully.');
    }
  };

  const handleEditClassSave = (updated: ClassRowItem) => {
    setClassesList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    if (IS_WEB) {
      alert('Class updated successfully.');
    } else {
      Alert.alert('Success', 'Class updated successfully.');
    }
  };

  const handleToggleStatus = (classItem: ClassRowItem) => {
    const newStatus = classItem.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';

    const performToggle = () => {
      setClassesList((prev) =>
        prev.map((c) => (c.id === classItem.id ? { ...c, status: newStatus } : c))
      );
    };

    if (IS_WEB) {
      if (window.confirm(`Are you sure you want to ${actionLabel} ${classItem.name}?`)) {
        performToggle();
      }
    } else {
      Alert.alert(
        `${newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Class`,
        `Are you sure you want to ${actionLabel} ${classItem.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: performToggle },
        ]
      );
    }
  };

  const handleDeleteClass = (classItem: ClassRowItem) => {
    const performDelete = () => {
      setClassesList((prev) => prev.filter((c) => c.id !== classItem.id));
    };

    if (IS_WEB) {
      if (window.confirm(`Delete ${classItem.name} permanently?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Class',
        `Delete ${classItem.name} permanently?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Class', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const handleResetFilters = () => {
    setActiveTab('ALL');
    setSearchQuery('');
    setSelectedClassId(null);
    setSelectedSection(null);
    setSelectedStatus('ALL');
    setAcademicYear('2025 – 2026');
  };

  if (classesLoading && classesList.length === 0) {
    return <LoadingScreen message="Loading classes workspace..." />;
  }

  if (classesError && classesList.length === 0) {
    return <ErrorScreen error={classesError} onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.outerContainer}>
        {/* Top Header */}
        <StudentsTopHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Teaching Workspace */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.workspaceLayout}>
            {/* Left Primary Classroom Column */}
            <View style={styles.leftColumn}>
              {/* Editorial Hero Banner */}
              <ClassesHeroBanner />

              {/* 4 Compact Horizontal Metrics */}
              <ClassesMetricsBar data={summaryMetrics} />

              {/* Class Tabs + Search + Add Class + Filter Bar */}
              <ClassesControlsBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={tabCounts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddClass={() => setIsAddModalVisible(true)}
                academicYear={academicYear}
                onAcademicYearChange={setAcademicYear}
                classesList={availableClassOptions}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                sectionsList={availableSections}
                selectedSection={selectedSection}
                onSelectSection={setSelectedSection}
                selectedStatus={selectedStatus}
                onSelectStatus={setSelectedStatus}
                onResetFilters={handleResetFilters}
              />

              {/* Main Class Management Table */}
              <ClassesTable
                classes={filteredClasses}
                onViewClass={(cls) => setViewingClass(cls)}
                onEditClass={(cls) => setEditingClass(cls)}
                onNavigateToStudents={handleNavigateToStudents}
                onNavigateToAttendance={handleNavigateToAttendance}
                onNavigateToResults={handleNavigateToResults}
                onNavigateToTimetable={handleNavigateToTimetable}
                onToggleStatus={handleToggleStatus}
                onDeleteClass={handleDeleteClass}
                onClearFilters={handleResetFilters}
              />

              {/* Bottom Teaching Promotional Banner */}
              <ClassesTeachingBanner onExploreTeachingTools={handleExploreTeachingTools} />
            </View>

            {/* Right-Side Weekly Overview & Analytics Panel (~330px) */}
            <View style={styles.rightColumn}>
              <ClassesRightPanel
                todaySchedule={todaySchedule}
                totalStudents={summaryMetrics.totalStudents}
                classDistributions={classDistributions}
                recentActivities={recentActivities}
                onNavigateToTimetable={() => handleNavigateToTimetable()}
                onNavigateToStudents={() => router.push('/teacher/students' as any)}
              />
            </View>
          </View>
        </ScrollView>

        {/* Modals */}
        <AddClassModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onSave={handleAddClassSave}
        />

        <EditClassModal
          visible={!!editingClass}
          classItem={editingClass}
          onClose={() => setEditingClass(null)}
          onSave={handleEditClassSave}
        />

        <ViewClassModal
          visible={!!viewingClass}
          classItem={viewingClass}
          onClose={() => setViewingClass(null)}
          onEdit={(cls) => setEditingClass(cls)}
          onNavigateToStudents={handleNavigateToStudents}
          onNavigateToTimetable={handleNavigateToTimetable}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F0FF',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3F0FF',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  workspaceLayout: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: 1,
    minWidth: 660,
  },
  rightColumn: {
    width: 330,
    minWidth: 320,
  },
});
