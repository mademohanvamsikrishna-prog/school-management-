import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { StudentResultItem } from './StudentResultsTable';

interface ViewStudentResultModalProps {
  visible: boolean;
  onClose: () => void;
  student: StudentResultItem | null;
  examName: string;
  className: string;
  subjects: { id: string; name: string }[];
}

export const ViewStudentResultModal: React.FC<ViewStudentResultModalProps> = ({
  visible,
  onClose,
  student,
  examName,
  className,
  subjects,
}) => {
  if (!student) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Student Report Card</Text>
              <Text style={styles.modalSub}>
                {className} • {examName}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={true}>
            {/* Student Profile Card Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentMeta}>
                  Roll #{student.rollNumber} • {student.email ?? 'Student'}
                </Text>
              </View>

              <View style={styles.gradeBadgeWrap}>
                <Text style={styles.gradeBadgeVal}>{student.overallGrade}</Text>
                <Text style={styles.gradeBadgeSub}>{student.percentage.toFixed(1)}%</Text>
              </View>
            </View>

            {/* Quick Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Score</Text>
                <Text style={styles.metricValue}>
                  {student.totalMarksObtained} <Text style={{ fontSize: 13, color: '#94A3B8' }}>/ {student.totalMaxMarks}</Text>
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Overall Percentage</Text>
                <Text style={[styles.metricValue, { color: '#7C3AED' }]}>
                  {student.percentage.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Result Status</Text>
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        student.status === 'PASS'
                          ? '#059669'
                          : student.status === 'NEEDS_IMPROVEMENT'
                          ? '#D97706'
                          : '#DC2626',
                    },
                  ]}
                >
                  {student.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {/* Subject Breakdown Table */}
            <Text style={styles.sectionTitle}>SUBJECT BREAKDOWN</Text>

            <View style={styles.tableContainer}>
              <View style={styles.thRow}>
                <Text style={[styles.th, { flex: 2 }]}>SUBJECT</Text>
                <Text style={[styles.th, { flex: 1.2, textAlign: 'center' }]}>MARKS</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>%</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>GRADE</Text>
              </View>

              {subjects.map((sub) => {
                const sm = student.subjectMarks[sub.id];
                const pct = sm ? (sm.marks / sm.maxMarks) * 100 : 0;

                return (
                  <View key={sub.id} style={styles.trRow}>
                    <Text style={[styles.tdSubject, { flex: 2 }]}>{sub.name}</Text>

                    <Text style={[styles.tdMarks, { flex: 1.2, textAlign: 'center' }]}>
                      {sm ? `${sm.marks} / ${sm.maxMarks}` : '—'}
                    </Text>

                    <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>
                      {sm ? `${pct.toFixed(0)}%` : '—'}
                    </Text>

                    <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                      <View style={styles.subjectGradePill}>
                        <Text style={styles.subjectGradePillText}>{sm ? sm.grade : '—'}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterBtnText}>Close</Text>
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
    maxWidth: 600,
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
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7C3AED',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  gradeBadgeWrap: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  gradeBadgeVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gradeBadgeSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E9D5FF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  thRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdSubject: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  tdMarks: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  tdText: {
    fontSize: 13,
    color: '#64748B',
  },
  td: {
    justifyContent: 'center',
  },
  subjectGradePill: {
    backgroundColor: '#F5F3FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  subjectGradePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
  },
  closeFooterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  closeFooterBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});
