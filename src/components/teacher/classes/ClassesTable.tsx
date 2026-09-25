import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export interface SubjectItem {
  id: string;
  name: string;
  code?: string;
}

export interface ClassRowItem {
  id: string;
  name: string;
  gradeLevel: number;
  section: string;
  roomNumber?: string;
  capacity?: number;
  studentCount: number;
  teacherName: string;
  isClassTeacher: boolean;
  subjects: SubjectItem[];
  weeklyPeriods: number;
  attendanceAvg?: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  academicYear?: string;
}

interface ClassesTableProps {
  classes: ClassRowItem[];
  onViewClass: (cls: ClassRowItem) => void;
  onEditClass: (cls: ClassRowItem) => void;
  onNavigateToStudents: (classId: string, className: string) => void;
  onNavigateToAttendance: (classId: string, className: string) => void;
  onNavigateToResults: (classId: string, className: string) => void;
  onNavigateToTimetable: (classId: string, className: string) => void;
  onToggleStatus: (cls: ClassRowItem) => void;
  onDeleteClass: (cls: ClassRowItem) => void;
  onClearFilters: () => void;
}

type SortField = 'name' | 'studentCount' | 'weeklyPeriods' | 'attendanceAvg' | 'status';

export const ClassesTable: React.FC<ClassesTableProps> = ({
  classes,
  onViewClass,
  onEditClass,
  onNavigateToStudents,
  onNavigateToAttendance,
  onNavigateToResults,
  onNavigateToTimetable,
  onToggleStatus,
  onDeleteClass,
  onClearFilters,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [expandedSubjectsId, setExpandedSubjectsId] = useState<string | null>(null);

  // Sorting
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'attendanceAvg') {
        valA = valA ?? -1;
        valB = valB ?? -1;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [classes, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedClasses.length / pageSize) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClasses.slice(start, start + pageSize);
  }, [sortedClasses, currentPage, pageSize]);

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Color helper for subject badges
  const getSubjectColorStyle = (subjName: string) => {
    const lower = subjName.toLowerCase();
    if (lower.includes('math')) return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' };
    if (lower.includes('phys')) return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    if (lower.includes('chem')) return { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' };
    if (lower.includes('eng')) return { bg: '#FEFCE8', text: '#CA8A04', border: '#FEF08A' };
    if (lower.includes('comp') || lower.includes('cs'))
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    if (lower.includes('bio')) return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
    if (lower.includes('soc') || lower.includes('hist'))
      return { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' };
    return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
  };

  // Circular progress helper
  const renderProgressCircle = (val?: number | null) => {
    if (val == null) {
      return (
        <View style={styles.circleProgressWrap}>
          <View style={[styles.circleProgress, { borderColor: '#CBD5E1' }]}>
            <Text style={styles.circleProgressValNA}>N/A</Text>
          </View>
          <Text style={styles.circleProgressSub}>No data</Text>
        </View>
      );
    }

    const color = val >= 85 ? '#10B981' : val >= 70 ? '#F59E0B' : '#EF4444';
    return (
      <View style={styles.circleProgressWrap}>
        <View style={[styles.circleProgress, { borderColor: color }]}>
          <Text style={[styles.circleProgressVal, { color }]}>{val}%</Text>
        </View>
        <Text style={styles.circleProgressSub}>Avg. This Month</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ minWidth: 980 }}>
          {/* Table Header */}
          <View style={styles.thRow}>
            <TouchableOpacity
              style={[styles.thBtn, { flex: 2.2 }]}
              onPress={() => handleHeaderSort('name')}
            >
              <Text style={styles.th}>
                CLASS {sortField === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.thBtn, { flex: 1.4 }]}
              onPress={() => handleHeaderSort('studentCount')}
            >
              <Text style={styles.th}>
                STUDENTS {sortField === 'studentCount' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 2.3 }}>
              <Text style={styles.th}>SUBJECTS</Text>
            </View>

            <TouchableOpacity
              style={[styles.thBtn, { flex: 1.5 }]}
              onPress={() => handleHeaderSort('weeklyPeriods')}
            >
              <Text style={styles.th}>
                WEEKLY PERIODS {sortField === 'weeklyPeriods' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.thBtn, { flex: 1.4, alignItems: 'center' }]}
              onPress={() => handleHeaderSort('attendanceAvg')}
            >
              <Text style={styles.th}>
                PROGRESS {sortField === 'attendanceAvg' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.thBtn, { flex: 1.1, alignItems: 'center' }]}
              onPress={() => handleHeaderSort('status')}
            >
              <Text style={styles.th}>
                STATUS {sortField === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
              <Text style={styles.th}>ACTIONS</Text>
            </View>
          </View>

          {/* Rows */}
          {paginatedClasses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 36 }}>🏫</Text>
              <Text style={styles.emptyTitle}>No classes found</Text>
              <Text style={styles.emptySub}>Try changing your filters or search query.</Text>
              <TouchableOpacity style={styles.clearFiltersBtn} onPress={onClearFilters}>
                <Text style={styles.clearFiltersBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            paginatedClasses.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const badgeLabel = `${item.gradeLevel || 10}${item.section || 'A'}`;
              const shownSubjects = item.subjects.slice(0, 3);
              const extraSubjectsCount = Math.max(0, item.subjects.length - 3);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.trRow,
                    isEven ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F8FAFC' },
                  ]}
                >
                  {/* 1. CLASS COLUMN */}
                  <View style={[styles.td, { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>{badgeLabel}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.classNameText} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.classSubText}>
                        Section {item.section || 'A'} • Room {item.roomNumber || '101'}
                      </Text>
                      <Text style={styles.teacherSubText} numberOfLines={1}>
                        Class Teacher: {item.teacherName || 'Ms. Sreeja'}
                      </Text>
                    </View>
                  </View>

                  {/* 2. STUDENTS COLUMN */}
                  <View style={[styles.td, { flex: 1.4 }]}>
                    {/* Overlapping Initials */}
                    <View style={styles.avatarStack}>
                      {['AS', 'AV', 'DR'].map((init, i) => (
                        <View
                          key={i}
                          style={[
                            styles.stackAvatar,
                            { left: i * 14, backgroundColor: i === 0 ? '#7C3AED' : i === 1 ? '#3B82F6' : '#10B981' },
                          ]}
                        >
                          <Text style={styles.stackAvatarText}>{init}</Text>
                        </View>
                      ))}
                      <Text style={[styles.studentCountText, { marginLeft: 50 }]}>
                        {item.studentCount} Students
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onNavigateToStudents(item.id, item.name)}
                      activeOpacity={0.7}
                      style={{ marginTop: 4 }}
                    >
                      <Text style={styles.tableLinkText}>View Students →</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 3. SUBJECTS COLUMN */}
                  <View style={[styles.td, { flex: 2.3 }]}>
                    <View style={styles.chipsWrap}>
                      {shownSubjects.map((subj) => {
                        const col = getSubjectColorStyle(subj.name);
                        return (
                          <View
                            key={subj.id}
                            style={[
                              styles.subjChip,
                              { backgroundColor: col.bg, borderColor: col.border },
                            ]}
                          >
                            <Text style={[styles.subjChipText, { color: col.text }]}>
                              {subj.name}
                            </Text>
                          </View>
                        );
                      })}

                      {extraSubjectsCount > 0 && (
                        <TouchableOpacity
                          style={styles.moreSubjChip}
                          onPress={() =>
                            setExpandedSubjectsId(
                              expandedSubjectsId === item.id ? null : item.id
                            )
                          }
                        >
                          <Text style={styles.moreSubjChipText}>+{extraSubjectsCount} more</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Expandable popup list of all subjects */}
                    {expandedSubjectsId === item.id && (
                      <View style={styles.expandedSubjPopup}>
                        <Text style={styles.expandedTitle}>All Subjects for {item.name}:</Text>
                        {item.subjects.map((s) => (
                          <Text key={s.id} style={styles.expandedItemText}>
                            • {s.name} {s.code ? `(${s.code})` : ''}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* 4. WEEKLY PERIODS COLUMN */}
                  <View style={[styles.td, { flex: 1.5 }]}>
                    <View style={styles.periodsRow}>
                      <Text style={{ fontSize: 14 }}>🗓️</Text>
                      <Text style={styles.periodsCountText}>{item.weeklyPeriods} Periods / Wk</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onNavigateToTimetable(item.id, item.name)}
                      activeOpacity={0.7}
                      style={{ marginTop: 4 }}
                    >
                      <Text style={styles.tableLinkText}>View Timetable →</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 5. PROGRESS COLUMN */}
                  <View style={[styles.td, { flex: 1.4, alignItems: 'center' }]}>
                    {renderProgressCircle(item.attendanceAvg)}
                  </View>

                  {/* 6. STATUS COLUMN */}
                  <View style={[styles.td, { flex: 1.1, alignItems: 'center' }]}>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'ACTIVE'
                          ? styles.statusActiveBadge
                          : styles.statusInactiveBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              item.status === 'ACTIVE' ? '#10B981' : '#EF4444',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          item.status === 'ACTIVE'
                            ? styles.statusActiveText
                            : styles.statusInactiveText,
                        ]}
                      >
                        {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  {/* 7. ACTIONS COLUMN */}
                  <View style={[styles.td, { flex: 0.8, alignItems: 'flex-end', position: 'relative' }]}>
                    <TouchableOpacity
                      style={styles.moreActionBtn}
                      onPress={() =>
                        setActiveMenuId(activeMenuId === item.id ? null : item.id)
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moreActionBtnText}>⋮</Text>
                    </TouchableOpacity>

                    {/* Action Dropdown Menu */}
                    {activeMenuId === item.id && (
                      <View style={styles.actionDropdown}>
                        <TouchableOpacity
                          style={styles.actionDropdownItem}
                          onPress={() => {
                            setActiveMenuId(null);
                            onViewClass(item);
                          }}
                        >
                          <Text style={styles.actionDropdownText}>👁️ View Class</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionDropdownItem}
                          onPress={() => {
                            setActiveMenuId(null);
                            onNavigateToStudents(item.id, item.name);
                          }}
                        >
                          <Text style={styles.actionDropdownText}>🎓 View Students</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionDropdownItem}
                          onPress={() => {
                            setActiveMenuId(null);
                            onNavigateToAttendance(item.id, item.name);
                          }}
                        >
                          <Text style={styles.actionDropdownText}>📊 View Attendance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionDropdownItem}
                          onPress={() => {
                            setActiveMenuId(null);
                            onNavigateToResults(item.id, item.name);
                          }}
                        >
                          <Text style={styles.actionDropdownText}>🏆 View Results</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionDropdownItem}
                          onPress={() => {
                            setActiveMenuId(null);
                            onNavigateToTimetable(item.id, item.name);
                          }}
                        >
                          <Text style={styles.actionDropdownText}>🗓️ View Timetable</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionDropdownItem, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}
                          onPress={() => {
                            setActiveMenuId(null);
                            onEditClass(item);
                          }}
                        >
                          <Text style={styles.actionDropdownText}>✏️ Edit Class</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionDropdownItem}
                          onPress={() => {
                            setActiveMenuId(null);
                            onToggleStatus(item);
                          }}
                        >
                          <Text
                            style={[
                              styles.actionDropdownText,
                              { color: item.status === 'ACTIVE' ? '#EA580C' : '#16A34A' },
                            ]}
                          >
                            {item.status === 'ACTIVE' ? '🚫 Deactivate Class' : '✅ Activate Class'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionDropdownItem, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}
                          onPress={() => {
                            setActiveMenuId(null);
                            onDeleteClass(item);
                          }}
                        >
                          <Text style={[styles.actionDropdownText, { color: '#DC2626' }]}>
                            🗑️ Delete Class
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Pagination Footer */}
      <View style={styles.paginationRow}>
        <Text style={styles.paginationInfo}>
          Showing {sortedClasses.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedClasses.length)} of {sortedClasses.length} classes
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
    overflow: 'visible',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  thRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
    zIndex: 1,
  },
  td: {
    justifyContent: 'center',
  },
  classBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classBadgeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#7C3AED',
  },
  classNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  classSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  teacherSubText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 2,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    position: 'relative',
  },
  stackAvatar: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  stackAvatarText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  studentCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  tableLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  chipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  subjChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreSubjChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moreSubjChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  expandedSubjPopup: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  expandedTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  expandedItemText: {
    fontSize: 11,
    color: '#475569',
  },
  periodsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodsCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  circleProgressWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleProgress: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleProgressVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  circleProgressValNA: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  circleProgressSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusActiveBadge: {
    backgroundColor: '#ECFDF5',
  },
  statusInactiveBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusActiveText: {
    color: '#059669',
  },
  statusInactiveText: {
    color: '#DC2626',
  },
  moreActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreActionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  actionDropdown: {
    position: 'absolute',
    right: 0,
    top: 36,
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 999,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  actionDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  actionDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
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
    fontSize: 12,
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
