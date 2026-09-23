/**
 * Student Profile — Full profile page.
 * Replaces the 3-line PlaceholderScreen.
 *
 * Shows: personal info, academic stats (attendance %, grade average),
 * class & roll info, settings links, logout.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';
import { getDashboardSummary } from '../../services/dashboard';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  green: '#10B981', greenBg: '#ECFDF5',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  red: '#EF4444', redBg: '#FEF2F2',
};

const GRADE_COLORS: Record<string, { text: string; bg: string }> = {
  'A+': { text: '#15803D', bg: '#DCFCE7' },
  A:   { text: '#16A34A', bg: '#F0FDF4' },
  'B+': { text: '#1D4ED8', bg: '#DBEAFE' },
  B:   { text: '#2563EB', bg: '#EFF6FF' },
  'C+': { text: '#D97706', bg: '#FEF3C7' },
  C:   { text: '#D97706', bg: '#FFFBEB' },
  D:   { text: '#DC2626', bg: '#FEE2E2' },
  F:   { text: '#991B1B', bg: '#FEF2F2' },
};

function StatCard2({ label, value, icon, color, bg }: { label: string; value: string; icon: string; color: string; bg: string }) {
  return (
    <View style={[sc.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <View style={[sc.icon, { backgroundColor: bg }]}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  card: { flex: 1, backgroundColor: P.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: P.border, alignItems: 'center', gap: 6 },
  icon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '600', color: P.textSec, textAlign: 'center' },
});

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIcon}><Text style={{ fontSize: 16 }}>{icon}</Text></View>
      <View>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: profile, loading: profileLoading } = useApi(getMyProfile);
  const { data: summary, loading: summaryLoading } = useApi(getDashboardSummary);

  const loading = profileLoading || summaryLoading;
  const displayName = profile?.name ?? user?.name ?? 'Student';
  const displayEmail = profile?.email ?? user?.email ?? '';

  const attPct = summary?.attendance_percentage ?? 0;
  const rollNo = profile?.student_profile?.roll_number ?? '—';
  const className = profile?.student_profile?.class_name ?? '—';
  const academicYear = '2026–2027';

  const handleLogout = async () => {
    const doLogout = async () => { await logout(); router.replace('/'); };
    if (Platform.OS === 'web') {
      if (window.confirm('Logout from your student account?')) doLogout();
    } else {
      Alert.alert('Logout', 'Exit your student portal?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const attColor = attPct >= 75 ? P.green : attPct >= 60 ? P.amber : P.red;
  const attBg = attPct >= 75 ? P.greenBg : attPct >= 60 ? P.amberBg : P.redBg;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>STUDENT / PROFILE</Text>
          <Text style={s.title}>My Profile</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={P.indigo} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Avatar */}
          <View style={s.avatarCard}>
            <View style={[s.avatarCircle, { backgroundColor: P.indigo }]}>
              <Text style={s.avatarText}>{displayName[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.displayName}>{displayName}</Text>
              <View style={s.rolePill}><Text style={s.roleText}>STUDENT · {academicYear}</Text></View>
              <Text style={s.displayEmail}>{displayEmail}</Text>
            </View>
          </View>

          {/* Academic Stats */}
          <View style={s.statsRow}>
            <StatCard2
              label="Attendance"
              value={`${attPct}%`}
              icon="📊"
              color={attColor}
              bg={attBg}
            />
            <StatCard2
              label="Class"
              value={className}
              icon="🏫"
              color={P.indigo}
              bg={P.indigoBg}
            />
            <StatCard2
              label="Roll No."
              value={rollNo}
              icon="🎓"
              color={P.amber}
              bg={P.amberBg}
            />
          </View>

          {/* Attendance Warning */}
          {attPct < 75 && (
            <View style={s.warningCard}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.warnTitle}>Low Attendance Alert</Text>
                <Text style={s.warnDesc}>Your attendance is {attPct}%. Minimum required is 75%.</Text>
              </View>
            </View>
          )}

          {/* Personal Info */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Personal Information</Text>
            <InfoRow label="Full Name" value={displayName} icon="👤" />
            <InfoRow label="Email Address" value={displayEmail} icon="📧" />
            <InfoRow label="Class" value={className} icon="🏫" />
            <InfoRow label="Roll Number" value={rollNo} icon="🔢" />
            <InfoRow label="Academic Year" value={academicYear} icon="📅" />
          </View>

          {/* Quick Links */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Quick Access</Text>
            {[
              { label: 'My Timetable', icon: '🗓️', route: '/students/timetable' },
              { label: 'My Results', icon: '📊', route: '/students/results' },
              { label: 'My Assignments', icon: '📝', route: '/students/assignments' },
              { label: 'Leave Applications', icon: '📋', route: '/students/leave' },
              { label: 'Study Materials', icon: '📚', route: '/students/study-materials' },
              { label: 'Notifications', icon: '🔔', route: '/students/notifications' },
            ].map(link => (
              <TouchableOpacity
                key={link.label}
                style={s.linkRow}
                onPress={() => router.push(link.route as any)}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 18 }}>{link.icon}</Text>
                <Text style={s.linkLabel}>{link.label}</Text>
                <Text style={{ color: P.textMuted, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={{ fontSize: 18 }}>🚪</Text>
            <Text style={s.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 48 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  breadcrumb: { fontSize: 10, fontWeight: '700', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '800', color: P.text },
  scroll: { padding: 16, gap: 14 },
  avatarCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: P.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: P.border, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  avatarCircle: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  displayName: { fontSize: 19, fontWeight: '800', color: P.text, marginBottom: 4 },
  displayEmail: { fontSize: 12, color: P.textSec, marginTop: 4 },
  rolePill: { alignSelf: 'flex-start', backgroundColor: P.indigoBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  roleText: { fontSize: 9, fontWeight: '800', color: P.indigo },
  statsRow: { flexDirection: 'row', gap: 10 },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  warnTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  warnDesc: { fontSize: 12, color: '#D97706' },
  section: { backgroundColor: P.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: P.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: P.text, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  infoIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: P.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: P.border },
  infoLabel: { fontSize: 10, fontWeight: '600', color: P.textMuted, marginBottom: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: P.text },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  linkLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: P.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: P.redBg, borderRadius: 14, padding: 15, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { fontSize: 15, fontWeight: '700', color: P.red },
});
