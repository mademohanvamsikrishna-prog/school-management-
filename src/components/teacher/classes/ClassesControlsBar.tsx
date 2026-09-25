import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

export type ClassTabType = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface ClassFilterOption {
  id: string;
  name: string;
  section?: string;
}

interface ClassesControlsBarProps {
  activeTab: ClassTabType;
  onTabChange: (tab: ClassTabType) => void;
  counts: { all: number; active: number; inactive: number };
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onAddClass: () => void;
  // Filters
  academicYear: string;
  onAcademicYearChange: (year: string) => void;
  classesList: ClassFilterOption[];
  selectedClassId: string | null;
  onSelectClass: (id: string | null) => void;
  sectionsList: string[];
  selectedSection: string | null;
  onSelectSection: (section: string | null) => void;
  selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onSelectStatus: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onResetFilters: () => void;
}

export const ClassesControlsBar: React.FC<ClassesControlsBarProps> = ({
  activeTab,
  onTabChange,
  counts,
  searchQuery,
  onSearchChange,
  onAddClass,
  academicYear,
  onAcademicYearChange,
  classesList,
  selectedClassId,
  onSelectClass,
  sectionsList,
  selectedSection,
  onSelectSection,
  selectedStatus,
  onSelectStatus,
  onResetFilters,
}) => {
  return (
    <View style={styles.wrapper}>
      {/* 1. TOP CONTROL ROW: TABS + SEARCH + ADD CLASS */}
      <View style={styles.topControlRow}>
        {/* Editorial Class Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'ALL' && styles.tabPillActive]}
            onPress={() => onTabChange('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
              All Classes ({counts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'ACTIVE' && styles.tabPillActive]}
            onPress={() => onTabChange('ACTIVE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
              Active ({counts.active})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, activeTab === 'INACTIVE' && styles.tabPillActive]}
            onPress={() => onTabChange('INACTIVE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'INACTIVE' && styles.tabTextActive]}>
              Inactive ({counts.inactive})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Search & Action Button */}
        <View style={styles.rightActionsRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search classes by name, section, or subject..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.addClassBtn} onPress={onAddClass} activeOpacity={0.85}>
            <Text style={styles.addClassBtnText}>+ Add Class</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. COMPACT OUTLINED FILTER BAR */}
      <View style={styles.filterToolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {/* Academic Year Selector */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Academic Year:</Text>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() =>
                onAcademicYearChange(
                  academicYear === '2025 – 2026' ? '2026 – 2027' : '2025 – 2026'
                )
              }
            >
              <Text style={styles.filterChipText}>{academicYear} ⇋</Text>
            </TouchableOpacity>
          </View>

          {/* Class Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Class:</Text>
            <TouchableOpacity
              style={[styles.filterChip, selectedClassId === null && styles.filterChipActive]}
              onPress={() => onSelectClass(null)}
            >
              <Text style={[styles.filterChipText, selectedClassId === null && styles.filterChipTextActive]}>
                All Classes
              </Text>
            </TouchableOpacity>
            {classesList.map((c) => {
              const active = c.id === selectedClassId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => onSelectClass(active ? null : c.id)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Section:</Text>
            <TouchableOpacity
              style={[styles.filterChip, selectedSection === null && styles.filterChipActive]}
              onPress={() => onSelectSection(null)}
            >
              <Text style={[styles.filterChipText, selectedSection === null && styles.filterChipTextActive]}>
                All Sections
              </Text>
            </TouchableOpacity>
            {sectionsList.map((sec) => {
              const active = sec === selectedSection;
              return (
                <TouchableOpacity
                  key={sec}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => onSelectSection(active ? null : sec)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    Sec {sec}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'ALL' && styles.filterChipActive]}
              onPress={() => onSelectStatus('ALL')}
            >
              <Text style={[styles.filterChipText, selectedStatus === 'ALL' && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'ACTIVE' && styles.filterChipActive]}
              onPress={() => onSelectStatus('ACTIVE')}
            >
              <Text style={[styles.filterChipText, selectedStatus === 'ACTIVE' && styles.filterChipTextActive]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === 'INACTIVE' && styles.filterChipActive]}
              onPress={() => onSelectStatus('INACTIVE')}
            >
              <Text style={[styles.filterChipText, selectedStatus === 'INACTIVE' && styles.filterChipTextActive]}>
                Inactive
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reset Filters */}
          <TouchableOpacity style={styles.resetBtn} onPress={onResetFilters} activeOpacity={0.8}>
            <Text style={styles.resetBtnText}>↺ Reset Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: 320,
  },
  searchBox: {
    flex: 1,
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  addClassBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  addClassBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  filterToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  resetBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});
