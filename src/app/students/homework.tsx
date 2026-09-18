/**
 * Homework — Full CRUD screen backed by /api/v1/students/dashboard/assignments.
 *
 * Features:
 *  - Real data fetching with pull-to-refresh (RefreshControl)
 *  - Status filter tabs (All / Pending / Completed / Overdue)
 *  - Add modal  → POST /assignments
 *  - Edit modal → PATCH /assignments/{id}
 *  - Mark as Done → PATCH status=completed (optimistic UI)
 *  - Delete with confirmation alert → DELETE /assignments/{id} (optimistic UI)
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  markAssignmentDone,
  type Assignment,
  type AssignmentStatus,
  type AssignmentCreate,
  type AssignmentUpdate,
} from '../../services/dashboardCrud';

const IS_WEB = Platform.OS === 'web';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<AssignmentStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending:     { label: 'Pending',     color: '#F59E0B', bg: '#FFFBEB', icon: '⏳' },
  in_progress: { label: 'In Progress', color: '#3B82F6', bg: '#EFF6FF', icon: '🔄' },
  completed:   { label: 'Completed',   color: '#10B981', bg: '#ECFDF5', icon: '✅' },
  submitted:   { label: 'Submitted',   color: '#8B5CF6', bg: '#F5F3FF', icon: '📤' },
  overdue:     { label: 'Overdue',     color: '#EF4444', bg: '#FEF2F2', icon: '🔴' },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  low:    { color: '#94A3B8', label: 'Low' },
  medium: { color: '#F59E0B', label: 'Medium' },
  high:   { color: '#EF4444', label: 'High' },
  urgent: { color: '#7C3AED', label: '🚨 Urgent' },
};

type FilterTab = 'all' | AssignmentStatus;
const FILTER_TABS: FilterTab[] = ['all', 'pending', 'in_progress', 'completed', 'overdue'];

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------
interface FormState {
  subject_name: string;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  submission_notes: string;
}

const EMPTY_FORM: FormState = {
  subject_name: '',
  title: '',
  description: '',
  due_date: '',
  priority: 'medium',
  submission_notes: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HomeworkScreen() {
  const { data: response, loading, refetch } = useApi(() => getAssignments({ limit: 50 }));
  const [filter, setFilter] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Optimistic local state
  const [localItems, setLocalItems] = useState<Assignment[] | null>(null);
  const items: Assignment[] = localItems ?? (response?.items ?? []);

  // -------------------------------------------------------------------------
  // Refresh
  // -------------------------------------------------------------------------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLocalItems(null);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // -------------------------------------------------------------------------
  // Filter
  // -------------------------------------------------------------------------
  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter(i => i.status === filter)),
    [items, filter],
  );

  // -------------------------------------------------------------------------
  // Open modals
  // -------------------------------------------------------------------------
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (item: Assignment) => {
    setEditingId(item.id);
    setForm({
      subject_name: item.subject_name,
      title: item.title,
      description: item.description,
      due_date: item.due_date,
      priority: item.priority,
      submission_notes: item.submission_notes ?? '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  // -------------------------------------------------------------------------
  // Save (create or update)
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    if (!form.subject_name.trim() || !form.title.trim() || !form.due_date.trim()) {
      Alert.alert('Missing fields', 'Subject, title and due date are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        // PATCH — partial update
        const patch: AssignmentUpdate = {
          subject_name: form.subject_name,
          title: form.title,
          description: form.description,
          due_date: form.due_date,
          priority: form.priority as any,
          submission_notes: form.submission_notes || undefined,
        };
        const updated = await updateAssignment(editingId, patch);
        // Optimistic update
        setLocalItems(prev => (prev ?? items).map(i => (i.id === editingId ? updated : i)));
      } else {
        // POST — create
        const payload: AssignmentCreate = {
          subject_name: form.subject_name,
          title: form.title,
          description: form.description,
          due_date: form.due_date,
          priority: form.priority as any,
        };
        const created = await createAssignment(payload);
        setLocalItems(prev => [created, ...(prev ?? items)]);
      }
      closeModal();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not save assignment.');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Mark done
  // -------------------------------------------------------------------------
  const handleMarkDone = async (item: Assignment) => {
    if (item.status === 'completed') return;
    // Optimistic
    setLocalItems(prev =>
      (prev ?? items).map(i => (i.id === item.id ? { ...i, status: 'completed' as AssignmentStatus } : i)),
    );
    try {
      await markAssignmentDone(item.id);
    } catch (err: any) {
      // Revert
      setLocalItems(prev =>
        (prev ?? items).map(i => (i.id === item.id ? { ...i, status: item.status } : i)),
      );
      Alert.alert('Error', err?.message ?? 'Could not update assignment.');
    }
  };

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  const handleDelete = (item: Assignment) => {
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic removal
            setLocalItems(prev => (prev ?? items).filter(i => i.id !== item.id));
            try {
              await deleteAssignment(item.id);
            } catch (err: any) {
              // Revert
              setLocalItems(null);
              await refetch();
              Alert.alert('Error', err?.message ?? 'Could not delete assignment.');
            }
          },
        },
      ],
    );
  };

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------
  const stats = useMemo(() => ({
    pending:   items.filter(i => i.status === 'pending').length,
    completed: items.filter(i => i.status === 'completed' || i.status === 'submitted').length,
    overdue:   items.filter(i => i.status === 'overdue').length,
  }), [items]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Homework & Assignments</Text>
            <Text style={styles.pageSub}>{items.length} total assignments</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Pending',   count: stats.pending,   color: '#F59E0B' },
            { label: 'Done',      count: stats.completed, color: '#10B981' },
            { label: 'Overdue',   count: stats.overdue,   color: '#EF4444' },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {FILTER_TABS.map(f => {
              const cfg = f === 'all' ? null : STATUS_CONFIG[f];
              const isActive = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, isActive && { backgroundColor: cfg?.color ?? COLORS.primary }]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                    {f === 'all' ? 'All' : cfg?.label ?? f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Loading state */}
        {loading && !refreshing && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Loading assignments...</Text>
          </View>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No assignments found</Text>
            <Text style={styles.emptySub}>
              {filter === 'all'
                ? 'Tap "+ Add" to create your first assignment.'
                : `No ${STATUS_CONFIG[filter as AssignmentStatus]?.label ?? filter} assignments.`}
            </Text>
          </View>
        )}

        {/* Assignment cards */}
        {filtered.map(hw => {
          const sCfg = STATUS_CONFIG[hw.status] ?? STATUS_CONFIG.pending;
          const pCfg = PRIORITY_CONFIG[hw.priority] ?? PRIORITY_CONFIG.medium;
          const isDone = hw.status === 'completed' || hw.status === 'submitted';

          return (
            <View key={hw.id} style={[styles.hwCard, { borderLeftColor: sCfg.color }]}>
              {/* Top row */}
              <View style={styles.hwTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.chipRow}>
                    <View style={styles.subjectChip}>
                      <Text style={styles.subjectText}>{hw.subject_name}</Text>
                    </View>
                    <View style={[styles.priorityChip, { backgroundColor: pCfg.color + '22' }]}>
                      <Text style={[styles.priorityText, { color: pCfg.color }]}>{pCfg.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.hwTitle, isDone && styles.hwTitleDone]}>{hw.title}</Text>
                  {hw.description ? (
                    <Text style={styles.hwDesc} numberOfLines={2}>{hw.description}</Text>
                  ) : null}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sCfg.bg }]}>
                  <Text style={styles.statusIcon}>{sCfg.icon}</Text>
                  <Text style={[styles.statusText, { color: sCfg.color }]}>{sCfg.label}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.hwBottom}>
                <Text style={styles.hwDate}>📅 Due: {hw.due_date}</Text>
                {hw.score != null && (
                  <Text style={styles.hwScore}>Score: {hw.score}/{hw.max_score}</Text>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {!isDone && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.doneBtn]}
                    onPress={() => handleMarkDone(hw)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.doneBtnText}>✓ Mark Done</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => openEdit(hw)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(hw)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>

      {/* ------------------------------------------------------------------ */}
      {/* Create / Edit Modal                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Assignment' : 'Add Assignment'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Subject */}
              <Text style={styles.fieldLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mathematics"
                value={form.subject_name}
                onChangeText={v => setForm(f => ({ ...f, subject_name: v }))}
                placeholderTextColor="#94A3B8"
              />

              {/* Title */}
              <Text style={styles.fieldLabel}>Assignment Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Chapter 5 — Integrals"
                value={form.title}
                onChangeText={v => setForm(f => ({ ...f, title: v }))}
                placeholderTextColor="#94A3B8"
              />

              {/* Description */}
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Assignment instructions, pages, etc."
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                multiline
                numberOfLines={4}
                placeholderTextColor="#94A3B8"
              />

              {/* Due date */}
              <Text style={styles.fieldLabel}>Due Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-10-01"
                value={form.due_date}
                onChangeText={v => setForm(f => ({ ...f, due_date: v }))}
                placeholderTextColor="#94A3B8"
              />

              {/* Priority selector */}
              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {(['low', 'medium', 'high', 'urgent'] as const).map(p => {
                  const cfg = PRIORITY_CONFIG[p];
                  const isSelected = form.priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityOption,
                        { borderColor: cfg.color },
                        isSelected && { backgroundColor: cfg.color },
                      ]}
                      onPress={() => setForm(f => ({ ...f, priority: p }))}
                    >
                      <Text style={[styles.priorityOptionText, isSelected && { color: '#fff' }]}>
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Submission notes (only when editing) */}
              {editingId && (
                <>
                  <Text style={styles.fieldLabel}>Submission Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add notes about your submission..."
                    value={form.submission_notes}
                    onChangeText={v => setForm(f => ({ ...f, submission_notes: v }))}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#94A3B8"
                  />
                </>
              )}

              {/* Submit button */}
              <TouchableOpacity
                style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingId ? 'Save Changes' : 'Add Assignment'}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },

  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: SIZES.lg,
  },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub:   { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  addBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm, borderRadius: SIZES.radiusRound,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  statsRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusSm,
    padding: SIZES.md, borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', ...SHADOWS.small,
  },
  statVal:   { ...FONTS.h3, fontWeight: '800' },
  statLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },

  filterScroll: { marginBottom: SIZES.md },
  filterRow:    { flexDirection: 'row', gap: SIZES.xs },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  filterTabText:       { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: '#fff' },

  loadingBox: { alignItems: 'center', paddingVertical: SIZES.xxl, gap: SIZES.sm },
  loadingText: { color: COLORS.textSecondary, ...FONTS.body2 },

  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub:   { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },

  hwCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.lg,
    marginBottom: SIZES.md, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  hwTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm, marginBottom: SIZES.sm },
  chipRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  subjectChip: {
    backgroundColor: '#EEF2FF', paddingHorizontal: SIZES.sm, paddingVertical: 3,
    borderRadius: SIZES.radiusRound,
  },
  subjectText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  priorityChip: { paddingHorizontal: SIZES.sm, paddingVertical: 3, borderRadius: SIZES.radiusRound },
  priorityText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  hwTitle:     { ...FONTS.body1, color: COLORS.textDark, fontWeight: '700' },
  hwTitleDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  hwDesc:      { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 4 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusRound,
  },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  hwBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm,
    marginTop: SIZES.sm,
  },
  hwDate:  { ...FONTS.caption, color: COLORS.textSecondary },
  hwScore: { ...FONTS.caption, color: COLORS.primary, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: SIZES.xs, marginTop: SIZES.sm },
  actionBtn: {
    flex: 1, paddingVertical: 7, borderRadius: SIZES.radiusSm,
    alignItems: 'center', justifyContent: 'center',
  },
  doneBtn:       { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B981' },
  doneBtnText:   { fontSize: 12, fontWeight: '700', color: '#10B981' },
  editBtn:       { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#3B82F6' },
  editBtnText:   { fontSize: 12, fontWeight: '700', color: '#3B82F6' },
  deleteBtn:     { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444' },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SIZES.xl, maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  modalTitle:    { ...FONTS.h3, color: COLORS.textDark, fontWeight: '800' },
  modalCloseBtn: { padding: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },
  modalCloseTxt: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '700' },

  fieldLabel: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600', marginBottom: 6, marginTop: SIZES.md },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusSm,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: COLORS.textDark, backgroundColor: '#F8FAFC',
  },
  textArea: { height: 90, textAlignVertical: 'top' },

  priorityRow: { flexDirection: 'row', gap: SIZES.xs },
  priorityOption: {
    flex: 1, paddingVertical: 8, borderRadius: SIZES.radiusSm,
    alignItems: 'center', borderWidth: 1.5,
  },
  priorityOptionText: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },

  submitBtn: {
    marginTop: SIZES.xl, backgroundColor: COLORS.primary, borderRadius: SIZES.radiusSm,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
});
