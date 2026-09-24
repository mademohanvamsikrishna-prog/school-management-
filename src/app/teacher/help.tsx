/**
 * TeacherHelpScreen — Help & Support center for teachers.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { SIZES, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleLight: '#F5F3FF',
  indigo: '#4F46E5', indigoLight: '#EEF2FF',
  green: '#10B981', greenLight: '#D1FAE5',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  blue: '#3B82F6', blueLight: '#DBEAFE',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'How do I mark attendance for my class?',
    a: 'Go to the Attendance section from the sidebar or click "Mark Attendance" in Quick Actions. Select your class, mark each student as Present/Absent/Late, then submit.',
  },
  {
    q: 'How do I enter marks for students?',
    a: 'Navigate to Marks / Results from the sidebar. Select the class and subject, enter each student\'s marks, then save.',
  },
  {
    q: 'How do I create an assignment?',
    a: 'Go to Assignments → Create tab. Fill in the title, description, due date, max marks, and select the class. Click Create Assignment.',
  },
  {
    q: 'How do I message students or parents?',
    a: 'Use the Messages section in the sidebar to send direct messages. You can message individual students or broadcast to a class.',
  },
  {
    q: 'How do I view my timetable?',
    a: 'Click Timetable in the sidebar. You\'ll see a full weekly view with day tabs. Today\'s schedule is highlighted.',
  },
  {
    q: 'How do I update my profile information?',
    a: 'Go to Profile from the sidebar or click your avatar in the top right. You can edit your name and profile picture.',
  },
  {
    q: 'Why is attendance data not showing?',
    a: 'Attendance stats appear after you have marked attendance for at least one class. If data is still missing, contact your administrator.',
  },
];

const GUIDES = [
  { icon: '📊', title: 'Marking Attendance', desc: 'Step-by-step guide to mark class attendance', color: C.greenLight, textColor: C.green },
  { icon: '🏆', title: 'Entering Marks',     desc: 'How to enter and manage student marks',     color: C.amberLight, textColor: C.amber },
  { icon: '📋', title: 'Creating Assignments', desc: 'Create and track class assignments',       color: C.blueLight,  textColor: C.blue  },
  { icon: '💬', title: 'Messaging',           desc: 'Communicate with students and parents',     color: C.purpleLight,textColor: C.purple },
];

export default function TeacherHelpScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch]   = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <SafeAreaView style={hStyles.safeArea}>
      {/* Header */}
      <View style={hStyles.pageHeader}>
        <Text style={hStyles.pageTitle}>Help & Support</Text>
        <Text style={hStyles.pageSub}>Find answers and get assistance</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={hStyles.scroll}>
        {/* Search */}
        <View style={hStyles.searchWrap}>
          <Text style={hStyles.searchIcon}>🔍</Text>
          <TextInput
            style={hStyles.searchInput}
            placeholder="Search help articles..."
            placeholderTextColor={C.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Quick Guides */}
        <Text style={hStyles.sectionTitle}>📖 Quick Guides</Text>
        <View style={hStyles.guidesGrid}>
          {GUIDES.map((g, i) => (
            <TouchableOpacity key={i} style={[hStyles.guideCard, { backgroundColor: g.color }]}>
              <Text style={hStyles.guideIcon}>{g.icon}</Text>
              <Text style={[hStyles.guideTitle, { color: g.textColor }]}>{g.title}</Text>
              <Text style={[hStyles.guideDesc, { color: g.textColor + 'CC' }]}>{g.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text style={hStyles.sectionTitle}>❓ Frequently Asked Questions</Text>
        <View style={hStyles.faqCard}>
          {filtered.length === 0 ? (
            <View style={{ padding: SIZES.lg, alignItems: 'center' }}>
              <Text style={{ fontSize: 32 }}>🔍</Text>
              <Text style={[hStyles.faqQ, { textAlign: 'center', marginTop: 8 }]}>No results for "{search}"</Text>
            </View>
          ) : (
            filtered.map((faq, i) => (
              <View key={i}>
                {i > 0 && <View style={hStyles.divider} />}
                <TouchableOpacity
                  style={hStyles.faqRow}
                  onPress={() => setOpenFaq(openFaq === i ? null : i)}
                  activeOpacity={0.8}
                >
                  <View style={hStyles.faqLeft}>
                    <Text style={hStyles.faqQ}>{faq.q}</Text>
                    {openFaq === i && (
                      <Text style={hStyles.faqA}>{faq.a}</Text>
                    )}
                  </View>
                  <Text style={[hStyles.faqChevron, openFaq === i && { transform: [{ rotate: '90deg' }] }]}>›</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Contact Support */}
        <Text style={hStyles.sectionTitle}>📩 Contact Support</Text>
        <View style={hStyles.contactCard}>
          <Text style={hStyles.contactDesc}>
            Can't find an answer? Send a message to the school administration and we'll get back to you within 24 hours.
          </Text>
          {sent && (
            <View style={hStyles.sentBanner}>
              <Text style={hStyles.sentText}>✅ Message sent! We'll respond within 24 hours.</Text>
            </View>
          )}
          <TextInput
            style={[hStyles.contactInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question..."
            placeholderTextColor={C.textLight}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={hStyles.sendBtn} onPress={handleSend}>
            <Text style={hStyles.sendBtnText}>📩  Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* Contact info */}
        <View style={hStyles.infoRow}>
          <View style={[hStyles.infoCard, { backgroundColor: C.blueLight }]}>
            <Text style={hStyles.infoIcon}>📞</Text>
            <Text style={[hStyles.infoTitle, { color: C.blue }]}>Phone</Text>
            <Text style={[hStyles.infoValue, { color: C.blue }]}>+91 98765 43210</Text>
          </View>
          <View style={[hStyles.infoCard, { backgroundColor: C.greenLight }]}>
            <Text style={hStyles.infoIcon}>📧</Text>
            <Text style={[hStyles.infoTitle, { color: C.green }]}>Email</Text>
            <Text style={[hStyles.infoValue, { color: C.green }]}>support@school.edu</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const hStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  pageHeader: {
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: SIZES.lg,
    paddingTop: IS_WEB ? SIZES.lg : SIZES.xl,
    paddingBottom: SIZES.md,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: C.textDark },
  pageSub: { fontSize: 12, color: C.textSub, marginTop: 2 },
  scroll: { padding: SIZES.lg, gap: SIZES.md },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: SIZES.md, gap: 8,
    ...SHADOWS.small,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1, paddingVertical: 12,
    fontSize: 13, color: C.textDark,
  },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: C.textDark, marginTop: 4 },

  guidesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  guideCard: {
    borderRadius: 14, padding: SIZES.md,
    width: IS_WEB ? '48%' : '47%', gap: 4,
    flexGrow: IS_WEB ? 0 : 1,
    minWidth: 130,
  },
  guideIcon: { fontSize: 24, marginBottom: 4 },
  guideTitle: { fontSize: 13, fontWeight: '700' },
  guideDesc: { fontSize: 11, lineHeight: 16 },

  faqCard: {
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', ...SHADOWS.small,
  },
  faqRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: SIZES.md, gap: SIZES.sm,
  },
  faqLeft: { flex: 1 },
  faqQ: { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  faqA: { fontSize: 12, color: C.textSub, lineHeight: 18, marginTop: 6 },
  faqChevron: { fontSize: 18, color: C.textSub, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: SIZES.md },

  contactCard: {
    backgroundColor: C.card, borderRadius: 14,
    padding: SIZES.lg, borderWidth: 1, borderColor: C.border,
    ...SHADOWS.small, gap: 12,
  },
  contactDesc: { fontSize: 13, color: C.textSub, lineHeight: 18 },
  sentBanner: {
    backgroundColor: C.greenLight, borderRadius: 10, padding: 12,
  },
  sentText: { fontSize: 13, fontWeight: '700', color: C.green },
  contactInput: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: SIZES.md, paddingVertical: 10,
    fontSize: 13, color: C.textDark, minHeight: 100,
    textAlignVertical: 'top',
  },
  sendBtn: {
    backgroundColor: C.purple, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    ...SHADOWS.medium,
  },
  sendBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  infoRow: { flexDirection: 'row', gap: SIZES.sm },
  infoCard: {
    flex: 1, borderRadius: 14, padding: SIZES.md, gap: 4, alignItems: 'center',
  },
  infoIcon: { fontSize: 24 },
  infoTitle: { fontSize: 11, fontWeight: '700' },
  infoValue: { fontSize: 11, fontWeight: '600' },
});
