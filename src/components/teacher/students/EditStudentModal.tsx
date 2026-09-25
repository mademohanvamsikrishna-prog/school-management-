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
import { StudentRowItem } from './StudentsTable';

interface EditStudentModalProps {
  visible: boolean;
  student: StudentRowItem | null;
  onClose: () => void;
  onSave: (updatedStudent: StudentRowItem) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  visible,
  student,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [section, setSection] = useState('A');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setRollNumber(student.rollNumber || '');
      setEmail(student.email || '');
      setPhone(student.phone || '');
      setSection(student.section || 'A');
      setDob(student.dob || '');
      setGender((student.gender as any) || 'Male');
      setParentName(student.parentName || '');
      setParentPhone(student.parentPhone || '');
      setStatus(student.status || 'ACTIVE');
      setErrorMsg('');
    }
  }, [student]);

  if (!student) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    onSave({
      ...student,
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim(),
      phone: phone.trim(),
      section,
      dob: dob.trim(),
      gender,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
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
              <Text style={styles.title}>✏️ Edit Student Details</Text>
              <Text style={styles.subtitle}>Update information for {student.name}</Text>
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
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Roll Number *</Text>
                <TextInput
                  style={styles.input}
                  value={rollNumber}
                  onChangeText={setRollNumber}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
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
                        styles.chipSec,
                        section === sec && styles.chipSecActive,
                      ]}
                      onPress={() => setSection(sec)}
                    >
                      <Text
                        style={[
                          styles.chipSecText,
                          section === sec && styles.chipSecTextActive,
                        ]}
                      >
                        Sec {sec}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.chipRow}>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.chipSec,
                        gender === g && styles.chipSecActive,
                      ]}
                      onPress={() => setGender(g as any)}
                    >
                      <Text
                        style={[
                          styles.chipSecText,
                          gender === g && styles.chipSecTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  value={dob}
                  onChangeText={setDob}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.chipSec,
                      status === 'ACTIVE' && { backgroundColor: '#D1FAE5', borderColor: '#059669' },
                    ]}
                    onPress={() => setStatus('ACTIVE')}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: status === 'ACTIVE' ? '#059669' : '#64748B' }}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chipSec,
                      status === 'INACTIVE' && { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
                    ]}
                    onPress={() => setStatus('INACTIVE')}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: status === 'INACTIVE' ? '#DC2626' : '#64748B' }}>
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parent / Guardian Name</Text>
                <TextInput
                  style={styles.input}
                  value={parentName}
                  onChangeText={setParentName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parent Phone</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={parentPhone}
                  onChangeText={setParentPhone}
                />
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
    borderRadius: 20,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  chipSec: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  chipSecActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  chipSecText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  chipSecTextActive: {
    color: '#7C3AED',
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
