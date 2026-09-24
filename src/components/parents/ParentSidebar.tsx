import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useParentData } from '../../context/ParentDataContext';

const IS_WEB = Platform.OS === 'web';
const stayConnectedImg = require('../../../assets/images/stay-connected-family.png');

interface NavItem {
  label: string;
  icon: string;
  route: string;
  segment: string;
  badge?: number;
}

const OTHER_NAV: NavItem[] = [
  { label: 'Settings', icon: '⚙️', route: '/parents/settings', segment: 'settings' },
];

function FamilyIllustrationSmall() {
  return (
    <Image
      source={stayConnectedImg}
      style={styles.stayConnectedImg}
      resizeMode="contain"
      accessibilityLabel="Father and daughter studying together"
    />
  );
}

export const ParentSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadMessagesCount, unreadAnnouncementsCount, pendingHomeworkCount } = useParentData();

  const primaryNav: NavItem[] = [
    { label: 'Dashboard',     icon: '⊞',  route: '/parents/dashboard',     segment: 'dashboard' },
    { label: 'Attendance',    icon: '📊', route: '/parents/attendance',    segment: 'attendance'},
    { label: 'Results',       icon: '🏆', route: '/parents/results',       segment: 'results'   },
    { label: 'Fees',          icon: '💳', route: '/parents/fees',          segment: 'fees'      },
    { label: 'Messages',      icon: '💬', route: '/parents/messages',      segment: 'messages', badge: unreadMessagesCount },
    { label: 'Timetable',     icon: '📅', route: '/parents/timetable',     segment: 'timetable' },
    { label: 'Homework',      icon: '📖', route: '/parents/homework',      segment: 'homework',  badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined },
    { label: 'Announcements', icon: '📢', route: '/parents/announcements',  segment: 'announcements', badge: unreadAnnouncementsCount },
  ];

  const isHighlighted = (item: NavItem): boolean => {
    if (pathname === item.route) return true;
    if (pathname === '/parents' && item.segment === 'dashboard') return true;
    if (item.segment === 'dashboard' && pathname === '/parents/dashboard') return true;
    if (item.segment === 'messages' && (pathname === '/parents/messages' || pathname === '/parents/chat')) return true;
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
        <Text style={[styles.navIcon, highlighted && styles.navIconActive]}>{item.icon}</Text>
        <Text style={[styles.navLabel, highlighted && styles.navLabelActive]}>
          {item.label}
        </Text>
        {item.badge !== undefined && item.badge > 0 && (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sidebar}>
      {/* Top Logo / Brand Header */}
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>▲</Text>
        </View>
        <Text style={styles.brandName}>School</Text>
      </View>

      <View style={styles.divider} />

      {/* Main Nav Items */}
      <View style={styles.navGroup}>
        {primaryNav.map(renderNavItem)}
      </View>

      {/* Section Header: Other */}
      <View style={styles.sectionHeaderWrap}>
        <Text style={styles.sectionHeaderText}>Other</Text>
      </View>

      <View style={styles.navGroup}>
        {OTHER_NAV.map(renderNavItem)}
      </View>

      <View style={{ flex: 1, minHeight: 16 }} />

      {/* Stay Connected Bottom Promo Card */}
      <View style={styles.stayConnectedCard}>
        <FamilyIllustrationSmall />
        <Text style={styles.stayConnectedTitle}>Stay Connected</Text>
        <Text style={styles.stayConnectedSub}>Support your child's learning journey</Text>
        <TouchableOpacity
          style={styles.stayConnectedBtn}
          onPress={() => router.push('/parents/messages' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.stayConnectedArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 236,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EDF2F7',
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.md,
    ...SHADOWS.small,
    zIndex: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  brandName: {
    ...FONTS.h4,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: SIZES.md,
    marginBottom: SIZES.xs,
  },
  navGroup: {
    paddingHorizontal: 12,
    gap: 3,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
  },
  navItemActive: {
    backgroundColor: '#EEF2FF',
  },
  navIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
    color: '#64748B',
  },
  navIconActive: {
    color: '#4F46E5',
  },
  navLabel: {
    ...FONTS.body2,
    color: '#475569',
    fontWeight: '600',
    fontSize: 13.5,
    flex: 1,
  },
  navLabelActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeaderWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Stay Connected card
  stayConnectedCard: {
    marginHorizontal: 14,
    marginTop: 'auto',
    backgroundColor: '#DFEEFD',
    ...(IS_WEB
      ? {
          backgroundImage: 'linear-gradient(135deg, #E2EFFD 0%, #D6EAFD 40%, #CEE4FD 75%, #DCEEFE 100%)',
        }
      : {}),
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7E2FE',
    overflow: 'hidden',
  },
  stayConnectedImg: {
    width: '100%',
    height: 78,
    marginBottom: 6,
    borderRadius: 8,
    ...(IS_WEB
      ? {
          objectFit: 'contain' as any,
        }
      : {}),
  },
  stayConnectedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  stayConnectedSub: {
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
  },
  stayConnectedBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  stayConnectedArrow: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
});
