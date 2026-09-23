/**
 * TeacherAttendanceScreen — Mark attendance for a class.
 *
 * Flow: Select class → load student roster → toggle present/absent/late →
 *       submit to POST /attendance/class/{id}/mark
 *       On submit: notifications fire to absent students + their parents.
 *
 * API:
 *   GET  /teacher/me/classes
 *   GET  /teacher/class/{id}/students
 *   POST /attendance/class/{id}/mark
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Platform, Alert,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F1F5F9',
  card: '#FFFFFF',
  border: '#E2E8F0',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  green: '#10B981',
  greenLight: '#D1FAE5',
  red: '#EF4444',
  redLight: '#FEE2E2',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  textDark: '#0F172A',
  textMid: '#334155',
  textSub: '#64748B',
  textLight: '#94A3B8',
};

type AttStatus = 'present' | 'absent' | 'late';

async function fetchClasses() {
  return await apiClient.get<any[]>('/teacher/me/classes');
}
async function fetchClassStudents(classId: string) {
  return await apiClient.get<any[]>(`/teacher/class/${classId}/students`);
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function StatusButton({ label, icon, active, color, onPress }: {
  label: string; icon: string; active: boolean; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.statusBtn, active && { backgroundColor: color, borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text style={[styles.statusBtnLabel, active && { color: '#FFF' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function TeacherAttendanceScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: classes, loading: classesLoading } = useApi(fetchClasses);
  const { data: students, loading: studentsLoading, refetch } = useApi(
    async () => {
      if (!selectedClassId) return [];
      const s = await fetchClassStudents(selectedClassId);
      // Default everyone to present
      const init: Record<string, AttStatus> = {};
      s.forEach((st: any) => { init[st.id] = 'present'; });
      setStatuses(init);
      setSubmitted(false);
      return s;
    },
    [selectedClassId]
  );

  const presentCount = Object.values(statuses).filter(v => v === 'present').length;
  const absentCount  = Object.values(statuses).filter(v => v === 'absent').length;
  const lateCount    = Object.values(statuses).filter(v => v === 'late').length;
  const total        = (students ?? []).length;

  async function handleSubmit() {
    if (!selectedClassId || !students || students.length === 0) return;
    setSubmitting(true);
    try {
      const records = students.map((s: any) => ({
        student_id: s.id,
        status: statuses[s.id] ?? 'present',
      }));
      await apiClient.post(`/attendance/class/${selectedClassId}/mark`, {
        date: today,
        records,
      });
      setSubmitted(true);
      if (!IS_WEB) Alert.alert('Success', 'Attendance marked successfully!');
    } catch (err: any) {
      if (!IS_WEB) Alert.alert('Error', err?.response?.data?.detail ?? 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedClass = (classes ?? []).find((c: any) => c.id === selectedClassId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Mark Attendance</Text>
            <Text style={styles.pageSubtitle}>📅 {today}</Text>
          </View>
        </View>

        {/* Class Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT CLASS</Text>
          {classesLoading ? (
            <View style={styles.loadingPill}><Text style={styles.textSub}>Loading classes…</Text></View>
          ) : (classes ?? []).length === 0 ? (
            <View style={styles.emptyNote}>
              <Text style={styles.textSub}>No classes assigned. Contact admin.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.classTabs}>
                {(classes ?? []).map((cls: any) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[styles.classTab, selectedClassId === cls.id && styles.classTabActive]}
                    onPress={() => setSelectedClassId(cls.id)}
                  >
                    <Text style={[styles.classTabText, selectedClassId === cls.id && styles.classTabTextActive]}>
                      {cls.name}
                    </Text>
                    <Text style={[styles.classCount, selectedClassId === cls.id && { color: '#FFF' }]}>
                      {cls.student_count} students
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Student List */}
        {selectedClassId && (
          <>
            {/* Summary strip */}
            {total > 0 && (
              <View style={styles.summaryStrip}>
                <View style={[styles.summaryChip, { backgroundColor: C.greenLight }]}>
                  <Text style={[styles.summaryNum, { color: C.green }]}>{presentCount}</Text>
                  <Text style={[styles.summaryLbl, { color: C.green }]}>Present</Text>
                </View>
                <View style={[styles.summaryChip, { backgroundColor: C.redLight }]}>
                  <Text style={[styles.summaryNum, { color: C.red }]}>{absentCount}</Text>
                  <Text style={[styles.summaryLbl, { color: C.red }]}>Absent</Text>
                </View>
                <View style={[styles.summaryChip, { backgroundColor: C.amberLight }]}>
                  <Text style={[styles.summaryNum, { color: C.amber }]}>{lateCount}</Text>
                  <Text style={[styles.summaryLbl, { color: C.amber }]}>Late</Text>
                </View>
                <View style={[styles.summaryChip, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={[styles.summaryNum, { color: C.textSub }]}>{total}</Text>
                  <Text style={[styles.summaryLbl, { color: C.textSub }]}>Total</Text>
                </View>
              </View>
            )}

            {studentsLoading ? (
              <LoadingScreen message="Loading roster…" />
            ) : (students ?? []).length === 0 ? (
              <View style={styles.emptyNote}>
                <Text style={styles.textSub}>No students enrolled in this class.</Text>
              </View>
            ) : (
              <View style={styles.studentList}>
                {(students ?? []).map((s: any, idx: number) => {
                  const status = statuses[s.id] ?? 'present';
                  return (
                    <View key={s.id} style={styles.studentRow}>
                      <Text style={styles.rollNum}>{String(idx + 1).padStart(2, '0')}</Text>
                      <View style={[styles.avatarSm, { backgroundColor: C.purple + '20' }]}>
                        <Text style={[styles.avatarSmTxt, { color: C.purple }]}>{initials(s.name)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{s.name}</Text>
                        <Text style={styles.studentSub}>Roll {s.roll_number ?? '—'}</Text>
                      </View>
                      <View style={styles.statusBtnGroup}>
                        <StatusButton label="P" icon="✅" active={status === 'present'} color={C.green}  onPress={() => setStatuses(p => ({ ...p, [s.id]: 'present' }))} />
                        <StatusButton label="A" icon="❌" active={status === 'absent'}  color={C.red}    onPress={() => setStatuses(p => ({ ...p, [s.id]: 'absent'  }))} />
                        <StatusButton label="L" icon="⏰" active={status === 'late'}    color={C.amber}  onPress={() => setStatuses(p => ({ ...p, [s.id]: 'late'    }))} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Submit */}
            {(students ?? []).length > 0 && !submitted && (
              <View style={styles.submitRow}>
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  <Text style={styles.submitBtnText}>
                    {submitting ? 'Submitting…' : `✅  Submit Attendance for ${selectedClass?.name}`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {submitted && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✅ Attendance submitted! Absent students + parents have been notified.</Text>
                <TouchableOpacity onPress={() => { setSubmitted(false); refetch(); }}>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {!selectedClassId && !classesLoading && (classes ?? []).length > 0 && (
          <View style={styles.emptyNote}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>📊</Text>
            <Text style={[styles.textSub, { textAlign: 'center', marginTop: 8 }]}>
              Select a class above to mark attendance
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingTop: IS_WEB ? SIZES.lg : SIZES.xl,
    paddingBottom: SIZES.md,
  },
  pageTitle: { ...FONTS.h2, color: C.textDark, fontWeight: '700' },
  pageSubtitle: { ...FONTS.body2, color: C.textSub, marginTop: 2 },

  section: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.sm },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: C.textLight,
    letterSpacing: 1.2, marginBottom: SIZES.sm,
  },
  classTabs: { flexDirection: 'row', gap: SIZES.sm },
  classTab: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    minWidth: 110,
    ...SHADOWS.small,
  },
  classTabActive: { backgroundColor: C.purple, borderColor: C.purple },
  classTabText: { ...FONTS.body2, color: C.textMid, fontWeight: '700' },
  classTabTextActive: { color: '#FFF' },
  classCount: { ...FONTS.caption, color: C.textSub, marginTop: 2 },

  summaryStrip: {
    flexDirection: 'row',
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.sm,
    gap: SIZES.sm,
  },
  summaryChip: {
    flex: 1, alignItems: 'center', borderRadius: 12,
    paddingVertical: SIZES.sm,
  },
  summaryNum: { fontSize: 20, fontWeight: '800' },
  summaryLbl: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  studentList: { paddingHorizontal: SIZES.lg, gap: SIZES.sm },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: SIZES.sm,
    gap: SIZES.sm,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOWS.small,
  },
  rollNum: { ...FONTS.caption, color: C.textLight, width: 22, textAlign: 'center' },
  avatarSm: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarSmTxt: { fontSize: 13, fontWeight: '700' },
  studentName: { ...FONTS.body2, color: C.textDark, fontWeight: '700' },
  studentSub: { ...FONTS.caption, color: C.textSub },
  statusBtnGroup: { flexDirection: 'row', gap: 4 },
  statusBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    gap: 1,
  },
  statusBtnLabel: { fontSize: 10, fontWeight: '700', color: C.textSub },

  submitRow: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
  },
  submitBtn: {
    backgroundColor: C.purple,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
    backgroundColor: C.greenLight,
    borderRadius: 12,
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  successText: { ...FONTS.body2, color: C.green, fontWeight: '600', flex: 1 },
  editLink: { ...FONTS.body2, color: C.purple, fontWeight: '700' },

  emptyNote: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
    alignItems: 'center',
  },
  loadingPill: { padding: SIZES.md, alignItems: 'center' },
  textSub: { ...FONTS.body2, color: C.textSub },
});

