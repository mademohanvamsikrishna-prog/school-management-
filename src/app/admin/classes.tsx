import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, TextInput, Modal, SafeAreaView,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { listClasses, createClass } from '../../services/admin';

export default function AdminClassesScreen() {
  const { data: classes, loading, refetch } = useApi(listClasses);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('A');
  const [capacity, setCapacity] = useState('40');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !gradeLevel) {
      Alert.alert('Validation', 'Name and grade level are required.');
      return;
    }
    setSaving(true);
    try {
      await createClass({ name: name.trim(), grade_level: parseInt(gradeLevel), section, capacity: parseInt(capacity) });
      setShowModal(false);
      setName(''); setGradeLevel(''); setSection('A'); setCapacity('40');
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Class Management" showBack />
      <View style={styles.headerRow}>
        <Text style={styles.count}>{(classes || []).length} classes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Add Class</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />
      ) : (
        <FlatList
          data={classes || []}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="No classes" description="Add a class to get started." icon="🏫" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.gradeLabel}>
                <Text style={styles.gradeText}>{item.grade_level}</Text>
                <Text style={styles.sectionText}>{item.section}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.className}>{item.name}</Text>
                <Text style={styles.cardDetail}>Capacity: {item.capacity} · Room: {item.room_number || 'N/A'}</Text>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            <Text style={styles.fieldLabel}>Class Name</Text>
            <TextInput style={styles.fieldInput} value={name} onChangeText={setName} placeholder="e.g. Grade 10A" placeholderTextColor={COLORS.textSecondary} />
            <Text style={styles.fieldLabel}>Grade Level (number)</Text>
            <TextInput style={styles.fieldInput} value={gradeLevel} onChangeText={setGradeLevel} keyboardType="number-pad" placeholder="10" placeholderTextColor={COLORS.textSecondary} />
            <Text style={styles.fieldLabel}>Section</Text>
            <TextInput style={styles.fieldInput} value={section} onChangeText={setSection} placeholder="A" placeholderTextColor={COLORS.textSecondary} />
            <Text style={styles.fieldLabel}>Capacity</Text>
            <TextInput style={styles.fieldInput} value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholder="40" placeholderTextColor={COLORS.textSecondary} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.md },
  count: { fontSize: 14, color: COLORS.textSecondary },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: 8, borderRadius: SIZES.sm },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  listContent: { padding: SIZES.md, paddingTop: 0 },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  gradeLabel: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  gradeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  cardInfo: { flex: 1 },
  className: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SIZES.xl },
  modalContent: { backgroundColor: '#fff', borderRadius: SIZES.md, padding: SIZES.lg },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.sm, padding: SIZES.sm, fontSize: 15, color: COLORS.text, marginBottom: SIZES.sm },
  modalActions: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.sm },
  cancelBtn: { flex: 1, padding: SIZES.sm, borderRadius: SIZES.sm, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, padding: SIZES.sm, borderRadius: SIZES.sm, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
