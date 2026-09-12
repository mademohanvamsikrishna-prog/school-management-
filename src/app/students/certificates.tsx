/**
 * Certificates — student achievement certificates.
 * No dedicated backend model exists; displays a professional UI with
 * request functionality for when the backend is available.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const CERTIFICATE_TYPES = [
  { icon: '🎓', label: 'Academic',      color: '#4F46E5', bg: '#EEF2FF', desc: 'Academic excellence & merit' },
  { icon: '🏆', label: 'Achievement',   color: '#F59E0B', bg: '#FFFBEB', desc: 'Competitions & awards' },
  { icon: '⚽', label: 'Sports',        color: '#10B981', bg: '#ECFDF5', desc: 'Sports & games' },
  { icon: '🎨', label: 'Participation', color: '#8B5CF6', bg: '#F5F3FF', desc: 'Events & activities' },
];

// Sample placeholder certificates
const PLACEHOLDER_CERTS = [
  {
    id: '1', name: 'Academic Excellence', type: 'Academic', issuedBy: 'Principal',
    date: '2026-03-15', status: 'issued', icon: '🎓', color: '#4F46E5', bg: '#EEF2FF',
  },
  {
    id: '2', name: 'First Place — Math Olympiad', type: 'Achievement', issuedBy: 'Math Department',
    date: '2026-02-10', status: 'issued', icon: '🏆', color: '#F59E0B', bg: '#FFFBEB',
  },
];

export default function CertificatesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Certificates</Text>
          <Text style={styles.pageSub}>Your achievements and certificates</Text>
        </View>

        {/* Notice */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Certificates issued by the school will appear here. Contact your class teacher or admin to request a certificate.
          </Text>
        </View>

        {/* Certificate type legend */}
        <Text style={styles.sectionLabel}>CERTIFICATE CATEGORIES</Text>
        <View style={styles.categoryGrid}>
          {CERTIFICATE_TYPES.map(ct => (
            <View key={ct.label} style={[styles.categoryCard, { backgroundColor: ct.bg }]}>
              <Text style={{ fontSize: 24 }}>{ct.icon}</Text>
              <Text style={[styles.categoryLabel, { color: ct.color }]}>{ct.label}</Text>
              <Text style={styles.categoryDesc}>{ct.desc}</Text>
            </View>
          ))}
        </View>

        {/* Sample certificates */}
        <Text style={[styles.sectionLabel, { marginTop: SIZES.md }]}>MY CERTIFICATES</Text>
        {PLACEHOLDER_CERTS.map(cert => (
          <View key={cert.id} style={[styles.certCard, { borderLeftColor: cert.color }]}>
            <View style={[styles.certIcon, { backgroundColor: cert.bg }]}>
              <Text style={{ fontSize: 28 }}>{cert.icon}</Text>
            </View>
            <View style={styles.certBody}>
              <Text style={styles.certName}>{cert.name}</Text>
              <Text style={styles.certMeta}>{cert.type} · Issued by {cert.issuedBy}</Text>
              <Text style={styles.certDate}>📅 {cert.date}</Text>
            </View>
            <TouchableOpacity style={[styles.viewBtn, { backgroundColor: cert.bg }]}>
              <Text style={[styles.viewBtnText, { color: cert.color }]}>View</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Request certificate CTA */}
        <View style={styles.requestCard}>
          <Text style={styles.requestIcon}>📋</Text>
          <Text style={styles.requestTitle}>Need a Certificate?</Text>
          <Text style={styles.requestSub}>
            Contact your class teacher or school administration to request bonafide, character, or other certificates.
          </Text>
          <TouchableOpacity style={styles.requestBtn}>
            <Text style={styles.requestBtnText}>Contact Admin →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: IS_WEB ? SIZES.xl : SIZES.md, paddingBottom: SIZES.xxl },
  pageHeader: { marginBottom: SIZES.lg },
  pageTitle: { ...FONTS.h2, color: COLORS.textDark, fontWeight: '700' },
  pageSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },
  noticeBanner: {
    flexDirection: 'row', gap: SIZES.sm, backgroundColor: '#EFF6FF',
    borderRadius: SIZES.radiusSm, padding: SIZES.md, marginBottom: SIZES.lg,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  noticeIcon: { fontSize: 16 },
  noticeText: { ...FONTS.body2, color: '#1D4ED8', flex: 1, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SIZES.sm },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.md,
  },
  categoryCard: {
    width: IS_WEB ? 'calc(50% - 8px)' as any : '48%', borderRadius: SIZES.radius,
    padding: SIZES.md, gap: 4, ...SHADOWS.small,
  },
  categoryLabel: { ...FONTS.body2, fontWeight: '700', marginTop: 4 },
  categoryDesc: { ...FONTS.caption, color: COLORS.textSecondary },
  certCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.md,
    marginBottom: SIZES.sm, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  certIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  certBody: { flex: 1 },
  certName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '700', marginBottom: 4 },
  certMeta: { ...FONTS.caption, color: COLORS.textSecondary },
  certDate: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },
  viewBtn: { paddingHorizontal: SIZES.sm, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusSm },
  viewBtnText: { fontSize: 13, fontWeight: '700' },
  requestCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.xl,
    alignItems: 'center', gap: SIZES.sm, borderWidth: 1, borderColor: COLORS.border,
    marginTop: SIZES.md, ...SHADOWS.small,
  },
  requestIcon: { fontSize: 36 },
  requestTitle: { ...FONTS.h4, color: COLORS.textDark, fontWeight: '700' },
  requestSub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  requestBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md, borderRadius: SIZES.radiusSm, marginTop: SIZES.sm,
  },
  requestBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
