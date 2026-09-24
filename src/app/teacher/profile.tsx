/**
 * TeacherProfileScreen — Full teacher profile with edit capability.
 * Shows teacher info, employment details, subjects, and account actions.
 */
import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, Alert,
  Platform, ScrollView, SafeAreaView, TextInput,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile } from '../../services/profile';
import { api as apiClient } from '../../services/api';
import { useRouter } from 'expo-router';
import { SIZES, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleDark: '#5B21B6', purpleLight: '#F5F3FF',
  indigo: '#4F46E5', indigoLight: '#EEF2FF',
  green: '#10B981', greenLight: '#D1FAE5',
  red: '#EF4444', redLight: '#FEE2E2',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={pStyles.infoRow}>
      <View style={pStyles.infoIconWrap}>
        <Text style={pStyles.infoIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={pStyles.infoLabel}>{label}</Text>
        <Text style={pStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionButton({ icon, label, onPress, variant = 'default' }: {
  icon: string; label: string; onPress: () => void;
  variant?: 'default' | 'danger' | 'primary';
}) {
  const bgColor = variant === 'danger' ? C.redLight : variant === 'primary' ? C.purple : C.purpleLight;
  const txColor = variant === 'danger' ? C.red : variant === 'primary' ? '#FFF' : C.purple;
  return (
    <TouchableOpacity style={[pStyles.actionBtn, { backgroundColor: bgColor }]} onPress={onPress} activeOpacity={0.85}>
      <Text style={pStyles.actionIcon}>{icon}</Text>
      <Text style={[pStyles.actionLabel, { color: txColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { data: profile, loading, error, refetch } = useApi(getMyProfile);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const teacher = (profile as any)?.teacher_profile;
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'T';

  const startEdit = () => {
    setEditName(user?.name ?? '');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await apiClient.patch('/teacher/me/profile', { name: editName.trim() });
      refetch();
      setEditing(false);
    } catch (e: any) {
      if (IS_WEB) window.alert(e?.message ?? 'Failed to save.');
      else Alert.alert('Error', e?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = IS_WEB
      ? window.confirm('Are you sure you want to logout?')
      : await new Promise<boolean>(res =>
          Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', onPress: () => res(false), style: 'cancel' },
            { text: 'Logout', onPress: () => res(true), style: 'destructive' },
          ])
        );
    if (confirmed) {
      await logout();
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={pStyles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pStyles.scroll}>
        {loading ? (
          <View style={pStyles.center}>
            <Text style={pStyles.loadingText}>Loading profile…</Text>
          </View>
        ) : error ? (
          <View style={pStyles.center}>
            <Text style={pStyles.errorText}>{error.message}</Text>
            <TouchableOpacity onPress={refetch} style={pStyles.retryBtn}>
              <Text style={pStyles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Hero Banner */}
            <View style={pStyles.heroBanner}>
              <View style={[pStyles.blob, pStyles.blobA]} />
              <View style={[pStyles.blob, pStyles.blobB]} />
              <View style={pStyles.avatarLarge}>
                <Text style={pStyles.avatarLargeText}>{initials}</Text>
              </View>
              {editing ? (
                <View style={pStyles.editNameWrap}>
                  <TextInput
                    style={pStyles.editNameInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                    selectTextOnFocus
                  />
                  <View style={pStyles.editActions}>
                    <TouchableOpacity
                      style={[pStyles.editBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                      onPress={() => setEditing(false)}
                    >
                      <Text style={pStyles.editBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[pStyles.editBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                      onPress={saveEdit}
                      disabled={saving}
                    >
                      <Text style={[pStyles.editBtnText, { color: C.purple }]}>
                        {saving ? 'Saving…' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={pStyles.heroName}>{(profile as any)?.name ?? user?.name ?? 'Teacher'}</Text>
                  <View style={pStyles.heroBadge}>
                    <Text style={pStyles.heroBadgeText}>
                      {teacher?.designation ?? 'Teacher'}
                      {teacher?.department ? ` · ${teacher.department}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity style={pStyles.editProfileBtn} onPress={startEdit}>
                    <Text style={pStyles.editProfileBtnText}>✏️ Edit Profile</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Contact Info */}
            <View style={pStyles.card}>
              <Text style={pStyles.cardTitle}>📋 Personal Information</Text>
              <InfoRow icon="📧" label="Email"  value={(profile as any)?.email ?? user?.email} />
              <InfoRow icon="📞" label="Phone"  value={(profile as any)?.phone ?? teacher?.phone} />
              <InfoRow icon="🎂" label="Joined" value={
                (profile as any)?.created_at
                  ? new Date((profile as any).created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                  : undefined
              } />
            </View>

            {/* Employment Details */}
            {teacher && (
              <View style={pStyles.card}>
                <Text style={pStyles.cardTitle}>🏫 Employment Details</Text>
                <InfoRow icon="🪪" label="Employee ID"    value={teacher.employee_id} />
                <InfoRow icon="🏛️" label="Department"     value={teacher.department} />
                <InfoRow icon="👔" label="Designation"    value={teacher.designation} />
                <InfoRow icon="📚" label="Qualification"  value={teacher.qualification} />
                <InfoRow icon="📅" label="Date of Joining" value={teacher.date_of_joining
                  ? new Date(teacher.date_of_joining).toLocaleDateString('en-IN')
                  : undefined}
                />
              </View>
            )}

            {/* Stats */}
            <View style={pStyles.statsRow}>
              <View style={[pStyles.statCard, { backgroundColor: C.purpleLight }]}>
                <Text style={[pStyles.statValue, { color: C.purple }]}>
                  {(profile as any)?.classes_count ?? '—'}
                </Text>
                <Text style={[pStyles.statLabel, { color: C.purple }]}>Classes</Text>
              </View>
              <View style={[pStyles.statCard, { backgroundColor: C.indigoLight }]}>
                <Text style={[pStyles.statValue, { color: C.indigo }]}>
                  {(profile as any)?.students_count ?? '—'}
                </Text>
                <Text style={[pStyles.statLabel, { color: C.indigo }]}>Students</Text>
              </View>
              <View style={[pStyles.statCard, { backgroundColor: C.greenLight }]}>
                <Text style={[pStyles.statValue, { color: C.green }]}>
                  {(profile as any)?.subjects_count ?? '—'}
                </Text>
                <Text style={[pStyles.statLabel, { color: C.green }]}>Subjects</Text>
              </View>
            </View>

            {/* Quick Links */}
            <View style={pStyles.card}>
              <Text style={pStyles.cardTitle}>⚡ Quick Actions</Text>
              <View style={pStyles.actionsGrid}>
                <ActionButton icon="📊" label="Attendance" onPress={() => router.push('/teacher/attendance' as any)} />
                <ActionButton icon="🏆" label="Marks"      onPress={() => router.push('/teacher/marks' as any)} />
                <ActionButton icon="📋" label="Assignments" onPress={() => router.push('/teacher/assignments' as any)} />
                <ActionButton icon="⚙️" label="Settings"   onPress={() => router.push('/teacher/settings' as any)} />
              </View>
            </View>

            {/* Logout */}
            <TouchableOpacity style={pStyles.logoutBtn} onPress={handleLogout}>
              <Text style={pStyles.logoutText}>↪  Sign Out</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const pStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.lg, gap: 12, minHeight: 200 },
  loadingText: { fontSize: 14, color: C.textSub },
  errorText: { fontSize: 14, color: C.red },
  retryBtn: { backgroundColor: C.purple, borderRadius: 10, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm },
  retryText: { color: '#FFF', fontWeight: '700' },

  // Hero
  heroBanner: {
    backgroundColor: C.purple,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xl,
    alignItems: 'center',
    gap: SIZES.sm,
    overflow: 'hidden',
    position: 'relative',
    ...(IS_WEB ? { background: `linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)` } as any : {}),
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
  blobA: { width: 200, height: 200, top: -60, right: -40 },
  blobB: { width: 120, height: 120, bottom: -30, left: -20 },
  avatarLarge: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  avatarLargeText: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  editProfileBtn: {
    marginTop: 4, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  editProfileBtnText: { fontSize: 13, color: '#FFF', fontWeight: '700' },
  editNameWrap: { alignItems: 'center', gap: 12, width: '80%' },
  editNameInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 16, fontWeight: '700', color: C.textDark,
    width: '100%', textAlign: 'center',
  },
  editActions: { flexDirection: 'row', gap: 12 },
  editBtn: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8 },
  editBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: SIZES.lg,
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.md,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOWS.small,
    gap: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: C.textDark, marginBottom: 4 },

  // Info row
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.purpleLight,
    alignItems: 'center', justifyContent: 'center',
  },
  infoIcon: { fontSize: 16 },
  infoLabel: { fontSize: 10, color: C.textLight, fontWeight: '600', marginBottom: 1 },
  infoValue: { fontSize: 13, color: C.textDark, fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.md,
    gap: SIZES.sm,
  },
  statCard: {
    flex: 1, borderRadius: 14, padding: SIZES.md,
    alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '700' },

  // Actions grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    borderRadius: 12, padding: SIZES.md, alignItems: 'center',
    flexDirection: 'row', gap: 8,
    minWidth: 100, flexGrow: 1,
    borderWidth: 0,
  },
  actionIcon: { fontSize: 16 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: C.purple },

  // Logout
  logoutBtn: {
    marginHorizontal: SIZES.lg,
    marginTop: SIZES.md,
    backgroundColor: C.redLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.red + '40',
    ...SHADOWS.small,
  },
  logoutText: { color: C.red, fontSize: 15, fontWeight: '700' },
});
