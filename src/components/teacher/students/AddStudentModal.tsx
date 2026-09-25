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
import { StudentRowItem } from './StudentsTable';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (student: Partial<StudentRowItem>) => void;
  availableClasses: Array<{ id: string; name: string }>;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onSave,
  availableClasses,
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [classId, setClassId] = useState(availableClasses[0]?.id || 'class-10a');
  const [section, setSection] = useState('A');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Student full name is required');
      return;
    }
    if (!rollNumber.trim()) {
      setErrorMsg('Roll number is required');
      return;
    }

    const selectedClass = availableClasses.find((c) => c.id === classId);
    const className = selectedClass ? selectedClass.name : 'Class 10-A';

    onSave({
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      phone: phone.trim(),
      classId,
      className,
      section,
      dob: dob.trim() || '15 May 2011',
      gender,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      status,
      admissionDate: new Date().toISOString().split('T')[0],
      isNewAdmission: true,
      attendancePct: 100,
    });

    // Reset form
    setName('');
    setRollNumber('');
    setEmail('');
    setPhone('');
    setParentName('');
    setParentPhone('');
    setAddress('');
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
              <Text style={styles.title}>🎓 Add New Student</Text>
              <Text style={styles.subtitle}>Fill in student details to enroll in class roster</Text>
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
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Roll Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 101"
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
                  placeholder="student@school.edu"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 9876543210"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class</Text>
                <View style={styles.selectWrap}>
                  {availableClasses.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.chip,
                        classId === c.id && styles.chipActive,
                      ]}
                      onPress={() => setClassId(c.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          classId === c.id && styles.chipTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                  placeholder="e.g. 15 May 2011"
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
                  placeholder="e.g. Suresh Sharma"
                  value={parentName}
                  onChangeText={setParentName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parent Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 9876543210"
                  keyboardType="phone-pad"
                  value={parentPhone}
                  onChangeText={setParentPhone}
                />
              </View>
            </View>

            <View style={styles.inputGroupFull}>
              <Text style={styles.label}>Residential Address</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Street address, City, Pincode"
                multiline
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Student</Text>
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
  inputGroupFull: {
    marginBottom: 16,
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
  selectWrap: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#7C3AED',
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
