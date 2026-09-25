import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { StudentRowItem } from './StudentsTable';

interface ViewStudentProfileModalProps {
  visible: boolean;
  student: StudentRowItem | null;
  onClose: () => void;
  onEdit: (student: StudentRowItem) => void;
}

export const ViewStudentProfileModal: React.FC<ViewStudentProfileModalProps> = ({
  visible,
  student,
  onClose,
  onEdit,
}) => {
  if (!student) return null;

  const initials = student.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const attendanceRate = student.attendancePct ?? 92;

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
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>👤 Student Profile</Text>
              <Text style={styles.subtitle}>Detailed student records and performance overview</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Top Profile Banner */}
            <View style={styles.profileHero}>
              {student.avatarUrl ? (
                <Image source={{ uri: student.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}

              <View style={styles.heroInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.heroName}>{student.name}</Text>
                  <View
                    style={[
                      styles.badge,
                      student.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        student.status === 'ACTIVE' ? styles.badgeActiveText : styles.badgeInactiveText,
                      ]}
                    >
                      {student.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.heroSub}>
                  Roll No: <Text style={styles.heroSubBold}>{student.rollNumber || '101'}</Text> • Class:{' '}
                  <Text style={styles.heroSubBold}>{student.className}</Text> (Sec {student.section || 'A'})
                </Text>

                <Text style={styles.heroEmail}>✉️ {student.email}</Text>
              </View>
            </View>

            {/* Performance Stats Cards */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                <Text style={styles.statIcon}>📅</Text>
                <Text style={styles.statVal}>{attendanceRate}%</Text>
                <Text style={styles.statLbl}>Attendance Rate</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statVal}>88.5%</Text>
                <Text style={styles.statLbl}>Avg Exam Score</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={styles.statIcon}>🏆</Text>
                <Text style={styles.statVal}>Rank #4</Text>
                <Text style={styles.statLbl}>Class Position</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Text style={styles.statIcon}>📝</Text>
                <Text style={styles.statVal}>18 / 20</Text>
                <Text style={styles.statLbl}>Assignments</Text>
              </View>
            </View>

            {/* General Info Grid */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📌 Personal & Contact Details</Text>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLbl}>Date of Birth</Text>
                  <Text style={styles.gridVal}>{student.dob || '15 May 2011'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.gridLbl}>Gender</Text>
                  <Text style={styles.gridVal}>{student.gender || 'Male'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.gridLbl}>Contact Phone</Text>
                  <Text style={styles.gridVal}>{student.phone || '+91 98765 43210'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.gridLbl}>Admission Date</Text>
                  <Text style={styles.gridVal}>{student.admissionDate || '01 Apr 2023'}</Text>
                </View>
              </View>
            </View>

            {/* Parent Info Grid */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>👨‍👩‍👧 Parent & Guardian Information</Text>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLbl}>Parent Name</Text>
                  <Text style={styles.gridVal}>{student.parentName || 'Suresh Sharma'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.gridLbl}>Parent Phone</Text>
                  <Text style={styles.gridVal}>{student.parentPhone || '+91 98765 12345'}</Text>
                </View>

                <View style={[styles.gridItem, { width: '100%' }]}>
                  <Text style={styles.gridLbl}>Residential Address</Text>
                  <Text style={styles.gridVal}>
                    House No 45, MG Road, Sector 14, Bengaluru - 560001
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.editBtn} onPress={() => { onClose(); onEdit(student); }}>
              <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
              <Text style={styles.closeModalBtnText}>Close</Text>
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
    maxWidth: 680,
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
  headerTitleWrap: {
    flex: 1,
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
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
    marginBottom: 20,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  heroSubBold: {
    color: '#0F172A',
    fontWeight: '700',
  },
  heroEmail: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: { backgroundColor: '#D1FAE5' },
  badgeActiveText: { color: '#059669', fontSize: 10, fontWeight: '800' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeInactiveText: { color: '#DC2626', fontSize: 10, fontWeight: '800' },
  badgeText: {},
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 130,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '46%',
  },
  gridLbl: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  gridVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
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
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  closeModalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  closeModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
