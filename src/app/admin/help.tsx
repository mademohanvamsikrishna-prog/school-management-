import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, Alert, Platform, Modal, ActivityIndicator,
} from 'react-native';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#2563EB', indigoBg: '#EFF6FF',
  green: '#10B981', greenBg: '#ECFDF5',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  red: '#EF4444', redBg: '#FEF2F2',
  purple: '#8B5CF6', purpleBg: '#F5F3FF',
};

export interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Admissions & Students',
    q: 'How do I approve a new student admission application?',
    a: 'Navigate to "Admissions" from the sidebar. Review pending student profiles, verify submitted document attachments, and click the green "Approve Application" button. The system will automatically generate student login credentials.',
  },
  {
    category: 'Academics & Timetable',
    q: 'Can teachers see the timetable immediately after saving?',
    a: 'Yes, any timetable changes published under the "Timetable" portal synchronize in real-time to teacher and student mobile portals and web dashboards.',
  },
  {
    category: 'Finance & Invoicing',
    q: 'How are overdue fee reminders dispatched to parents?',
    a: 'Automated SMS and email reminders are triggered automatically 3 days before the invoice due date and weekly on overdue balances, configured under Settings > Alerts & Delivery.',
  },
  {
    category: 'Security & Access',
    q: 'How do I deactivate a staff or teacher account?',
    a: 'Open either "Teachers" or "Staff Management", locate the user row, click "Edit", and switch the account status toggle to "Inactive". This immediately revokes portal access.',
  },
];

