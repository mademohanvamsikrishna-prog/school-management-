/**
 * ParentDashboard — Acade-style Comprehensive Visual Redesign & Expansion.
 *
 * Enhanced with 10 interactive, child-specific sections:
 *  1. Welcome Header & Vikram Sharma Parent Avatar [ V ]
 *  2. My Children Selector (Rahul Sharma & Ananya Gupta)
 *  3. Attendance Overview & Monthly Calendar Preview (Donut + P/A/L mini grid)
 *  4. Academic Performance (Overall %, Grade, Class Rank, Subject Progress Bars)
 *  5. Fee Summary & Payment Settlement Progress Bar
 *  6. Quick Stats
 *  7. Notice Board
 *  8. Upcoming Events (Chronological with clickable detail modal)
 *  9. Assignments & Homework (Status badges: Pending, Submitted, Completed)
 * 10. Upcoming Exams (Schedule with countdown badges)
 * 11. Recent Activity (Color-coded dot timeline)
 * 12. Recent Messages (Teacher & Admin preview)
 * 13. School Engagement (Sports, Cultural, Clubs, Events, Library)
 * 14. Important Announcements (High-priority notices with detail modal)
 * 15. Interactive Detail Modal for Events & Notices
 */
import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingScreen } from '../../components/ScreenStates';
import { DonutChart } from '../../components/DonutChart';
import { ChildSelector } from '../../components/ChildSelector';
import { ChildAvatar } from '../../components/ChildAvatar';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getDashboardSummary } from '../../services/dashboard';
import { getEvents } from '../../services/events';
import { getMyProfile } from '../../services/profile';
import { getStudentInvoices } from '../../services/finance';

const IS_WEB = Platform.OS === 'web';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubjectScore {
  name: string;
  code: string;
  percentage: number;
  grade: string;
  color: string;
}

interface AssignmentItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Completed' | 'Overdue';
}

interface ExamScheduleItem {
  id: string;
  date: string;
  subject: string;
  time: string;
  daysRemaining: number;
}

interface ActivityItem {
  id: string;
  type: 'attendance' | 'marks' | 'fees' | 'announcement';
  color: string;
  timestamp: string;
  title: string;
  detail: string;
  childName?: string;
}

interface MessagePreview {
  id: string;
  senderRole: string;
  senderName: string;
  subject: string;
  preview: string;
  timestamp: string;
  unread?: boolean;
}

interface EngagementData {
  sports: number;
  sportsList: string[];
  cultural: number;
  culturalList: string[];
  clubs: number;
  clubsList: string[];
  eventsAttended: number;
  libraryBooks: number;
}

interface ModalDetailItem {
  title: string;
  category: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  badge?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // ─── API hooks ─────────────────────────────────────────────────────────────
  const { data: summary, loading: summaryLoading } = useApi(getDashboardSummary);
  const { data: events, loading: eventsLoading } = useApi(() => getEvents(true));
  const { data: profile, loading: profileLoading } = useApi(getMyProfile);

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<ModalDetailItem | null>(null);

  const children = profile?.parent_profile?.children || [];

