import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useParentData, AnnouncementItem } from '../../context/ParentDataContext';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string; border: string }> = {
  Academic: { bg: '#EFF6FF', text: '#2563EB', icon: '📚', border: '#BFDBFE' },
  Event: { bg: '#FDF2F8', text: '#DB2777', icon: '🗓️', border: '#FBCFE8' },
  Holiday: { bg: '#FEF3C7', text: '#D97706', icon: '🏖️', border: '#FDE68A' },
  Fees: { bg: '#DCFCE7', text: '#15803D', icon: '💳', border: '#BBF7D0' },
};

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { announcements, markAnnouncementRead, markAllAnnouncementsRead, unreadAnnouncementsCount } = useParentData();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleOpenAnnouncement = (item: AnnouncementItem) => {
    setSelectedAnnouncement(item);
    if (!item.read) {
      markAnnouncementRead(item.id);
    }
  };

  const handleDownloadAttachment = (filename?: string) => {
    if (!filename) return;
    setDownloadSuccess(`Downloaded ${filename}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => router.push('/parents/dashboard' as any)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Announcements & Notices</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              Official school updates, circulars, and notifications
            </Text>
          </View>

          {unreadAnnouncementsCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={markAllAnnouncementsRead}
              activeOpacity={0.8}
            >
              <Text style={styles.markAllBtnText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── Unread Badge Banner ─────────────────────────────────────────── */}
        {unreadAnnouncementsCount > 0 && (
          <View style={styles.unreadBanner}>
            <Text style={styles.unreadBannerText}>
              🔔 You have <Text style={{ fontWeight: '800' }}>{unreadAnnouncementsCount} unread</Text> {unreadAnnouncementsCount === 1 ? 'announcement' : 'announcements'}.
            </Text>
          </View>
        )}

        {/* ─── Announcements Feed ─────────────────────────────────────────── */}
        <View style={styles.feedCard}>
          {announcements.map((item, index) => {
            const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Academic;
            const isUnread = !item.read;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.announcementRow,
                  isUnread && styles.announcementRowUnread,
                  index === announcements.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleOpenAnnouncement(item)}
                activeOpacity={0.75}
              >
                {/* Category Icon */}
                <View style={[styles.catIconBox, { backgroundColor: catStyle.bg, borderColor: catStyle.border }]}>
                  <Text style={{ fontSize: 18 }}>{catStyle.icon}</Text>
                </View>

                {/* Announcement Body */}
                <View style={styles.announcementContent}>
                  <View style={styles.metaRow}>
                    <View style={[styles.catPill, { backgroundColor: catStyle.bg }]}>
                      <Text style={[styles.catPillText, { color: catStyle.text }]}>{item.category}</Text>
                    </View>
                    <Text style={styles.dateText}>{item.date}</Text>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSummary} numberOfLines={2}>
                    {item.summary}
                  </Text>

                  {item.attachmentName && (
                    <View style={styles.attachmentBadge}>
                      <Text style={styles.attachmentBadgeText}>📎 {item.attachmentName}</Text>
                    </View>
                  )}
                </View>

                {/* Right Arrow */}
                <View style={styles.arrowBox}>
                  <Text style={[styles.arrowText, isUnread && { color: '#4F46E5', fontWeight: '800' }]}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Announcement Detail Modal ───────────────────────────────────── */}
        <Modal
          visible={!!selectedAnnouncement}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedAnnouncement(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                {selectedAnnouncement && (
                  <View
                    style={[
                      styles.catPill,
                      { backgroundColor: CATEGORY_STYLES[selectedAnnouncement.category]?.bg || '#EFF6FF' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.catPillText,
                        { color: CATEGORY_STYLES[selectedAnnouncement.category]?.text || '#2563EB' },
                      ]}
                    >
                      {CATEGORY_STYLES[selectedAnnouncement.category]?.icon} {selectedAnnouncement.category}
                    </Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setSelectedAnnouncement(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{selectedAnnouncement?.title}</Text>
              <Text style={styles.modalDate}>Published on {selectedAnnouncement?.date}</Text>

              <View style={styles.modalDivider} />

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalMessageText}>{selectedAnnouncement?.fullMessage}</Text>

                {selectedAnnouncement?.attachmentName && (
                  <View style={styles.modalAttachmentBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalAttachmentLabel}>Attached Circular Document</Text>
                      <Text style={styles.modalAttachmentName}>{selectedAnnouncement.attachmentName}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => handleDownloadAttachment(selectedAnnouncement.attachmentName)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.downloadBtnText}>⬇ Download</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {downloadSuccess && (
                  <View style={styles.downloadToast}>
                    <Text style={styles.downloadToastText}>✓ {downloadSuccess}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setSelectedAnnouncement(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalPrimaryBtnText}>Close Notice</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  markAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  unreadBanner: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  unreadBannerText: {
    fontSize: 13,
    color: '#3730A3',
    fontWeight: '500',
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  announcementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  announcementRowUnread: {
    backgroundColor: '#F8FAFF',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  announcementContent: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  catPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4F46E5',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  itemSummary: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  attachmentBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  attachmentBadgeText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  arrowBox: {
    paddingLeft: 4,
  },
  arrowText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 24,
  },
  modalDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  modalScrollBody: {
    maxHeight: 280,
  },
  modalMessageText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  modalAttachmentLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalAttachmentName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  downloadBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  downloadToast: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    alignItems: 'center',
  },
  downloadToastText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
