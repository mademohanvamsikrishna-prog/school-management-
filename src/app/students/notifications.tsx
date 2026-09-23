/**
 * Notifications — Notification center + School Notices/Announcements.
 *
 * Two tabs:
 *   [Notifications] — existing system notifications (GET /notifications/me)
 *   [Notices]       — new school notices/announcements (GET /students/dashboard/notices)
 *
 * Notices CRUD:
 *   - Acknowledge    → PATCH is_acknowledged=true
 *   - Delete         → DELETE (with confirmation alert, optimistic removal)
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyNotifications, markNotificationRead, type Notification } from '../../services/notifications';
import {
  getNotices,
  acknowledgeNotice,
  deleteNotice,
  type Notice,
} from '../../services/dashboardCrud';

const IS_WEB = Platform.OS === 'web';

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------
const NOTIF_TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  academic: { icon: '📚', color: '#3B82F6', bg: '#EFF6FF' },
  exam:     { icon: '✍️',  color: '#F59E0B', bg: '#FFFBEB' },
  fee:      { icon: '💳', color: '#10B981', bg: '#ECFDF5' },
  event:    { icon: '📅', color: '#8B5CF6', bg: '#F5F3FF' },
  homework: { icon: '📝', color: '#EF4444', bg: '#FEF2F2' },
  system:   { icon: '⚙️', color: '#6B7280', bg: '#F9FAFB' },
  general:  { icon: '🔔', color: '#4F46E5', bg: '#EEF2FF' },
};

const NOTICE_CATEGORY_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  academic: { icon: '📚', color: '#3B82F6', bg: '#EFF6FF' },
  exam:     { icon: '✍️',  color: '#F59E0B', bg: '#FFFBEB' },
  event:    { icon: '🎉', color: '#8B5CF6', bg: '#F5F3FF' },
  sports:   { icon: '🏅', color: '#10B981', bg: '#ECFDF5' },
  fee:      { icon: '💳', color: '#EF4444', bg: '#FEF2F2' },
  hostel:   { icon: '🏠', color: '#6B7280', bg: '#F9FAFB' },
  general:  { icon: '📢', color: '#4F46E5', bg: '#EEF2FF' },
};

const PRIORITY_BADGE: Record<string, { color: string; bg: string }> = {
  low:    { color: '#94A3B8', bg: '#F1F5F9' },
  medium: { color: '#F59E0B', bg: '#FFFBEB' },
  high:   { color: '#EF4444', bg: '#FEF2F2' },
  urgent: { color: '#7C3AED', bg: '#F5F3FF' },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NotifItem({
  item,
  isRead,
  onPress,
}: {
  item: Notification;
  isRead: boolean;
  onPress: () => void;
}) {
  const cfg = NOTIF_TYPE_CONFIG[item.type] ?? NOTIF_TYPE_CONFIG.general;
  return (
    <TouchableOpacity
      style={[styles.card, !isRead && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
        <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {!isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>{item.body}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.typeChip, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.typeChipText, { color: cfg.color }]}>{item.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.metaTime}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function NoticeItem({
  item,
  onAcknowledge,
  onDelete,
}: {
  item: Notice;
  onAcknowledge: () => void;
  onDelete: () => void;
}) {
  const cfg = NOTICE_CATEGORY_CONFIG[item.category] ?? NOTICE_CATEGORY_CONFIG.general;
  const pBadge = PRIORITY_BADGE[item.priority] ?? PRIORITY_BADGE.medium;

  return (
    <View style={[styles.card, item.is_pinned && styles.cardPinned]}>
      <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
        <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.is_pinned ? '📌 ' : ''}{item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: pBadge.bg }]}>
            <Text style={[styles.priorityBadgeText, { color: pBadge.color }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.cardMessage} numberOfLines={3}>{item.content}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.typeChip, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.typeChipText, { color: cfg.color }]}>{item.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.metaTime}>{item.date}</Text>
        </View>
        {/* Actions */}
        <View style={styles.noticeActions}>
          {!item.is_acknowledged && (
            <TouchableOpacity
              style={[styles.noticeActionBtn, styles.ackBtn]}
              onPress={onAcknowledge}
              activeOpacity={0.8}
            >
              <Text style={styles.ackBtnText}>✓ Acknowledge</Text>
            </TouchableOpacity>
          )}
          {item.is_acknowledged && (
            <View style={[styles.noticeActionBtn, styles.ackedBadge]}>
              <Text style={styles.ackedText}>✅ Acknowledged</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.noticeActionBtn, styles.deleteBtn]}
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'notices'>('notifications');

  // ---- Notifications ----
  const { data: notifData, loading: notifLoading, refetch: refetchNotif } = useApi(getMyNotifications);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [refreshingNotif, setRefreshingNotif] = useState(false);

  const unreadCount = (notifData ?? []).filter(n => !n.is_read && !readIds.has(n.id)).length;

  const handleMarkRead = useCallback(
    async (n: Notification) => {
      if (n.is_read || readIds.has(n.id)) return;
      try {
        await markNotificationRead(n.id);
        setReadIds(prev => new Set([...prev, n.id]));
      } catch { /* silent */ }
    },
    [readIds],
  );

  const handleMarkAllRead = async () => {
    const unread = (notifData ?? []).filter(n => !n.is_read && !readIds.has(n.id));
    await Promise.all(unread.map(n => markNotificationRead(n.id).catch(() => {})));
    setReadIds(prev => new Set([...prev, ...unread.map(n => n.id)]));
  };

  const onRefreshNotif = async () => {
    setRefreshingNotif(true);
    await refetchNotif();
    setRefreshingNotif(false);
  };

  // ---- Notices ----
  const { data: noticesResp, loading: noticesLoading, refetch: refetchNotices } = useApi(
    () => getNotices({ limit: 50 }),
  );
  const [localNotices, setLocalNotices] = useState<Notice[] | null>(null);
  const notices: Notice[] = localNotices ?? (noticesResp?.items ?? []);
  const [refreshingNotices, setRefreshingNotices] = useState(false);

  const onRefreshNotices = async () => {
    setRefreshingNotices(true);
    setLocalNotices(null);
    await refetchNotices();
    setRefreshingNotices(false);
  };

  const handleAcknowledge = async (notice: Notice) => {
    if (notice.is_acknowledged) return;
    // Optimistic
    setLocalNotices(prev =>
      (prev ?? notices).map(n => (n.id === notice.id ? { ...n, is_acknowledged: true } : n)),
    );
    try {
      await acknowledgeNotice(notice.id);
    } catch (err: any) {
      setLocalNotices(null);
      Alert.alert('Error', err?.message ?? 'Could not acknowledge notice.');
    }
  };

  const handleDeleteNotice = (notice: Notice) => {
    Alert.alert(
      'Delete Notice',
      `Remove "${notice.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLocalNotices(prev => (prev ?? notices).filter(n => n.id !== notice.id));
            try {
              await deleteNotice(notice.id);
            } catch (err: any) {
              setLocalNotices(null);
              await refetchNotices();
              Alert.alert('Error', err?.message ?? 'Could not delete notice.');
            }
          },
        },
      ],
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Inbox</Text>
          {activeTab === 'notifications' && unreadCount > 0 && (
            <Text style={styles.unreadSub}>{unreadCount} unread</Text>
          )}
          {activeTab === 'notices' && (
            <Text style={styles.unreadSub}>{notices.length} notices</Text>
          )}
        </View>
        {activeTab === 'notifications' && unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['notifications', 'notices'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab === 'notifications' ? '🔔 Notifications' : '📢 Notices'}
            </Text>
            {tab === 'notifications' && unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ---- Notifications Tab ---- */}
      {activeTab === 'notifications' && (
        notifLoading ? (
          <View style={styles.centeredBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={notifData ?? []}
            keyExtractor={n => n.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshingNotif} onRefresh={onRefreshNotif} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptySub}>You&apos;re all caught up!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <NotifItem
                item={item}
                isRead={item.is_read || readIds.has(item.id)}
                onPress={() => handleMarkRead(item)}
              />
            )}
          />
        )
      )}

      {/* ---- Notices Tab ---- */}
      {activeTab === 'notices' && (
        noticesLoading && !refreshingNotices ? (
          <View style={styles.centeredBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={notices}
            keyExtractor={n => n.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshingNotices} onRefresh={onRefreshNotices} colors={[COLORS.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📢</Text>
                <Text style={styles.emptyTitle}>No notices</Text>
                <Text style={styles.emptySub}>No school announcements right now.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <NoticeItem
                item={item}
                onAcknowledge={() => handleAcknowledge(item)}
                onDelete={() => handleDeleteNotice(item)}
              />
            )}
          />
        )
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: IS_WEB ? SIZES.xl : SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  pageTitle:  { ...FONTS.h3, color: COLORS.textDark, fontWeight: '700' },
  unreadSub:  { ...FONTS.caption, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  markAllBtn: {
    backgroundColor: '#EEF2FF', paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm, borderRadius: SIZES.radiusRound,
  },
  markAllText: { ...FONTS.body2, color: COLORS.primary, fontWeight: '700' },

  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 6, borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabBtnActive:     { borderBottomColor: COLORS.primary },
  tabBtnText:       { ...FONTS.body2, color: COLORS.textSecondary, fontWeight: '600' },
  tabBtnTextActive: { color: COLORS.primary, fontWeight: '800' },
  tabBadge: {
    backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 10, color: '#fff', fontWeight: '800' },

  listContent: { padding: IS_WEB ? SIZES.xl : SIZES.md, gap: SIZES.sm, paddingBottom: SIZES.xxl },
  centeredBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: SIZES.xxl * 2 },

  card: {
    flexDirection: 'row', gap: SIZES.md, backgroundColor: COLORS.card,
    borderRadius: SIZES.radius, padding: SIZES.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  cardPinned: { borderLeftWidth: 4, borderLeftColor: '#F59E0B', backgroundColor: '#FFFBEB' },

  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardBody:   { flex: 1 },
  cardTop:    { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: 4 },
  cardTitle:  { ...FONTS.body2, color: COLORS.textDark, fontWeight: '700', flex: 1 },
  unreadDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  cardMessage: { ...FONTS.body2, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 6 },
  cardMeta:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeChip:   { paddingHorizontal: 6, paddingVertical: 2, borderRadius: SIZES.radiusSm },
  typeChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  metaTime:   { ...FONTS.caption, color: COLORS.textLight },

  priorityBadge:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: SIZES.radiusSm },
  priorityBadgeText: { fontSize: 10, fontWeight: '800' },

  noticeActions: { flexDirection: 'row', gap: SIZES.xs, marginTop: SIZES.sm },
  noticeActionBtn: {
    paddingHorizontal: SIZES.sm, paddingVertical: 6, borderRadius: SIZES.radiusSm,
    alignItems: 'center', justifyContent: 'center',
  },
  ackBtn:       { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#10B981' },
  ackBtnText:   { fontSize: 12, fontWeight: '700', color: '#10B981' },
  ackedBadge:   { backgroundColor: '#F0FDF4' },
  ackedText:    { fontSize: 12, color: '#10B981', fontWeight: '600' },
  deleteBtn:    { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', paddingHorizontal: 10 },
  deleteBtnText: { fontSize: 14 },

  emptyCard:  { alignItems: 'center', paddingTop: SIZES.xxl * 2, gap: SIZES.sm },
  emptyIcon:  { fontSize: 56 },
  emptyTitle: { ...FONTS.h4, color: COLORS.textDark },
  emptySub:   { ...FONTS.body2, color: COLORS.textSecondary },
});
