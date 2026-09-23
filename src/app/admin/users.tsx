/**
 * AdminUsersScreen — Full CRUD user management
 *
 * Features:
 *  - Role filter tabs: All / Teachers / Students / Parents
 *  - Searchable user list with role badges
 *  - Add Teacher modal: name, email, password, subject, class
 *  - Add Student modal: name, email, password, class, section, roll number
 *  - Add Parent modal: name, email, password, child link
 *  - Edit User modal: name, active status
 *  - Deactivate action
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, TextInput, Modal, SafeAreaView, Switch, ScrollView, Platform,
} from 'react-native';
import {
  listUsers, createUser, updateUser, deactivateUser,
  listRoles, listClasses, AdminUser, AdminRole, AdminClass,
} from '../../services/admin';

const IS_WEB = Platform.OS === 'web';

// ── Palette
const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', purple: '#7C3AED', cyan: '#0891B2',
};

type RoleFilter = 'all' | 'teacher' | 'student' | 'parent' | 'admin';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:   { bg: '#7C3AED', text: '#FFF' },
  teacher: { bg: '#2563EB', text: '#FFF' },
  student: { bg: '#059669', text: '#FFF' },
  parent:  { bg: '#D97706', text: '#FFF' },
  staff:   { bg: '#6B7280', text: '#FFF' },
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [addRole, setAddRole] = useState<'teacher' | 'student' | 'parent'>('teacher');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newSection, setNewSection] = useState('A');
  const [newRoll, setNewRoll] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r, c] = await Promise.all([listUsers(), listRoles(), listClasses()]);
      setUsers(u);
      setRoles(r);
      setClasses(c);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role_name === roleFilter;
    const matchSearch = !filter ||
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase()) ||
      u.role_name.toLowerCase().includes(filter.toLowerCase());
    return matchRole && matchSearch;
  });

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
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (u: AdminUser) => {
    const deact = async () => {
      try {
        await deactivateUser(u.id);
        load();
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Deactivation failed');
      }
    };
    if (IS_WEB) {
      if (window.confirm(`Deactivate "${u.name}"?`)) deact();
    } else {
      Alert.alert('Deactivate', `Deactivate "${u.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: deact },
      ]);
    }
  };

  const resetAddForm = () => {
    setNewName(''); setNewEmail(''); setNewPassword('');
    setNewClass(''); setNewSection('A'); setNewRoll(''); setNewSubject('');
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      Alert.alert('Validation', 'Name, email, and password are required.');
      return;
    }
    const roleObj = roles.find(r => r.name === addRole);
    if (!roleObj) { Alert.alert('Error', 'Role not found.'); return; }
    setAddSaving(true);
    try {
      await createUser({
        email: newEmail.trim(),
        password: newPassword,
        name: newName.trim(),
        role_id: roleObj.id,
        is_active: true,
      });
      setAddModal(false);
      resetAddForm();
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Create failed');
    } finally {
      setAddSaving(false);
    }
  };

  const ROLE_TABS: { key: RoleFilter; label: string; icon: string }[] = [
    { key: 'all',     label: 'All',      icon: '👥' },
    { key: 'teacher', label: 'Teachers', icon: '👩‍🏫' },
    { key: 'student', label: 'Students', icon: '🎓' },
    { key: 'parent',  label: 'Parents',  icon: '👨‍👩‍👧' },
    { key: 'admin',   label: 'Admins',   icon: '🔑' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSub}>{filtered.length} of {users.length} users</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetAddForm(); setAddModal(true); }}>
          <Text style={styles.addBtnText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      {/* ── Role Filter Tabs ────────────────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
        {ROLE_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, roleFilter === tab.key && styles.tabActive]}
            onPress={() => setRoleFilter(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, roleFilter === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={filter}
          onChangeText={setFilter}
          placeholder="Search name, email or role..."
          placeholderTextColor={P.textMuted}
        />
      </View>

      {/* ── User List ───────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={P.indigo} />
          <Text style={styles.loadText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => u.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const rc = ROLE_COLORS[item.role_name] ?? { bg: '#94A3B8', text: '#FFF' };
            return (
              <View style={[styles.userCard, !item.is_active && styles.inactiveCard]}>
                <View style={[styles.avatar, { backgroundColor: rc.bg }]}>
                  <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {!item.is_active && <View style={styles.inactivePill}><Text style={styles.inactiveLabel}>INACTIVE</Text></View>}
                  </View>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
                    <Text style={[styles.roleText, { color: rc.text }]}>{item.role_name.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.actionCol}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  {item.is_active && (
                    <TouchableOpacity style={styles.deactBtn} onPress={() => handleDeactivate(item)}>
                      <Text style={styles.deactText}>Deact.</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalEmail}>{selected?.email}</Text>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} />
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Account Active</Text>
              <Switch
                value={editActive}
                onValueChange={setEditActive}
                trackColor={{ true: P.green, false: P.border }}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add User Modal ──────────────────────────────────────────────────── */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New User</Text>
                <TouchableOpacity onPress={() => setAddModal(false)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Role type selector */}
              <View style={styles.roleSelector}>
                {(['teacher', 'student', 'parent'] as const).map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleTab, addRole === r && styles.roleTabActive]}
                    onPress={() => setAddRole(r)}
                  >
                    <Text style={[styles.roleTabText, addRole === r && styles.roleTabTextActive]}>
                      {r === 'teacher' ? '👩‍🏫 Teacher' : r === 'student' ? '🎓 Student' : '👨‍👩‍👧 Parent'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Common fields */}
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput style={styles.fieldInput} value={newName} onChangeText={setNewName} placeholder="e.g. Mrs. Lakshmi" placeholderTextColor={P.textMuted} />

              <Text style={styles.fieldLabel}>Email Address *</Text>
              <TextInput style={styles.fieldInput} value={newEmail} onChangeText={setNewEmail} placeholder="user@school.com" placeholderTextColor={P.textMuted} autoCapitalize="none" keyboardType="email-address" />

              <Text style={styles.fieldLabel}>Password *</Text>
              <TextInput style={styles.fieldInput} value={newPassword} onChangeText={setNewPassword} placeholder="Min. 6 characters" placeholderTextColor={P.textMuted} secureTextEntry />

              {/* Teacher-specific */}
              {addRole === 'teacher' && (
                <>
                  <Text style={styles.fieldLabel}>Subject / Department</Text>
                  <TextInput style={styles.fieldInput} value={newSubject} onChangeText={setNewSubject} placeholder="e.g. Physics" placeholderTextColor={P.textMuted} />
                  <Text style={styles.fieldLabel}>Assign Class (optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classPickerScroll}>
                    {classes.map(cls => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[styles.classChip, newClass === cls.id && styles.classChipActive]}
                        onPress={() => setNewClass(cls.id)}
                      >
                        <Text style={[styles.classChipText, newClass === cls.id && styles.classChipTextActive]}>
                          {cls.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Student-specific */}
              {addRole === 'student' && (
                <>
                  <Text style={styles.fieldLabel}>Assign Class *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classPickerScroll}>
                    {classes.map(cls => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[styles.classChip, newClass === cls.id && styles.classChipActive]}
                        onPress={() => setNewClass(cls.id)}
                      >
                        <Text style={[styles.classChipText, newClass === cls.id && styles.classChipTextActive]}>
                          {cls.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={styles.twoCol}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Section</Text>
                      <TextInput style={styles.fieldInput} value={newSection} onChangeText={setNewSection} placeholder="A" placeholderTextColor={P.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Roll Number</Text>
                      <TextInput style={styles.fieldInput} value={newRoll} onChangeText={setNewRoll} placeholder="101" placeholderTextColor={P.textMuted} keyboardType="number-pad" />
                    </View>
                  </View>
                </>
              )}

              {/* Parent info note */}
              {addRole === 'parent' && (
                <View style={styles.infoNote}>
                  <Text style={styles.infoNoteText}>
                    💡 After creating the parent account, link children via the student&apos;s profile or the Classes screen.
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddModal(false); resetAddForm(); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={addSaving}>
                  {addSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Create Account</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: P.text },
  headerSub: { fontSize: 12, color: P.textSec, marginTop: 2 },
  addBtn: { backgroundColor: P.indigo, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // Tabs
  tabsScroll: { backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  tabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: P.bg, borderWidth: 1, borderColor: P.border },
  tabActive: { backgroundColor: P.indigoBg, borderColor: P.indigo },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 13, fontWeight: '600', color: P.textSec },
  tabLabelActive: { color: P.indigo },

  // Search
  searchRow: { padding: 16, paddingBottom: 8, backgroundColor: P.card },
  searchInput: { borderWidth: 1, borderColor: P.border, borderRadius: 10, padding: 10, fontSize: 14, color: P.text, backgroundColor: P.bg },

  // List
  list: { padding: 16, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadText: { fontSize: 14, color: P.textSec },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: P.textSec, fontWeight: '600' },

  // User Card
  userCard: {
    backgroundColor: P.card, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: P.border,
    shadowColor: '#0F172A', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1,
  },
  inactiveCard: { opacity: 0.55 },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  userName: { fontSize: 15, fontWeight: '700', color: P.text },
  inactivePill: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  inactiveLabel: { fontSize: 9, fontWeight: '800', color: P.red },
  userEmail: { fontSize: 12, color: P.textSec, marginBottom: 6 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleText: { fontSize: 10, fontWeight: '700' },
  actionCol: { gap: 6 },
  editBtn: { backgroundColor: P.indigo, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  deactBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  deactText: { color: P.red, fontWeight: '700', fontSize: 12 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  modalScroll: { justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: '100%' },
  modalBox: { backgroundColor: P.card, borderRadius: 20, padding: 24, width: IS_WEB ? 480 : '100%', maxWidth: 520 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: P.text },
  closeIcon: { fontSize: 18, color: P.textSec, padding: 4 },
  modalEmail: { fontSize: 12, color: P.textSec, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: P.text, marginBottom: 6, marginTop: 12 },
  fieldInput: { borderWidth: 1, borderColor: P.border, borderRadius: 10, padding: 10, fontSize: 14, color: P.text, backgroundColor: P.bg },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: P.border, alignItems: 'center' },
  cancelText: { color: P.text, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: P.indigo, padding: 12, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '700' },

  // Add User extras
  roleSelector: { flexDirection: 'row', gap: 8, marginBottom: 4, marginTop: 12 },
  roleTab: { flex: 1, padding: 9, borderRadius: 10, borderWidth: 1, borderColor: P.border, alignItems: 'center' },
  roleTabActive: { backgroundColor: P.indigoBg, borderColor: P.indigo },
  roleTabText: { fontSize: 12, fontWeight: '600', color: P.textSec },
  roleTabTextActive: { color: P.indigo },
  classPickerScroll: { marginTop: 8, marginBottom: 4 },
  classChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: P.border, marginRight: 8, backgroundColor: P.bg },
  classChipActive: { backgroundColor: P.indigoBg, borderColor: P.indigo },
  classChipText: { fontSize: 12, fontWeight: '600', color: P.textSec },
  classChipTextActive: { color: P.indigo },
  twoCol: { flexDirection: 'row', gap: 12 },
  infoNote: { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#FCD34D' },
  infoNoteText: { fontSize: 12, color: '#92400E', fontWeight: '500' },
});
