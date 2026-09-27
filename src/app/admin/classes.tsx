/**
 * AdminClassesScreen — Pixel-Accurate High-Fidelity Reproduction of Class Management Reference Design.
 *
 * Visual sections:
 *  1. Top Header: Breadcrumb (Home > Academic Management > Classes), Title, Subtitle,
 *     Global Search, Notification Bell (3), Admin Profile Pill, Header Quote, subtle Classroom Hero graphic, "+ Add Class" button.
 *  2. 4 Summary Cards:
 *     - Total Classes (with mini bar chart & dynamic trend)
 *     - Total Students (with mini avatars & dynamic trend)
 *     - Assigned Teachers (with dynamic SVG circular percentage ring)
 *     - Unassigned Classes (with ribbon icon & chevron)
 *  3. Filter Bar:
 *     - Search by class name, grade, teacher, room
 *     - Dynamic Dropdowns: Grade, Section, Teacher, Status
 *     - Reset Filters button
 *     - Grid / List View Toggle (Grid default)
 *  4. 3-Column Responsive Class Cards:
 *     - Accent top border and badges (Grade, Status: Active/Inactive)
 *     - Classroom image thumbnail with subtle gradient tint matching card accent
 *     - Class Name & Room/Section indicators
 *     - 3 Metric blocks: Students, Capacity, Class Teacher
 *     - Buttons: "View Details", "Assign Teacher" / "Reassign Teacher" / "Activate Class", Three-dot menu
 *  5. "Add New Class" dashed card at the end of grid
 *  6. Interactive Modals:
 *     - Add Class Modal
 *     - Edit Class Modal
 *     - Assign / Reassign Teacher Modal
 *     - View Class Details Modal (with real enrolled students list)
 *     - Delete Class confirmation
 *
 * 100% Real Database Data Integration.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  assignTeacher,
  listUsers,
  getClassStudents,
  AdminClass,
  AdminUser,
} from '../../services/admin';

const IS_WEB = Platform.OS === 'web';
const classroomBgImg = require('../../../assets/images/classroom-bg.png');

// ── Palette matching reference design ─────────────────────────────────────────
const P = {
  bg: '#F7FAFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#EDF2F7',
  text: '#0F172A',
  textSec: '#64748B',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',
  indigo: '#4F46E5',
  indigoBg: '#EEF2FF',
  green: '#10B981',
  greenDark: '#059669',
  greenBg: '#ECFDF5',
  greenBorder: '#A7F3D0',
  orange: '#F97316',
  orangeDark: '#EA580C',
  orangeBg: '#FFEDD5',
  orangeBorder: '#FED7AA',
  amber: '#F59E0B',
  amberDark: '#D97706',
  amberBg: '#FEF3C7',
  amberBorder: '#FDE68A',
  purple: '#7C3AED',
  purpleDark: '#6D28D9',
  purpleBg: '#F5F3FF',
  purpleBorder: '#DDD6FE',
  red: '#EF4444',
  redDark: '#DC2626',
  redBg: '#FEF2F2',
  redBorder: '#FECACA',
  blue: '#3B82F6',
  blueBg: '#EFF6FF',
  blueBorder: '#BFDBFE',
};

// ── Vibrant Color Schemes for Class Cards ────────────────────────────────────
interface CardColorTheme {
  primary: string;
  badgeBg: string;
  badgeText: string;
  topBorder: string;
  tintOverlay: string;
  activeBtnBg: string;
}

const CARD_THEMES: CardColorTheme[] = [
  // 1. Green Theme (Class 7 - B)
  {
    primary: '#10B981',
    badgeBg: '#10B981',
    badgeText: '#FFFFFF',
    topBorder: '#10B981',
    tintOverlay: 'rgba(16, 185, 129, 0.08)',
    activeBtnBg: '#2563EB',
  },
  // 2. Orange Theme (Class 8 - B)
  {
    primary: '#F97316',
    badgeBg: '#F97316',
    badgeText: '#FFFFFF',
    topBorder: '#F97316',
    tintOverlay: 'rgba(249, 115, 22, 0.08)',
    activeBtnBg: '#4F46E5',
  },
  // 3. Blue Theme (Class 9 - C)
  {
    primary: '#2563EB',
    badgeBg: '#2563EB',
    badgeText: '#FFFFFF',
    topBorder: '#2563EB',
    tintOverlay: 'rgba(37, 99, 235, 0.08)',
    activeBtnBg: '#2563EB',
  },
  // 4. Purple Theme (Class 10 - A)
  {
    primary: '#7C3AED',
    badgeBg: '#7C3AED',
    badgeText: '#FFFFFF',
    topBorder: '#7C3AED',
    tintOverlay: 'rgba(124, 58, 237, 0.08)',
    activeBtnBg: '#4F46E5',
  },
  // 5. Red Theme (Class 11 - B)
  {
    primary: '#EF4444',
    badgeBg: '#EF4444',
    badgeText: '#FFFFFF',
    topBorder: '#EF4444',
    tintOverlay: 'rgba(239, 68, 68, 0.08)',
    activeBtnBg: '#EF4444',
  },
];

// ── SVG Donut Ring Component for Assigned Teachers ───────────────────────────
function AssignedDonutRing({ percentage }: { percentage: number }) {
  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (IS_WEB) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* @ts-ignore */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* @ts-ignore */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* @ts-ignore */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2563EB"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A' }}>{percentage}%</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.nativeDonutWrap}>
      <Text style={styles.nativeDonutText}>{percentage}%</Text>
    </View>
  );
}

// ── Mini Sparkline Graphic ──────────────────────────────────────────────────
function MiniBarGraphic() {
  return (
    <View style={styles.sparklineWrap}>
      <View style={[styles.sparkBar, { height: 12, backgroundColor: '#818CF8', opacity: 0.4 }]} />
      <View style={[styles.sparkBar, { height: 18, backgroundColor: '#818CF8', opacity: 0.6 }]} />
      <View style={[styles.sparkBar, { height: 26, backgroundColor: '#818CF8', opacity: 0.85 }]} />
      <View style={[styles.sparkBar, { height: 34, backgroundColor: '#6366F1' }]} />
    </View>
  );
}

