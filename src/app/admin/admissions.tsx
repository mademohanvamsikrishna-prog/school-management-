/**
 * AdminAdmissionsScreen — Dedicated Admissions Management
 * Route: /admin/admissions
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';

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
  amber: '#F59E0B',
};

interface Application {
  id: string;
  studentName: string;
  parentName: string;
  classApplied: string;
  appliedDate: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminAdmissionsScreen() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [applications, setApplications] = useState<Application[]>([
    { id: 'app-1', studentName: 'Rohan Mehta', parentName: 'Suresh Mehta', classApplied: 'Class 6 - A', appliedDate: '2026-09-22', email: 'suresh.m@gmail.com', phone: '+91 98765 43210', status: 'pending' },
    { id: 'app-2', studentName: 'Diya Sen', parentName: 'Anil Sen', classApplied: 'Class 1 - B', appliedDate: '2026-09-21', email: 'anil.sen@outlook.com', phone: '+91 98234 56789', status: 'approved' },
    { id: 'app-3', studentName: 'Karan Malhotra', parentName: 'Rajesh Malhotra', classApplied: 'Class 9 - C', appliedDate: '2026-09-20', email: 'rajesh.m@yahoo.com', phone: '+91 98111 22334', status: 'pending' },
    { id: 'app-4', studentName: 'Meera Nambiar', parentName: 'Gopal Nambiar', classApplied: 'Class 7 - B', appliedDate: '2026-09-18', email: 'gopal.n@gmail.com', phone: '+91 98456 78901', status: 'rejected' },
    { id: 'app-5', studentName: 'Varun Patel', parentName: 'Dinesh Patel', classApplied: 'Class 11 - Science', appliedDate: '2026-09-15', email: 'dinesh.patel@gmail.com', phone: '+91 98999 88776', status: 'approved' },
  ]);

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    setSelectedApp(null);
  };

  const filtered = applications.filter((app) => {
    if (filter !== 'all' && app.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.studentName.toLowerCase().includes(q) ||
        app.parentName.toLowerCase().includes(q) ||
        app.classApplied.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.breadcrumb}>ADMINISTRATION / ADMISSIONS</Text>
            <Text style={styles.pageTitle}>Student Admission Portal</Text>
          </View>
        </View>

        {/* 3 Summary Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Applications</Text>
            <Text style={styles.statValue}>{applications.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Review</Text>
            <Text style={[styles.statValue, { color: P.amber }]}>
              {applications.filter((a) => a.status === 'pending').length}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Admissions Approved</Text>
            <Text style={[styles.statValue, { color: P.green }]}>
              {applications.filter((a) => a.status === 'approved').length}
            </Text>
          </View>
        </View>

        {/* Search & Filter Pills */}
        <View style={styles.filterRow}>
          <View style={styles.searchBox}>
            <Text style={{ fontSize: 13, color: P.textMuted }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by student or parent name..."
              placeholderTextColor={P.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.statusFilters}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.statusFilterBtn, filter === st && styles.statusFilterBtnActive]}
                onPress={() => setFilter(st)}
              >
                <Text style={[styles.statusFilterText, filter === st && styles.statusFilterTextActive]}>
                  {st.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Applications Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>APPLICANT STUDENT</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>PARENT / GUARDIAN</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>APPLIED CLASS</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>DATE</Text>
            <Text style={[styles.th, { width: 100 }]}>STATUS</Text>
            <Text style={[styles.th, { width: 120, textAlign: 'right' }]}>ACTION</Text>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.studentName}>{item.studentName}</Text>
                  <Text style={styles.studentEmail}>{item.email}</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.parentName}>{item.parentName}</Text>
                  <Text style={styles.parentPhone}>{item.phone}</Text>
                </View>
                <Text style={[styles.td, { flex: 1.2, fontWeight: '600' }]}>{item.classApplied}</Text>
                <Text style={[styles.td, { flex: 1.2, color: P.textMuted }]}>{item.appliedDate}</Text>
                <View style={{ width: 100 }}>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'approved'
                        ? styles.pillApproved
                        : item.status === 'rejected'
                        ? styles.pillRejected
                        : styles.pillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            item.status === 'approved'
                              ? '#15803D'
                              : item.status === 'rejected'
                              ? '#DC2626'
                              : '#B45309',
                        },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={{ width: 120, alignItems: 'flex-end' }}>
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => setSelectedApp(item)}
                  >
                    <Text style={styles.reviewBtnText}>Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </View>

      {/* Review Modal */}
      {selectedApp && (
        <Modal transparent animationType="fade" visible={!!selectedApp} onRequestClose={() => setSelectedApp(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Admission Application Review</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Applicant Name:</Text>
                <Text style={styles.detailVal}>{selectedApp.studentName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Parent Name:</Text>
                <Text style={styles.detailVal}>{selectedApp.parentName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Class Requested:</Text>
                <Text style={styles.detailVal}>{selectedApp.classApplied}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact Email:</Text>
                <Text style={styles.detailVal}>{selectedApp.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone Number:</Text>
                <Text style={styles.detailVal}>{selectedApp.phone}</Text>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: P.green }]}
                  onPress={() => handleStatusChange(selectedApp.id, 'approved')}
                >
                  <Text style={styles.modalActionText}>Approve Admission</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: P.red }]}
                  onPress={() => handleStatusChange(selectedApp.id, 'rejected')}
                >
                  <Text style={styles.modalActionText}>Reject Application</Text>
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
  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: P.border },
  statLabel: { fontSize: 12, fontWeight: '600', color: P.textSec, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: P.text },
  filterRow: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: P.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: P.text, outlineStyle: 'none' as any },
  statusFilters: { flexDirection: 'row', gap: 6 },
  statusFilterBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: P.border },
  statusFilterBtnActive: { backgroundColor: P.primary, borderColor: P.primary },
  statusFilterText: { fontSize: 11, fontWeight: '700', color: P.textSec },
  statusFilterTextActive: { color: '#FFFFFF' },
  tableCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: P.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.border },
  th: { fontSize: 11, fontWeight: '700', color: P.textMuted, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  td: { fontSize: 13, color: P.text },
  studentName: { fontSize: 13, fontWeight: '700', color: P.text },
  studentEmail: { fontSize: 10.5, color: P.textMuted },
  parentName: { fontSize: 12.5, fontWeight: '600', color: P.text },
  parentPhone: { fontSize: 10.5, color: P.textMuted },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  pillApproved: { backgroundColor: '#DCFCE7' },
  pillRejected: { backgroundColor: '#FEE2E2' },
  pillPending: { backgroundColor: '#FEF3C7' },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  reviewBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: P.primary },
  reviewBtnText: { fontSize: 11.5, fontWeight: '700', color: P.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 24, width: '100%', maxWidth: 440 },
  modalHeading: { fontSize: 18, fontWeight: '800', color: P.text, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { fontSize: 13, fontWeight: '600', color: P.textSec },
  detailVal: { fontSize: 13, fontWeight: '700', color: P.text },
  actionButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalActionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modalActionText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
});
