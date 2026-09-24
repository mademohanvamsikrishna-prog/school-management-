/**
 * AdminTeachersScreen — Dedicated Teacher Management
 * Route: /admin/teachers
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  listSubjects,
  listRoles,
  AdminUser,
  AdminSubject,
  AdminRole,
} from '../../services/admin';

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
  red: '#EF4444',
  purple: '#8B5CF6',
  amber: '#F59E0B',
};

export default function AdminTeachersScreen() {
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add teacher modal
  const [addModal, setAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // View modal
  const [detailModal, setDetailModal] = useState<AdminUser | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [teachersData, subjectsData, rolesData] = await Promise.all([
        listUsers('teacher'),
        listSubjects(),
        listRoles(),
      ]);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setRoles(rolesData);
    } catch (e) {
      console.warn('Failed to load teachers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTeacher = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in Name, Email and Password');
      return;
    }
    const teacherRole = roles.find((r) => r.name === 'teacher');
    if (!teacherRole) {
      alert('Teacher role not found in system.');
      return;
    }

    setSaving(true);
    try {
      await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role_id: teacherRole.id,
      });
      setName('');
      setEmail('');
      setPassword('');
      setAddModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create teacher account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (teacher: AdminUser) => {
    try {
      await updateUser(teacher.id, { is_active: !teacher.is_active });
      await loadData();
    } catch {
      alert('Failed to update teacher status');
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = search.trim().toLowerCase();
      return !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    });
  }, [teachers, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.breadcrumb}>ACADEMIC MANAGEMENT / TEACHERS</Text>
            <Text style={styles.pageTitle}>Academic Staff & Teachers</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setAddModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Add Teacher</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary Card Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Faculty Members</Text>
            <Text style={styles.statValue}>{teachers.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Teaching Staff</Text>
            <Text style={[styles.statValue, { color: P.green }]}>
              {teachers.filter((t) => t.is_active).length}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Curriculum Subjects</Text>
            <Text style={[styles.statValue, { color: P.purple }]}>{subjects.length}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.filterRow}>
          <View style={styles.searchBox}>
            <Text style={{ fontSize: 13, color: P.textMuted }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search faculty by name, email or department..."
              placeholderTextColor={P.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Teachers Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>FACULTY NAME</Text>
            <Text style={[styles.th, { flex: 2 }]}>EMAIL</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>DESIGNATION</Text>
            <Text style={[styles.th, { flex: 1 }]}>STATUS</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={P.primary} />
            </View>
          ) : filteredTeachers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No faculty members found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTeachers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.studentMeta}>Teacher ID: {item.id.slice(0, 8)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.td, { flex: 2, color: P.textSec }]}>{item.email}</Text>
                  <View style={{ flex: 1.2 }}>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>Teacher</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge, item.is_active ? styles.statusActive : styles.statusInactive]}>
                      <Text style={[styles.statusText, { color: item.is_active ? '#15803D' : '#DC2626' }]}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1.2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => setDetailModal(item)}
                    >
                      <Text style={styles.actionBtnText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: item.is_active ? '#FCA5A5' : '#86EFAC' }]}
                      onPress={() => handleToggleActive(item)}
                    >
                      <Text style={[styles.actionBtnText, { color: item.is_active ? P.red : P.green }]}>
                        {item.is_active ? 'Deactivate' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>

      {/* Add Teacher Modal */}
      {addModal && (
        <Modal transparent animationType="fade" visible={addModal} onRequestClose={() => setAddModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Add New Faculty Member</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Dr. Priya Desai" value={name} onChangeText={setName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput style={styles.modalInput} placeholder="priya.desai@school.edu" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Initial Password</Text>
                <TextInput style={styles.modalInput} placeholder="Temporary password" secureTextEntry value={password} onChangeText={setPassword} />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddTeacher} disabled={saving}>
                  <Text style={styles.saveBtnText}>{saving ? 'Adding...' : 'Add Teacher'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal transparent animationType="fade" visible={!!detailModal} onRequestClose={() => setDetailModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Teacher Profile</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailVal}>{detailModal.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailVal}>{detailModal.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role:</Text>
                <Text style={styles.detailVal}>Teaching Faculty</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailVal}>{detailModal.is_active ? 'Active' : 'Inactive'}</Text>
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={() => setDetailModal(null)}>
                <Text style={styles.saveBtnText}>Close</Text>
              </TouchableOpacity>
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
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  studentName: { fontSize: 13, fontWeight: '700', color: P.text },
  studentMeta: { fontSize: 10.5, color: P.textMuted },
  roleBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusInactive: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10.5, fontWeight: '700' },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: P.border },
  actionBtnText: { fontSize: 11.5, fontWeight: '700', color: P.textSec },
  loadingBox: { padding: 40, alignItems: 'center' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: P.textMuted, fontSize: 13 },
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
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { fontSize: 13, fontWeight: '600', color: P.textSec },
  detailVal: { fontSize: 13, fontWeight: '700', color: P.text },
});
