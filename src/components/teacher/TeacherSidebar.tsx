/**
 * TeacherSidebar — Pixel-perfect redesign matching the reference screenshot.
 * Blue-purple gradient branding, active states, section labels, and all nav items.
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
  border: '#E8ECF4',
  purple: '#7C3AED',
  purpleDark: '#5B21B6',
  purpleLight: '#F5F3FF',
  indigo: '#4F46E5',
  activeText: '#7C3AED',
  navText: '#64748B',
  navTextHover: '#334155',
  sectionLabel: '#94A3B8',
  textDark: '#0F172A',
  brandBg: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
  logoBg: '#7C3AED',
};

interface NavItem {
  label: string;
  icon: string;
  route: string;
  segment: string;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard',      icon: '⊞',  route: '/teacher/dashboard',      segment: 'dashboard'      },
  { label: 'My Classes',     icon: '👥', route: '/teacher/classes',         segment: 'classes'        },
  { label: 'My Students',    icon: '🎓', route: '/teacher/students',        segment: 'students'       },
  { label: 'Attendance',     icon: '📊', route: '/teacher/attendance',      segment: 'attendance'     },
  { label: 'Marks / Results',icon: '🏆', route: '/teacher/marks',           segment: 'marks'          },
  { label: 'Timetable',      icon: '🗓️', route: '/teacher/timetable',       segment: 'timetable'      },
  { label: 'Assignments',    icon: '📋', route: '/teacher/assignments',     segment: 'assignments'    },
  { label: 'Notifications',  icon: '🔔', route: '/teacher/notifications',   segment: 'notifications'  },
  { label: 'Messages',       icon: '💬', route: '/teacher/chat',            segment: 'chat'           },
];

const PERSONAL_NAV: NavItem[] = [
  { label: 'Profile', icon: '👤', route: '/teacher/profile',  segment: 'profile' },
];

const MORE_NAV: NavItem[] = [
  { label: 'Settings',      icon: '⚙️', route: '/teacher/settings', segment: 'settings' },
  { label: 'Help & Support', icon: '❓', route: '/teacher/help',     segment: 'help'     },
];

export const TeacherSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'Teacher';
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'T';

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

  const renderItem = (item: NavItem, key: string) => {
    const active = isActive(item);
    return (
      <TouchableOpacity
        key={key}
        style={[sStyles.navItem, active && sStyles.navItemActive]}
        onPress={() => router.push(item.route as any)}
        activeOpacity={0.75}
      >
        <View style={[sStyles.iconWrap, active && sStyles.iconWrapActive]}>
          <Text style={sStyles.navIcon}>{item.icon}</Text>
        </View>
        <Text style={[sStyles.navLabel, active && sStyles.navLabelActive]} numberOfLines={1}>
          {item.label}
        </Text>
        {item.badge && (
          <View style={sStyles.badge}>
            <Text style={sStyles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {active && <View style={sStyles.activeBar} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={sStyles.sidebar}>
      {/* Branding */}
      <View style={sStyles.brand}>
        <View style={sStyles.logoMark}>
          <Text style={sStyles.logoMarkText}>🎓</Text>
        </View>
        <View>
          <Text style={sStyles.brandName}>School</Text>
          <Text style={sStyles.brandSub}>Management System</Text>
        </View>
      </View>

      <View style={sStyles.divider} />

      {/* Scrollable nav */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sStyles.scrollContent}
      >
        {/* MAIN section */}
        <Text style={sStyles.sectionLabel}>MAIN</Text>
        {PRIMARY_NAV.map(item => renderItem(item, `main-${item.segment}`))}

        <View style={sStyles.divider2} />

        {/* PERSONAL section */}
        <Text style={sStyles.sectionLabel}>PERSONAL</Text>
        {PERSONAL_NAV.map(item => renderItem(item, `personal-${item.segment}`))}

        <View style={sStyles.divider2} />

        {/* MORE section */}
        <Text style={sStyles.sectionLabel}>MORE</Text>
        {MORE_NAV.map(item => renderItem(item, `more-${item.segment}`))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* User footer */}
      <View style={sStyles.divider} />
      <View style={sStyles.userFooter}>
        <View style={sStyles.avatarSmall}>
          <Text style={sStyles.avatarSmallText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={sStyles.userName} numberOfLines={1}>{user?.name ?? 'Teacher'}</Text>
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
    width: 230,
    backgroundColor: C.bg,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingTop: SIZES.lg,
    paddingBottom: 0,
    flexDirection: 'column',
    ...SHADOWS.small,
    zIndex: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    gap: 10,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { fontSize: 18 },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: C.textDark,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 9,
    color: C.sectionLabel,
    fontWeight: '500',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: SIZES.md,
    marginVertical: SIZES.sm,
  },
  divider2: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: SIZES.sm,
    marginVertical: SIZES.sm,
  },
  scrollContent: {
    paddingHorizontal: SIZES.sm,
    paddingTop: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.sectionLabel,
    letterSpacing: 1.4,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
    marginTop: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SIZES.sm,
    borderRadius: 10,
    marginBottom: 1,
    gap: SIZES.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  navItemActive: {
    backgroundColor: C.purpleLight,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: C.purple + '18',
  },
  navIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: C.navText,
    flex: 1,
  },
  navLabelActive: {
    color: C.activeText,
    fontWeight: '700',
  },
  activeBar: {
    position: 'absolute',
    right: 0,
    top: '20%',
    bottom: '20%',
    width: 3,
    borderRadius: 3,
    backgroundColor: C.purple,
  },
  badge: {
    backgroundColor: C.purple,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  // User footer
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: 10,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  userName: { fontSize: 13, fontWeight: '700', color: C.textDark },
  userRole: { fontSize: 10, color: C.sectionLabel, fontWeight: '500' },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutIcon: { fontSize: 14, color: '#EF4444' },
});
