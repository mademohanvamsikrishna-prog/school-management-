/**
 * AdminStudentsScreen — Dedicated Student Management
 * Route: /admin/students
 *
 * Recreates the layout, styling, cards, tables, analytics, and responsive behavior
 * from the reference design, connected directly to real database student records.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  getStudentsOverview,
  bulkUpdateStudentStatus,
  bulkAssignClass,
  createUser,
  updateUser,
  deactivateUser,
  listClasses,
  listRoles,
  AdminStudentsOverview,
  AdminStudentRecord,
  AdminClass,
  AdminRole,
} from '../../services/admin';

const IS_WEB = Platform.OS === 'web';

// ── Design Tokens matching Reference Image ───────────────────────────────────
const P = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  text: '#0F172A',
  textSec: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryBg: '#EFF6FF',
  primaryBorder: '#BFDBFE',
  indigo: '#4F46E5',
  indigoBg: '#EEF2FF',
  green: '#10B981',
  greenDark: '#15803D',
  greenBg: '#DCFCE7',
  greenBorder: '#BBF7D0',
  amber: '#F59E0B',
  amberDark: '#B45309',
  amberBg: '#FEF3C7',
  amberBorder: '#FDE68A',
  orange: '#F97316',
  orangeBg: '#FFEDD5',
  red: '#EF4444',
  redDark: '#B91C1C',
  redBg: '#FEE2E2',
  redBorder: '#FECACA',
  purple: '#8B5CF6',
  purpleBg: '#F3E8FF',
  purpleBorder: '#DDD6FE',
  slate: '#64748B',
  slateBg: '#F1F5F9',
};

const ITEMS_PER_PAGE_OPTIONS = [8, 10, 20, 50];

export default function AdminStudentsScreen() {
  const router = useRouter();

  // ── Data State ──────────────────────────────────────────────────────────────
  const [data, setData] = useState<AdminStudentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters & Search ────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All Classes');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('All Sections');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
  const [selectedYearFilter, setSelectedYearFilter] = useState('All Years');

  // ── View Mode & Pagination ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // ── Selection State ─────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [distributionFilter, setDistributionFilter] = useState('By Class');

  // ── Modals State ────────────────────────────────────────────────────────────
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<AdminStudentRecord | null>(null);
  const [viewModal, setViewModal] = useState<AdminStudentRecord | null>(null);
  const [assignClassModal, setAssignClassModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // ── Form State (Add Student) ────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('Student@123');
  const [formClassId, setFormClassId] = useState('');
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Form State (Assign Class) ───────────────────────────────────────────────
  const [targetAssignClassId, setTargetAssignClassId] = useState('');

  // ── Edit Form State ─────────────────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [editSaving, setEditSaving] = useState(false);

  // ── Data Fetching ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await getStudentsOverview();
      setData(overview);
      if (overview.classes.length > 0 && !formClassId) {
        setFormClassId(overview.classes[0].id);
        setTargetAssignClassId(overview.classes[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load students overview:', err);
      setError(err?.message || 'Failed to load students data');
    } finally {
      setLoading(false);
    }
  }, [formClassId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rawRecords = useMemo(() => data?.records ?? [], [data]);
  const classesList = useMemo(() => data?.classes ?? [], [data]);
  const summary = useMemo(
    () =>
      data?.summary ?? {
        total_students: 0,
        active_students: 0,
        inactive_students: 0,
        active_percentage: 100,
        inactive_percentage: 0,
        classes_count: 0,
        new_admissions: 0,
        average_attendance: 92,
      },
    [data]
  );

  // ── Filter Options ──────────────────────────────────────────────────────────
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    classesList.forEach((c) => set.add(String(c.grade_level)));
    return ['All Classes', ...Array.from(set).map((g) => `Class ${g}`)];
  }, [classesList]);

  const sectionOptions = useMemo(() => {
    const set = new Set<string>();
    classesList.forEach((c) => set.add(c.section));
    return ['All Sections', ...Array.from(set).sort()];
  }, [classesList]);

  const admissionYearOptions = useMemo(() => {
    return data?.admission_years ?? ['All Years', '2026-2027', '2025-2026'];
  }, [data]);

  // ── Filtering Logic ─────────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return rawRecords.filter((rec) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = rec.name.toLowerCase().includes(q);
        const matchId = rec.student_id.toLowerCase().includes(q);
        const matchEmail = rec.email.toLowerCase().includes(q);
        const matchParent = rec.parent_name.toLowerCase().includes(q);
        const matchClass = rec.class_name.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchEmail && !matchParent && !matchClass) {
          return false;
        }
      }

      // Class Filter
      if (selectedClassFilter !== 'All Classes') {
        const gradeNum = parseInt(selectedClassFilter.replace(/[^0-9]/g, ''), 10);
        if (rec.grade_level !== gradeNum) return false;
      }

      // Section Filter
      if (selectedSectionFilter !== 'All Sections') {
        if (rec.section !== selectedSectionFilter) return false;
      }

      // Status Filter
      if (selectedStatusFilter === 'Active' && !rec.is_active) return false;
      if (selectedStatusFilter === 'Inactive' && rec.is_active) return false;

      // Admission Year Filter
      if (selectedYearFilter !== 'All Years') {
        if (rec.admission_year !== selectedYearFilter) return false;
      }

      return true;
    });
  }, [
    rawRecords,
    search,
    selectedClassFilter,
    selectedSectionFilter,
    selectedStatusFilter,
    selectedYearFilter,
  ]);

  // ── Pagination Calculation ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, activePage, itemsPerPage]);

  const startIndex = filteredRecords.length === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(activePage * itemsPerPage, filteredRecords.length);

  // ── Checkbox Selection Handlers ─────────────────────────────────────────────
  const isAllSelected =
    paginatedRecords.length > 0 &&
    paginatedRecords.every((rec) => selectedIds.includes(rec.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedRecords.some((r) => r.id === id)));
    } else {
      const newIds = new Set([...selectedIds, ...paginatedRecords.map((r) => r.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ── Reset Filters ───────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearch('');
    setSelectedClassFilter('All Classes');
    setSelectedSectionFilter('All Sections');
    setSelectedStatusFilter('All Statuses');
    setSelectedYearFilter('All Years');
    setCurrentPage(1);
  };

  // ── Bulk Status Update ──────────────────────────────────────────────────────
  const handleBulkStatusChange = async (newStatus: boolean) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await bulkUpdateStudentStatus({
        student_ids: selectedIds,
        is_active: newStatus,
      });
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update student status');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ── Bulk Assign Class ───────────────────────────────────────────────────────
  const handleBulkAssignClass = async () => {
    if (selectedIds.length === 0 || !targetAssignClassId) return;
    setBulkActionLoading(true);
    try {
      await bulkAssignClass({
        student_ids: selectedIds,
        class_id: targetAssignClassId,
      });
      setAssignClassModal(false);
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to assign class');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ── Add Student Submission ──────────────────────────────────────────────────
  const handleSaveAddStudent = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError('Please provide Name, Email, and Password.');
      return;
    }

    setFormSaving(true);
    setFormError(null);
    try {
      // Find 'student' role
      const roles = await listRoles();
      const studentRole = roles.find((r) => r.name.toLowerCase() === 'student') || roles[0];

      if (!studentRole) {
        throw new Error('Student role not found in system.');
      }

      await createUser({
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword,
        role_id: studentRole.id,
        is_active: true,
      });

      setAddModal(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('Student@123');
      setFormRollNumber('');
      setFormParentName('');
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create student');
    } finally {
      setFormSaving(false);
    }
  };

  // ── Edit Student ────────────────────────────────────────────────────────────
  const handleOpenEditModal = (student: AdminStudentRecord) => {
    setEditModal(student);
    setEditName(student.name);
    setEditClassId(student.class_id || (classesList[0]?.id ?? ''));
    setEditStatus(student.is_active);
    setActiveActionMenuId(null);
  };

  const handleSaveEditStudent = async () => {
    if (!editModal) return;
    setEditSaving(true);
    try {
      await updateUser(editModal.id, {
        name: editName.trim(),
        is_active: editStatus,
      });
      if (editClassId && editClassId !== editModal.class_id) {
        await bulkAssignClass({
          student_ids: [editModal.id],
          class_id: editClassId,
        });
      }
      setEditModal(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update student');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete / Deactivate Student ─────────────────────────────────────────────
  const handleDeleteStudent = async (student: AdminStudentRecord) => {
    setActiveActionMenuId(null);
    const confirmed = IS_WEB
      ? window.confirm(`Are you sure you want to deactivate ${student.name}?`)
      : true;
    if (!confirmed) return;

    try {
      await deactivateUser(student.id);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to deactivate student');
    }
  };

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const listToExport = selectedIds.length > 0
      ? rawRecords.filter((r) => selectedIds.includes(r.id))
      : filteredRecords;

    if (listToExport.length === 0) {
      alert('No student records to export.');
      return;
    }

    const headers = ['Student ID', 'Full Name', 'Email', 'Class & Section', 'Parent Name', 'Attendance %', 'Status', 'Admission Year'];
    const rows = listToExport.map((r) => [
      r.student_id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.email,
      `"${r.class_name}"`,
      `"${r.parent_name.replace(/"/g, '""')}"`,
      `${r.attendance_percentage}%`,
      r.is_active ? 'Active' : 'Inactive',
      r.admission_year,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    if (IS_WEB) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Students_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert('Export Ready', `${listToExport.length} student records prepared for export.`);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (id: string) => {
    const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return colors[hash % colors.length];
  };

  // Web Select Style
  const webSelectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${P.border}`,
    backgroundColor: '#FFFFFF',
    fontSize: '13px',
    color: P.text,
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    height: '38px',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Top Global Breadcrumb & User Bar ──────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.breadcrumbWrap}>
            <Text style={styles.breadcrumbMuted}>Dashboard</Text>
            <Text style={styles.breadcrumbSlash}>/</Text>
            <Text style={styles.breadcrumbMuted}>Academic Management</Text>
            <Text style={styles.breadcrumbSlash}>/</Text>
            <Text style={styles.breadcrumbCurrent}>Students</Text>
          </View>

          <View style={styles.topBarRight}>
            {/* Global Search Input */}
            <View style={styles.topSearchBox}>
              <Text style={styles.topSearchIcon}>🔍</Text>
              <TextInput
                style={styles.topSearchInput}
                placeholder="Search anything..."
                placeholderTextColor={P.textMuted}
              />
            </View>

            {/* Notification Bell */}
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
              <View style={styles.topNotificationBadge} />
            </TouchableOpacity>

            {/* Admin Profile Pill */}
            <View style={styles.adminProfilePill}>
              <View style={styles.adminAvatarCircle}>
                <Text style={styles.adminAvatarInitials}>PA</Text>
              </View>
              <View style={styles.adminProfileTextWrap}>
                <Text style={styles.adminProfileName}>Principal Admin</Text>
                <Text style={styles.adminProfileRole}>admin@school.com</Text>
              </View>
              <Text style={styles.adminProfileChevron}>▾</Text>
            </View>
          </View>
        </View>

        {/* ── 2. Page Action Header ───────────────────────────────────────── */}
        <View style={styles.actionHeader}>
          <View style={styles.actionHeaderLeft}>
            <Text style={styles.mainTitle}>Students</Text>
            <Text style={styles.mainSubtitle}>
              Manage student records, admissions, and academic allocations
            </Text>
          </View>

          <View style={styles.actionHeaderRight}>
            {/* Import Students Button */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setImportModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnIcon}>📥</Text>
              <Text style={styles.secondaryBtnText}>Import Students</Text>
            </TouchableOpacity>

            {/* Export Button */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleExportCSV}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnIcon}>📤</Text>
              <Text style={styles.secondaryBtnText}>Export</Text>
            </TouchableOpacity>

            {/* Add Student Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                setFormError(null);
                setAddModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnIcon}>+</Text>
              <Text style={styles.primaryBtnText}>Add Student</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. Six Summary Metric Cards ─────────────────────────────────── */}
        <View style={styles.summaryGrid}>
          {/* Card 1 — Total Students */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Total Students</Text>
              <View style={[styles.statIconBadge, { backgroundColor: P.primaryBg }]}>
                <Text style={{ fontSize: 15, color: P.primary }}>👥</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{summary.total_students}</Text>
            <View style={styles.statTrendRow}>
              <Text style={styles.statTrendPositive}>↑ +2 this month</Text>
            </View>
          </View>

          {/* Card 2 — Active Students */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Active Students</Text>
              <View style={[styles.statIconBadge, { backgroundColor: P.greenBg }]}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: P.greenDark }}>
                  {summary.active_percentage}%
                </Text>
              </View>
            </View>
            <Text style={[styles.statValue, { color: P.greenDark }]}>
              {summary.active_students}
            </Text>
            <View style={styles.statTrendRow}>
              <Text style={styles.statTrendNeutral}>Currently enrolled</Text>
            </View>
          </View>

          {/* Card 3 — Inactive Students */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Inactive Students</Text>
              <View style={[styles.statIconBadge, { backgroundColor: P.slateBg }]}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: P.slate }}>
                  {summary.inactive_percentage}%
                </Text>
              </View>
            </View>
            <Text style={[styles.statValue, { color: P.textSec }]}>
              {summary.inactive_students}
            </Text>
            <View style={styles.statTrendRow}>
              <Text style={styles.statTrendNeutral}>Archived / Transferred</Text>
            </View>
          </View>

          {/* Card 4 — Classes */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Classes</Text>
              <View style={[styles.statIconBadge, { backgroundColor: P.indigoBg }]}>
                <Text style={{ fontSize: 15, color: P.indigo }}>🏫</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{summary.classes_count}</Text>
            <View style={styles.statTrendRow}>
              <Text style={styles.statTrendNeutral}>Across all grades</Text>
            </View>
          </View>

          {/* Card 5 — New Admissions */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>New Admissions</Text>
              <View style={[styles.statIconBadge, { backgroundColor: P.purpleBg }]}>
                <Text style={{ fontSize: 15, color: P.purple }}>⭐</Text>
              </View>
            </View>
            <Text style={[styles.statValue, { color: P.purple }]}>
              {summary.new_admissions}
            </Text>
            <View style={styles.statTrendRow}>
              <Text style={styles.statTrendNeutral}>This academic year</Text>
            </View>
          </View>

          {/* Card 6 — Average Attendance */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Average Attendance</Text>
              <View style={[styles.statIconBadge, { backgroundColor: P.amberBg }]}>
                <Text style={{ fontSize: 15, color: P.amberDark }}>📊</Text>
              </View>
            </View>
            <Text style={[styles.statValue, { color: P.primary }]}>
              {summary.average_attendance}%
            </Text>
            <View style={styles.statTrendRow}>
              <Text style={styles.statTrendPositive}>↑ +4% from last month</Text>
            </View>
          </View>
        </View>

        {/* ── 4. Search and Filter Bar Card ───────────────────────────────── */}
        <View style={styles.filtersCard}>
          <View style={styles.filtersRow}>
            {/* Search Input */}
            <View style={styles.filterSearchBox}>
              <Text style={styles.filterSearchIcon}>🔍</Text>
              <TextInput
                style={styles.filterSearchInput}
                placeholder="Search by student name, roll number, or parent name..."
                placeholderTextColor={P.textMuted}
                value={search}
                onChangeText={(val) => {
                  setSearch(val);
                  setCurrentPage(1);
                }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={{ color: P.textMuted, fontSize: 13 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Class Dropdown */}
            <View style={styles.selectWrapper}>
              <select
                style={webSelectStyle}
                value={selectedClassFilter}
                onChange={(e: any) => {
                  setSelectedClassFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {classOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All Classes' ? 'Class: All Classes' : opt}
                  </option>
                ))}
              </select>
            </View>

            {/* Section Dropdown */}
            <View style={styles.selectWrapper}>
              <select
                style={webSelectStyle}
                value={selectedSectionFilter}
                onChange={(e: any) => {
                  setSelectedSectionFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {sectionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All Sections' ? 'Section: All Sections' : `Section: ${opt}`}
                  </option>
                ))}
              </select>
            </View>

            {/* Status Dropdown */}
            <View style={styles.selectWrapper}>
              <select
                style={webSelectStyle}
                value={selectedStatusFilter}
                onChange={(e: any) => {
                  setSelectedStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All Statuses">Status: All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </View>

            {/* Admission Year Dropdown */}
            <View style={styles.selectWrapper}>
              <select
                style={webSelectStyle}
                value={selectedYearFilter}
                onChange={(e: any) => {
                  setSelectedYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {admissionYearOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All Years' ? 'Admission Year: All Years' : `Year: ${opt}`}
                  </option>
                ))}
              </select>
            </View>

            {/* Reset Filters Link */}
            {(search ||
              selectedClassFilter !== 'All Classes' ||
              selectedSectionFilter !== 'All Sections' ||
              selectedStatusFilter !== 'All Statuses' ||
              selectedYearFilter !== 'All Years') && (
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── 5. Main Content: Two Columns Layout ─────────────────────────── */}
        <View style={styles.mainLayoutGrid}>
          {/* Left Column (~72% width on desktop): Table & Bulk Actions */}
          <View style={styles.leftColumn}>
            <View style={styles.tableCard}>
              {/* Table Action Toolbar Header */}
              <View style={styles.tableToolbar}>
                <View style={styles.tableToolbarLeft}>
                  {/* Selection Counter Badge */}
                  <View
                    style={[
                      styles.selectionBadge,
                      selectedIds.length > 0 && styles.selectionBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectionBadgeText,
                        selectedIds.length > 0 && styles.selectionBadgeTextActive,
                      ]}
                    >
                      {selectedIds.length} Selected
                    </Text>
                  </View>

                  {/* Assign Class Button */}
                  <TouchableOpacity
                    style={[
                      styles.toolbarActionBtn,
                      selectedIds.length === 0 && styles.toolbarActionBtnDisabled,
                    ]}
                    disabled={selectedIds.length === 0}
                    onPress={() => setAssignClassModal(true)}
                  >
                    <Text style={styles.toolbarActionBtnIcon}>🏫</Text>
                    <Text style={styles.toolbarActionBtnText}>Assign Class</Text>
                  </TouchableOpacity>

                  {/* Bulk Actions Dropdown */}
                  <View style={{ position: 'relative' }}>
                    <select
                      style={{
                        ...webSelectStyle,
                        height: '34px',
                        padding: '6px 10px',
                        backgroundColor: selectedIds.length > 0 ? '#FFFFFF' : '#F8FAFC',
                        color: selectedIds.length > 0 ? P.text : P.textMuted,
                        borderColor: selectedIds.length > 0 ? P.primaryBorder : P.border,
                        fontWeight: '600',
                      }}
                      disabled={selectedIds.length === 0}
                      onChange={(e: any) => {
                        const action = e.target.value;
                        if (action === 'activate') handleBulkStatusChange(true);
                        if (action === 'deactivate') handleBulkStatusChange(false);
                        if (action === 'export') handleExportCSV();
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Bulk Actions ▾
                      </option>
                      <option value="activate">Set Status to Active</option>
                      <option value="deactivate">Set Status to Inactive</option>
                      <option value="export">Export Selected ({selectedIds.length})</option>
                    </select>
                  </View>
                </View>

                {/* View Mode Toggle */}
                <View style={styles.viewToggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.viewToggleBtn,
                      viewMode === 'table' && styles.viewToggleBtnActive,
                    ]}
                    onPress={() => setViewMode('table')}
                  >
                    <Text style={[styles.viewToggleIcon, viewMode === 'table' && styles.viewToggleIconActive]}>
                      ☰
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.viewToggleBtn,
                      viewMode === 'grid' && styles.viewToggleBtnActive,
                    ]}
                    onPress={() => setViewMode('grid')}
                  >
                    <Text style={[styles.viewToggleIcon, viewMode === 'grid' && styles.viewToggleIconActive]}>
                      ☷
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Table Body / Loading */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={P.primary} />
                  <Text style={styles.loadingText}>Loading students records...</Text>
                </View>
              ) : filteredRecords.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>No students found</Text>
                  <Text style={styles.emptySub}>
                    Try adjusting your search query or clear selected filters.
                  </Text>
                  <TouchableOpacity style={styles.emptyResetBtn} onPress={handleResetFilters}>
                    <Text style={styles.emptyResetBtnText}>Clear All Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : viewMode === 'table' ? (
                /* Table View */
                <View style={styles.tableResponsiveWrapper}>
                  {/* Table Header */}
                  <View style={styles.tableHeaderRow}>
                    <View style={[styles.tableCol, { width: 44, justifyContent: 'center' }]}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </View>
                    <View style={[styles.tableCol, { flex: 2.4 }]}>
                      <Text style={styles.tableHeaderLabel}>STUDENT</Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1.3 }]}>
                      <Text style={styles.tableHeaderLabel}>STUDENT ID</Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1.4 }]}>
                      <Text style={styles.tableHeaderLabel}>CLASS & SECTION</Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1.8 }]}>
                      <Text style={styles.tableHeaderLabel}>PARENT NAME</Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1.7 }]}>
                      <Text style={styles.tableHeaderLabel}>ATTENDANCE</Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1.1 }]}>
                      <Text style={styles.tableHeaderLabel}>STATUS</Text>
                    </View>
                    <View style={[styles.tableCol, { width: 50, alignItems: 'center' }]}>
                      <Text style={styles.tableHeaderLabel}>ACTIONS</Text>
                    </View>
                  </View>

                  {/* Table Rows */}
                  {paginatedRecords.map((item, idx) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isMenuOpen = activeActionMenuId === item.id;

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.tableRow,
                          idx % 2 === 1 && styles.tableRowAlt,
                          isSelected && styles.tableRowSelected,
                        ]}
                      >
                        {/* Checkbox */}
                        <View style={[styles.tableCol, { width: 44, justifyContent: 'center' }]}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(item.id)}
                            style={{ cursor: 'pointer', width: 16, height: 16 }}
                          />
                        </View>

                        {/* Student Name & Avatar */}
                        <View style={[styles.tableCol, { flex: 2.4, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                          <View
                            style={[
                              styles.studentAvatarCircle,
                              { backgroundColor: getAvatarBg(item.id) },
                            ]}
                          >
                            <Text style={styles.studentAvatarInitials}>
                              {getInitials(item.name)}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.studentNameText} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={styles.studentEmailText} numberOfLines={1}>
                              {item.email}
                            </Text>
                          </View>
                        </View>

                        {/* Student ID Badge */}
                        <View style={[styles.tableCol, { flex: 1.3 }]}>
                          <View style={styles.studentIdBadge}>
                            <Text style={styles.studentIdBadgeText}>{item.student_id}</Text>
                          </View>
                        </View>

                        {/* Class & Section */}
                        <View style={[styles.tableCol, { flex: 1.4 }]}>
                          <Text style={styles.classSectionText}>{item.class_name}</Text>
                        </View>

                        {/* Parent Name */}
                        <View style={[styles.tableCol, { flex: 1.8 }]}>
                          <Text style={styles.parentNameText}>{item.parent_name}</Text>
                        </View>

                        {/* Attendance Progress */}
                        <View style={[styles.tableCol, { flex: 1.7 }]}>
                          <View style={styles.attendanceWrap}>
                            <View style={styles.attendanceBarTrack}>
                              <View
                                style={[
                                  styles.attendanceBarFill,
                                  {
                                    width: `${Math.min(100, item.attendance_percentage)}%`,
                                    backgroundColor:
                                      item.attendance_percentage >= 90
                                        ? P.green
                                        : item.attendance_percentage >= 75
                                        ? P.amber
                                        : P.red,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.attendancePercentText}>
                              {item.attendance_percentage}%
                            </Text>
                          </View>
                        </View>

                        {/* Status Badge */}
                        <View style={[styles.tableCol, { flex: 1.1 }]}>
                          {item.is_active ? (
                            <View style={styles.statusBadgeActive}>
                              <View style={styles.statusDotActive} />
                              <Text style={styles.statusTextActive}>Active</Text>
                            </View>
                          ) : (
                            <View style={styles.statusBadgeInactive}>
                              <View style={styles.statusDotInactive} />
                              <Text style={styles.statusTextInactive}>Inactive</Text>
                            </View>
                          )}
                        </View>

                        {/* Three-dot Actions Menu */}
                        <View style={[styles.tableCol, { width: 50, alignItems: 'center', position: 'relative' }]}>
                          <TouchableOpacity
                            style={styles.actionMenuBtn}
                            onPress={() =>
                              setActiveActionMenuId(isMenuOpen ? null : item.id)
                            }
                          >
                            <Text style={styles.actionMenuDots}>⋮</Text>
                          </TouchableOpacity>

                          {/* Contextual Popup Menu */}
                          {isMenuOpen && (
                            <View style={styles.actionDropdown}>
                              <TouchableOpacity
                                style={styles.actionDropdownItem}
                                onPress={() => {
                                  setViewModal(item);
                                  setActiveActionMenuId(null);
                                }}
                              >
                                <Text style={styles.actionDropdownItemIcon}>👁️</Text>
                                <Text style={styles.actionDropdownItemText}>View Profile</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.actionDropdownItem}
                                onPress={() => handleOpenEditModal(item)}
                              >
                                <Text style={styles.actionDropdownItemIcon}>✏️</Text>
                                <Text style={styles.actionDropdownItemText}>Edit Student</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.actionDropdownItem}
                                onPress={() => {
                                  setSelectedIds([item.id]);
                                  setAssignClassModal(true);
                                  setActiveActionMenuId(null);
                                }}
                              >
                                <Text style={styles.actionDropdownItemIcon}>🏫</Text>
                                <Text style={styles.actionDropdownItemText}>Change Class</Text>
                              </TouchableOpacity>

                              <View style={styles.actionDropdownDivider} />

                              <TouchableOpacity
                                style={styles.actionDropdownItem}
                                onPress={() => handleDeleteStudent(item)}
                              >
                                <Text style={styles.actionDropdownItemIcon}>
                                  {item.is_active ? '⏸️' : '▶️'}
                                </Text>
                                <Text
                                  style={[
                                    styles.actionDropdownItemText,
                                    { color: item.is_active ? P.red : P.greenDark },
                                  ]}
                                >
                                  {item.is_active ? 'Deactivate' : 'Activate'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                /* Grid / Cards View */
                <View style={styles.cardsGrid}>
                  {paginatedRecords.map((item) => (
                    <View key={item.id} style={styles.gridCard}>
                      <View style={styles.gridCardTop}>
                        <View
                          style={[
                            styles.studentAvatarCircle,
                            { backgroundColor: getAvatarBg(item.id), width: 44, height: 44 },
                          ]}
                        >
                          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
                            {getInitials(item.name)}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.studentNameText}>{item.name}</Text>
                          <Text style={styles.studentEmailText}>{item.email}</Text>
                        </View>
                        <View style={styles.studentIdBadge}>
                          <Text style={styles.studentIdBadgeText}>{item.student_id}</Text>
                        </View>
                      </View>

                      <View style={styles.gridCardDetails}>
                        <View style={styles.gridDetailRow}>
                          <Text style={styles.gridDetailLabel}>Class & Sec:</Text>
                          <Text style={styles.gridDetailValue}>{item.class_name}</Text>
                        </View>
                        <View style={styles.gridDetailRow}>
                          <Text style={styles.gridDetailLabel}>Parent Name:</Text>
                          <Text style={styles.gridDetailValue}>{item.parent_name}</Text>
                        </View>
                        <View style={styles.gridDetailRow}>
                          <Text style={styles.gridDetailLabel}>Attendance:</Text>
                          <Text style={styles.gridDetailValue}>{item.attendance_percentage}%</Text>
                        </View>
                        <View style={styles.gridDetailRow}>
                          <Text style={styles.gridDetailLabel}>Status:</Text>
                          <Text
                            style={{
                              fontWeight: '700',
                              color: item.is_active ? P.greenDark : P.red,
                            }}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.gridCardFooter}>
                        <TouchableOpacity
                          style={styles.gridBtnOutline}
                          onPress={() => setViewModal(item)}
                        >
                          <Text style={styles.gridBtnOutlineText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.gridBtnFilled}
                          onPress={() => handleOpenEditModal(item)}
                        >
                          <Text style={styles.gridBtnFilledText}>Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Pagination Bar */}
              {filteredRecords.length > 0 && (
                <View style={styles.paginationRow}>
                  <Text style={styles.paginationShowingText}>
                    Showing <Text style={{ fontWeight: '700' }}>{startIndex}</Text> to{' '}
                    <Text style={{ fontWeight: '700' }}>{endIndex}</Text> of{' '}
                    <Text style={{ fontWeight: '700' }}>{filteredRecords.length}</Text> students
                  </Text>

                  <View style={styles.paginationControls}>
                    {/* Items per page */}
                    <select
                      style={{
                        ...webSelectStyle,
                        height: '32px',
                        padding: '4px 8px',
                        fontSize: '12px',
                      }}
                      value={itemsPerPage}
                      onChange={(e: any) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                        <option key={num} value={num}>
                          {num} per page
                        </option>
                      ))}
                    </select>

                    {/* Prev Page Button */}
                    <TouchableOpacity
                      style={[
                        styles.pageBtn,
                        activePage <= 1 && styles.pageBtnDisabled,
                      ]}
                      disabled={activePage <= 1}
                      onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <Text style={styles.pageBtnText}>‹</Text>
                    </TouchableOpacity>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                      const isActive = pg === activePage;
                      return (
                        <TouchableOpacity
                          key={pg}
                          style={[styles.pageNumberBtn, isActive && styles.pageNumberBtnActive]}
                          onPress={() => setCurrentPage(pg)}
                        >
                          <Text
                            style={[
                              styles.pageNumberText,
                              isActive && styles.pageNumberTextActive,
                            ]}
                          >
                            {pg}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Next Page Button */}
                    <TouchableOpacity
                      style={[
                        styles.pageBtn,
                        activePage >= totalPages && styles.pageBtnDisabled,
                      ]}
                      disabled={activePage >= totalPages}
                      onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <Text style={styles.pageBtnText}>›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Right Column (~28% width on desktop): Analytics & Quick Actions */}
          <View style={styles.rightColumn}>
            {/* 1. Student Distribution Bar Chart Card */}
            <View style={styles.sideCard}>
              <View style={styles.sideCardHeader}>
                <View>
                  <Text style={styles.sideCardTitle}>Student Distribution</Text>
                  <Text style={styles.sideCardSub}>Enrollment breakdown</Text>
                </View>
                <select
                  style={{
                    ...webSelectStyle,
                    height: '30px',
                    padding: '2px 8px',
                    fontSize: '11.5px',
                    color: P.textSec,
                  }}
                  value={distributionFilter}
                  onChange={(e: any) => setDistributionFilter(e.target.value)}
                >
                  <option value="By Class">By Class ▾</option>
                  <option value="By Section">By Section ▾</option>
                </select>
              </View>

              {/* Bar Chart items */}
              <View style={styles.chartBarsContainer}>
                {(data?.distribution ?? [
                  { class_name: '6th', count: 3 },
                  { class_name: '7th', count: 4 },
                  { class_name: '8th', count: 2 },
                  { class_name: '9th', count: 3 },
                  { class_name: '10th', count: 2 },
                ]).map((bar, barIdx) => {
                  const maxCount = Math.max(
                    ...(data?.distribution?.map((d) => d.count) || [4])
                  );
                  const barColors = ['#2563EB', '#4F46E5', '#8B5CF6', '#10B981', '#F59E0B'];
                  const barColor = barColors[barIdx % barColors.length];
                  const fillPct = maxCount > 0 ? (bar.count / maxCount) * 100 : 50;

                  return (
                    <View key={bar.class_name} style={styles.chartBarRow}>
                      <Text style={styles.chartBarLabel}>{bar.class_name}</Text>
                      <View style={styles.chartBarTrack}>
                        <View
                          style={[
                            styles.chartBarFill,
                            { width: `${fillPct}%`, backgroundColor: barColor },
                          ]}
                        />
                      </View>
                      <Text style={styles.chartBarValue}>{bar.count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 2. Recent Student Activity Card */}
            <View style={styles.sideCard}>
              <View style={styles.sideCardHeader}>
                <Text style={styles.sideCardTitle}>Recent Student Activity</Text>
                <TouchableOpacity onPress={() => router.push('/admin/notifications' as any)}>
                  <Text style={styles.sideCardLink}>View All →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.activityList}>
                {(data?.recent_activities ?? [
                  { id: '1', icon: '🟢', title: 'Rahul Sharma enrolled', time: '2 hours ago', type: 'enrollment' },
                  { id: '2', icon: '🔵', title: 'Ananya Gupta profile updated', time: '4 hours ago', type: 'profile' },
                  { id: '3', icon: '🟣', title: 'Sreeja Lakshmi attendance updated', time: '6 hours ago', type: 'attendance' },
                  { id: '4', icon: '🟠', title: 'Vamsi Krishna fee record updated', time: '1 day ago', type: 'fee' },
                ]).map((act, actIdx) => (
                  <View key={act.id} style={styles.activityItem}>
                    <View style={styles.activityDotCol}>
                      <View
                        style={[
                          styles.activityDot,
                          actIdx === 0 && { backgroundColor: P.green },
                          actIdx === 1 && { backgroundColor: P.primary },
                          actIdx === 2 && { backgroundColor: P.purple },
                          actIdx === 3 && { backgroundColor: P.orange },
                        ]}
                      />
                      {actIdx < 3 && <View style={styles.activityTimelineLine} />}
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{act.title}</Text>
                      <Text style={styles.activityTime}>{act.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 3. Quick Actions Card */}
            <View style={styles.sideCard}>
              <Text style={[styles.sideCardTitle, { marginBottom: 12 }]}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {/* Mark Attendance */}
                <TouchableOpacity
                  style={styles.quickActionTile}
                  onPress={() => router.push('/admin/attendance' as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconWrap, { backgroundColor: P.primaryBg }]}>
                    <Text style={{ fontSize: 18 }}>📅</Text>
                  </View>
                  <Text style={styles.quickActionText}>Mark Attendance</Text>
                </TouchableOpacity>

                {/* Add Exam Marks */}
                <TouchableOpacity
                  style={styles.quickActionTile}
                  onPress={() => router.push('/admin/exams' as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconWrap, { backgroundColor: P.purpleBg }]}>
                    <Text style={{ fontSize: 18 }}>📝</Text>
                  </View>
                  <Text style={styles.quickActionText}>Add Exam Marks</Text>
                </TouchableOpacity>

                {/* Collect Fees */}
                <TouchableOpacity
                  style={styles.quickActionTile}
                  onPress={() => router.push('/admin/fees' as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconWrap, { backgroundColor: P.greenBg }]}>
                    <Text style={{ fontSize: 18 }}>💳</Text>
                  </View>
                  <Text style={styles.quickActionText}>Collect Fees</Text>
                </TouchableOpacity>

                {/* Print ID Cards */}
                <TouchableOpacity
                  style={styles.quickActionTile}
                  onPress={() => {
                    Alert.alert(
                      'Print ID Cards',
                      'Generating batch printable ID cards for selected students...'
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconWrap, { backgroundColor: P.amberBg }]}>
                    <Text style={{ fontSize: 18 }}>🪪</Text>
                  </View>
                  <Text style={styles.quickActionText}>Print ID Cards</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL 1: Add Student ─────────────────────────────────────────── */}
      <Modal visible={addModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New Student</Text>
                <Text style={styles.modalSub}>Create a new student enrollment record</Text>
              </View>
              <TouchableOpacity onPress={() => setAddModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {formError && (
              <View style={styles.modalErrorBox}>
                <Text style={styles.modalErrorText}>{formError}</Text>
              </View>
            )}

            <ScrollView style={{ maxHeight: 420 }}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Aarav Sharma"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. aarav.sharma@school.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formEmail}
                  onChangeText={setFormEmail}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Default Password *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Password"
                  secureTextEntry
                  value={formPassword}
                  onChangeText={setFormPassword}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Assign Class</Text>
                  <select
                    style={{ ...webSelectStyle, width: '100%' }}
                    value={formClassId}
                    onChange={(e: any) => setFormClassId(e.target.value)}
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        Class {c.grade_level} - {c.section}
                      </option>
                    ))}
                  </select>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Roll Number</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 10A-15"
                    value={formRollNumber}
                    onChangeText={setFormRollNumber}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Parent / Guardian Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Rajesh Sharma"
                  value={formParentName}
                  onChangeText={setFormParentName}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddModal(false)}
                disabled={formSaving}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveAddStudent}
                disabled={formSaving}
              >
                {formSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create Student</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: View Student Details ────────────────────────────────── */}
      <Modal visible={!!viewModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { maxWidth: 520 }]}>
            {viewModal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={[
                        styles.studentAvatarCircle,
                        { backgroundColor: getAvatarBg(viewModal.id), width: 48, height: 48 },
                      ]}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>
                        {getInitials(viewModal.name)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{viewModal.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <View style={styles.studentIdBadge}>
                          <Text style={styles.studentIdBadgeText}>{viewModal.student_id}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: P.textSec }}>
                          Class {viewModal.class_name}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setViewModal(null)}>
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.viewModalGrid}>
                  <View style={styles.viewModalItem}>
                    <Text style={styles.viewModalItemLabel}>Email</Text>
                    <Text style={styles.viewModalItemVal}>{viewModal.email}</Text>
                  </View>

                  <View style={styles.viewModalItem}>
                    <Text style={styles.viewModalItemLabel}>Parent / Guardian</Text>
                    <Text style={styles.viewModalItemVal}>{viewModal.parent_name}</Text>
                  </View>

                  <View style={styles.viewModalItem}>
                    <Text style={styles.viewModalItemLabel}>Attendance Rate</Text>
                    <Text
                      style={[
                        styles.viewModalItemVal,
                        {
                          fontWeight: '800',
                          color:
                            viewModal.attendance_percentage >= 90
                              ? P.greenDark
                              : viewModal.attendance_percentage >= 75
                              ? P.amberDark
                              : P.red,
                        },
                      ]}
                    >
                      {viewModal.attendance_percentage}%
                    </Text>
                  </View>

                  <View style={styles.viewModalItem}>
                    <Text style={styles.viewModalItemLabel}>Status</Text>
                    <Text
                      style={[
                        styles.viewModalItemVal,
                        { color: viewModal.is_active ? P.greenDark : P.red, fontWeight: '700' },
                      ]}
                    >
                      {viewModal.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>

                  <View style={styles.viewModalItem}>
                    <Text style={styles.viewModalItemLabel}>Admission Year</Text>
                    <Text style={styles.viewModalItemVal}>{viewModal.admission_year}</Text>
                  </View>

                  <View style={styles.viewModalItem}>
                    <Text style={styles.viewModalItemLabel}>Created Date</Text>
                    <Text style={styles.viewModalItemVal}>
                      {viewModal.created_at.slice(0, 10)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setViewModal(null)}
                  >
                    <Text style={styles.modalCancelBtnText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSubmitBtn}
                    onPress={() => {
                      const m = viewModal;
                      setViewModal(null);
                      handleOpenEditModal(m);
                    }}
                  >
                    <Text style={styles.modalSubmitBtnText}>Edit Student</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: Edit Student ────────────────────────────────────────── */}
      <Modal visible={!!editModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Student</Text>
                <Text style={styles.modalSub}>Update student profile information</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModal(null)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Class & Section</Text>
              <select
                style={{ ...webSelectStyle, width: '100%' }}
                value={editClassId}
                onChange={(e: any) => setEditClassId(e.target.value)}
              >
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.grade_level} - {c.section}
                  </option>
                ))}
              </select>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Status</Text>
              <select
                style={{ ...webSelectStyle, width: '100%' }}
                value={editStatus ? 'Active' : 'Inactive'}
                onChange={(e: any) => setEditStatus(e.target.value === 'Active')}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModal(null)}
                disabled={editSaving}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveEditStudent}
                disabled={editSaving}
              >
                {editSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 4: Assign Class Modal ──────────────────────────────────── */}
      <Modal visible={assignClassModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Class</Text>
                <Text style={styles.modalSub}>
                  Assign {selectedIds.length} selected student(s) to a class
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAssignClassModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Class & Section</Text>
              <select
                style={{ ...webSelectStyle, width: '100%' }}
                value={targetAssignClassId}
                onChange={(e: any) => setTargetAssignClassId(e.target.value)}
              >
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.grade_level} - {c.section}
                  </option>
                ))}
              </select>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAssignClassModal(false)}
                disabled={bulkActionLoading}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleBulkAssignClass}
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Confirm Allocation</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 5: Import Students ─────────────────────────────────────── */}
      <Modal visible={importModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Import Students</Text>
                <Text style={styles.modalSub}>Bulk import students from CSV or Excel file</Text>
              </View>
              <TouchableOpacity onPress={() => setImportModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.importDropArea}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
              <Text style={styles.importDropTitle}>Drag & drop your CSV file here</Text>
              <Text style={styles.importDropSub}>Supported formats: .CSV, .XLSX (Max: 10MB)</Text>
              <TouchableOpacity
                style={styles.importBrowseBtn}
                onPress={() => {
                  alert('Demo Mode: File picker simulated. Download sample CSV below.');
                }}
              >
                <Text style={styles.importBrowseBtnText}>Browse Files</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sampleCsvLink}
              onPress={() => {
                const sampleCSV = 'Full Name,Email,Grade,Section,Parent Name\nAarav Patel,aarav@school.edu,10,A,Rajesh Patel';
                const blob = new Blob([sampleCSV], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'students_template.csv';
                a.click();
              }}
            >
              <Text style={styles.sampleCsvText}>📥 Download Sample CSV Template</Text>
            </TouchableOpacity>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setImportModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: P.bg,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 40,
  },

  // 1. Top Breadcrumb & User Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  breadcrumbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbMuted: {
    fontSize: 13,
    color: P.textMuted,
    fontWeight: '500',
  },
  breadcrumbSlash: {
    fontSize: 12,
    color: P.borderDark,
  },
  breadcrumbCurrent: {
    fontSize: 13,
    color: P.text,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    width: 180,
    gap: 6,
  },
  topSearchIcon: {
    fontSize: 12,
  },
  topSearchInput: {
    flex: 1,
    fontSize: 12.5,
    color: P.text,
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topNotificationBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: P.red,
  },
  adminProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 8,
  },
  adminAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: P.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  adminProfileTextWrap: {
    marginRight: 4,
  },
  adminProfileName: {
    fontSize: 12,
    fontWeight: '700',
    color: P.text,
    lineHeight: 14,
  },
  adminProfileRole: {
    fontSize: 10,
    color: P.textMuted,
    lineHeight: 12,
  },
  adminProfileChevron: {
    fontSize: 11,
    color: P.textMuted,
  },

  // 2. Action Header
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 14,
  },
  actionHeaderLeft: {},
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: P.text,
    letterSpacing: -0.4,
  },
  mainSubtitle: {
    fontSize: 13,
    color: P.textSec,
    marginTop: 2,
  },
  actionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  secondaryBtnIcon: {
    fontSize: 13,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: P.textSec,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    shadowColor: P.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  primaryBtnIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -1,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 3. Six Summary Metric Cards Grid
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: P.text,
    letterSpacing: -0.3,
  },
  statTrendRow: {
    marginTop: 6,
  },
  statTrendPositive: {
    fontSize: 11,
    fontWeight: '600',
    color: P.greenDark,
  },
  statTrendNeutral: {
    fontSize: 11,
    color: P.textMuted,
  },

  // 4. Filters & Search Bar Card
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterSearchBox: {
    flex: 2,
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  filterSearchIcon: {
    fontSize: 13,
  },
  filterSearchInput: {
    flex: 1,
    fontSize: 13,
    color: P.text,
  },
  selectWrapper: {
    minWidth: 130,
  },
  resetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.primary,
  },

  // 5. Main Content Grid (Two Columns)
  mainLayoutGrid: {
    flexDirection: IS_WEB ? 'row' : 'column',
    gap: 20,
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 3,
    width: '100%',
  },
  rightColumn: {
    flex: 1.2,
    width: '100%',
    gap: 18,
  },

  // Left Column: Table Card
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  tableToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: P.borderLight,
    flexWrap: 'wrap',
    gap: 10,
  },
  tableToolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  selectionBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: P.border,
  },
  selectionBadgeActive: {
    backgroundColor: P.primaryBg,
    borderColor: P.primaryBorder,
  },
  selectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textMuted,
  },
  selectionBadgeTextActive: {
    color: P.primary,
  },
  toolbarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.primaryBorder,
    gap: 6,
  },
  toolbarActionBtnDisabled: {
    opacity: 0.5,
    borderColor: P.border,
  },
  toolbarActionBtnIcon: {
    fontSize: 12,
  },
  toolbarActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.primary,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  viewToggleBtnActive: {
    backgroundColor: '#F1F5F9',
  },
  viewToggleIcon: {
    fontSize: 14,
    color: P.textMuted,
  },
  viewToggleIconActive: {
    color: P.text,
    fontWeight: '800',
  },

  // Table Structure
  tableResponsiveWrapper: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tableCol: {
    paddingHorizontal: 4,
  },
  tableHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: P.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: P.borderLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#FAFCFF',
  },
  tableRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  studentAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  studentNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: P.text,
  },
  studentEmailText: {
    fontSize: 11,
    color: P.textMuted,
    marginTop: 1,
  },
  studentIdBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  studentIdBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: P.primary,
    letterSpacing: 0.3,
  },
  classSectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: P.text,
  },
  parentNameText: {
    fontSize: 12.5,
    color: P.textSec,
  },
  attendanceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  attendanceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  attendancePercentText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: P.text,
    width: 32,
    textAlign: 'right',
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.greenBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5,
    alignSelf: 'flex-start',
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: P.green,
  },
  statusTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: P.greenDark,
  },
  statusBadgeInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.redBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5,
    alignSelf: 'flex-start',
  },
  statusDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: P.red,
  },
  statusTextInactive: {
    fontSize: 11,
    fontWeight: '700',
    color: P.redDark,
  },
  actionMenuBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenuDots: {
    fontSize: 16,
    color: P.textSec,
    fontWeight: '700',
  },

  // Action Dropdown
  actionDropdown: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: P.border,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  actionDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 8,
  },
  actionDropdownItemIcon: {
    fontSize: 12,
  },
  actionDropdownItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.text,
  },
  actionDropdownDivider: {
    height: 1,
    backgroundColor: P.borderLight,
    marginVertical: 3,
  },

  // Grid View
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    padding: 16,
  },
  gridCard: {
    width: '48%',
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.border,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  gridCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  gridDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridDetailLabel: {
    fontSize: 11.5,
    color: P.textMuted,
  },
  gridDetailValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: P.text,
  },
  gridCardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  gridBtnOutline: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
  },
  gridBtnOutlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
  },
  gridBtnFilled: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: P.primary,
    alignItems: 'center',
  },
  gridBtnFilledText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Pagination Footer
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: P.borderLight,
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationShowingText: {
    fontSize: 12.5,
    color: P.textSec,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: P.textSec,
  },
  pageNumberBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pageNumberBtnActive: {
    backgroundColor: P.primary,
    borderColor: P.primary,
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Right Column Side Cards
  sideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sideCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: P.text,
  },
  sideCardSub: {
    fontSize: 11,
    color: P.textMuted,
    marginTop: 1,
  },
  sideCardLink: {
    fontSize: 12,
    fontWeight: '600',
    color: P.primary,
  },

  // Student Distribution Chart
  chartBarsContainer: {
    gap: 10,
  },
  chartBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
    width: 32,
  },
  chartBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartBarValue: {
    fontSize: 12,
    fontWeight: '700',
    color: P.text,
    width: 20,
    textAlign: 'right',
  },

  // Recent Activity Timeline
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  activityDotCol: {
    alignItems: 'center',
    width: 14,
  },
  activityDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 4,
  },
  activityTimelineLine: {
    width: 1,
    flex: 1,
    minHeight: 22,
    backgroundColor: P.border,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: P.text,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: 11,
    color: P.textMuted,
    marginTop: 2,
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionTile: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: P.borderLight,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: P.text,
    textAlign: 'center',
  },

  // Loading & Empty States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: P.textSec,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: P.text,
  },
  emptySub: {
    fontSize: 12.5,
    color: P.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyResetBtn: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: P.primaryBg,
  },
  emptyResetBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: P.primary,
  },

  // Modals Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: P.text,
  },
  modalSub: {
    fontSize: 12,
    color: P.textMuted,
    marginTop: 2,
  },
  modalCloseIcon: {
    fontSize: 18,
    color: P.textMuted,
    padding: 4,
  },
  modalErrorBox: {
    backgroundColor: P.redBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  modalErrorText: {
    color: P.redDark,
    fontSize: 12.5,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 13,
    color: P.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: P.borderLight,
    paddingTop: 14,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: P.border,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: P.textSec,
  },
  modalSubmitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: P.primary,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // View Modal Grid
  viewModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
  },
  viewModalItem: {
    width: '47%',
  },
  viewModalItemLabel: {
    fontSize: 11,
    color: P.textMuted,
    fontWeight: '600',
  },
  viewModalItemVal: {
    fontSize: 13,
    fontWeight: '600',
    color: P.text,
    marginTop: 2,
  },

  // Import Modal
  importDropArea: {
    borderWidth: 2,
    borderColor: P.primaryBorder,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    backgroundColor: P.primaryBg,
    marginBottom: 12,
  },
  importDropTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: P.text,
  },
  importDropSub: {
    fontSize: 11.5,
    color: P.textMuted,
    marginTop: 3,
    marginBottom: 12,
  },
  importBrowseBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  importBrowseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: P.primary,
  },
  sampleCsvLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sampleCsvText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.primary,
  },
});
