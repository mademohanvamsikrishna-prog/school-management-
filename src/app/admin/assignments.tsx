/**
 * AdminAssignmentsScreen — Dedicated Assignments Management
 * Route: /admin/assignments
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
  amber: '#F59E0B',
};

interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  class: string;
  teacher: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
}

export default function AdminAssignmentsScreen() {
  const [addModal, setAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [className, setClassName] = useState('Class 7-B');
  const [dueDate, setDueDate] = useState('28 Sep 2026');

  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    { id: '1', title: 'Quadratic Equations & Polynomials', subject: 'Mathematics', class: 'Class 10-A', teacher: 'Dr. Priya Desai', dueDate: '28 Sep 2026', submissionsCount: 42, totalStudents: 45 },
    { id: '2', title: 'Photosynthesis & Plant Respiration', subject: 'Science', class: 'Class 7-B', teacher: 'Mr. Rajesh Verma', dueDate: '30 Sep 2026', submissionsCount: 38, totalStudents: 40 },
    { id: '3', title: 'Essay: The Renaissance Period', subject: 'English Literature', class: 'Class 9-C', teacher: 'Mrs. Sunita Rao', dueDate: '02 Oct 2026', submissionsCount: 30, totalStudents: 36 },
    { id: '4', title: 'Constitutional Rights & Duties', subject: 'Social Studies', class: 'Class 8-A', teacher: 'Mr. Arvind Joshi', dueDate: '04 Oct 2026', submissionsCount: 35, totalStudents: 38 },
  ]);

  const handleCreate = () => {
    if (!title.trim()) return;
    setAssignments((prev) => [
      {
        id: String(Date.now()),
        title,
        subject,
        class: className,
        teacher: 'Academic Faculty',
        dueDate,
        submissionsCount: 0,
        totalStudents: 40,
      },
      ...prev,
    ]);
    setTitle('');
    setAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.breadcrumb}>ACADEMIC MANAGEMENT / ASSIGNMENTS</Text>
            <Text style={styles.pageTitle}>Homework & Academic Assignments</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Create Assignment</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Summary Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Course Assignments</Text>
            <Text style={styles.statValue}>{assignments.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Submission Rate</Text>
            <Text style={[styles.statValue, { color: P.green }]}>92.4%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Reviews</Text>
            <Text style={[styles.statValue, { color: P.amber }]}>14</Text>
          </View>
        </View>

        {/* Assignments Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>ASSIGNMENT TITLE</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>SUBJECT</Text>
            <Text style={[styles.th, { flex: 1 }]}>CLASS</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>DUE DATE</Text>
            <Text style={[styles.th, { width: 140, textAlign: 'right' }]}>SUBMISSIONS</Text>
          </View>

          <FlatList
            data={assignments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.assignTitle}>{item.title}</Text>
                  <Text style={styles.assignTeacher}>Instructor: {item.teacher}</Text>
                </View>
                <Text style={[styles.td, { flex: 1.2, fontWeight: '600' }]}>{item.subject}</Text>
                <Text style={[styles.td, { flex: 1, color: P.textSec }]}>{item.class}</Text>
                <Text style={[styles.td, { flex: 1.2, color: P.textMuted }]}>{item.dueDate}</Text>
                <View style={{ width: 140, alignItems: 'flex-end' }}>
                  <View style={styles.submissionPill}>
                    <Text style={styles.submissionText}>
                      {item.submissionsCount} / {item.totalStudents} ({Math.round((item.submissionsCount / item.totalStudents) * 100)}%)
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </View>

      {/* Add Modal */}
      {addModal && (
        <Modal transparent animationType="fade" visible={addModal} onRequestClose={() => setAddModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Create Course Assignment</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assignment Title</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Chapter 4 Exercises" value={title} onChangeText={setTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput style={styles.modalInput} value={subject} onChangeText={setSubject} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Class</Text>
                <TextInput style={styles.modalInput} value={className} onChangeText={setClassName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Submission Due Date</Text>
                <TextInput style={styles.modalInput} value={dueDate} onChangeText={setDueDate} />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                  <Text style={styles.saveBtnText}>Publish Assignment</Text>
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
  tableCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: P.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.border },
  th: { fontSize: 11, fontWeight: '700', color: P.textMuted, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  td: { fontSize: 13, color: P.text },
  assignTitle: { fontSize: 13, fontWeight: '700', color: P.text },
  assignTeacher: { fontSize: 11, color: P.textMuted },
  submissionPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  submissionText: { fontSize: 11, fontWeight: '800', color: '#15803D' },
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
