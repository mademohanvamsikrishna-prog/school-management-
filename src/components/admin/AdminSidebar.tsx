import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const IS_WEB = Platform.OS === 'web';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const sections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', icon: '⊞', route: '/admin/dashboard' },
      ],
    },
    {
      title: 'ACADEMIC MANAGEMENT',
      items: [
        { label: 'Students', icon: '👥', route: '/admin/students' },
        { label: 'Teachers', icon: '👨‍🏫', route: '/admin/teachers' },
        { label: 'Users', icon: '👤', route: '/admin/users' },
        { label: 'Classes', icon: '🏫', route: '/admin/classes' },
        { label: 'Subjects', icon: '📖', route: '/admin/subjects' },
        { label: 'Timetable', icon: '📅', route: '/admin/timetable' },
        { label: 'Attendance', icon: '📊', route: '/admin/attendance' },
        { label: 'Exams & Results', icon: '📈', route: '/admin/exams' },
        { label: 'Assignments', icon: '📝', route: '/admin/assignments' },
        { label: 'Academic Calendar', icon: '🗓️', route: '/admin/calendar' },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { label: 'Admissions', icon: '👤⁺', route: '/admin/admissions' },
        { label: 'Fee Management', icon: '₹', route: '/admin/fees' },
        { label: 'Staff Management', icon: '👥', route: '/admin/staff' },
        { label: 'Events & Announcements', icon: '📢', route: '/admin/events' },
        { label: 'Reports & Analytics', icon: '📈', route: '/admin/analytics' },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { label: 'Messages', icon: '💬', route: '/admin/messages' },
        { label: 'Notifications', icon: '🔔', route: '/admin/notifications', badge: 3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Profile', icon: '👤', route: '/admin/profile' },
        { label: 'Settings', icon: '⚙️', route: '/admin/settings' },
        { label: 'Help & Support', icon: '❓', route: '/admin/help' },
      ],
    },
  ];

  // Strictly ONE active navigation item based on exact route matching
  const isHighlighted = (item: NavItem): boolean => {
    if (item.route === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname === item.route;
  };

  const handleLogout = async () => {
    if (IS_WEB) {
      if (window.confirm('Logout from the Principal Admin Portal?')) {
        await logout();
        router.replace('/');
      }
    } else {
      await logout();
      router.replace('/');
    }
  };

  return (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>🎓</Text>
        </View>
        <View>
          <Text style={styles.brandName}>School</Text>
          <Text style={styles.brandSub}>Management System</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Navigation Scroll */}
      <ScrollView
        style={styles.navScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navScrollContent}
      >
        {sections.map((sec, secIdx) => (
          <View key={sec.title} style={[styles.sectionGroup, secIdx > 0 && { marginTop: 14 }]}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.itemsList}>
              {sec.items.map((item) => {
                const active = isHighlighted(item);
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.navItem, active && styles.navItemActive]}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.navIcon, active && styles.navIconActive]}>
                      {item.icon}
                    </Text>
                    <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
                      {item.label}
                    </Text>
                    {item.badge !== undefined && item.badge > 0 && (
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout button at bottom of system */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: '#F3F7FF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingTop: 18,
    flexDirection: 'column',
    height: '100%',
    zIndex: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 12,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 20,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  brandSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  navScroll: {
    flex: 1,
  },
  navScrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  sectionGroup: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  itemsList: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7.5,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
  },
  navItemActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  navIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
    color: '#64748B',
    fontWeight: '600',
  },
  navIconActive: {
    color: '#FFFFFF',
  },
  navLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
    marginTop: 10,
  },
  logoutIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
    color: '#EF4444',
  },
  logoutLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EF4444',
  },
});