export default function AdminHelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [ticketModal, setTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      Alert.alert('Validation Error', 'Please provide a ticket subject and description.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTicketModal(false);
      setTicketSubject('');
      setTicketDesc('');
      if (Platform.OS === 'web') {
        window.alert('Ticket submitted successfully! Ticket ID #IT-9428 has been logged.');
      } else {
        Alert.alert('Ticket Logged', 'Support request #IT-9428 has been dispatched to IT support desk.');
      }
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>SYSTEM / HELP & SUPPORT</Text>
          <Text style={s.title}>Help & Knowledge Center</Text>
        </View>
        <TouchableOpacity style={s.ticketTopBtn} onPress={() => setTicketModal(true)}>
          <Text style={s.ticketTopBtnText}>🎫 Raise Support Ticket</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.contentScroll} showsVerticalScrollIndicator={false}>
        {/* Support Channels Banner */}
        <View style={s.supportGrid}>
          <View style={s.channelCard}>
            <View style={[s.channelIconBox, { backgroundColor: P.indigoBg }]}>
              <Text style={{ fontSize: 22 }}>💻</Text>
            </View>
            <Text style={s.channelTitle}>Technical Support</Text>
            <Text style={s.channelDesc}>Database, login credentials, and server inquiries</Text>
            <Text style={s.channelContact}>support@schoolerp.in</Text>
            <Text style={s.channelHours}>Mon–Sat, 8:00 AM – 6:00 PM</Text>
          </View>

          <View style={s.channelCard}>
            <View style={[s.channelIconBox, { backgroundColor: P.greenBg }]}>
              <Text style={{ fontSize: 22 }}>📞</Text>
            </View>
            <Text style={s.channelTitle}>Academic Helpdesk</Text>
            <Text style={s.channelDesc}>Admissions, exam grading norms, and CBSE compliance</Text>
            <Text style={s.channelContact}>+91 (011) 2894-3200</Text>
            <Text style={s.channelHours}>Extension 104 / 105</Text>
          </View>

          <View style={s.channelCard}>
            <View style={[s.channelIconBox, { backgroundColor: P.purpleBg }]}>
              <Text style={{ fontSize: 22 }}>⚡</Text>
            </View>
            <Text style={s.channelTitle}>System Health</Text>
            <Text style={s.channelDesc}>All microservices & PostgreSQL database operational</Text>
            <View style={s.statusPill}>
              <View style={s.statusDot} />
              <Text style={s.statusText}>All Systems Normal (99.98%)</Text>
            </View>
          </View>
        </View>

        {/* FAQs Section */}
        <View style={s.card}>
          <Text style={s.cardTitle}>❓ Frequently Asked Questions</Text>
          <Text style={s.cardSubtitle}>Quick answers for common principal and admin tasks</Text>

          <View style={{ gap: 10, marginTop: 14 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <View key={idx} style={s.faqItem}>
                  <TouchableOpacity
                    style={s.faqHeader}
                    onPress={() => setExpandedFaq(isOpen ? null : idx)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.faqCat}>{faq.category}</Text>
                      <Text style={s.faqQ}>{faq.q}</Text>
                    </View>
                    <Text style={s.faqArrow}>{isOpen ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={s.faqAnswerBox}>
                      <Text style={s.faqA}>{faq.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* System Details Box */}
        <View style={s.card}>
          <Text style={s.cardTitle}>ℹ️ System Specifications</Text>
          <View style={s.specGrid}>
            <View style={s.specItem}>
              <Text style={s.specLabel}>Application Version</Text>
              <Text style={s.specVal}>v1.0.0 (Build 2026.09)</Text>
            </View>
            <View style={s.specItem}>
              <Text style={s.specLabel}>Backend Engine</Text>
              <Text style={s.specVal}>FastAPI Python 3.11 + SQLAlchemy</Text>
            </View>
            <View style={s.specItem}>
              <Text style={s.specLabel}>Primary Database</Text>
              <Text style={s.specVal}>PostgreSQL AWS (Supabase Pooler)</Text>
            </View>
            <View style={s.specItem}>
              <Text style={s.specLabel}>Client Framework</Text>
              <Text style={s.specVal}>React Native / Expo 54 (SDK 54)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Ticket Modal */}
      <Modal visible={ticketModal} animationType="fade" transparent>
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>🎫 Raise IT Support Ticket</Text>
              <TouchableOpacity onPress={() => setTicketModal(false)}>
                <Text style={{ fontSize: 18, color: P.textSec }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.inputLabel}>Subject / Topic *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g., Assistance with bulk student CSV upload"
              value={ticketSubject}
              onChangeText={setTicketSubject}
              placeholderTextColor={P.textMuted}
            />

            <Text style={s.inputLabel}>Issue Description *</Text>
            <TextInput
              style={[s.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Describe what you were doing and any error messages..."
              value={ticketDesc}
              onChangeText={setTicketDesc}
              placeholderTextColor={P.textMuted}
              multiline
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setTicketModal(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSubmitTicket} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={s.saveText}>Submit Ticket</Text>}
              </TouchableOpacity>
            </View>
          </View>
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
  ticketTopBtn: {
    backgroundColor: P.indigo,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  ticketTopBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  contentScroll: {
    padding: 20,
    gap: 16,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  supportGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 14,
  },
  channelCard: {
    flex: 1,
    backgroundColor: P.card,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: P.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  channelIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  channelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: P.text,
    marginBottom: 4,
  },
  channelDesc: {
    fontSize: 12,
    color: P.textSec,
    lineHeight: 17,
    marginBottom: 10,
  },
  channelContact: {
    fontSize: 13,
    fontWeight: '700',
    color: P.indigo,
    marginBottom: 2,
  },
  channelHours: {
    fontSize: 11,
    color: P.textMuted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: P.greenBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: P.green,
  },
  statusText: {
    color: P.green,
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: P.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: P.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: P.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: P.textSec,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FAFBFD',
  },
  faqCat: {
    fontSize: 10,
    fontWeight: '700',
    color: P.indigo,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  faqQ: {
    fontSize: 13.5,
    fontWeight: '700',
    color: P.text,
  },
  faqArrow: {
    fontSize: 12,
    color: P.textSec,
    marginLeft: 10,
  },
  faqAnswerBox: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  faqA: {
    fontSize: 13,
    color: P.textSec,
    lineHeight: 20,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  specItem: {
    flex: 1,
    minWidth: 180,
    backgroundColor: P.bg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.border,
  },
  specLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: P.textMuted,
    marginBottom: 4,
  },
  specVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: P.text,
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: P.card,
    borderRadius: 20,
    padding: 24,
    width: Platform.OS === 'web' ? 480 : '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
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
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
