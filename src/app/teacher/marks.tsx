/**
 * Teacher Marks & Results Screen
 *
 * Fully functional Marks Management Dashboard for Teacher Portal.
 * Removes duplicate sidebar (handled at root TeacherLayout level).
 * Provides end-to-end functionality for filters, roster search, tab filtering,
 * mark entry modals, draft saving, publishing results, edit modals, view card modals,
 * CSV export, clean printing, error handling with retry, and dynamic analytics.
 *
 * Backend APIs:
 * - GET  /api/v1/marks/exams
 * - GET  /api/v1/teacher/me/classes
 * - GET  /api/v1/teacher/class/{id}/students
 * - POST /api/v1/marks/enter
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { getExams } from '../../services/marks';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';

// Subcomponents
import { MarksTopHeader } from '../../components/teacher/marks/MarksTopHeader';
import { MarksBanner } from '../../components/teacher/marks/MarksBanner';
import { MarksFiltersBar, ClassOption, ExamOption } from '../../components/teacher/marks/MarksFiltersBar';
import { MarksQuickActions } from '../../components/teacher/marks/MarksQuickActions';
import { MarksPerformanceSummary } from '../../components/teacher/marks/MarksPerformanceSummary';
import { StudentResultsTable, StudentResultItem } from '../../components/teacher/marks/StudentResultsTable';
import { MarksAnalyticsPanel } from '../../components/teacher/marks/MarksAnalyticsPanel';
import { EnterMarksModal } from '../../components/teacher/marks/EnterMarksModal';
import { EditStudentMarksModal } from '../../components/teacher/marks/EditStudentMarksModal';
import { ViewStudentResultModal } from '../../components/teacher/marks/ViewStudentResultModal';

const IS_WEB = Platform.OS === 'web';

async function fetchClasses() {
  return await apiClient.get<any[]>('/teacher/me/classes');
}

async function fetchStudents(classId: string) {
  return await apiClient.get<any[]>(`/teacher/class/${classId}/students`);
}

function gradeFromPct(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'F';
}

export default function TeacherMarksScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState('2025 - 2026');

  // Modals state
  const [isEnterModalOpen, setIsEnterModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  // API Data
  const {
    data: examsData,
    loading: examsLoading,
    error: examsError,
    refetch: refetchExams,
  } = useApi(getExams);

  const {
    data: classesData,
    loading: classesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useApi(fetchClasses);

  const exams: ExamOption[] = useMemo(() => examsData ?? [], [examsData]);
  const classes: ClassOption[] = useMemo(() => classesData ?? [], [classesData]);

  // Default selections
  React.useEffect(() => {
    if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  React.useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Selected Exam & Class objects
  const selectedExam = useMemo(
    () => exams.find((e: any) => e.id === selectedExamId),
    [exams, selectedExamId]
  );
  const selectedClass = useMemo(
    () => classes.find((c: any) => c.id === selectedClassId),
    [classes, selectedClassId]
  );

  // Exam Subjects for the selected exam & class
  const examSubjects: any[] = useMemo(() => {
    if (!selectedExam) return [];
    return ((selectedExam as any)?.subjects ?? []).filter(
      (es: any) => !selectedClassId || es.class_id === selectedClassId
    );
  }, [selectedExam, selectedClassId]);

  // Distinct subjects list for dropdown & table columns
  const subjectsList = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    examSubjects.forEach((es: any) => {
      if (es.subject_name) {
        map.set(es.id, { id: es.id, name: es.subject_name });
      }
    });
    return Array.from(map.values());
  }, [examSubjects]);

  // Filtered subjects based on selectedSubjectId filter dropdown
  const activeDisplaySubjects = useMemo(() => {
    if (!selectedSubjectId) return subjectsList;
    return subjectsList.filter((s) => s.id === selectedSubjectId);
  }, [subjectsList, selectedSubjectId]);

  // Fetch students roster for selected class
  const {
    data: rawStudents,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useApi(
    async () => {
      if (!selectedClassId) return [];
      return fetchStudents(selectedClassId);
    },
    [selectedClassId]
  );

  // Compute full student results table model dynamically
  const studentResults: StudentResultItem[] = useMemo(() => {
    if (!rawStudents || rawStudents.length === 0) return [];

    return rawStudents.map((s: any, idx: number) => {
      const subjectMarksMap: Record<string, { marks: number; maxMarks: number; grade: string }> = {};
      let totalObtained = 0;
      let totalMax = 0;
      let markEntriesCount = 0;

      examSubjects.forEach((es: any) => {
        const studentMarkRecord = (es.marks ?? []).find((m: any) => m.student_id === s.id);
        const maxMarks = es.max_marks ?? 100;

        if (studentMarkRecord && studentMarkRecord.marks_obtained !== undefined) {
          const marksObtained = parseFloat(studentMarkRecord.marks_obtained);
          totalObtained += marksObtained;
          totalMax += maxMarks;
          markEntriesCount++;

          const subPct = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
          const subGrade = studentMarkRecord.grade ?? gradeFromPct(subPct);

          subjectMarksMap[es.id] = {
            marks: marksObtained,
            maxMarks: maxMarks,
            grade: subGrade,
          };
        }
      });

      const hasMarks = markEntriesCount > 0;
      const overallPct = hasMarks && totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const overallGrade = hasMarks ? gradeFromPct(overallPct) : '—';

      let status: StudentResultItem['status'] = 'NO_MARKS';
      if (hasMarks) {
        if (overallPct >= 50) {
          status = 'PASS';
        } else if (overallPct >= 35) {
          status = 'NEEDS_IMPROVEMENT';
        } else {
          status = 'FAIL';
        }
      }

      return {
        id: s.id,
        name: s.name,
        rollNumber: s.roll_number ?? `${idx + 1014}`,
        email: s.email,
        subjectMarks: subjectMarksMap,
        totalMarksObtained: totalObtained,
        totalMaxMarks: totalMax,
        percentage: overallPct,
        overallGrade: overallGrade,
        hasMarks: hasMarks,
        status: status,
      };
    });
  }, [rawStudents, examSubjects]);

  // Compute analytics & summary metrics dynamically
  const summaryMetrics = useMemo(() => {
    const totalStudents = studentResults.length;
    const markedStudents = studentResults.filter((s) => s.hasMarks);
    if (markedStudents.length === 0) {
      return {
        totalStudents,
        classAverage: 0,
        passedCount: 0,
        passRate: 0,
        needsImprovementCount: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    let sumPct = 0;
    let passedCount = 0;
    let needsImprovementCount = 0;
    let maxScore = -1;
    let minScore = 101;

    markedStudents.forEach((sr) => {
      sumPct += sr.percentage;
      if (sr.status === 'PASS') passedCount++;
      if (sr.status === 'NEEDS_IMPROVEMENT' || sr.status === 'FAIL') needsImprovementCount++;
      if (sr.percentage > maxScore) maxScore = sr.percentage;
      if (sr.percentage < minScore) minScore = sr.percentage;
    });

    const avg = sumPct / markedStudents.length;
    const passRate = (passedCount / markedStudents.length) * 100;

    return {
      totalStudents,
      classAverage: avg,
      passedCount,
      passRate,
      needsImprovementCount,
      highestScore: maxScore === -1 ? 0 : Math.round(maxScore),
      lowestScore: minScore === 101 ? 0 : Math.round(minScore),
    };
  }, [studentResults]);

  // Subject Performances for Right Analytics Panel (Part 15)
  const subjectPerformances = useMemo(() => {
    return subjectsList.map((sub) => {
      let subSum = 0;
      let count = 0;
      studentResults.forEach((sr) => {
        const sm = sr.subjectMarks[sub.id];
        if (sm && sm.maxMarks > 0) {
          subSum += (sm.marks / sm.maxMarks) * 100;
          count++;
        }
      });
      const avg = count > 0 ? subSum / count : 0;
      return {
        subjectName: sub.name,
        average: avg,
      };
    });
  }, [subjectsList, studentResults]);

  // Grade Distributions (Part 16)
  const gradeDistributions = useMemo(() => {
    const counts: Record<string, number> = { 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, D: 0, F: 0 };
    studentResults.forEach((sr) => {
      if (sr.hasMarks && counts[sr.overallGrade] !== undefined) {
        counts[sr.overallGrade]++;
      }
    });

    const markedTotal = studentResults.filter((s) => s.hasMarks).length || 1;
    return Object.entries(counts).map(([grade, cnt]) => ({
      grade,
      count: cnt,
      percentage: (cnt / markedTotal) * 100,
    }));
  }, [studentResults]);

  // Top Performers (Part 17)
  const topPerformers = useMemo(() => {
    return [...studentResults]
      .filter((sr) => sr.hasMarks)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map((sr) => ({
        id: sr.id,
        name: sr.name,
        rollNumber: sr.rollNumber,
        scorePct: sr.percentage,
        grade: sr.overallGrade,
      }));
  }, [studentResults]);

  // Selected student for detail modal
  const selectedStudentDetail = useMemo(() => {
    if (!viewingStudentId) return null;
    return studentResults.find((sr) => sr.id === viewingStudentId) ?? null;
  }, [studentResults, viewingStudentId]);

  // Selected student for edit modal
  const selectedStudentEditing = useMemo(() => {
    if (!editingStudentId) return null;
    return studentResults.find((sr) => sr.id === editingStudentId) ?? null;
  }, [studentResults, editingStudentId]);

  const handleRefresh = useCallback(() => {
    refetchExams();
    refetchStudents();
  }, [refetchExams, refetchStudents]);

  // Part 19: Export Results to CSV
  const handleExportResults = () => {
    if (studentResults.length === 0) return;
    let csv = 'Student Name,Roll No,Total Marks,Percentage,Grade,Status\n';
    studentResults.forEach((s) => {
      csv += `"${s.name}","${s.rollNumber}",${s.totalMarksObtained},${s.percentage.toFixed(1)}%,${s.overallGrade},${s.status}\n`;
    });

    if (IS_WEB) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedClass?.name || 'Class'}_Marks_Results.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Part 20: Print Results
  const handlePrintResults = () => {
    if (IS_WEB) {
      window.print();
    }
  };

  // Part 21: Download Report
  const handleDownloadReport = () => {
    if (IS_WEB) {
      window.print();
    }
  };

  // Error state handling (Part 24)
  const hasError = examsError || classesError || studentsError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bodyWorkspace}>
        {/* Top Header */}
        <MarksTopHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Header */}
          <MarksBanner />

          {/* Part 24: Error State handling with Retry */}
          {hasError ? (
            <View style={styles.errorCard}>
              <Text style={{ fontSize: 36 }}>⚠️</Text>
              <Text style={styles.errorTitle}>Unable to load results</Text>
              <Text style={styles.errorSub}>
                Please check your network connection or server status.
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Filters Bar */}
              <MarksFiltersBar
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                exams={exams}
                selectedExamId={selectedExamId}
                onSelectExam={setSelectedExamId}
                subjects={subjectsList}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={setSelectedSubjectId}
                academicYear={academicYear}
                onSelectAcademicYear={setAcademicYear}
                onViewResults={handleRefresh}
              />

              {/* Quick Actions */}
              <MarksQuickActions
                onEnterMarks={() => setIsEnterModalOpen(true)}
                onExportResults={handleExportResults}
                onPrintResults={handlePrintResults}
                onDownloadReport={handleDownloadReport}
              />

              {/* Performance Summary KPI Cards */}
              <MarksPerformanceSummary data={summaryMetrics} />

              {/* Main Content Layout: Table + Analytics Side Panel */}
              <View style={[styles.layoutRow, !isDesktop && styles.layoutColumn]}>
                {/* Left Column: Student Results Table */}
                <View style={[styles.tableCol, !isDesktop && { width: '100%' }]}>
                  {studentsLoading || examsLoading || classesLoading ? (
                    <LoadingScreen message="Loading student marks & results..." />
                  ) : (
                    <StudentResultsTable
                      students={studentResults}
                      subjects={activeDisplaySubjects}
                      onEditStudentMarks={(id) => setEditingStudentId(id)}
                      onViewStudentCard={(id) => setViewingStudentId(id)}
                      onOpenEnterMarks={() => setIsEnterModalOpen(true)}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  )}
                </View>

                {/* Right Column: Analytics Side Panel (~340px) */}
                <View style={[styles.analyticsCol, !isDesktop && { width: '100%', maxWidth: '100%' }]}>
                  <MarksAnalyticsPanel
                    classAverage={summaryMetrics.classAverage}
                    highestScore={summaryMetrics.highestScore}
                    lowestScore={summaryMetrics.lowestScore}
                    passRate={summaryMetrics.passRate}
                    totalStudents={summaryMetrics.totalStudents}
                    subjectPerformances={subjectPerformances}
                    gradeDistributions={gradeDistributions}
                    topPerformers={topPerformers}
                  />
                </View>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Interactive Enter Marks Modal */}
      <EnterMarksModal
        visible={isEnterModalOpen}
        onClose={() => setIsEnterModalOpen(false)}
        examName={selectedExam?.name ?? 'Mid-Term Examination 2026'}
        className={selectedClass?.name ?? 'Class 10 - A'}
        examSubjects={examSubjects}
        students={rawStudents ?? []}
        onMarksSaved={handleRefresh}
        onPublishResults={() => setIsPublished(true)}
      />

      {/* Interactive Edit Single Student Marks Modal */}
      <EditStudentMarksModal
        visible={editingStudentId !== null}
        onClose={() => setEditingStudentId(null)}
        student={selectedStudentEditing}
        examSubjects={examSubjects}
        onSaved={handleRefresh}
      />

      {/* Interactive View Student Detail Report Modal */}
      <ViewStudentResultModal
        visible={viewingStudentId !== null}
        onClose={() => setViewingStudentId(null)}
        student={selectedStudentDetail}
        examName={selectedExam?.name ?? 'Mid-Term Examination 2026'}
        className={selectedClass?.name ?? 'Class 10 - A'}
        subjects={subjectsList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bodyWorkspace: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  layoutRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  layoutColumn: {
    flexDirection: 'column',
  },
  tableCol: {
    flex: 1,
    minWidth: 0,
  },
  analyticsCol: {
    width: 340,
    maxWidth: 340,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 12,
    marginVertical: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
  },
  errorSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
