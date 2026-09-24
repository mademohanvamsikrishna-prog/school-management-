/**
 * TeacherAssignmentsScreen — Create, view, and manage assignments.
 *
 * Tabs:
 *   • Active — current assignments
 *   • Create — form to create new assignment
 *   • Completed — past assignments
 *
 * APIs:
 *   GET  /teacher/me/assignments
 *   POST /teacher/me/assignments
 *   GET  /teacher/me/classes
 *   GET  /teacher/me/subjects
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, Alert, Platform,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen } from '../../components/ScreenStates';
import { SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleLight: '#F5F3FF',
  indigo: '#4F46E5', indigoLight: '#EEF2FF',
  green: '#10B981', greenLight: '#D1FAE5',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  red: '#EF4444', redLight: '#FEE2E2',
  blue: '#3B82F6', blueLight: '#DBEAFE',
  orange: '#F97316', orangeLight: '#FED7AA',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

async function fetchTeacherAssignments() {
  try { return await apiClient.get<any[]>('/teacher/me/assignments'); }
  catch { return []; }
}
async function fetchClasses() {
  return await apiClient.get<any[]>('/teacher/me/classes');
}
async function fetchSubjects() {
  try { return await apiClient.get<any[]>('/teacher/me/subjects'); }
  catch { return []; }
}

function dueDateColor(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0)  return { bg: C.redLight,    text: C.red    };
  if (days <= 2) return { bg: C.amberLight,  text: C.amber  };
  return { bg: C.greenLight, text: C.green };
}

function AssignmentCard({ item, onPress }: { item: any; onPress?: () => void }) {
  const { bg, text } = item.due_date ? dueDateColor(item.due_date) : { bg: C.purpleLight, text: C.purple };
  const submitted = item.submitted_count ?? 0;
  const total     = item.total_students ?? (item.class_name ? 30 : '—');

  return (
    <TouchableOpacity style={aStyles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={aStyles.cardHeader}>
        <View style={[aStyles.subjectBadge, { backgroundColor: C.indigoLight }]}>
          <Text style={[aStyles.subjectBadgeText, { color: C.indigo }]}>
            {item.subject_name ?? 'Subject'}
          </Text>
        </View>
        <View style={[aStyles.dueBadge, { backgroundColor: bg }]}>
          <Text style={[aStyles.dueText, { color: text }]}>
            Due: {item.due_date ? new Date(item.due_date).toLocaleDateString('en-IN') : '—'}
          </Text>
        </View>
      </View>

      <Text style={aStyles.cardTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={aStyles.cardDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}

      <View style={aStyles.cardFooter}>
        <View style={aStyles.metaRow}>
          <Text style={aStyles.metaIcon}>🏫</Text>
          <Text style={aStyles.metaText}>{item.class_name ?? 'All Classes'}</Text>
        </View>
        {item.max_marks && (
          <View style={aStyles.metaRow}>
            <Text style={aStyles.metaIcon}>🏆</Text>
            <Text style={aStyles.metaText}>{item.max_marks} marks</Text>
          </View>
        )}
        <View style={[aStyles.progressChip, { backgroundColor: C.purpleLight }]}>
          <Text style={[aStyles.progressText, { color: C.purple }]}>
            {submitted}/{total} submitted
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

type Tab = 'active' | 'create' | 'completed';

export default function TeacherAssignmentsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [dueDate, setDueDate]   = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [selClass, setSelClass] = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);

  const { data: assignments, loading, refetch } = useApi(fetchTeacherAssignments);
  const { data: classes }   = useApi(fetchClasses);
  const { data: subjects }  = useApi(fetchSubjects);

  const active    = (assignments ?? []).filter((a: any) => a.status !== 'completed' && a.status !== 'graded');
  const completed = (assignments ?? []).filter((a: any) => a.status === 'completed' || a.status === 'graded');

  const handleCreate = async () => {
    if (!title.trim() || !dueDate.trim()) {
      if (IS_WEB) window.alert('Title and due date are required.');
      else Alert.alert('Validation', 'Title and due date are required.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/teacher/me/assignments', {
        title: title.trim(),
        description: desc.trim() || undefined,
        due_date: dueDate,
        max_marks: maxMarks ? parseInt(maxMarks) : undefined,
        class_id: selClass || undefined,
        subject_id: selSubject || undefined,
      });
      setSuccess(true);
      setTitle(''); setDesc(''); setDueDate(''); setMaxMarks('');
      setSelClass(''); setSelSubject('');
      refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      if (IS_WEB) window.alert(e?.message ?? 'Failed to create assignment.');
      else Alert.alert('Error', e?.message ?? 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'active',    label: 'Active',    count: active.length    },
    { key: 'create',    label: '+ Create'                           },
    { key: 'completed', label: 'Completed', count: completed.length },
  ];

  return (
    <SafeAreaView style={aStyles.safeArea}>
      {/* Header */}
      <View style={aStyles.pageHeader}>
        <View>
          <Text style={aStyles.pageTitle}>Assignments</Text>
          <Text style={aStyles.pageSub}>{(assignments ?? []).length} total assignments</Text>
        </View>
        <TouchableOpacity
          style={aStyles.createBtn}
          onPress={() => setActiveTab('create')}
        >
          <Text style={aStyles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={aStyles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[aStyles.tab, activeTab === t.key && aStyles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[aStyles.tabText, activeTab === t.key && aStyles.tabTextActive]}>
              {t.label}
            </Text>
            {t.count != null && (
              <View style={[aStyles.countBadge, activeTab === t.key && { backgroundColor: '#FFF' }]}>
                <Text style={[aStyles.countText, activeTab === t.key && { color: C.purple }]}>
                  {t.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={aStyles.listPad}>
        {activeTab === 'active' && (
          <>
            {loading && !assignments ? (
              <LoadingScreen message="Loading assignments…" />
            ) : active.length === 0 ? (
              <View style={aStyles.emptyState}>
                <Text style={aStyles.emptyIcon}>📋</Text>
                <Text style={aStyles.emptyTitle}>No active assignments</Text>
                <Text style={aStyles.emptyBody}>Create an assignment using the + Create tab</Text>
              </View>
            ) : (
              active.map((a: any) => <AssignmentCard key={a.id} item={a} />)
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {completed.length === 0 ? (
              <View style={aStyles.emptyState}>
                <Text style={aStyles.emptyIcon}>✅</Text>
                <Text style={aStyles.emptyTitle}>No completed assignments</Text>
              </View>
            ) : (
              completed.map((a: any) => <AssignmentCard key={a.id} item={a} />)
            )}
          </>
        )}

        {activeTab === 'create' && (
          <View style={aStyles.formCard}>
            <Text style={aStyles.formTitle}>Create New Assignment</Text>
            <Text style={aStyles.formSub}>Fill in the details below to create an assignment for your class.</Text>

            {success && (
              <View style={aStyles.successBanner}>
                <Text style={aStyles.successText}>✅ Assignment created successfully!</Text>
              </View>
            )}

            <Text style={aStyles.label}>Assignment Title *</Text>
            <TextInput
              style={aStyles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Chapter 5 Exercise"
              placeholderTextColor={C.textLight}
            />

            <Text style={aStyles.label}>Description</Text>
            <TextInput
              style={[aStyles.input, aStyles.textarea]}
              value={desc}
              onChangeText={setDesc}
              placeholder="Describe the assignment..."
              placeholderTextColor={C.textLight}
              multiline
              numberOfLines={4}
            />

            <View style={aStyles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={aStyles.label}>Due Date * (YYYY-MM-DD)</Text>
                <TextInput
                  style={aStyles.input}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="2026-10-01"
                  placeholderTextColor={C.textLight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={aStyles.label}>Max Marks</Text>
                <TextInput
                  style={aStyles.input}
                  value={maxMarks}
                  onChangeText={setMaxMarks}
                  placeholder="100"
                  placeholderTextColor={C.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Class selector */}
            <Text style={aStyles.label}>Class</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(classes ?? []).map((cls: any) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[aStyles.chipBtn, selClass === cls.id && aStyles.chipBtnActive]}
                    onPress={() => setSelClass(selClass === cls.id ? '' : cls.id)}
                  >
                    <Text style={[aStyles.chipText, selClass === cls.id && aStyles.chipTextActive]}>
                      {cls.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Subject selector */}
            <Text style={aStyles.label}>Subject</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(subjects ?? []).map((s: any) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[aStyles.chipBtn, selSubject === s.id && aStyles.chipBtnActive]}
                    onPress={() => setSelSubject(selSubject === s.id ? '' : s.id)}
                  >
                    <Text style={[aStyles.chipText, selSubject === s.id && aStyles.chipTextActive]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[aStyles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={submitting}
            >
              <Text style={aStyles.submitBtnText}>
                {submitting ? 'Creating…' : '📋  Create Assignment'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const aStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingTop: IS_WEB ? SIZES.lg : SIZES.xl,
    paddingBottom: SIZES.md,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: C.textDark },
  pageSub: { fontSize: 12, color: C.textSub, marginTop: 2 },
  createBtn: {
    backgroundColor: C.purple, borderRadius: 10,
    paddingHorizontal: SIZES.md, paddingVertical: 8,
  },
  createBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: SIZES.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SIZES.md,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: C.purple },
  tabText: { fontSize: 13, fontWeight: '600', color: C.textSub },
  tabTextActive: { color: C.purple },
  countBadge: {
    backgroundColor: C.purpleLight, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  countText: { fontSize: 10, fontWeight: '700', color: C.purple },

  listPad: { padding: SIZES.lg, gap: SIZES.sm },

  card: {
    backgroundColor: C.card, borderRadius: 14,
    padding: SIZES.md, borderWidth: 1, borderColor: C.border,
    ...SHADOWS.small, gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  subjectBadgeText: { fontSize: 11, fontWeight: '700' },
  dueBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  dueText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textDark },
  cardDesc: { fontSize: 12, color: C.textSub, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 11, color: C.textSub },
  progressChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 'auto' as any },
  progressText: { fontSize: 11, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textMid },
  emptyBody: { fontSize: 13, color: C.textSub },

  // Create form
  formCard: {
    backgroundColor: C.card, borderRadius: 14,
    padding: SIZES.lg, borderWidth: 1, borderColor: C.border,
    ...SHADOWS.small, gap: 4,
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  formSub: { fontSize: 12, color: C.textSub, marginBottom: SIZES.md },
  formRow: { flexDirection: 'row', gap: SIZES.md },
  label: { fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: SIZES.md, paddingVertical: 10,
    fontSize: 13, color: C.textDark, backgroundColor: '#FAFBFF',
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  chipBtn: {
    paddingHorizontal: SIZES.md, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.card,
  },
  chipBtnActive: { backgroundColor: C.purple, borderColor: C.purple },
  chipText: { fontSize: 12, fontWeight: '600', color: C.textSub },
  chipTextActive: { color: '#FFF' },
  successBanner: {
    backgroundColor: C.greenLight, borderRadius: 10, padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  successText: { fontSize: 13, fontWeight: '700', color: C.green },
  submitBtn: {
    backgroundColor: C.purple, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    marginTop: SIZES.md, ...SHADOWS.medium,
  },
  submitBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
