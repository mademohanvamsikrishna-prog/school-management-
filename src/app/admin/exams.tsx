/**
 * AdminExamsScreen — Dedicated Exams & Results Management
 * Route: /admin/exams
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { getAdminMarks, AdminMarkRecord } from '../../services/admin';

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
  amber: '#F59E0B',
};

export default function AdminExamsScreen() {
  const [marks, setMarks] = useState<AdminMarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [examName, setExamName] = useState('Term 1 Half-Yearly Exam');
  const [examDate, setExamDate] = useState('15 Oct 2026');

  useEffect(() => {
    getAdminMarks(50)
      .then(setMarks)
      .catch(() => {
        setMarks([
          { id: '1', student_id: 's1', student_name: 'Ananya Gupta', subject: 'Mathematics', exam_name: 'Term 1 Mid-Term', marks_obtained: 95, max_marks: 100, grade: 'A+' },
          { id: '2', student_id: 's1', student_name: 'Ananya Gupta', subject: 'Science', exam_name: 'Term 1 Mid-Term', marks_obtained: 92, max_marks: 100, grade: 'A+' },
          { id: '3', student_id: 's2', student_name: 'Rahul Sharma', subject: 'Physics', exam_name: 'Term 1 Mid-Term', marks_obtained: 88, max_marks: 100, grade: 'A' },
          { id: '4', student_id: 's2', student_name: 'Rahul Sharma', subject: 'Mathematics', exam_name: 'Term 1 Mid-Term', marks_obtained: 96, max_marks: 100, grade: 'A+' },
          { id: '5', student_id: 's3', student_name: 'Aditya Kumar', subject: 'Social Studies', exam_name: 'Term 1 Mid-Term', marks_obtained: 78, max_marks: 100, grade: 'B+' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.breadcrumb}>ACADEMIC MANAGEMENT / EXAMS & RESULTS</Text>
            <Text style={styles.pageTitle}>Exams & Performance Grading</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Schedule Exam</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Summary Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Examinations</Text>
            <Text style={styles.statValue}>2</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average Class Score</Text>
            <Text style={[styles.statValue, { color: P.green }]}>91.2%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Published Score Records</Text>
            <Text style={[styles.statValue, { color: P.purple }]}>{marks.length}</Text>
          </View>
        </View>

        {/* Results / Marks Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>STUDENT NAME</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>EXAM TITLE</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>SUBJECT</Text>
            <Text style={[styles.th, { width: 100, textAlign: 'center' }]}>MARKS</Text>
            <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>GRADE</Text>
          </View>

          <FlatList
            data={marks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.student_name[0]}</Text>
                  </View>
                  <Text style={styles.studentName}>{item.student_name}</Text>
                </View>
                <Text style={[styles.td, { flex: 1.5, color: P.textSec }]}>{item.exam_name}</Text>
                <Text style={[styles.td, { flex: 1.5, fontWeight: '600' }]}>{item.subject}</Text>
                <Text style={[styles.td, { width: 100, textAlign: 'center', fontWeight: '800' }]}>
                  {item.marks_obtained} / {item.max_marks}
                </Text>
                <View style={{ width: 80, alignItems: 'flex-end' }}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>{item.grade}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </View>

      {/* Add Exam Modal */}
      {addModal && (
        <Modal transparent animationType="fade" visible={addModal} onRequestClose={() => setAddModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Schedule New Examination</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Exam Title</Text>
                <TextInput style={styles.modalInput} value={examName} onChangeText={setExamName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Commencing Date</Text>
                <TextInput style={styles.modalInput} value={examDate} onChangeText={setExamDate} />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.saveBtnText}>Publish Exam</Text>
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
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  studentName: { fontSize: 13, fontWeight: '700', color: P.text },
  gradeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  gradeBadgeText: { fontSize: 11, fontWeight: '800', color: '#15803D' },
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
