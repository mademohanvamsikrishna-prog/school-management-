import React, { useState } from 'react';
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

interface AddClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newClass: Partial<ClassRowItem>) => void;
}

const AVAILABLE_SUBJECTS: SubjectItem[] = [
  { id: 'subj-1', name: 'Mathematics', code: 'MATH101' },
  { id: 'subj-2', name: 'Physics', code: 'PHY101' },
  { id: 'subj-3', name: 'Chemistry', code: 'CHEM101' },
  { id: 'subj-4', name: 'English', code: 'ENG101' },
  { id: 'subj-5', name: 'Computer Science', code: 'CS101' },
  { id: 'subj-6', name: 'Biology', code: 'BIO101' },
];

export const AddClassModal: React.FC<AddClassModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('10');
  const [section, setSection] = useState('A');
  const [roomNumber, setRoomNumber] = useState('101');
  const [capacity, setCapacity] = useState('40');
  const [teacherName, setTeacherName] = useState('Ms. Sreeja');
  const [academicYear, setAcademicYear] = useState('2025 – 2026');
  const [weeklyPeriods, setWeeklyPeriods] = useState('8');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectItem[]>([
    AVAILABLE_SUBJECTS[0],
    AVAILABLE_SUBJECTS[1],
    AVAILABLE_SUBJECTS[3],
  ]);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleSubject = (subj: SubjectItem) => {
    if (selectedSubjects.some((s) => s.id === subj.id)) {
      setSelectedSubjects((prev) => prev.filter((s) => s.id !== subj.id));
    } else {
      setSelectedSubjects((prev) => [...prev, subj]);
    }
  };

  const handleSave = () => {
    if (!className.trim()) {
      setErrorMsg('Class name is required (e.g. Class 10-A)');
      return;
    }
    if (selectedSubjects.length === 0) {
      setErrorMsg('Please select at least one subject');
      return;
    }

    onSave({
      name: className.trim(),
      gradeLevel: parseInt(gradeLevel, 10) || 10,
      section: section.trim() || 'A',
      roomNumber: roomNumber.trim() || '101',
      capacity: parseInt(capacity, 10) || 40,
      studentCount: 0,
      teacherName: teacherName.trim() || 'Ms. Sreeja',
      isClassTeacher: true,
      subjects: selectedSubjects,
      weeklyPeriods: parseInt(weeklyPeriods, 10) || 8,
      attendanceAvg: 100,
      status,
      academicYear,
    });

    // Reset Form
    setClassName('');
    setErrorMsg('');
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
              <Text style={styles.title}>🏫 Create New Class</Text>
              <Text style={styles.subtitle}>
                Define classroom parameters, subjects, and weekly schedule
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
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
                  placeholder="e.g. Class 10 - C"
                  placeholderTextColor="#94A3B8"
                  value={className}
                  onChangeText={setClassName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Grade Level</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  keyboardType="numeric"
                  value={gradeLevel}
                  onChangeText={setGradeLevel}
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
                <Text style={styles.label}>Room Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Room 101"
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class Teacher</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ms. Sreeja"
                  value={teacherName}
                  onChangeText={setTeacherName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Academic Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025 – 2026"
                  value={academicYear}
                  onChangeText={setAcademicYear}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weekly Teaching Periods</Text>
                <TextInput
                  style={styles.input}
                  placeholder="8"
                  keyboardType="numeric"
                  value={weeklyPeriods}
                  onChangeText={setWeeklyPeriods}
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
              <Text style={styles.label}>Assign Subjects to Class *</Text>
              <View style={styles.subjectPillsWrap}>
                {AVAILABLE_SUBJECTS.map((subj) => {
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
              <Text style={styles.saveBtnText}>Create Class</Text>
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
