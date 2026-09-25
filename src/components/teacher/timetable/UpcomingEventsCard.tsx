import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'meeting' | 'exam' | 'holiday' | 'deadline';
  location?: string;
}

interface UpcomingEventsCardProps {
  events?: EventItem[];
}

const DEFAULT_EVENTS: EventItem[] = [
  { id: '1', title: 'Parent-Teacher Meeting', date: 'Sep 28, 2026', time: '10:00 AM', type: 'meeting', location: 'Auditorium' },
  { id: '2', title: 'Unit Test 2 — Mathematics', date: 'Oct 02, 2026', time: '09:00 AM', type: 'exam', location: 'Class 10-A' },
  { id: '3', title: 'Gandhi Jayanti School Holiday', date: 'Oct 02, 2026', time: 'All Day', type: 'holiday', location: 'Campus Closed' },
  { id: '4', title: 'Mid-Term Result Submission Deadline', date: 'Oct 05, 2026', time: '05:00 PM', type: 'deadline', location: 'Teacher Portal' },
];

export const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({
  events = DEFAULT_EVENTS,
}) => {
  const [showAllModal, setShowAllModal] = useState(false);

  const getEventIcon = (type: EventItem['type']) => {
    switch (type) {
      case 'meeting':
        return '🤝';
      case 'exam':
        return '📝';
      case 'holiday':
        return '🎉';
      case 'deadline':
        return '⏳';
      default:
        return '📌';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>UPCOMING EVENTS</Text>
        <TouchableOpacity onPress={() => setShowAllModal(true)} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.eventsList}>
        {events.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.eventItem}>
            <View style={styles.iconBox}>
              <Text style={{ fontSize: 16 }}>{getEventIcon(item.type)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.eventSub}>
                {item.date} {item.time ? `• ${item.time}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* View All Events Modal */}
      <Modal visible={showAllModal} transparent animationType="fade" onRequestClose={() => setShowAllModal(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>School Events Calendar</Text>
              <TouchableOpacity onPress={() => setShowAllModal(false)}>
                <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 20 }}>
              {events.map((e) => (
                <View key={e.id} style={styles.modalEventRow}>
                  <Text style={{ fontSize: 20 }}>{getEventIcon(e.type)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{e.title}</Text>
                    <Text style={styles.eventSub}>
                      {e.date} • {e.time} • {e.location || 'Campus'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  eventsList: {
    gap: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
});
