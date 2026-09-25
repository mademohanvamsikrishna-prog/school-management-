import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { ClassRowItem } from './ClassesTable';

interface ViewClassModalProps {
  visible: boolean;
  classItem: ClassRowItem | null;
  onClose: () => void;
  onEdit: (cls: ClassRowItem) => void;
  onNavigateToStudents: (classId: string, className: string) => void;
  onNavigateToTimetable: (classId: string, className: string) => void;
}

export const ViewClassModal: React.FC<ViewClassModalProps> = ({
  visible,
  classItem,
  onClose,
  onEdit,
  onNavigateToStudents,
  onNavigateToTimetable,
}) => {
  if (!classItem) return null;

  const badgeLabel = `${classItem.gradeLevel || 10}${classItem.section || 'A'}`;

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
              <Text style={styles.title}>🏫 Classroom Overview</Text>
              <Text style={styles.subtitle}>Detailed class parameters and academic metrics</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Hero Card */}
            <View style={styles.classHero}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{badgeLabel}</Text>
              </View>

              <View style={styles.heroDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.heroClassName}>{classItem.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      classItem.status === 'ACTIVE'
                        ? styles.statusActiveBadge
                        : styles.statusInactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        classItem.status === 'ACTIVE'
                          ? styles.statusActiveText
                          : styles.statusInactiveText,
                      ]}
                    >
                      {classItem.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.heroMeta}>
                  Section: <Text style={styles.heroMetaBold}>{classItem.section || 'A'}</Text> • Room:{' '}
                  <Text style={styles.heroMetaBold}>{classItem.roomNumber || '101'}</Text> • Year:{' '}
                  <Text style={styles.heroMetaBold}>{classItem.academicYear || '2025 – 2026'}</Text>
                </Text>

                <Text style={styles.heroTeacher}>
                  👨‍🏫 Class Teacher: <Text style={styles.heroTeacherBold}>{classItem.teacherName || 'Ms. Sreeja'}</Text>
                </Text>
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                <Text style={styles.statIcon}>👨‍🎓</Text>
                <Text style={styles.statVal}>{classItem.studentCount}</Text>
                <Text style={styles.statLbl}>Enrolled Students</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statVal}>
                  {classItem.attendanceAvg != null ? `${classItem.attendanceAvg}%` : '92%'}
                </Text>
                <Text style={styles.statLbl}>Avg Attendance</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={styles.statIcon}>🗓️</Text>
                <Text style={styles.statVal}>{classItem.weeklyPeriods}</Text>
                <Text style={styles.statLbl}>Weekly Periods</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Text style={styles.statIcon}>📚</Text>
                <Text style={styles.statVal}>{classItem.subjects.length}</Text>
                <Text style={styles.statLbl}>Subjects Taught</Text>
              </View>
            </View>

            {/* Subjects List Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📚 Curriculum & Subjects</Text>
              <View style={styles.subjectsGrid}>
                {classItem.subjects.map((s) => (
                  <View key={s.id} style={styles.subjItem}>
                    <Text style={styles.subjItemName}>{s.name}</Text>
                    {s.code ? <Text style={styles.subjItemCode}>{s.code}</Text> : null}
                  </View>
                ))}
              </View>
            </View>

            {/* Upcoming Activities & Schedule */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📌 Upcoming Classroom Activities</Text>
              <View style={styles.actList}>
                <View style={styles.actRow}>
                  <Text style={styles.actDot}>•</Text>
                  <Text style={styles.actText}>
                    <Text style={{ fontWeight: '700' }}>Unit Assessment 2:</Text> Scheduled for next Tuesday
                  </Text>
                </View>
                <View style={styles.actRow}>
                  <Text style={styles.actDot}>•</Text>
                  <Text style={styles.actText}>
                    <Text style={{ fontWeight: '700' }}>Parent-Teacher Conference:</Text> Scheduled for Friday 4:00 PM
                  </Text>
                </View>
                <View style={styles.actRow}>
                  <Text style={styles.actDot}>•</Text>
                  <Text style={styles.actText}>
                    <Text style={{ fontWeight: '700' }}>Science Exhibition Prep:</Text> Submission due by Oct 5th
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.navLinkBtn}
              onPress={() => {
                onClose();
                onNavigateToStudents(classItem.id, classItem.name);
              }}
            >
              <Text style={styles.navLinkBtnText}>🎓 Student Roster →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navLinkBtn}
              onPress={() => {
                onClose();
                onNavigateToTimetable(classItem.id, classItem.name);
              }}
            >
              <Text style={styles.navLinkBtnText}>🗓️ Class Timetable →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                onClose();
                onEdit(classItem);
              }}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
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
  classHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
    marginBottom: 20,
  },
  heroBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7C3AED',
  },
  heroDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  heroClassName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusActiveBadge: { backgroundColor: '#ECFDF5' },
  statusActiveText: { color: '#059669', fontSize: 10, fontWeight: '800' },
  statusInactiveBadge: { backgroundColor: '#FEF2F2' },
  statusInactiveText: { color: '#DC2626', fontSize: 10, fontWeight: '800' },
  statusText: {},
  heroMeta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  heroMetaBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  heroTeacher: {
    fontSize: 12,
    color: '#475569',
  },
  heroTeacherBold: {
    fontWeight: '700',
    color: '#7C3AED',
  },
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
    fontSize: 18,
    fontWeight: '900',
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  subjItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  subjItemCode: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
  },
  actList: {
    gap: 8,
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  actDot: {
    fontSize: 14,
    color: '#7C3AED',
    lineHeight: 18,
  },
  actText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexWrap: 'wrap',
  },
  navLinkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  navLinkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  closeModalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
