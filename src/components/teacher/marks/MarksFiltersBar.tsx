import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export interface ClassOption {
  id: string;
  name: string;
}

export interface ExamOption {
  id: string;
  name: string;
  term?: string;
  academic_year?: string;
}

interface MarksFiltersBarProps {
  classes: ClassOption[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  exams: ExamOption[];
  selectedExamId: string | null;
  onSelectExam: (id: string) => void;
  subjects: { id: string; name: string }[];
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
  academicYear: string;
  onSelectAcademicYear: (year: string) => void;
  onViewResults: () => void;
}

export const MarksFiltersBar: React.FC<MarksFiltersBarProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  exams,
  selectedExamId,
  onSelectExam,
  subjects,
  selectedSubjectId,
  onSelectSubject,
  academicYear,
  onSelectAcademicYear,
  onViewResults,
}) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.gridRow}>
        {/* 1. Class Selection */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillWrap}>
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

        {/* 2. Exam Selection */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Exam / Assessment</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillWrap}>
              {exams.map((ex) => {
                const active = ex.id === selectedExamId;
                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => onSelectExam(ex.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {ex.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 3. Subject Selection */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillWrap}>
              <TouchableOpacity
                style={[styles.pill, selectedSubjectId === null && styles.pillActive]}
                onPress={() => onSelectSubject(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, selectedSubjectId === null && styles.pillTextActive]}>
                  All Subjects
                </Text>
              </TouchableOpacity>

              {subjects.map((sub) => {
                const active = sub.id === selectedSubjectId;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => onSelectSubject(sub.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 4. Academic Year */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Academic Year</Text>
          <View style={styles.staticPill}>
            <Text style={styles.staticPillText}>{academicYear}</Text>
          </View>
        </View>

        {/* View Results Button */}
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={onViewResults}
          activeOpacity={0.85}
        >
          <Text style={styles.viewBtnText}>View Results →</Text>
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
  viewBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
