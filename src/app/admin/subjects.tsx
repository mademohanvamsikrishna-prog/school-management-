/**
 * Admin Subjects — Subject CRUD management.
 *
 * Features:
 *  - List all subjects with code and department
 *  - Search filter
 *  - Add Subject modal (name, code, department)
 *  - Subject count badge
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, TextInput, Modal, Alert, Platform,
} from 'react-native';
import { listSubjects, createSubject, AdminSubject } from '../../services/admin';
import { useSearch, filterBySearch } from '../../hooks/useSearch';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  green: '#10B981', greenBg: '#ECFDF5',
  purple: '#7C3AED', purpleBg: '#F5F3FF',
  amber: '#F59E0B',
};

const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  Science:     { bg: '#DCFCE7', text: '#15803D' },
  Mathematics: { bg: '#DBEAFE', text: '#1D4ED8' },
  Language:    { bg: '#F3E8FF', text: '#7E22CE' },
  Social:      { bg: '#FEF3C7', text: '#D97706' },
  Arts:        { bg: '#FCE7F3', text: '#BE185D' },
  Technology:  { bg: '#CFFAFE', text: '#0E7490' },
  Default:     { bg: '#F1F5F9', text: '#475569' },
};

function getDeptColor(dept?: string) {
  if (!dept) return DEPT_COLORS.Default;
  const match = Object.keys(DEPT_COLORS).find(k => dept.toLowerCase().includes(k.toLowerCase()));
  return match ? DEPT_COLORS[match] : DEPT_COLORS.Default;
}

export default function AdminSubjectsScreen() {
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const { query, setQuery, debouncedQuery } = useSearch();

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSubjects();
      setSubjects(data ?? []);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filterBySearch(subjects, debouncedQuery, s => [s.name, s.code, s.department ?? '']);

  const handleAdd = async () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert('Validation', 'Subject name and code are required.');
      return;
    }
    setSaving(true);
    try {
      await createSubject({ name: name.trim(), code: code.trim().toUpperCase(), department: department.trim() || undefined });
      setAddModal(false);
      setName(''); setCode(''); setDepartment('');
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Create failed');
    } finally { setSaving(false); }
  };

  const IS_WEB = Platform.OS === 'web';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>ADMIN / SUBJECTS</Text>
          <Text style={s.title}>Subject Management</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setAddModal(true)}>
          <Text style={s.addBtnText}>+ Add Subject</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      {!loading && (
        <View style={s.statsBar}>
          <View style={s.statChip}><Text style={s.statVal}>{subjects.length}</Text><Text style={s.statLbl}>Total</Text></View>
          <View style={s.statChip}>
            <Text style={[s.statVal, { color: P.indigo }]}>
              {[...new Set(subjects.map(s2 => s2.department).filter(Boolean))].length}
            </Text>
            <Text style={s.statLbl}>Departments</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, code, or department..."
          placeholderTextColor={P.textMuted}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={P.indigo} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          numColumns={IS_WEB ? 3 : 1}
          key={IS_WEB ? 'web-3' : 'native-1'}
          contentContainerStyle={s.grid}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>📚</Text>
              <Text style={{ color: P.textSec, fontSize: 15, fontWeight: '600' }}>No subjects found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const dc = getDeptColor(item.department);
            return (
              <View style={[s.card, IS_WEB && { flex: 1, margin: 6 }]}>
                <View style={s.cardTop}>
                  <View style={[s.codeBadge, { backgroundColor: P.indigoBg }]}>
                    <Text style={[s.codeText, { color: P.indigo }]}>{item.code}</Text>
                  </View>
                  {item.department && (
                    <View style={[s.deptBadge, { backgroundColor: dc.bg }]}>
                      <Text style={[s.deptText, { color: dc.text }]}>{item.department}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.subjectName}>{item.name}</Text>
                {!item.department && <Text style={s.noDept}>No department assigned</Text>}
              </View>
            );
          }}
        />
      )}

      {/* Add Subject Modal */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add New Subject</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}><Text style={s.closeIcon}>✕</Text></TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>Subject Name *</Text>
            <TextInput style={s.fieldInput} value={name} onChangeText={setName} placeholder="e.g. Physics" placeholderTextColor={P.textMuted} />

            <Text style={s.fieldLabel}>Subject Code *</Text>
            <TextInput style={s.fieldInput} value={code} onChangeText={setCode} placeholder="e.g. PHY" placeholderTextColor={P.textMuted} autoCapitalize="characters" />

            <Text style={s.fieldLabel}>Department (optional)</Text>
            <TextInput style={s.fieldInput} value={department} onChangeText={setDepartment} placeholder="e.g. Science" placeholderTextColor={P.textMuted} />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setAddModal(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={s.saveText}>Create Subject</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  breadcrumb: { fontSize: 10, fontWeight: '700', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '800', color: P.text },
  addBtn: { backgroundColor: P.indigo, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  statsBar: { flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 0, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  statChip: { backgroundColor: P.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: P.border },
  statVal: { fontSize: 18, fontWeight: '800', color: P.text },
  statLbl: { fontSize: 10, fontWeight: '600', color: P.textSec },
  searchRow: { padding: 14, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  searchInput: { borderWidth: 1, borderColor: P.border, borderRadius: 10, padding: 10, fontSize: 14, color: P.text, backgroundColor: P.bg },
  grid: { padding: 14, gap: 10 },
  card: { backgroundColor: P.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: P.border, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1 },
  cardTop: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  codeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  codeText: { fontSize: 11, fontWeight: '800' },
  deptBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  deptText: { fontSize: 11, fontWeight: '700' },
  subjectName: { fontSize: 16, fontWeight: '700', color: P.text },
  noDept: { fontSize: 11, color: P.textMuted, marginTop: 4 },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: P.card, borderRadius: 20, padding: 24, width: Platform.OS === 'web' ? 440 : '100%', maxWidth: 500 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: P.text },
  closeIcon: { fontSize: 18, color: P.textSec, padding: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: P.text, marginBottom: 6, marginTop: 12 },
  fieldInput: { borderWidth: 1, borderColor: P.border, borderRadius: 10, padding: 10, fontSize: 14, color: P.text, backgroundColor: P.bg },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: P.border, alignItems: 'center' },
  cancelText: { color: P.text, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: P.indigo, padding: 12, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '700' },
});
