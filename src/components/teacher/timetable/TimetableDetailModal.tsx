import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TimetableEntryItem, DAYS_DEF } from './TimetableGrid';

interface TimetableDetailModalProps {
  visible: boolean;
  onClose: () => void;
  entry: TimetableEntryItem | null;
  academicYear: string;
  onOpenEdit?: () => void;
  canEdit?: boolean;
}

export const TimetableDetailModal: React.FC<TimetableDetailModalProps> = ({
  visible,
  onClose,
  entry,
  academicYear,
  onOpenEdit,
  canEdit = true,
}) => {
  const router = useRouter();

  if (!entry) return null;

  const dayObj = DAYS_DEF.find((d) => d.dayNum === entry.day_of_week);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>{entry.subject_name}</Text>
              <Text style={styles.modalSub}>
                {entry.class_name} • {dayObj?.fullName || 'Day'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Details Body */}
          <View style={styles.body}>
            <View style={styles.gridDetails}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Class & Section</Text>
                <Text style={styles.detailVal}>{entry.class_name}</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Room Number</Text>
                <Text style={styles.detailVal}>Room {entry.room_number || '101'}</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Time Slot</Text>
                <Text style={styles.detailVal}>
                  {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Academic Year</Text>
                <Text style={styles.detailVal}>{academicYear}</Text>
              </View>
            </View>
          </View>

          {/* Actions Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionNavBtn}
              onPress={() => {
                onClose();
                router.push('/teacher/classes' as any);
              }}
            >
              <Text style={styles.actionNavText}>👥 View Class</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionNavBtn}
              onPress={() => {
                onClose();
                router.push('/teacher/students' as any);
              }}
            >
              <Text style={styles.actionNavText}>🎓 View Students</Text>
            </TouchableOpacity>

            {canEdit && onOpenEdit && (
              <TouchableOpacity
                style={styles.actionEditBtn}
                onPress={() => {
                  onClose();
                  onOpenEdit();
                }}
              >
                <Text style={styles.actionEditText}>✏️ Edit</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterText}>Close</Text>
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
    maxWidth: 540,
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
  gridDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailBox: {
    width: '46%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
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
  actionNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  actionEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  closeFooterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  closeFooterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
});
