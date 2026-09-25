import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

export interface StudentRowItem {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  classId: string;
  className: string;
  section: string;
  dob?: string;
  gender?: string;
  status: 'ACTIVE' | 'INACTIVE';
  admissionDate?: string;
  isNewAdmission?: boolean;
  avatarUrl?: string;
  parentName?: string;
  parentPhone?: string;
  attendancePct?: number;
}

interface StudentsTableProps {
  students: StudentRowItem[];
  onViewStudent: (student: StudentRowItem) => void;
  onEditStudent: (student: StudentRowItem) => void;
  onActivateStudent: (id: string) => void;
  onDeactivateStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onExportFiltered: () => void;
  onPrintFiltered: () => void;
  onClearFilters: () => void;
}

type TabType = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'NEW_ADMISSIONS';
type SortField = 'name' | 'rollNumber' | 'className' | 'section' | 'dob' | 'status';

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  onViewStudent,
  onEditStudent,
  onActivateStudent,
  onDeactivateStudent,
  onDeleteStudent,
  onExportFiltered,
  onPrintFiltered,
  onClearFilters,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter by Tab
  const tabFilteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (activeTab === 'ACTIVE' && s.status !== 'ACTIVE') return false;
      if (activeTab === 'INACTIVE' && s.status !== 'INACTIVE') return false;
      if (activeTab === 'NEW_ADMISSIONS' && !s.isNewAdmission) return false;
      return true;
    });
  }, [students, activeTab]);

  // Tab Counts
  const tabCounts = useMemo(() => {
    const counts = { ALL: students.length, ACTIVE: 0, INACTIVE: 0, NEW_ADMISSIONS: 0 };
    students.forEach((s) => {
      if (s.status === 'ACTIVE') counts.ACTIVE++;
      if (s.status === 'INACTIVE') counts.INACTIVE++;
      if (s.isNewAdmission) counts.NEW_ADMISSIONS++;
    });
    return counts;
  }, [students]);

  // Sort
  const sortedStudents = useMemo(() => {
    return [...tabFilteredStudents].sort((a, b) => {
      let valA: string = (a[sortField] || '').toString().toLowerCase();
      let valB: string = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tabFilteredStudents, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, currentPage, pageSize]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedStudents.length && paginatedStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedStudents.map((s) => s.id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Tabs & Export/Print Actions */}
      <View style={styles.tableHeaderBar}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('ALL'); setCurrentPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
              All Students ({tabCounts.ALL})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ACTIVE' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('ACTIVE'); setCurrentPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
              Active ({tabCounts.ACTIVE})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'INACTIVE' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('INACTIVE'); setCurrentPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === 'INACTIVE' && styles.tabTextActive]}>
              Inactive ({tabCounts.INACTIVE})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'NEW_ADMISSIONS' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('NEW_ADMISSIONS'); setCurrentPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === 'NEW_ADMISSIONS' && styles.tabTextActive]}>
              New Admissions ({tabCounts.NEW_ADMISSIONS})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Export & Print */}
        <View style={styles.actionBtnsWrap}>
          <TouchableOpacity style={styles.exportBtn} onPress={onExportFiltered} activeOpacity={0.8}>
            <Text style={styles.exportBtnText}>📥 Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.printBtn} onPress={onPrintFiltered} activeOpacity={0.8}>
            <Text style={styles.printBtnText}>🖨️ Print</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Part 24: Bulk Selection Toolbar */}
      {selectedIds.size > 0 && (
        <View style={styles.bulkToolbar}>
          <Text style={styles.bulkCountText}>Selected: {selectedIds.size} students</Text>
          <View style={styles.bulkActionsRow}>
            <TouchableOpacity style={styles.bulkBtn} onPress={onExportFiltered}>
              <Text style={styles.bulkBtnText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkBtn} onPress={onPrintFiltered}>
              <Text style={styles.bulkBtnText}>Print</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkBtn}
              onPress={() => selectedIds.forEach((id) => onActivateStudent(id))}
            >
              <Text style={styles.bulkBtnText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkBtn}
              onPress={() => selectedIds.forEach((id) => onDeactivateStudent(id))}
            >
              <Text style={styles.bulkBtnText}>Deactivate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Roster Table Content */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ minWidth: 960 }}>
          {/* Table Header */}
          <View style={styles.thRow}>
            <TouchableOpacity style={styles.checkboxCell} onPress={handleToggleSelectAll}>
              <Text style={{ fontSize: 14 }}>
                {selectedIds.size > 0 && selectedIds.size === paginatedStudents.length ? '☑️' : '⏹️'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.th, { width: 40 }]}>#</Text>

            <TouchableOpacity style={[styles.thBtn, { flex: 2.2 }]} onPress={() => handleHeaderSort('name')}>
              <Text style={styles.th}>STUDENT NAME {sortField === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.thBtn, { flex: 1 }]} onPress={() => handleHeaderSort('rollNumber')}>
              <Text style={styles.th}>ROLL NO. {sortField === 'rollNumber' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.thBtn, { flex: 1.2 }]} onPress={() => handleHeaderSort('className')}>
              <Text style={styles.th}>CLASS {sortField === 'className' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.thBtn, { flex: 1 }]} onPress={() => handleHeaderSort('section')}>
              <Text style={styles.th}>SECTION {sortField === 'section' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.thBtn, { flex: 1.2 }]} onPress={() => handleHeaderSort('dob')}>
              <Text style={styles.th}>DOB {sortField === 'dob' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</Text>
            </TouchableOpacity>

            <Text style={[styles.th, { flex: 1 }]}>GENDER</Text>

            <TouchableOpacity style={[styles.thBtn, { flex: 1.2, textAlign: 'center' }]} onPress={() => handleHeaderSort('status')}>
              <Text style={styles.th}>STATUS {sortField === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</Text>
            </TouchableOpacity>

            <Text style={[styles.th, { flex: 1.8, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {/* Rows */}
          {paginatedStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 36 }}>🎓</Text>
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptySub}>Try changing your filters or search query.</Text>
              <TouchableOpacity style={styles.clearFiltersBtn} onPress={onClearFilters}>
                <Text style={styles.clearFiltersBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            paginatedStudents.map((item, idx) => {
              const rowNum = (currentPage - 1) * pageSize + idx + 1;
              const isChecked = selectedIds.has(item.id);
              const isEven = idx % 2 === 0;

              return (
                <View
                  key={item.id}
                  style={[styles.trRow, isEven ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F8FAFC' }]}
                >
                  <TouchableOpacity
                    style={styles.checkboxCell}
                    onPress={() => handleToggleSelectRow(item.id)}
                  >
                    <Text style={{ fontSize: 14 }}>{isChecked ? '☑️' : '⏹️'}</Text>
                  </TouchableOpacity>

                  <Text style={[styles.tdText, { width: 40 }]}>{rowNum}</Text>

                  {/* Student Info */}
                  <View style={[styles.td, { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                    {item.avatarUrl ? (
                      <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>
                          {item.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.studentSub} numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.tdBold, { flex: 1 }]}>{item.rollNumber || '—'}</Text>
                  <Text style={[styles.tdText, { flex: 1.2 }]}>{item.className}</Text>
                  <Text style={[styles.tdText, { flex: 1 }]}>{item.section || 'A'}</Text>
                  <Text style={[styles.tdText, { flex: 1.2 }]}>{item.dob || '15 May 2011'}</Text>
                  <Text style={[styles.tdText, { flex: 1 }]}>{item.gender || 'Male'}</Text>

                  {/* Status */}
                  <View style={[styles.td, { flex: 1.2, alignItems: 'center' }]}>
                    <View
                      style={[
                        styles.badge,
                        item.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.status === 'ACTIVE' ? styles.badgeActiveText : styles.badgeInactiveText,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={[styles.td, { flex: 1.8, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }]}>
                    <TouchableOpacity
                      style={styles.actionBtnView}
                      onPress={() => onViewStudent(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>👁️ View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnEdit}
                      onPress={() => onEditStudent(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>✏️ Edit</Text>
                    </TouchableOpacity>

                    {/* More Menu */}
                    <TouchableOpacity
                      style={styles.actionBtnMore}
                      onPress={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>⋮</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dropdown Menu overlay */}
                  {activeMenuId === item.id && (
                    <View style={styles.menuDropdown}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => { setActiveMenuId(null); onViewStudent(item); }}
                      >
                        <Text style={styles.menuItemText}>👤 View Profile</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => { setActiveMenuId(null); onEditStudent(item); }}
                      >
                        <Text style={styles.menuItemText}>✏️ Edit Student</Text>
                      </TouchableOpacity>
                      {item.status === 'ACTIVE' ? (
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => { setActiveMenuId(null); onDeactivateStudent(item.id); }}
                        >
                          <Text style={styles.menuItemText}>🚫 Deactivate</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => { setActiveMenuId(null); onActivateStudent(item.id); }}
                        >
                          <Text style={styles.menuItemText}>✅ Activate</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}
                        onPress={() => { setActiveMenuId(null); onDeleteStudent(item.id); }}
                      >
                        <Text style={[styles.menuItemText, { color: '#DC2626' }]}>🗑️ Delete Student</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Pagination Footer */}
      <View style={styles.paginationRow}>
        <Text style={styles.paginationInfo}>
          Showing {sortedStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedStudents.length)} of {sortedStudents.length} students
        </Text>

        <View style={styles.pageControls}>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <Text style={styles.pageBtnText}>Previous</Text>
          </TouchableOpacity>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const active = pageNum === currentPage;
            return (
              <TouchableOpacity
                key={pageNum}
                style={[styles.pageNumBtn, active && styles.pageNumActive]}
                onPress={() => setCurrentPage(pageNum)}
              >
                <Text style={[styles.pageNumText, active && styles.pageNumTextActive]}>
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  tableHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
    flexWrap: 'wrap',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  actionBtnsWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  exportBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  printBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  bulkToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD6FE',
  },
  bulkCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },
  bulkActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bulkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  thRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  checkboxCell: {
    width: 32,
    alignItems: 'center',
  },
  thBtn: {
    justifyContent: 'center',
  },
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  td: {
    justifyContent: 'center',
  },
  tdText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  tdBold: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentSub: {
    fontSize: 11,
    color: '#64748B',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeActive: { backgroundColor: '#D1FAE5' },
  badgeActiveText: { color: '#059669', fontSize: 11, fontWeight: '800' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeInactiveText: { color: '#DC2626', fontSize: 11, fontWeight: '800' },
  badgeText: {},
  actionBtnView: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnEdit: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnMore: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  menuDropdown: {
    position: 'absolute',
    right: 20,
    top: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 160,
    zIndex: 99,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
  },
  clearFiltersBtn: {
    marginTop: 8,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
    flexWrap: 'wrap',
  },
  paginationInfo: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  pageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  pageNumBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumActive: {
    backgroundColor: '#7C3AED',
  },
  pageNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  pageNumTextActive: {
    color: '#FFFFFF',
  },
});
