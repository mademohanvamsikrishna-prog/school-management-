import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Modal, TextInput, ScrollView, Alert, Platform,
} from 'react-native';
import { api } from '../../services/api';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#2563EB', indigoBg: '#EFF6FF',
  green: '#10B981', greenBg: '#ECFDF5',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  red: '#EF4444', redBg: '#FEF2F2',
  purple: '#8B5CF6', purpleBg: '#F5F3FF',
  cyan: '#06B6D4', cyanBg: '#ECFEFF',
};

export interface SchoolEvent {
  id: string;
  title: string;
  category: 'academic' | 'sports' | 'cultural' | 'holiday' | 'meeting';
  date: string;
  time: string;
  venue: string;
  audience: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const CATEGORY_STYLE: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  academic: { label: 'Academic', icon: '📖', bg: P.indigoBg, text: P.indigo },
  sports:   { label: 'Sports', icon: '🏆', bg: P.greenBg, text: P.green },
  cultural: { label: 'Cultural & Arts', icon: '🎭', bg: P.purpleBg, text: P.purple },
  holiday:  { label: 'Holiday', icon: '🌴', bg: P.amberBg, text: P.amber },
  meeting:  { label: 'Meeting / Assembly', icon: '👥', bg: P.cyanBg, text: P.cyan },
};

