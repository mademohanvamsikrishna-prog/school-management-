import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useParentData, TimetableSlot } from '../../context/ParentDataContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

const TIME_SLOTS = [
  '8:30–9:20',
  '9:20–10:10',
  '10:10–10:30',
  '10:30–11:20',
  '11:20–12:10',
  '12:10–1:00',
  '1:00–1:50',
  '1:50–2:40',
];

export default function TimetableScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 640 && width < 900;

  const {
    selectedChildKey,
    setSelectedChildKey,
    selectedChild,
    childrenProfiles,
    timetable,
    activeWeekOffset,
    setActiveWeekOffset,
  } = useParentData();

  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  const getWeekLabel = (offset: number) => {
    if (offset === 0) return 'This Week (21–25 Sep 2026)';
    if (offset === -1) return 'Previous Week (14–18 Sep 2026)';
    if (offset === 1) return 'Next Week (28 Sep – 02 Oct 2026)';
    return offset < 0 ? `${Math.abs(offset)} Weeks Ago` : `In ${offset} Weeks`;
  };

  const getSlot = (day: string, time: string): TimetableSlot | undefined => {
    return timetable.find((s) => s.day === day && s.time === time);
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
              <Text style={styles.pageTitle}>Class Timetable</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              {selectedChild.name} · {selectedChild.className} · Academic Year 2026–2027
            </Text>
          </View>

          {/* Child Switcher Pills */}
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

        {/* ─── Week Selector Bar ───────────────────────────────────────────── */}
        <View style={styles.weekBar}>
          <TouchableOpacity
            style={styles.weekBtn}
            onPress={() => setActiveWeekOffset(activeWeekOffset - 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.weekBtnText}>← Previous Week</Text>
          </TouchableOpacity>

          <View style={styles.weekCenter}>
            <Text style={styles.weekLabel}>{getWeekLabel(activeWeekOffset)}</Text>
            {activeWeekOffset !== 0 && (
              <TouchableOpacity onPress={() => setActiveWeekOffset(0)} style={styles.todayPill}>
                <Text style={styles.todayText}>Jump to Current Week</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.weekBtn}
            onPress={() => setActiveWeekOffset(activeWeekOffset + 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.weekBtnText}>Next Week →</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Timetable Grid ──────────────────────────────────────────────── */}
        <View style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.horizontalScroll}>
            <View style={styles.table}>
              {/* Header Row */}
              <View style={styles.tableRowHeader}>
                <View style={[styles.thCell, styles.timeCol]}>
                  <Text style={styles.thText}>Time</Text>
                </View>
                {DAYS.map((day) => (
                  <View key={day} style={[styles.thCell, styles.dayCol]}>
                    <Text style={styles.thText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Data Rows */}
              {TIME_SLOTS.map((time, rowIdx) => {
                const isBreakRow = time === '10:10–10:30';
                const isLunchRow = time === '12:10–1:00';

                if (isBreakRow || isLunchRow) {
                  return (
                    <View key={time} style={[styles.tableRow, styles.breakRow]}>
                      <View style={[styles.tdCell, styles.timeCol, styles.breakTimeCell]}>
                        <Text style={styles.breakTimeText}>{time}</Text>
                      </View>
                      <View style={[styles.tdCell, styles.breakSpanCell]}>
                        <Text style={styles.breakSpanText}>
                          {isBreakRow ? '☕ Morning Break (20 mins)' : '🍱 Lunch Break (50 mins)'}
                        </Text>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={time} style={[styles.tableRow, rowIdx % 2 === 1 && styles.tableRowAlt]}>
                    {/* Time Column */}
                    <View style={[styles.tdCell, styles.timeCol]}>
                      <Text style={styles.timeText}>{time}</Text>
                      <Text style={styles.periodText}>
                        Period {rowIdx === 0 ? 1 : rowIdx === 1 ? 2 : rowIdx === 3 ? 3 : rowIdx === 4 ? 4 : rowIdx === 6 ? 5 : 6}
                      </Text>
                    </View>

                    {/* Day Columns */}
                    {DAYS.map((day) => {
                      const slot = getSlot(day, time);
                      if (!slot) {
                        return (
                          <View key={day} style={[styles.tdCell, styles.dayCol, styles.emptyCell]}>
                            <Text style={styles.emptyText}>—</Text>
                          </View>
                        );
                      }

                      return (
                        <TouchableOpacity
                          key={day}
                          style={[styles.tdCell, styles.dayCol, styles.slotCell]}
                          onPress={() => setSelectedSlot(slot)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.subjectBadge, { backgroundColor: slot.badgeBg || '#EFF6FF' }]}>
                            <Text style={[styles.subjectName, { color: slot.color || '#2563EB' }]} numberOfLines={1}>
                              {slot.subject}
                            </Text>
                          </View>
                          <Text style={styles.teacherText} numberOfLines={1}>
                            {slot.teacher}
                          </Text>
                          <View style={styles.roomRow}>
                            <Text style={styles.roomText}>{slot.room}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ─── Detail Modal ────────────────────────────────────────────────── */}
        <Modal
          visible={!!selectedSlot}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedSlot(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalBadge, { backgroundColor: selectedSlot?.badgeBg || '#EFF6FF' }]}>
                  <Text style={[styles.modalBadgeText, { color: selectedSlot?.color || '#2563EB' }]}>
                    {selectedSlot?.subject}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedSlot(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubjectTitle}>{selectedSlot?.subject}</Text>
              <Text style={styles.modalClassSubtitle}>
                {selectedChild.name} · {selectedChild.className}
              </Text>

              <View style={styles.modalDivider} />

              <View style={styles.modalInfoGrid}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.infoLabel}>Teacher:</Text>
                  <Text style={styles.infoValue}>{selectedSlot?.teacher}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.infoLabel}>Room:</Text>
                  <Text style={styles.infoValue}>{selectedSlot?.room}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.infoLabel}>Day & Time:</Text>
                  <Text style={styles.infoValue}>
                    {selectedSlot?.day} · {selectedSlot?.time}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.infoLabel}>Class:</Text>
                  <Text style={styles.infoValue}>{selectedChild.className}</Text>
                </View>
                {selectedSlot?.topics && (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.infoLabel}>Current Topic:</Text>
                    <Text style={[styles.infoValue, { color: '#0F172A', fontWeight: '600' }]}>
                      {selectedSlot.topics}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setSelectedSlot(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalPrimaryBtnText}>Close</Text>
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
  weekBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  weekBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  weekBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  weekCenter: {
    alignItems: 'center',
    gap: 2,
  },
  weekLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  todayPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#EEF2FF',
  },
  todayText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '700',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  horizontalScroll: {
    minWidth: '100%',
  },
  table: {
    minWidth: 860,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  thText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeCol: {
    width: 110,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  dayCol: {
    flex: 1,
    minWidth: 150,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 74,
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tdCell: {
    padding: 10,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  periodText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  slotCell: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    padding: 8,
  },
  emptyCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  teacherText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  roomRow: {
    marginTop: 2,
  },
  roomText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  breakRow: {
    backgroundColor: '#F8FAFC',
    minHeight: 40,
  },
  breakTimeCell: {
    justifyContent: 'center',
  },
  breakTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  breakSpanCell: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  breakSpanText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
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
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
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
    marginBottom: 12,
  },
  modalBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '800',
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
  modalSubjectTitle: {
    fontSize: 20,
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
  modalInfoGrid: {
    gap: 10,
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalPrimaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
