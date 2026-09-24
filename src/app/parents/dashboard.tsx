/**
 * ParentDashboard — High-Fidelity Reproduction of Reference Design.
 *
 * Visual sections:
 *  1. Top Header with search bar, notification bell & Vikram Sharma profile pill.
 *  2. Welcome Banner with pastel gradient, family reading vector illustration & inspirational quote card.
 *  3. My Children Section with clickable cards for Ananya Gupta (Class 7-B) & Rahul Sharma (Class 10-A).
 *  4. 6 Responsive KPI / Summary Cards in a row:
 *     - Attendance (94%, +5%)
 *     - Latest Result (A+, +2.4%)
 *     - Pending Fees (₹5,000, Pending)
 *     - Upcoming Events (3, This Month)
 *     - Teacher Messages (2, Unread)
 *     - Homework (4, Pending)
 *  5. 3-Column Main Grid:
 *     - Left: Ananya's Attendance Donut Chart (94%, 45 present, 2 absent, 1 late, 85% requirement badge)
 *     - Middle: Academic Performance Subject Bars (Math 95%, Science 92%, English 96%, Social 91%, Hindi/Telugu 94%)
 *     - Right: Upcoming Events List (PTM Sep 28, Gandhi Jayanti Oct 02, Fee Due Oct 15, Science Fair Oct 22)
 *  6. 3-Column Bottom Row:
 *     - Left: Recent Announcements (Half Yearly Exam Timetable)
 *     - Middle: Messages from Teachers (Ms. Priya Desai)
 *     - Right: Quick Actions (View Fees, Check Results, View Timetable, Message Teacher)
 *  7. Interactive child switching, search filtering, and detail modals.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useParentChild } from '../../context/ParentChildContext';
import { useParentData } from '../../context/ParentDataContext';
import { useApi } from '../../hooks/useApi';
import { getEvents } from '../../services/events';
import { getMyProfile } from '../../services/profile';
import { getStudentInvoices } from '../../services/finance';

const IS_WEB = Platform.OS === 'web';
const parentStudyBannerImg = require('../../../assets/images/parent-study-banner.png');

// ─── Color Palette (Matches Reference Exactly) ──────────────────────────────
const P = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#EDF2F7',
  text: '#0F172A',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  indigoBorder: '#C7D2FE',
  blue: '#2563EB',
  blueBg: '#EFF6FF',
  green: '#10B981',
  greenDark: '#15803D',
  greenBg: '#DCFCE7',
  amber: '#F59E0B',
  amberDark: '#D97706',
  amberBg: '#FEF3C7',
  red: '#EF4444',
  redBg: '#FEE2E2',
  pink: '#EC4899',
  pinkBg: '#FDF2F8',
  purple: '#8B5CF6',
  purpleBg: '#F5F3FF',
  teal: '#0D9488',
  tealBg: '#CCFBF1',
  orange: '#EA580C',
};

// ─── Provided Parent Study Illustration for Welcome Banner ──────────────────
function WelcomeBannerIllustration() {
  return (
    <Image
      source={parentStudyBannerImg}
      style={styles.bannerImage}
      resizeMode="contain"
      accessibilityLabel="Parent and child studying together"
    />
  );
}

// ─── SVG Attendance Donut Ring ──────────────────────────────────────────────
function AttendanceDonut({ pct }: { pct: number }) {
  const radius = 54;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  if (!IS_WEB) {
    return (
      <View style={styles.donutFallback}>
        <Text style={styles.donutValText}>{pct}%</Text>
        <Text style={styles.donutSubText}>Present</Text>
      </View>
    );
  }

  return (
    <View style={styles.donutWrap}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#4F46E5"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutValText}>{pct}%</Text>
        <Text style={styles.donutSubText}>Present</Text>
      </View>
    </View>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const { data: profile } = useApi(getMyProfile);
  const { data: eventsList } = useApi(() => getEvents(true));

  // Centralized parent data & child switching state
  const {
    selectedChildKey,
    setSelectedChildKey,
    selectedChild,
    childrenProfiles,
    unreadMessagesCount,
    unreadAnnouncementsCount,
    pendingHomeworkCount,
    upcomingEventsCount,
    timetable,
    announcements,
    homework,
    conversations,
  } = useParentData();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalItem, setModalItem] = useState<{ title: string; category: string; date: string; time?: string; location?: string; description: string } | null>(null);

  // Current active child data mock (switches reactively)
  const isAnanya = selectedChildKey === 'ananya';

  const childData = useMemo(() => {
    if (isAnanya) {
      return {
        id: 'c-ananya',
        name: 'Ananya Gupta',
        initial: 'A',
        avatarBg: '#F97316',
        class: 'Class 7 - B',
        attendanceRate: 94,
        attendanceTrend: '+5%',
        presentDays: 45,
        absentDays: 2,
        lateDays: 1,
        latestResult: 'A+',
        resultTrend: '+2.4%',
        pendingFees: '₹5,000',
        feeDueDate: '15 Oct 2026',
        upcomingEventsCount: 3,
        unreadMessages: unreadMessagesCount,
        pendingHomework: pendingHomeworkCount,
        subjects: [
          { name: 'Mathematics', grade: 'A+', pct: 95, color: '#4F46E5' },
          { name: 'Science', grade: 'A+', pct: 92, color: '#0D9488' },
          { name: 'English Language', grade: 'A+', pct: 96, color: '#2563EB' },
          { name: 'Social Studies', grade: 'A', pct: 91, color: '#EA580C' },
          { name: 'Hindi / Telugu', grade: 'A+', pct: 94, color: '#E11D48' },
        ],
      };
    }
    return {
      id: 'c-rahul',
      name: 'Rahul Sharma',
      initial: 'R',
      avatarBg: '#EC4899',
      class: 'Class 10 - A',
      attendanceRate: 98,
      attendanceTrend: '+2%',
      presentDays: 48,
      absentDays: 1,
      lateDays: 0,
      latestResult: 'A',
      resultTrend: '+1.8%',
      pendingFees: '₹0',
      feeDueDate: 'Paid',
      upcomingEventsCount: 3,
      unreadMessages: unreadMessagesCount,
      pendingHomework: pendingHomeworkCount,
      subjects: [
        { name: 'Mathematics', grade: 'A+', pct: 94, color: '#4F46E5' },
        { name: 'Physics & Chem', grade: 'A', pct: 89, color: '#0D9488' },
        { name: 'English Literature', grade: 'A+', pct: 93, color: '#2563EB' },
        { name: 'Social Science', grade: 'A', pct: 88, color: '#EA580C' },
        { name: 'Computer Science', grade: 'A+', pct: 98, color: '#8B5CF6' },
      ],
    };
  }, [isAnanya, unreadMessagesCount, pendingHomeworkCount]);

  // Multi-Category Live Search Matches
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: Array<{
      id: string;
      category: 'Timetable' | 'Homework' | 'Messages' | 'Announcements';
      title: string;
      subtitle: string;
      badgeColor: string;
      badgeBg: string;
      onClick: () => void;
    }> = [];

    // Search timetable
    timetable.forEach((slot) => {
      if (!slot.isBreak && (slot.subject.toLowerCase().includes(q) || slot.teacher.toLowerCase().includes(q))) {
        if (!results.some((r) => r.title === slot.subject && r.category === 'Timetable')) {
          results.push({
            id: 'tt-' + slot.id,
            category: 'Timetable',
            title: `${slot.subject} — Timetable`,
            subtitle: `${slot.teacher} · ${slot.day} ${slot.time} (${slot.room})`,
            badgeColor: '#2563EB',
            badgeBg: '#EFF6FF',
            onClick: () => router.push('/parents/timetable' as any),
          });
        }
      }
    });

    // Search homework
    homework.forEach((hw) => {
      if (
        hw.title.toLowerCase().includes(q) ||
        hw.subject.toLowerCase().includes(q) ||
        hw.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: 'hw-' + hw.id,
          category: 'Homework',
          title: `${hw.subject} Homework — ${hw.title}`,
          subtitle: `Due: ${hw.dueDate} · Status: ${hw.status} (${hw.teacher})`,
          badgeColor: '#10B981',
          badgeBg: '#DCFCE7',
          onClick: () => router.push('/parents/homework' as any),
        });
      }
    });

    // Search messages
    conversations.forEach((conv) => {
      if (
        conv.teacherName.toLowerCase().includes(q) ||
        conv.teacherRole.toLowerCase().includes(q) ||
        conv.messages.some((m) => m.content.toLowerCase().includes(q))
      ) {
        results.push({
          id: 'msg-' + conv.id,
          category: 'Messages',
          title: `Message from ${conv.teacherName}`,
          subtitle: `${conv.teacherRole} · ${conv.timeAgo}`,
          badgeColor: '#8B5CF6',
          badgeBg: '#F5F3FF',
          onClick: () => router.push('/parents/messages' as any),
        });
      }
    });

    // Search announcements
    announcements.forEach((ann) => {
      if (
        ann.title.toLowerCase().includes(q) ||
        ann.summary.toLowerCase().includes(q) ||
        ann.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: 'ann-' + ann.id,
          category: 'Announcements',
          title: `${ann.title} — Announcement`,
          subtitle: `${ann.date} · ${ann.category}`,
          badgeColor: '#F59E0B',
          badgeBg: '#FEF3C7',
          onClick: () => router.push('/parents/announcements' as any),
        });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, timetable, homework, conversations, announcements]);

  const upcomingEvents = [
    {
      id: 'e1',
      month: 'SEP',
      day: '28',
      dateColor: '#2563EB',
      dateBg: '#EFF6FF',
      title: 'Term 1 Parent-Teacher Meeting',
      meta: '🕒 10:00 AM - 12:00 PM',
      location: 'School Main Hall',
      desc: 'One-on-one session with class teacher and subject instructors to review academic progress and behavior.',
    },
    {
      id: 'e2',
      month: 'OCT',
      day: '02',
      dateColor: '#DC2626',
      dateBg: '#FEE2E2',
      title: 'Gandhi Jayanti Holiday',
      meta: '⊘ No classes',
      location: 'National Holiday',
      desc: 'School will remain closed on the occasion of Gandhi Jayanti. Regular classes resume the next working day.',
    },
    {
      id: 'e3',
      month: 'OCT',
      day: '15',
      dateColor: '#D97706',
      dateBg: '#FEF3C7',
      title: 'Fee Payment Due Date',
      meta: isAnanya ? 'Class 7 - Term 2' : 'Class 10 - Term 2',
      location: 'Online Payment Portal',
      desc: 'Final due date for second term tuition and laboratory fee installment. Late fees applicable post due date.',
    },
    {
      id: 'e4',
      month: 'OCT',
      day: '22',
      dateColor: '#2563EB',
      dateBg: '#EFF6FF',
      title: 'Science Exhibition',
      meta: 'School Auditorium',
      location: 'Auditorium Block B',
      desc: 'Annual STEM project exhibition showcasing innovative working models built by students from classes 6 to 12.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={IS_WEB ? ({ flex: 1, height: '100%', overflowY: 'auto' } as any) : { flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* ─── 1. TOP HEADER ──────────────────────────────────────────────── */}
        <View style={styles.topHeader}>
          {/* Search bar with Live Dropdown */}
          <View style={styles.searchBarWrap}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search announcements, exams, fees, lessons..."
                placeholderTextColor={P.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdown Overlay */}
            {searchResults.length > 0 && (
              <View style={styles.searchDropdown}>
                <View style={styles.searchDropdownHeader}>
                  <Text style={styles.searchDropdownTitle}>Matching Search Results</Text>
                  <Text style={styles.searchDropdownCount}>{searchResults.length} found</Text>
                </View>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.searchResultRow}
                    onPress={() => {
                      setSearchQuery('');
                      item.onClick();
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.searchBadge, { backgroundColor: item.badgeBg }]}>
                      <Text style={[styles.searchBadgeText, { color: item.badgeColor }]}>{item.category}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.searchResultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.searchArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Header Right (Bell + Profile) */}
          <View style={styles.headerRight}>
            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.bellBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/parents/announcements' as any)}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unreadAnnouncementsCount > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>

            {/* Profile Pill */}
            <TouchableOpacity
              style={styles.profilePill}
              activeOpacity={0.85}
              onPress={() => router.push('/parents/profile' as any)}
            >
              <View style={styles.avatarCircleV}>
                <Text style={styles.avatarVText}>V</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Vikram Sharma</Text>
                <Text style={styles.profileRole}>Parent</Text>
              </View>
              <Text style={styles.profileChevron}>⌄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 2. WELCOME BANNER ──────────────────────────────────────────── */}
        <View style={[styles.welcomeBanner, !isDesktop && !isTablet && styles.welcomeBannerMobile]}>
          {/* Left Greeting & Subtitle */}
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerHeading}>Welcome, Vikram 👋</Text>
            <Text style={styles.bannerSubtitle}>Stay connected with your child's learning journey</Text>
            <Text style={styles.bannerBadge}>Parent Portal · Academic Session 2026–2027</Text>
          </View>

          {/* Center Illustration */}
          <View style={[styles.bannerCenter, !isDesktop && !isTablet && styles.bannerCenterMobile]}>
            <WelcomeBannerIllustration />
          </View>

          {/* Right Floating Quote Card */}
          <View style={[styles.quoteCard, !isDesktop && !isTablet && styles.quoteCardMobile]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.quoteMark}>❝</Text>
              <Text style={styles.quoteText}>
                “Every small step in learning is a big step towards a brighter future.”
              </Text>
            </View>
            <View style={styles.sunIconBg}>
              <Text style={{ fontSize: 18 }}>😊</Text>
            </View>
          </View>
        </View>

        {/* ─── 3. MY CHILDREN SECTION ─────────────────────────────────────── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeaderTitle}>My Children</Text>
          <View style={styles.childrenRow}>
            {/* Child 1: Ananya Gupta */}
            <TouchableOpacity
              style={[styles.childCard, selectedChildKey === 'ananya' && styles.childCardActive]}
              onPress={() => setSelectedChildKey('ananya')}
              activeOpacity={0.85}
            >
              <View style={[styles.childAvatarCircle, { backgroundColor: '#F97316' }]}>
                <Text style={styles.childAvatarInit}>A</Text>
              </View>
              <View style={styles.childDetails}>
                <Text style={[styles.childName, selectedChildKey === 'ananya' && styles.childNameActive]}>
                  Ananya Gupta
                </Text>
                <Text style={styles.childClass}>Class 7 - B</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>▲ Active</Text>
              </View>
            </TouchableOpacity>

            {/* Child 2: Rahul Sharma */}
            <TouchableOpacity
              style={[styles.childCard, selectedChildKey === 'rahul' && styles.childCardActive]}
              onPress={() => setSelectedChildKey('rahul')}
              activeOpacity={0.85}
            >
              <View style={[styles.childAvatarCircle, { backgroundColor: '#EC4899' }]}>
                <Text style={styles.childAvatarInit}>R</Text>
              </View>
              <View style={styles.childDetails}>
                <Text style={[styles.childName, selectedChildKey === 'rahul' && styles.childNameActive]}>
                  Rahul Sharma
                </Text>
                <Text style={styles.childClass}>Class 10 - A</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>▲ Active</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 4. KPI SUMMARY CARDS (6 RESPONSIVE CARDS) ───────────────────── */}
        <View style={styles.kpiRow}>
          {/* 1. Attendance */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => router.push('/parents/attendance' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.kpiTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={{ fontSize: 16 }}>📅</Text>
              </View>
              <Text style={styles.kpiTitle}>Attendance</Text>
            </View>
            <View style={styles.kpiValRow}>
              <Text style={styles.kpiValue}>{childData.attendanceRate}%</Text>
              <View style={[styles.trendPill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.trendPillText, { color: '#15803D' }]}>▲ {childData.attendanceTrend}</Text>
              </View>
            </View>
            <Text style={styles.kpiSub}>This Term</Text>
          </TouchableOpacity>

          {/* 2. Latest Result */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => router.push('/parents/results' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.kpiTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={{ fontSize: 16 }}>📊</Text>
              </View>
              <Text style={styles.kpiTitle}>Latest Result</Text>
            </View>
            <View style={styles.kpiValRow}>
              <Text style={styles.kpiValue}>{childData.latestResult}</Text>
              <View style={[styles.trendPill, { backgroundColor: '#EEF2FF' }]}>
                <Text style={[styles.trendPillText, { color: '#4F46E5' }]}>▲ {childData.resultTrend}</Text>
              </View>
            </View>
            <Text style={styles.kpiSub}>Overall Grade</Text>
          </TouchableOpacity>

          {/* 3. Pending Fees */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => router.push('/parents/fees' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.kpiTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Text style={{ fontSize: 16 }}>💳</Text>
              </View>
              <Text style={styles.kpiTitle}>Pending Fees</Text>
            </View>
            <View style={styles.kpiValRow}>
              <Text style={styles.kpiValue}>{childData.pendingFees}</Text>
              <View style={[styles.trendPill, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.trendPillText, { color: '#D97706' }]}>Pending</Text>
              </View>
            </View>
            <Text style={styles.kpiSub}>Due on {childData.feeDueDate}</Text>
          </TouchableOpacity>

          {/* 4. Upcoming Events */}
          <TouchableOpacity
            style={styles.kpiCard}
            activeOpacity={0.8}
            onPress={() => router.push('/parents/announcements' as any)}
          >
            <View style={styles.kpiTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FDF2F8' }]}>
                <Text style={{ fontSize: 16 }}>🗓️</Text>
              </View>
              <Text style={styles.kpiTitle}>Upcoming Events</Text>
            </View>
            <View style={styles.kpiValRow}>
              <Text style={styles.kpiValue}>{childData.upcomingEventsCount}</Text>
            </View>
            <Text style={styles.kpiSub}>This Month</Text>
          </TouchableOpacity>

          {/* 5. Teacher Messages */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => router.push('/parents/messages' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.kpiTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF', position: 'relative' }]}>
                <Text style={{ fontSize: 16 }}>💬</Text>
                {unreadMessagesCount > 0 && <View style={styles.cardRedDot} />}
              </View>
              <Text style={styles.kpiTitle}>Teacher Messages</Text>
            </View>
            <View style={styles.kpiValRow}>
              <Text style={styles.kpiValue}>{childData.unreadMessages}</Text>
            </View>
            <Text style={styles.kpiSub}>Unread Messages</Text>
          </TouchableOpacity>

          {/* 6. Homework */}
          <TouchableOpacity
            style={styles.kpiCard}
            activeOpacity={0.8}
            onPress={() => router.push('/parents/homework' as any)}
          >
            <View style={styles.kpiTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={{ fontSize: 16 }}>📖</Text>
              </View>
              <Text style={styles.kpiTitle}>Homework</Text>
            </View>
            <View style={styles.kpiValRow}>
              <Text style={styles.kpiValue}>{childData.pendingHomework}</Text>
            </View>
            <Text style={styles.kpiSub}>Pending</Text>
          </TouchableOpacity>
        </View>

        {/* ─── 5. MAIN CONTENT 3-COLUMN GRID ──────────────────────────────── */}
        <View style={[styles.mainGrid, isDesktop && styles.mainGridDesktop]}>
          {/* COLUMN 1: ATTENDANCE CARD */}
          <View style={[styles.gridCard, styles.col1Card]}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={{ fontSize: 16 }}>📅</Text>
                </View>
                <View>
                  <Text style={styles.cardHeaderTitle}>{childData.name.split(' ')[0]}'s Attendance</Text>
                  <Text style={styles.cardHeaderSub}>Academic Year 2026–27</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/parents/attendance' as any)}>
                <Text style={styles.cardHeaderLink}>View Full Attendance →</Text>
              </TouchableOpacity>
            </View>

            {/* Donut Chart + Breakdown */}
            <View style={styles.attendanceBody}>
              <AttendanceDonut pct={childData.attendanceRate} />

              <View style={styles.attLegend}>
                <View style={styles.attLegendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.attLegendLabel}>Present</Text>
                  <Text style={styles.attLegendVal}>{childData.presentDays} days</Text>
                </View>

                <View style={styles.attLegendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.attLegendLabel}>Absent</Text>
                  <Text style={styles.attLegendVal}>{childData.absentDays} days</Text>
                </View>

                <View style={styles.attLegendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.attLegendLabel}>Late</Text>
                  <Text style={styles.attLegendVal}>{childData.lateDays} day</Text>
                </View>
              </View>
            </View>

            {/* Validation badge */}
            <View style={styles.attValidationPill}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.attValidationText}>Meets 85% requirement for board examinations</Text>
            </View>
          </View>

          {/* COLUMN 2: ACADEMIC PERFORMANCE CARD */}
          <View style={[styles.gridCard, styles.col2Card]}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={{ fontSize: 16 }}>📊</Text>
                </View>
                <View>
                  <Text style={styles.cardHeaderTitle}>Academic Performance</Text>
                  <Text style={styles.cardHeaderSub}>{childData.name} · {childData.class}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/parents/results' as any)}>
                <Text style={styles.cardHeaderLink}>View Full Results →</Text>
              </TouchableOpacity>
            </View>

            {/* Subject Progress Bars */}
            <View style={styles.subjectsList}>
              {childData.subjects.map((sub) => (
                <View key={sub.name} style={styles.subjectRow}>
                  <View style={styles.subjectHeader}>
                    <Text style={styles.subjectName}>{sub.name}</Text>
                    <View style={styles.subjectScoreWrap}>
                      <View style={styles.gradeBadge}>
                        <Text style={styles.gradeBadgeText}>{sub.grade}</Text>
                      </View>
                      <Text style={styles.subjectPctText}>{sub.pct}%</Text>
                    </View>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${sub.pct}%` as any, backgroundColor: sub.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* COLUMN 3: UPCOMING EVENTS CARD */}
          <View style={[styles.gridCard, styles.col3Card]}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.cardHeaderIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={{ fontSize: 16 }}>🗓️</Text>
                </View>
                <Text style={styles.cardHeaderTitle}>Upcoming Events</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/parents/announcements' as any)}>
                <Text style={styles.cardHeaderLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            {/* Events List */}
            <View style={styles.eventsList}>
              {upcomingEvents.map((ev) => (
                <TouchableOpacity
                  key={ev.id}
                  style={styles.eventItem}
                  activeOpacity={0.8}
                  onPress={() => setModalItem({
                    title: ev.title,
                    category: 'Event Detail',
                    date: `${ev.month} ${ev.day}, 2026`,
                    time: ev.meta,
                    location: ev.location,
                    description: ev.desc,
                  })}
                >
                  <View style={[styles.eventDateBox, { backgroundColor: ev.dateBg }]}>
                    <Text style={[styles.eventMonthText, { color: ev.dateColor }]}>{ev.month}</Text>
                    <Text style={[styles.eventDayText, { color: ev.dateColor }]}>{ev.day}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitleText} numberOfLines={1}>{ev.title}</Text>
                    <Text style={styles.eventMetaText}>{ev.meta}</Text>
                  </View>
                  <Text style={styles.eventArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ─── 6. BOTTOM 3-COLUMN SECTION ─────────────────────────────────── */}
        <View style={[styles.bottomRow, isDesktop && styles.bottomRowDesktop]}>
          {/* 1. Recent Announcements */}
          <View style={[styles.gridCard, styles.bottomCol]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={{ fontSize: 18, marginRight: 4 }}>📢</Text>
                <Text style={styles.cardHeaderTitle}>Recent Announcements</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/parents/announcements' as any)}>
                <Text style={styles.cardHeaderLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.announcementCard}
              activeOpacity={0.8}
              onPress={() => router.push('/parents/announcements' as any)}
            >
              <View style={styles.announcementIconCircle}>
                <Text style={styles.announcementIconText}>A</Text>
              </View>
              <View style={styles.announcementTextWrap}>
                <View style={styles.announcementTopRow}>
                  <Text style={styles.announcementTitle}>Half Yearly Exam Timetable Released</Text>
                  <Text style={styles.announcementDate}>20 Sep 2026</Text>
                </View>
                <Text style={styles.announcementDesc}>
                  Please check the exam schedule for Class 7 and 10.
                </Text>
              </View>
              <Text style={styles.eventArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Messages from Teachers */}
          <View style={[styles.gridCard, styles.bottomCol]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={{ fontSize: 18, marginRight: 4 }}>💬</Text>
                <Text style={styles.cardHeaderTitle}>Messages from Teachers</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/parents/messages' as any)}>
                <Text style={styles.cardHeaderLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.teacherMsgCard}
              activeOpacity={0.8}
              onPress={() => router.push('/parents/messages' as any)}
            >
              <View style={styles.teacherAvatarCircle}>
                <Text style={styles.teacherAvatarText}>👩‍🏫</Text>
              </View>
              <View style={styles.teacherMsgTextWrap}>
                <View style={styles.teacherTopRow}>
                  <Text style={styles.teacherName}>Ms. Priya Desai</Text>
                  <Text style={styles.teacherTime}>Science · 2 hours ago</Text>
                </View>
                <Text style={styles.teacherMsgBody}>
                  "{childData.name.split(' ')[0]} is doing well in science. Please encourage her to participate more actively."
                </Text>
              </View>
              <Text style={styles.eventArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* 3. Quick Actions */}
          <View style={[styles.gridCard, styles.bottomCol]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={{ fontSize: 18, marginRight: 4 }}>⚡</Text>
                <Text style={styles.cardHeaderTitle}>Quick Actions</Text>
              </View>
            </View>

            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={[styles.qaBtn, { backgroundColor: '#FDF2F8' }]}
                onPress={() => router.push('/parents/fees' as any)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 20 }}>👛</Text>
                <Text style={styles.qaBtnText}>View Fees</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qaBtn, { backgroundColor: '#ECFDF5' }]}
                onPress={() => router.push('/parents/results' as any)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 20 }}>📊</Text>
                <Text style={styles.qaBtnText}>Check Results</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qaBtn, { backgroundColor: '#EFF6FF' }]}
                onPress={() => router.push('/parents/timetable' as any)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 20 }}>🗓️</Text>
                <Text style={styles.qaBtnText}>View Timetable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qaBtn, { backgroundColor: '#FFFBEB' }]}
                onPress={() => router.push('/parents/messages' as any)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 20 }}>💬</Text>
                <Text style={styles.qaBtnText}>Message Teacher</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ─── INTERACTIVE DETAIL MODAL ─────────────────────────────────────── */}
      <Modal visible={!!modalItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <View style={styles.modalCategoryBadge}>
                <Text style={styles.modalCategoryText}>{modalItem?.category}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalItem(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitleText}>{modalItem?.title}</Text>
            <Text style={styles.modalDateText}>📅 {modalItem?.date} {modalItem?.time ? `· ${modalItem.time}` : ''}</Text>
            {modalItem?.location && (
              <Text style={styles.modalLocationText}>📍 {modalItem.location}</Text>
            )}

            <View style={styles.modalDivider} />

            <Text style={styles.modalDescText}>{modalItem?.description}</Text>

            <TouchableOpacity style={styles.modalActionBtn} onPress={() => setModalItem(null)}>
              <Text style={styles.modalActionBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Stylesheet (Matching Reference Typography & Proportions) ───────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 1440,
    alignSelf: 'center',
    width: '100%',
  },

  // ── 1. Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  searchBarWrap: {
    flex: 1,
    maxWidth: 640,
    position: 'relative',
    zIndex: 50,
  },
  searchBar: {
    width: '100%',
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  clearSearchBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  clearSearchText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  searchDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    overflow: 'hidden',
  },
  searchDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchDropdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  searchDropdownCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 10,
  },
  searchBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  searchBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  searchResultTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchResultSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  searchArrow: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
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
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 8,
    paddingRight: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircleV: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarVText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  profileInfo: {
    gap: 1,
  },
  profileName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  profileChevron: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 2,
  },

  // ── 2. Welcome Banner
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DFEEFD',
    ...(IS_WEB
      ? {
          backgroundImage: 'linear-gradient(135deg, #E2EFFD 0%, #D6EAFD 40%, #CEE4FD 75%, #DCEEFE 100%)',
        }
      : {}),
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7E2FE',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
    gap: 16,
    minHeight: 200,
  },
  welcomeBannerMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 18,
    gap: 16,
    minHeight: 'auto',
  },
  bannerLeft: {
    flex: 1,
    minWidth: 220,
    maxWidth: 320,
    justifyContent: 'center',
  },
  bannerHeading: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 13.5,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 8,
  },
  bannerBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  bannerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  bannerCenterMobile: {
    width: '100%',
    paddingHorizontal: 0,
    marginVertical: 4,
  },
  bannerImage: {
    width: '100%',
    maxWidth: 500,
    height: 180,
    ...(IS_WEB
      ? {
          objectFit: 'contain' as any,
          maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
        }
      : {}),
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 230,
    minWidth: 190,
    flexShrink: 0,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  quoteCardMobile: {
    maxWidth: '100%',
    width: '100%',
  },
  quoteMark: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 15,
    fontWeight: '500',
  },
  sunIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── 3. My Children Section
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  childrenRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  childCard: {
    flex: 1,
    minWidth: 260,
    maxWidth: 360,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  childCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  childAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarInit: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  childNameActive: {
    color: '#4F46E5',
  },
  childClass: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activePillText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── 4. KPI Summary Cards (6 in row)
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRedDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  kpiTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  kpiValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  trendPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // ── 5. Main 3-Column Grid
  mainGrid: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  mainGridDesktop: {
    flexDirection: 'row',
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  col1Card: {
    flex: 1,
  },
  col2Card: {
    flex: 1.3,
  },
  col3Card: {
    flex: 1.1,
  },

  // Card Headers
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardHeaderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  cardHeaderLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // Attendance Body
  attendanceBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
    gap: 16,
  },
  donutWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutValText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  donutSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  donutFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attLegend: {
    gap: 12,
    flex: 1,
  },
  attLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  attLegendLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  attLegendVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  attValidationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  checkIcon: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '900',
  },
  attValidationText: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Academic Performance Progress Bars
  subjectsList: {
    gap: 12,
  },
  subjectRow: {
    gap: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  subjectScoreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  subjectPctText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
  },

  // Upcoming Events List
  eventsList: {
    gap: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  eventDateBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMonthText: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  eventDayText: {
    fontSize: 14,
    fontWeight: '800',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  eventMetaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  eventArrow: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '300',
  },

  // ── 6. Bottom 3-Column Section
  bottomRow: {
    flexDirection: 'column',
    gap: 16,
  },
  bottomRowDesktop: {
    flexDirection: 'row',
  },
  bottomCol: {
    flex: 1,
  },

  // Announcements card
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  announcementIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementIconText: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 14,
  },
  announcementTextWrap: {
    flex: 1,
  },
  announcementTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  announcementTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  announcementDate: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginLeft: 6,
  },
  announcementDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // Teacher message card
  teacherMsgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  teacherAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherAvatarText: {
    fontSize: 18,
  },
  teacherMsgTextWrap: {
    flex: 1,
  },
  teacherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  teacherTime: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  teacherMsgBody: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  qaBtn: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qaBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalCategoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalCategoryText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalDateText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  modalLocationText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  modalDescText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActionBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
