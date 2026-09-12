/**
 * StudentProfile — full profile page.
 * Shows all student details from /profile/me.
 * Editable fields: phone number (PATCH /profile/me when backend supports it).
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile } from '../../services/profile';

const IS_WEB = Platform.OS === 'web';

export default function ProfileScreen() {
  const { data: profile, loading } = useApi(getMyProfile);
  const { logout, user } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState('');

  const handleLogout = async () => {
    if (IS_WEB) {
      if (window.confirm('Are you sure you want to logout?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]);
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sp = profile.student_profile;
  const initial = profile.name?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Header card ── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.heroName}>{profile.name}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>{profile.role.toUpperCase()}</Text>
          </View>
          {sp && (
            <Text style={styles.heroSub}>
              {sp.class_name ?? 'Class'} {sp.section ? `· Section ${sp.section}` : ''} {sp.roll_number ? `· Roll ${sp.roll_number}` : ''}
            </Text>
          )}
        </View>

        {/* ── Basic Info ── */}
        <SectionCard title="Basic Information" icon="📋">
          <InfoRow label="Full Name"         value={profile.name} />
          <InfoRow label="Email"             value={profile.email} />
          {sp && <>
            <InfoRow label="Admission No."  value={sp.admission_number} />
            <InfoRow label="Roll Number"    value={sp.roll_number} />
            <InfoRow label="Section"        value={sp.section} />
            <InfoRow label="Class"          value={sp.class_name ?? '—'} />
          </>}
        </SectionCard>

        {/* ── Contact Info ── */}
        <SectionCard title="Contact Information" icon="📞">
          {editMode ? (
            <View style={styles.editRow}>
              <Text style={styles.editLabel}>Phone Number</Text>
              <TextInput
                style={styles.editInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  // In a real implementation this would PATCH /profile/me
                  setEditMode(false);
                }}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditMode(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <InfoRow
              label="Phone"
              value={phone || 'Not provided'}
              action={
                <TouchableOpacity onPress={() => setEditMode(true)}>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              }
            />
          )}
          <InfoRow label="Email" value={profile.email} />
        </SectionCard>

        {/* ── Account Info ── */}
        <SectionCard title="Account" icon="🔐">
          <InfoRow label="Account Status" value={profile.is_active ? '✅ Active' : '❌ Inactive'} />
          <InfoRow label="Role"           value={profile.role} />
          <InfoRow label="User ID"        value={profile.id.slice(0, 8) + '...'} />
        </SectionCard>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

function InfoRow({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoRight}>
        <Text style={styles.infoValue} numberOfLines={2}>{value || '—'}</Text>
        {action}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.sm },
  loadingText: { ...FONTS.body2, color: COLORS.textSecondary },
  container: {
    padding: IS_WEB ? SIZES.xl : SIZES.md,
    maxWidth: IS_WEB ? 720 : undefined,
    alignSelf: IS_WEB ? 'center' : undefined,
    width: '100%',
    paddingBottom: SIZES.xxl,
  },
  // Hero card
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.xl,
    alignItems: 'center',
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitial: { fontSize: 30, fontWeight: '700', color: '#fff' },
  heroName: { ...FONTS.h3, color: '#fff', fontWeight: '700', marginBottom: 6 },
  roleChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: SIZES.radiusRound,
    marginBottom: 6,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  heroSub: { ...FONTS.body2, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4 },
  // Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.sm },
  cardIcon: { fontSize: 18 },
  cardTitle: { ...FONTS.h4, color: COLORS.textDark },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SIZES.sm },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: { ...FONTS.body2, color: COLORS.textSecondary, flex: 1 },
  infoRight: { flex: 1.5, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: SIZES.sm },
  infoValue: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500', textAlign: 'right', flex: 1 },
  editLink: { ...FONTS.body2, color: COLORS.primary, fontWeight: '600' },
  // Edit mode
  editRow: { gap: SIZES.sm, paddingVertical: SIZES.sm },
  editLabel: { ...FONTS.body2, color: COLORS.textSecondary },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: '#F8FAFC',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelText: { color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SIZES.xs },
  // Logout
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '700' },
});
