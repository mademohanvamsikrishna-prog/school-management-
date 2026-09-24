import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useParentData, HomeworkItem } from '../../context/ParentDataContext';

type FilterType = 'All' | 'Pending' | 'Completed' | 'Overdue';

export default function HomeworkScreen() {
  const router = useRouter();
  const {
    selectedChildKey,
    setSelectedChildKey,
    selectedChild,
    childrenProfiles,
    homework,
    submitHomeworkItem,
  } = useParentData();

  const [filter, setFilter] = useState<FilterType>('All');
  const [selectedHomework, setSelectedHomework] = useState<HomeworkItem | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  const filterCounts = useMemo(() => {
    return {
      All: homework.length,
      Pending: homework.filter((h) => h.status === 'Pending').length,
      Completed: homework.filter((h) => h.status === 'Completed').length,
      Overdue: homework.filter((h) => h.status === 'Overdue').length,
    };
  }, [homework]);

  const filteredList = useMemo(() => {
    if (filter === 'All') return homework;
    return homework.filter((h) => h.status === filter);
  }, [homework, filter]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
      case 'Overdue':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
      default:
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
    }
  };

  const handleOpenDetail = (item: HomeworkItem) => {
    setSelectedHomework(item);
    setSubmissionNotes('');
    setSubmissionSuccess(null);
  };

  const handleSubmit = (id: string) => {
    submitHomeworkItem(id, submissionNotes);
    setSubmissionSuccess('Homework submitted successfully!');
    setTimeout(() => {
      setSelectedHomework((prev) => (prev && prev.id === id ? { ...prev, status: 'Completed' } : prev));
      setSubmissionSuccess(null);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Top Header & Child Switcher ─────────────────────────────────── */}
        <View style={styles.topHeader}>
          <View>
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => router.push('/parents/dashboard' as any)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Homework & Assignments</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              {selectedChild.name} · {selectedChild.className}
            </Text>
          </View>

          {/* Child Switcher */}
          <View style={styles.childSwitcher}>
            {childrenProfiles.map((child) => {
              const active = child.key === selectedChildKey;
              return (
                <TouchableOpacity
                  key={child.key}
                  style={[styles.childBtn, active && styles.childBtnActive]}
                  onPress={() => setSelectedChildKey(child.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.childDot, { backgroundColor: child.avatarBg }]} />
                  <Text style={[styles.childBtnText, active && styles.childBtnTextActive]}>
                    {child.name} ({child.className.replace('Class ', '')})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Filter Tabs ─────────────────────────────────────────────────── */}
        <View style={styles.filterRow}>
          {(['All', 'Pending', 'Completed', 'Overdue'] as FilterType[]).map((tab) => {
            const active = filter === tab;
            const count = filterCounts[tab];
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, active && styles.filterTabActive]}
                onPress={() => setFilter(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {tab}
                </Text>
                <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Homework Cards List ─────────────────────────────────────────── */}
        {filteredList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📝</Text>
            <Text style={styles.emptyTitle}>No assignments in this filter</Text>
            <Text style={styles.emptySubtitle}>All caught up! Check other categories or switch student profile.</Text>
          </View>
        ) : (
          <View style={styles.hwGrid}>
            {filteredList.map((item) => {
              const st = getStatusStyle(item.status);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.hwCard}
                  onPress={() => handleOpenDetail(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.hwCardTop}>
                    <View style={[styles.subjectPill, { backgroundColor: '#EFF6FF' }]}>
                      <Text style={[styles.subjectPillText, { color: item.color || '#2563EB' }]}>
                        {item.subject}
                      </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
                      <Text style={[styles.statusPillText, { color: st.text }]}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.hwTitle}>{item.title}</Text>
                  <Text style={styles.hwDesc} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.hwDivider} />

                  <View style={styles.hwCardBottom}>
                    <View>
                      <Text style={styles.hwMetaLabel}>Teacher</Text>
                      <Text style={styles.hwMetaVal}>{item.teacher}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.hwMetaLabel}>Due Date</Text>
                      <Text style={[styles.hwMetaVal, item.status === 'Overdue' && { color: '#DC2626', fontWeight: '800' }]}>
                        {item.dueDate}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ─── Homework Detail Modal ───────────────────────────────────────── */}
        <Modal
          visible={!!selectedHomework}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedHomework(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                {selectedHomework && (
                  <View style={[styles.subjectPill, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.subjectPillText, { color: selectedHomework.color || '#2563EB' }]}>
                      {selectedHomework.subject}
                    </Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setSelectedHomework(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{selectedHomework?.title}</Text>
              <Text style={styles.modalClassSubtitle}>
                {selectedChild.name} · {selectedChild.className}
              </Text>

              <View style={styles.modalDivider} />

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalMetaGrid}>
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.metaKey}>Assigned Date:</Text>
                    <Text style={styles.metaVal}>{selectedHomework?.assignedDate}</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.metaKey}>Due Date:</Text>
                    <Text style={[styles.metaVal, selectedHomework?.status === 'Overdue' && { color: '#DC2626' }]}>
                      {selectedHomework?.dueDate}
                    </Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.metaKey}>Teacher:</Text>
                    <Text style={styles.metaVal}>{selectedHomework?.teacher}</Text>
                  </View>
                  <View style={styles.modalMetaItem}>
                    <Text style={styles.metaKey}>Status:</Text>
                    <Text style={[styles.metaVal, { fontWeight: '800' }]}>{selectedHomework?.status}</Text>
                  </View>
                </View>

                <Text style={styles.sectionHeading}>Assignment Description</Text>
                <Text style={styles.modalDescription}>{selectedHomework?.description}</Text>

                {selectedHomework?.attachment && (
                  <View style={styles.attachmentBox}>
                    <Text style={{ fontSize: 16 }}>📎</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attachmentLabel}>Reference Material</Text>
                      <Text style={styles.attachmentFilename}>{selectedHomework.attachment}</Text>
                    </View>
                  </View>
                )}

                {selectedHomework?.submissionInfo && (
                  <View style={styles.submissionInfoBox}>
                    <Text style={styles.submissionInfoLabel}>Submission Status & Notes:</Text>
                    <Text style={styles.submissionInfoText}>{selectedHomework.submissionInfo}</Text>
                  </View>
                )}

                {/* Submit homework action if pending or overdue */}
                {selectedHomework && selectedHomework.status !== 'Completed' && (
                  <View style={styles.submitSection}>
                    <Text style={styles.sectionHeading}>Submit or Add Remarks</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Add submission note (e.g. Done in notebook / Chapter exercise solved)..."
                      placeholderTextColor="#94A3B8"
                      value={submissionNotes}
                      onChangeText={setSubmissionNotes}
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={() => handleSubmit(selectedHomework.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.submitBtnText}>✓ Mark as Completed / Submit</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {submissionSuccess && (
                  <View style={styles.successToast}>
                    <Text style={styles.successToastText}>✓ {submissionSuccess}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedHomework(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  childSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  childBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  childBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  childDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  childBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  childBtnTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  hwGrid: {
    gap: 14,
  },
  hwCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  hwCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  subjectPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  hwTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  hwDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  hwDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  hwCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hwMetaLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  hwMetaVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  modalClassSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  modalScrollBody: {
    maxHeight: 340,
  },
  modalMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalMetaItem: {
    width: '45%',
  },
  metaKey: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metaVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalDescription: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  attachmentLabel: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  attachmentFilename: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  submissionInfoBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  submissionInfoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  submissionInfoText: {
    fontSize: 12.5,
    color: '#334155',
  },
  submitSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 60,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  successToast: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    alignItems: 'center',
  },
  successToastText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  modalCloseBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
});
