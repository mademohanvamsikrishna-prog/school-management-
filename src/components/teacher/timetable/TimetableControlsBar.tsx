import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export interface ClassOption {
  id: string;
  name: string;
}

interface TimetableControlsBarProps {
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  classes: ClassOption[];
  selectedClassId: string | null;
  onSelectClass: (classId: string | null) => void;
  academicYear: string;
  onSelectAcademicYear: (year: string) => void;
}

export const TimetableControlsBar: React.FC<TimetableControlsBarProps> = ({
  weekLabel,
  onPrevWeek,
  onNextWeek,
  onToday,
  classes,
  selectedClassId,
  onSelectClass,
  academicYear,
  onSelectAcademicYear,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.gridRow}>
        {/* 1. Week Controls */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Week Schedule</Text>
          <View style={styles.weekNavRow}>
            <TouchableOpacity style={styles.arrowBtn} onPress={onPrevWeek} activeOpacity={0.8}>
              <Text style={styles.arrowTxt}>◀</Text>
            </TouchableOpacity>

            <View style={styles.weekLabelBox}>
              <Text style={styles.weekLabelTxt}>{weekLabel}</Text>
            </View>

            <TouchableOpacity style={styles.arrowBtn} onPress={onNextWeek} activeOpacity={0.8}>
              <Text style={styles.arrowTxt}>▶</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.todayBtn} onPress={onToday} activeOpacity={0.8}>
              <Text style={styles.todayBtnTxt}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Class Dropdown Filter */}
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

        {/* 3. Academic Year */}
        <View style={[styles.filterGroup, { maxWidth: 160 }]}>
          <Text style={styles.label}>Academic Year</Text>
          <View style={styles.staticPill}>
            <Text style={styles.staticPillText}>{academicYear}</Text>
          </View>
        </View>
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
    minWidth: 200,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  weekNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  arrowTxt: {
    fontSize: 12,
    color: '#334155',
  },
  weekLabelBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
  },
  weekLabelTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  todayBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  todayBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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
  staticPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  staticPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
});