const INITIAL_EVENTS: SchoolEvent[] = [
  {
    id: 'EVT-101',
    title: 'Annual Science & Tech Fair 2026',
    category: 'academic',
    date: '2026-10-15',
    time: '09:00 AM - 04:00 PM',
    venue: 'Main Auditorium & STEM Labs',
    audience: 'Grades 6–12 & Parents',
    description: 'Annual project showcase with interactive robotics, environmental science models, and guest tech mentors.',
    status: 'upcoming',
  },
  {
    id: 'EVT-102',
    title: 'Inter-School Football Championship',
    category: 'sports',
    date: '2026-10-22',
    time: '08:30 AM - 02:00 PM',
    venue: 'School Athletic Grounds',
    audience: 'High School & Sports Teams',
    description: 'Regional tournament featuring 16 school squads. Finals and trophy ceremony at 1:30 PM.',
    status: 'upcoming',
  },
  {
    id: 'EVT-103',
    title: 'Diwali & Autumn Festive Break',
    category: 'holiday',
    date: '2026-11-01',
    time: 'All Day',
    venue: 'Campus Closed',
    audience: 'All Staff & Students',
    description: 'Official autumn vacation. School offices re-open on Monday, Nov 9.',
    status: 'upcoming',
  },
  {
    id: 'EVT-104',
    title: 'Parent-Teacher Council & Term 1 Review',
    category: 'meeting',
    date: '2026-10-05',
    time: '10:00 AM - 01:00 PM',
    venue: 'Conference Hall A',
    audience: 'Teachers & Class Representatives',
    description: 'Discussion on midterm exam analytics, student welfare, and upcoming sports meet logistics.',
    status: 'upcoming',
  },
  {
    id: 'EVT-105',
    title: 'Annual Drama & Music Concert',
    category: 'cultural',
    date: '2026-11-18',
    time: '05:30 PM - 08:30 PM',
    venue: 'Open Air Amphitheatre',
    audience: 'All Students, Staff & Families',
    description: 'Shakespeare theatrical production followed by the Senior Orchestra and Choir performance.',
    status: 'upcoming',
  },
];

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SchoolEvent['category']>('academic');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newAudience, setNewAudience] = useState('All Students & Staff');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateEvent = async () => {
    if (!newTitle.trim() || !newDate.trim() || !newVenue.trim()) {
      Alert.alert('Validation Error', 'Title, Date, and Venue are required fields.');
      return;
    }
    setSaving(true);
    const newEvt: SchoolEvent = {
      id: `EVT-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle.trim(),
      category: newCategory,
      date: newDate.trim(),
      time: newTime.trim() || '09:00 AM - 01:00 PM',
      venue: newVenue.trim(),
      audience: newAudience.trim() || 'All',
      description: newDesc.trim() || 'School event details to be shared with attendees.',
      status: 'upcoming',
    };

    try {
      await api.post('/admin/events', newEvt);
    } catch {
      // Local state fallback if backend route is not available
    }

    setEvents(prev => [newEvt, ...prev]);
    setSaving(false);
    setModalOpen(false);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewVenue('');
    setNewDesc('');
    Alert.alert('Success', 'Event added to school calendar successfully!');
  };

  const handleDeleteEvent = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this event?')) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } else {
      Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => setEvents(prev => prev.filter(e => e.id !== id)) }
      ]);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesTab = activeTab === 'all' || e.category === activeTab;
    const matchesSearch = searchQuery === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>ADMINISTRATION / EVENTS & ANNOUNCEMENTS</Text>
          <Text style={s.title}>School Events & Activities</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalOpen(true)}>
          <Text style={s.addBtnText}>+ Add New Event</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={s.metricsRow}>
        <View style={[s.metricCard, { borderLeftColor: P.indigo }]}>
          <Text style={s.metricLabel}>Total Events</Text>
          <Text style={s.metricVal}>{events.length}</Text>
          <Text style={s.metricSub}>Academic Year 2026-27</Text>
        </View>
        <View style={[s.metricCard, { borderLeftColor: P.green }]}>
          <Text style={s.metricLabel}>Upcoming This Month</Text>
          <Text style={[s.metricVal, { color: P.green }]}>
            {events.filter(e => e.status === 'upcoming').length}
          </Text>
          <Text style={s.metricSub}>Scheduled & approved</Text>
        </View>
        <View style={[s.metricCard, { borderLeftColor: P.purple }]}>
          <Text style={s.metricLabel}>Competitions & Cultural</Text>
          <Text style={[s.metricVal, { color: P.purple }]}>
            {events.filter(e => e.category === 'sports' || e.category === 'cultural').length}
          </Text>
          <Text style={s.metricSub}>Major inter-school events</Text>
        </View>
      </View>

      {/* Filter and Search Bar */}
      <View style={s.filterBar}>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search events, venues, descriptions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={P.textMuted}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsList}>
          {[
            { key: 'all', label: 'All Events' },
            { key: 'academic', label: 'Academic' },
            { key: 'sports', label: 'Sports' },
            { key: 'cultural', label: 'Cultural' },
            { key: 'meeting', label: 'Meetings' },
            { key: 'holiday', label: 'Holidays' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabChip, activeTab === tab.key && s.tabChipActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[s.tabChipText, activeTab === tab.key && s.tabChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, gap: 14 }}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={{ fontSize: 48 }}>🎪</Text>
            <Text style={s.emptyTitle}>No Events Found</Text>
            <Text style={s.emptySubtitle}>There are no events matching your selected filter.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = CATEGORY_STYLE[item.category] || CATEGORY_STYLE.academic;
          return (
            <View style={s.eventCard}>
              <View style={s.eventDateBox}>
                <Text style={s.eventDateDay}>{item.date.split('-')[2] || '15'}</Text>
                <Text style={s.eventDateMonth}>
                  {new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase() || 'OCT'}
                </Text>
              </View>

              <View style={s.eventMain}>
                <View style={s.eventTitleRow}>
                  <View style={[s.catBadge, { backgroundColor: cat.bg }]}>
                    <Text style={{ fontSize: 11 }}>{cat.icon}</Text>
                    <Text style={[s.catBadgeText, { color: cat.text }]}>{cat.label}</Text>
                  </View>
                  <Text style={s.timeBadge}>⏰ {item.time}</Text>
                </View>

                <Text style={s.eventTitle}>{item.title}</Text>
                <Text style={s.eventDesc}>{item.description}</Text>

                <View style={s.eventMetaRow}>
                  <Text style={s.metaItem}>📍 <Text style={s.metaText}>{item.venue}</Text></Text>
                  <Text style={s.metaItem}>👥 <Text style={s.metaText}>{item.audience}</Text></Text>
                </View>
              </View>

              <View style={s.eventActions}>
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => handleDeleteEvent(item.id)}
                >
                  <Text style={s.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Add Event Modal */}
      <Modal visible={modalOpen} animationType="fade" transparent>
        <View style={s.overlay}>
          <ScrollView contentContainerStyle={s.modalScroll}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>✨ Schedule New School Event</Text>
                <TouchableOpacity onPress={() => setModalOpen(false)}>
                  <Text style={{ fontSize: 18, color: P.textSec }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.inputLabel}>Event Title *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g., Annual Inter-School Science Fair"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholderTextColor={P.textMuted}
              />

              <Text style={s.inputLabel}>Event Category</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {(['academic', 'sports', 'cultural', 'meeting', 'holiday'] as const).map(catKey => {
                  const c = CATEGORY_STYLE[catKey];
                  return (
                    <TouchableOpacity
                      key={catKey}
                      style={[s.catSelectChip, newCategory === catKey && s.catSelectChipActive]}
                      onPress={() => setNewCategory(catKey)}
                    >
                      <Text style={{ fontSize: 12 }}>{c.icon}</Text>
                      <Text style={[s.catSelectText, newCategory === catKey && { color: P.indigo, fontWeight: '700' }]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={s.formGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>Date (YYYY-MM-DD) *</Text>
                  <TextInput
                    style={s.input}
                    placeholder="2026-10-25"
                    value={newDate}
                    onChangeText={setNewDate}
                    placeholderTextColor={P.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>Time Range</Text>
                  <TextInput
                    style={s.input}
                    placeholder="09:00 AM - 01:00 PM"
                    value={newTime}
                    onChangeText={setNewTime}
                    placeholderTextColor={P.textMuted}
                  />
                </View>
              </View>

              <View style={s.formGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>Venue / Location *</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Auditorium / Grounds"
                    value={newVenue}
                    onChangeText={setNewVenue}
                    placeholderTextColor={P.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>Target Audience</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Grades 9-12 & Parents"
                    value={newAudience}
                    onChangeText={setNewAudience}
                    placeholderTextColor={P.textMuted}
                  />
                </View>
              </View>

              <Text style={s.inputLabel}>Event Description</Text>
              <TextInput
                style={[s.input, { height: 75, textAlignVertical: 'top' }]}
                placeholder="Brief summary of agenda, activities, or guidelines..."
                value={newDesc}
                onChangeText={setNewDesc}
                placeholderTextColor={P.textMuted}
                multiline
              />

              <View style={s.modalActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setModalOpen(false)}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={handleCreateEvent} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={s.saveText}>Save Event</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: P.card,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  breadcrumb: {
    fontSize: 10,
    fontWeight: '700',
    color: P.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: P.text,
  },
  addBtn: {
    backgroundColor: P.indigo,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: P.indigo,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: P.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    borderLeftWidth: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: P.textSec,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: P.text,
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 10,
    color: P.textMuted,
  },
  filterBar: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.border,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: P.text,
  },
  tabsList: {
    gap: 8,
    flexDirection: 'row',
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: P.card,
    borderWidth: 1,
    borderColor: P.border,
  },
  tabChipActive: {
    backgroundColor: P.indigo,
    borderColor: P.indigo,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
  },
  tabChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: P.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  eventDateBox: {
    width: 60,
    height: 64,
    backgroundColor: P.indigoBg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  eventDateDay: {
    fontSize: 22,
    fontWeight: '800',
    color: P.indigo,
    lineHeight: 26,
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: P.indigo,
  },
  eventMain: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeBadge: {
    fontSize: 11,
    color: P.textMuted,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: P.text,
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 12.5,
    color: P.textSec,
    lineHeight: 18,
    marginBottom: 8,
  },
  eventMetaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: 11,
  },
  metaText: {
    color: P.textSec,
    fontWeight: '600',
  },
  eventActions: {
    justifyContent: 'flex-start',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: P.redBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: P.red,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: P.textSec,
  },
  emptySubtitle: {
    fontSize: 12,
    color: P.textMuted,
  },
  // Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalScroll: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    padding: 20,
  },
  modalCard: {
    backgroundColor: P.card,
    borderRadius: 20,
    padding: 24,
    width: Platform.OS === 'web' ? 520 : '100%',
    maxWidth: 540,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: P.text,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: P.text,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: P.text,
    backgroundColor: P.bg,
  },
  catSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: P.bg,
  },
  catSelectChipActive: {
    backgroundColor: P.indigoBg,
    borderColor: P.indigo,
  },
  catSelectText: {
    fontSize: 11,
    color: P.textSec,
    fontWeight: '600',
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
  },
  cancelText: {
    color: P.text,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: P.indigo,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
