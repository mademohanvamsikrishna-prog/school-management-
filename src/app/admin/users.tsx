import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, TextInput, Modal, SafeAreaView, Switch,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { listUsers, updateUser, deactivateUser, AdminUser } from '../../services/admin';

export default function AdminUsersScreen() {
  const { data: users, loading, refetch } = useApi(() => listUsers());
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  const filtered = (users || []).filter(u =>
    !filter || u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase()) ||
    u.role_name.toLowerCase().includes(filter.toLowerCase())
  );

  const openEdit = (u: AdminUser) => {
    setSelected(u);
    setEditName(u.name);
    setEditActive(u.is_active);
    setEditModal(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateUser(selected.id, { name: editName, is_active: editActive });
      setEditModal(false);
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (u: AdminUser) => {
    Alert.alert('Deactivate User', `Deactivate "${u.name}"? They will not be able to log in.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate', style: 'destructive', onPress: async () => {
          try {
            await deactivateUser(u.id);
            refetch();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  const ROLE_COLOR: Record<string, string> = {
    admin: '#9C27B0', teacher: '#2196F3', student: '#4CAF50', parent: '#FF9800',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="User Management" showBack />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput} value={filter} onChangeText={setFilter}
          placeholder="Filter by name, email or role..." placeholderTextColor={COLORS.textSecondary}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => u.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="No users found" description="No users match the filter." icon="👥" />}
          renderItem={({ item }) => (
            <View style={[styles.userCard, !item.is_active && styles.inactiveCard]}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{item.name}</Text>
                  {!item.is_active && <Text style={styles.inactiveTag}>INACTIVE</Text>}
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: ROLE_COLOR[item.role_name] || COLORS.border }]}>
                  <Text style={styles.roleText}>{item.role_name.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                {item.is_active && (
                  <TouchableOpacity style={styles.deactivateBtn} onPress={() => handleDeactivate(item)}>
                    <Text style={styles.deactivateBtnText}>Deact</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <Text style={styles.modalEmail}>{selected?.email}</Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} />
            <View style={styles.activeRow}>
              <Text style={styles.fieldLabel}>Active</Text>
              <Switch value={editActive} onValueChange={setEditActive} trackColor={{ true: COLORS.success }} />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
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
  searchRow: { padding: SIZES.md, paddingBottom: SIZES.sm },
  searchInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.sm, padding: SIZES.sm, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.card },
  listContent: { padding: SIZES.md, paddingTop: 0 },
  userCard: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  inactiveCard: { opacity: 0.6 },
  userAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.sm },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  inactiveTag: { fontSize: 10, color: COLORS.error, fontWeight: 'bold', borderWidth: 1, borderColor: COLORS.error, paddingHorizontal: 4, borderRadius: 4 },
  userEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  roleText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  actions: { gap: 6 },
  editBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  deactivateBtn: { backgroundColor: COLORS.error, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  deactivateBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SIZES.xl },
  modalContent: { backgroundColor: '#fff', borderRadius: SIZES.md, padding: SIZES.lg },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  modalEmail: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SIZES.md },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.sm, padding: SIZES.sm, fontSize: 15, color: COLORS.text, marginBottom: SIZES.md },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg },
  modalActions: { flexDirection: 'row', gap: SIZES.sm },
  cancelBtn: { flex: 1, padding: SIZES.sm, borderRadius: SIZES.sm, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelBtnText: { color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, padding: SIZES.sm, borderRadius: SIZES.sm, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