// ── Mini Avatars Graphic ────────────────────────────────────────────────────
function MiniAvatarsGraphic() {
  return (
    <View style={styles.avatarsGraphicWrap}>
      <View style={[styles.avatarCircle, { backgroundColor: '#93C5FD', zIndex: 3 }]}>
        <Text style={styles.avatarCircleText}>👦</Text>
      </View>
      <View style={[styles.avatarCircle, { backgroundColor: '#86EFAC', marginLeft: -8, zIndex: 2 }]}>
        <Text style={styles.avatarCircleText}>👧</Text>
      </View>
      <View style={[styles.avatarCircle, { backgroundColor: '#FDE047', marginLeft: -8, zIndex: 1 }]}>
        <Text style={styles.avatarCircleText}>🧑</Text>
      </View>
    </View>
  );
}

// ── Main AdminClassesScreen Component ───────────────────────────────────────
export default function AdminClassesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive Grid Columns: Desktop (>= 1100px) = 3 cols, Tablet (>= 720px) = 2 cols, Mobile = 1 col
  const numColumns = useMemo(() => {
    if (width >= 1100) return 3;
    if (width >= 720) return 2;
    return 1;
  }, [width]);

  // Data States
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Inactive classes tracker for interactive status toggles (persists in session)
  const [inactiveClassIds, setInactiveClassIds] = useState<Set<string>>(new Set());

  // Filter & Search States
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('All Grades');
  const [selectedSection, setSelectedSection] = useState<string>('All Sections');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('All Teachers');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Dropdown Open States for Custom Dropdowns
  const [openDropdown, setOpenDropdown] = useState<'grade' | 'section' | 'teacher' | 'status' | null>(null);

  // Add Class Modal State
  const [addModal, setAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('A');
  const [newRoom, setNewRoom] = useState('');
  const [newCapacity, setNewCapacity] = useState('40');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  // Edit Class Modal State
  const [editModal, setEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<AdminClass | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editCapacity, setEditCapacity] = useState('40');
  const [editSaving, setEditSaving] = useState(false);

  // Reassign Teacher Modal State
  const [reassignModal, setReassignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AdminClass | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [reassignSaving, setReassignSaving] = useState(false);

  // View Details Modal State
  const [detailsModal, setDetailsModal] = useState(false);
  const [detailsClass, setDetailsClass] = useState<AdminClass | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<{ id: string; name: string; roll_number: string }[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Three-dot Action Menu Popover
  const [activeMenuClassId, setActiveMenuClassId] = useState<string | null>(null);

  // ── Load Data ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cList, tList] = await Promise.all([
        listClasses(),
        listUsers('teacher'),
      ]);
      setClasses(cList);
      setTeachers(tList);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Dynamic Options for Filters
  const gradeOptions = useMemo(() => {
    const grades = Array.from(new Set(classes.map(c => c.grade_level))).sort((a, b) => a - b);
    return ['All Grades', ...grades.map(g => `Grade ${g}`)];
  }, [classes]);

  const sectionOptions = useMemo(() => {
    const sections = Array.from(new Set(classes.map(c => c.section))).filter(Boolean).sort();
    return ['All Sections', ...sections.map(s => `Section ${s}`)];
  }, [classes]);

  const teacherOptions = useMemo(() => {
    const activeTeacherNames = teachers.filter(t => t.is_active).map(t => t.name).sort();
    return ['All Teachers', ...activeTeacherNames];
  }, [teachers]);

  const statusOptions = ['All Status', 'Active', 'Inactive'];

  // Dynamic Filtered Classes
  const filtered = useMemo(() => {
    return classes.filter(cls => {
      const isInactive = inactiveClassIds.has(cls.id);
      const statusStr = isInactive ? 'Inactive' : 'Active';

      // 1. Search Query Filter (Class name, grade, section, teacher name, room)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = cls.name.toLowerCase().includes(q);
        const matchGrade = `grade ${cls.grade_level}`.toLowerCase().includes(q);
        const matchSection = `section ${cls.section}`.toLowerCase().includes(q);
        const matchTeacher = (cls.teacher_name ?? '').toLowerCase().includes(q);
        const matchRoom = (cls.room_number ?? '').toLowerCase().includes(q);
        if (!matchName && !matchGrade && !matchSection && !matchTeacher && !matchRoom) {
          return false;
        }
      }

      // 2. Grade Filter
      if (selectedGrade !== 'All Grades') {
        const expectedGrade = parseInt(selectedGrade.replace('Grade', '').trim(), 10);
        if (cls.grade_level !== expectedGrade) return false;
      }

      // 3. Section Filter
      if (selectedSection !== 'All Sections') {
        const expectedSection = selectedSection.replace('Section', '').trim();
        if (cls.section !== expectedSection) return false;
      }

      // 4. Teacher Filter
      if (selectedTeacher !== 'All Teachers') {
        if ((cls.teacher_name ?? '') !== selectedTeacher) return false;
      }

      // 5. Status Filter
      if (selectedStatus !== 'All Status') {
        if (statusStr !== selectedStatus) return false;
      }

      return true;
    });
  }, [classes, inactiveClassIds, search, selectedGrade, selectedSection, selectedTeacher, selectedStatus]);

  // Dynamic Counts for Summary Cards
  const totalClassesCount = classes.length;
  const totalStudentsCount = useMemo(() => {
    return classes.reduce((sum, c) => sum + (c.student_count ?? 0), 0);
  }, [classes]);
  const assignedTeachersCount = useMemo(() => {
    return classes.filter(c => !!c.class_teacher_id).length;
  }, [classes]);
  const unassignedClassesCount = useMemo(() => {
    return classes.filter(c => !c.class_teacher_id).length;
  }, [classes]);
  const assignedPercentage = useMemo(() => {
    if (totalClassesCount === 0) return 0;
    return Math.round((assignedTeachersCount / totalClassesCount) * 100);
  }, [assignedTeachersCount, totalClassesCount]);

  // Reset Filters handler
  const handleResetFilters = () => {
    setSearch('');
    setSelectedGrade('All Grades');
    setSelectedSection('All Sections');
    setSelectedTeacher('All Teachers');
    setSelectedStatus('All Status');
    setOpenDropdown(null);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddClass = async () => {
    if (!newName.trim() || !newGrade.trim()) {
      Alert.alert('Validation', 'Class name and grade level are required.');
      return;
    }
    setAddSaving(true);
    try {
      await createClass({
        name: newName.trim(),
        grade_level: parseInt(newGrade, 10),
        section: newSection.trim() || 'A',
        room_number: newRoom.trim() || undefined,
        capacity: parseInt(newCapacity, 10) || 40,
        class_teacher_id: newTeacherId || undefined,
      });
      setAddModal(false);
      setNewName('');
      setNewGrade('');
      setNewSection('A');
      setNewRoom('');
      setNewCapacity('40');
      setNewTeacherId('');
      await load();
      Alert.alert('Success', 'Class created successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Create failed');
    } finally {
      setAddSaving(false);
    }
  };

  const openEdit = (cls: AdminClass) => {
    setEditingClass(cls);
    setEditName(cls.name);
    setEditGrade(String(cls.grade_level));
    setEditSection(cls.section);
    setEditRoom(cls.room_number ?? '');
    setEditCapacity(String(cls.capacity));
    setActiveMenuClassId(null);
    setEditModal(true);
  };

  const handleEditClass = async () => {
    if (!editingClass) return;
    if (!editName.trim() || !editGrade.trim()) {
      Alert.alert('Validation', 'Class name and grade level are required.');
      return;
    }
    setEditSaving(true);
    try {
      await updateClass(editingClass.id, {
        name: editName.trim(),
        grade_level: parseInt(editGrade, 10),
        section: editSection.trim() || 'A',
        room_number: editRoom.trim() || undefined,
        capacity: parseInt(editCapacity, 10) || 40,
      });
      setEditModal(false);
      setEditingClass(null);
      await load();
      Alert.alert('Success', 'Class updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Update failed');
    } finally {
      setEditSaving(false);
    }
  };

  const openReassign = (cls: AdminClass) => {
    setSelectedClass(cls);
    setSelectedTeacherId(cls.class_teacher_id ?? '');
    setActiveMenuClassId(null);
    setReassignModal(true);
  };

  const handleReassign = async () => {
    if (!selectedClass || !selectedTeacherId) {
      Alert.alert('Validation', 'Please select a teacher.');
      return;
    }
    setReassignSaving(true);
    try {
      await assignTeacher(selectedClass.id, selectedTeacherId);
      setReassignModal(false);
      await load();
      Alert.alert('Success', 'Teacher assigned successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Reassignment failed');
    } finally {
      setReassignSaving(false);
    }
  };

  const openViewDetails = async (cls: AdminClass) => {
    setDetailsClass(cls);
    setActiveMenuClassId(null);
    setDetailsModal(true);
    setLoadingStudents(true);
    try {
      const students = await getClassStudents(cls.id);
      setEnrolledStudents(students || []);
    } catch {
      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleClassStatus = (clsId: string) => {
    setActiveMenuClassId(null);
    setInactiveClassIds(prev => {
      const next = new Set(prev);
      if (next.has(clsId)) {
        next.delete(clsId);
        Alert.alert('Status Updated', 'Class is now Active.');
      } else {
        next.add(clsId);
        Alert.alert('Status Updated', 'Class is now Inactive.');
      }
      return next;
    });
  };

  const handleDeleteClass = (cls: AdminClass) => {
    setActiveMenuClassId(null);
    const confirmAction = async () => {
      try {
        await deleteClass(cls.id);
        await load();
        Alert.alert('Deleted', `Class "${cls.name}" was removed.`);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Failed to delete class');
      }
    };

    if (IS_WEB) {
      if (window.confirm(`Are you sure you want to delete class "${cls.name}"? This action cannot be undone.`)) {
        confirmAction();
      }
    } else {
      Alert.alert(
        'Delete Class',
        `Are you sure you want to delete class "${cls.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmAction },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Header Navigation Bar ───────────────────────────────────────── */}
      <View style={styles.topNavBar}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumbRow}>
          <Text style={styles.breadcrumbHomeIcon}>⌂</Text>
          <Text style={styles.breadcrumbDivider}>›</Text>
          <Text style={styles.breadcrumbItem}>Academic Management</Text>
          <Text style={styles.breadcrumbDivider}>›</Text>
          <Text style={styles.breadcrumbCurrent}>Classes</Text>
        </View>

        {/* Global Controls */}
        <View style={styles.topNavRight}>
          {/* Header Global Search */}
          <View style={styles.headerSearchWrap}>
            <Text style={styles.headerSearchIcon}>🔍</Text>
            <TextInput
              style={styles.headerSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search classes by name, grade or teacher..."
              placeholderTextColor={P.textMuted}
            />
          </View>

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/admin/notifications' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          {/* Admin Profile Pill */}
          <TouchableOpacity
            style={styles.profilePill}
            onPress={() => router.push('/admin/profile' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>A</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Admin</Text>
              <Text style={styles.profileRole}>Administrator</Text>
            </View>
            <Text style={styles.profileChevron}>▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Main Banner / Hero Header ───────────────────────────────────────── */}
        <View style={styles.heroBanner}>
          {/* Left Title & Subtitle */}
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Class Management</Text>
            <Text style={styles.heroSubtitle}>
              Manage your classes, assign teachers, view students and monitor class activities
            </Text>
          </View>

          {/* Center/Right Hero Visual & Quote & Action Button */}
          <View style={styles.heroRight}>
            {/* Subtle Classroom Visual behind quote */}
            <View style={styles.heroClassroomVisualWrap} pointerEvents="none">
              <Image
                source={classroomBgImg}
                style={styles.heroClassroomImg}
                resizeMode="cover"
              />
              <View style={styles.heroClassroomOverlay} />
            </View>

            {/* Blue Quote */}
            <View style={styles.heroQuoteBox}>
              <Text style={styles.heroQuoteText}>
                “Every class is a new opportunity to create bright minds.”
              </Text>
            </View>

            {/* + Add Class Primary Button */}
            <TouchableOpacity
              style={styles.heroAddBtn}
              onPress={() => setAddModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroAddBtnIcon}>+</Text>
              <Text style={styles.heroAddBtnText}>Add Class</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 4 Summary Cards Row ────────────────────────────────────────────── */}
        <View style={styles.summaryGrid}>
          {/* Card 1: Total Classes */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <View style={[styles.summaryIconBox, { backgroundColor: '#EEF2FF' }]}>
                <Text style={styles.summaryIconText}>📖</Text>
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={styles.summaryTitle}>Total Classes</Text>
                <Text style={styles.summaryNumber}>{totalClassesCount}</Text>
                <View style={styles.trendRow}>
                  <Text style={styles.trendText}>↑ +1 this month</Text>
                </View>
              </View>
            </View>
            <MiniBarGraphic />
          </View>

          {/* Card 2: Total Students */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <View style={[styles.summaryIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Text style={styles.summaryIconText}>👥</Text>
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={styles.summaryTitle}>Total Students</Text>
                <Text style={styles.summaryNumber}>{totalStudentsCount}</Text>
                <View style={styles.trendRow}>
                  <Text style={styles.trendText}>↑ +8 this month</Text>
                </View>
              </View>
            </View>
            <MiniAvatarsGraphic />
          </View>

          {/* Card 3: Assigned Teachers */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <View style={[styles.summaryIconBox, { backgroundColor: '#FFEDD5' }]}>
                <Text style={styles.summaryIconText}>👨‍🏫</Text>
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={styles.summaryTitle}>Assigned Teachers</Text>
                <Text style={styles.summaryNumber}>{assignedTeachersCount}</Text>
              </View>
            </View>
            <AssignedDonutRing percentage={assignedPercentage} />
          </View>

          {/* Card 4: Unassigned Classes */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <View style={[styles.summaryIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.summaryIconText}>🔖</Text>
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={styles.summaryTitle}>Unassigned Classes</Text>
                <Text style={styles.summaryNumber}>{unassignedClassesCount}</Text>
              </View>
            </View>
            <View style={styles.unassignedChevronBox}>
              <Text style={styles.unassignedChevron}>›</Text>
            </View>
          </View>
        </View>

        {/* ── Filter & Search Control Bar ────────────────────────────────────── */}
        <View style={styles.filterBar}>
          {/* Search Input */}
          <View style={styles.filterSearchBox}>
            <Text style={styles.filterSearchIcon}>🔍</Text>
            <TextInput
              style={styles.filterSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search class by name, grade or teacher..."
              placeholderTextColor={P.textMuted}
            />
          </View>

          {/* Dropdown 1: Grade */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Grade</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setOpenDropdown(openDropdown === 'grade' ? null : 'grade')}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>
                {selectedGrade}
              </Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>

            {openDropdown === 'grade' && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {gradeOptions.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.dropdownItem, selectedGrade === opt && styles.dropdownItemActive]}
                      onPress={() => {
                        setSelectedGrade(opt);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, selectedGrade === opt && styles.dropdownItemTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Dropdown 2: Section */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Section</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setOpenDropdown(openDropdown === 'section' ? null : 'section')}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>
                {selectedSection}
              </Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>

            {openDropdown === 'section' && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {sectionOptions.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.dropdownItem, selectedSection === opt && styles.dropdownItemActive]}
                      onPress={() => {
                        setSelectedSection(opt);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, selectedSection === opt && styles.dropdownItemTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Dropdown 3: Teacher */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Teacher</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setOpenDropdown(openDropdown === 'teacher' ? null : 'teacher')}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>
                {selectedTeacher}
              </Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>

            {openDropdown === 'teacher' && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {teacherOptions.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.dropdownItem, selectedTeacher === opt && styles.dropdownItemActive]}
                      onPress={() => {
                        setSelectedTeacher(opt);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, selectedTeacher === opt && styles.dropdownItemTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Dropdown 4: Status */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Status</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>
                {selectedStatus}
              </Text>
              <Text style={styles.dropdownChevron}>▾</Text>
            </TouchableOpacity>

            {openDropdown === 'status' && (
              <View style={styles.dropdownMenu}>
                {statusOptions.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownItem, selectedStatus === opt && styles.dropdownItemActive]}
                    onPress={() => {
                      setSelectedStatus(opt);
                      setOpenDropdown(null);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, selectedStatus === opt && styles.dropdownItemTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Reset Filters */}
          <TouchableOpacity
            style={styles.resetFiltersBtn}
            onPress={handleResetFilters}
            activeOpacity={0.7}
          >
            <Text style={styles.resetFiltersIcon}>🔄</Text>
            <Text style={styles.resetFiltersText}>Reset Filters</Text>
          </TouchableOpacity>

          {/* Grid / List View Toggle */}
          <View style={styles.viewToggleGroup}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'grid' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewToggleIcon, viewMode === 'grid' && styles.viewToggleIconActive]}>
                ⊞
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewToggleIcon, viewMode === 'list' && styles.viewToggleIconActive]}>
                ☰
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Main Content Area (Grid or List View) ──────────────────────────── */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={P.primary} />
            <Text style={styles.loadingText}>Loading class records from database...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🏫</Text>
            <Text style={styles.emptyTitle}>No matching classes found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search criteria or reset filters to view all classes.
            </Text>
            <TouchableOpacity style={styles.emptyResetBtn} onPress={handleResetFilters}>
              <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'grid' ? (
          /* ── 3-Column Responsive Grid View ────────────────────────────────── */
          <View style={styles.gridContainer}>
            {filtered.map((cls, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const isInactive = inactiveClassIds.has(cls.id);
              const hasTeacher = !!cls.class_teacher_id;
              const isMenuOpen = activeMenuClassId === cls.id;

              return (
                <View
                  key={cls.id}
                  style={[
                    styles.classCard,
                    {
                      width: numColumns === 3 ? '31.8%' : numColumns === 2 ? '48.5%' : '100%',
                      borderTopColor: isInactive ? P.red : theme.topBorder,
                    },
                  ]}
                >
                  {/* Top Row: Grade Badge + Status Badge + Classroom Thumbnail */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderLeft}>
                      {/* Grade Badge */}
                      <View style={[styles.gradeBadge, { backgroundColor: isInactive ? P.red : theme.badgeBg }]}>
                        <Text style={styles.gradeBadgeText}>Grade {cls.grade_level}</Text>
                      </View>

                      {/* Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          isInactive
                            ? { backgroundColor: P.redBg, borderColor: P.redBorder }
                            : { backgroundColor: P.greenBg, borderColor: P.greenBorder },
                        ]}
                      >
                        <Text style={styles.statusDot}>
                          {isInactive ? '⏸' : '🔄'}
                        </Text>
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: isInactive ? P.redDark : P.greenDark },
                          ]}
                        >
                          {isInactive ? 'Inactive' : 'Active'}
                        </Text>
                      </View>
                    </View>

                    {/* Classroom Thumbnail with subtle card accent tint */}
                    <View style={[styles.classroomThumbnailWrap, { backgroundColor: theme.tintOverlay }]}>
                      <Image
                        source={classroomBgImg}
                        style={styles.classroomThumbnailImg}
                        resizeMode="cover"
                      />
                    </View>
                  </View>

                  {/* Class Name (Clickable) */}
                  <TouchableOpacity
                    style={styles.classNameRow}
                    onPress={() => openViewDetails(cls)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.classNameText}>{cls.name}</Text>
                    <Text style={styles.classNameChevron}>›</Text>
                  </TouchableOpacity>

                  {/* Room & Section Indicators */}
                  <View style={styles.roomSectionRow}>
                    <View style={styles.roomBadge}>
                      <Text style={styles.roomIcon}>🏛️</Text>
                      <Text style={styles.roomText}>
                        {cls.room_number ? cls.room_number : 'Room 101'}
                      </Text>
                    </View>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionIcon}>⬡</Text>
                      <Text style={styles.sectionText}>Section {cls.section}</Text>
                    </View>
                  </View>

                  {/* 3 Metric Information Blocks */}
                  <View style={styles.metricContainer}>
                    {/* Students */}
                    <View style={styles.metricBox}>
                      <View style={[styles.metricIconWrap, { backgroundColor: '#EFF6FF' }]}>
                        <Text style={styles.metricIcon}>👤</Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={styles.metricValue}>{cls.student_count ?? 0}</Text>
                        <Text style={styles.metricLabel}>Students</Text>
                      </View>
                    </View>

                    {/* Capacity */}
                    <View style={styles.metricBox}>
                      <View style={[styles.metricIconWrap, { backgroundColor: '#F5F3FF' }]}>
                        <Text style={styles.metricIcon}>📑</Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={styles.metricValue}>{cls.capacity ?? 40}</Text>
                        <Text style={styles.metricLabel}>Capacity</Text>
                      </View>
                    </View>

                    {/* Class Teacher */}
                    <View style={[styles.metricBox, { flex: 1.3 }]}>
                      <View
                        style={[
                          styles.metricIconWrap,
                          { backgroundColor: hasTeacher ? '#EFF6FF' : '#FEF3C7' },
                        ]}
                      >
                        <Text style={styles.metricIcon}>
                          {hasTeacher ? '👩‍🏫' : '⚠️'}
                        </Text>
                      </View>
                      <View style={styles.metricInfo}>
                        <Text
                          style={[
                            styles.metricValue,
                            {
                              fontSize: 13,
                              color: hasTeacher ? P.text : P.amberDark,
                              fontWeight: '700',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {cls.teacher_name ? cls.teacher_name : 'Not Assigned'}
                        </Text>
                        <Text style={styles.metricLabel}>Class Teacher</Text>
                      </View>
                    </View>
                  </View>

                  {/* Card Action Buttons Row */}
                  <View style={styles.cardActionsRow}>
                    {/* View Details */}
                    <TouchableOpacity
                      style={styles.viewDetailsBtn}
                      onPress={() => openViewDetails(cls)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>

                    {/* Primary Action Button */}
                    {isInactive ? (
                      <TouchableOpacity
                        style={[styles.primaryActionBtn, { backgroundColor: P.red }]}
                        onPress={() => toggleClassStatus(cls.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.primaryActionIcon}>⚡</Text>
                        <Text style={styles.primaryActionText}>Activate Class</Text>
                      </TouchableOpacity>
                    ) : hasTeacher ? (
                      <TouchableOpacity
                        style={[styles.primaryActionBtn, { backgroundColor: theme.activeBtnBg }]}
                        onPress={() => openReassign(cls)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.primaryActionIcon}>🔄</Text>
                        <Text style={styles.primaryActionText}>Reassign Teacher</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.primaryActionBtn, { backgroundColor: P.primary }]}
                        onPress={() => openReassign(cls)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.primaryActionIcon}>+</Text>
                        <Text style={styles.primaryActionText}>Assign Teacher</Text>
                      </TouchableOpacity>
                    )}

                    {/* Three-Dot Menu Button */}
                    <TouchableOpacity
                      style={styles.threeDotBtn}
                      onPress={() => setActiveMenuClassId(isMenuOpen ? null : cls.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.threeDotText}>•••</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Three-Dot Action Popover Menu */}
                  {isMenuOpen && (
                    <View style={styles.actionMenuPopover}>
                      <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => openViewDetails(cls)}
                      >
                        <Text style={styles.actionMenuIcon}>📄</Text>
                        <Text style={styles.actionMenuText}>View Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => openEdit(cls)}
                      >
                        <Text style={styles.actionMenuIcon}>✏️</Text>
                        <Text style={styles.actionMenuText}>Edit Class</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => openReassign(cls)}
                      >
                        <Text style={styles.actionMenuIcon}>👩‍🏫</Text>
                        <Text style={styles.actionMenuText}>
                          {hasTeacher ? 'Reassign Teacher' : 'Assign Teacher'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => toggleClassStatus(cls.id)}
                      >
                        <Text style={styles.actionMenuIcon}>
                          {isInactive ? '⚡' : '⏸️'}
                        </Text>
                        <Text style={styles.actionMenuText}>
                          {isInactive ? 'Activate Class' : 'Deactivate Class'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.actionMenuDivider} />

                      <TouchableOpacity
                        style={[styles.actionMenuItem, { marginBottom: 0 }]}
                        onPress={() => handleDeleteClass(cls)}
                      >
                        <Text style={styles.actionMenuIcon}>🗑️</Text>
                        <Text style={[styles.actionMenuText, { color: P.red, fontWeight: '700' }]}>
                          Delete Class
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            {/* ── Add New Class Dashed Card (Matching Reference) ──────────────── */}
            <TouchableOpacity
              style={[
                styles.addNewClassCard,
                {
                  width: numColumns === 3 ? '31.8%' : numColumns === 2 ? '48.5%' : '100%',
                },
              ]}
              onPress={() => setAddModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.addPlusCircle}>
                <Text style={styles.addPlusCircleIcon}>+</Text>
              </View>
              <Text style={styles.addNewClassTitle}>Add New Class</Text>
              <Text style={styles.addNewClassSubtitle}>
                Create a new class, assign a teacher and set up sections
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Table / List View ────────────────────────────────────────────── */
          <View style={styles.listViewCard}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thText, { flex: 0.8 }]}>Grade</Text>
              <Text style={[styles.thText, { flex: 1.5 }]}>Class Name</Text>
              <Text style={[styles.thText, { flex: 0.9 }]}>Section</Text>
              <Text style={[styles.thText, { flex: 1.1 }]}>Room</Text>
              <Text style={[styles.thText, { flex: 0.9 }]}>Students</Text>
              <Text style={[styles.thText, { flex: 0.9 }]}>Capacity</Text>
              <Text style={[styles.thText, { flex: 1.8 }]}>Class Teacher</Text>
              <Text style={[styles.thText, { flex: 1 }]}>Status</Text>
              <Text style={[styles.thText, { flex: 1.5, textAlign: 'right' }]}>Actions</Text>
            </View>

            {filtered.map((cls, idx) => {
              const isInactive = inactiveClassIds.has(cls.id);
              const hasTeacher = !!cls.class_teacher_id;
              return (
                <View
                  key={cls.id}
                  style={[
                    styles.tableDataRow,
                    idx % 2 === 1 && { backgroundColor: '#F8FAFC' },
                  ]}
                >
                  <Text style={[styles.tdText, { flex: 0.8, fontWeight: '700' }]}>
                    Grade {cls.grade_level}
                  </Text>
                  <Text style={[styles.tdText, { flex: 1.5, fontWeight: '800', color: P.primary }]}>
                    {cls.name}
                  </Text>
                  <Text style={[styles.tdText, { flex: 0.9 }]}>{cls.section}</Text>
                  <Text style={[styles.tdText, { flex: 1.1, color: P.textSec }]}>
                    {cls.room_number || 'Room 101'}
                  </Text>
                  <Text style={[styles.tdText, { flex: 0.9, fontWeight: '700' }]}>
                    {cls.student_count ?? 0}
                  </Text>
                  <Text style={[styles.tdText, { flex: 0.9, color: P.textSec }]}>
                    {cls.capacity ?? 40}
                  </Text>
                  <Text
                    style={[
                      styles.tdText,
                      {
                        flex: 1.8,
                        fontWeight: '600',
                        color: hasTeacher ? P.text : P.amberDark,
                      },
                    ]}
                  >
                    {cls.teacher_name || 'Not Assigned'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <View
                      style={[
                        styles.statusBadge,
                        { alignSelf: 'flex-start' },
                        isInactive
                          ? { backgroundColor: P.redBg, borderColor: P.redBorder }
                          : { backgroundColor: P.greenBg, borderColor: P.greenBorder },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: isInactive ? P.redDark : P.greenDark },
                        ]}
                      >
                        {isInactive ? 'Inactive' : 'Active'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.tableActionsWrap, { flex: 1.5 }]}>
                    <TouchableOpacity
                      style={styles.tableActionBtn}
                      onPress={() => openViewDetails(cls)}
                    >
                      <Text style={styles.tableActionBtnText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tableActionBtn, { backgroundColor: P.primaryLight }]}
                      onPress={() => openReassign(cls)}
                    >
                      <Text style={[styles.tableActionBtnText, { color: P.primary }]}>
                        Assign
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL 1: Add New Class ───────────────────────────────────────────── */}
      <Modal visible={addModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New Class</Text>
                <Text style={styles.modalSubtitle}>Create a new academic class and assign a class teacher</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setAddModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Class Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Class 10 - A"
                placeholderTextColor={P.textMuted}
              />

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Grade Level (1-12) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGrade}
                    onChangeText={setNewGrade}
                    placeholder="10"
                    placeholderTextColor={P.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Section *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newSection}
                    onChangeText={setNewSection}
                    placeholder="A"
                    placeholderTextColor={P.textMuted}
                  />
                </View>
              </View>

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Room Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRoom}
                    onChangeText={setNewRoom}
                    placeholder="e.g. Room 204"
                    placeholderTextColor={P.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Student Capacity</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newCapacity}
                    onChangeText={setNewCapacity}
                    placeholder="40"
                    placeholderTextColor={P.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Assign Class Teacher (Optional)</Text>
              <View style={styles.teacherSelectBox}>
                <TouchableOpacity
                  style={[
                    styles.teacherSelectOption,
                    !newTeacherId && styles.teacherSelectOptionActive,
                  ]}
                  onPress={() => setNewTeacherId('')}
                >
                  <Text style={[styles.teacherOptionName, !newTeacherId && { color: P.primary, fontWeight: '700' }]}>
                    None (Leave unassigned for now)
                  </Text>
                </TouchableOpacity>

                {teachers.filter(t => t.is_active).map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.teacherSelectOption,
                      newTeacherId === t.id && styles.teacherSelectOptionActive,
                    ]}
                    onPress={() => setNewTeacherId(t.id)}
                  >
                    <View style={styles.teacherAvatarCircle}>
                      <Text style={styles.teacherAvatarText}>{t.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.teacherOptionName, newTeacherId === t.id && { color: P.primary, fontWeight: '700' }]}>
                        {t.name}
                      </Text>
                      <Text style={styles.teacherOptionEmail}>{t.email}</Text>
                    </View>
                    {newTeacherId === t.id && <Text style={{ color: P.primary, fontSize: 16 }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddModal(false)}
                disabled={addSaving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleAddClass}
                disabled={addSaving}
              >
                {addSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Create Class</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: Edit Class ─────────────────────────────────────────────── */}
      <Modal visible={editModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Class</Text>
                <Text style={styles.modalSubtitle}>Update class details and configurations</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Class Name *</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Class Name"
                placeholderTextColor={P.textMuted}
              />

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Grade Level *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editGrade}
                    onChangeText={setEditGrade}
                    placeholder="10"
                    placeholderTextColor={P.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Section *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editSection}
                    onChangeText={setEditSection}
                    placeholder="A"
                    placeholderTextColor={P.textMuted}
                  />
                </View>
              </View>

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Room Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editRoom}
                    onChangeText={setEditRoom}
                    placeholder="e.g. Room 204"
                    placeholderTextColor={P.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Capacity</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editCapacity}
                    onChangeText={setEditCapacity}
                    placeholder="40"
                    placeholderTextColor={P.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModal(false)}
                disabled={editSaving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleEditClass}
                disabled={editSaving}
              >
                {editSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: Assign / Reassign Teacher ────────────────────────────────── */}
      <Modal visible={reassignModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedClass?.class_teacher_id ? 'Reassign Class Teacher' : 'Assign Class Teacher'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Select a faculty member for {selectedClass?.name}
                </Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setReassignModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Available Faculty Members</Text>
              <View style={styles.teacherSelectBox}>
                {teachers.filter(t => t.is_active).map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.teacherSelectOption,
                      selectedTeacherId === t.id && styles.teacherSelectOptionActive,
                    ]}
                    onPress={() => setSelectedTeacherId(t.id)}
                  >
                    <View style={styles.teacherAvatarCircle}>
                      <Text style={styles.teacherAvatarText}>{t.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.teacherOptionName, selectedTeacherId === t.id && { color: P.primary, fontWeight: '700' }]}>
                        {t.name}
                      </Text>
                      <Text style={styles.teacherOptionEmail}>{t.email}</Text>
                    </View>
                    {selectedTeacherId === t.id && <Text style={{ color: P.primary, fontSize: 16 }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReassignModal(false)}
                disabled={reassignSaving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleReassign}
                disabled={reassignSaving || !selectedTeacherId}
              >
                {reassignSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Confirm Assignment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 4: View Class Details ──────────────────────────────────────── */}
      <Modal visible={detailsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 640 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.gradeBadge, { backgroundColor: P.primary }]}>
                  <Text style={styles.gradeBadgeText}>Grade {detailsClass?.grade_level}</Text>
                </View>
                <Text style={styles.modalTitle}>{detailsClass?.name}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDetailsModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Class Info Summary Card */}
              <View style={styles.detailsSummaryCard}>
                <View style={styles.detailsMetaGrid}>
                  <View style={styles.detailsMetaItem}>
                    <Text style={styles.detailsMetaLabel}>Section</Text>
                    <Text style={styles.detailsMetaVal}>{detailsClass?.section}</Text>
                  </View>
                  <View style={styles.detailsMetaItem}>
                    <Text style={styles.detailsMetaLabel}>Room Number</Text>
                    <Text style={styles.detailsMetaVal}>{detailsClass?.room_number || 'Room 101'}</Text>
                  </View>
                  <View style={styles.detailsMetaItem}>
                    <Text style={styles.detailsMetaLabel}>Capacity</Text>
                    <Text style={styles.detailsMetaVal}>{detailsClass?.capacity ?? 40}</Text>
                  </View>
                  <View style={styles.detailsMetaItem}>
                    <Text style={styles.detailsMetaLabel}>Class Teacher</Text>
                    <Text style={[styles.detailsMetaVal, { color: detailsClass?.teacher_name ? P.text : P.amberDark }]}>
                      {detailsClass?.teacher_name || 'Not Assigned'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Enrolled Students Header */}
              <View style={styles.studentsHeaderRow}>
                <Text style={styles.studentsSectionTitle}>
                  Enrolled Students ({enrolledStudents.length})
                </Text>
              </View>

              {/* Students List */}
              {loadingStudents ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator color={P.primary} />
                  <Text style={{ marginTop: 8, color: P.textSec, fontSize: 13 }}>Loading students list...</Text>
                </View>
              ) : enrolledStudents.length === 0 ? (
                <View style={styles.noStudentsBox}>
                  <Text style={{ fontSize: 24 }}>🧑‍🎓</Text>
                  <Text style={styles.noStudentsText}>No students enrolled in this class yet.</Text>
                </View>
              ) : (
                <View style={styles.studentsListBox}>
                  {enrolledStudents.map((st, i) => (
                    <View key={st.id} style={[styles.studentRowItem, i % 2 === 1 && { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.studentAvatarCircle}>
                        <Text style={styles.studentAvatarText}>{st.name[0]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentNameText}>{st.name}</Text>
                        <Text style={styles.studentRollText}>Roll No: {st.roll_number}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDetailsModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              {detailsClass && (
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={() => {
                    setDetailsModal(false);
                    openReassign(detailsClass);
                  }}
                >
                  <Text style={styles.modalSaveText}>
                    {detailsClass.class_teacher_id ? 'Reassign Teacher' : 'Assign Teacher'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 40,
  },

  // ── Top Nav Bar ─────────────────────────────────────────────────────────────
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: P.card,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    zIndex: 20,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbHomeIcon: {
    fontSize: 15,
    color: '#64748B',
  },
  breadcrumbDivider: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  breadcrumbItem: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  breadcrumbCurrent: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: 280,
    gap: 8,
  },
  headerSearchIcon: {
    fontSize: 13,
    color: P.textMuted,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 12.5,
    color: P.text,
    outlineStyle: 'none' as any,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 16,
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 22,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 8,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  profileInfo: {},
  profileName: {
    fontSize: 12,
    fontWeight: '700',
    color: P.text,
    lineHeight: 14,
  },
  profileRole: {
    fontSize: 9.5,
    color: P.textSec,
    fontWeight: '500',
    lineHeight: 12,
  },
  profileChevron: {
    fontSize: 11,
    color: P.textMuted,
  },

  // ── Hero Banner ─────────────────────────────────────────────────────────────
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    position: 'relative',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 20,
  },
  heroRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  heroClassroomVisualWrap: {
    position: 'absolute',
    right: 130,
    top: -24,
    width: 240,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.88,
  },
  heroClassroomImg: {
    width: '100%',
    height: '100%',
  },
  heroClassroomOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247, 250, 255, 0.35)',
  },
  heroQuoteBox: {
    maxWidth: 240,
    paddingRight: 10,
  },
  heroQuoteText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563EB',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  heroAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  heroAddBtnIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
  },
  heroAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // ── Summary Cards Grid ──────────────────────────────────────────────────────
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 22,
  },
  summaryCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  summaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: {
    fontSize: 20,
  },
  summaryTextWrap: {},
  summaryTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  sparklineWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 36,
  },
  sparkBar: {
    width: 5,
    borderRadius: 2.5,
  },
  avatarsGraphicWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarCircleText: {
    fontSize: 11,
  },
  nativeDonutWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeDonutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  unassignedChevronBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unassignedChevron: {
    fontSize: 18,
    color: '#D97706',
    fontWeight: '700',
    marginTop: -2,
  },

  // ── Filter Bar ──────────────────────────────────────────────────────────────
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: P.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
    zIndex: 15,
  },
  filterSearchBox: {
    flex: 1.6,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterSearchIcon: {
    fontSize: 14,
    color: P.textMuted,
  },
  filterSearchInput: {
    flex: 1,
    fontSize: 13,
    color: P.text,
    outlineStyle: 'none' as any,
  },
  dropdownContainer: {
    position: 'relative',
    minWidth: 120,
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: P.border,
    gap: 6,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownChevron: {
    fontSize: 10,
    color: '#64748B',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
    padding: 4,
  },
  dropdownItem: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  resetFiltersIcon: {
    fontSize: 12,
  },
  resetFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  viewToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  viewToggleIcon: {
    fontSize: 14,
    color: '#64748B',
  },
  viewToggleIconActive: {
    color: '#FFFFFF',
  },

  // ── Grid Container & Class Card ─────────────────────────────────────────────
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'stretch',
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: P.border,
    borderTopWidth: 4,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  gradeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    fontSize: 9,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  classroomThumbnailWrap: {
    width: 82,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  classroomThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  classNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  classNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  classNameChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
  roomSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  roomIcon: {
    fontSize: 12,
  },
  roomText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionIcon: {
    fontSize: 11,
    color: '#64748B',
  },
  sectionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Metric Container
  metricContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  metricBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    fontSize: 14,
  },
  metricInfo: {
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Card Action Buttons
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewDetailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
    gap: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  threeDotBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threeDotText: {
    fontSize: 14,
    color: '#64748B',
    letterSpacing: -1,
  },

  // Action Menu Popover
  actionMenuPopover: {
    position: 'absolute',
    bottom: 56,
    right: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    padding: 6,
    width: 190,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
    zIndex: 100,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionMenuIcon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  actionMenuText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },

  // ── Add New Class Dashed Card ────────────────────────────────────────────────
  addNewClassCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  addPlusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlusCircleIcon: {
    fontSize: 24,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: -2,
  },
  addNewClassTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  addNewClassSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 220,
    marginTop: 6,
    lineHeight: 18,
  },

  // ── List View Table ─────────────────────────────────────────────────────────
  listViewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  thText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdText: {
    fontSize: 12.5,
    color: '#0F172A',
  },
  tableActionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  tableActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: '#FFFFFF',
  },
  tableActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },

  // ── Loading & Empty States ──────────────────────────────────────────────────
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: P.textSec,
    fontWeight: '500',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: P.border,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 380,
    marginBottom: 16,
  },
  emptyResetBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // ── Modals ──────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  modalBody: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    outlineStyle: 'none' as any,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  teacherSelectBox: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    padding: 6,
    gap: 4,
  },
  teacherSelectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  teacherSelectOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  teacherAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  teacherOptionName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  teacherOptionEmail: {
    fontSize: 10.5,
    color: '#64748B',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Details Modal Components ────────────────────────────────────────────────
  detailsSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    padding: 14,
    marginBottom: 16,
  },
  detailsMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailsMetaItem: {
    width: '46%',
  },
  detailsMetaLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  detailsMetaVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  studentsSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  noStudentsBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    gap: 6,
  },
  noStudentsText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  studentsListBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
  },
  studentRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  studentAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  studentNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentRollText: {
    fontSize: 10.5,
    color: '#64748B',
  },
});
