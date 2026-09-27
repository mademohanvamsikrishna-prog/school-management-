/**
 * AdminStaffScreen — Dedicated Staff Management
 * Route: /admin/staff
 * Real backend database synchronization with User & Role models.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { listUsers, createUser, listRoles, AdminUser, AdminRole } from '../../services/admin';

const IS_WEB = Platform.OS === 'web';

const P = {
  bg: '#F7FAFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  green: '#10B981',
  purple: '#8B5CF6',
};

export default function AdminStaffScreen() {
  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Administration');
  const [designation, setDesignation] = useState('Administrative Officer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        listUsers('staff'),
        listRoles(),
      ]);
      setStaffList(usersData);
      setRoles(rolesData);
    } catch (e) {
      console.warn('Failed to load staff:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddStaff = async () => {
    if (!name.trim() || !email.trim()) {
      alert('Please enter Name and Email');
      return;
    }

    const staffRole = roles.find((r) => r.name === 'staff') || roles.find((r) => r.name === 'teacher');
    if (!staffRole) {
      alert('Staff role not found');
      return;
    }

    setSaving(true);
    try {
      await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || 'password123',
        role_id: staffRole.id,
      });
      setName('');
      setEmail('');
      setPassword('');
      setAddModal(false);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to create staff member');
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffList.filter((s) => {
      return !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });
  }, [staffList, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.breadcrumb}>ADMINISTRATION / STAFF MANAGEMENT</Text>
            <Text style={styles.pageTitle}>Non-Teaching & Support Staff</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add Staff Member</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Summary Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Staff Members</Text>
            <Text style={styles.statValue}>{staffList.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Duty</Text>
            <Text style={[styles.statValue, { color: P.green }]}>
              {staffList.filter((s) => s.is_active).length}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Role Type</Text>
            <Text style={[styles.statValue, { color: P.purple }]}>Support Staff</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.filterRow}>
          <View style={styles.searchBox}>
            <Text style={{ fontSize: 13, color: P.textMuted }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search staff by name or email..."
              placeholderTextColor={P.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Staff Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>STAFF NAME</Text>
            <Text style={[styles.th, { flex: 2 }]}>EMAIL</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>DEPARTMENT</Text>
            <Text style={[styles.th, { width: 100, textAlign: 'right' }]}>STATUS</Text>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={P.primary} />
            </View>
          ) : filteredStaff.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: P.textMuted, fontSize: 14 }}>No staff members found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredStaff}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.staffName}>{item.name}</Text>
                      <Text style={{ fontSize: 11, color: P.textMuted }}>ID: {item.id.slice(0, 8)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.td, { flex: 2, color: P.textSec }]}>{item.email}</Text>
                  <Text style={[styles.td, { flex: 1.5, fontWeight: '600' }]}>Administration</Text>
                  <View style={{ width: 100, alignItems: 'flex-end' }}>
                    <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#DCFCE7' : '#FEE2E2' }]}>
                      <Text style={[styles.statusText, { color: item.is_active ? '#15803D' : '#DC2626' }]}>
                        {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>

      {/* Add Staff Modal */}
      {addModal && (
        <Modal transparent animationType="fade" visible={addModal} onRequestClose={() => setAddModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Add Staff Member</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput style={styles.modalInput} value={name} onChangeText={setName} placeholder="e.g. Ramesh Chander" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Official Email *</Text>
                <TextInput style={styles.modalInput} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="staff@school.edu" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Initial Password</Text>
                <TextInput style={styles.modalInput} value={password} onChangeText={setPassword} placeholder="Default: password123" secureTextEntry />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddStaff} disabled={saving}>
                  <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Staff'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: P.bg },
  container: { padding: 24, flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  breadcrumb: { fontSize: 11, fontWeight: '700', color: P.textMuted, letterSpacing: 0.5 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: P.text, letterSpacing: -0.3 },
  addBtn: { backgroundColor: P.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: P.border },
  statLabel: { fontSize: 12, fontWeight: '600', color: P.textSec, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: P.text },
  filterRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: P.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: P.text, outlineStyle: 'none' as any },
  tableCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: P.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.border },
  th: { fontSize: 11, fontWeight: '700', color: P.textMuted, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  td: { fontSize: 13, color: P.text },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  staffName: { fontSize: 13, fontWeight: '700', color: P.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 24, width: '100%', maxWidth: 440 },
  modalHeading: { fontSize: 18, fontWeight: '800', color: P.text, marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: P.textSec, marginBottom: 4 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: P.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: P.border },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: P.textSec },
  saveBtn: { backgroundColor: P.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
