import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform
} from 'react-native';

export type AttStatus = 'present' | 'absent' | 'late';

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  roll_number?: string;
}

interface StudentAttendanceTableProps {
  students: StudentItem[];
  statuses: Record<string, AttStatus>;
  remarks: Record<string, string>;
  onStatusChange: (studentId: string, status: AttStatus) => void;
  onRemarkChange: (studentId: string, remark: string) => void;
  selectedClassName: string;
  onSubmit: () => void;
  submitting: boolean;
  submitted: boolean;
  onResetSubmitted: () => void;
}

type FilterTab = 'all' | 'present' | 'absent' | 'late';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const StudentAttendanceTable: React.FC<StudentAttendanceTableProps> = ({
  students,
  statuses,
  remarks,
  onStatusChange,
  onRemarkChange,
  selectedClassName,
  onSubmit,
  submitting,
  submitted,
  onResetSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Dynamic counts
  const presentCount = students.filter(s => (statuses[s.id] ?? 'present') === 'present').length;
  const absentCount  = students.filter(s => (statuses[s.id] ?? 'present') === 'absent').length;
  const lateCount    = students.filter(s => (statuses[s.id] ?? 'present') === 'late').length;

  // Filter students based on activeTab & tableSearch
  const filteredStudents = students.filter((st) => {
    const status = statuses[st.id] ?? 'present';
    if (activeTab === 'present' && status !== 'present') return false;
    if (activeTab === 'absent'  && status !== 'absent')  return false;
    if (activeTab === 'late'    && status !== 'late')    return false;

    if (tableSearch.trim() !== '') {
      const q = tableSearch.toLowerCase();
      const matchName = st.name.toLowerCase().includes(q);
      const matchRoll = (st.roll_number ?? '').toLowerCase().includes(q);
      return matchName || matchRoll;
    }

    return true;
  });

  // Checkbox select all toggle
  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every(s => selectedStudentIds.has(s.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedStudentIds);
      filteredStudents.forEach(s => next.delete(s.id));
      setSelectedStudentIds(next);
    } else {
      const next = new Set(selectedStudentIds);
      filteredStudents.forEach(s => next.add(s.id));
      setSelectedStudentIds(next);
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Filter Bar & Search */}
      <View style={styles.tableHeaderBar}>
        <View style={styles.tabsWrap}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'all' && styles.tabBtnTextActive]}>
              All Students ({students.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'present' && styles.tabBtnActive]}
            onPress={() => setActiveTab('present')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'present' && styles.tabBtnTextActive]}>
              Present ({presentCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'absent' && styles.tabBtnActive]}
            onPress={() => setActiveTab('absent')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'absent' && styles.tabBtnTextActive]}>
              Absent ({absentCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'late' && styles.tabBtnActive]}
            onPress={() => setActiveTab('late')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'late' && styles.tabBtnTextActive]}>
              Late ({lateCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Field */}
        <View style={styles.tableSearchWrap}>
          <Text style={{ fontSize: 13 }}>🔍</Text>
          <TextInput
            style={styles.tableSearchInput}
            placeholder="Search by name or roll number..."
            placeholderTextColor="#94A3B8"
            value={tableSearch}
            onChangeText={setTableSearch}
          />
        </View>
      </View>

      {/* Table Area */}
      <ScrollView horizontal={Platform.OS !== 'web'} showsHorizontalScrollIndicator={false}>
        <View style={styles.tableWrapper}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.cellCheck} onPress={toggleSelectAll}>
              <View style={[styles.checkbox, allFilteredSelected && styles.checkboxActive]}>
                {allFilteredSelected && <Text style={styles.checkTick}>✓</Text>}
              </View>
            </TouchableOpacity>

            <Text style={[styles.headerCell, { width: 40 }]}>#</Text>
            <Text style={[styles.headerCell, { flex: 2, minWidth: 180 }]}>Student Name</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Roll No.</Text>
            <Text style={[styles.headerCell, { width: 220, textAlign: 'center' }]}>Status</Text>
            <Text style={[styles.headerCell, { flex: 1.5, minWidth: 160 }]}>Remarks (Optional)</Text>
          </View>

          {/* Student Rows */}
          {filteredStudents.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 28 }}>🔍</Text>
              <Text style={styles.emptyText}>No matching students found</Text>
            </View>
          ) : (
            filteredStudents.map((student, idx) => {
              const status = statuses[student.id] ?? 'present';
              const isChecked = selectedStudentIds.has(student.id);

              return (
                <View key={student.id} style={[styles.row, isChecked && styles.rowSelected]}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={styles.cellCheck}
                    onPress={() => toggleSelectRow(student.id)}
                  >
                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                      {isChecked && <Text style={styles.checkTick}>✓</Text>}
                    </View>
                  </TouchableOpacity>

                  {/* Index */}
                  <Text style={[styles.bodyCell, { width: 40, color: '#94A3B8', fontWeight: '700' }]}>
                    {String(idx + 1).padStart(2, '0')}
                  </Text>

                  {/* Name + Avatar */}
                  <View style={{ flex: 2, minWidth: 180, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nameText} numberOfLines={1}>{student.name}</Text>
                      <Text style={styles.emailText} numberOfLines={1}>{student.email}</Text>
                    </View>
                  </View>

                  {/* Roll No */}
                  <Text style={[styles.bodyCell, { width: 100, fontWeight: '700', color: '#475569' }]}>
                    {student.roll_number ?? `RN-${101 + idx}`}
                  </Text>

                  {/* Status Buttons */}
                  <View style={{ width: 220, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                    {/* Present Button */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        status === 'present' && styles.statusBtnPresentActive,
                      ]}
                      onPress={() => onStatusChange(student.id, 'present')}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 12 }}>✓</Text>
                      <Text
                        style={[
                          styles.statusBtnText,
                          status === 'present' && styles.statusBtnTextActive,
                        ]}
                      >
                        Present
                      </Text>
                    </TouchableOpacity>

                    {/* Absent Button */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        status === 'absent' && styles.statusBtnAbsentActive,
                      ]}
                      onPress={() => onStatusChange(student.id, 'absent')}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 12 }}>✕</Text>
                      <Text
                        style={[
                          styles.statusBtnText,
                          status === 'absent' && styles.statusBtnTextActive,
                        ]}
                      >
                        Absent
                      </Text>
                    </TouchableOpacity>

                    {/* Late Button */}
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        status === 'late' && styles.statusBtnLateActive,
                      ]}
                      onPress={() => onStatusChange(student.id, 'late')}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 12 }}>⏰</Text>
                      <Text
                        style={[
                          styles.statusBtnText,
                          status === 'late' && styles.statusBtnTextActive,
                        ]}
                      >
                        Late
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Remarks Input */}
                  <View style={{ flex: 1.5, minWidth: 160 }}>
                    <TextInput
                      style={styles.remarkInput}
                      placeholder="Add remark..."
                      placeholderTextColor="#94A3B8"
                      value={remarks[student.id] ?? ''}
                      onChangeText={(text) => onRemarkChange(student.id, text)}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      {submitted ? (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            ✓ Attendance submitted successfully! Notifications sent to parents and students.
          </Text>
          <TouchableOpacity onPress={onResetSubmitted} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Records</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={onSubmit}
          disabled={submitting || students.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>
            {submitting
              ? 'Submitting Attendance...'
              : `Submit Attendance for ${selectedClassName} →`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    padding: 20,
    marginBottom: 24,
  },
  tableHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
    flexWrap: 'wrap',
  },
  tabsWrap: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#7C3AED',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  tableSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 220,
    gap: 8,
  },
  tableSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  tableWrapper: {
    minWidth: 700,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  cellCheck: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkTick: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 10,
  },
  rowSelected: {
    backgroundColor: '#F5F3FF',
  },
  bodyCell: {
    fontSize: 13,
    color: '#0F172A',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6D28D9',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  emailText: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  statusBtnPresentActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusBtnAbsentActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  statusBtnLateActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  remarkInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  emptyWrap: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  successText: {
    flex: 1,
    color: '#15803D',
    fontSize: 14,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
