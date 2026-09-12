/**
 * StudentSidebar — left navigation panel rendered ONLY on web/desktop.
 *
 * Pure UI component. Uses existing router.push() calls — no new routes created.
 * All nav targets are existing pages in the student section.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** The pathname segment used to detect the active state (e.g. 'dashboard', 'academics'). */
  segment: string;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard',  icon: '⊞',  route: '/students/dashboard', segment: 'dashboard'  },
  { label: 'Academics',  icon: '📚', route: '/students/academics',  segment: 'academics'  },
  { label: 'Attendance', icon: '📊', route: '/students/academics',  segment: 'attendance' },
  { label: 'Results',    icon: '🏆', route: '/students/academics',  segment: 'results'    },
  { label: 'Events',     icon: '📅', route: '/students/events',     segment: 'events'     },
  { label: 'Messages',   icon: '💬', route: '/students/chat',       segment: 'chat'       },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Settings', icon: '⚙️', route: '/students/profile', segment: 'profile' },
  { label: 'Help',     icon: '❓', route: '/students/profile', segment: 'help'    },
];

interface StudentSidebarProps {
  userName?: string;
  avatarUrl?: string;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = () => {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * A nav item is highlighted when the current pathname ends with its route segment.
   * e.g. /students/academics → segment 'academics' → highlighted.
   * Attendance and Results both live on /students/academics so they share the highlight.
   */
  const isHighlighted = (item: NavItem): boolean => {
    // exact match covers dashboard
    if (pathname === item.route) return true;
    // segment match: /students/academics → ends with 'academics'
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

      {/* Primary navigation */}
      <View style={styles.navGroup}>
        {PRIMARY_NAV.map(renderNavItem)}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Divider */}
      <View style={styles.divider} />

      {/* Secondary navigation (Settings + Help) */}
      <View style={[styles.navGroup, { marginBottom: SIZES.md }]}>
        {SECONDARY_NAV.map((item) => {
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
            </TouchableOpacity>
          );
        })}
      </View>
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
    marginTop: SIZES.xs,
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
