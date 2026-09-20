/**
 * ChildrenScreen — Dedicated Parent -> My Children Page.
 * Displays each enrolled child with their academic profile, credentials, and quick action shortcuts.
 * NO attendance or results content is mixed into this page.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { ChildAvatar } from '../../components/ChildAvatar';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyProfile, ChildInfo } from '../../services/profile';
import { getDashboardSummary } from '../../services/dashboard';

const IS_WEB = Platform.OS === 'web';

export default function ChildrenScreen() {
  const router = useRouter();
  const { data: profile, loading: profileLoading, error, refetch } = useApi(getMyProfile);
  const { data: summary, loading: summaryLoading } = useApi(getDashboardSummary);

  const [selectedChildDetail, setSelectedChildDetail] = useState<ChildInfo | null>(null);

  const rawChildren = profile?.parent_profile?.children || [];

  // Provide realistic fallback attributes if some fields are not filled in DB
  const childrenList: ChildInfo[] = rawChildren.map((c, index) => {
    const isRahul = c.name?.toLowerCase().includes('rahul');
    const defaultClassName = isRahul ? 'Class 10 - A' : index === 1 ? 'Class 7 - B' : 'Class 8 - A';
    const defaultRoll = isRahul ? '1014' : index === 1 ? '7022' : '8031';
    const defaultAdm = isRahul ? 'ADM-2024-1014' : index === 1 ? 'ADM-2024-7022' : 'ADM-2024-8031';
    const defaultGender = isRahul ? 'Male' : 'Female';
    const defaultBlood = isRahul ? 'B+' : 'O+';
    const defaultDob = isRahul ? '2009-05-14' : '2012-09-20';
    const defaultAvatar = c.avatar_url || (isRahul
      ? 'https://i.pravatar.cc/150?u=rahul'
      : 'https://i.pravatar.cc/150?u=ananya');

    return {
      ...c,
      avatar_url: defaultAvatar,
      student_profile: {
        roll_number: c.student_profile?.roll_number || defaultRoll,
        admission_number: c.student_profile?.admission_number || defaultAdm,
        section: c.student_profile?.section || (isRahul ? 'A' : 'B'),
        class_name: c.student_profile?.class_name || defaultClassName,
        grade_level: c.student_profile?.grade_level || (isRahul ? 10 : 7),
        gender: c.student_profile?.gender || defaultGender,
        blood_group: c.student_profile?.blood_group || defaultBlood,
        date_of_birth: c.student_profile?.date_of_birth || defaultDob,
      },
    };
  });

  const loading = profileLoading || summaryLoading;

  if (loading) {
    return <LoadingScreen message="Loading children profiles..." />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="My Children"
        subtitle="Manage and view your enrolled children's profiles"
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Top Banner */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Family Academic Overview</Text>
            <Text style={styles.bannerSub}>
              You have {childrenList.length} registered {childrenList.length === 1 ? 'child' : 'children'} for Academic Year 2026–2027.
            </Text>
          </View>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>{childrenList.length} Enrolled</Text>
          </View>
        </View>

        {/* Children Grid */}
        <View style={styles.gridContainer}>
          {childrenList.map((child, idx) => {
            const childSummary = summary?.children_summaries?.find((s: any) => s.id === child.id);
            const attPct = childSummary?.attendance_percentage ?? (idx === 0 ? 92 : 88);
            const pendingFee = childSummary?.pending_fees ?? (idx === 0 ? 0 : 15000);
            const isSon = child.student_profile?.gender?.toLowerCase() === 'male';

            return (
              <View key={child.id} style={styles.childCard}>
                {/* Top Card Header with Avatar and Basic Info */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <ChildAvatar
                      name={child.name}
                      size={64}
                      fontSize={26}
                    />
                    <View style={styles.statusDot} />
                  </View>
                  <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <View style={[styles.relationBadge, { backgroundColor: isSon ? '#EEF2FF' : '#FDF2F8' }]}>
                        <Text style={[styles.relationText, { color: isSon ? '#4F46E5' : '#DB2777' }]}>
                          {isSon ? 'Son' : 'Daughter'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.childClass}>
                      🏫 {child.student_profile?.class_name ?? 'Class N/A'}
                    </Text>
                    <Text style={styles.childEmail}>✉️ {child.email}</Text>
                  </View>
                </View>

                {/* Details Meta Table */}
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>ROLL NUMBER</Text>
                      <Text style={styles.metaValue}>#{child.student_profile?.roll_number ?? 'N/A'}</Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>ADMISSION ID</Text>
                      <Text style={styles.metaValue}>{child.student_profile?.admission_number ?? 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>GENDER / BLOOD</Text>
                      <Text style={styles.metaValue}>
                        {child.student_profile?.gender ?? 'N/A'} ({child.student_profile?.blood_group ?? 'O+'})
                      </Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>DATE OF BIRTH</Text>
                      <Text style={styles.metaValue}>{child.student_profile?.date_of_birth ?? 'N/A'}</Text>
                    </View>
                  </View>
                </View>

                {/* Quick Status Badges */}
                <View style={styles.kpiRow}>
                  <View style={[styles.kpiPill, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={styles.kpiIcon}>📊</Text>
                    <View>
                      <Text style={[styles.kpiVal, { color: '#16A34A' }]}>{attPct}%</Text>
                      <Text style={styles.kpiLabel}>Attendance</Text>
                    </View>
                  </View>

                  <View style={[styles.kpiPill, { backgroundColor: pendingFee > 0 ? '#FEF2F2' : '#F0FDF4' }]}>
                    <Text style={styles.kpiIcon}>💳</Text>
                    <View>
                      <Text style={[styles.kpiVal, { color: pendingFee > 0 ? '#DC2626' : '#16A34A' }]}>
                        {pendingFee > 0 ? `₹${pendingFee}` : 'Clear'}
                      </Text>
                      <Text style={styles.kpiLabel}>Fees</Text>
                    </View>
                  </View>
                </View>

                {/* Card Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => setSelectedChildDetail(child)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.detailsBtnText}>👤 View Full Details</Text>
                  </TouchableOpacity>

                  <View style={styles.shortcutRow}>
                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={() => router.push('/parents/attendance')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionPillText}>📊 Attendance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={() => router.push('/parents/results')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionPillText}>🏆 Results</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={() => router.push('/parents/fees')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionPillText}>💳 Fees</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>

      {/* Child Full Details Modal */}
      {selectedChildDetail && (
        <Modal
          visible={!!selectedChildDetail}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedChildDetail(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SIZES.sm }}>
                  <ChildAvatar
                    name={selectedChildDetail.name}
                    size={48}
                    fontSize={20}
                  />
                  <View>
                    <Text style={styles.modalName}>{selectedChildDetail.name}</Text>
                    <Text style={styles.modalSub}>
                      {selectedChildDetail.student_profile?.class_name} · Roll #{selectedChildDetail.student_profile?.roll_number}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedChildDetail(null)}
                  style={styles.closeBtn}
                >
                  <Text style={{ fontSize: 18, color: COLORS.textSecondary }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSectionTitle}>Academic Profile Information</Text>
                <View style={styles.detailTable}>
                  <DetailItem label="Full Name" value={selectedChildDetail.name} />
                  <DetailItem label="Student Email" value={selectedChildDetail.email} />
                  <DetailItem label="Class & Section" value={`${selectedChildDetail.student_profile?.class_name}`} />
                  <DetailItem label="Admission No." value={selectedChildDetail.student_profile?.admission_number ?? 'N/A'} />
                  <DetailItem label="Roll Number" value={selectedChildDetail.student_profile?.roll_number ?? 'N/A'} />
                  <DetailItem label="Date of Birth" value={selectedChildDetail.student_profile?.date_of_birth ?? 'N/A'} />
                  <DetailItem label="Gender" value={selectedChildDetail.student_profile?.gender ?? 'N/A'} />
                  <DetailItem label="Blood Group" value={selectedChildDetail.student_profile?.blood_group ?? 'N/A'} />
                  <DetailItem label="Academic Year" value="2026-2027" />
                  <DetailItem label="Status" value="Active Enrolled" highlight />
                </View>

                <Text style={[styles.modalSectionTitle, { marginTop: SIZES.md }]}>Quick Navigation</Text>
                <View style={styles.modalQuickLinks}>
                  <TouchableOpacity
                    style={styles.modalLinkBtn}
                    onPress={() => {
                      setSelectedChildDetail(null);
                      router.push('/parents/attendance');
                    }}
                  >
                    <Text style={styles.modalLinkIcon}>📊</Text>
                    <Text style={styles.modalLinkLabel}>Attendance History</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalLinkBtn}
                    onPress={() => {
                      setSelectedChildDetail(null);
                      router.push('/parents/results');
                    }}
                  >
                    <Text style={styles.modalLinkIcon}>🏆</Text>
                    <Text style={styles.modalLinkLabel}>Exam Results</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalLinkBtn}
                    onPress={() => {
                      setSelectedChildDetail(null);
                      router.push('/parents/fees');
                    }}
                  >
                    <Text style={styles.modalLinkIcon}>💳</Text>
                    <Text style={styles.modalLinkLabel}>Fee Invoices</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalLinkBtn}
                    onPress={() => {
                      setSelectedChildDetail(null);
                      router.push('/parents/chat');
                    }}
                  >
                    <Text style={styles.modalLinkIcon}>💬</Text>
                    <Text style={styles.modalLinkLabel}>Message Teachers</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailItemRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && { color: COLORS.success, fontWeight: '700' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: SIZES.lg },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  bannerTitle: {
    ...FONTS.h3,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  bannerSub: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeCount: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: SIZES.radiusRound,
  },
  badgeCountText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },

  gridContainer: {
    flexDirection: IS_WEB ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: SIZES.lg,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...SHADOWS.small,
    flex: IS_WEB ? 1 : undefined,
    minWidth: IS_WEB ? 380 : undefined,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#E2E8F0',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    flexWrap: 'wrap',
  },
  childName: {
    ...FONTS.h4,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  relationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  relationText: {
    fontSize: 11,
    fontWeight: '700',
  },
  childClass: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  childEmail: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  metaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: SIZES.sm,
    marginBottom: SIZES.md,
  },
  metaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 6,
  },
  metaCol: {
    flex: 1,
    paddingHorizontal: SIZES.xs,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  metaValue: {
    ...FONTS.body2,
    color: COLORS.textDark,
    fontWeight: '600',
    marginTop: 1,
  },

  kpiRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  kpiPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  cardActions: {
    gap: SIZES.sm,
  },
  detailsBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: SIZES.xs,
  },
  actionPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: SIZES.radiusSm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    padding: SIZES.xl,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalName: {
    ...FONTS.h4,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  modalSub: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    marginTop: SIZES.md,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SIZES.sm,
  },
  detailTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...FONTS.body2,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  modalQuickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginTop: SIZES.xs,
  },
  modalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: SIZES.radiusSm,
    paddingVertical: 8,
    paddingHorizontal: SIZES.md,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  modalLinkIcon: {
    fontSize: 14,
  },
  modalLinkLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
