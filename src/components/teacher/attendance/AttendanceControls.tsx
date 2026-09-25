import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export interface ClassOption {
  id: string;
  name: string;
  student_count: number;
}

interface AttendanceControlsProps {
  classes: ClassOption[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
  onReset: () => void;
  loadingClasses?: boolean;
}

export const AttendanceControls: React.FC<AttendanceControlsProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  selectedDate,
  onDateChange,
  onMarkAllPresent,
  onMarkAllAbsent,
  onReset,
  loadingClasses,
}) => {
  return (
    <View style={styles.controlsContainer}>
      <View style={styles.leftControls}>
        {/* Select Class Selector */}
        <View style={styles.controlBox}>
          <Text style={styles.controlLabel}>Select Class</Text>
          {loadingClasses ? (
            <Text style={styles.loadingText}>Loading classes...</Text>
          ) : classes.length === 0 ? (
            <Text style={styles.loadingText}>No classes assigned</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.classChips}>
                {classes.map((cls) => {
                  const active = cls.id === selectedClassId;
                  return (
                    <TouchableOpacity
                      key={cls.id}
                      style={[styles.classChip, active && styles.classChipActive]}
                      onPress={() => onSelectClass(cls.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 14 }}>👥</Text>
                      <Text style={[styles.classChipText, active && styles.classChipTextActive]}>
                        {cls.name}
                      </Text>
                      <Text style={[styles.classCountText, active && { color: '#EDE9FE' }]}>
                        ({cls.student_count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Select Date Control */}
        <View style={styles.controlBox}>
          <Text style={styles.controlLabel}>Select Date</Text>
          <View style={styles.datePickerWrap}>
            <Text style={{ fontSize: 16 }}>📅</Text>
            <Text style={styles.dateText}>{selectedDate}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Card */}
      <View style={styles.quickActionsCard}>
        <Text style={styles.controlLabel}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnPresent]}
            onPress={onMarkAllPresent}
            activeOpacity={0.8}
          >
            <Text style={styles.btnIcon}>✓</Text>
            <Text style={styles.btnTextPresent}>Mark All Present</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnAbsent]}
            onPress={onMarkAllAbsent}
            activeOpacity={0.8}
          >
            <Text style={styles.btnIcon}>✕</Text>
            <Text style={styles.btnTextAbsent}>Mark All Absent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnReset]}
            onPress={onReset}
            activeOpacity={0.8}
          >
            <Text style={styles.btnIcon}>🔄</Text>
            <Text style={styles.btnTextReset}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  leftControls: {
    flex: 1.2,
    minWidth: 300,
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  controlBox: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  classChips: {
    flexDirection: 'row',
    gap: 8,
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  classChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  classChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  classChipTextActive: {
    color: '#FFFFFF',
  },
  classCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  datePickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionsCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 6,
  },
  btnPresent: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  btnTextPresent: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },
  btnAbsent: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  btnTextAbsent: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '800',
  },
  btnReset: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnTextReset: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  btnIcon: {
    fontSize: 12,
    fontWeight: '800',
  },
});
