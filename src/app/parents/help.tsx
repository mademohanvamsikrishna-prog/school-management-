/**
 * HelpScreen — Dedicated Parent -> Help & Support Page.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const FAQS = [
  {
    q: 'How do I download academic report cards?',
    a: 'Go to the Results page, select your child and the relevant examination term, then click on the download or print option.',
  },
  {
    q: 'How does fee payment simulation work?',
    a: 'Under the Fees section, click "Pay Now" on any pending invoice. The sandbox system will immediately record and mark the invoice as paid without charging real money.',
  },
  {
    q: 'What should I do if attendance is marked incorrectly?',
    a: 'You can directly message your child’s class teacher via the Messages tab or contact the administrative desk using the contact details below.',
  },
  {
    q: 'How do I update my contact or address details?',
    a: 'Visit Settings / Profile or reach out to the school registrar office for official record verification.',
  },
];

export default function ParentHelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');

  const handleSubmitInquiry = () => {
    if (!inquirySubject.trim() || !inquiryText.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter both subject and message for your inquiry.');
      } else {
        Alert.alert('Required', 'Please enter both subject and message.');
      }
      return;
    }
    if (Platform.OS === 'web') {
      window.alert('Thank you! Your support ticket has been submitted. The school office will respond within 24 hours.');
    } else {
      Alert.alert('Ticket Submitted', 'The school office will respond within 24 hours.');
    }
    setInquirySubject('');
    setInquiryText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Help & Support"
        subtitle="Parent support center, FAQs, and administrative contact"
        showBack={false}
      />

      <ScrollView contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
        {/* Contact Cards Grid */}
        <View style={styles.contactGrid}>
          <View style={styles.contactCard}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactTitle}>School Helpline</Text>
            <Text style={styles.contactDetail}>+91 (080) 2345-6789</Text>
            <Text style={styles.contactSub}>Mon–Fri, 8:00 AM – 4:00 PM</Text>
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactDetail}>parent.desk@school.edu</Text>
            <Text style={styles.contactSub}>Response within 24 hours</Text>
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactIcon}>🏫</Text>
            <Text style={styles.contactTitle}>Admin Office</Text>
            <Text style={styles.contactDetail}>Main Admin Building, Room 102</Text>
            <Text style={styles.contactSub}>Visiting hours: 10 AM – 1 PM</Text>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSub}>Quick answers to common parent inquiries</Text>

          <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.faqItem, isOpen && styles.faqItemOpen]}
                  onPress={() => setExpandedFaq(isOpen ? null : idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHead}>
                    <Text style={styles.faqQ}>{faq.q}</Text>
                    <Text style={styles.faqToggle}>{isOpen ? '−' : '+'}</Text>
                  </View>
                  {isOpen && (
                    <Text style={styles.faqA}>{faq.a}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Support Inquiry Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Submit a Support Inquiry</Text>
          <Text style={styles.sectionSub}>Send a message directly to school administration</Text>

          <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
            <TextInput
              style={styles.input}
              placeholder="Inquiry Subject (e.g., Fee receipt question, bus route)"
              placeholderTextColor={COLORS.textLight}
              value={inquirySubject}
              onChangeText={setInquirySubject}
            />

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Describe your inquiry or request in detail..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              value={inquiryText}
              onChangeText={setInquiryText}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitInquiry}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Submit Inquiry →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  contentPad: { padding: SIZES.lg },

  contactGrid: {
    flexDirection: IS_WEB ? 'row' : 'column',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...SHADOWS.small,
    alignItems: 'flex-start',
  },
  contactIcon: {
    fontSize: 26,
    marginBottom: SIZES.xs,
  },
  contactTitle: {
    ...FONTS.h4,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  contactDetail: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  contactSub: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  sectionSub: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  faqItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqItemOpen: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  faqHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  faqQ: {
    ...FONTS.body2,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  faqToggle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  faqA: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    lineHeight: 20,
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textDark,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
