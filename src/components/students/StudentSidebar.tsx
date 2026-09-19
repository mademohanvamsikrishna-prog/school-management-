/**
 * StudentSidebar — left navigation panel rendered ONLY on web/desktop.
 *
 * Pure UI component. Uses existing router.push() calls.
 * Expanded to the full 17-item student navigation.
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
  { label: 'Dashboard',       icon: '⊞',  route: '/students/dashboard',       segment: 'dashboard'       },
  { label: 'Profile',         icon: '👤', route: '/students/profile',          segment: 'profile'         },
  { label: 'Attendance',      icon: '📊', route: '/students/attendance',       segment: 'attendance'      },
  { label: 'Timetable',       icon: '🗓️', route: '/students/timetable',        segment: 'timetable'       },
  { label: 'Homework',        icon: '📝', route: '/students/homework',         segment: 'homework'        },
  { label: 'Assignments',     icon: '📋', route: '/students/assignments',      segment: 'assignments'     },
  { label: 'Study Materials', icon: '📂', route: '/students/study-materials',  segment: 'study-materials' },
  { label: 'Online Classes',  icon: '🎥', route: '/students/online-classes',   segment: 'online-classes'  },
  { label: 'Exams',           icon: '✍️', route: '/students/exams',            segment: 'exams'           },
  { label: 'Results',         icon: '🏆', route: '/students/results',          segment: 'results'         },
  { label: 'Fees',            icon: '💳', route: '/students/fees',             segment: 'fees'            },
  { label: 'Library',         icon: '📚', route: '/students/library',          segment: 'library'         },
  { label: 'Transport',       icon: '🚌', route: '/students/transport',        segment: 'transport'       },
  { label: 'Notifications',   icon: '🔔', route: '/students/notifications',    segment: 'notifications'   },
  { label: 'Leave Requests',  icon: '🗂️', route: '/students/leave',            segment: 'leave'           },
  { label: 'Certificates',    icon: '🎖️', route: '/students/certificates',     segment: 'certificates'    },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Events',    icon: '📅', route: '/students/events',   segment: 'events'   },
  { label: 'Messages',  icon: '💬', route: '/students/chat',     segment: 'chat'     },
  { label: 'Settings',  icon: '⚙️', route: '/students/profile',  segment: 'settings' },
];

interface StudentSidebarProps {
  userName?: string;
  avatarUrl?: string;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isHighlighted = (item: NavItem): boolean => {
    if (pathname === item.route) return true;
    return pathname.endsWith(item.segment);
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

      {/* Divider */}
      <View style={styles.divider} />

      {/* Primary navigation — scrollable */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navGroup}
      >
        {PRIMARY_NAV.map(renderNavItem)}

        {/* Secondary nav section */}
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: COLORS.white,
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
    backgroundColor: '#EEF2FF', // indigo-50
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
    color: COLORS.primary,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusRound,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
