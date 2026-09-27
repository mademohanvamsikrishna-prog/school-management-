/**
 * ParentProfile — Pixel-Accurate Implementation Matching Reference Design.
 *
 * Structure & Visual Highlights:
 *  1. Top Header:
 *     - Back arrow (←), "My Profile" (bold), subtitle "View and manage your profile information"
 *     - Notification bell with unread badge
 *     - Vikram Sharma profile pill with user's real avatar photo & parent dropdown
 *  2. Profile Hero Banner (Static, Premium, Abstract Theme):
 *     - Wide horizontal card in soft pastel-blue gradient with organic translucent shapes
 *     - User's real uploaded profile photo (parent-avatar-vikram.jpg) in circular crop with white border & shadow
 *     - Parent details: "Vikram Sharma", "PARENT" badge, Email, Phone, "Hyderabad, India"
 *     - Subtle middle decorative ambient space (low-contrast geometric nodes & soft stars)
 *     - Highlighted premium quote card on the right: "Education is a journey we take together."
 *       with large quotation mark, dark navy text, and "Parent Partnership 2026–2027" supporting label
 *     - (No house illustration, no father-daughter illustration in banner, no banner animation)
 *  3. Profile Navigation Tabs (3 Equal-Width Tabs):
 *     - 👤 Personal Information (Active) | 👥 Child / Children | 🛡️ Security
 *  4. Two-Column Main Content (Equal Height & Vertically Aligned):
 *     - LEFT (1.18fr): Personal Details card with Edit button & clean aligned rows
 *     - RIGHT (0.82fr): Quick Info card with 3 equal-width top cards + Emergency Contact card below
 *  5. Recent Activity: Full-width card with identical horizontal bounds & aligned timeline rows
 *  6. Account Footer: Clean bottom session status bar with Sign Out button
 *  7. Interactive Modals: Edit Profile, Change Password, Child Quick View
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useParentChild } from '../../context/ParentChildContext';
import { useParentData } from '../../context/ParentDataContext';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';

const IS_WEB = Platform.OS === 'web';
const parentPhoto = require('../../../assets/images/parent-avatar-vikram.jpg');

type ProfileTab = 'personal' | 'children' | 'security';

interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  childName?: string;
  childBg?: string;
  childColor?: string;
  timestamp: string;
}

// ─── Subtle Middle Decorative Academic Particles (Low Contrast) ──────────────
function SubtleMiddleDecorations() {
  if (!IS_WEB) return null;

  return (
    <svg width="140" height="90" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.55 }}>
      {/* Soft Connected Dotted Nodes */}
      <circle cx="30" cy="45" r="4" fill="#93C5FD" opacity="0.6" />
      <circle cx="70" cy="25" r="5" fill="#818CF8" opacity="0.5" />
      <circle cx="110" cy="55" r="4" fill="#6EE7B7" opacity="0.6" />
      <circle cx="75" cy="68" r="3" fill="#93C5FD" opacity="0.4" />

      <line x1="30" y1="45" x2="70" y2="25" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="70" y1="25" x2="110" y2="55" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="30" y1="45" x2="75" y2="68" stroke="#BAE6FD" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <line x1="75" y1="68" x2="110" y2="55" stroke="#BAE6FD" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

      {/* Tiny Sparkles */}
      <path d="M52 50L53.5 53.5L57 55L53.5 56.5L52 60L50.5 56.5L47 55L50.5 53.5Z" fill="#818CF8" opacity="0.6" />
      <path d="M92 32L93 34.5L95.5 35.5L93 36.5L92 39L91 36.5L88.5 35.5L91 34.5Z" fill="#38BDF8" opacity="0.5" />
    </svg>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: profileData } = useApi(getMyProfile);
  const { unreadAnnouncementsCount } = useParentData();
  const { setSelectedChildId } = useParentChild();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;

  // Active Tab State (3 Equal Tabs)
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

  // Modals & Feedback
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedChildDetail, setSelectedChildDetail] = useState<any | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable Profile Form State
  const [formData, setFormData] = useState({
    name: 'Vikram Sharma',
    email: 'parent@school.edu',
    phone: '+91 98765 43211',
    alternatePhone: '+91 98765 43210',
    occupation: 'Software Architect',
    address: 'Plot No. 45, Green Park, Hyderabad - 500081, India',
    city: 'Hyderabad, India',
    emergencyContact: '+91 98765 43211',
    emergencyContactName: 'Pooja Sharma (Spouse)',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  // Recent Activity Data
  const recentActivities: ActivityItem[] = [
    {
      id: 'a1',
      icon: '📊',
      iconBg: '#EFF6FF',
      title: 'Checked Attendance',
      description: 'Viewed monthly attendance summary (94% present rate).',
      childName: 'Ananya Gupta',
      childBg: '#FFF7ED',
      childColor: '#C2410C',
      timestamp: 'Today, 09:15 AM',
    },
    {
      id: 'a2',
      icon: '🏆',
      iconBg: '#ECFDF5',
      title: 'Viewed Result',
      description: 'Checked Unit Test score in Mathematics (Score: 94% / Grade A+).',
      childName: 'Rahul Sharma',
      childBg: '#FDF2F8',
      childColor: '#BE185D',
      timestamp: '25 Sep 2026, 04:20 PM',
    },
    {
      id: 'a3',
      icon: '📢',
      iconBg: '#FEF3C7',
      title: 'Viewed Announcement',
      description: 'Read "Half Yearly Examination Schedule 2026–27".',
      childName: 'School Wide',
      childBg: '#F1F5F9',
      childColor: '#475569',
      timestamp: '24 Sep 2026, 11:30 AM',
    },
    {
      id: 'a4',
      icon: '📖',
      iconBg: '#F5F3FF',
      title: 'Checked Homework',
      description: 'Reviewed pending Physics assignment for Rahul.',
      childName: 'Rahul Sharma',
      childBg: '#FDF2F8',
      childColor: '#BE185D',
      timestamp: '23 Sep 2026, 02:15 PM',
    },
    {
      id: 'a5',
      icon: '💳',
      iconBg: '#EFF6FF',
      title: 'Checked Fee Information',
      description: 'Inspected tuition invoice & payment options for Ananya.',
      childName: 'Ananya Gupta',
      childBg: '#FFF7ED',
      childColor: '#C2410C',
      timestamp: '22 Sep 2026, 06:00 PM',
    },
  ];

  // Children Data
  const childrenList = [
    {
      id: 'c-ananya',
      name: 'Ananya Gupta',
      initial: 'A',
      avatarBg: '#F97316',
      class: 'Class 7 - B',
      rollNumber: '7022',
      admissionNo: 'ADM-2024-7022',
      attendance: 94,
      attendanceTrend: '+5%',
      latestGrade: 'A+',
      pendingFee: '₹5,000',
      feeStatus: 'Pending',
      status: 'Active',
      dob: '2012-09-20',
      bloodGroup: 'O+',
      gender: 'Female',
    },
    {
      id: 'c-rahul',
      name: 'Rahul Sharma',
      initial: 'R',
      avatarBg: '#EC4899',
      class: 'Class 10 - A',
      rollNumber: '1014',
      admissionNo: 'ADM-2024-1014',
      attendance: 98,
      attendanceTrend: '+2%',
      latestGrade: 'A',
      pendingFee: '₹0',
      feeStatus: 'Paid',
      status: 'Active',
      dob: '2009-05-14',
      bloodGroup: 'B+',
      gender: 'Male',
    },
  ];

  // Display fields
  const displayName = formData.name || profileData?.name || user?.name || 'Vikram Sharma';
  const displayEmail = formData.email || profileData?.email || user?.email || 'parent@school.edu';
  const displayPhone = formData.phone || profileData?.parent_profile?.alternate_phone || '+91 98765 43211';
  const displayOccupation = formData.occupation || profileData?.parent_profile?.occupation || 'Software Architect';
  const displayAddress = formData.address;

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Logout Handler
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of your parent account?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to log out of your parent account?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]);
    }
  };

  // Save Profile Handler
  const handleSaveProfile = () => {
    setIsEditModalOpen(false);
    showToast('Profile information updated successfully!');
  };

  // Save Password Handler
  const handleSavePassword = () => {
    if (!passwordData.newPass || !passwordData.confirmPass) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in all password fields.');
      } else {
        Alert.alert('Error', 'Please fill in all password fields.');
      }
      return;
    }
    if (passwordData.newPass !== passwordData.confirmPass) {
      if (Platform.OS === 'web') {
        window.alert('New passwords do not match.');
      } else {
        Alert.alert('Error', 'New passwords do not match.');
      }
      return;
    }
    setIsPasswordModalOpen(false);
    setPasswordData({ current: '', newPass: '', confirmPass: '' });
    showToast('Password updated securely!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageInner}>
          {/* ─── 1. TOP PROFILE HEADER ────────────────────────────────────── */}
          <View style={styles.topHeader}>
            {/* Left: Back Arrow + Title + Subtitle */}
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.push('/parents/dashboard' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerTitleBox}>
                <Text style={styles.pageTitle}>My Profile</Text>
                <Text style={styles.pageSubtitle}>View and manage your profile information</Text>
              </View>
            </View>

            {/* Right: Bell + Profile Dropdown Pill */}
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.bellBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/parents/announcements' as any)}
              >
                <Text style={{ fontSize: 17 }}>🔔</Text>
                {unreadAnnouncementsCount > 0 && <View style={styles.bellDot} />}
              </TouchableOpacity>

              <View style={styles.profilePill}>
                <Image
                  source={parentPhoto}
                  style={styles.headerAvatarImg}
                  resizeMode="cover"
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
                  <Text style={styles.profileRole}>Parent</Text>
                </View>
                <Text style={styles.profileChevron}>⌄</Text>
              </View>
            </View>
          </View>

          {/* ─── Toast Feedback ─────────────────────────────────────────── */}
          {toastMessage && (
            <View style={styles.toastBanner}>
              <Text style={styles.toastIcon}>✓</Text>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

          {/* ─── 2. PROFILE HERO (CLEAN ABSTRACT DESIGN WITH REAL PHOTO & HIGHLIGHTED QUOTE) ─── */}
          <View style={[styles.heroCard, !isDesktop && styles.heroCardStacked]}>
            {/* Background Soft Organic Shapes */}
            <View style={styles.heroDecoCircle1} />
            <View style={styles.heroDecoCircle2} />
            <View style={styles.heroDecoCircle3} />

            {/* Left: Profile Photo & Parent Identity Details */}
            <View style={styles.heroIdentitySection}>
              {/* Real Uploaded Parent Profile Image */}
              <View style={styles.avatarContainer}>
                <Image
                  source={parentPhoto}
                  style={styles.realAvatarImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.cameraBadge}
                  activeOpacity={0.8}
                  onPress={() => setIsEditModalOpen(true)}
                >
                  <Text style={styles.cameraIcon}>📷</Text>
                </TouchableOpacity>
              </View>

              {/* Parent Details */}
              <View style={styles.identityDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.heroName}>{displayName}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeIcon}>👥</Text>
                    <Text style={styles.roleBadgeText}>PARENT</Text>
                  </View>
                </View>

                {/* Contact Rows */}
                <View style={styles.heroMetaList}>
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.metaIcon}>✉️</Text>
                    <Text style={styles.metaText}>{displayEmail}</Text>
                  </View>
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.metaIcon}>📞</Text>
                    <Text style={styles.metaText}>{displayPhone}</Text>
                  </View>
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.metaIcon}>📍</Text>
                    <Text style={styles.metaText} numberOfLines={1}>{formData.city}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Middle: Faint Abstract Educational Connection Space */}
            {isDesktop && (
              <View style={styles.middleDecorSection}>
                <SubtleMiddleDecorations />
              </View>
            )}

            {/* Right: Highlighted Premium Quote Card */}
            <View style={[styles.heroRightSide, !isDesktop && styles.heroRightSideMobile]}>
              <View style={styles.highlightedQuoteCard}>
                <View style={styles.quoteCardTop}>
                  <Text style={styles.quoteLargeMark}>“</Text>
                  <View style={styles.quoteSupportingPill}>
                    <Text style={styles.quotePillText}>Parent Partnership 2026–2027</Text>
                  </View>
                </View>
                <Text style={styles.quoteMainText}>
                  Education is a journey we take together.
                </Text>
              </View>
            </View>
          </View>

          {/* ─── 3. PROFILE NAVIGATION TABS (3 EQUAL-WIDTH TABS) ─────────── */}
          <View style={styles.tabsWrapper}>
            <View style={styles.tabsRow}>
              {/* Tab 1: Personal Information */}
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'personal' && styles.tabButtonActive]}
                onPress={() => setActiveTab('personal')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabIcon, activeTab === 'personal' && styles.tabIconActive]}>👤</Text>
                <Text style={[styles.tabLabel, activeTab === 'personal' && styles.tabLabelActive]}>
                  Personal Information
                </Text>
                {activeTab === 'personal' && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>

              {/* Tab 2: Child / Children */}
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'children' && styles.tabButtonActive]}
                onPress={() => setActiveTab('children')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabIcon, activeTab === 'children' && styles.tabIconActive]}>👥</Text>
                <Text style={[styles.tabLabel, activeTab === 'children' && styles.tabLabelActive]}>
                  Child / Children
                </Text>
                {activeTab === 'children' && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>

              {/* Tab 3: Security */}
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'security' && styles.tabButtonActive]}
                onPress={() => setActiveTab('security')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabIcon, activeTab === 'security' && styles.tabIconActive]}>🛡️</Text>
                <Text style={[styles.tabLabel, activeTab === 'security' && styles.tabLabelActive]}>
                  Security
                </Text>
                {activeTab === 'security' && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── 4. TAB CONTENT AREA ──────────────────────────────────────── */}

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <View style={[styles.twoColGrid, !isDesktop && styles.twoColGridStacked]}>
              {/* Left Card: Personal Details */}
              <View style={styles.leftColCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EEF2FF' }]}>
                      <Text style={{ fontSize: 16 }}>👤</Text>
                    </View>
                    <View>
                      <Text style={styles.cardHeaderTitle}>Personal Details</Text>
                      <Text style={styles.cardHeaderSub}>Primary Guardian Contact Information</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.cardEditAction}
                    onPress={() => setIsEditModalOpen(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cardEditActionText}>✏️ Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* Aligned Icon | Label | Value Rows */}
                <View style={styles.infoRowsList}>
                  {/* Full Name */}
                  <View style={styles.infoRowItem}>
                    <View style={styles.infoRowLeft}>
                      <Text style={styles.infoRowIcon}>👤</Text>
                      <Text style={styles.infoRowLabel}>Full Name</Text>
                    </View>
                    <Text style={styles.infoRowValue}>{displayName}</Text>
                  </View>

                  {/* Email Address */}
                  <View style={styles.infoRowItem}>
                    <View style={styles.infoRowLeft}>
                      <Text style={styles.infoRowIcon}>✉️</Text>
                      <Text style={styles.infoRowLabel}>Email Address</Text>
                    </View>
                    <Text style={[styles.infoRowValue, { color: '#2563EB' }]}>{displayEmail}</Text>
                  </View>

                  {/* Phone Number */}
                  <View style={styles.infoRowItem}>
                    <View style={styles.infoRowLeft}>
                      <Text style={styles.infoRowIcon}>📞</Text>
                      <Text style={styles.infoRowLabel}>Phone Number</Text>
                    </View>
                    <Text style={styles.infoRowValue}>{displayPhone}</Text>
                  </View>

                  {/* Occupation */}
                  <View style={styles.infoRowItem}>
                    <View style={styles.infoRowLeft}>
                      <Text style={styles.infoRowIcon}>💼</Text>
                      <Text style={styles.infoRowLabel}>Occupation</Text>
                    </View>
                    <Text style={styles.infoRowValue}>{displayOccupation}</Text>
                  </View>

                  {/* Address */}
                  <View style={[styles.infoRowItem, { borderBottomWidth: 0 }]}>
                    <View style={styles.infoRowLeft}>
                      <Text style={styles.infoRowIcon}>📍</Text>
                      <Text style={styles.infoRowLabel}>Address</Text>
                    </View>
                    <Text style={[styles.infoRowValue, styles.infoRowAddressVal]}>
                      {displayAddress}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Card: Quick Info (Aligned 3 Top Cards + Bottom Emergency Card) */}
              <View style={styles.rightColCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Text style={{ fontSize: 16 }}>📊</Text>
                    </View>
                    <View>
                      <Text style={styles.cardHeaderTitle}>Quick Info</Text>
                      <Text style={styles.cardHeaderSub}>Portal Registration & Emergency</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.quickInfoBody}>
                  {/* Top 3 Equal-Width Cards in Row */}
                  <View style={styles.quickTopThreeRow}>
                    {/* 1. Children Enrolled (Blue) */}
                    <TouchableOpacity
                      style={[styles.quickCardItem, { backgroundColor: '#F0F7FF', borderColor: '#DBEAFE' }]}
                      activeOpacity={0.8}
                      onPress={() => setActiveTab('children')}
                    >
                      <View style={styles.quickCardTop}>
                        <View style={[styles.quickCardIconCircle, { backgroundColor: '#DBEAFE' }]}>
                          <Text style={{ fontSize: 15 }}>👥</Text>
                        </View>
                        <Text style={[styles.quickCardArrow, { color: '#3B82F6' }]}>›</Text>
                      </View>
                      <Text style={[styles.quickCardVal, { color: '#1E3A8A' }]}>2</Text>
                      <Text style={styles.quickCardTitle}>Children Enrolled</Text>
                    </TouchableOpacity>

                    {/* 2. Active Since (Green) */}
                    <View style={[styles.quickCardItem, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                      <View style={styles.quickCardTop}>
                        <View style={[styles.quickCardIconCircle, { backgroundColor: '#D1FAE5' }]}>
                          <Text style={{ fontSize: 15 }}>📅</Text>
                        </View>
                        <Text style={[styles.quickCardArrow, { color: '#10B981' }]}>›</Text>
                      </View>
                      <Text style={[styles.quickCardVal, { color: '#065F46' }]}>Aug 2024</Text>
                      <Text style={styles.quickCardTitle}>Active Since</Text>
                    </View>

                    {/* 3. Account Status (Purple) */}
                    <View style={[styles.quickCardItem, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' }]}>
                      <View style={styles.quickCardTop}>
                        <View style={[styles.quickCardIconCircle, { backgroundColor: '#EDE9FE' }]}>
                          <Text style={{ fontSize: 15 }}>🛡️</Text>
                        </View>
                        <Text style={[styles.quickCardArrow, { color: '#8B5CF6' }]}>›</Text>
                      </View>
                      <Text style={[styles.quickCardVal, { color: '#5B21B6' }]}>Active</Text>
                      <Text style={styles.quickCardTitle}>Account Status</Text>
                    </View>
                  </View>

                  {/* Bottom: Emergency Contact Card (Aligned) */}
                  <TouchableOpacity
                    style={[styles.emergencyContactCard, { backgroundColor: '#FDF2F8', borderColor: '#FCE7F3' }]}
                    activeOpacity={0.8}
                    onPress={() => setIsEditModalOpen(true)}
                  >
                    <View style={styles.emergencyLeft}>
                      <View style={[styles.quickCardIconCircle, { backgroundColor: '#FCE7F3', width: 34, height: 34, borderRadius: 17 }]}>
                        <Text style={{ fontSize: 16 }}>📞</Text>
                      </View>
                      <View>
                        <Text style={styles.emergencyLabel}>Emergency Contact</Text>
                        <Text style={styles.emergencyVal}>{formData.emergencyContact}</Text>
                      </View>
                    </View>
                    <Text style={[styles.quickCardArrow, { color: '#EC4899', fontSize: 18 }]}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: CHILD / CHILDREN */}
          {activeTab === 'children' && (
            <View style={styles.tabPaneContainer}>
              <View style={styles.paneHeader}>
                <View>
                  <Text style={styles.paneTitle}>Registered Children (2)</Text>
                  <Text style={styles.paneSubtitle}>Manage student profiles, academic status, and direct reports</Text>
                </View>
                <TouchableOpacity
                  style={styles.paneHeaderBtn}
                  onPress={() => router.push('/parents/children' as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.paneHeaderBtnText}>Full Children Directory →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.childrenGrid}>
                {childrenList.map((child) => (
                  <View key={child.id} style={styles.childCardLarge}>
                    {/* Child Card Header */}
                    <View style={styles.childCardTop}>
                      <View style={[styles.childAvatarLarge, { backgroundColor: child.avatarBg }]}>
                        <Text style={styles.childAvatarLargeText}>{child.initial}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.childCardName}>{child.name}</Text>
                          <View style={styles.childActiveBadge}>
                            <Text style={styles.childActiveBadgeText}>● {child.status}</Text>
                          </View>
                        </View>
                        <Text style={styles.childCardClass}>{child.class}</Text>
                        <Text style={styles.childCardMeta}>
                          Roll #{child.rollNumber} · {child.admissionNo}
                        </Text>
                      </View>
                    </View>

                    {/* Academic Metrics Row */}
                    <View style={styles.childMetricsRow}>
                      <View style={styles.childMetricBox}>
                        <Text style={styles.childMetricLabel}>ATTENDANCE</Text>
                        <Text style={[styles.childMetricVal, { color: '#16A34A' }]}>{child.attendance}%</Text>
                        <Text style={styles.childMetricSub}>▲ {child.attendanceTrend} this term</Text>
                      </View>
                      <View style={styles.childMetricBox}>
                        <Text style={styles.childMetricLabel}>LATEST GRADE</Text>
                        <Text style={[styles.childMetricVal, { color: '#4F46E5' }]}>{child.latestGrade}</Text>
                        <Text style={styles.childMetricSub}>Overall A Grade</Text>
                      </View>
                      <View style={styles.childMetricBox}>
                        <Text style={styles.childMetricLabel}>FEES STATUS</Text>
                        <Text style={[styles.childMetricVal, { color: child.feeStatus === 'Paid' ? '#16A34A' : '#D97706' }]}>
                          {child.pendingFee}
                        </Text>
                        <Text style={styles.childMetricSub}>{child.feeStatus}</Text>
                      </View>
                    </View>

                    {/* Child Action Buttons */}
                    <View style={styles.childActionsRow}>
                      <TouchableOpacity
                        style={styles.childActionBtn}
                        onPress={() => {
                          setSelectedChildId(child.id);
                          router.push('/parents/attendance' as any);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.childActionIcon}>📊</Text>
                        <Text style={styles.childActionText}>Attendance</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.childActionBtn}
                        onPress={() => {
                          setSelectedChildId(child.id);
                          router.push('/parents/results' as any);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.childActionIcon}>🏆</Text>
                        <Text style={styles.childActionText}>Results</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.childActionBtn}
                        onPress={() => {
                          setSelectedChildId(child.id);
                          router.push('/parents/timetable' as any);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.childActionIcon}>📅</Text>
                        <Text style={styles.childActionText}>Timetable</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.childActionBtn, styles.childActionBtnPrimary]}
                        onPress={() => setSelectedChildDetail(child)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.childActionText, { color: '#FFFFFF' }]}>View Profile →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <View style={styles.tabPaneContainer}>
              <View style={styles.paneHeader}>
                <View>
                  <Text style={styles.paneTitle}>Account Security & Authentication</Text>
                  <Text style={styles.paneSubtitle}>Manage your login password, 2FA, and authorized device sessions</Text>
                </View>
              </View>

              <View style={[styles.securityGrid, !isDesktop && styles.securityGridStacked]}>
                {/* Card 1: Password & Auth */}
                <View style={styles.securityCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EEF2FF' }]}>
                        <Text style={{ fontSize: 16 }}>🔑</Text>
                      </View>
                      <View>
                        <Text style={styles.cardHeaderTitle}>Password & Credentials</Text>
                        <Text style={styles.cardHeaderSub}>Last changed 45 days ago</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.securityContentBox}>
                    <View style={styles.passwordDisplayRow}>
                      <View>
                        <Text style={styles.passwordMasked}>••••••••••••</Text>
                        <Text style={styles.passwordHelp}>Strong encryption enabled (SHA-256)</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.changePassBtn}
                        onPress={() => setIsPasswordModalOpen(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.changePassBtnText}>Change Password</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.securityDivider} />

                    {/* 2FA Section */}
                    <View style={styles.twoFactorRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.twoFactorTitle}>Two-Factor Authentication (2FA)</Text>
                        <Text style={styles.twoFactorSub}>
                          Receive a verification OTP on your registered mobile number during login.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.twoFactorToggleBtn,
                          twoFactorEnabled && styles.twoFactorToggleBtnActive,
                        ]}
                        onPress={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          showToast(
                            !twoFactorEnabled
                              ? 'Two-Factor Authentication activated'
                              : 'Two-Factor Authentication disabled'
                        );
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.twoFactorToggleText,
                            twoFactorEnabled && { color: '#FFFFFF' },
                          ]}
                        >
                          {twoFactorEnabled ? '✓ Enabled' : 'Optional / Enable'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Card 2: Login Activity */}
                <View style={styles.securityCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.cardHeaderIconBox, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={{ fontSize: 16 }}>💻</Text>
                      </View>
                      <View>
                        <Text style={styles.cardHeaderTitle}>Recent Login Activity</Text>
                        <Text style={styles.cardHeaderSub}>Track active browser & app sessions</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => showToast('All other sessions signed out')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.signOutOtherLink}>Sign Out Others</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sessionsList}>
                    {/* Session 1: Current */}
                    <View style={styles.sessionItem}>
                      <View style={[styles.sessionIconBox, { backgroundColor: '#EFF6FF' }]}>
                        <Text style={{ fontSize: 16 }}>🌐</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.sessionDevice}>Chrome 128 on Windows 11</Text>
                          <View style={styles.currentSessionBadge}>
                            <Text style={styles.currentSessionText}>Current Session</Text>
                          </View>
                        </View>
                        <Text style={styles.sessionLocation}>Hyderabad, Telangana · Today, 02:15 PM</Text>
                      </View>
                    </View>

                    {/* Session 2 */}
                    <View style={styles.sessionItem}>
                      <View style={[styles.sessionIconBox, { backgroundColor: '#F8FAFC' }]}>
                        <Text style={{ fontSize: 16 }}>📱</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sessionDevice}>Mobile App (iOS 18)</Text>
                        <Text style={styles.sessionLocation}>Hyderabad, Telangana · Yesterday, 08:30 PM</Text>
                      </View>
                    </View>

                    {/* Session 3 */}
                    <View style={[styles.sessionItem, { borderBottomWidth: 0 }]}>
                      <View style={[styles.sessionIconBox, { backgroundColor: '#F8FAFC' }]}>
                        <Text style={{ fontSize: 16 }}>🌐</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sessionDevice}>Safari on macOS</Text>
                        <Text style={styles.sessionLocation}>Hyderabad, Telangana · Sep 24, 2026, 11:12 AM</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ─── 5. RECENT ACTIVITY (COMPACT & PERFECT ALIGNMENT) ───────────── */}
          <View style={styles.recentActivityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={{ fontSize: 15 }}>🕒</Text>
                </View>
                <View>
                  <Text style={styles.cardHeaderTitle}>Recent Activity</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/parents/dashboard' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            {/* Activity Rows */}
            <View style={styles.activityList}>
              {recentActivities.map((act, index) => (
                <View
                  key={act.id}
                  style={[
                    styles.activityRow,
                    index === recentActivities.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[styles.activityIconCircle, { backgroundColor: act.iconBg }]}>
                    <Text style={{ fontSize: 14 }}>{act.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.activityTopLine}>
                      <Text style={styles.activityTitle}>{act.title}</Text>
                      {act.childName && (
                        <View style={[styles.childTagPill, { backgroundColor: act.childBg }]}>
                          <Text style={[styles.childTagText, { color: act.childColor }]}>
                            {act.childName}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.activityDesc}>{act.description}</Text>
                  </View>
                  <Text style={styles.activityTime}>{act.timestamp}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── 6. ACCOUNT FOOTER ───────────────────────────────────────── */}
          <View style={styles.accountFooter}>
            <View style={styles.accountFooterInfo}>
              <Text style={styles.accountFooterTitle}>Parent Portal Account · Session Active</Text>
              <Text style={styles.accountFooterSub}>
                Logged in as {displayEmail} (ID: PID-2024-8891)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutIcon}>🚪</Text>
              <Text style={styles.signOutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>

      {/* ─── MODAL 1: EDIT PROFILE MODAL ──────────────────────────────── */}
      <Modal
        visible={isEditModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={{ fontSize: 16 }}>✏️</Text>
                </View>
                <View>
                  <Text style={styles.modalTitle}>Edit Profile Information</Text>
                  <Text style={styles.modalSub}>Update guardian contact & employment details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Full Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Parent Full Name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Email (Readonly) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address (Registered Account)</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputDisabled]}
                  value={formData.email}
                  editable={false}
                  placeholder="Email"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={styles.formHelper}>Email changes require school administration verification.</Text>
              </View>

              {/* Phone & Alternate Phone */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Primary Phone</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="+91 Phone number"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Alternate Phone</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.alternatePhone}
                    onChangeText={(text) => setFormData({ ...formData, alternatePhone: text })}
                    placeholder="+91 Alternate number"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Occupation */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Occupation / Designation</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.occupation}
                  onChangeText={(text) => setFormData({ ...formData, occupation: text })}
                  placeholder="e.g. Software Architect"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Address */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Residential Address</Text>
                <TextInput
                  style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                  value={formData.address}
                  multiline
                  numberOfLines={3}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Full Home Address"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Emergency Contact */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Emergency Contact Person</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.emergencyContactName}
                    onChangeText={(text) => setFormData({ ...formData, emergencyContactName: text })}
                    placeholder="Name & Relationship"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Emergency Phone</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.emergencyContact}
                    onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
                    placeholder="Emergency Phone"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 2: CHANGE PASSWORD MODAL ────────────────────────────── */}
      <Modal
        visible={isPasswordModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 460 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={{ fontSize: 16 }}>🔒</Text>
                </View>
                <View>
                  <Text style={styles.modalTitle}>Change Account Password</Text>
                  <Text style={styles.modalSub}>Enhance account protection</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsPasswordModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Password</Text>
                <TextInput
                  style={styles.formInput}
                  secureTextEntry
                  value={passwordData.current}
                  onChangeText={(text) => setPasswordData({ ...passwordData, current: text })}
                  placeholder="Enter current password"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Password</Text>
                <TextInput
                  style={styles.formInput}
                  secureTextEntry
                  value={passwordData.newPass}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPass: text })}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.formInput}
                  secureTextEntry
                  value={passwordData.confirmPass}
                  onChangeText={(text) => setPasswordData({ ...passwordData, confirmPass: text })}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsPasswordModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePassword}
              >
                <Text style={styles.modalSaveText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 3: CHILD QUICK DETAILS MODAL ────────────────────────── */}
      {selectedChildDetail && (
        <Modal
          visible={!!selectedChildDetail}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedChildDetail(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { maxWidth: 520 }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.childAvatarLarge, { backgroundColor: selectedChildDetail.avatarBg, width: 48, height: 48, borderRadius: 24 }]}>
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                      {selectedChildDetail.initial}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{selectedChildDetail.name}</Text>
                    <Text style={styles.modalSub}>{selectedChildDetail.class} · Roll #{selectedChildDetail.rollNumber}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedChildDetail(null)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalDetailTable}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Full Student Name</Text>
                    <Text style={styles.modalDetailVal}>{selectedChildDetail.name}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Class & Section</Text>
                    <Text style={styles.modalDetailVal}>{selectedChildDetail.class}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Admission Number</Text>
                    <Text style={styles.modalDetailVal}>{selectedChildDetail.admissionNo}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Roll Number</Text>
                    <Text style={styles.modalDetailVal}>#{selectedChildDetail.rollNumber}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Date of Birth</Text>
                    <Text style={styles.modalDetailVal}>{selectedChildDetail.dob}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Blood Group</Text>
                    <Text style={styles.modalDetailVal}>{selectedChildDetail.bloodGroup}</Text>
                  </View>
                  <View style={[styles.modalDetailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.modalDetailLabel}>Enrollment Status</Text>
                    <Text style={[styles.modalDetailVal, { color: '#16A34A', fontWeight: '700' }]}>
                      ● Active Enrolled
                    </Text>
                  </View>
                </View>

                {/* Shortcuts */}
                <Text style={styles.modalSectionLabel}>STUDENT DASHBOARD SHORTCUTS</Text>
                <View style={styles.modalShortcutsGrid}>
                  <TouchableOpacity
                    style={styles.modalShortcutBtn}
                    onPress={() => {
                      setSelectedChildId(selectedChildDetail.id);
                      setSelectedChildDetail(null);
                      router.push('/parents/attendance' as any);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>📊</Text>
                    <Text style={styles.modalShortcutText}>Attendance Report</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalShortcutBtn}
                    onPress={() => {
                      setSelectedChildId(selectedChildDetail.id);
                      setSelectedChildDetail(null);
                      router.push('/parents/results' as any);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>🏆</Text>
                    <Text style={styles.modalShortcutText}>Exam Marks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalShortcutBtn}
                    onPress={() => {
                      setSelectedChildId(selectedChildDetail.id);
                      setSelectedChildDetail(null);
                      router.push('/parents/timetable' as any);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>📅</Text>
                    <Text style={styles.modalShortcutText}>Weekly Timetable</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalShortcutBtn}
                    onPress={() => {
                      setSelectedChildId(selectedChildDetail.id);
                      setSelectedChildDetail(null);
                      router.push('/parents/fees' as any);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>💳</Text>
                    <Text style={styles.modalShortcutText}>Fees & Invoices</Text>
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

// ─── STYLESHEET ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 22,
    paddingBottom: SIZES.xxl,
    width: '100%',
  },
  pageInner: {
    width: '100%',
    maxWidth: 1320,
    alignSelf: 'center',
  },

  // ── 1. Top Header Bar
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  backArrow: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: -2,
  },
  headerTitleBox: {
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 6,
    paddingRight: 11,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  headerAvatarImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
  },
  profileInfo: {
    gap: 0,
  },
  profileName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  profileChevron: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 1,
  },

  // Toast
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
  },
  toastIcon: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 14,
  },
  toastText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── 2. Profile Hero Card
  heroCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E7F2FE',
    ...(IS_WEB
      ? {
          backgroundImage:
            'linear-gradient(135deg, #E8F4FD 0%, #D8ECFD 45%, #E3F1FD 75%, #EDF6FE 100%)',
        }
      : {}),
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7E2FE',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 165,
    gap: 24,
  },
  heroCardStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 20,
    gap: 16,
  },
  heroDecoCircle1: {
    position: 'absolute',
    top: -70,
    left: '20%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -90,
    right: '25%',
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroDecoCircle3: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(224, 242, 254, 0.5)',
  },
  heroIdentitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    zIndex: 2,
    flex: 1.1,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  realAvatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#DBEAFE',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cameraIcon: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  identityDetails: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  heroName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 14,
  },
  roleBadgeIcon: {
    fontSize: 10,
  },
  roleBadgeText: {
    color: '#4F46E5',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroMetaList: {
    gap: 3.5,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaIcon: {
    fontSize: 12,
    width: 15,
  },
  metaText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },

  // Middle Ambient Decor Section
  middleDecorSection: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingHorizontal: 8,
  },

  // Hero Right Side (Highlighted Quote Card)
  heroRightSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 2,
    flex: 1,
    maxWidth: 340,
  },
  heroRightSideMobile: {
    alignItems: 'stretch',
    maxWidth: '100%',
    width: '100%',
  },
  highlightedQuoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
  },
  quoteCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  quoteLargeMark: {
    fontSize: 24,
    color: '#4F46E5',
    fontWeight: '900',
    lineHeight: 22,
  },
  quoteSupportingPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  quotePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.2,
  },
  quoteMainText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    fontStyle: 'italic',
    lineHeight: 19,
  },

  // ── 3. Profile Navigation Tabs (3 Equal-Width Tabs)
  tabsWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: '#EEF2FF',
  },
  tabIcon: {
    fontSize: 15,
    opacity: 0.7,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -4,
    left: 24,
    right: 24,
    height: 2.5,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },

  // ── 4. Two Column Layout (Personal Details & Quick Info - Identical Height & Edges)
  twoColGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    alignItems: 'stretch',
  },
  twoColGridStacked: {
    flexDirection: 'column',
  },
  leftColCard: {
    flex: 1.18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
    justifyContent: 'space-between',
  },
  rightColCard: {
    flex: 0.82,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
    justifyContent: 'space-between',
  },

  // Card Headers
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardHeaderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  cardEditAction: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 8,
  },
  cardEditActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // Personal Info Rows (Aligned Left to Right)
  infoRowsList: {
    flex: 1,
    justifyContent: 'space-around',
    gap: 2,
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 140,
  },
  infoRowIcon: {
    fontSize: 14,
    width: 18,
    textAlign: 'center',
  },
  infoRowLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  infoRowValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
  },
  infoRowAddressVal: {
    maxWidth: 290,
    lineHeight: 18,
  },

  // Quick Info Body
  quickInfoBody: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  quickTopThreeRow: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  quickCardItem: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  quickCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickCardIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardArrow: {
    fontSize: 16,
    fontWeight: '800',
  },
  quickCardVal: {
    fontSize: 17.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  quickCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },

  // Bottom Emergency Contact Card
  emergencyContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  emergencyVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9D174D',
    marginTop: 1,
  },

  // ── Tab Panes (General)
  tabPaneContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  paneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    flexWrap: 'wrap',
    gap: 12,
  },
  paneTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  paneSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  paneHeaderBtn: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  paneHeaderBtnText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },

  // Children Cards
  childrenGrid: {
    gap: 16,
  },
  childCardLarge: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  childCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  childAvatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarLargeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  childCardName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  childActiveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  childActiveBadgeText: {
    color: '#15803D',
    fontSize: 10.5,
    fontWeight: '700',
  },
  childCardClass: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
    marginTop: 1,
  },
  childCardMeta: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  childMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 14,
  },
  childMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  childMetricLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  childMetricVal: {
    fontSize: 16.5,
    fontWeight: '800',
    marginBottom: 1,
  },
  childMetricSub: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  childActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  childActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  childActionBtnPrimary: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    marginLeft: 'auto',
  },
  childActionIcon: {
    fontSize: 13,
  },
  childActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // Security Pane
  securityGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  securityGridStacked: {
    flexDirection: 'column',
  },
  securityCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityContentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  passwordDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordMasked: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#0F172A',
  },
  passwordHelp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  changePassBtn: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  changePassBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  securityDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  twoFactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  twoFactorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  twoFactorSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  twoFactorToggleBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  twoFactorToggleBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  twoFactorToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  signOutOtherLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  sessionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sessionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDevice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  currentSessionBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentSessionText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  sessionLocation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // ── 5. Recent Activity (Compact & Perfect Alignment)
  recentActivityCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  activityList: {
    gap: 0,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  childTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  childTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activityDesc: {
    fontSize: 11.5,
    color: '#64748B',
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // ── 6. Account Footer
  accountFooter: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 12,
  },
  accountFooterInfo: {
    flex: 1,
  },
  accountFooterTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  accountFooterSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  signOutIcon: {
    fontSize: 13,
  },
  signOutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12.5,
  },

  // ── Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    padding: 22,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    marginTop: 14,
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  formInputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  formHelper: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  modalSaveBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalDetailTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalDetailLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  modalDetailVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modalShortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalShortcutBtn: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  modalShortcutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
});
