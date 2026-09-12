/**
 * Notifications — full notification center.
 * Uses GET /notifications/me and POST /notifications/{id}/read.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { LoadingScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyNotifications, markNotificationRead, type Notification } from '../../services/notifications';

const IS_WEB = Platform.OS === 'web';

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  academic:    { icon: '📚', color: '#3B82F6', bg: '#EFF6FF' },
  exam:        { icon: '✍️',  color: '#F59E0B', bg: '#FFFBEB' },
  fee:         { icon: '💳', color: '#10B981', bg: '#ECFDF5' },
  event:       { icon: '📅', color: '#8B5CF6', bg: '#F5F3FF' },
  homework:    { icon: '📝', color: '#EF4444', bg: '#FEF2F2' },
  system:      { icon: '⚙️', color: '#6B7280', bg: '#F9FAFB' },
  general:     { icon: '🔔', color: '#4F46E5', bg: '#EEF2FF' },
};

export default function NotificationsScreen() {
  const { data: notifications, loading, refetch } = useApi(getMyNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const unreadCount = (notifications ?? []).filter(n => !n.is_read && !readIds.has(n.id)).length;

  const handleMarkRead = useCallback(async (notification: Notification) => {
    if (notification.is_read || readIds.has(notification.id)) return;
    try {
      await markNotificationRead(notification.id);
      setReadIds(prev => new Set([...prev, notification.id]));
    } catch {
      // silent fail
    }
  }, [readIds]);

  const handleMarkAllRead = async () => {
    const unread = (notifications ?? []).filter(n => !n.is_read && !readIds.has(n.id));
    await Promise.all(unread.map(n => markNotificationRead(n.id).catch(() => {})));
    setReadIds(prev => new Set([...prev, ...unread.map(n => n.id)]));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <LoadingScreen message="Loading notifications..." />;

  const items = notifications ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>You're all caught up!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isRead = item.is_read || readIds.has(item.id);
          const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.general;
          return (
            <TouchableOpacity
              style={[styles.notifCard, !isRead && styles.notifCardUnread]}
              onPress={() => handleMarkRead(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
              </View>
              <View style={styles.notifBody}>
                <View style={styles.notifTop}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                  {!isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.body}</Text>
                <View style={styles.notifMeta}>
                  <View style={[styles.typeChip, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.typeChipText, { color: cfg.color }]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.notifTime}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: IS_WEB ? SIZES.xl : SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  pageTitle: { ...FONTS.h3, color: COLORS.textDark, fontWeight: '700' },
  unreadSub: { ...FONTS.caption, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  markAllBtn: {
    backgroundColor: '#EEF2FF', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusRound,
  },
  markAllText: { ...FONTS.body2, color: COLORS.primary, fontWeight: '700' },
  listContent: { padding: IS_WEB ? SIZES.xl : SIZES.md, gap: SIZES.sm, paddingBottom: SIZES.xxl },
  notifCard: {
    flexDirection: 'row', gap: SIZES.md, backgroundColor: COLORS.card,
    borderRadius: SIZES.radius, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  notifCardUnread: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifBody: { flex: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: 4 },
  notifTitle: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  notifMessage: { ...FONTS.body2, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 6 },
  notifMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: SIZES.radiusSm },
  typeChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  notifTime: { ...FONTS.caption, color: COLORS.textLight },
  emptyCard: { alignItems: 'center', paddingTop: SIZES.xxl * 2, gap: SIZES.sm },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub: { ...FONTS.body2, color: COLORS.textSecondary },
});
