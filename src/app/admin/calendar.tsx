/**
 * AdminCalendarScreen — Dedicated Academic Calendar Management
 * Route: /admin/calendar
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';

const P = {
  bg: '#F7FAFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  green: '#10B981',
  red: '#EF4444',
  amber: '#F59E0B',
  purple: '#8B5CF6',
};

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'exam' | 'meeting' | 'activity';
  color: string;
  desc: string;
}

export default function AdminCalendarScreen() {
  const [addModal, setAddModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-02');
  const [eventType, setEventType] = useState<'holiday' | 'exam' | 'meeting' | 'activity'>('holiday');

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Term 1 Parent-Teacher Meeting (PTM)', date: '28 Sep 2026', type: 'meeting', color: '#2563EB', desc: '10:00 AM – 12:00 PM in School Main Auditorium' },
    { id: '2', title: 'Gandhi Jayanti Holiday', date: '02 Oct 2026', type: 'holiday', color: '#EF4444', desc: 'National Holiday · School closed' },
    { id: '3', title: 'Fee Payment Due Date (Term 2)', date: '15 Oct 2026', type: 'activity', color: '#F59E0B', desc: 'Final date for term 2 fee settlement' },
    { id: '4', title: 'Science Exhibition & STEM Fair', date: '22 Oct 2026', type: 'activity', color: '#8B5CF6', desc: 'Annual science project showcase in Block B' },
    { id: '5', title: 'Half-Yearly Term Exams Commence', date: '05 Nov 2026', type: 'exam', color: '#10B981', desc: 'Written exams for Classes 6 through 12' },
  ]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthDays = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, null, null, null,
  ];

  const handleAddEvent = () => {
    if (!eventTitle.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: eventTitle,
        date: eventDate,
        type: eventType,
        color: eventType === 'holiday' ? P.red : eventType === 'exam' ? P.green : P.primary,
        desc: 'Academic calendar event',
      },
    ]);
    setEventTitle('');
    setAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.breadcrumb}>ACADEMIC MANAGEMENT / CALENDAR</Text>
              <Text style={styles.pageTitle}>Academic Calendar & Events</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>+ Add Event / Holiday</Text>
            </TouchableOpacity>
          </View>

          {/* 2-Column Layout */}
          <View style={styles.mainGrid}>
            {/* Left Column: Full Month Grid Card */}
            <View style={styles.calCard}>
              <View style={styles.calNav}>
                <Text style={styles.calArrow}>‹</Text>
                <Text style={styles.calMonth}>September 2026</Text>
                <Text style={styles.calArrow}>›</Text>
              </View>

              <View style={styles.weekHeader}>
                {daysOfWeek.map((d) => (
                  <Text key={d} style={styles.weekLabel}>{d}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {monthDays.map((d, idx) => {
                  if (d === null) return <View key={idx} style={styles.dayCell} />;
                  const isToday = d === 24;
                  const isEvent = d === 15 || d === 28;
                  return (
                    <View key={d} style={styles.dayCell}>
                      <View style={[styles.dayCircle, isToday && styles.dayToday, isEvent && styles.dayEvent]}>
                        <Text style={[styles.dayNum, isToday && styles.dayNumToday, isEvent && styles.dayNumEvent]}>
                          {d}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Right Column: Key Upcoming Events List */}
            <View style={styles.eventsCard}>
              <Text style={styles.eventsCardHeading}>Upcoming Academic Schedule</Text>
              <View style={styles.eventsList}>
                {events.map((ev) => (
                  <View key={ev.id} style={styles.eventItem}>
                    <View style={[styles.eventColorBar, { backgroundColor: ev.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{ev.title}</Text>
                      <Text style={styles.eventMeta}>📅 {ev.date} · {ev.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      {addModal && (
        <Modal transparent animationType="fade" visible={addModal} onRequestClose={() => setAddModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Schedule Calendar Event</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Event Title</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Sports Day Meet" value={eventTitle} onChangeText={setEventTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Event Date</Text>
                <TextInput style={styles.modalInput} value={eventDate} onChangeText={setEventDate} />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddEvent}>
                  <Text style={styles.saveBtnText}>Save Event</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: P.bg },
  scroll: { flex: 1 },
  container: { padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  breadcrumb: { fontSize: 11, fontWeight: '700', color: P.textMuted, letterSpacing: 0.5 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: P.text, letterSpacing: -0.3 },
  addBtn: { backgroundColor: P.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  mainGrid: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  calCard: { flex: 1.2, minWidth: 320, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: P.border },
  calNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calArrow: { fontSize: 20, fontWeight: '800', color: P.textSec },
  calMonth: { fontSize: 16, fontWeight: '800', color: P.text },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  weekLabel: { width: 36, textAlign: 'center', fontSize: 11, fontWeight: '700', color: P.textMuted },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 6 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayToday: { backgroundColor: P.primary },
  dayEvent: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#93C5FD' },
  dayNum: { fontSize: 13, fontWeight: '600', color: P.text },
  dayNumToday: { color: '#FFFFFF', fontWeight: '800' },
  dayNumEvent: { color: P.primary, fontWeight: '800' },
  eventsCard: { flex: 1, minWidth: 300, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: P.border },
  eventsCardHeading: { fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 16 },
  eventsList: { gap: 12 },
  eventItem: { flexDirection: 'row', gap: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  eventColorBar: { width: 4, borderRadius: 2 },
  eventTitle: { fontSize: 13, fontWeight: '700', color: P.text, marginBottom: 2 },
  eventMeta: { fontSize: 11, color: P.textSec },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 24, width: '100%', maxWidth: 440 },
  modalHeading: { fontSize: 18, fontWeight: '800', color: P.text, marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: P.textSec, marginBottom: 4 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: P.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: P.border },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: P.textSec },
  saveBtn: { backgroundColor: P.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
