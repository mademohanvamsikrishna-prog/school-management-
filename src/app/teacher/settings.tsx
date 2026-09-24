/**
 * TeacherSettingsScreen — App preferences, account settings.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Switch, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SIZES, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleLight: '#F5F3FF',
  green: '#10B981', red: '#EF4444', redLight: '#FEE2E2',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

function SettingRow({ icon, label, description, right, onPress, danger }: {
  icon: string; label: string; description?: string; right?: React.ReactNode;
  onPress?: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={sStyles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={[sStyles.settingIcon, { backgroundColor: danger ? C.redLight : C.purpleLight }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[sStyles.settingLabel, danger && { color: C.red }]}>{label}</Text>
        {description && <Text style={sStyles.settingDesc}>{description}</Text>}
      </View>
      {right ?? (onPress ? <Text style={sStyles.chevron}>›</Text> : null)}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={sStyles.sectionHeader}>{title}</Text>
  );
}

export default function TeacherSettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [emailNotif, setEmailNotif]     = useState(true);
  const [smsNotif, setSmsNotif]         = useState(false);
  const [darkMode, setDarkMode]         = useState(false);
  const [autoSave, setAutoSave]         = useState(true);

  const handleLogout = async () => {
    const confirmed = IS_WEB
      ? window.confirm('Are you sure you want to logout?')
      : await new Promise<boolean>(res =>
          Alert.alert('Logout', 'Are you sure?', [
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
    <SafeAreaView style={sStyles.safeArea}>
      <View style={sStyles.pageHeader}>
        <Text style={sStyles.pageTitle}>Settings</Text>
        <Text style={sStyles.pageSub}>Manage your preferences</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sStyles.scroll}>
        {/* Account */}
        <SectionHeader title="ACCOUNT" />
        <View style={sStyles.card}>
          <SettingRow
            icon="👤" label="My Profile"
            description="View and edit your profile information"
            onPress={() => router.push('/teacher/profile' as any)}
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="🔑" label="Change Password"
            description="Update your account password"
            onPress={() => {}}
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="📧" label="Email Address"
            description="Manage your email preferences"
            onPress={() => {}}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={sStyles.card}>
          <SettingRow
            icon="🔔" label="Push Notifications"
            description="Receive push notifications"
            right={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: C.border, true: C.purple }}
                thumbColor="#FFF"
              />
            }
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="📧" label="Email Notifications"
            description="Receive updates via email"
            right={
              <Switch
                value={emailNotif}
                onValueChange={setEmailNotif}
                trackColor={{ false: C.border, true: C.purple }}
                thumbColor="#FFF"
              />
            }
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="📱" label="SMS Notifications"
            description="Receive SMS alerts"
            right={
              <Switch
                value={smsNotif}
                onValueChange={setSmsNotif}
                trackColor={{ false: C.border, true: C.purple }}
                thumbColor="#FFF"
              />
            }
          />
        </View>

        {/* Appearance */}
        <SectionHeader title="APPEARANCE" />
        <View style={sStyles.card}>
          <SettingRow
            icon="🌙" label="Dark Mode"
            description="Switch to dark theme"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: C.border, true: C.purple }}
                thumbColor="#FFF"
              />
            }
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="📐" label="Language"
            description="English (default)"
            onPress={() => {}}
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="🔤" label="Font Size"
            description="Medium (default)"
            onPress={() => {}}
          />
        </View>

        {/* Data & Privacy */}
        <SectionHeader title="DATA & PRIVACY" />
        <View style={sStyles.card}>
          <SettingRow
            icon="💾" label="Auto Save"
            description="Automatically save form inputs"
            right={
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                trackColor={{ false: C.border, true: C.purple }}
                thumbColor="#FFF"
              />
            }
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="📊" label="Data Export"
            description="Export your class data"
            onPress={() => {}}
          />
          <View style={sStyles.divider} />
          <SettingRow
            icon="🔒" label="Privacy Policy"
            description="View our privacy policy"
            onPress={() => {}}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="ACCOUNT ACTIONS" />
        <View style={sStyles.card}>
          <SettingRow
            icon="↪" label="Logout"
            description="Sign out of your account"
            danger
            onPress={handleLogout}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const sStyles = StyleSheet.create({
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
  scroll: { padding: SIZES.lg, gap: SIZES.sm },
  sectionHeader: {
    fontSize: 10, fontWeight: '700', color: C.textLight,
    letterSpacing: 1.2, marginBottom: 8, marginTop: 4,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    ...SHADOWS.small, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingVertical: 12,
    gap: SIZES.sm,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, fontWeight: '600', color: C.textDark },
  settingDesc: { fontSize: 11, color: C.textSub, marginTop: 1 },
  chevron: { fontSize: 18, color: C.textLight, fontWeight: '700' },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: SIZES.md },
});
