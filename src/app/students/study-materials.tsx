/**
 * Study Materials — professional page for learning resources.
 * No dedicated backend model exists; shows an honest, polished placeholder
 * with the UI scaffolding ready to wire up once the backend is built.
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
  Platform,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const SUBJECTS = ['All', 'Mathematics', 'Science', 'English', 'History', 'Computer', 'Arts'];
const FILE_TYPES = [
  { icon: '📄', label: 'PDF', color: '#EF4444', bg: '#FEF2F2' },
  { icon: '📹', label: 'Video', color: '#3B82F6', bg: '#EFF6FF' },
  { icon: '📊', label: 'Slides', color: '#F59E0B', bg: '#FFFBEB' },
  { icon: '📝', label: 'Notes', color: '#10B981', bg: '#ECFDF5' },
];

// Illustrative placeholder items to show the UI (not from backend)
const PLACEHOLDER_MATERIALS = [
  { id: '1', title: 'Chapter 5 — Algebra Notes', subject: 'Mathematics', teacher: 'Ms. Sharma', date: '2026-09-10', type: 'pdf', icon: '📄', typeColor: '#EF4444', typeBg: '#FEF2F2' },
  { id: '2', title: 'Newton\'s Laws — Video Lecture', subject: 'Science', teacher: 'Mr. Patel', date: '2026-09-08', type: 'video', icon: '📹', typeColor: '#3B82F6', typeBg: '#EFF6FF' },
  { id: '3', title: 'Grammar Practice Worksheet', subject: 'English', teacher: 'Ms. Rao', date: '2026-09-07', type: 'pdf', icon: '📄', typeColor: '#EF4444', typeBg: '#FEF2F2' },
  { id: '4', title: 'World War II — Presentation', subject: 'History', teacher: 'Mr. Kumar', date: '2026-09-05', type: 'slides', icon: '📊', typeColor: '#F59E0B', typeBg: '#FFFBEB' },
];

export default function StudyMaterialsScreen() {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const filtered = PLACEHOLDER_MATERIALS.filter(m => {
    const matchSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Study Materials</Text>
          <Text style={styles.pageSub}>Learning resources from your teachers</Text>
        </View>

        {/* Notice banner */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Study materials will appear here once your teachers upload resources. The items below are sample previews.
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search materials..."
            placeholderTextColor={COLORS.textLight}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* File type quick filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilter}>
          {FILE_TYPES.map(ft => (
            <View key={ft.label} style={[styles.typeChip, { backgroundColor: ft.bg }]}>
              <Text style={{ fontSize: 16 }}>{ft.icon}</Text>
              <Text style={[styles.typeChipLabel, { color: ft.color }]}>{ft.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Subject filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SIZES.md }}>
          {SUBJECTS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.subjectChip, selectedSubject === s && styles.subjectChipActive]}
              onPress={() => setSelectedSubject(s)}
            >
              <Text style={[styles.subjectChipText, selectedSubject === s && styles.subjectChipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Material cards */}
        <Text style={styles.sectionLabel}>MATERIALS ({filtered.length})</Text>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No materials found</Text>
            <Text style={styles.emptySub}>Try a different search or subject filter.</Text>
          </View>
        ) : (
          filtered.map(mat => (
            <View key={mat.id} style={styles.matCard}>
              <View style={[styles.fileIconBox, { backgroundColor: mat.typeBg }]}>
                <Text style={{ fontSize: 24 }}>{mat.icon}</Text>
              </View>
              <View style={styles.matInfo}>
                <Text style={styles.matTitle} numberOfLines={2}>{mat.title}</Text>
                <Text style={styles.matMeta}>{mat.subject} · {mat.teacher}</Text>
                <Text style={styles.matDate}>Uploaded: {mat.date}</Text>
              </View>
              <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: mat.typeBg }]}>
                <Text style={[styles.downloadBtnText, { color: mat.typeColor }]}>↓</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

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
    borderRadius: SIZES.radiusSm, padding: SIZES.md, marginBottom: SIZES.md,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  noticeIcon: { fontSize: 16 },
  noticeText: { ...FONTS.body2, color: '#1D4ED8', flex: 1, lineHeight: 20 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SIZES.md, marginBottom: SIZES.md, ...SHADOWS.small,
  },
  searchIcon: { fontSize: 16, marginRight: SIZES.sm },
  searchInput: { flex: 1, paddingVertical: SIZES.md, fontSize: 14, color: COLORS.textDark },
  clearBtn: { fontSize: 14, color: COLORS.textSecondary, padding: 4 },
  typeFilter: { marginBottom: SIZES.md },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm, borderRadius: SIZES.radiusRound, marginRight: SIZES.sm,
  },
  typeChipLabel: { fontSize: 12, fontWeight: '700' },
  subjectChip: {
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusRound,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, marginRight: SIZES.sm,
  },
  subjectChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  subjectChipText: { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '600' },
  subjectChipTextActive: { color: '#fff' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SIZES.sm },
  matCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: SIZES.md,
    marginBottom: SIZES.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  fileIconBox: { width: 52, height: 52, borderRadius: SIZES.radiusSm, alignItems: 'center', justifyContent: 'center' },
  matInfo: { flex: 1 },
  matTitle: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '700', marginBottom: 4 },
  matMeta: { ...FONTS.caption, color: COLORS.textSecondary },
  matDate: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },
  downloadBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  downloadBtnText: { fontSize: 18, fontWeight: '700' },
  emptyCard: { alignItems: 'center', padding: SIZES.xl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
});
