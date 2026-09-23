/**
 * Admin Profile — Principal profile page.
 *
 * Shows: name, email, role, avatar, school info.
 * Actions: Logout, edit name.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';
import { api } from '../../services/api';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  red: '#EF4444', redBg: '#FEF2F2',
  green: '#10B981',
};

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIcon}><Text style={{ fontSize: 16 }}>{icon}</Text></View>
      <View style={s.infoContent}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: profile, loading } = useApi(getMyProfile);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    const doLogout = async () => { await logout(); router.replace('/'); };
    if (Platform.OS === 'web') {
      if (window.confirm('Logout from the admin portal?')) doLogout();
    } else {
      Alert.alert('Logout', 'Exit the admin portal?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.patch('/teacher/me/profile', { name: name.trim() });
      setEditMode(false);
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const displayName = profile?.name ?? user?.name ?? 'Admin';
  const displayEmail = profile?.email ?? user?.email ?? '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>ADMIN / PROFILE</Text>
          <Text style={s.title}>My Profile</Text>
        </View>
        <TouchableOpacity style={s.editBtn} onPress={() => { setEditMode(!editMode); setName(displayName); }}>
          <Text style={{ color: P.indigo, fontWeight: '700', fontSize: 13 }}>
            {editMode ? '✕ Cancel' : '✏️ Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={P.indigo} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Avatar Card */}
          <View style={s.avatarCard}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarText}>{displayName[0]?.toUpperCase()}</Text>
            </View>
            {editMode ? (
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Full Name</Text>
                <TextInput
                  style={s.fieldInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={P.textMuted}
                />
                <TouchableOpacity style={s.saveNameBtn} onPress={handleSaveName} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.saveNameText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={s.displayName}>{displayName}</Text>
                <View style={s.rolePill}><Text style={s.roleText}>PRINCIPAL · ADMINISTRATOR</Text></View>
                <Text style={s.displayEmail}>{displayEmail}</Text>
              </View>
            )}
          </View>

          {/* School Info */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Account Details</Text>
            <InfoRow label="Full Name" value={displayName} icon="👤" />
            <InfoRow label="Email Address" value={displayEmail} icon="📧" />
            <InfoRow label="Role" value="Principal / Administrator" icon="🔑" />
            <InfoRow label="Access Level" value="Global Root Access (All Modules)" icon="🛡️" />
            {profile?.teacher_profile?.department && (
              <InfoRow label="Department" value={profile.teacher_profile.department} icon="🏢" />
            )}
          </View>

          {/* Permissions */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Permissions</Text>
            {[
              { label: 'User Management', icon: '👥', granted: true },
              { label: 'Class Management', icon: '🏫', granted: true },
              { label: 'Finance Oversight', icon: '💳', granted: true },
              { label: 'Academic Records', icon: '📊', granted: true },
              { label: 'Notification Broadcast', icon: '📢', granted: true },
              { label: 'System Configuration', icon: '⚙️', granted: true },
            ].map(perm => (
              <View key={perm.label} style={s.permRow}>
                <Text style={{ fontSize: 16 }}>{perm.icon}</Text>
                <Text style={s.permLabel}>{perm.label}</Text>
                <View style={[s.permBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803D' }}>✓ Granted</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={{ fontSize: 18 }}>🚪</Text>
            <Text style={s.logoutText}>Logout from Admin Portal</Text>
          </TouchableOpacity>

          <View style={{ height: 48 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  breadcrumb: { fontSize: 10, fontWeight: '700', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '800', color: P.text },
  editBtn: { backgroundColor: P.indigoBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#C7D2FE' },
  scroll: { padding: 20, gap: 16 },
  avatarCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, backgroundColor: P.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: P.border, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: P.indigo, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 30, fontWeight: '800' },
  displayName: { fontSize: 20, fontWeight: '800', color: P.text, marginBottom: 6 },
  displayEmail: { fontSize: 13, color: P.textSec, marginTop: 4 },
  rolePill: { alignSelf: 'flex-start', backgroundColor: P.indigoBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 10, fontWeight: '800', color: P.indigo },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: P.textSec, marginBottom: 6, marginTop: 4 },
  fieldInput: { borderWidth: 1, borderColor: P.border, borderRadius: 10, padding: 10, fontSize: 14, color: P.text, backgroundColor: P.bg, marginBottom: 10 },
  saveNameBtn: { backgroundColor: P.indigo, padding: 10, borderRadius: 10, alignItems: 'center' },
  saveNameText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  section: { backgroundColor: P.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: P.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: P.text, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  infoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: P.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: P.border },
  infoContent: {},
  infoLabel: { fontSize: 11, fontWeight: '600', color: P.textMuted, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: P.text },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  permLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: P.text },
  permBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: P.redBg, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { fontSize: 15, fontWeight: '700', color: P.red },
});
