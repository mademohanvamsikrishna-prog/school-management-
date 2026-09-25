import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { api as apiClient } from '../../../services/api';

interface StudentItem {
  id: string;
  name: string;
  roll_number?: string;
}

interface ExamSubjectItem {
  id: string;
  subject_name: string;
  max_marks: number;
}

interface EnterMarksModalProps {
  visible: boolean;
  onClose: () => void;
  examName: string;
  className: string;
  examSubjects: ExamSubjectItem[];
  students: StudentItem[];
  onMarksSaved: () => void;
  onPublishResults?: () => void;
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

export const EnterMarksModal: React.FC<EnterMarksModalProps> = ({
  visible,
  onClose,
  examName,
  className,
  examSubjects,
  students,
  onMarksSaved,
  onPublishResults,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [marksMap, setMarksMap] = useState<Record<string, string>>({}); // studentId -> marks string
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({}); // studentId -> remark string
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);

  useEffect(() => {
    if (examSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(examSubjects[0].id);
    }
  }, [examSubjects, selectedSubjectId]);

  const activeSubject = examSubjects.find((es) => es.id === selectedSubjectId);

  const validateEntries = (): { studentId: string; numMark: number; remark: string }[] | null => {
    if (!activeSubject) return null;
    const max = activeSubject.max_marks;
    const entries: { studentId: string; numMark: number; remark: string }[] = [];

    for (const student of students) {
      const val = marksMap[student.id];
      const remark = remarksMap[student.id] || '';
      if (val !== undefined && val.trim() !== '') {
        const num = parseFloat(val);
        if (isNaN(num)) {
          const msg = `Marks for ${student.name} must be a valid number.`;
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Invalid Input', msg);
          return null;
        }
        if (num < 0) {
          const msg = `Marks for ${student.name} cannot be negative.`;
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Invalid Input', msg);
          return null;
        }
        if (num > max) {
          const msg = `Marks for ${student.name} cannot exceed maximum marks (${max}).`;
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Invalid Input', msg);
          return null;
        }
        entries.push({ studentId: student.id, numMark: num, remark });
      }
    }

    if (entries.length === 0) {
      const msg = 'Please enter marks for at least one student.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Empty', msg);
      return null;
    }

    return entries;
  };

  const handleSaveDraft = async () => {
    const entries = validateEntries();
    if (!entries || !activeSubject) return;

    setSaving(true);
    setMessage(null);

    try {
      for (const entry of entries) {
        const pct = (entry.numMark / activeSubject.max_marks) * 100;
        const grade = gradeFromPct(pct);
        await apiClient.post('/marks/enter', {
          exam_subject_id: activeSubject.id,
          student_id: entry.studentId,
          marks_obtained: entry.numMark,
          grade: grade,
          remarks: entry.remark,
        });
      }

      setMessage('Marks saved successfully.');
      onMarksSaved();
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail ?? 'Failed to save marks.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPublish = async () => {
    setShowConfirmPublish(false);
    await handleSaveDraft();
    if (onPublishResults) {
      onPublishResults();
    }
    setMessage('Results published successfully.');
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Enter Student Marks</Text>
              <Text style={styles.modalSub}>
                {className} • {examName} • Academic Year 2025 - 2026
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Subject selector tabs */}
          <View style={styles.subjectTabsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {examSubjects.map((es) => {
                  const active = es.id === selectedSubjectId;
                  return (
                    <TouchableOpacity
                      key={es.id}
                      style={[styles.subjectTab, active && styles.subjectTabActive]}
                      onPress={() => setSelectedSubjectId(es.id)}
                    >
                      <Text style={[styles.subjectTabText, active && styles.subjectTabTextActive]}>
                        {es.subject_name}
                      </Text>
                      <Text style={[styles.subjectTabSub, active && { color: '#FFF' }]}>
                        Max {es.max_marks}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Confirmation Dialog Overlay for Publish */}
          {showConfirmPublish ? (
            <View style={styles.publishConfirmWrap}>
              <Text style={{ fontSize: 32 }}>📢</Text>
              <Text style={styles.confirmTitle}>Publish Results?</Text>
              <Text style={styles.confirmSub}>
                Are you sure you want to publish these results? Published results will become visible to students and parents.
              </Text>
              <View style={styles.confirmBtnRow}>
                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  onPress={() => setShowConfirmPublish(false)}
                >
                  <Text style={styles.confirmCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmPublishBtn}
                  onPress={handleConfirmPublish}
                >
                  <Text style={styles.confirmPublishBtnText}>Publish Results</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Student Entry List */}
              <ScrollView style={styles.bodyList} showsVerticalScrollIndicator={true}>
                {students.map((student, idx) => {
                  const val = marksMap[student.id] ?? '';
                  const numVal = parseFloat(val);
                  const max = activeSubject?.max_marks ?? 100;
                  const pct = !isNaN(numVal) ? (numVal / max) * 100 : null;
                  const grade = pct !== null ? gradeFromPct(pct) : '—';
                  const remark = remarksMap[student.id] ?? '';

                  return (
                    <View key={student.id} style={styles.studentRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>

                      <View style={{ flex: 1.5 }}>
                        <Text style={styles.sName}>{student.name}</Text>
                        <Text style={styles.sRoll}>Roll #{student.roll_number ?? (idx + 1014)}</Text>
                      </View>

                      {/* Marks Input */}
                      <View style={styles.inputGroupRow}>
                        <View style={styles.gradePill}>
                          <Text style={styles.gradePillText}>{grade}</Text>
                        </View>

                        <View style={styles.inputWrap}>
                          <TextInput
                            style={styles.marksInput}
                            placeholder="0"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={val}
                            onChangeText={(t) =>
                              setMarksMap((prev) => ({ ...prev, [student.id]: t }))
                            }
                          />
                          <Text style={styles.maxText}>/ {max}</Text>
                        </View>

                        {/* Remark input */}
                        <TextInput
                          style={styles.remarkInput}
                          placeholder="Remarks..."
                          placeholderTextColor="#94A3B8"
                          value={remark}
                          onChangeText={(r) =>
                            setRemarksMap((prev) => ({ ...prev, [student.id]: r }))
                          }
                        />
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                {message && (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>✅ {message}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveDraftBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSaveDraft}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#0F172A" size="small" />
                  ) : (
                    <Text style={styles.saveDraftBtnText}>Save Draft</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.publishBtn, saving && { opacity: 0.6 }]}
                  onPress={() => {
                    const entries = validateEntries();
                    if (entries) setShowConfirmPublish(true);
                  }}
                  disabled={saving}
                >
                  <Text style={styles.publishBtnText}>Publish Results</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    maxWidth: 720,
    maxHeight: '90%',
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
  subjectTabsRow: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subjectTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  subjectTabActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  subjectTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  subjectTabTextActive: {
    color: '#FFFFFF',
  },
  subjectTabSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bodyList: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },
  sName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sRoll: {
    fontSize: 12,
    color: '#64748B',
  },
  inputGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 2.5,
  },
  gradePill: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gradePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marksInput: {
    width: 58,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  maxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  remarkInput: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  publishConfirmWrap: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  confirmSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 440,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  confirmCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  confirmCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  confirmPublishBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
  },
  confirmPublishBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
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
    gap: 10,
    flexWrap: 'wrap',
  },
  messageBox: {
    flex: 1,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
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
  saveDraftBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  saveDraftBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  publishBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
