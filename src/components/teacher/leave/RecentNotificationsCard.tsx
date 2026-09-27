import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export interface LeaveNotificationItem {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  type: 'approved' | 'rejected' | 'pending' | 'submitted';
  date?: string;
}

interface RecentNotificationsCardProps {
  notifications: LeaveNotificationItem[];
  onViewAllClick?: () => void;
  onItemClick?: (item: LeaveNotificationItem) => void;
}

export const RecentNotificationsCard: React.FC<RecentNotificationsCardProps> = ({
  notifications,
  onViewAllClick,
  onItemClick,
}) => {
  const getTheme = (type: string) => {
    switch (type) {
      case 'approved':
        return {
          bg: '#F0FDF4',
          border: '#DCFCE7',
          iconBg: '#DCFCE7',
          iconColor: '#16A34A',
          icon: '✓',
          badgeText: 'Approved',
          badgeBg: '#DCFCE7',
          badgeColor: '#15803D',
        };
      case 'rejected':
        return {
          bg: '#FEF2F2',
          border: '#FEE2E2',
          iconBg: '#FEE2E2',
          iconColor: '#DC2626',
          icon: '✕',
          badgeText: 'Rejected',
          badgeBg: '#FEE2E2',
          badgeColor: '#B91C1C',
        };
      case 'submitted':
      case 'pending':
      default:
        return {
          bg: '#F5F3FF',
          border: '#EDE9FE',
          iconBg: '#EDE9FE',
          iconColor: '#7C3AED',
          icon: '⏳',
          badgeText: 'Pending',
          badgeBg: '#EDE9FE',
          badgeColor: '#6D28D9',
        };
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Recent Notifications</Text>
            <Text style={styles.headerSubtitle}>Latest approval updates</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onViewAllClick} activeOpacity={0.7} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Notifications List */}
      <View style={styles.listContainer}>
        {notifications.slice(0, 5).map((item) => {
          const t = getTheme(item.type);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notifItem,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
              onPress={() => onItemClick?.(item)}
              activeOpacity={0.8}
            >
              {/* Icon Circle */}
              <View style={[styles.notifIconWrap, { backgroundColor: t.iconBg }]}>
                <Text style={[styles.notifIconText, { color: t.iconColor }]}>
                  {t.icon}
                </Text>
              </View>

              {/* Main Info */}
              <View style={styles.notifContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[styles.typeBadge, { backgroundColor: t.badgeBg }]}>
                    <Text style={[styles.typeBadgeText, { color: t.badgeColor }]}>
                      {t.badgeText}
                    </Text>
                  </View>
                </View>

                <Text style={styles.notifSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>

                <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  listContainer: {
    gap: 10,
  },
  notifItem: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  notifIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifIconText: {
    fontSize: 14,
    fontWeight: '900',
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  notifSubtitle: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  timeAgoText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
});
