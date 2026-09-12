/**
 * ParentSidebar — left navigation panel for web/desktop (parent role).
 * Pure UI component. Uses existing router.push() calls — no new routes created.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  segment: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', icon: '⊞',  route: '/parents/dashboard', segment: 'dashboard' },
  { label: 'Children',  icon: '👨‍👩‍👧', route: '/parents/children',  segment: 'children'  },
  { label: 'Attendance',icon: '📊', route: '/parents/children',  segment: 'attendance' },
  { label: 'Results',   icon: '🏆', route: '/parents/children',  segment: 'results'   },
  { label: 'Fees',      icon: '💳', route: '/parents/fees',      segment: 'fees'      },
  { label: 'Messages',  icon: '💬', route: '/parents/chat',      segment: 'chat'      },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Settings', icon: '⚙️', route: '/parents/profile', segment: 'profile' },
  { label: 'Help',     icon: '❓', route: '/parents/profile', segment: 'help'    },
];

export const ParentSidebar: React.FC = () => {
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

      <View style={styles.navGroup}>
        {PRIMARY_NAV.map(renderNavItem)}
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.divider} />

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
    backgroundColor: '#EEF2FF',
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
});
