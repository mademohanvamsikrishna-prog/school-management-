/**
 * AdminUsersScreen — Dedicated User Management Hub
 * Route: /admin/users
 *
 * Implements the design, role category cards, statistics, search/filter controls,
 * table with real avatars/initials, role badges, action buttons, bulk operations,
 * and pagination — all connected directly to real database users.
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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  getUsersOverview,
  bulkAssignUserRole,
  bulkUpdateUserStatus,
  bulkDeleteUsers,
  createUser,
  updateUser,
  deactivateUser,
  listRoles,
  listClasses,
  AdminUsersOverview,
  AdminUserOverviewRecord,
  AdminRole,
  AdminClass,
} from '../../services/admin';

const IS_WEB = Platform.OS === 'web';

// ── Design Tokens matching Reference Design ───────────────────────────────────
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
  indigoBorder: '#C7D2FE',
  green: '#10B981',
  greenDark: '#15803D',
  greenBg: '#DCFCE7',
  greenBorder: '#BBF7D0',
  amber: '#F59E0B',
  amberDark: '#B45309',
  amberBg: '#FEF3C7',
  amberBorder: '#FDE68A',
  orange: '#F97316',
  orangeDark: '#C2410C',
  orangeBg: '#FFEDD5',
  orangeBorder: '#FED7AA',
  red: '#EF4444',
  redDark: '#B91C1C',
  redBg: '#FEE2E2',
  redBorder: '#FECACA',
  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  purpleBg: '#F3E8FF',
  purpleBorder: '#DDD6FE',
  slate: '#64748B',
  slateBg: '#F1F5F9',
};

const ITEMS_PER_PAGE_OPTIONS = [6, 10, 20, 50];

export default function AdminUsersScreen() {
  const router = useRouter();

  // ── Data State ──────────────────────────────────────────────────────────────
  const [data, setData] = useState<AdminUsersOverview | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Role Category Filter (All / Teachers / Students / Parents / Admins) ─────
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('All Users');

  // ── Search & Dropdown Filters ───────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [selectedClassDeptFilter, setSelectedClassDeptFilter] = useState('All');

  // ── View Mode & Pagination ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Selection State ─────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // ── Modals State ────────────────────────────────────────────────────────────
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<AdminUserOverviewRecord | null>(null);
  const [viewModal, setViewModal] = useState<AdminUserOverviewRecord | null>(null);
  const [assignRoleModal, setAssignRoleModal] = useState(false);
  const [targetRoleId, setTargetRoleId] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // ── Form State (Add User) ───────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('Password@123');
  const [formRole, setFormRole] = useState<'teacher' | 'student' | 'parent' | 'admin'>('student');
  const [formDepartment, setFormDepartment] = useState('Mathematics');
  const [formClassId, setFormClassId] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Form State (Edit User) ──────────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editStatus, setEditStatus] = useState<boolean>(true);
  const [editSaving, setEditSaving] = useState(false);

  // ── Load Real Data from Backend ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, roleList, classList] = await Promise.all([
        getUsersOverview(),
        listRoles(),
        listClasses(),
      ]);
      setData(overview);
      setRoles(roleList);
      setClasses(classList);
      if (roleList.length > 0 && !targetRoleId) {
        setTargetRoleId(roleList[0].id);
      }
      if (classList.length > 0 && !formClassId) {
        setFormClassId(classList[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load users overview:', err);
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [formClassId, targetRoleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rawRecords = useMemo(() => data?.records ?? [], [data]);
  const summary = useMemo(
    () =>
      data?.summary ?? {
        total_users: 0,
        active_users: 0,
        inactive_users: 0,
        active_percentage: 100,
        inactive_percentage: 0,
        admin_users: 0,
        teacher_users: 0,
        student_users: 0,
        parent_users: 0,
        staff_users: 0,
        trend_this_month: '↑ +5 this month',
      },
    [data]
  );

  const classesAndDepartments = useMemo(() => {
    return data?.classes_and_departments ?? ['All', 'Administration', 'Mathematics', 'Science', '10 - A'];
  }, [data]);

  // ── Synchronized Filter Logic ───────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return rawRecords.filter((rec) => {
      // 1. Role Category Card Filter
      if (selectedRoleCategory === 'Teachers' && rec.role_name.toLowerCase() !== 'teacher') return false;
      if (selectedRoleCategory === 'Students' && rec.role_name.toLowerCase() !== 'student') return false;
      if (selectedRoleCategory === 'Parents' && rec.role_name.toLowerCase() !== 'parent') return false;
      if (selectedRoleCategory === 'Admins' && rec.role_name.toLowerCase() !== 'admin') return false;

      // 2. Role Dropdown Filter
      if (selectedRoleFilter !== 'All Roles') {
        if (rec.role_name.toLowerCase() !== selectedRoleFilter.toLowerCase()) return false;
      }

      // 3. Status Dropdown Filter
      if (selectedStatusFilter === 'Active' && !rec.is_active) return false;
      if (selectedStatusFilter === 'Inactive' && rec.is_active) return false;

      // 4. Class / Department Filter
      if (selectedClassDeptFilter !== 'All') {
        if (rec.department_or_class !== selectedClassDeptFilter) return false;
      }

      // 5. Search Text
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = rec.name.toLowerCase().includes(q);
        const matchEmail = rec.email.toLowerCase().includes(q);
        const matchRole = rec.role_name.toLowerCase().includes(q);
        const matchCode = rec.code_id.toLowerCase().includes(q);
        const matchDept = rec.department_or_class.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole && !matchCode && !matchDept) {
          return false;
        }
      }

      return true;
    });
  }, [
    rawRecords,
    selectedRoleCategory,
    selectedRoleFilter,
    selectedStatusFilter,
    selectedClassDeptFilter,
    search,
  ]);

  // ── Pagination Calculations ─────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, activePage, itemsPerPage]);

  const startIndex = filteredRecords.length === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(activePage * itemsPerPage, filteredRecords.length);

  // ── Selection Handlers ──────────────────────────────────────────────────────
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

  // ── Reset Filter Handler ────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSearch('');
    setSelectedRoleCategory('All Users');
    setSelectedRoleFilter('All Roles');
    setSelectedStatusFilter('All Status');
    setSelectedClassDeptFilter('All');
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // ── Role Category Selection Click ───────────────────────────────────────────
  const handleSelectRoleCategory = (cat: string) => {
    setSelectedRoleCategory(cat);
    if (cat === 'All Users') setSelectedRoleFilter('All Roles');
    else if (cat === 'Teachers') setSelectedRoleFilter('Teacher');
    else if (cat === 'Students') setSelectedRoleFilter('Student');
    else if (cat === 'Parents') setSelectedRoleFilter('Parent');
    else if (cat === 'Admins') setSelectedRoleFilter('Admin');
    setCurrentPage(1);
  };

  // ── Bulk Actions ────────────────────────────────────────────────────────────
  const handleBulkStatusChange = async (is_active: boolean) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await bulkUpdateUserStatus({
        user_ids: selectedIds,
        is_active,
      });
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update users status');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkAssignRole = async () => {
    if (selectedIds.length === 0 || !targetRoleId) return;
    setBulkActionLoading(true);
    try {
      await bulkAssignUserRole({
        user_ids: selectedIds,
        role_id: targetRoleId,
      });
      setAssignRoleModal(false);
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to assign role');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = IS_WEB
      ? window.confirm(`Are you sure you want to deactivate ${selectedIds.length} selected user(s)?`)
      : true;
    if (!confirmed) return;

    setBulkActionLoading(true);
    try {
      await bulkDeleteUsers({ user_ids: selectedIds });
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete users');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // ── Single User Actions ─────────────────────────────────────────────────────
  const handleOpenEdit = (user: AdminUserOverviewRecord) => {
    setEditModal(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoleId(user.role_id);
    setEditStatus(user.is_active);
    setActiveMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setEditSaving(true);
    try {
      await updateUser(editModal.id, {
        name: editName.trim(),
        role_id: editRoleId,
        is_active: editStatus,
      });
      setEditModal(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update user');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleSingleStatus = async (user: AdminUserOverviewRecord) => {
    setActiveMenuId(null);
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      await loadData();
    } catch (err: any) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteSingleUser = async (user: AdminUserOverviewRecord) => {
    setActiveMenuId(null);
    const confirmed = IS_WEB
      ? window.confirm(`Deactivate user "${user.name}"?`)
      : true;
    if (!confirmed) return;
    try {
      await deactivateUser(user.id);
      await loadData();
    } catch (err: any) {
      alert('Failed to deactivate user');
    }
  };

  // ── Add User Submission ─────────────────────────────────────────────────────
  const handleSaveAddUser = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setFormError('Please fill in Name, Email, and Password.');
      return;
    }

    const roleObj = roles.find((r) => r.name.toLowerCase() === formRole.toLowerCase());
    if (!roleObj) {
      setFormError(`Role ${formRole} not found in system.`);
      return;
    }

    setFormSaving(true);
    setFormError(null);
    try {
      await createUser({
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword,
        role_id: roleObj.id,
        is_active: true,
      });
      setAddModal(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('Password@123');
      await loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create user');
    } finally {
      setFormSaving(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (id: string) => {
    const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#4F46E5'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'admin') {
      return { bg: P.purpleBg, text: P.purpleDark, border: P.purpleBorder };
    }
    if (r === 'teacher') {
      return { bg: P.primaryBg, text: P.primary, border: P.primaryBorder };
    }
    if (r === 'student') {
      return { bg: P.greenBg, text: P.greenDark, border: P.greenBorder };
    }
    if (r === 'parent') {
      return { bg: P.amberBg, text: P.amberDark, border: P.amberBorder };
    }
    return { bg: P.slateBg, text: P.slate, border: P.border };
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
        {/* ── 1. Top Breadcrumb & User Header ─────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.breadcrumbWrap}>
            <Text style={{ fontSize: 14 }}>🏠</Text>
            <Text style={styles.breadcrumbSlash}>›</Text>
            <Text style={styles.breadcrumbMuted}>Administration</Text>
            <Text style={styles.breadcrumbSlash}>›</Text>
            <Text style={styles.breadcrumbActive}>Users</Text>
          </View>

          <View style={styles.topBarRight}>
            {/* Search Input */}
            <View style={styles.topSearchBox}>
              <Text style={styles.topSearchIcon}>🔍</Text>
              <TextInput
                style={styles.topSearchInput}
                placeholder="Search here..."
                placeholderTextColor={P.textMuted}
              />
            </View>

            {/* Notification Bell */}
            <TouchableOpacity style={styles.topIconBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
              <View style={styles.topNotificationBadge}>
                <Text style={styles.topNotificationText}>3</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.topDivider} />

            {/* Admin Avatar Pill */}
            <View style={styles.adminProfilePill}>
              <View style={styles.adminAvatarCircle}>
                <Text style={styles.adminAvatarInitials}>A</Text>
              </View>
              <View style={styles.adminProfileTextWrap}>
                <Text style={styles.adminProfileName}>Admin</Text>
                <Text style={styles.adminProfileRole}>Administrator</Text>
              </View>
              <Text style={styles.adminProfileChevron}>▾</Text>
            </View>
          </View>
        </View>

        {/* ── 2. Page Action Header + Subtle Illustration Banner ──────────── */}
        <View style={styles.pageHeaderBanner}>
          <View style={styles.pageHeaderLeft}>
            <Text style={styles.pageTitle}>User Management</Text>
            <Text style={styles.pageSubtitle}>
              Manage all system users including teachers, students, parents and admins
            </Text>
          </View>

          <View style={styles.pageHeaderRight}>
            {/* Subtle school illustration watermark / decorative icon */}
            <View style={styles.decorativeWatermark}>
              <Text style={styles.watermarkIcon}>🏫</Text>
            </View>

            {/* Add User Button */}
            <TouchableOpacity
              style={styles.primaryAddBtn}
              onPress={() => {
                setFormError(null);
                setAddModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryAddBtnIcon}>+</Text>
              <Text style={styles.primaryAddBtnText}>Add User</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. Five Role Category Filter Cards ─────────────────────────── */}
        <View style={styles.roleCategoriesGrid}>
          {/* Card 1 — All Users */}
          <TouchableOpacity
            style={[
              styles.roleCategoryCard,
              selectedRoleCategory === 'All Users' && styles.roleCategoryCardActive,
            ]}
            onPress={() => handleSelectRoleCategory('All Users')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleCategoryIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Text style={{ fontSize: 18 }}>👥</Text>
            </View>
            <View style={styles.roleCategoryTextWrap}>
              <Text style={styles.roleCategoryTitle}>All Users</Text>
              <Text style={styles.roleCategorySub}>{summary.total_users} users</Text>
            </View>
            <Text style={styles.roleCategoryChevron}>›</Text>
          </TouchableOpacity>

          {/* Card 2 — Teachers */}
          <TouchableOpacity
            style={[
              styles.roleCategoryCard,
              selectedRoleCategory === 'Teachers' && styles.roleCategoryCardActive,
            ]}
            onPress={() => handleSelectRoleCategory('Teachers')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleCategoryIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Text style={{ fontSize: 18 }}>👨‍🏫</Text>
            </View>
            <View style={styles.roleCategoryTextWrap}>
              <Text style={styles.roleCategoryTitle}>Teachers</Text>
              <Text style={styles.roleCategorySub}>{summary.teacher_users} users</Text>
            </View>
            <Text style={styles.roleCategoryChevron}>›</Text>
          </TouchableOpacity>

          {/* Card 3 — Students */}
          <TouchableOpacity
            style={[
              styles.roleCategoryCard,
              selectedRoleCategory === 'Students' && styles.roleCategoryCardActive,
            ]}
            onPress={() => handleSelectRoleCategory('Students')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleCategoryIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Text style={{ fontSize: 18 }}>🎓</Text>
            </View>
            <View style={styles.roleCategoryTextWrap}>
              <Text style={styles.roleCategoryTitle}>Students</Text>
              <Text style={styles.roleCategorySub}>{summary.student_users} users</Text>
            </View>
            <Text style={styles.roleCategoryChevron}>›</Text>
          </TouchableOpacity>

          {/* Card 4 — Parents */}
          <TouchableOpacity
            style={[
              styles.roleCategoryCard,
              selectedRoleCategory === 'Parents' && styles.roleCategoryCardActive,
            ]}
            onPress={() => handleSelectRoleCategory('Parents')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleCategoryIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Text style={{ fontSize: 18 }}>👨‍👩‍👧</Text>
            </View>
            <View style={styles.roleCategoryTextWrap}>
              <Text style={styles.roleCategoryTitle}>Parents</Text>
              <Text style={styles.roleCategorySub}>{summary.parent_users} users</Text>
            </View>
            <Text style={styles.roleCategoryChevron}>›</Text>
          </TouchableOpacity>

          {/* Card 5 — Admins */}
          <TouchableOpacity
            style={[
              styles.roleCategoryCard,
              selectedRoleCategory === 'Admins' && styles.roleCategoryCardActive,
            ]}
            onPress={() => handleSelectRoleCategory('Admins')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleCategoryIconWrap, { backgroundColor: '#FFEDD5' }]}>
              <Text style={{ fontSize: 18 }}>🛡️</Text>
            </View>
            <View style={styles.roleCategoryTextWrap}>
              <Text style={styles.roleCategoryTitle}>Admins</Text>
              <Text style={styles.roleCategorySub}>{summary.admin_users} users</Text>
            </View>
            <Text style={styles.roleCategoryChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── 4. Four Summary Statistic Cards ─────────────────────────────── */}
        <View style={styles.summaryStatsGrid}>
          {/* Card 1 — Total Users */}
          <View style={styles.statMetricCard}>
            <View style={styles.statMetricHeader}>
              <View style={[styles.statSquareIcon, { backgroundColor: P.primaryBg }]}>
                <Text style={{ fontSize: 18, color: P.primary }}>👥</Text>
              </View>
              <Text style={{ fontSize: 18, color: P.primary }}>📊</Text>
            </View>
            <Text style={styles.statMetricLabel}>Total Users</Text>
            <Text style={styles.statMetricValue}>{summary.total_users}</Text>
            <Text style={styles.statMetricTrend}>{summary.trend_this_month}</Text>
          </View>

          {/* Card 2 — Active Users */}
          <View style={styles.statMetricCard}>
            <View style={styles.statMetricHeader}>
              <View style={[styles.statSquareIcon, { backgroundColor: P.greenBg }]}>
                <Text style={{ fontSize: 18, color: P.greenDark }}>👤</Text>
              </View>
              {/* Circular Percentage Ring */}
              <View style={styles.circularBadgeGreen}>
                <Text style={styles.circularBadgeTextGreen}>{summary.active_percentage}%</Text>
              </View>
            </View>
            <Text style={styles.statMetricLabel}>Active Users</Text>
            <Text style={[styles.statMetricValue, { color: P.greenDark }]}>
              {summary.active_users}
            </Text>
          </View>

          {/* Card 3 — Inactive Users */}
          <View style={styles.statMetricCard}>
            <View style={styles.statMetricHeader}>
              <View style={[styles.statSquareIcon, { backgroundColor: P.redBg }]}>
                <Text style={{ fontSize: 18, color: P.redDark }}>👤</Text>
              </View>
              {/* Circular Percentage Ring */}
              <View style={styles.circularBadgeRed}>
                <Text style={styles.circularBadgeTextRed}>{summary.inactive_percentage}%</Text>
              </View>
            </View>
            <Text style={styles.statMetricLabel}>Inactive Users</Text>
            <Text style={[styles.statMetricValue, { color: P.textSec }]}>
              {summary.inactive_users}
            </Text>
          </View>

          {/* Card 4 — Admin Users */}
          <View style={styles.statMetricCard}>
            <View style={styles.statMetricHeader}>
              <View style={[styles.statSquareIcon, { backgroundColor: P.purpleBg }]}>
                <Text style={{ fontSize: 18, color: P.purpleDark }}>🛡️</Text>
              </View>
              <Text style={{ fontSize: 18, color: P.purpleDark }}>📊</Text>
            </View>
            <Text style={styles.statMetricLabel}>Admin Users</Text>
            <Text style={[styles.statMetricValue, { color: P.purpleDark }]}>
              {summary.admin_users}
            </Text>
          </View>
        </View>

        {/* ── 5. Search & Filters Container ───────────────────────────────── */}
        <View style={styles.filtersCard}>
          <View style={styles.filtersRow}>
            {/* Search Input Box */}
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email or role..."
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

            {/* Role Dropdown */}
            <View style={styles.selectWrapper}>
              <select
                style={webSelectStyle}
                value={selectedRoleFilter}
                onChange={(e: any) => {
                  setSelectedRoleFilter(e.target.value);
                  setSelectedRoleCategory(e.target.value === 'All Roles' ? 'All Users' : `${e.target.value}s`);
                  setCurrentPage(1);
                }}
              >
                <option value="All Roles">Role: All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
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
                <option value="All Status">Status: All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </View>

            {/* Class / Department Dropdown */}
            <View style={styles.selectWrapper}>
              <select
                style={webSelectStyle}
                value={selectedClassDeptFilter}
                onChange={(e: any) => {
                  setSelectedClassDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {classesAndDepartments.map((cd) => (
                  <option key={cd} value={cd}>
                    {cd === 'All' ? 'Class/Department: All' : cd}
                  </option>
                ))}
              </select>
            </View>

            {/* Reset Button */}
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
              <Text style={styles.resetBtnIcon}>🔄</Text>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 6. Users Table Container ────────────────────────────────────── */}
        <View style={styles.tableCard}>
          {/* Table Toolbar */}
          <View style={styles.tableToolbar}>
            <View style={styles.tableToolbarLeft}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                style={{ cursor: 'pointer', width: 16, height: 16 }}
              />
              <Text style={styles.selectionCounterText}>
                {selectedIds.length} users selected
              </Text>
            </View>

            <View style={styles.tableToolbarRight}>
              {/* Assign Role Button */}
              <TouchableOpacity
                style={[
                  styles.toolbarActionBtn,
                  selectedIds.length === 0 && styles.toolbarActionBtnDisabled,
                ]}
                disabled={selectedIds.length === 0}
                onPress={() => setAssignRoleModal(true)}
              >
                <Text style={styles.toolbarActionBtnIcon}>👤⁺</Text>
                <Text style={styles.toolbarActionBtnText}>Assign Role</Text>
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
                    if (action === 'delete') handleBulkDelete();
                    e.target.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    ••• Bulk Actions ▾
                  </option>
                  <option value="activate">Activate Selected</option>
                  <option value="deactivate">Deactivate Selected</option>
                  <option value="delete">Delete / Deactivate</option>
                </select>
              </View>

              {/* List / Grid View Toggle */}
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
          </View>

          {/* Table Rows & Loading */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={P.primary} />
              <Text style={styles.loadingText}>Loading system users...</Text>
            </View>
          ) : filteredRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search query or reset selected filters.
              </Text>
              <TouchableOpacity style={styles.emptyResetBtn} onPress={handleResetFilters}>
                <Text style={styles.emptyResetBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : viewMode === 'table' ? (
            /* Table Layout */
            <View style={styles.tableWrapper}>
              {/* Table Column Headers */}
              <View style={styles.tableHeaderRow}>
                <View style={[styles.tableCol, { width: 36, justifyContent: 'center' }]} />
                <View style={[styles.tableCol, { width: 36 }]}>
                  <Text style={styles.tableHeaderLabel}>#</Text>
                </View>
                <View style={[styles.tableCol, { flex: 2.2 }]}>
                  <Text style={styles.tableHeaderLabel}>USER</Text>
                </View>
                <View style={[styles.tableCol, { flex: 2 }]}>
                  <Text style={styles.tableHeaderLabel}>EMAIL</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.2 }]}>
                  <Text style={styles.tableHeaderLabel}>ROLE</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.8 }]}>
                  <Text style={styles.tableHeaderLabel}>DEPARTMENT / CLASS</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.1 }]}>
                  <Text style={styles.tableHeaderLabel}>STATUS</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.6 }]}>
                  <Text style={styles.tableHeaderLabel}>LAST LOGIN</Text>
                </View>
                <View style={[styles.tableCol, { width: 130, alignItems: 'center' }]}>
                  <Text style={styles.tableHeaderLabel}>ACTIONS</Text>
                </View>
              </View>

              {/* Table Row Items */}
              {paginatedRecords.map((item, idx) => {
                const isSelected = selectedIds.includes(item.id);
                const isMenuOpen = activeMenuId === item.id;
                const roleBadge = getRoleBadgeStyle(item.role_name);
                const globalIndex = startIndex + idx;

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
                    <View style={[styles.tableCol, { width: 36, justifyContent: 'center' }]}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(item.id)}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </View>

                    {/* Row Index # */}
                    <View style={[styles.tableCol, { width: 36 }]}>
                      <Text style={styles.rowIndexText}>{globalIndex}</Text>
                    </View>

                    {/* User Avatar + Name + ID */}
                    <View style={[styles.tableCol, { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                      {item.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} style={styles.userAvatarImage} />
                      ) : (
                        <View style={[styles.userAvatarCircle, { backgroundColor: getAvatarBg(item.id) }]}>
                          <Text style={styles.userAvatarInitials}>{getInitials(item.name)}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userNameText} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.userCodeText}>ID: {item.code_id}</Text>
                      </View>
                    </View>

                    {/* Email */}
                    <View style={[styles.tableCol, { flex: 2 }]}>
                      <Text style={styles.userEmailText} numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>

                    {/* Role Badge */}
                    <View style={[styles.tableCol, { flex: 1.2 }]}>
                      <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg, borderColor: roleBadge.border }]}>
                        <Text style={[styles.roleBadgeText, { color: roleBadge.text }]}>
                          {item.role_name}
                        </Text>
                      </View>
                    </View>

                    {/* Department / Class */}
                    <View style={[styles.tableCol, { flex: 1.8 }]}>
                      <Text style={styles.departmentClassText} numberOfLines={1}>
                        {item.department_or_class}
                      </Text>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.tableCol, { flex: 1.1 }]}>
                      {item.is_active ? (
                        <View style={styles.statusBadgeActive}>
                          <Text style={styles.statusTextActive}>Active</Text>
                        </View>
                      ) : (
                        <View style={styles.statusBadgeInactive}>
                          <Text style={styles.statusTextInactive}>Inactive</Text>
                        </View>
                      )}
                    </View>

                    {/* Last Login */}
                    <View style={[styles.tableCol, { flex: 1.6 }]}>
                      <Text style={styles.lastLoginText}>{item.last_login}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={[styles.tableCol, { width: 130, flexDirection: 'row', alignItems: 'center', gap: 6, position: 'relative' }]}>
                      {/* View Button */}
                      <TouchableOpacity
                        style={styles.actionPillBtn}
                        onPress={() => setViewModal(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 11 }}>👁️</Text>
                        <Text style={styles.actionPillBtnText}>View</Text>
                      </TouchableOpacity>

                      {/* Edit Button */}
                      <TouchableOpacity
                        style={styles.actionPillBtn}
                        onPress={() => handleOpenEdit(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 11 }}>✏️</Text>
                        <Text style={styles.actionPillBtnText}>Edit</Text>
                      </TouchableOpacity>

                      {/* Three-dot menu button */}
                      <TouchableOpacity
                        style={styles.actionMoreBtn}
                        onPress={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                      >
                        <Text style={styles.actionMoreDots}>⋮</Text>
                      </TouchableOpacity>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <View style={styles.actionDropdown}>
                          <TouchableOpacity
                            style={styles.actionDropdownItem}
                            onPress={() => {
                              setViewModal(item);
                              setActiveMenuId(null);
                            }}
                          >
                            <Text style={styles.actionDropdownIcon}>👁️</Text>
                            <Text style={styles.actionDropdownText}>View Details</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionDropdownItem}
                            onPress={() => {
                              handleOpenEdit(item);
                            }}
                          >
                            <Text style={styles.actionDropdownIcon}>✏️</Text>
                            <Text style={styles.actionDropdownText}>Edit User</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionDropdownItem}
                            onPress={() => {
                              setSelectedIds([item.id]);
                              setAssignRoleModal(true);
                              setActiveMenuId(null);
                            }}
                          >
                            <Text style={styles.actionDropdownIcon}>👤⁺</Text>
                            <Text style={styles.actionDropdownText}>Change Role</Text>
                          </TouchableOpacity>

                          <View style={styles.actionDropdownDivider} />

                          <TouchableOpacity
                            style={styles.actionDropdownItem}
                            onPress={() => handleToggleSingleStatus(item)}
                          >
                            <Text style={styles.actionDropdownIcon}>{item.is_active ? '⏸️' : '▶️'}</Text>
                            <Text style={[styles.actionDropdownText, { color: item.is_active ? P.amberDark : P.greenDark }]}>
                              {item.is_active ? 'Deactivate' : 'Activate'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionDropdownItem}
                            onPress={() => handleDeleteSingleUser(item)}
                          >
                            <Text style={styles.actionDropdownIcon}>🗑️</Text>
                            <Text style={[styles.actionDropdownText, { color: P.redDark }]}>
                              Delete User
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
            /* Grid View */
            <View style={styles.cardsGrid}>
              {paginatedRecords.map((item) => (
                <View key={item.id} style={styles.gridCard}>
                  <View style={styles.gridCardHeader}>
                    <View style={[styles.userAvatarCircle, { backgroundColor: getAvatarBg(item.id), width: 44, height: 44 }]}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{getInitials(item.name)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.userNameText}>{item.name}</Text>
                      <Text style={styles.userCodeText}>ID: {item.code_id}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeStyle(item.role_name).bg }]}>
                      <Text style={[styles.roleBadgeText, { color: getRoleBadgeStyle(item.role_name).text }]}>{item.role_name}</Text>
                    </View>
                  </View>

                  <View style={styles.gridCardDetails}>
                    <View style={styles.gridDetailRow}>
                      <Text style={styles.gridDetailLabel}>Email:</Text>
                      <Text style={styles.gridDetailVal} numberOfLines={1}>{item.email}</Text>
                    </View>
                    <View style={styles.gridDetailRow}>
                      <Text style={styles.gridDetailLabel}>Dept / Class:</Text>
                      <Text style={styles.gridDetailVal}>{item.department_or_class}</Text>
                    </View>
                    <View style={styles.gridDetailRow}>
                      <Text style={styles.gridDetailLabel}>Status:</Text>
                      <Text style={{ fontWeight: '700', color: item.is_active ? P.greenDark : P.redDark }}>
                        {item.status}
                      </Text>
                    </View>
                    <View style={styles.gridDetailRow}>
                      <Text style={styles.gridDetailLabel}>Last Login:</Text>
                      <Text style={styles.gridDetailVal}>{item.last_login}</Text>
                    </View>
                  </View>

                  <View style={styles.gridCardFooter}>
                    <TouchableOpacity style={styles.actionPillBtn} onPress={() => setViewModal(item)}>
                      <Text style={{ fontSize: 11 }}>👁️</Text>
                      <Text style={styles.actionPillBtnText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionPillBtn} onPress={() => handleOpenEdit(item)}>
                      <Text style={{ fontSize: 11 }}>✏️</Text>
                      <Text style={styles.actionPillBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── 7. Pagination Footer ────────────────────────────────────── */}
          {filteredRecords.length > 0 && (
            <View style={styles.paginationRow}>
              <Text style={styles.paginationShowingText}>
                Showing <Text style={{ fontWeight: '700', color: P.text }}>{startIndex}</Text> to{' '}
                <Text style={{ fontWeight: '700', color: P.text }}>{endIndex}</Text> of{' '}
                <Text style={{ fontWeight: '700', color: P.text }}>{filteredRecords.length}</Text> users
              </Text>

              <View style={styles.paginationControls}>
                {/* Previous Page Button */}
                <TouchableOpacity
                  style={[styles.pageNavBtn, activePage <= 1 && styles.pageNavBtnDisabled]}
                  disabled={activePage <= 1}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pageNavBtnText}>‹</Text>
                </TouchableOpacity>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                  const isActive = pg === activePage;
                  return (
                    <TouchableOpacity
                      key={pg}
                      style={[styles.pageNumberBtn, isActive && styles.pageNumberBtnActive]}
                      onPress={() => setCurrentPage(pg)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.pageNumberText, isActive && styles.pageNumberTextActive]}>
                        {pg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Next Page Button */}
                <TouchableOpacity
                  style={[styles.pageNavBtn, activePage >= totalPages && styles.pageNavBtnDisabled]}
                  disabled={activePage >= totalPages}
                  onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pageNavBtnText}>›</Text>
                </TouchableOpacity>

                {/* Per Page Selector */}
                <select
                  style={{
                    ...webSelectStyle,
                    height: '32px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    marginLeft: 8,
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
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL 1: Add User ────────────────────────────────────────────── */}
      <Modal visible={addModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New User</Text>
                <Text style={styles.modalSub}>Create a new account with system permissions</Text>
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

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>User Role *</Text>
                <select
                  style={{ ...webSelectStyle, width: '100%' }}
                  value={formRole}
                  onChange={(e: any) => setFormRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Administrator</option>
                </select>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Ramesh Verma"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. user@school.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formEmail}
                  onChangeText={setFormEmail}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Password"
                  secureTextEntry
                  value={formPassword}
                  onChangeText={setFormPassword}
                />
              </View>

              {formRole === 'teacher' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Department</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Mathematics"
                    value={formDepartment}
                    onChangeText={setFormDepartment}
                  />
                </View>
              )}

              {formRole === 'student' && classes.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Class & Section</Text>
                  <select
                    style={{ ...webSelectStyle, width: '100%' }}
                    value={formClassId}
                    onChange={(e: any) => setFormClassId(e.target.value)}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Class {c.grade_level} - {c.section}
                      </option>
                    ))}
                  </select>
                </View>
              )}
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
                onPress={handleSaveAddUser}
                disabled={formSaving}
              >
                {formSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create User</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: View User Profile Details ───────────────────────────── */}
      <Modal visible={!!viewModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 520 }]}>
            {viewModal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={[
                        styles.userAvatarCircle,
                        { backgroundColor: getAvatarBg(viewModal.id), width: 48, height: 48 },
                      ]}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>
                        {getInitials(viewModal.name)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{viewModal.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeStyle(viewModal.role_name).bg }]}>
                          <Text style={[styles.roleBadgeText, { color: getRoleBadgeStyle(viewModal.role_name).text }]}>
                            {viewModal.role_name}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: P.textMuted }}>ID: {viewModal.code_id}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setViewModal(null)}>
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.viewDetailsGrid}>
                  <View style={styles.viewDetailItem}>
                    <Text style={styles.viewDetailLabel}>Email Address</Text>
                    <Text style={styles.viewDetailVal}>{viewModal.email}</Text>
                  </View>

                  <View style={styles.viewDetailItem}>
                    <Text style={styles.viewDetailLabel}>Department / Class</Text>
                    <Text style={styles.viewDetailVal}>{viewModal.department_or_class}</Text>
                  </View>

                  <View style={styles.viewDetailItem}>
                    <Text style={styles.viewDetailLabel}>Account Status</Text>
                    <Text
                      style={[
                        styles.viewDetailVal,
                        { color: viewModal.is_active ? P.greenDark : P.redDark, fontWeight: '700' },
                      ]}
                    >
                      {viewModal.status}
                    </Text>
                  </View>

                  <View style={styles.viewDetailItem}>
                    <Text style={styles.viewDetailLabel}>Last Login Activity</Text>
                    <Text style={styles.viewDetailVal}>{viewModal.last_login}</Text>
                  </View>

                  <View style={styles.viewDetailItem}>
                    <Text style={styles.viewDetailLabel}>System ID</Text>
                    <Text style={[styles.viewDetailVal, { fontSize: 11, color: P.textMuted }]}>
                      {viewModal.id}
                    </Text>
                  </View>

                  <View style={styles.viewDetailItem}>
                    <Text style={styles.viewDetailLabel}>Member Since</Text>
                    <Text style={styles.viewDetailVal}>{viewModal.created_at.slice(0, 10)}</Text>
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
                      const v = viewModal;
                      setViewModal(null);
                      handleOpenEdit(v);
                    }}
                  >
                    <Text style={styles.modalSubmitBtnText}>Edit User</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: Edit User ───────────────────────────────────────────── */}
      <Modal visible={!!editModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit User Profile</Text>
                <Text style={styles.modalSub}>Update user credentials and role access</Text>
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
              <Text style={styles.formLabel}>Assigned Role</Text>
              <select
                style={{ ...webSelectStyle, width: '100%' }}
                value={editRoleId}
                onChange={(e: any) => setEditRoleId(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.toUpperCase()}
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
                onPress={handleSaveEdit}
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

      {/* ── MODAL 4: Assign Role Modal (Bulk) ────────────────────────────── */}
      <Modal visible={assignRoleModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Role</Text>
                <Text style={styles.modalSub}>
                  Assign a new role to {selectedIds.length} selected user(s)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAssignRoleModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Select New Role</Text>
              <select
                style={{ ...webSelectStyle, width: '100%' }}
                value={targetRoleId}
                onChange={(e: any) => setTargetRoleId(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAssignRoleModal(false)}
                disabled={bulkActionLoading}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleBulkAssignRole}
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Assign Role</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles matching Reference Visual Design ──────────────────────────────────
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
    gap: 8,
  },
  breadcrumbSlash: {
    fontSize: 13,
    color: P.borderDark,
    fontWeight: '600',
  },
  breadcrumbMuted: {
    fontSize: 13,
    color: P.textSec,
    fontWeight: '500',
  },
  breadcrumbActive: {
    fontSize: 13,
    color: P.text,
    fontWeight: '700',
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
    width: 170,
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
    top: -2,
    right: -2,
    backgroundColor: P.red,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNotificationText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  topDivider: {
    width: 1,
    height: 24,
    backgroundColor: P.border,
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
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
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

  // 2. Page Action Header & Watermark
  pageHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 6,
  },
  pageHeaderLeft: {
    zIndex: 2,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: P.text,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: P.textSec,
    marginTop: 3,
  },
  pageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },
  decorativeWatermark: {
    opacity: 0.18,
    position: 'absolute',
    right: 130,
    top: -10,
  },
  watermarkIcon: {
    fontSize: 64,
  },
  primaryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.primary,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    gap: 6,
    shadowColor: P.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  primaryAddBtnIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -1,
  },
  primaryAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 3. Five Role Category Filter Cards
  roleCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  roleCategoryCard: {
    flex: 1,
    minWidth: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  roleCategoryCardActive: {
    borderColor: P.primary,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    shadowColor: P.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  roleCategoryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCategoryTextWrap: {
    flex: 1,
  },
  roleCategoryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: P.text,
  },
  roleCategorySub: {
    fontSize: 11.5,
    color: P.textMuted,
    marginTop: 2,
  },
  roleCategoryChevron: {
    fontSize: 16,
    color: P.textMuted,
    fontWeight: '600',
  },

  // 4. Four Summary Statistic Cards
  summaryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  statMetricCard: {
    flex: 1,
    minWidth: 200,
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
  statMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statSquareIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statMetricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textSec,
  },
  statMetricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: P.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statMetricTrend: {
    fontSize: 11,
    fontWeight: '600',
    color: P.greenDark,
    marginTop: 4,
  },
  circularBadgeGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: P.green,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.greenBg,
  },
  circularBadgeTextGreen: {
    fontSize: 10,
    fontWeight: '800',
    color: P.greenDark,
  },
  circularBadgeRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: P.red,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.redBg,
  },
  circularBadgeTextRed: {
    fontSize: 10,
    fontWeight: '800',
    color: P.redDark,
  },

  // 5. Search & Filters Card
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
  searchBox: {
    flex: 2,
    minWidth: 260,
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
  searchIcon: {
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: P.text,
  },
  selectWrapper: {
    minWidth: 140,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  resetBtnIcon: {
    fontSize: 12,
  },
  resetBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: P.textSec,
  },

  // 6. Table Container Card
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
    gap: 12,
  },
  tableToolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectionCounterText: {
    fontSize: 13,
    fontWeight: '600',
    color: P.textSec,
  },
  tableToolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
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

  // Table Markup
  tableWrapper: {
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
  rowIndexText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.textMuted,
  },
  userAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  userAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: P.text,
  },
  userCodeText: {
    fontSize: 11,
    color: P.textMuted,
    marginTop: 1,
  },
  userEmailText: {
    fontSize: 12.5,
    color: P.textSec,
  },
  roleBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  departmentClassText: {
    fontSize: 12.5,
    color: P.text,
    fontWeight: '500',
  },
  statusBadgeActive: {
    backgroundColor: P.greenBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: P.greenDark,
  },
  statusBadgeInactive: {
    backgroundColor: P.redBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusTextInactive: {
    fontSize: 11,
    fontWeight: '700',
    color: P.redDark,
  },
  lastLoginText: {
    fontSize: 12,
    color: P.textSec,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: P.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionPillBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: P.textSec,
  },
  actionMoreBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMoreDots: {
    fontSize: 15,
    color: P.textSec,
    fontWeight: '700',
  },

  // Action Dropdown Menu
  actionDropdown: {
    position: 'absolute',
    top: 28,
    right: 0,
    width: 145,
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
  },
  actionDropdownIcon: {
    fontSize: 12,
  },
  actionDropdownText: {
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
  gridCardHeader: {
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
  gridDetailVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: P.text,
  },
  gridCardFooter: {
    flexDirection: 'row',
    gap: 8,
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
  pageNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: P.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pageNavBtnDisabled: {
    opacity: 0.4,
  },
  pageNavBtnText: {
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
  modalCard: {
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
  viewDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
  },
  viewDetailItem: {
    width: '47%',
  },
  viewDetailLabel: {
    fontSize: 11,
    color: P.textMuted,
    fontWeight: '600',
  },
  viewDetailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: P.text,
    marginTop: 2,
  },
});