  // Automatically select the first child when data loads
  if (children.length > 0 && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const { data: rawInvoices, loading: invoicesLoading } = useApi(
    async () => {
      if (!selectedChildId) return [];
      try {
        return await getStudentInvoices(selectedChildId);
      } catch {
        return [];
      }
    },
    [selectedChildId]
  );

  // ─── Active Child Determination ────────────────────────────────────────────
  const activeChild = children.find(c => c.id === selectedChildId) || (children.length > 0 ? children[0] : null);
  const isAnanya = activeChild?.name?.toLowerCase().includes('ananya');
  const isRahul = !isAnanya; // Defaults to Rahul Sharma if not Ananya

  const firstName = user?.name?.split(' ')[0] ?? 'Vikram';

  // ─── Child-Specific Datasets ───────────────────────────────────────────────

  // 1. Academic Performance
  const academicData = useMemo(() => {
    if (isAnanya) {
      return {
        overallPercentage: 93.6,
        overallGrade: 'A+',
        classRank: '#2 in Class 7-B',
        previousExamPercentage: 91.2,
        currentExamPercentage: 93.6,
        improvement: '+2.4%',
        subjects: [
          { name: 'Mathematics', code: 'MAT-701', percentage: 95, grade: 'A+', color: '#4F46E5' },
          { name: 'Science', code: 'SCI-702', percentage: 92, grade: 'A+', color: '#10B981' },
          { name: 'English Language', code: 'ENG-703', percentage: 96, grade: 'A+', color: '#6366F1' },
          { name: 'Social Studies', code: 'SST-704', percentage: 91, grade: 'A', color: '#F59E0B' },
          { name: 'Hindi / Telugu', code: 'LAN-705', percentage: 94, grade: 'A+', color: '#EC4899' },
        ] as SubjectScore[],
      };
    }
    // Rahul Sharma (Default)
    return {
      overallPercentage: 89.4,
      overallGrade: 'A',
      classRank: '#3 in Class 10-A',
      previousExamPercentage: 86.8,
      currentExamPercentage: 89.4,
      improvement: '+2.6%',
      subjects: [
        { name: 'Mathematics', code: 'MAT-101', percentage: 92, grade: 'A+', color: '#4F46E5' },
        { name: 'Science & Physics', code: 'SCI-102', percentage: 88, grade: 'A', color: '#10B981' },
        { name: 'English Language', code: 'ENG-103', percentage: 94, grade: 'A+', color: '#6366F1' },
        { name: 'Social Studies', code: 'SST-104', percentage: 90, grade: 'A', color: '#F59E0B' },
        { name: 'Hindi / Telugu', code: 'LAN-105', percentage: 83, grade: 'B+', color: '#EC4899' },
      ] as SubjectScore[],
    };
  }, [isAnanya]);

  // 2. Attendance & Mini Calendar Matrix
  const attendanceData = useMemo(() => {
    if (isAnanya) {
      return {
        percentage: 93.8,
        presentCount: 45,
        absentCount: 2,
        lateCount: 1,
        totalDays: 48,
        // 4-week sample matrix: P, A, L
        calendarWeeks: [
          ['P', 'P', 'P', 'P', 'P'],
          ['P', 'P', 'P', 'L', 'P'],
          ['P', 'P', 'P', 'P', 'P'],
          ['P', 'A', 'P', 'P', 'P'],
        ],
      };
    }
    // Rahul Sharma
    return {
      percentage: 91.7,
      presentCount: 44,
      absentCount: 3,
      lateCount: 1,
      totalDays: 48,
      calendarWeeks: [
        ['P', 'P', 'P', 'P', 'P'],
        ['P', 'P', 'L', 'P', 'P'],
        ['P', 'P', 'P', 'P', 'P'],
        ['P', 'A', 'P', 'P', 'P'],
      ],
    };
  }, [isAnanya]);

  // 3. Fee Summary & Payment Progress
  const feeData = useMemo(() => {
    if (rawInvoices && rawInvoices.length > 0) {
      const total = rawInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const paid = rawInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const pending = total - paid;
      const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
      return {
        total,
        paid,
        pending,
        progress,
        invoices: rawInvoices.slice(0, 4),
      };
    }

    if (isAnanya) {
      return {
        total: 37000,
        paid: 22000,
        pending: 15000,
        progress: 59,
        invoices: [
          { id: 'inv-a-1', title: 'Tuition Fee - Term 1', amount: 12500, due_date: '2026-08-15', status: 'paid' },
          { id: 'inv-a-4', title: 'Transport Fee - Q1', amount: 5500, due_date: '2026-09-05', status: 'paid' },
          { id: 'inv-a-5', title: 'Activity & Lab Fee', amount: 4000, due_date: '2026-08-20', status: 'paid' },
          { id: 'inv-a-2', title: 'Tuition Fee - Term 2', amount: 12500, due_date: '2026-12-15', status: 'pending' },
        ],
      };
    }

    // Rahul Sharma
    return {
      total: 39500,
      paid: 18500,
      pending: 21000,
      progress: 47,
      invoices: [
        { id: 'inv-r-1', title: 'Tuition Fee - Term 1', amount: 15000, due_date: '2026-08-15', status: 'paid' },
        { id: 'inv-r-3', title: 'Annual Board Exam Fee', amount: 3500, due_date: '2026-09-10', status: 'paid' },
        { id: 'inv-r-4', title: 'Transport Fee - Q2', amount: 6000, due_date: '2026-10-15', status: 'pending' },
        { id: 'inv-r-2', title: 'Tuition Fee - Term 2', amount: 15000, due_date: '2026-12-15', status: 'pending' },
      ],
    };
  }, [rawInvoices, isAnanya]);

  // 4. Assignments & Homework
  const assignments: AssignmentItem[] = useMemo(() => {
    if (isAnanya) {
      return [
        { id: 'asg-a1', subject: 'Mathematics', title: 'Fractions & Linear Equations Worksheet', dueDate: '21 Sep', status: 'Submitted' },
        { id: 'asg-a2', subject: 'Science', title: 'Chapter 4 Nutrition in Animals Diagram', dueDate: '23 Sep', status: 'Pending' },
        { id: 'asg-a3', subject: 'English', title: 'Creative Story Writing: The Enchanted Forest', dueDate: '24 Sep', status: 'Pending' },
        { id: 'asg-a4', subject: 'Social Studies', title: 'Delhi Sultanate Timeline Project', dueDate: '19 Sep', status: 'Completed' },
      ];
    }
    // Rahul Sharma
    return [
      { id: 'asg-r1', subject: 'Mathematics', title: 'Quadratic Equations Practice Set 3.2', dueDate: '21 Sep', status: 'Pending' },
      { id: 'asg-r2', subject: 'Science', title: 'Optics & Light Reflection Lab Notes', dueDate: '23 Sep', status: 'Submitted' },
      { id: 'asg-r3', subject: 'English', title: 'Formal Essay: Impact of AI on Society', dueDate: '25 Sep', status: 'Pending' },
      { id: 'asg-r4', subject: 'Social Studies', title: 'Nationalism in India Map Exercise', dueDate: '18 Sep', status: 'Completed' },
    ];
  }, [isAnanya]);

  // 5. Exam Schedule
  const upcomingExams: ExamScheduleItem[] = useMemo(() => {
    if (isAnanya) {
      return [
        { id: 'ex-a1', date: '25 Sep', subject: 'English Language & Lit', time: '10:00 AM - 12:30 PM', daysRemaining: 6 },
        { id: 'ex-a2', date: '27 Sep', subject: 'Mathematics', time: '10:00 AM - 01:00 PM', daysRemaining: 8 },
        { id: 'ex-a3', date: '30 Sep', subject: 'General Science', time: '10:00 AM - 12:30 PM', daysRemaining: 11 },
        { id: 'ex-a4', date: '04 Oct', subject: 'Social Science', time: '10:00 AM - 12:30 PM', daysRemaining: 15 },
      ];
    }
    // Rahul Sharma
    return [
      { id: 'ex-r1', date: '24 Sep', subject: 'Mathematics', time: '10:00 AM - 01:00 PM', daysRemaining: 5 },
      { id: 'ex-r2', date: '26 Sep', subject: 'Science & Physics', time: '10:00 AM - 01:00 PM', daysRemaining: 7 },
      { id: 'ex-r3', date: '29 Sep', subject: 'English Language', time: '10:00 AM - 12:30 PM', daysRemaining: 10 },
      { id: 'ex-r4', date: '03 Oct', subject: 'Social Studies', time: '10:00 AM - 01:00 PM', daysRemaining: 14 },
    ];
  }, [isAnanya]);

  // 6. School Engagement
  const engagementData: EngagementData = useMemo(() => {
    if (isAnanya) {
      return {
        sports: 2,
        sportsList: ['Junior Basketball Team', 'Swimming Club'],
        cultural: 4,
        culturalList: ['Classical Dance', 'School Choir', 'Fine Arts Circle', 'Drama Club'],
        clubs: 3,
        clubsList: ['Eco Green Club', 'Young Authors Guild', 'Junior Science Forum'],
        eventsAttended: 7,
        libraryBooks: 5,
      };
    }
    // Rahul Sharma
    return {
      sports: 3,
      sportsList: ['Cricket Team Captain', '100m Athletics Track', 'Table Tennis'],
      cultural: 2,
      culturalList: ['Inter-School Debate Team', 'Model United Nations (MUN)'],
      clubs: 2,
      clubsList: ['Robotics & AI Lab', 'Competitive Coding Club'],
      eventsAttended: 6,
      libraryBooks: 4,
    };
  }, [isAnanya]);

  // 7. Recent Activity
  const recentActivities: ActivityItem[] = useMemo(() => {
    const childName = activeChild?.name || (isAnanya ? 'Ananya Gupta' : 'Rahul Sharma');
    return [
      {
        id: 'act-1',
        type: 'attendance',
        color: '#10B981', // Green
        timestamp: 'Today',
        title: `Attendance marked for ${childName}`,
        detail: 'Status: Present (On-time 08:15 AM)',
        childName,
      },
      {
        id: 'act-2',
        type: 'marks',
        color: '#3B82F6', // Blue
        timestamp: 'Yesterday',
        title: `New ${isAnanya ? 'English Literature' : 'Mathematics'} score published`,
        detail: `${childName} scored ${isAnanya ? '96/100 (A+)' : '92/100 (A+)'}`,
        childName,
      },
      {
        id: 'act-3',
        type: 'fees',
        color: '#F97316', // Orange
        timestamp: '18 Sep',
        title: `Fee payment recorded successfully`,
        detail: `₹${isAnanya ? '12,500' : '15,000'} received for Term 1 Tuition · ${childName}`,
        childName,
      },
      {
        id: 'act-4',
        type: 'announcement',
        color: '#8B5CF6', // Purple
        timestamp: '17 Sep',
        title: 'New school announcement published',
        detail: 'Annual Science & Tech Exhibition 2026 registration opened',
      },
    ];
  }, [activeChild, isAnanya]);

  // 8. Recent Messages
  const recentMessages: MessagePreview[] = useMemo(() => {
    return [
      {
        id: 'msg-1',
        senderRole: 'Class Teacher',
        senderName: isAnanya ? 'Mrs. Anita Desai' : 'Mrs. Sunita Rao',
        subject: 'Parent-Teacher Meeting Confirmation',
        preview: `Hello Mr. Vikram, we have scheduled ${activeChild?.name}'s slot for Oct 22 at 10:30 AM.`,
        timestamp: 'Today · 10:30 AM',
        unread: true,
      },
      {
        id: 'msg-2',
        senderRole: 'Mathematics Teacher',
        senderName: 'Mr. Rajesh Verma',
        subject: 'Assignment Feedback & Performance',
        preview: `${activeChild?.name?.split(' ')[0]} demonstrated outstanding analytical problem solving in yesterday\'s quiz.`,
        timestamp: 'Yesterday · 04:15 PM',
        unread: false,
      },
      {
        id: 'msg-3',
        senderRole: 'School Administration',
        senderName: 'Principal Office',
        subject: 'Annual Sports Meet 2026 Announcement',
        preview: 'Track event selection schedule and practice timing details for next month.',
        timestamp: '18 Sep · 11:20 AM',
        unread: false,
      },
    ];
  }, [activeChild, isAnanya]);

  // 9. Chronological Upcoming Events
  const upcomingEventsList = useMemo(() => {
    return [
      {
        id: 'ev-1',
        dateDay: '15',
        dateMonth: 'OCT',
        title: 'Annual Sports Meet & Athletic Trials',
        category: 'Sports & Athletics',
        time: '09:00 AM - 03:30 PM',
        location: 'Main School Athletics Ground',
        description: 'Annual inter-house sports competitions including track events, relays, tug-of-war, and award ceremony. Parents are cordially invited to cheer the participants.',
        badge: 'Upcoming',
      },
      {
        id: 'ev-2',
        dateDay: '22',
        dateMonth: 'OCT',
        title: 'Parent-Teacher Academic Conference',
        category: 'Academic Review',
        time: '10:00 AM - 01:30 PM',
        location: 'Classroom Block A & B',
        description: 'Comprehensive one-on-one review session with subject teachers to discuss Term 1 progress cards, behavioral feedback, and exam strategies.',
        badge: 'Mandatory',
      },
      {
        id: 'ev-3',
        dateDay: '05',
        dateMonth: 'NOV',
        title: 'Science & Innovation Tech Exhibition',
        category: 'STEM & Tech Fair',
        time: '11:30 AM - 04:00 PM',
        location: 'Dr. APJ Abdul Kalam Auditorium',
        description: 'Showcase of working scientific models, robotics prototypes, AI demonstrations, and biology exhibits designed by middle and high school students.',
        badge: 'Exhibition',
      },
      {
        id: 'ev-4',
        dateDay: '14',
        dateMonth: 'NOV',
        title: "Children's Day Gala & Cultural Fest",
        category: 'Cultural Celebration',
        time: '09:30 AM - 02:00 PM',
        location: 'School Open-Air Amphitheatre',
        description: 'Celebration featuring musical performances, dance recitals, student theatre, fun games, and special food stalls organised by faculty.',
        badge: 'Celebration',
      },
    ];
  }, []);

  // 10. Important Announcements
  const importantAnnouncements = useMemo(() => {
    return [
      {
        id: 'anc-1',
        title: 'Parent-Teacher Meeting Scheduled for Oct 22',
        date: '22 Oct 2026',
        badge: 'Important',
        badgeColor: '#EF4444',
        badgeBg: '#FEE2E2',
        description: 'The Parent-Teacher Meeting for Term 1 evaluation will be conducted on 22nd October 2026 from 10:00 AM onwards. Detailed time slots have been sent via message.',
      },
      {
        id: 'anc-2',
        title: 'Annual Sports Meet Registrations & Trials',
        date: '15 Oct 2026',
        badge: 'New',
        badgeColor: '#10B981',
        badgeBg: '#DCFCE7',
        description: 'Selection trials for track and field events will commence next Monday. Students should report in full physical education uniform with sports gear.',
      },
      {
        id: 'anc-3',
        title: 'Science & Innovation Exhibition 2026 Guidelines',
        date: '05 Nov 2026',
        badge: 'Important',
        badgeColor: '#4F46E5',
        badgeBg: '#EEF2FF',
        description: 'All project synopses must be submitted to the science department coordinator by 15th October for initial screening and laboratory allocation.',
      },
    ];
  }, []);

  const isLoading = summaryLoading || eventsLoading || profileLoading || invoicesLoading;

  if (isLoading || !summary || !user || !profile) {
    return <LoadingScreen message="Loading Dashboard..." />;
  }

  // ─── Modal Handler ─────────────────────────────────────────────────────────
  const openModal = (item: ModalDetailItem) => {
    setModalItem(item);
  };

  const closeModal = () => {
    setModalItem(null);
  };

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Detail Modal Dialog */}
      <Modal
        visible={!!modalItem}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.modalBadgeRow}>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryBadgeText}>{modalItem?.category || 'Notice'}</Text>
                  </View>
                  {modalItem?.badge && (
                    <View style={styles.modalStatusBadge}>
                      <Text style={styles.modalStatusBadgeText}>{modalItem.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalTitle}>{modalItem?.title}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalMetaRow}>
              <Text style={styles.modalMetaItem}>📅 {modalItem?.date}</Text>
              {modalItem?.time && <Text style={styles.modalMetaItem}>⏰ {modalItem.time}</Text>}
              {modalItem?.location && <Text style={styles.modalMetaItem}>📍 {modalItem.location}</Text>}
            </View>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>{modalItem?.description}</Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={closeModal}>
                <Text style={styles.modalActionBtnText}>Close Window</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {IS_WEB ? (
        // ═════════════════════════════════════════════════════════════════════
        // DESKTOP / WEB VIEW
        // ═════════════════════════════════════════════════════════════════════
        <View style={styles.webMain}>
          {/* Top Header with Vikram Sharma Avatar [ V ] */}
          <WebHeader user={user} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.webContentPad}>
            {/* 1. Welcome section */}
            <View style={styles.welcomeRow}>
              <Text style={styles.welcomeTitle}>Welcome, {firstName} 👋</Text>
              <Text style={styles.welcomeSub}>Parent Portal · Academic Session 2026–2027</Text>
            </View>

            {/* 2. My Children Selector */}
            {children.length > 0 && (
              <ChildSelector
                childrenList={children as any}
                selectedChildId={selectedChildId || ''}
                onSelectChild={setSelectedChildId}
              />
            )}

            {/* ═══════════════════════════════════════════════════════════════
                ROW 2: Attendance Overview | Academic Performance
                ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.gridRow}>
              {/* Attendance Card with Mini Monthly Calendar Preview */}
              <View style={[styles.card, { flex: 1 }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SIZES.sm }}>
                    <ChildAvatar name={activeChild?.name} size={28} fontSize={13} />
                    <View>
                      <Text style={styles.cardTitle}>
                        {activeChild?.name ?? 'Child'}'s Attendance
                      </Text>
                      <Text style={styles.cardSub}>Academic Year 2026–27</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/parents/attendance')}>
                    <Text style={styles.linkText}>View Full Attendance →</Text>
                  </TouchableOpacity>
                </View>

                {/* Donut Chart & Status Summary */}
                <View style={styles.attendanceDonutRow}>
                  <DonutChart
                    percentage={attendanceData.percentage}
                    size={130}
                    strokeWidth={14}
                    color={attendanceData.percentage >= 85 ? COLORS.primary : '#F59E0B'}
                  />
                  <View style={styles.attendanceStatsWrap}>
                    <View style={styles.attCounterPill}>
                      <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.attCounterLabel}>Present:</Text>
                      <Text style={styles.attCounterVal}>{attendanceData.presentCount} days</Text>
                    </View>
                    <View style={styles.attCounterPill}>
                      <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={styles.attCounterLabel}>Absent:</Text>
                      <Text style={styles.attCounterVal}>{attendanceData.absentCount} days</Text>
                    </View>
                    <View style={styles.attCounterPill}>
                      <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={styles.attCounterLabel}>Late:</Text>
                      <Text style={styles.attCounterVal}>{attendanceData.lateCount} days</Text>
                    </View>
                    <Text style={styles.attRequirementText}>
                      ✓ Meets 85% requirement for board examinations
                    </Text>
                  </View>
                </View>

                {/* Monthly Calendar Preview */}
                <View style={styles.miniCalendarSection}>
                  <Text style={styles.miniCalTitle}>Monthly Check-In Breakdown (Recent 4 Weeks)</Text>
                  <View style={styles.calMatrix}>
                    {attendanceData.calendarWeeks.map((week, wIdx) => (
                      <View key={`w-${wIdx}`} style={styles.calWeekRow}>
                        <Text style={styles.calWeekLabel}>W{wIdx + 1}</Text>
                        {week.map((dayStatus, dIdx) => {
                          const bg = dayStatus === 'P' ? '#DCFCE7' : dayStatus === 'A' ? '#FEE2E2' : '#FEF3C7';
                          const textColor = dayStatus === 'P' ? '#15803D' : dayStatus === 'A' ? '#DC2626' : '#B45309';
                          return (
                            <View key={`d-${dIdx}`} style={[styles.calDayBox, { backgroundColor: bg }]}>
                              <Text style={[styles.calDayText, { color: textColor }]}>{dayStatus}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                  <View style={styles.calLegendRow}>
                    <LegendDot color="#10B981" label="P = Present" />
                    <LegendDot color="#EF4444" label="A = Absent" />
                    <LegendDot color="#F59E0B" label="L = Late" />
                  </View>
                </View>
              </View>

              {/* Academic Performance Card */}
              <View style={[styles.card, { flex: 1.2 }]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Academic Performance</Text>
                    <Text style={styles.cardSub}>
                      {activeChild?.name} · {academicData.classRank}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/parents/results')}>
                    <Text style={styles.linkText}>View Full Results →</Text>
                  </TouchableOpacity>
                </View>

                {/* Performance Summary Banner */}
                <View style={styles.academicHeroBanner}>
                  <View style={styles.gradeCircle}>
                    <Text style={styles.gradeCircleText}>{academicData.overallGrade}</Text>
                    <Text style={styles.gradeCircleSub}>GRADE</Text>
                  </View>
                  <View style={styles.academicHeroText}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.academicHeroScore}>
                        Overall: {academicData.overallPercentage}%
                      </Text>
                      <View style={styles.improvementBadge}>
                        <Text style={styles.improvementText}>▲ {academicData.improvement}</Text>
                      </View>
                    </View>
                    <Text style={styles.academicHeroSub}>
                      Previous Exam: {academicData.previousExamPercentage}% · Current Term: {academicData.currentExamPercentage}%
                    </Text>
                  </View>
                </View>

                {/* Subject-Wise Progress Bars */}
                <View style={styles.subjectsContainer}>
                  <Text style={styles.subjectSectionHeader}>SUBJECT-WISE PERFORMANCE</Text>
                  {academicData.subjects.map((sub) => (
                    <View key={sub.name} style={styles.subjectRow}>
                      <View style={styles.subjectMetaRow}>
                        <Text style={styles.subjectName}>{sub.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.subjectGradeBadge}>{sub.grade}</Text>
                          <Text style={styles.subjectPct}>{sub.percentage}%</Text>
                        </View>
                      </View>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${sub.percentage}%`, backgroundColor: sub.color },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                ROW 3: Fee Summary | Quick Stats
                ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.gridRow}>
              {/* Fee Summary with Progress Bar */}
              <View style={[styles.card, { flex: 1.1 }]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Fee Summary & Settlement</Text>
                    <Text style={styles.cardSub}>
                      {activeChild?.name} · Academic Year 2026–27
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/parents/fees')}>
                    <Text style={styles.linkText}>Pay / View Fees →</Text>
                  </TouchableOpacity>
                </View>

                {/* Fee KPIs */}
                <View style={styles.feeKpiGrid}>
                  <View style={styles.feeKpiBox}>
                    <Text style={styles.feeKpiLabel}>TOTAL FEES</Text>
                    <Text style={styles.feeKpiVal}>₹{feeData.total.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.feeKpiBox}>
                    <Text style={styles.feeKpiLabel}>PAID AMOUNT</Text>
                    <Text style={[styles.feeKpiVal, { color: '#059669' }]}>
                      ₹{feeData.paid.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={[styles.feeKpiBox, { backgroundColor: feeData.pending > 0 ? '#FFFBEB' : '#F8FAFC' }]}>
                    <Text style={styles.feeKpiLabel}>PENDING DUE</Text>
                    <Text style={[styles.feeKpiVal, { color: feeData.pending > 0 ? '#B45309' : '#059669' }]}>
                      ₹{feeData.pending.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Fee Progress Bar */}
                <View style={styles.feeProgressWrapper}>
                  <View style={styles.feeProgressHeader}>
                    <Text style={styles.feeProgressLabel}>Payment Progress</Text>
                    <Text style={styles.feeProgressPct}>{feeData.progress}% Cleared</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${feeData.progress}%`, backgroundColor: '#4F46E5' },
                      ]}
                    />
                  </View>
                  {feeData.pending > 0 ? (
                    <Text style={styles.feePendingAlert}>
                      ⚠️ Outstanding balance of ₹{feeData.pending.toLocaleString('en-IN')} due for Term 2.
                    </Text>
                  ) : (
                    <Text style={styles.feePaidAlert}>✓ All academic dues are settled up to date.</Text>
                  )}
                </View>

                {/* Itemized Invoices */}
                <View style={{ gap: 6, marginTop: SIZES.sm }}>
                  {feeData.invoices.map((inv: any) => (
                    <FeeLine key={inv.id} fee={inv} onPress={() => router.push('/parents/fees')} />
                  ))}
                </View>
              </View>

              {/* Quick Stats */}
              <View style={[styles.card, { flex: 0.9 }]}>
                <Text style={styles.cardTitle}>Quick Stats</Text>
                <Text style={styles.cardSub}>Overview for {activeChild?.name}</Text>
                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  <StatRow label="Attendance Rate" value={`${attendanceData.percentage}%`} color={COLORS.primary} />
                  <StatRow
                    label="Outstanding Fees"
                    value={`₹${feeData.pending.toLocaleString('en-IN')}`}
                    color={feeData.pending > 0 ? COLORS.error : COLORS.success}
                  />
                  <StatRow label="Academic Class Rank" value={academicData.classRank.split(' ')[0]} color="#8B5CF6" />
                  <StatRow label="Active Assignments" value={`${assignments.filter(a => a.status === 'Pending').length} Pending`} color="#F59E0B" />
                  <StatRow label="Upcoming Exams" value={`${upcomingExams.length} Scheduled`} color="#3B82F6" />
                  <StatRow label="Extracurricular Clubs" value={`${engagementData.clubs} Active`} color="#10B981" />
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                ROW 4: Notice Board | Upcoming Events
                ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.gridRow}>
              {/* Notice Board */}
              <View style={[styles.card, { flex: 1, maxHeight: 380 }]}>
                <Text style={styles.cardTitle}>Notice Board</Text>
                <Text style={styles.cardSub}>Official announcements & Circulars</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: SIZES.sm }}>
                  {events && events.length > 0 ? (
                    events.slice(0, 5).map((ev, idx) => (
                      <TouchableOpacity
                        key={ev.id}
                        activeOpacity={0.7}
                        onPress={() =>
                          openModal({
                            title: ev.title,
                            category: ev.type?.toUpperCase() || 'NOTICE',
                            date: ev.date || 'Notice',
                            time: ev.time,
                            location: 'Campus Wide',
                            description: ev.description || 'Official school circular published for parents.',
                          })
                        }
                      >
                        <NoticeItem event={ev} idx={idx} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No circulars available.</Text>
                  )}
                </ScrollView>
              </View>

              {/* Upcoming Events */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Upcoming Events</Text>
                <Text style={styles.cardSub}>Chronological school calendar</Text>
                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  {upcomingEventsList.map((ev) => (
                    <TouchableOpacity
                      key={ev.id}
                      style={styles.eventItemCard}
                      activeOpacity={0.7}
                      onPress={() =>
                        openModal({
                          title: ev.title,
                          category: ev.category,
                          date: `${ev.dateDay} ${ev.dateMonth} 2026`,
                          time: ev.time,
                          location: ev.location,
                          description: ev.description,
                          badge: ev.badge,
                        })
                      }
                    >
                      {/* Date Badge */}
                      <View style={styles.eventDateBadge}>
                        <Text style={styles.eventDateDay}>{ev.dateDay}</Text>
                        <Text style={styles.eventDateMonth}>{ev.dateMonth}</Text>
                      </View>

                      {/* Info */}
                      <View style={{ flex: 1 }}>
                        <View style={styles.eventMetaTop}>
                          <Text style={styles.eventCategoryText}>{ev.category}</Text>
                          <Text style={styles.eventTimeText}>{ev.time.split(' - ')[0]}</Text>
                        </View>
                        <Text style={styles.eventTitleText} numberOfLines={1}>{ev.title}</Text>
                        <Text style={styles.eventLocationText}>📍 {ev.location}</Text>
                      </View>

                      <Text style={styles.eventChevron}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                ROW 5: Assignments & Homework | Upcoming Exams
                ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.gridRow}>
              {/* Assignments & Homework */}
              <View style={[styles.card, { flex: 1.1 }]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Assignments & Homework</Text>
                    <Text style={styles.cardSub}>Recent tasks for {activeChild?.name}</Text>
                  </View>
                  <View style={styles.assignmentCountBadge}>
                    <Text style={styles.assignmentCountText}>
                      {assignments.filter(a => a.status === 'Pending').length} Action Items
                    </Text>
                  </View>
                </View>

                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  {assignments.map((asg) => {
                    const isPending = asg.status === 'Pending';
                    const isSubmitted = asg.status === 'Submitted';
                    const isCompleted = asg.status === 'Completed';

                    const badgeBg = isPending ? '#FEF3C7' : isSubmitted ? '#EFF6FF' : '#DCFCE7';
                    const badgeText = isPending ? '#B45309' : isSubmitted ? '#1D4ED8' : '#15803D';

                    return (
                      <View key={asg.id} style={styles.assignmentCard}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.asgSubject}>{asg.subject}</Text>
                            <Text style={styles.asgDot}>•</Text>
                            <Text style={styles.asgDue}>Due: {asg.dueDate}</Text>
                          </View>
                          <Text style={styles.asgTitle} numberOfLines={1}>{asg.title}</Text>
                        </View>
                        <View style={[styles.asgStatusBadge, { backgroundColor: badgeBg }]}>
                          <Text style={[styles.asgStatusText, { color: badgeText }]}>{asg.status}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Upcoming Exams */}
              <View style={[styles.card, { flex: 0.9 }]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Upcoming Exams</Text>
                    <Text style={styles.cardSub}>Term 1 Examination Timetable</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/parents/results')}>
                    <Text style={styles.linkText}>View Exam Schedule →</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  {upcomingExams.map((ex) => (
                    <View key={ex.id} style={styles.examItemRow}>
                      <View style={styles.examDatePill}>
                        <Text style={styles.examDateText}>{ex.date}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.examSubjectText}>{ex.subject}</Text>
                        <Text style={styles.examTimeText}>{ex.time}</Text>
                      </View>
                      <View style={styles.daysRemainingBadge}>
                        <Text style={styles.daysRemainingText}>{ex.daysRemaining}d remaining</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                ROW 6: Recent Activity | Recent Messages
                ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.gridRow}>
              {/* Recent Activity */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Recent Activity</Text>
                <Text style={styles.cardSub}>Latest child events & timeline</Text>
                <View style={styles.timelineWrapper}>
                  {recentActivities.map((act, idx) => (
                    <View key={act.id} style={styles.timelineRow}>
                      <View style={styles.timelineIndicatorCol}>
                        <View style={[styles.timelineDot, { backgroundColor: act.color }]} />
                        {idx < recentActivities.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineMeta}>
                          <Text style={styles.timelineTimestamp}>{act.timestamp}</Text>
                        </View>
                        <Text style={styles.timelineTitle}>{act.title}</Text>
                        <Text style={styles.timelineDetail}>{act.detail}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Recent Messages */}
              <View style={[styles.card, { flex: 1 }]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Recent Messages</Text>
                    <Text style={styles.cardSub}>Direct teacher communications</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/parents/chat')}>
                    <Text style={styles.linkText}>View All Messages →</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  {recentMessages.map((msg) => (
                    <TouchableOpacity
                      key={msg.id}
                      style={styles.messagePreviewCard}
                      activeOpacity={0.7}
                      onPress={() => router.push('/parents/chat')}
                    >
                      <View style={styles.messageAvatar}>
                        <Text style={styles.messageAvatarText}>{msg.senderName[0]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.msgTopRow}>
                          <Text style={styles.msgSenderRole}>{msg.senderRole} · {msg.senderName}</Text>
                          <Text style={styles.msgTimestamp}>{msg.timestamp}</Text>
                        </View>
                        <Text style={styles.msgSubject} numberOfLines={1}>{msg.subject}</Text>
                        <Text style={styles.msgPreviewText} numberOfLines={1}>{msg.preview}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                ROW 7: School Engagement | Important Announcements
                ═══════════════════════════════════════════════════════════════ */}
            <View style={styles.gridRow}>
              {/* School Engagement */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>School Engagement & Wellbeing</Text>
                <Text style={styles.cardSub}>Extracurricular participation for {activeChild?.name}</Text>

                <View style={styles.engagementGrid}>
                  <View style={styles.engagementChip}>
                    <Text style={styles.engagementNum}>{engagementData.sports}</Text>
                    <Text style={styles.engagementLabel}>Sports Activities</Text>
                    <Text style={styles.engagementSub}>{engagementData.sportsList.join(', ')}</Text>
                  </View>
                  <View style={styles.engagementChip}>
                    <Text style={styles.engagementNum}>{engagementData.cultural}</Text>
                    <Text style={styles.engagementLabel}>Cultural & Arts</Text>
                    <Text style={styles.engagementSub}>{engagementData.culturalList.join(', ')}</Text>
                  </View>
                  <View style={styles.engagementChip}>
                    <Text style={styles.engagementNum}>{engagementData.clubs}</Text>
                    <Text style={styles.engagementLabel}>Clubs & Societies</Text>
                    <Text style={styles.engagementSub}>{engagementData.clubsList.join(', ')}</Text>
                  </View>
                  <View style={styles.engagementChip}>
                    <Text style={styles.engagementNum}>{engagementData.eventsAttended}</Text>
                    <Text style={styles.engagementLabel}>Events Attended</Text>
                    <Text style={styles.engagementSub}>{engagementData.libraryBooks} Library books read</Text>
                  </View>
                </View>
              </View>

              {/* Important Announcements */}
              <View style={[styles.card, { flex: 1 }]}>
                <Text style={styles.cardTitle}>Important Announcements</Text>
                <Text style={styles.cardSub}>Priority notices requiring parent attention</Text>
                <View style={{ gap: SIZES.sm, marginTop: SIZES.md }}>
                  {importantAnnouncements.map((anc) => (
                    <TouchableOpacity
                      key={anc.id}
                      style={styles.announcementCard}
                      activeOpacity={0.7}
                      onPress={() =>
                        openModal({
                          title: anc.title,
                          category: 'Important Announcement',
                          date: anc.date,
                          description: anc.description,
                          badge: anc.badge,
                        })
                      }
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text style={{ fontSize: 14 }}>🔔</Text>
                        <Text style={styles.ancTitleText} numberOfLines={1}>{anc.title}</Text>
                        <View style={[styles.ancBadge, { backgroundColor: anc.badgeBg }]}>
                          <Text style={[styles.ancBadgeText, { color: anc.badgeColor }]}>{anc.badge}</Text>
                        </View>
                      </View>
                      <Text style={styles.ancDateText}>Date: {anc.date}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ height: SIZES.xxl }} />
          </ScrollView>
        </View>
      ) : (
        // ═════════════════════════════════════════════════════════════════════
        // MOBILE VIEW
        // ═════════════════════════════════════════════════════════════════════
        <>
          <MobileHeader user={user} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mobileContent}>
            {/* Child Selector */}
            {children.length > 0 && (
              <ChildSelector
                childrenList={children as any}
                selectedChildId={selectedChildId || ''}
                onSelectChild={setSelectedChildId}
              />
            )}

            {/* ATTENDANCE */}
            <SectionLabel label="ATTENDANCE OVERVIEW" actionText="Details" onAction={() => router.push('/parents/attendance')} />
            <View style={[styles.card, { alignItems: 'center', paddingVertical: SIZES.lg }]}>
              <DonutChart percentage={attendanceData.percentage} size={130} strokeWidth={14} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SIZES.sm }}>
                <ChildAvatar name={activeChild?.name} size={22} fontSize={11} />
                <Text style={styles.cardSub}>
                  {activeChild?.name ?? 'Child'}'s attendance ({attendanceData.percentage}%)
                </Text>
              </View>
              <View style={styles.mobileAttCountsRow}>
                <Text style={styles.mobileAttCountItem}>🟢 Present: {attendanceData.presentCount}</Text>
                <Text style={styles.mobileAttCountItem}>🔴 Absent: {attendanceData.absentCount}</Text>
                <Text style={styles.mobileAttCountItem}>🟡 Late: {attendanceData.lateCount}</Text>
              </View>
            </View>

            {/* ACADEMIC PERFORMANCE */}
            <SectionLabel label="ACADEMIC PERFORMANCE" actionText="Full Report" onAction={() => router.push('/parents/results')} />
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm }}>
                <Text style={styles.cardTitle}>Grade: {academicData.overallGrade}</Text>
                <Text style={[styles.cardTitle, { color: COLORS.primary }]}>{academicData.overallPercentage}%</Text>
              </View>
              <Text style={[styles.cardSub, { marginBottom: SIZES.sm }]}>{academicData.classRank}</Text>
              {academicData.subjects.map((sub) => (
                <View key={sub.name} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textDark }}>{sub.name}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>{sub.percentage}%</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${sub.percentage}%`, backgroundColor: sub.color }]} />
                  </View>
                </View>
              ))}
            </View>

            {/* FEES */}
            <SectionLabel label="FEES SUMMARY" actionText="Pay Now" onAction={() => router.push('/parents/fees')} />
            <View style={[styles.card, { gap: SIZES.sm }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardSub}>Total: ₹{feeData.total.toLocaleString('en-IN')}</Text>
                <Text style={[styles.cardSub, { color: feeData.pending > 0 ? COLORS.error : COLORS.success, fontWeight: '700' }]}>
                  {feeData.pending > 0 ? `₹${feeData.pending.toLocaleString('en-IN')} pending` : 'Settled ✓'}
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${feeData.progress}%`, backgroundColor: COLORS.primary }]} />
              </View>
              {feeData.invoices.slice(0, 3).map((fee: any) => (
                <FeeLine key={fee.id} fee={fee} onPress={() => router.push('/parents/fees')} />
              ))}
            </View>

            {/* ASSIGNMENTS */}
            <SectionLabel label="ASSIGNMENTS & HOMEWORK" />
            <View style={[styles.card, { gap: SIZES.xs }]}>
              {assignments.map(asg => (
                <View key={asg.id} style={styles.assignmentCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.asgSubject}>{asg.subject} · Due: {asg.dueDate}</Text>
                    <Text style={styles.asgTitle} numberOfLines={1}>{asg.title}</Text>
                  </View>
                  <View style={[styles.asgStatusBadge, { backgroundColor: asg.status === 'Pending' ? '#FEF3C7' : '#DCFCE7' }]}>
                    <Text style={[styles.asgStatusText, { color: asg.status === 'Pending' ? '#B45309' : '#15803D' }]}>{asg.status}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* UPCOMING EXAMS */}
            <SectionLabel label="UPCOMING EXAMS" actionText="Schedule" onAction={() => router.push('/parents/results')} />
            <View style={[styles.card, { gap: SIZES.xs }]}>
              {upcomingExams.map(ex => (
                <View key={ex.id} style={styles.examItemRow}>
                  <View style={styles.examDatePill}>
                    <Text style={styles.examDateText}>{ex.date}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.examSubjectText}>{ex.subject}</Text>
                    <Text style={styles.examTimeText}>{ex.time}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '700' }}>{ex.daysRemaining}d</Text>
                </View>
              ))}
            </View>

            {/* RECENT ACTIVITY */}
            <SectionLabel label="RECENT ACTIVITY" />
            <View style={styles.card}>
              {recentActivities.map(act => (
                <View key={act.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
                  <View style={[styles.timelineDot, { backgroundColor: act.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textDark }}>{act.title}</Text>
                    <Text style={{ fontSize: 10, color: COLORS.textLight }}>{act.timestamp} · {act.detail}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* UPCOMING EVENTS */}
            <SectionLabel label="UPCOMING EVENTS" />
            <View style={[styles.card, { gap: SIZES.sm }]}>
              {upcomingEventsList.map(ev => (
                <TouchableOpacity
                  key={ev.id}
                  style={styles.eventItemCard}
                  onPress={() =>
                    openModal({
                      title: ev.title,
                      category: ev.category,
                      date: `${ev.dateDay} ${ev.dateMonth} 2026`,
                      time: ev.time,
                      location: ev.location,
                      description: ev.description,
                      badge: ev.badge,
                    })
                  }
                >
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDateDay}>{ev.dateDay}</Text>
                    <Text style={styles.eventDateMonth}>{ev.dateMonth}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitleText} numberOfLines={1}>{ev.title}</Text>
                    <Text style={styles.eventTimeText}>{ev.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* QUICK ACTIONS */}
            <SectionLabel label="QUICK ACTIONS" />
            <View style={styles.quickRow}>
              {[
                { label: 'Children', icon: '👨‍👩‍👧', route: '/parents/children' },
                { label: 'Attendance', icon: '📊', route: '/parents/attendance' },
                { label: 'Results', icon: '🏆', route: '/parents/results' },
                { label: 'Fees', icon: '💳', route: '/parents/fees' },
              ].map((qa) => (
                <TouchableOpacity key={qa.label} style={styles.quickBtn} onPress={() => router.push(qa.route as any)}>
                  <Text style={{ fontSize: 26 }}>{qa.icon}</Text>
                  <Text style={styles.quickLabel}>{qa.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: SIZES.xxl }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function WebHeader({ user }: { user: { name: string; avatarUrl?: string } }) {
  const firstName = user.name?.trim().split(' ')[0] || '';
  const initial = (firstName[0] || user.name?.trim()[0] || 'V').toUpperCase();
  return (
    <View style={styles.webHeader}>
      <View style={{ flex: 1 }} />
      <View style={styles.webHeaderRight}>
        <TouchableOpacity style={styles.iconBtn}><Text style={{ fontSize: 18 }}>🔍</Text></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <View style={styles.userPill}>
          <View style={[styles.pillAvatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{initial}</Text>
          </View>
          <Text style={styles.pillName}>{user.name}</Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>▾</Text>
        </View>
      </View>
    </View>
  );
}

function MobileHeader({ user }: { user: { name: string; avatarUrl?: string } }) {
  const firstName = user.name?.trim().split(' ')[0] || '';
  const initial = (firstName[0] || user.name?.trim()[0] || 'V').toUpperCase();
  return (
    <View style={styles.mobileHeader}>
      <View>
        <Text style={styles.mobileGreeting}>Welcome, {firstName} 👋</Text>
        <Text style={styles.mobileSub}>Parent Portal</Text>
      </View>
      <View style={styles.mobileHeaderRight}>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
          <View style={styles.bellDot} />
        </TouchableOpacity>
        <View style={[styles.userPill, { paddingVertical: 4, paddingHorizontal: 8 }]}>
          <View style={[styles.pillAvatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{initial}</Text>
          </View>
          <Text style={[styles.pillName, { fontSize: 13 }]} numberOfLines={1}>{user.name}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionLabel({ label, actionText, onAction }: { label: string; actionText?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const NOTICE_COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#EC4899'];

function NoticeItem({ event, idx }: { event: any; idx: number }) {
  const accentColor = NOTICE_COLORS[idx % NOTICE_COLORS.length];
  return (
    <View style={styles.noticeItem}>
      <View style={[styles.noticeLine, { backgroundColor: accentColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.noticeAuthor, { color: accentColor }]} numberOfLines={1}>
          {event.type ? event.type.toUpperCase() : 'NOTICE'}
        </Text>
        <Text style={styles.noticeTitle} numberOfLines={2}>{event.title}</Text>
        {event.date ? <Text style={styles.noticeDate}>{event.date} · {event.time ?? ''}</Text> : null}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function FeeLine({ fee, onPress }: { fee: any; onPress: () => void }) {
  const isPaid = fee.status === 'paid';
  return (
    <TouchableOpacity style={styles.feeLine} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.feeName} numberOfLines={1}>{fee.title}</Text>
        <Text style={styles.feeDue}>Due: {fee.due_date}</Text>
      </View>
      <View style={[styles.feeChip, { backgroundColor: isPaid ? '#D1FAE5' : '#FEF3C7' }]}>
        <Text style={[styles.feeChipText, { color: isPaid ? '#065F46' : '#92400E' }]}>
          {isPaid ? 'Paid' : `₹${fee.amount?.toLocaleString('en-IN')}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function StatRow({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },

  webMain: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  webHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small, zIndex: 5,
  },
  webHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBtn: {
    padding: SIZES.sm, borderRadius: SIZES.radiusSm,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: COLORS.border,
  },
  notifDot: {
    position: 'absolute', top: 6, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.card,
  },
  userPill: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#F8FAFC', borderRadius: SIZES.radiusRound,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SIZES.sm, paddingVertical: 6,
  },
  pillAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.background },
  pillName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '600' },
  webContentPad: { padding: SIZES.xl },

  welcomeRow: { marginBottom: SIZES.lg },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark, letterSpacing: -0.3 },
  welcomeSub: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 2 },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SIZES.sm, marginTop: SIZES.xs,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  sectionAction: { ...FONTS.body2, color: COLORS.primary, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.lg, borderWidth: 1, borderColor: 'rgba(226, 232, 240, 0.9)',
    ...SHADOWS.small, marginBottom: SIZES.md,
  },
  cardTitle: { ...FONTS.h4, color: COLORS.textDark, fontWeight: '700', marginBottom: 2 },
  cardSub: { ...FONTS.caption, color: COLORS.textSecondary },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SIZES.md,
  },
  linkText: { ...FONTS.body2, color: COLORS.primary, fontWeight: '700' },

  gridRow: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.xs },

  // Attendance
  attendanceDonutRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.lg,
    paddingVertical: SIZES.sm,
  },
  attendanceStatsWrap: { flex: 1, gap: 6 },
  attCounterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  attCounterLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  attCounterVal: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },
  attRequirementText: { fontSize: 10, color: '#059669', fontWeight: '600', marginTop: 4 },

  miniCalendarSection: {
    marginTop: SIZES.md, paddingTop: SIZES.md,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  miniCalTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.5, marginBottom: 8 },
  calMatrix: { gap: 4 },
  calWeekRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calWeekLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textLight, width: 24 },
  calDayBox: {
    flex: 1, height: 22, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  calDayText: { fontSize: 10, fontWeight: '800' },
  calLegendRow: { flexDirection: 'row', gap: SIZES.md, marginTop: 8, justifyContent: 'center' },

  // Academic Performance
  academicHeroBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: '#F8FAFC', padding: SIZES.md, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: SIZES.md,
  },
  gradeCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#EEF2FF', borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeCircleText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  gradeCircleSub: { fontSize: 7, fontWeight: '800', color: COLORS.textSecondary, letterSpacing: 0.5 },
  academicHeroText: { flex: 1 },
  academicHeroScore: { ...FONTS.h4, fontWeight: '800', color: COLORS.textDark },
  academicHeroSub: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  improvementBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  improvementText: { fontSize: 10, fontWeight: '800', color: '#15803D' },

  subjectsContainer: { gap: 8 },
  subjectSectionHeader: { fontSize: 10, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.5, marginBottom: 2 },
  subjectRow: { marginBottom: 4 },
  subjectMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  subjectName: { fontSize: 12, fontWeight: '600', color: COLORS.textDark },
  subjectGradeBadge: {
    fontSize: 10, fontWeight: '700', color: COLORS.primary,
    backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4,
  },
  subjectPct: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  progressBarTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },

  // Fees
  feeKpiGrid: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.md },
  feeKpiBox: {
    flex: 1, backgroundColor: '#F8FAFC', padding: SIZES.sm,
    borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: '#E2E8F0',
  },
  feeKpiLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.5 },
  feeKpiVal: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginTop: 2 },
  feeProgressWrapper: {
    backgroundColor: '#FFFFFF', padding: SIZES.sm, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: SIZES.sm,
  },
  feeProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  feeProgressLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },
  feeProgressPct: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  feePendingAlert: { fontSize: 11, color: '#B45309', fontWeight: '600', marginTop: 4 },
  feePaidAlert: { fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 4 },

  feeLine: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  feeName: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500' },
  feeDue: { ...FONTS.caption, color: COLORS.textLight, marginTop: 1 },
  feeChip: { borderRadius: 12, paddingHorizontal: SIZES.sm, paddingVertical: 3 },
  feeChipText: { fontSize: 11, fontWeight: '700' },

  // Notice Board & Events
  noticeItem: {
    flexDirection: 'row', gap: SIZES.sm,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  noticeLine: { width: 3, borderRadius: 4, alignSelf: 'stretch' },
  noticeAuthor: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  noticeTitle: { ...FONTS.body2, color: COLORS.textDark, fontWeight: '500', lineHeight: 18 },
  noticeDate: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },

  eventItemCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: '#F8FAFC', padding: SIZES.md, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  eventDateBadge: {
    width: 48, height: 48, borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  eventDateDay: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  eventDateMonth: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  eventMetaTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  eventCategoryText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  eventTimeText: { fontSize: 10, color: COLORS.textSecondary },
  eventTitleText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  eventLocationText: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  eventChevron: { fontSize: 18, color: COLORS.textLight, fontWeight: '700' },

  // Assignments
  assignmentCountBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  assignmentCountText: { fontSize: 11, fontWeight: '800', color: '#B45309' },
  assignmentCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', padding: SIZES.md, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  asgSubject: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  asgDot: { fontSize: 11, color: COLORS.textLight },
  asgDue: { fontSize: 11, color: COLORS.textSecondary },
  asgTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textDark, marginTop: 2 },
  asgStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  asgStatusText: { fontSize: 10, fontWeight: '800' },

  // Exams
  examItemRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#F8FAFC', padding: SIZES.md, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  examDatePill: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: '#C7D2FE',
  },
  examDateText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  examSubjectText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  examTimeText: { fontSize: 10, color: COLORS.textSecondary },
  daysRemainingBadge: {
    backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, borderColor: '#A7F3D0',
  },
  daysRemainingText: { fontSize: 10, fontWeight: '800', color: '#059669' },

  // Timeline & Activity
  timelineWrapper: { marginTop: SIZES.sm },
  timelineRow: { flexDirection: 'row', gap: SIZES.md },
  timelineIndicatorCol: { alignItems: 'center', width: 16 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: SIZES.md },
  timelineMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  timelineTimestamp: { fontSize: 10, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.5 },
  timelineTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  timelineDetail: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },

  // Messages
  messagePreviewCard: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: '#F8FAFC', padding: SIZES.md, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  messageAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  messageAvatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  msgSenderRole: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  msgTimestamp: { fontSize: 10, color: COLORS.textLight },
  msgSubject: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  msgPreviewText: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },

  // Engagement
  engagementGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginTop: SIZES.md,
  },
  engagementChip: {
    flex: 1, minWidth: 140, backgroundColor: '#F8FAFC', padding: SIZES.md,
    borderRadius: SIZES.radiusSm, borderWidth: 1, borderColor: '#E2E8F0',
  },
  engagementNum: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  engagementLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textDark, marginTop: 2 },
  engagementSub: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, lineHeight: 14 },

  // Announcements
  announcementCard: {
    backgroundColor: '#F8FAFC', padding: SIZES.md, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  ancTitleText: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  ancBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  ancBadgeText: { fontSize: 9, fontWeight: '800' },
  ancDateText: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },

  // Quick Stats
  statRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statLabel: { flex: 1, ...FONTS.body2, color: COLORS.textSecondary },
  statValue: { ...FONTS.body2, fontWeight: '700' },

  legend: { flexDirection: 'row', gap: SIZES.md, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...FONTS.caption, color: COLORS.textSecondary },

  // Modal Dialog
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center', justifyContent: 'center', padding: SIZES.lg,
  },
  modalCard: {
    width: '100%', maxWidth: 520, backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius, padding: SIZES.xl, ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  modalBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  modalCategoryBadge: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  modalCategoryBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  modalStatusBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  modalStatusBadgeText: { fontSize: 10, fontWeight: '800', color: '#15803D' },
  modalTitle: { ...FONTS.h3, color: COLORS.textDark, fontWeight: '700' },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  modalMetaRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.md,
    paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    marginBottom: SIZES.md,
  },
  modalMetaItem: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  modalBodyScroll: { maxHeight: 200, marginBottom: SIZES.lg },
  modalDescription: { fontSize: 13, color: COLORS.textDark, lineHeight: 20 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalActionBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
  },
  modalActionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Mobile Header & Misc
  mobileHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  mobileGreeting: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  mobileSub: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
  mobileHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  bellBtn: {
    position: 'relative', padding: SIZES.sm,
    backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  bellDot: {
    position: 'absolute', top: 6, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.card,
  },
  mobileContent: { padding: SIZES.md },
  mobileAttCountsRow: {
    flexDirection: 'row', gap: SIZES.md, marginTop: SIZES.sm,
    justifyContent: 'center',
  },
  mobileAttCountItem: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, justifyContent: 'space-between', marginBottom: SIZES.md },
  quickBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, borderRadius: SIZES.radius,
    padding: SIZES.md, width: '22%', aspectRatio: 1,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small,
  },
  quickLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textDark, textAlign: 'center', marginTop: 4 },
  emptyText: { ...FONTS.body2, color: COLORS.textLight, fontStyle: 'italic' },
});
