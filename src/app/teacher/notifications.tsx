/**
 * TeacherNotificationsScreen — All notifications for the teacher.
 * Same block pattern as student notifications.
 *
 * API: GET /notifications/me
 *      POST /notifications/{id}/read
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Platform,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { getMyNotifications, markNotificationRead } from '../../services/notifications';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { SIZES, FONTS, SHADOWS } from '../../constants/theme';

const IS_WEB = Platform.OS === 'web';

const C = {
  bg: '#F1F5F9', card: '#FFFFFF', border: '#E2E8F0',
  purple: '#7C3AED', purpleLight: '#F5F3FF',
  green: '#10B981', greenLight: '#D1FAE5',
  red: '#EF4444', redLight: '#FEE2E2',
  amber: '#F59E0B', amberLight: '#FEF3C7',
  blue: '#3B82F6', blueLight: '#EFF6FF',
  textDark: '#0F172A', textMid: '#334155', textSub: '#64748B', textLight: '#94A3B8',
};

const TYPE_CONFIG: Record<string, { icon: string; bg: string; color: string }> = {
  marks:      { icon: '🏆', bg: C.purpleLight, color: C.purple },
  attendance: { icon: '📊', bg: C.amberLight,  color: C.amber  },
  finance:    { icon: '💳', bg: C.greenLight,  color: C.green  },
  exam:       { icon: '✍️', bg: C.blueLight,   color: C.blue   },
  info:       { icon: 'ℹ️', bg: C.blueLight,   color: C.blue   },
  default:    { icon: '🔔', bg: '#F1F5F9',     color: C.textSub },
};

function typeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.default;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const FILTERS = ['All', 'Unread', 'Marks', 'Attendance', 'Finance'];

export default function TeacherNotificationsScreen() {
  const [filter, setFilter] = useState<string>('All');
  const { data: notifications, loading, error, refetch } = useApi(getMyNotifications);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      refetch();
    } catch {}
  }

  const filtered = (notifications ?? []).filter((n: any) => {
    if (filter === 'All')        return true;
    if (filter === 'Unread')     return !n.is_read;
    return n.type?.toLowerCase() === filter.toLowerCase();
  });

  const unreadCount = (notifications ?? []).filter((n: any) => !n.is_read).length;

  if (loading) return <LoadingScreen message="Loading notifications…" />;
  if (error)   return <ErrorScreen error={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={nStyles.safeArea}>
      {/* Header */}
      <View style={nStyles.pageHeader}>
        <View>
          <Text style={nStyles.pageTitle}>Notifications</Text>
          <Text style={nStyles.pageSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={nStyles.unreadBadge}>
            <Text style={nStyles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={nStyles.filterScroll}>
        <View style={nStyles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[nStyles.filterTab, filter === f && nStyles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[nStyles.filterText, filter === f && nStyles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={nStyles.listPad}>
        {filtered.length === 0 ? (
          <View style={nStyles.emptyState}>
            <Text style={nStyles.emptyIcon}>🔔</Text>
            <Text style={nStyles.emptyText}>No notifications</Text>
            <Text style={nStyles.emptySub}>
              {filter === 'All' ? "You're all caught up!" : `No ${filter.toLowerCase()} notifications`}
            </Text>
          </View>
        ) : (
          filtered.map((n: any) => {
            const cfg = typeConfig(n.type);
            return (
              <TouchableOpacity
                key={n.id}
                style={[nStyles.card, !n.is_read && nStyles.cardUnread]}
                onPress={() => !n.is_read && handleMarkRead(n.id)}
                activeOpacity={0.85}
              >
                <View style={[nStyles.iconBox, { backgroundColor: cfg.bg }]}>
                  <Text style={nStyles.iconText}>{cfg.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={nStyles.cardTopRow}>
                    <Text style={[nStyles.cardTitle, !n.is_read && { fontWeight: '700', color: C.textDark }]}>
                      {n.title}
                    </Text>
                    {!n.is_read && <View style={[nStyles.dot, { backgroundColor: cfg.color }]} />}
                  </View>
                  <Text style={nStyles.cardBody} numberOfLines={2}>{n.body}</Text>
                  <Text style={nStyles.cardTime}>{n.created_at ? timeAgo(n.created_at) : ''}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const nStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingTop: IS_WEB ? SIZES.lg : SIZES.xl,
    paddingBottom: SIZES.md,
  },
  pageTitle: { ...FONTS.h2, color: C.textDark, fontWeight: '700' },
  pageSubtitle: { ...FONTS.body2, color: C.textSub, marginTop: 2 },
  unreadBadge: {
    backgroundColor: C.red,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unreadBadgeText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  filterScroll: { maxHeight: 48 },
  filterRow: { flexDirection: 'row', paddingHorizontal: SIZES.lg, gap: SIZES.sm, paddingBottom: SIZES.sm },
  filterTab: {
    paddingHorizontal: SIZES.md, paddingVertical: 7,
    borderRadius: 20, backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
  },
  filterTabActive: { backgroundColor: C.purple, borderColor: C.purple },
  filterText: { ...FONTS.body2, color: C.textSub, fontWeight: '600' },
  filterTextActive: { color: '#FFF' },

  listPad: { paddingHorizontal: SIZES.lg, paddingTop: SIZES.sm, gap: SIZES.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: SIZES.md,
    gap: SIZES.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardUnread: { borderColor: C.purple + '40', backgroundColor: C.purpleLight },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  cardTitle: { ...FONTS.body2, color: C.textMid, fontWeight: '500', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardBody: { ...FONTS.caption, color: C.textSub, lineHeight: 17 },
  cardTime: { ...FONTS.caption, color: C.textLight, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { ...FONTS.h4, color: C.textMid },
  emptySub: { ...FONTS.body2, color: C.textSub },
});
