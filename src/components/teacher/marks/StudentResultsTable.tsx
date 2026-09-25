import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export interface StudentResultItem {
  id: string;
  name: string;
  rollNumber: string;
  email?: string;
  subjectMarks: Record<string, { marks: number; maxMarks: number; grade: string }>;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  hasMarks: boolean;
  status: 'PASS' | 'NEEDS_IMPROVEMENT' | 'FAIL' | 'ABSENT' | 'NO_MARKS';
}

interface StudentResultsTableProps {
  students: StudentResultItem[];
  subjects: { id: string; name: string }[];
  onEditStudentMarks: (studentId: string) => void;
  onViewStudentCard: (studentId: string) => void;
  onOpenEnterMarks: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type TabFilter = 'ALL' | 'PASSED' | 'NEEDS_IMPROVEMENT' | 'ABSENT' | 'UNMARKED';

export const StudentResultsTable: React.FC<StudentResultsTableProps> = ({
  students,
  subjects,
  onEditStudentMarks,
  onViewStudentCard,
  onOpenEnterMarks,
  searchQuery,
  onSearchChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered by tab and search query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Tab filter
      if (activeTab === 'PASSED' && s.status !== 'PASS') return false;
      if (activeTab === 'NEEDS_IMPROVEMENT' && s.status !== 'NEEDS_IMPROVEMENT') return false;
      if (activeTab === 'ABSENT' && s.status !== 'ABSENT') return false;
      if (activeTab === 'UNMARKED' && s.hasMarks) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchRoll = s.rollNumber.toLowerCase().includes(q);
        if (!matchName && !matchRoll) return false;
      }

      return true;
    });
  }, [students, activeTab, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const counts = { ALL: students.length, PASSED: 0, NEEDS_IMPROVEMENT: 0, ABSENT: 0, UNMARKED: 0 };
    students.forEach((s) => {
      if (!s.hasMarks) {
        counts.UNMARKED++;
      } else if (s.status === 'PASS') {
        counts.PASSED++;
      } else if (s.status === 'NEEDS_IMPROVEMENT') {
        counts.NEEDS_IMPROVEMENT++;
      } else if (s.status === 'ABSENT') {
        counts.ABSENT++;
      }
    });
    return counts;
  }, [students]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const getStatusBadge = (item: StudentResultItem) => {
    if (!item.hasMarks) {
      return (
        <View style={[styles.badge, styles.badgeUnmarked]}>
          <Text style={styles.badgeUnmarkedText}>NO MARKS</Text>
        </View>
      );
    }
    switch (item.status) {
      case 'PASS':
        return (
          <View style={[styles.badge, styles.badgePass]}>
            <Text style={styles.badgePassText}>PASS</Text>
          </View>
        );
      case 'NEEDS_IMPROVEMENT':
        return (
          <View style={[styles.badge, styles.badgeWarn]}>
            <Text style={styles.badgeWarnText}>NEEDS IMPR.</Text>
          </View>
        );
      case 'FAIL':
        return (
          <View style={[styles.badge, styles.badgeFail]}>
            <Text style={styles.badgeFailText}>FAIL</Text>
          </View>
        );
      case 'ABSENT':
        return (
          <View style={[styles.badge, styles.badgeAbsent]}>
            <Text style={styles.badgeAbsentText}>ABSENT</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, styles.badgeUnmarked]}>
            <Text style={styles.badgeUnmarkedText}>NO MARKS</Text>
          </View>
        );
    }
  };

  const getGradeStyle = (hasMarks: boolean, grade: string) => {
    if (!hasMarks || grade === '—') return { bg: '#F1F5F9', color: '#64748B' };
    if (grade.startsWith('A')) return { bg: '#F5F3FF', color: '#7C3AED' };
    if (grade.startsWith('B')) return { bg: '#EFF6FF', color: '#2563EB' };
    if (grade.startsWith('C')) return { bg: '#FEF3C7', color: '#D97706' };
    return { bg: '#FEE2E2', color: '#DC2626' };
  };

  const allUnmarked = students.length > 0 && students.every((s) => !s.hasMarks);

  return (
    <View style={styles.container}>
      {/* Header & Tabs */}
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
            style={[styles.tabBtn, activeTab === 'PASSED' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('PASSED'); setCurrentPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === 'PASSED' && styles.tabTextActive]}>
              Passed ({tabCounts.PASSED})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'NEEDS_IMPROVEMENT' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('NEEDS_IMPROVEMENT'); setCurrentPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === 'NEEDS_IMPROVEMENT' && styles.tabTextActive]}>
              Needs Improvement ({tabCounts.NEEDS_IMPROVEMENT})
            </Text>
          </TouchableOpacity>

          {tabCounts.UNMARKED > 0 && (
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'UNMARKED' && styles.tabBtnActive]}
              onPress={() => { setActiveTab('UNMARKED'); setCurrentPage(1); }}
            >
              <Text style={[styles.tabText, activeTab === 'UNMARKED' && styles.tabTextActive]}>
                Unmarked ({tabCounts.UNMARKED})
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ABSENT' && styles.tabBtnActive]}
            onPress={() => { setActiveTab('ABSENT'); setCurrentPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === 'ABSENT' && styles.tabTextActive]}>
              Absent ({tabCounts.ABSENT})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Table Search */}
        <View style={styles.inlineSearchWrap}>
          <Text style={{ fontSize: 13 }}>🔍</Text>
          <TextInput
            style={styles.inlineSearchInput}
            placeholder="Search roster..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {/* Part 22: Empty State Banner if no marks entered yet across class */}
      {allUnmarked && (
        <View style={styles.noMarksBanner}>
          <Text style={{ fontSize: 24 }}>📝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noMarksTitle}>No marks entered yet for this assessment</Text>
            <Text style={styles.noMarksSub}>
              Students will show &lsquo;NO MARKS&rsquo; until marks are saved. Click Enter Marks to add scores.
            </Text>
          </View>
          <TouchableOpacity style={styles.enterMarksBtnInline} onPress={onOpenEnterMarks}>
            <Text style={styles.enterMarksBtnInlineText}>Enter Marks</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Table Content */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ minWidth: 850 }}>
          {/* Table Header */}
          <View style={styles.thRow}>
            <Text style={[styles.th, { flex: 2.2 }]}>STUDENT NAME</Text>
            <Text style={[styles.th, { flex: 1 }]}>ROLL NO</Text>

            {subjects.length > 0 ? (
              subjects.map((sub) => (
                <Text key={sub.id} style={[styles.th, { flex: 1.2, textAlign: 'center' }]}>
                  {sub.name.toUpperCase()}
                </Text>
              ))
            ) : (
              <Text style={[styles.th, { flex: 2, textAlign: 'center' }]}>SUBJECT MARKS</Text>
            )}

            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>TOTAL</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>%</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>GRADE</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'center' }]}>STATUS</Text>
            <Text style={[styles.th, { flex: 1.4, textAlign: 'right' }]}>ACTIONS</Text>
          </View>

          {/* Table Rows */}
          {paginatedStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 32 }}>📋</Text>
              <Text style={styles.emptyTitle}>No student results found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or search query.</Text>
            </View>
          ) : (
            paginatedStudents.map((item, idx) => {
              const gradeStyle = getGradeStyle(item.hasMarks, item.overallGrade);
              const isEven = idx % 2 === 0;

              return (
                <View
                  key={item.id}
                  style={[styles.trRow, isEven ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F8FAFC' }]}
                >
                  {/* Student Info */}
                  <View style={[styles.td, { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.studentSub} numberOfLines={1}>
                        {item.email ?? `Roll #${item.rollNumber}`}
                      </Text>
                    </View>
                  </View>

                  {/* Roll Number */}
                  <Text style={[styles.tdText, { flex: 1 }]}>{item.rollNumber || '—'}</Text>

                  {/* Dynamic Subjects or Subject Marks summary */}
                  {subjects.length > 0 ? (
                    subjects.map((sub) => {
                      const sm = item.subjectMarks[sub.id];
                      return (
                        <View key={sub.id} style={[styles.td, { flex: 1.2, alignItems: 'center' }]}>
                          {sm && sm.marks !== undefined ? (
                            <Text style={styles.markCellText}>
                              {sm.marks} <Text style={styles.markCellSub}>/ {sm.maxMarks}</Text>
                            </Text>
                          ) : (
                            <Text style={styles.tdMuted}>—</Text>
                          )}
                        </View>
                      );
                    })
                  ) : (
                    <Text style={[styles.tdText, { flex: 2, textAlign: 'center' }]}>
                      {item.hasMarks ? `${item.totalMarksObtained} / ${item.totalMaxMarks}` : '—'}
                    </Text>
                  )}

                  {/* Total */}
                  <Text style={[styles.tdBold, { flex: 1, textAlign: 'center' }]}>
                    {item.hasMarks ? item.totalMarksObtained : '—'}
                  </Text>

                  {/* Percentage */}
                  <Text style={[styles.tdBold, { flex: 1, textAlign: 'center' }]}>
                    {item.hasMarks ? `${item.percentage.toFixed(1)}%` : '—'}
                  </Text>

                  {/* Grade */}
                  <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                    <View style={[styles.gradeBadge, { backgroundColor: gradeStyle.bg }]}>
                      <Text style={[styles.gradeBadgeText, { color: gradeStyle.color }]}>
                        {item.hasMarks ? item.overallGrade : '—'}
                      </Text>
                    </View>
                  </View>

                  {/* Status */}
                  <View style={[styles.td, { flex: 1.2, alignItems: 'center' }]}>
                    {getStatusBadge(item)}
                  </View>

                  {/* Actions */}
                  <View style={[styles.td, { flex: 1.4, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }]}>
                    <TouchableOpacity
                      style={styles.actionBtnEdit}
                      onPress={() => onEditStudentMarks(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtnView}
                      onPress={() => onViewStudentCard(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>👁️</Text>
                    </TouchableOpacity>
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
          Showing {filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} entries
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
  inlineSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    minWidth: 180,
  },
  inlineSearchInput: {
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
    flex: 1,
  },
  noMarksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    gap: 12,
  },
  noMarksTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  noMarksSub: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  enterMarksBtnInline: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  enterMarksBtnInlineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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
  tdMuted: {
    fontSize: 13,
    color: '#94A3B8',
  },
  avatar: {
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
  markCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  markCellSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePass: { backgroundColor: '#D1FAE5' },
  badgePassText: { color: '#059669', fontSize: 11, fontWeight: '800' },
  badgeWarn: { backgroundColor: '#FEF3C7' },
  badgeWarnText: { color: '#D97706', fontSize: 11, fontWeight: '800' },
  badgeFail: { backgroundColor: '#FEE2E2' },
  badgeFailText: { color: '#DC2626', fontSize: 11, fontWeight: '800' },
  badgeAbsent: { backgroundColor: '#F1F5F9' },
  badgeAbsentText: { color: '#64748B', fontSize: 11, fontWeight: '800' },
  badgeUnmarked: { backgroundColor: '#F1F5F9' },
  badgeUnmarkedText: { color: '#64748B', fontSize: 11, fontWeight: '800' },
  actionBtnEdit: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnView: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
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
