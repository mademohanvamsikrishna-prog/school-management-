import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LeaveRequestRecord } from './LeaveRequestsTable';
import { LeaveNotificationItem } from './RecentNotificationsCard';

// ---------------------------------------------------------------------------
// 1. View Leave Details Modal
// ---------------------------------------------------------------------------
interface ViewLeaveModalProps {
  visible: boolean;
  item: LeaveRequestRecord | null;
  onClose: () => void;
}

export const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({ visible, item, onClose }) => {
  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.modalIconWrap}>
                <Text style={{ fontSize: 20 }}>📄</Text>
              </View>
              <View>
                <Text style={styles.modalTitle}>Leave Application Details</Text>
                <Text style={styles.modalSubtitle}>Application ID: #{item.id.slice(0, 8)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Body */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
            {/* Status Banner */}
            <View style={styles.statusBanner}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <View style={styles.statusBadgeWrap}>
                <Text style={styles.statusBadgeText}>{item.status}</Text>
              </View>
            </View>

            {/* Grid Info */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Leave Type</Text>
                <Text style={styles.infoValue}>{item.leaveType}</Text>
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Applied On</Text>
                <Text style={styles.infoValue}>{item.appliedOn}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>From Date</Text>
                <Text style={styles.infoValue}>{item.fromDate}</Text>
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>To Date</Text>
                <Text style={styles.infoValue}>{item.toDate}</Text>
              </View>
            </View>

            {/* Reason Box */}
            <View style={styles.sectionBox}>
              <Text style={styles.infoLabel}>Reason for Leave</Text>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>

            {/* Supporting Document */}
            {item.documentName && (
              <View style={styles.docBox}>
                <View style={styles.docIcon}>
                  <Text style={{ fontSize: 18 }}>📎</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{item.documentName}</Text>
                  {item.documentSize && <Text style={styles.docSize}>{item.documentSize}</Text>}
                </View>
                <View style={styles.attachedPill}>
                  <Text style={styles.attachedPillText}>Attached</Text>
                </View>
              </View>
            )}

            {/* Approval or Rejection Info */}
            {item.approvedBy && (
              <View style={styles.sectionBox}>
                <Text style={styles.infoLabel}>Approved By</Text>
                <Text style={styles.infoValue}>{item.approvedBy}</Text>
              </View>
            )}

            {item.rejectionReason && (
              <View style={[styles.sectionBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Text style={[styles.infoLabel, { color: '#B91C1C' }]}>Rejection Reason</Text>
                <Text style={[styles.reasonText, { color: '#991B1B' }]}>{item.rejectionReason}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.primaryModalBtn} onPress={onClose}>
              <Text style={styles.primaryModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// 2. Edit Leave Request Modal
// ---------------------------------------------------------------------------
interface EditLeaveModalProps {
  visible: boolean;
  item: LeaveRequestRecord | null;
  onClose: () => void;
  onSave: (updated: Partial<LeaveRequestRecord>) => void;
}

export const EditLeaveModal: React.FC<EditLeaveModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
}) => {
  const [leaveType, setLeaveType] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (item) {
      setLeaveType(item.leaveType || '');
      setFromDate(item.fromDate || '');
      setToDate(item.toDate || '');
      setReason(item.reason || '');
      setError('');
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    if (!fromDate || !toDate || !reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setError('To Date cannot be before From Date.');
      return;
    }
    onSave({
      id: item.id,
      leaveType,
      fromDate,
      toDate,
      reason: reason.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.modalIconWrap, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </View>
              <View>
                <Text style={styles.modalTitle}>Edit Leave Request</Text>
                <Text style={styles.modalSubtitle}>Update your pending application</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Form */}
          <ScrollView style={styles.modalBody}>
            {error ? <Text style={styles.modalError}>{error}</Text> : null}

            <View style={styles.formField}>
              <Text style={styles.inputLabel}>Leave Type</Text>
              <TextInput
                style={styles.textInput}
                value={leaveType}
                onChangeText={setLeaveType}
              />
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={styles.inputLabel}>From Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={fromDate}
                  onChangeText={setFromDate}
                />
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.inputLabel}>To Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={toDate}
                  onChangeText={setToDate}
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.inputLabel}>Reason for Leave</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={3}
                maxLength={200}
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooterActions}>
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

// ---------------------------------------------------------------------------
// 3. Cancel Confirmation Modal
// ---------------------------------------------------------------------------
interface CancelLeaveModalProps {
  visible: boolean;
  item: LeaveRequestRecord | null;
  onClose: () => void;
  onConfirm: (item: LeaveRequestRecord) => void;
}

export const CancelLeaveModal: React.FC<CancelLeaveModalProps> = ({
  visible,
  item,
  onClose,
  onConfirm,
}) => {
  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { maxWidth: 420 }]}>
          <View style={{ alignItems: 'center', paddingVertical: 10, gap: 10 }}>
            <View style={styles.dangerIconWrap}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
            </View>
            <Text style={styles.confirmTitle}>Cancel Leave Request?</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to cancel your <Text style={{ fontWeight: '700' }}>{item.leaveType}</Text> request ({item.fromDate} to {item.toDate})? This action cannot be undone.
            </Text>
          </View>

          <View style={styles.modalFooterActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Keep Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => {
                onConfirm(item);
                onClose();
              }}
            >
              <Text style={styles.saveBtnText}>Yes, Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// 4. View All Notifications Modal
// ---------------------------------------------------------------------------
interface AllNotificationsModalProps {
  visible: boolean;
  notifications: LeaveNotificationItem[];
  onClose: () => void;
}

export const AllNotificationsModal: React.FC<AllNotificationsModalProps> = ({
  visible,
  notifications,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { maxHeight: 520 }]}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.modalIconWrap}>
                <Text style={{ fontSize: 20 }}>🔔</Text>
              </View>
              <View>
                <Text style={styles.modalTitle}>All Notifications</Text>
                <Text style={styles.modalSubtitle}>Full history of leave approval updates</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView style={styles.modalBody}>
            <View style={{ gap: 10 }}>
              {notifications.map((item) => (
                <View key={item.id} style={styles.notifHistoryItem}>
                  <Text style={{ fontSize: 18 }}>
                    {item.type === 'approved' ? '✅' : item.type === 'rejected' ? '❌' : '⏳'}
                  </Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.notifHistoryTitle}>{item.title}</Text>
                    <Text style={styles.notifHistorySub}>{item.subtitle}</Text>
                    <Text style={styles.notifHistoryTime}>{item.timeAgo}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.primaryModalBtn} onPress={onClose}>
              <Text style={styles.primaryModalBtnText}>Close</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  modalBody: {
    gap: 14,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  statusBadgeWrap: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#03543F',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  docBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 10,
    marginBottom: 12,
  },
  docIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  docSize: {
    fontSize: 11,
    color: '#60A5FA',
  },
  attachedPill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attachedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  modalFooter: {
    marginTop: 18,
  },
  primaryModalBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  formField: {
    gap: 6,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  modalError: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
    marginBottom: 10,
  },
  modalFooterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dangerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  confirmText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  notifHistoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  notifHistoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  notifHistorySub: {
    fontSize: 12,
    color: '#475569',
  },
  notifHistoryTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
