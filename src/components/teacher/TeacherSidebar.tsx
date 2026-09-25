/**
 * TeacherSidebar — Redesigned sidebar matching Section 2 of prompt specifications.
 * Fixed width (~250px), purple active indicators, notification badge '3', and bottom motivational card.
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SIZES, FONTS, SHADOWS } from '../../constants/theme';

const C = {
  bg: '#FFFFFF',
  border: '#E2E8F0',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  purpleActiveBg: '#EDE9FE',
  activeText: '#7C3AED',
  navText: '#475569',
  sectionLabel: '#94A3B8',
  textDark: '#0F172A',
  cardMotivateBg: '#F5F3FF',
  badgeRed: '#EF4444',
};

interface NavItem {
  label: string;
  icon: string;
  route: string;
  segment: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      icon: '⊞',  route: '/teacher/dashboard',     segment: 'dashboard' },
  { label: 'My Classes',     icon: '👥', route: '/teacher/classes',        segment: 'classes' },
  { label: 'My Students',    icon: '🎓', route: '/teacher/students',       segment: 'students' },
  { label: 'Attendance',     icon: '📊', route: '/teacher/attendance',     segment: 'attendance' },
  { label: 'Marks / Results',icon: '🏆', route: '/teacher/marks',          segment: 'marks' },
  { label: 'Timetable',      icon: '🗓️', route: '/teacher/timetable',      segment: 'timetable' },
  { label: 'Assignments',    icon: '📋', route: '/teacher/assignments',    segment: 'assignments' },
  { label: 'Notifications',  icon: '🔔', route: '/teacher/notifications',  segment: 'notifications', badge: '3' },
  { label: 'Messages',       icon: '💬', route: '/teacher/chat',           segment: 'chat' },
  { label: 'Profile',        icon: '👤', route: '/teacher/profile',        segment: 'profile' },
];

export const TeacherSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'TS';

  const isActive = (item: NavItem): boolean => {
    if (pathname === item.route) return true;
    if (pathname === '/teacher' && item.segment === 'dashboard') return true;
    return pathname.endsWith(`/${item.segment}`) || pathname.includes(`/${item.segment}/`);
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        await logout();
        router.replace('/');
      }
    }
  };

  return (
    <View style={sStyles.sidebar}>
      {/* Branding */}
      <View style={sStyles.brand}>
        <View style={sStyles.logoMark}>
          <Text style={sStyles.logoMarkText}>🏫</Text>
        </View>
        <View>
          <Text style={sStyles.brandName}>Smart School</Text>
          <Text style={sStyles.brandSub}>Teacher Portal</Text>
        </View>
      </View>

      <View style={sStyles.divider} />

      {/* Navigation List */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sStyles.scrollContent}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <TouchableOpacity
              key={item.segment}
              style={[sStyles.navItem, active && sStyles.navItemActive]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={[sStyles.iconWrap, active && sStyles.iconWrapActive]}>
                <Text style={[sStyles.navIcon, active && { color: C.purple }]}>{item.icon}</Text>
              </View>
              <Text style={[sStyles.navLabel, active && sStyles.navLabelActive]} numberOfLines={1}>
                {item.label}
              </Text>
              {item.badge && (
                <View style={sStyles.badge}>
                  <Text style={sStyles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Motivational Card at Bottom of Sidebar */}
        <View style={sStyles.motivateCard}>
          <View style={sStyles.motivateIconWrap}>
            <Text style={{ fontSize: 20 }}>🌟</Text>
          </View>
          <Text style={sStyles.motivateText}>
            {"\"Make learning\nbrighter, one\nstudent at a time!\""}
          </Text>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* User Footer */}
      <View style={sStyles.divider} />
      <View style={sStyles.userFooter}>
        <View style={sStyles.avatarSmall}>
          <Text style={sStyles.avatarSmallText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={sStyles.userName} numberOfLines={1}>{user?.name ?? 'Ms. Sreeja'}</Text>
          <Text style={sStyles.userRole}>Teacher</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={sStyles.logoutBtn}>
          <Text style={sStyles.logoutIcon}>↪</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const sStyles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: C.bg,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingTop: SIZES.lg,
    flexDirection: 'column',
    ...SHADOWS.small,
    zIndex: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.purple,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  logoMarkText: { fontSize: 20 },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textDark,
    letterSpacing: -0.2,
  },
  brandSub: {
    fontSize: 11,
    color: C.purple,
    fontWeight: '700',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: C.purpleActiveBg,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#DDD6FE',
  },
  navIcon: {
    fontSize: 16,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: C.navText,
    flex: 1,
  },
  navLabelActive: {
    color: C.purple,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: C.badgeRed,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  motivateCard: {
    backgroundColor: C.cardMotivateBg,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignItems: 'flex-start',
  },
  motivateIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  motivateText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.purple,
    lineHeight: 17,
  },

  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  userName: { fontSize: 14, fontWeight: '700', color: C.textDark },
  userRole: { fontSize: 11, color: C.sectionLabel, fontWeight: '600' },
  logoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  logoutIcon: { fontSize: 14, color: '#EF4444' },
});
