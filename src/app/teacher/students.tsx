/**
 * TeacherStudentsScreen — Full student roster for the teacher.
 * Shows all students across teacher's classes with attendance %, parent info.
 * Teacher can tap a student to see their marks, attendance, and parent contact.
 *
 * API: GET /api/v1/teacher/me/students
 *      GET /api/v1/teacher/me/classes
 *      GET /api/v1/teacher/class/{id}/students
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Platform, TextInput,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

// ─── Color palette ────────────────────────────────────────────────────────────
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

// ─── Service calls ────────────────────────────────────────────────────────────
async function fetchClasses() {
  const res = await apiClient.get('/teacher/me/classes');
  return res.data as any[];
}
async function fetchStudents(classId?: string) {
  const url = classId ? `/teacher/class/${classId}/students` : '/teacher/me/students';
  const res = await apiClient.get(url);
  return res.data as any[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function attColor(pct?: number) {
  if (!pct) return C.textLight;
  if (pct >= 85) return C.green;
  if (pct >= 70) return C.amber;
  return C.red;
}
function attBg(pct?: number) {
  if (!pct) return '#F8FAFC';
  if (pct >= 85) return C.greenLight;
  if (pct >= 70) return C.amberLight;
  return C.redLight;
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StudentCard({ student, onPress }: { student: any; onPress: () => void }) {
  const pct = student.attendance_pct;
  const parentName = student.parents?.[0]?.name;
  const parentPhone = student.parents?.[0]?.phone;

  return (
    <TouchableOpacity style={styles.studentCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.avatarCircle, { backgroundColor: C.purple + '20' }]}>
        <Text style={[styles.avatarText, { color: C.purple }]}>{initials(student.name)}</Text>
      </View>

      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentMeta}>
          Roll {student.roll_number ?? '—'} · {student.class_name ?? 'N/A'}
        </Text>
        {parentName && (
          <View style={styles.parentRow}>
            <Text style={styles.parentIcon}>👨‍👩‍👧</Text>
            <Text style={styles.parentName}>{parentName}</Text>
            {parentPhone && <Text style={styles.parentPhone}> · {parentPhone}</Text>}
          </View>
        )}
      </View>

      <View style={[styles.attBadge, { backgroundColor: attBg(pct) }]}>
        <Text style={[styles.attPct, { color: attColor(pct) }]}>
          {pct != null ? `${pct}%` : '—'}
        </Text>
        <Text style={[styles.attLabel, { color: attColor(pct) }]}>Att.</Text>
      </View>
    </TouchableOpacity>
  );
}

function StudentDetail({ student, onClose }: { student: any; onClose: () => void }) {
  return (
    <View style={styles.detailOverlay}>
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View style={[styles.avatarCircleLg, { backgroundColor: C.purple + '20' }]}>
            <Text style={[styles.avatarTextLg, { color: C.purple }]}>{initials(student.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailName}>{student.name}</Text>
            <Text style={styles.detailMeta}>{student.class_name} · Roll {student.roll_number ?? '—'}</Text>
            <Text style={styles.detailEmail}>{student.email}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>📊 Attendance</Text>
          <View style={[styles.attBadgeLg, { backgroundColor: attBg(student.attendance_pct) }]}>
            <Text style={[styles.attPctLg, { color: attColor(student.attendance_pct) }]}>
              {student.attendance_pct != null ? `${student.attendance_pct}%` : 'No data'}
            </Text>
          </View>
        </View>

        {student.parents?.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>👨‍👩‍👧 Parents / Guardians</Text>
            {student.parents.map((p: any) => (
              <View key={p.id} style={styles.parentDetailRow}>
                <View>
                  <Text style={styles.parentDetailName}>{p.name}</Text>
                  <Text style={styles.parentDetailContact}>{p.email}</Text>
                  {p.phone && <Text style={styles.parentDetailContact}>📞 {p.phone}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TeacherStudentsScreen() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const { data: classes, loading: classesLoading } = useApi(fetchClasses);
  const { data: students, loading: studentsLoading, error, refetch } = useApi(
    () => fetchStudents(selectedClassId ?? undefined),
    [selectedClassId]
  );

  const loading = classesLoading || studentsLoading;

  const filtered = (students ?? []).filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_number ?? '').includes(search) ||
    (s.parents?.[0]?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !students) return <LoadingScreen message="Loading students..." />;
  if (error) return <ErrorScreen error={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>My Students</Text>
            <Text style={styles.pageSubtitle}>
              {filtered.length} student{filtered.length !== 1 ? 's' : ''} across {(classes ?? []).length} class{(classes ?? []).length !== 1 ? 'es' : ''}
            </Text>
          </View>
        </View>

        {/* Class filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classTabsScroll}>
          <View style={styles.classTabs}>
            <TouchableOpacity
              style={[styles.classTab, !selectedClassId && styles.classTabActive]}
              onPress={() => setSelectedClassId(null)}
            >
              <Text style={[styles.classTabText, !selectedClassId && styles.classTabTextActive]}>All</Text>
            </TouchableOpacity>
            {(classes ?? []).map((cls: any) => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classTab, selectedClassId === cls.id && styles.classTabActive]}
                onPress={() => setSelectedClassId(cls.id)}
              >
                <Text style={[styles.classTabText, selectedClassId === cls.id && styles.classTabTextActive]}>
                  {cls.name}
                </Text>
                <View style={styles.classCountBadge}>
                  <Text style={styles.classCountText}>{cls.student_count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Search */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, roll no., or parent..."
            placeholderTextColor={C.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: C.textSub, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Student list */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listPad}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎓</Text>
              <Text style={styles.emptyText}>No students found</Text>
              <Text style={styles.emptySubText}>Try a different class or search term</Text>
            </View>
          ) : (
            filtered.map((s: any) => (
              <StudentCard key={s.id} student={s} onPress={() => setSelectedStudent(s)} />
            ))
          )}
        </ScrollView>
      </View>

      {selectedStudent && (
        <StudentDetail student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
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

  classTabsScroll: { maxHeight: 52 },
  classTabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
    paddingBottom: SIZES.sm,
  },
  classTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  classTabActive: { backgroundColor: C.purple, borderColor: C.purple },
  classTabText: { ...FONTS.body2, color: C.textSub, fontWeight: '600' },
  classTabTextActive: { color: '#FFF' },
  classCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  classCountText: { fontSize: 10, fontWeight: '700', color: '#FFF' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.sm,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    ...FONTS.body2,
    color: C.textDark,
  },

  listPad: { paddingHorizontal: SIZES.lg, paddingBottom: 80, gap: SIZES.sm },

  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: SIZES.md,
    gap: SIZES.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700' },
  studentInfo: { flex: 1 },
  studentName: { ...FONTS.body1, color: C.textDark, fontWeight: '700' },
  studentMeta: { ...FONTS.caption, color: C.textSub, marginTop: 1 },
  parentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  parentIcon: { fontSize: 12 },
  parentName: { ...FONTS.caption, color: C.purple, fontWeight: '600' },
  parentPhone: { ...FONTS.caption, color: C.textSub },
  attBadge: {
    alignItems: 'center', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10,
  },
  attPct: { fontSize: 15, fontWeight: '700' },
  attLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { ...FONTS.h4, color: C.textMid },
  emptySubText: { ...FONTS.body2, color: C.textSub },

  // Detail modal
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: SIZES.lg,
  },
  detailCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: SIZES.lg,
    width: '100%',
    maxWidth: 480,
    gap: SIZES.md,
    ...SHADOWS.medium,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  avatarCircleLg: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarTextLg: { fontSize: 22, fontWeight: '700' },
  detailName: { ...FONTS.h3, color: C.textDark, fontWeight: '700' },
  detailMeta: { ...FONTS.body2, color: C.textSub },
  detailEmail: { ...FONTS.caption, color: C.purple },
  closeBtn: { padding: SIZES.sm, borderRadius: 20, backgroundColor: '#F1F5F9' },
  closeBtnText: { fontSize: 14, color: C.textSub, fontWeight: '700' },
  detailSection: { gap: 8 },
  detailSectionTitle: { ...FONTS.body2, color: C.textDark, fontWeight: '700' },
  attBadgeLg: { alignSelf: 'flex-start', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 20 },
  attPctLg: { fontSize: 24, fontWeight: '800' },
  parentDetailRow: {
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: SIZES.sm,
    gap: 4,
  },
  parentDetailName: { ...FONTS.body2, color: C.textDark, fontWeight: '700' },
  parentDetailContact: { ...FONTS.caption, color: C.textSub },
});

