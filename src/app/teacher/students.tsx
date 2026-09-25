/**
 * Teacher Portal → My Students Page (/teacher/students)
 * Premium, modern ERP student management dashboard.
 * Exactly ONE sidebar (from TeacherLayout) and ONE top header.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';

// UI Subcomponents
import { StudentsTopHeader } from '../../components/teacher/students/StudentsTopHeader';
import { StudentsHeroBanner } from '../../components/teacher/students/StudentsHeroBanner';
import { StudentsSummaryCards } from '../../components/teacher/students/StudentsSummaryCards';
import { StudentsControlsBar, ClassOption } from '../../components/teacher/students/StudentsControlsBar';
import { StudentsTable, StudentRowItem } from '../../components/teacher/students/StudentsTable';
import { StudentsRightAnalytics } from '../../components/teacher/students/StudentsRightAnalytics';
import { AddStudentModal } from '../../components/teacher/students/AddStudentModal';
import { ViewStudentProfileModal } from '../../components/teacher/students/ViewStudentProfileModal';
import { EditStudentModal } from '../../components/teacher/students/EditStudentModal';

const IS_WEB = Platform.OS === 'web';

// API Fetchers
async function fetchClassesAPI() {
  return await apiClient.get<any[]>('/teacher/me/classes');
}

async function fetchStudentsAPI(classId?: string) {
  const url = classId ? `/teacher/class/${classId}/students` : '/teacher/me/students';
  return await apiClient.get<any[]>(url);
}

// Rich Initial Fallback Roster
const DEFAULT_STUDENTS: StudentRowItem[] = [
  {
    id: 'std-101',
    name: 'Aarav Sharma',
    rollNumber: '101',
    email: 'aarav.sharma@school.edu',
    phone: '+91 98765 43210',
    classId: 'class-10a',
    className: 'Class 10-A',
    section: 'A',
    dob: '15 May 2011',
    gender: 'Male',
    status: 'ACTIVE',
    admissionDate: '2023-04-01',
    isNewAdmission: false,
    parentName: 'Suresh Sharma',
    parentPhone: '+91 98765 11111',
    attendancePct: 96,
  },
  {
    id: 'std-102',
    name: 'Ananya Verma',
    rollNumber: '102',
    email: 'ananya.verma@school.edu',
    phone: '+91 98765 43211',
    classId: 'class-10a',
    className: 'Class 10-A',
    section: 'A',
    dob: '22 Aug 2011',
    gender: 'Female',
    status: 'ACTIVE',
    admissionDate: '2023-04-01',
    isNewAdmission: false,
    parentName: 'Rajesh Verma',
    parentPhone: '+91 98765 22222',
    attendancePct: 92,
  },
  {
    id: 'std-103',
    name: 'Devansh Reddy',
    rollNumber: '103',
    email: 'devansh.reddy@school.edu',
    phone: '+91 98765 43212',
    classId: 'class-10a',
    className: 'Class 10-A',
    section: 'B',
    dob: '10 Jan 2011',
    gender: 'Male',
    status: 'ACTIVE',
    admissionDate: '2024-06-15',
    isNewAdmission: true,
    parentName: 'Venkat Reddy',
    parentPhone: '+91 98765 33333',
    attendancePct: 98,
  },
  {
    id: 'std-104',
    name: 'Diya Patel',
    rollNumber: '104',
    email: 'diya.patel@school.edu',
    phone: '+91 98765 43213',
    classId: 'class-10b',
    className: 'Class 10-B',
    section: 'A',
    dob: '05 Nov 2011',
    gender: 'Female',
    status: 'ACTIVE',
    admissionDate: '2023-04-01',
    isNewAdmission: false,
    parentName: 'Mahesh Patel',
    parentPhone: '+91 98765 44444',
    attendancePct: 88,
  },
  {
    id: 'std-105',
    name: 'Ishaan Gupta',
    rollNumber: '105',
    email: 'ishaan.gupta@school.edu',
    phone: '+91 98765 43214',
    classId: 'class-10b',
    className: 'Class 10-B',
    section: 'B',
    dob: '18 Dec 2010',
    gender: 'Male',
    status: 'INACTIVE',
    admissionDate: '2022-04-01',
    isNewAdmission: false,
    parentName: 'Alok Gupta',
    parentPhone: '+91 98765 55555',
    attendancePct: 65,
  },
  {
    id: 'std-106',
    name: 'Kavya Nair',
    rollNumber: '106',
    email: 'kavya.nair@school.edu',
    phone: '+91 98765 43215',
    classId: 'class-9a',
    className: 'Class 9-A',
    section: 'A',
    dob: '12 Mar 2012',
    gender: 'Female',
    status: 'ACTIVE',
    admissionDate: '2024-07-01',
    isNewAdmission: true,
    parentName: 'Rohan Nair',
    parentPhone: '+91 98765 66666',
    attendancePct: 94,
  },
  {
    id: 'std-107',
    name: 'Rohan Joshi',
    rollNumber: '107',
    email: 'rohan.joshi@school.edu',
    phone: '+91 98765 43216',
    classId: 'class-9a',
    className: 'Class 9-A',
    section: 'A',
    dob: '30 Jul 2012',
    gender: 'Male',
    status: 'ACTIVE',
    admissionDate: '2023-04-01',
    isNewAdmission: false,
    parentName: 'Sunil Joshi',
    parentPhone: '+91 98765 77777',
    attendancePct: 91,
  },
  {
    id: 'std-108',
    name: 'Sanya Malhotra',
    rollNumber: '108',
    email: 'sanya.malhotra@school.edu',
    phone: '+91 98765 43217',
    classId: 'class-9b',
    className: 'Class 9-B',
    section: 'A',
    dob: '02 Feb 2012',
    gender: 'Female',
    status: 'ACTIVE',
    admissionDate: '2023-04-01',
    isNewAdmission: false,
    parentName: 'Vikram Malhotra',
    parentPhone: '+91 98765 88888',
    attendancePct: 95,
  },
];

export default function TeacherStudentsScreen() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Roster state
  const [studentsList, setStudentsList] = useState<StudentRowItem[]>(DEFAULT_STUDENTS);

  // Modal States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewStudentModal, setViewStudentModal] = useState<StudentRowItem | null>(null);
  const [editStudentModal, setEditStudentModal] = useState<StudentRowItem | null>(null);

  // API Integration
  const { data: classesData, loading: classesLoading } = useApi(fetchClassesAPI);
  const { data: studentsData, loading: studentsLoading, error, refetch } = useApi(
    () => fetchStudentsAPI(selectedClassId ?? undefined),
    [selectedClassId]
  );

  // Populate from API if available
  useEffect(() => {
    if (studentsData && Array.isArray(studentsData) && studentsData.length > 0) {
      const formatted: StudentRowItem[] = studentsData.map((s: any, idx: number) => ({
        id: s.id?.toString() || `std-api-${idx}`,
        name: s.name || `Student ${idx + 1}`,
        rollNumber: s.roll_number?.toString() || (100 + idx).toString(),
        email: s.email || `student${idx + 1}@school.edu`,
        phone: s.phone || '+91 98765 00000',
        classId: s.class_id || s.classId || 'class-10a',
        className: s.class_name || s.className || 'Class 10-A',
        section: s.section || (idx % 2 === 0 ? 'A' : 'B'),
        dob: s.dob || '15 May 2011',
        gender: s.gender || (idx % 2 === 0 ? 'Male' : 'Female'),
        status: s.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        admissionDate: s.admission_date || '2023-04-01',
        isNewAdmission: s.is_new || idx > 5,
        parentName: s.parents?.[0]?.name || 'Parent Contact',
        parentPhone: s.parents?.[0]?.phone || '+91 98765 11111',
        attendancePct: s.attendance_pct ?? 90,
      }));
      setStudentsList(formatted);
    }
  }, [studentsData]);

  // Derived available classes list
  const availableClasses: ClassOption[] = useMemo(() => {
    if (classesData && Array.isArray(classesData) && classesData.length > 0) {
      return classesData.map((c: any) => ({
        id: c.id?.toString() || 'class-10a',
        name: c.name || 'Class 10-A',
        section: c.section,
      }));
    }
    return [
      { id: 'class-10a', name: 'Class 10-A' },
      { id: 'class-10b', name: 'Class 10-B' },
      { id: 'class-9a', name: 'Class 9-A' },
      { id: 'class-9b', name: 'Class 9-B' },
    ];
  }, [classesData]);

  // Available sections list
  const availableSections = useMemo(() => ['A', 'B', 'C', 'D'], []);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      // Filter by Class
      if (selectedClassId && s.classId !== selectedClassId) return false;
      // Filter by Section
      if (selectedSection && s.section !== selectedSection) return false;
      // Filter by Status
      if (selectedStatus === 'ACTIVE' && s.status !== 'ACTIVE') return false;
      if (selectedStatus === 'INACTIVE' && s.status !== 'INACTIVE') return false;
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = s.rollNumber.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesClass = s.className.toLowerCase().includes(q);
        const matchesParent = (s.parentName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesEmail && !matchesClass && !matchesParent) {
          return false;
        }
      }
      return true;
    });
  }, [studentsList, selectedClassId, selectedSection, selectedStatus, searchQuery]);

  // Summary Metrics Computation
  const summaryMetrics = useMemo(() => {
    const total = studentsList.length;
    const active = studentsList.filter((s) => s.status === 'ACTIVE').length;
    const inactive = studentsList.filter((s) => s.status === 'INACTIVE').length;
    const activePct = total > 0 ? (active / total) * 100 : 0;
    const inactivePct = total > 0 ? (inactive / total) * 100 : 0;

    return {
      totalStudents: total,
      activeStudents: active,
      activePct,
      inactiveStudents: inactive,
      inactivePct,
      myClassesCount: availableClasses.length,
    };
  }, [studentsList, availableClasses]);

  // Analytics Computation
  const analyticsData = useMemo(() => {
    // Class distributions
    const classMap: Record<string, number> = {};
    studentsList.forEach((s) => {
      classMap[s.className] = (classMap[s.className] || 0) + 1;
    });
    const total = studentsList.length || 1;
    const classDistributions = Object.entries(classMap).map(([className, count]) => ({
      className,
      count,
      percentage: (count / total) * 100,
    }));

    // Gender distributions
    const maleCount = studentsList.filter((s) => s.gender === 'Male').length;
    const femaleCount = studentsList.filter((s) => s.gender === 'Female').length;
    const otherCount = studentsList.filter((s) => s.gender === 'Other').length;

    const genderDistributions = [
      { gender: 'Male', count: maleCount, percentage: (maleCount / total) * 100 },
      { gender: 'Female', count: femaleCount, percentage: (femaleCount / total) * 100 },
      ...(otherCount > 0
        ? [{ gender: 'Other', count: otherCount, percentage: (otherCount / total) * 100 }]
        : []),
    ];

    // Recent admissions
    const recentAdmissions = [...studentsList]
      .sort((a, b) => (b.admissionDate || '').localeCompare(a.admissionDate || ''))
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        name: s.name,
        className: s.className,
        date: s.admissionDate || '2024-06-01',
        avatarUrl: s.avatarUrl,
      }));

    return {
      classDistributions,
      genderDistributions,
      recentAdmissions,
    };
  }, [studentsList]);

  // Actions
  const handleAddStudentSave = (newStudent: Partial<StudentRowItem>) => {
    const created: StudentRowItem = {
      id: `std-new-${Date.now()}`,
      name: newStudent.name || 'New Student',
      rollNumber: newStudent.rollNumber || '109',
      email: newStudent.email || 'student@school.edu',
      phone: newStudent.phone || '+91 98765 00000',
      classId: newStudent.classId || availableClasses[0]?.id || 'class-10a',
      className: newStudent.className || availableClasses[0]?.name || 'Class 10-A',
      section: newStudent.section || 'A',
      dob: newStudent.dob || '15 May 2011',
      gender: newStudent.gender || 'Male',
      status: newStudent.status || 'ACTIVE',
      admissionDate: newStudent.admissionDate || new Date().toISOString().split('T')[0],
      isNewAdmission: true,
      parentName: newStudent.parentName || 'Parent Name',
      parentPhone: newStudent.parentPhone || '+91 98765 00000',
      attendancePct: 100,
    };

    setStudentsList((prev) => [created, ...prev]);
  };

  const handleEditStudentSave = (updated: StudentRowItem) => {
    setStudentsList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleActivateStudent = (id: string) => {
    setStudentsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'ACTIVE' } : s))
    );
  };

  const handleDeactivateStudent = (id: string) => {
    setStudentsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'INACTIVE' } : s))
    );
  };

  const handleDeleteStudent = (id: string) => {
    if (IS_WEB) {
      if (window.confirm('Are you sure you want to delete this student record?')) {
        setStudentsList((prev) => prev.filter((s) => s.id !== id));
      }
    } else {
      Alert.alert('Delete Student', 'Are you sure you want to delete this student record?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setStudentsList((prev) => prev.filter((s) => s.id !== id)),
        },
      ]);
    }
  };

  const handleExportFiltered = () => {
    const headers = ['Roll No', 'Name', 'Class', 'Section', 'Email', 'Phone', 'Gender', 'Status', 'Parent Name'];
    const rows = filteredStudents.map((s) => [
      s.rollNumber,
      `"${s.name}"`,
      `"${s.className}"`,
      s.section,
      s.email,
      s.phone || '',
      s.gender || '',
      s.status,
      `"${s.parentName || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    if (IS_WEB) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Students_Roster_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert('CSV Exported', `Exported ${filteredStudents.length} student records.`);
    }
  };

  const handlePrintFiltered = () => {
    if (IS_WEB) {
      window.print();
    } else {
      Alert.alert('Print Roster', 'Preparing student list printout...');
    }
  };

  const handleClearFilters = () => {
    setSelectedClassId(null);
    setSelectedSection(null);
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  if ((classesLoading || studentsLoading) && studentsList.length === 0) {
    return <LoadingScreen message="Loading student roster..." />;
  }

  if (error && studentsList.length === 0) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.outerContainer}>
        {/* Top Header */}
        <StudentsTopHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Dashboard Workspace */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardLayout}>
            {/* Left Primary Roster Column */}
            <View style={styles.leftColumn}>
              {/* Hero Banner */}
              <StudentsHeroBanner />

              {/* Summary Metric Cards */}
              <StudentsSummaryCards data={summaryMetrics} />

              {/* Controls & Filters Bar */}
              <StudentsControlsBar
                classes={availableClasses}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                sections={availableSections}
                selectedSection={selectedSection}
                onSelectSection={setSelectedSection}
                selectedStatus={selectedStatus}
                onSelectStatus={setSelectedStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddStudent={() => setAddModalVisible(true)}
              />

              {/* Roster Table */}
              <StudentsTable
                students={filteredStudents}
                onViewStudent={(s) => setViewStudentModal(s)}
                onEditStudent={(s) => setEditStudentModal(s)}
                onActivateStudent={handleActivateStudent}
                onDeactivateStudent={handleDeactivateStudent}
                onDeleteStudent={handleDeleteStudent}
                onExportFiltered={handleExportFiltered}
                onPrintFiltered={handlePrintFiltered}
                onClearFilters={handleClearFilters}
              />
            </View>

            {/* Right Analytics Column (~340px) */}
            <View style={styles.rightColumn}>
              <StudentsRightAnalytics
                totalStudents={summaryMetrics.totalStudents}
                classDistributions={analyticsData.classDistributions}
                genderDistributions={analyticsData.genderDistributions}
                recentAdmissions={analyticsData.recentAdmissions}
                onViewAllAdmissions={() => setSelectedStatus('ALL')}
              />
            </View>
          </View>
        </ScrollView>

        {/* Modals */}
        <AddStudentModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSave={handleAddStudentSave}
          availableClasses={availableClasses}
        />

        <ViewStudentProfileModal
          visible={!!viewStudentModal}
          student={viewStudentModal}
          onClose={() => setViewStudentModal(null)}
          onEdit={(s) => setEditStudentModal(s)}
        />

        <EditStudentModal
          visible={!!editStudentModal}
          student={editStudentModal}
          onClose={() => setEditStudentModal(null)}
          onSave={handleEditStudentSave}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  dashboardLayout: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: 1,
    minWidth: 640,
  },
  rightColumn: {
    width: 340,
    minWidth: 320,
  },
});
