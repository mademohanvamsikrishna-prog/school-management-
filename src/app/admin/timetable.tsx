/**
 * AdminTimetableScreen — Dedicated Timetable Management
 * Route: /admin/timetable
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { listClasses, listSubjects, listUsers, AdminClass, AdminSubject, AdminUser } from '../../services/admin';

const IS_WEB = Platform.OS === 'web';

const P = {
  bg: '#F7FAFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  green: '#10B981',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  red: '#EF4444',
};

interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  class: string;
}

export default function AdminTimetableScreen() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('Class 7-B');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [addModal, setAddModal] = useState(false);
  const [time, setTime] = useState('09:00 AM – 10:00 AM');
  const [subject, setSubject] = useState('Mathematics');
  const [teacher, setTeacher] = useState('Dr. Priya Desai');
  const [room, setRoom] = useState('Room 204');

  const [slots, setSlots] = useState<TimetableSlot[]>([
    { id: '1', day: 'Monday', time: '08:30 AM – 09:30 AM', subject: 'Mathematics', teacher: 'Dr. Priya Desai', room: 'Room 204', class: 'Class 7-B' },
    { id: '2', day: 'Monday', time: '09:35 AM – 10:35 AM', subject: 'Physics & Chem', teacher: 'Mr. Rajesh Verma', room: 'Science Lab 2', class: 'Class 7-B' },
    { id: '3', day: 'Monday', time: '11:00 AM – 12:00 PM', subject: 'English Literature', teacher: 'Mrs. Sunita Rao', room: 'Room 204', class: 'Class 7-B' },
    { id: '4', day: 'Monday', time: '12:05 PM – 01:05 PM', subject: 'Social Studies', teacher: 'Mr. Arvind Joshi', room: 'Room 204', class: 'Class 7-B' },
    { id: '5', day: 'Monday', time: '02:00 PM – 03:00 PM', subject: 'Computer Science', teacher: 'Ms. Anita Nair', room: 'Computer Lab 1', class: 'Class 7-B' },
    
    { id: '6', day: 'Tuesday', time: '08:30 AM – 09:30 AM', subject: 'Hindi / Telugu', teacher: 'Mrs. Lakshmi Rao', room: 'Room 204', class: 'Class 7-B' },
    { id: '7', day: 'Tuesday', time: '09:35 AM – 10:35 AM', subject: 'Mathematics', teacher: 'Dr. Priya Desai', room: 'Room 204', class: 'Class 7-B' },
    { id: '8', day: 'Tuesday', time: '11:00 AM – 12:00 PM', subject: 'Biology', teacher: 'Dr. Kavita Bose', room: 'Bio Lab', class: 'Class 7-B' },
    { id: '9', day: 'Tuesday', time: '12:05 PM – 01:05 PM', subject: 'English Grammar', teacher: 'Mrs. Sunita Rao', room: 'Room 204', class: 'Class 7-B' },
    { id: '10', day: 'Tuesday', time: '02:00 PM – 03:00 PM', subject: 'Physical Education', teacher: 'Coach Vikram Singh', room: 'Sports Ground', class: 'Class 7-B' },
  ]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    listClasses().then((cls) => {
      setClasses(cls);
      if (cls.length > 0) setSelectedClass(cls[0].name);
    }).catch(() => {});
  }, []);

  const handleAddSlot = () => {
    if (!subject || !teacher) return;
    const newSlot: TimetableSlot = {
      id: String(Date.now()),
      day: selectedDay,
      time,
      subject,
      teacher,
      room,
      class: selectedClass,
    };
    setSlots((prev) => [...prev, newSlot]);
    setAddModal(false);
  };

  const currentSlots = slots.filter((s) => s.day === selectedDay);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.breadcrumb}>ACADEMIC MANAGEMENT / TIMETABLE</Text>
            <Text style={styles.pageTitle}>Master Timetable & Schedules</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add Time Slot</Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector Tabs */}
        <View style={styles.dayTabsRow}>
          {days.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayTab, selectedDay === d && styles.dayTabActive]}
              onPress={() => setSelectedDay(d)}
            >
              <Text style={[styles.dayTabText, selectedDay === d && styles.dayTabTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timetable Matrix Card */}
        <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 180 }]}>TIME PERIOD</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>SUBJECT</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>INSTRUCTOR</Text>
              <Text style={[styles.th, { width: 140 }]}>ROOM / LAB</Text>
              <Text style={[styles.th, { width: 100, textAlign: 'right' }]}>ACTION</Text>
            </View>

            {currentSlots.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No classes scheduled for {selectedDay}.</Text>
              </View>
            ) : (
              currentSlots.map((slot) => (
                <View key={slot.id} style={styles.tableRow}>
                  <Text style={[styles.td, { width: 180, fontWeight: '700', color: P.primary }]}>{slot.time}</Text>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.subjectName}>{slot.subject}</Text>
                    <Text style={styles.classBadgeText}>{slot.class}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1.5, color: P.textSec }]}>{slot.teacher}</Text>
                  <Text style={[styles.td, { width: 140, color: P.textMuted }]}>{slot.room}</Text>
                  <View style={{ width: 100, alignItems: 'flex-end' }}>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => setSlots((prev) => prev.filter((s) => s.id !== slot.id))}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Slot Modal */}
      {addModal && (
        <Modal transparent animationType="fade" visible={addModal} onRequestClose={() => setAddModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalHeading}>Schedule New Class Period</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Day of Week</Text>
                <Text style={[styles.modalInput, { color: P.primary, fontWeight: '700' }]}>{selectedDay}</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time Range</Text>
                <TextInput style={styles.modalInput} value={time} onChangeText={setTime} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject Name</Text>
                <TextInput style={styles.modalInput} value={subject} onChangeText={setSubject} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assigned Faculty Instructor</Text>
                <TextInput style={styles.modalInput} value={teacher} onChangeText={setTeacher} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Classroom / Lab</Text>
                <TextInput style={styles.modalInput} value={room} onChangeText={setRoom} />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddSlot}>
                  <Text style={styles.saveBtnText}>Save Schedule</Text>
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
  container: { padding: 24, flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  breadcrumb: { fontSize: 11, fontWeight: '700', color: P.textMuted, letterSpacing: 0.5 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: P.text, letterSpacing: -0.3 },
  addBtn: { backgroundColor: P.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  dayTabsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  dayTab: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: P.border },
  dayTabActive: { backgroundColor: P.primary, borderColor: P.primary },
  dayTabText: { fontSize: 13, fontWeight: '600', color: P.textSec },
  dayTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  tableScroll: { flex: 1 },
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: P.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.border },
  th: { fontSize: 11, fontWeight: '700', color: P.textMuted, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  td: { fontSize: 13, color: P.text },
  subjectName: { fontSize: 13, fontWeight: '700', color: P.text },
  classBadgeText: { fontSize: 10.5, color: P.textMuted },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FCA5A5' },
  deleteBtnText: { fontSize: 11, fontWeight: '700', color: P.red },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: P.textMuted, fontSize: 13 },
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
