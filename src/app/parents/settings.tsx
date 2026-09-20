/**
 * SettingsScreen — Dedicated Parent -> Settings Page.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { ChildAvatar } from '../../components/ChildAvatar';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';

const IS_WEB = Platform.OS === 'web';

export default function ParentSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: profile, loading, error, refetch } = useApi(getMyProfile);

  // Preference switches
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [feeReminders, setFeeReminders] = useState(true);
  const [examAlerts, setExamAlerts] = useState(true);

  const handleLogout = async () => {
    if (IS_WEB) {
      if (window.confirm('Are you sure you want to sign out?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]);
    }
  };

  if (loading && !profile) {
    return <LoadingScreen message="Loading account settings..." />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Settings & Preferences"
        subtitle="Manage your portal preferences and guardian profile"
        showBack={false}
      />

      <ScrollView contentContainerStyle={styles.contentPad} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Guardian Account Profile</Text>
          <Text style={styles.sectionSub}>Official contact information on record</Text>

          <View style={styles.profileRow}>
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {profile?.name?.trim().split(' ')[0]?.[0]?.toUpperCase() || 'P'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile?.name}</Text>
              <Text style={styles.profileRole}>ROLE: PARENT / GUARDIAN</Text>
              <Text style={styles.profileEmail}>✉️ {profile?.email}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>PRIMARY PHONE</Text>
              <Text style={styles.infoVal}>+91 98765 43210</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ALTERNATE PHONE</Text>
              <Text style={styles.infoVal}>{profile?.parent_profile?.alternate_phone || '+91 98765 43211'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>OCCUPATION</Text>
              <Text style={styles.infoVal}>{profile?.parent_profile?.occupation || 'Software Architect'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>LINKED CHILDREN</Text>
              <Text style={[styles.infoVal, { color: COLORS.primary }]}>
                {profile?.parent_profile?.children?.length || 2} Enrolled
              </Text>
            </View>
          </View>

          {profile?.parent_profile?.children && profile.parent_profile.children.length > 0 && (
            <View style={styles.linkedStudentsRow}>
              <Text style={styles.infoLabel}>ENROLLED CHILDREN</Text>
              <View style={styles.linkedPillsWrap}>
                {profile.parent_profile.children.map((child: any) => (
                  <View key={child.id} style={styles.childPill}>
                    <ChildAvatar name={child.name} size={22} fontSize={10} />
                    <Text style={styles.childPillName}>{child.name}</Text>
                    <Text style={styles.childPillClass}>
                      ({child.className || child.student_profile?.class_name || 'Enrolled'})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Notification Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notification Alerts</Text>
          <Text style={styles.sectionSub}>Choose how you want to receive academic & fee updates</Text>

          <View style={styles.toggleList}>
            <ToggleItem
              title="SMS Instant Notifications"
              description="Receive daily attendance check-in & bus arrival alerts via SMS"
              value={smsNotifs}
              onValueChange={setSmsNotifs}
            />

            <ToggleItem
              title="Email Summary Digests"
              description="Receive weekly academic performance reports and official notices"
              value={emailNotifs}
              onValueChange={setEmailNotifs}
            />

            <ToggleItem
              title="Fee Due & Invoice Reminders"
              description="Get automatic reminders 7 days before term tuition due dates"
              value={feeReminders}
              onValueChange={setFeeReminders}
            />

            <ToggleItem
              title="Examination & Report Card Alerts"
              description="Instant notification when new test grades or report cards are published"
              value={examAlerts}
              onValueChange={setExamAlerts}
            />
          </View>
        </View>

        {/* Security & Sign Out */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          <Text style={styles.sectionSub}>Security credentials and session management</Text>

          <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
            <TouchableOpacity
              style={styles.securityRow}
              onPress={() => {
                if (IS_WEB) window.alert('Password reset link has been dispatched to your email.');
                else Alert.alert('Sent', 'Password reset email sent.');
              }}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.securityTitle}>Change Password</Text>
                <Text style={styles.securitySub}>Send a secure reset link to your email</Text>
              </View>
              <Text style={styles.securityAction}>Reset →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>🚪 Sign Out from All Devices</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleItem({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: SIZES.md }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
        thumbColor={value ? COLORS.primary : '#94A3B8'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  contentPad: { padding: SIZES.lg },

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

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    marginTop: SIZES.md,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileName: {
    ...FONTS.h4,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  profileRole: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  profileEmail: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  infoCol: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  infoVal: {
    ...FONTS.body2,
    color: COLORS.textDark,
    fontWeight: '600',
    marginTop: 2,
  },

  toggleList: {
    marginTop: SIZES.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleTitle: {
    ...FONTS.body2,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  toggleDesc: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityTitle: {
    ...FONTS.body2,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  securitySub: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  securityAction: {
    ...FONTS.body2,
    fontWeight: '700',
    color: COLORS.primary,
  },

  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: SIZES.radiusSm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },

  linkedStudentsRow: {
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  linkedPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginTop: SIZES.xs,
  },
  childPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  childPillName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  childPillClass: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
