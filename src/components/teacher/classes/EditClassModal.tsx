import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { ClassRowItem, SubjectItem } from './ClassesTable';

interface EditClassModalProps {
  visible: boolean;
  classItem: ClassRowItem | null;
  onClose: () => void;
  onSave: (updatedClass: ClassRowItem) => void;
}

const ALL_SUBJECTS: SubjectItem[] = [
  { id: 'subj-1', name: 'Mathematics', code: 'MATH101' },
  { id: 'subj-2', name: 'Physics', code: 'PHY101' },
  { id: 'subj-3', name: 'Chemistry', code: 'CHEM101' },
  { id: 'subj-4', name: 'English', code: 'ENG101' },
  { id: 'subj-5', name: 'Computer Science', code: 'CS101' },
  { id: 'subj-6', name: 'Biology', code: 'BIO101' },
];

export const EditClassModal: React.FC<EditClassModalProps> = ({
  visible,
  classItem,
  onClose,
  onSave,
}) => {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('A');
  const [roomNumber, setRoomNumber] = useState('101');
  const [teacherName, setTeacherName] = useState('Ms. Sreeja');
  const [academicYear, setAcademicYear] = useState('2025 – 2026');
  const [weeklyPeriods, setWeeklyPeriods] = useState('8');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectItem[]>([]);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (classItem) {
      setClassName(classItem.name || '');
      setSection(classItem.section || 'A');
      setRoomNumber(classItem.roomNumber || '101');
      setTeacherName(classItem.teacherName || 'Ms. Sreeja');
      setAcademicYear(classItem.academicYear || '2025 – 2026');
      setWeeklyPeriods(classItem.weeklyPeriods ? classItem.weeklyPeriods.toString() : '8');
      setSelectedSubjects(classItem.subjects || []);
      setStatus(classItem.status || 'ACTIVE');
      setErrorMsg('');
    }
  }, [classItem]);

  if (!classItem) return null;

  const toggleSubject = (subj: SubjectItem) => {
    if (selectedSubjects.some((s) => s.id === subj.id)) {
      setSelectedSubjects((prev) => prev.filter((s) => s.id !== subj.id));
    } else {
      setSelectedSubjects((prev) => [...prev, subj]);
    }
  };

  const handleSave = () => {
    if (!className.trim()) {
      setErrorMsg('Class name is required');
      return;
    }
    if (selectedSubjects.length === 0) {
      setErrorMsg('Please select at least one subject');
      return;
    }

    onSave({
      ...classItem,
      name: className.trim(),
      section: section.trim() || 'A',
      roomNumber: roomNumber.trim() || '101',
      teacherName: teacherName.trim() || 'Ms. Sreeja',
      academicYear,
      weeklyPeriods: parseInt(weeklyPeriods, 10) || 8,
      subjects: selectedSubjects,
      status,
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>✏️ Edit Class</Text>
              <Text style={styles.subtitle}>Update classroom configuration and schedule</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class Name *</Text>
                <TextInput
                  style={styles.input}
                  value={className}
                  onChangeText={setClassName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Room Number</Text>
                <TextInput
                  style={styles.input}
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Section</Text>
                <View style={styles.chipRow}>
                  {['A', 'B', 'C', 'D'].map((sec) => (
                    <TouchableOpacity
                      key={sec}
                      style={[
                        styles.secChip,
                        section === sec && styles.secChipActive,
                      ]}
                      onPress={() => setSection(sec)}
                    >
                      <Text
                        style={[
                          styles.secChipText,
                          section === sec && styles.secChipTextActive,
                        ]}
                      >
                        Sec {sec}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weekly Periods</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={weeklyPeriods}
                  onChangeText={setWeeklyPeriods}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class Teacher</Text>
                <TextInput
                  style={styles.input}
                  value={teacherName}
                  onChangeText={setTeacherName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.secChip,
                      status === 'ACTIVE' && { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
                    ]}
                    onPress={() => setStatus('ACTIVE')}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: status === 'ACTIVE' ? '#059669' : '#64748B',
                      }}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.secChip,
                      status === 'INACTIVE' && { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
                    ]}
                    onPress={() => setStatus('INACTIVE')}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: status === 'INACTIVE' ? '#DC2626' : '#64748B',
                      }}
                    >
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Subjects Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>Class Subjects</Text>
              <View style={styles.subjectPillsWrap}>
                {ALL_SUBJECTS.map((subj) => {
                  const isChecked = selectedSubjects.some((s) => s.id === subj.id);
                  return (
                    <TouchableOpacity
                      key={subj.id}
                      style={[
                        styles.subjSelectChip,
                        isChecked && styles.subjSelectChipActive,
                      ]}
                      onPress={() => toggleSubject(subj)}
                    >
                      <Text
                        style={[
                          styles.subjSelectChipText,
                          isChecked && styles.subjSelectChipTextActive,
                        ]}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {subj.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  body: {
    padding: 24,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: 240,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  secChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  secChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  secChipTextActive: {
    color: '#7C3AED',
  },
  subjectPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjSelectChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  subjSelectChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  subjSelectChipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
