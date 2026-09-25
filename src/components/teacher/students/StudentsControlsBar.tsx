import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export interface ClassOption {
  id: string;
  name: string;
  section?: string;
}

interface StudentsControlsBarProps {
  classes: ClassOption[];
  selectedClassId: string | null;
  onSelectClass: (classId: string | null) => void;
  sections: string[];
  selectedSection: string | null;
  onSelectSection: (section: string | null) => void;
  selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onSelectStatus: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddStudent: () => void;
}

export const StudentsControlsBar: React.FC<StudentsControlsBarProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  sections,
  selectedSection,
  onSelectSection,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onAddStudent,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.gridRow}>
        {/* 1. Class Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillWrap}>
              <TouchableOpacity
                style={[styles.pill, selectedClassId === null && styles.pillActive]}
                onPress={() => onSelectClass(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, selectedClassId === null && styles.pillTextActive]}>
                  All Classes
                </Text>
              </TouchableOpacity>

              {classes.map((cls) => {
                const active = cls.id === selectedClassId;
                return (
                  <TouchableOpacity
                    key={cls.id}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => onSelectClass(cls.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {cls.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 2. Section Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Section</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillWrap}>
              <TouchableOpacity
                style={[styles.pill, selectedSection === null && styles.pillActive]}
                onPress={() => onSelectSection(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, selectedSection === null && styles.pillTextActive]}>
                  All Sections
                </Text>
              </TouchableOpacity>

              {sections.map((sec) => {
                const active = sec === selectedSection;
                return (
                  <TouchableOpacity
                    key={sec}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => onSelectSection(sec)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      Section {sec}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 3. Status Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pillWrap}>
            <TouchableOpacity
              style={[styles.pill, selectedStatus === 'ALL' && styles.pillActive]}
              onPress={() => onSelectStatus('ALL')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, selectedStatus === 'ALL' && styles.pillTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, selectedStatus === 'ACTIVE' && styles.pillActive]}
              onPress={() => onSelectStatus('ACTIVE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, selectedStatus === 'ACTIVE' && styles.pillTextActive]}>
                Active
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, selectedStatus === 'INACTIVE' && styles.pillActive]}
              onPress={() => onSelectStatus('INACTIVE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, selectedStatus === 'INACTIVE' && styles.pillTextActive]}>
                Inactive
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Search Field */}
        <View style={[styles.filterGroup, { flex: 1.5, minWidth: 220 }]}>
          <Text style={styles.label}>Search Roster</Text>
          <View style={styles.searchWrap}>
            <Text style={{ fontSize: 13 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, roll number, or email..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>
        </View>

        {/* Add Student Button */}
        <TouchableOpacity style={styles.addBtn} onPress={onAddStudent} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Add Student</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
  },
  filterGroup: {
    flex: 1,
    minWidth: 160,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pillWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  addBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
