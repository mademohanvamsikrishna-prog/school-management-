/**
 * TeacherMarksScreen — Enter / update marks for students.
 *
 * Flow: Select exam → select class → select subject → student mark entry →
 *       submit each mark via POST /marks/enter
 *       On submit: notifications fire to student + their parents.
 *
 * API:
 *   GET  /marks/exams
 *   GET  /teacher/me/classes
 *   GET  /teacher/class/{id}/students
 *   POST /marks/enter
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Platform, TextInput, Alert,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { getExams } from '../../services/marks';
import { LoadingScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F1F5F9', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleLight: '#F5F3FF',
  green: '#10B981', greenLight: '#D1FAE5',
  red: '#EF4444', redLight: '#FEE2E2',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

async function fetchClasses()  { return (await apiClient.get('/teacher/me/classes')).data as any[]; }
async function fetchStudents(classId: string) {
  return (await apiClient.get(`/teacher/class/${classId}/students`)).data as any[];
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

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function SelectCard({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <View style={msStyles.selectCard}>
      <Text style={msStyles.selectLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function TeacherMarksScreen() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});   // studentId → marks string
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: exams,   loading: examsLoading   } = useApi(getExams);
  const { data: classes, loading: classesLoading } = useApi(fetchClasses);
  const { data: students, loading: studentsLoading } = useApi(
    async () => {
      if (!selectedClassId) return [];
      return fetchStudents(selectedClassId);
    },
    [selectedClassId]
  );

  const selectedExam  = useMemo(() => (exams  ?? []).find((e: any) => e.id === selectedExamId),  [exams,  selectedExamId]);
  const selectedClass = useMemo(() => (classes ?? []).find((c: any) => c.id === selectedClassId), [classes, selectedClassId]);

  // Get exam subjects for the selected class
  const examSubjects: any[] = useMemo(() => {
    if (!selectedExam) return [];
    return (selectedExam.subjects ?? []).filter(
      (es: any) => !selectedClassId || es.class_id === selectedClassId
    );
  }, [selectedExam, selectedClassId]);

  async function submitMark(student: any, examSubject: any) {
    const key = `${student.id}:${examSubject.id}`;
    const rawMark = marksMap[key];
    if (!rawMark) {
      if (!IS_WEB) Alert.alert('Missing', 'Please enter marks before submitting.');
      return;
    }
    const numMark = parseFloat(rawMark);
    if (isNaN(numMark) || numMark < 0 || numMark > examSubject.max_marks) {
      if (!IS_WEB) Alert.alert('Invalid', `Marks must be between 0 and ${examSubject.max_marks}.`);
      return;
    }
    setSavingId(key);
    try {
      const grade = gradeFromPct((numMark / examSubject.max_marks) * 100);
      await apiClient.post('/marks/enter', {
        exam_subject_id: examSubject.id,
        student_id: student.id,
        marks_obtained: numMark,
        grade,
        remarks: '',
      });
      setSubmittedIds(p => new Set(p).add(key));
    } catch (err: any) {
      if (!IS_WEB) Alert.alert('Error', err?.response?.data?.detail ?? 'Failed to save mark.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <SafeAreaView style={msStyles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={msStyles.pageHeader}>
          <Text style={msStyles.pageTitle}>Enter Marks</Text>
          <Text style={msStyles.pageSubtitle}>Select exam + class, then fill in marks per student</Text>
        </View>

        {/* Step 1: Exam */}
        <SelectCard label="STEP 1 — SELECT EXAM" value={selectedExam?.name ?? ''}>
          {examsLoading ? (
            <Text style={msStyles.loadingTxt}>Loading exams…</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={msStyles.chipRow}>
                {(exams ?? []).map((ex: any) => (
                  <TouchableOpacity
                    key={ex.id}
                    style={[msStyles.chip, selectedExamId === ex.id && msStyles.chipActive]}
                    onPress={() => setSelectedExamId(ex.id)}
                  >
                    <Text style={[msStyles.chipText, selectedExamId === ex.id && msStyles.chipTextActive]}>{ex.name}</Text>
                    <Text style={[msStyles.chipSub, selectedExamId === ex.id && { color: '#FFF' }]}>{ex.term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </SelectCard>

        {/* Step 2: Class */}
        {selectedExamId && (
          <SelectCard label="STEP 2 — SELECT CLASS" value={selectedClass?.name ?? ''}>
            {classesLoading ? (
              <Text style={msStyles.loadingTxt}>Loading classes…</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={msStyles.chipRow}>
                  {(classes ?? []).map((cls: any) => (
                    <TouchableOpacity
                      key={cls.id}
                      style={[msStyles.chip, selectedClassId === cls.id && msStyles.chipActive]}
                      onPress={() => setSelectedClassId(cls.id)}
                    >
                      <Text style={[msStyles.chipText, selectedClassId === cls.id && msStyles.chipTextActive]}>{cls.name}</Text>
                      <Text style={[msStyles.chipSub, selectedClassId === cls.id && { color: '#FFF' }]}>{cls.student_count} students</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </SelectCard>
        )}

        {/* Step 3: Mark Entry */}
        {selectedExamId && selectedClassId && (
          <>
            {studentsLoading ? (
              <LoadingScreen message="Loading students…" />
            ) : examSubjects.length === 0 ? (
              <View style={msStyles.emptyNote}>
                <Text style={msStyles.emptyIcon}>📝</Text>
                <Text style={msStyles.emptyText}>No subjects configured for this exam + class.</Text>
                <Text style={msStyles.emptySubText}>Admin needs to set up ExamSubject entries.</Text>
              </View>
            ) : (
              examSubjects.map((es: any) => (
                <View key={es.id} style={msStyles.subjectBlock}>
                  <View style={msStyles.subjectHeader}>
                    <View style={[msStyles.subjectDot, { backgroundColor: C.purple }]} />
                    <Text style={msStyles.subjectName}>{es.subject_name ?? 'Subject'}</Text>
                    <View style={msStyles.maxMarksBadge}>
                      <Text style={msStyles.maxMarksTxt}>/ {es.max_marks}</Text>
                    </View>
                  </View>

                  {(students ?? []).map((s: any) => {
                    const key = `${s.id}:${es.id}`;
                    const done = submittedIds.has(key);
                    const saving = savingId === key;
                    const val = marksMap[key] ?? '';
                    const numVal = parseFloat(val);
                    const pct = !isNaN(numVal) ? (numVal / es.max_marks) * 100 : null;
                    const grade = pct !== null ? gradeFromPct(pct) : '';

                    return (
                      <View key={s.id} style={[msStyles.markRow, done && msStyles.markRowDone]}>
                        <View style={[msStyles.avatarSm, { backgroundColor: C.purple + '20' }]}>
                          <Text style={[msStyles.avatarSmTxt, { color: C.purple }]}>{initials(s.name)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={msStyles.sName}>{s.name}</Text>
                          <Text style={msStyles.sMeta}>Roll {s.roll_number ?? '—'}</Text>
                        </View>
                        {done ? (
                          <View style={msStyles.doneBadge}>
                            <Text style={msStyles.doneBadgeTxt}>✅ {val} ({grade})</Text>
                          </View>
                        ) : (
                          <View style={msStyles.inputGroup}>
                            {grade !== '' && (
                              <View style={msStyles.gradePill}>
                                <Text style={msStyles.gradeText}>{grade}</Text>
                              </View>
                            )}
                            <TextInput
                              style={msStyles.marksInput}
                              placeholder="Marks"
                              placeholderTextColor={C.textLight}
                              keyboardType="numeric"
                              value={val}
                              onChangeText={v => setMarksMap(p => ({ ...p, [key]: v }))}
                            />
                            <TouchableOpacity
                              style={[msStyles.saveBtn, saving && { opacity: 0.5 }]}
                              onPress={() => submitMark(s, es)}
                              disabled={saving}
                            >
                              <Text style={msStyles.saveBtnTxt}>{saving ? '…' : 'Save'}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </>
        )}

        {!selectedExamId && (
          <View style={msStyles.emptyNote}>
            <Text style={msStyles.emptyIcon}>🏆</Text>
            <Text style={msStyles.emptyText}>Select an exam to start entering marks</Text>
            <Text style={msStyles.emptySubText}>Students and parents are notified on each save</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const msStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  pageHeader: {
    paddingHorizontal: SIZES.lg,
    paddingTop: IS_WEB ? SIZES.lg : SIZES.xl,
    paddingBottom: SIZES.md,
  },
  pageTitle: { ...FONTS.h2, color: C.textDark, fontWeight: '700' },
  pageSubtitle: { ...FONTS.body2, color: C.textSub, marginTop: 2 },
  loadingTxt: { ...FONTS.body2, color: C.textSub, padding: SIZES.sm },

  selectCard: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOWS.small,
    gap: SIZES.sm,
  },
  selectLabel: {
    fontSize: 10, fontWeight: '700', color: C.textLight, letterSpacing: 1.2,
  },
  chipRow: { flexDirection: 'row', gap: SIZES.sm },
  chip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    minWidth: 120,
  },
  chipActive: { backgroundColor: C.purple, borderColor: C.purple },
  chipText: { ...FONTS.body2, color: C.textMid, fontWeight: '700' },
  chipTextActive: { color: '#FFF' },
  chipSub: { ...FONTS.caption, color: C.textSub, marginTop: 2 },

  subjectBlock: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: SIZES.sm,
    backgroundColor: C.purpleLight,
  },
  subjectDot: { width: 8, height: 8, borderRadius: 4 },
  subjectName: { ...FONTS.body1, color: C.purple, fontWeight: '700', flex: 1 },
  maxMarksBadge: {
    backgroundColor: C.card,
    borderRadius: 8,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
  },
  maxMarksTxt: { ...FONTS.caption, color: C.textSub, fontWeight: '700' },

  markRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: SIZES.sm,
  },
  markRowDone: { backgroundColor: '#F0FDF4' },
  avatarSm: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarSmTxt: { fontSize: 12, fontWeight: '700' },
  sName: { ...FONTS.body2, color: C.textDark, fontWeight: '600' },
  sMeta: { ...FONTS.caption, color: C.textSub },

  inputGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradePill: {
    backgroundColor: C.purpleLight,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  gradeText: { ...FONTS.caption, color: C.purple, fontWeight: '700' },
  marksInput: {
    width: 70,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
    ...FONTS.body2,
    color: C.textDark,
    textAlign: 'center',
    backgroundColor: C.card,
  },
  saveBtn: {
    backgroundColor: C.purple,
    borderRadius: 8,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 7,
  },
  saveBtnTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  doneBadge: {
    backgroundColor: C.greenLight,
    borderRadius: 8,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
  },
  doneBadgeTxt: { ...FONTS.caption, color: C.green, fontWeight: '700' },

  emptyNote: { alignItems: 'center', paddingVertical: SIZES.xl * 2, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { ...FONTS.h4, color: C.textMid, textAlign: 'center' },
  emptySubText: { ...FONTS.body2, color: C.textSub, textAlign: 'center' },
});

