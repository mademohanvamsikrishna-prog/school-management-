/**
 * TeacherSidebar — full 13-item scrollable sidebar, mirroring StudentSidebar.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  segment: string;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard',     icon: '⊞',  route: '/teacher/dashboard',      segment: 'dashboard'      },
  { label: 'My Classes',    icon: '👥', route: '/teacher/classes',         segment: 'classes'        },
  { label: 'My Students',   icon: '🎓', route: '/teacher/students',        segment: 'students'       },
  { label: 'Attendance',    icon: '📊', route: '/teacher/attendance',      segment: 'attendance'     },
  { label: 'Marks / Results', icon: '🏆', route: '/teacher/marks',         segment: 'marks'          },
  { label: 'Timetable',     icon: '🗓️', route: '/teacher/timetable',       segment: 'timetable'      },
  { label: 'Assignments',   icon: '📋', route: '/teacher/tasks',           segment: 'tasks'          },
  { label: 'Notifications', icon: '🔔', route: '/teacher/notifications',   segment: 'notifications'  },
  { label: 'Messages',      icon: '💬', route: '/teacher/chat',            segment: 'chat'           },
  { label: 'Profile',       icon: '👤', route: '/teacher/profile',         segment: 'profile'        },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Settings', icon: '⚙️', route: '/teacher/profile', segment: 'settings' },
  { label: 'Help',     icon: '❓', route: '/teacher/profile', segment: 'help'     },
];

export const TeacherSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isHighlighted = (item: NavItem): boolean => {
    if (pathname === item.route) return true;
    if (pathname === '/teacher' && item.segment === 'dashboard') return true;
    return pathname.endsWith(`/${item.segment}`) || pathname.includes(`/${item.segment}/`);
  };

  const renderNavItem = (item: NavItem) => {
    const highlighted = isHighlighted(item);
    return (
      <TouchableOpacity
        key={item.label}
        style={[styles.navItem, highlighted && styles.navItemActive]}
        onPress={() => router.push(item.route as any)}
        activeOpacity={0.7}
      >
        <Text style={styles.navIcon}>{item.icon}</Text>
        <Text style={[styles.navLabel, highlighted && styles.navLabelActive]}>
          {item.label}
        </Text>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sidebar}>
      {/* Logo / Branding */}
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>△</Text>
        </View>
        <Text style={styles.brandName}>School</Text>
      </View>

      <View style={styles.divider} />

      {/* Primary navigation — scrollable */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navGroup}
      >
        {PRIMARY_NAV.map(renderNavItem)}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>MORE</Text>
        {SECONDARY_NAV.map(renderNavItem)}
        <View style={{ height: SIZES.md }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: COLORS.card,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.md,
    ...SHADOWS.small,
    zIndex: 10,
    flexDirection: 'column',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    gap: SIZES.sm,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  brandName: {
    ...FONTS.h4,
    color: COLORS.textDark,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.sm,
  },
  navGroup: {
    paddingHorizontal: SIZES.sm,
    gap: 2,
    paddingTop: SIZES.xs,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1.2,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusSm,
    gap: SIZES.sm,
  },
  navItemActive: {
    backgroundColor: '#F5F3FF',
  },
  navIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  navLabel: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  navLabelActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
