/**
 * AdminClassesScreen — Classes management
 *
 * Features:
 *  - Class cards showing: name, grade, room, assigned teacher name, student count
 *  - "Add Class" modal: name, grade level, section, room number, capacity
 *  - "Reassign Teacher" modal: dropdown list of available teachers
 *  - Student count badge per class
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, TextInput, Modal, SafeAreaView, ScrollView, Platform,
} from 'react-native';
import {
  listClasses, createClass, assignTeacher, listUsers,
  AdminClass, AdminUser,
} from '../../services/admin';

const IS_WEB = Platform.OS === 'web';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  green: '#10B981', greenBg: '#ECFDF5',
  purple: '#7C3AED', purpleBg: '#F5F3FF',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  cyan: '#0891B2', cyanBg: '#ECFEFF',
};

const GRADE_COLORS: string[] = [
  P.indigo, P.purple, P.green, P.cyan, P.amber,
  '#E11D48', '#0F766E', '#D97706', '#1D4ED8', '#7C3AED',
];

export default function AdminClassesScreen() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Class modal
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('A');
  const [newRoom, setNewRoom] = useState('');
  const [newCapacity, setNewCapacity] = useState('40');
  const [addSaving, setAddSaving] = useState(false);

  // Reassign Teacher modal
  const [reassignModal, setReassignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AdminClass | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [reassignSaving, setReassignSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, u] = await Promise.all([listClasses(), listUsers('teacher')]);
      setClasses(c);
      setTeachers(u);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = classes.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.teacher_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClass = async () => {
    if (!newName.trim() || !newGrade) {
      Alert.alert('Validation', 'Class name and grade level are required.');
      return;
    }
    setAddSaving(true);
    try {
      await createClass({
        name: newName.trim(),
        grade_level: parseInt(newGrade),
        section: newSection || 'A',
        room_number: newRoom.trim() || undefined,
        capacity: parseInt(newCapacity) || 40,
      });
      setAddModal(false);
      setNewName(''); setNewGrade(''); setNewSection('A'); setNewRoom(''); setNewCapacity('40');
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Create failed');
    } finally {
      setAddSaving(false);
    }
  };

  const openReassign = (cls: AdminClass) => {
    setSelectedClass(cls);
    setSelectedTeacherId(cls.class_teacher_id ?? '');
    setReassignModal(true);
  };

  const handleReassign = async () => {
    if (!selectedClass || !selectedTeacherId) {
      Alert.alert('Validation', 'Please select a teacher.');
      return;
    }
    setReassignSaving(true);
    try {
      await assignTeacher(selectedClass.id, selectedTeacherId);
      setReassignModal(false);
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Reassignment failed');
    } finally {
      setReassignSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Class Management</Text>
          <Text style={styles.headerSub}>{filtered.length} classes total</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add Class</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search class name or teacher..."
          placeholderTextColor={P.textMuted}
        />
      </View>

      {/* ── Stats Summary Row ─────────────────────────────────────────────── */}
      {!loading && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryVal}>{classes.length}</Text>
            <Text style={styles.summaryLabel}>Classes</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={[styles.summaryVal, { color: P.green }]}>
              {classes.filter(c => c.class_teacher_id).length}
            </Text>
            <Text style={styles.summaryLabel}>With Teacher</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={[styles.summaryVal, { color: P.amber }]}>
              {classes.filter(c => !c.class_teacher_id).length}
            </Text>
            <Text style={styles.summaryLabel}>Unassigned</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={[styles.summaryVal, { color: P.indigo }]}>
              {classes.reduce((acc, c) => acc + (c.student_count ?? 0), 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Students</Text>
          </View>
        </View>
      )}

      {/* ── Class Cards ────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={P.indigo} />
          <Text style={styles.loadText}>Loading classes...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.grid}
          numColumns={IS_WEB ? 2 : 1}
          key={IS_WEB ? 'web' : 'native'}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏫</Text>
              <Text style={styles.emptyText}>No classes found</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const accent = GRADE_COLORS[(item.grade_level - 1) % GRADE_COLORS.length];
            const hasTeacher = !!item.class_teacher_id;

            return (
              <View style={[styles.classCard, IS_WEB && styles.classCardWeb, { borderTopColor: accent, borderTopWidth: 3 }]}>
                {/* Grade Badge */}
                <View style={[styles.gradeBadge, { backgroundColor: accent }]}>
                  <Text style={styles.gradeText}>Grade {item.grade_level}</Text>
                </View>

                {/* Class Name & Room */}
                <Text style={styles.className}>{item.name}</Text>
                <Text style={styles.classRoom}>{item.room_number ?? 'No room assigned'}</Text>

                {/* Teacher Row */}
                <View style={styles.teacherRow}>
                  <View style={[styles.teacherIcon, { backgroundColor: hasTeacher ? '#EEF2FF' : P.amberBg }]}>
                    <Text style={{ fontSize: 14 }}>{hasTeacher ? '👩‍🏫' : '⚠️'}</Text>
                  </View>
                  <View style={styles.teacherInfo}>
                    <Text style={[styles.teacherName, { color: hasTeacher ? P.text : P.amber }]}>
                      {item.teacher_name ?? 'No teacher assigned'}
                    </Text>
                    <Text style={styles.teacherLabel}>Class Teacher</Text>
                  </View>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillNum}>{item.student_count}</Text>
                    <Text style={styles.statPillLabel}>Students</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillNum}>{item.capacity}</Text>
                    <Text style={styles.statPillLabel}>Capacity</Text>
                  </View>
                  <View style={[styles.statPill, { backgroundColor: P.indigoBg }]}>
                    <Text style={[styles.statPillNum, { color: P.indigo }]}>{item.section}</Text>
                    <Text style={[styles.statPillLabel, { color: P.indigo }]}>Section</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: P.indigo }]}
                    onPress={() => openReassign(item)}
                  >
                    <Text style={styles.actionBtnText}>
                      {hasTeacher ? '🔄 Reassign Teacher' : '➕ Assign Teacher'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ── Add Class Modal ──────────────────────────────────────────────────── */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Class</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Class Name *</Text>
            <TextInput style={styles.fieldInput} value={newName} onChangeText={setNewName} placeholder="e.g. Class 10 - A" placeholderTextColor={P.textMuted} />

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Grade Level *</Text>
                <TextInput style={styles.fieldInput} value={newGrade} onChangeText={setNewGrade} placeholder="10" placeholderTextColor={P.textMuted} keyboardType="number-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Section</Text>
                <TextInput style={styles.fieldInput} value={newSection} onChangeText={setNewSection} placeholder="A" placeholderTextColor={P.textMuted} />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.fieldLabel}>Room Number</Text>
                <TextInput style={styles.fieldInput} value={newRoom} onChangeText={setNewRoom} placeholder="Room 201" placeholderTextColor={P.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Capacity</Text>
                <TextInput style={styles.fieldInput} value={newCapacity} onChangeText={setNewCapacity} placeholder="40" placeholderTextColor={P.textMuted} keyboardType="number-pad" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddClass} disabled={addSaving}>
                {addSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Create Class</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Reassign Teacher Modal ──────────────────────────────────────────── */}
      <Modal visible={reassignModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Class Teacher</Text>
              <TouchableOpacity onPress={() => setReassignModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Class: {selectedClass?.name}</Text>

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Select Teacher</Text>
            <ScrollView style={styles.teacherList} showsVerticalScrollIndicator={false}>
              {teachers.filter(t => t.is_active).map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.teacherOption, selectedTeacherId === t.id && styles.teacherOptionActive]}
                  onPress={() => setSelectedTeacherId(t.id)}
                >
                  <View style={[styles.optionAvatar, { backgroundColor: P.indigo }]}>
                    <Text style={styles.optionAvatarText}>{t.name[0]}</Text>
                  </View>
                  <Text style={[styles.optionName, selectedTeacherId === t.id && { color: P.indigo, fontWeight: '700' }]}>
                    {t.name}
                  </Text>
                  {selectedTeacherId === t.id && <Text style={{ color: P.indigo, fontSize: 16 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setReassignModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleReassign} disabled={reassignSaving || !selectedTeacherId}>
                {reassignSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Assign Teacher</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: P.text },
  headerSub: { fontSize: 12, color: P.textSec, marginTop: 2 },
  addBtn: { backgroundColor: P.indigo, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // Search
  searchRow: { padding: 16, paddingBottom: 10, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  searchInput: { borderWidth: 1, borderColor: P.border, borderRadius: 10, padding: 10, fontSize: 14, color: P.text, backgroundColor: P.bg },

  // Summary
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  summaryChip: { flex: 1, backgroundColor: P.bg, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: P.border },
  summaryVal: { fontSize: 20, fontWeight: '800', color: P.text },
  summaryLabel: { fontSize: 10, fontWeight: '600', color: P.textSec, marginTop: 2 },

  // Grid
  grid: { padding: 16, gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadText: { fontSize: 14, color: P.textSec },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: P.textSec, fontWeight: '600' },

  // Class Card
  classCard: {
    backgroundColor: P.card, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: P.border,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
    marginBottom: IS_WEB ? 0 : 0,
  },
  classCardWeb: { flex: 1, margin: 7 },
  gradeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  gradeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  className: { fontSize: 20, fontWeight: '800', color: P.text, marginBottom: 2 },
  classRoom: { fontSize: 12, color: P.textSec, marginBottom: 16 },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, padding: 10, backgroundColor: P.bg, borderRadius: 10, borderWidth: 1, borderColor: P.border },
  teacherIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  teacherInfo: {},
  teacherName: { fontSize: 14, fontWeight: '700' },
  teacherLabel: { fontSize: 10, color: P.textMuted, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statPill: { flex: 1, backgroundColor: P.bg, borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: P.border },
  statPillNum: { fontSize: 18, fontWeight: '800', color: P.text },
  statPillLabel: { fontSize: 10, color: P.textSec, fontWeight: '500' },
  cardActions: { gap: 8 },
  actionBtn: { padding: 10, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: P.card, borderRadius: 20, padding: 24, width: IS_WEB ? 480 : '100%', maxWidth: 520 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: P.text },
  closeIcon: { fontSize: 18, color: P.textSec, padding: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: P.text, marginBottom: 6, marginTop: 12 },
  fieldInput: { borderWidth: 1, borderColor: P.border, borderRadius: 10, padding: 10, fontSize: 14, color: P.text, backgroundColor: P.bg },
  twoCol: { flexDirection: 'row', gap: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: P.border, alignItems: 'center' },
  cancelText: { color: P.text, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: P.indigo, padding: 12, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '700' },

  // Reassign Teacher list
  teacherList: { maxHeight: 260, marginTop: 4, marginBottom: 4 },
  teacherOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, marginBottom: 6, backgroundColor: P.bg, borderWidth: 1, borderColor: P.border },
  teacherOptionActive: { backgroundColor: P.indigoBg, borderColor: P.indigo },
  optionAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  optionAvatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  optionName: { flex: 1, fontSize: 14, fontWeight: '600', color: P.text },
});
