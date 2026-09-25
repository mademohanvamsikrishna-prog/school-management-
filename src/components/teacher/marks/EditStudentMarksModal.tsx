import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { api as apiClient } from '../../../services/api';
import { StudentResultItem } from './StudentResultsTable';

interface EditStudentMarksModalProps {
  visible: boolean;
  onClose: () => void;
  student: StudentResultItem | null;
  examSubjects: { id: string; subject_name: string; max_marks: number }[];
  onSaved: () => void;
}

function gradeFromPct(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'F';
}

export const EditStudentMarksModal: React.FC<EditStudentMarksModalProps> = ({
  visible,
  onClose,
  student,
  examSubjects,
  onSaved,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [marksStr, setMarksStr] = useState<string>('');
  const [remarkStr, setRemarkStr] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(examSubjects[0].id);
    }
  }, [examSubjects, selectedSubjectId]);

  const activeSubject = examSubjects.find((es) => es.id === selectedSubjectId);

  useEffect(() => {
    if (student && activeSubject) {
      const sm = student.subjectMarks[activeSubject.id];
      if (sm && sm.marks !== undefined) {
        setMarksStr(String(sm.marks));
      } else {
        setMarksStr('');
      }
      setRemarkStr('');
    }
  }, [student, activeSubject]);

  if (!student) return null;

  const numVal = parseFloat(marksStr);
  const maxMarks = activeSubject?.max_marks ?? 100;
  const pct = !isNaN(numVal) ? (numVal / maxMarks) * 100 : null;
  const grade = pct !== null ? gradeFromPct(pct) : '—';

  const handleSaveChanges = async () => {
    if (!activeSubject) return;

    if (marksStr.trim() === '') {
      const msg = 'Please enter a valid mark.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
      return;
    }

    if (isNaN(numVal) || numVal < 0 || numVal > maxMarks) {
      const msg = `Marks must be a number between 0 and ${maxMarks}.`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation Error', msg);
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/marks/enter', {
        exam_subject_id: activeSubject.id,
        student_id: student.id,
        marks_obtained: numVal,
        grade: grade,
        remarks: remarkStr,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail ?? 'Failed to update marks.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Edit Student Marks</Text>
              <Text style={styles.modalSub}>
                {student.name} • Roll #{student.rollNumber}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Subject Dropdown / Pill row */}
            <Text style={styles.label}>SELECT SUBJECT</Text>
            <View style={styles.subjectRow}>
              {examSubjects.map((es) => {
                const active = es.id === selectedSubjectId;
                return (
                  <TouchableOpacity
                    key={es.id}
                    style={[styles.subjectPill, active && styles.subjectPillActive]}
                    onPress={() => setSelectedSubjectId(es.id)}
                  >
                    <Text style={[styles.subjectPillText, active && styles.subjectPillTextActive]}>
                      {es.subject_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Form Fields */}
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Marks Obtained</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={marksStr}
                    onChangeText={setMarksStr}
                  />
                  <Text style={styles.maxText}>/ {maxMarks}</Text>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Calculated Grade</Text>
                <View style={styles.gradeBox}>
                  <Text style={styles.gradeBoxText}>{grade}</Text>
                </View>
              </View>
            </View>

            {/* Remarks */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.fieldLabel}>Teacher Remarks</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Optional feedback or remarks for student..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={remarkStr}
                onChangeText={setRemarkStr}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSaveChanges}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  subjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectPillActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  subjectPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  subjectPillTextActive: {
    color: '#FFFFFF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 44,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  maxText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  gradeBox: {
    height: 44,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  gradeBoxText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7C3AED',
  },
  textarea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
