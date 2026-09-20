import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StudentDashboardData } from '../../../services/studentDashboard';

interface AttendanceChartProps {
  attendance: StudentDashboardData['attendance'];
}

const IS_WEB = Platform.OS === 'web';

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ attendance }) => {
  const router = useRouter();
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const overallPct = attendance.overall;
  const attendedPct = attendance.attended;
  const absentPct = attendance.absent;

  // Donut geometry
  const size = 170;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const attendedOffset = circumference - (attendedPct / 100) * circumference;

  // Check for any subject below 75% threshold
  const warningSubjects = attendance.subjects.filter(s => s.percentage < 75 || s.warning);

  return (
    <View
      style={[styles.container, IS_WEB && (styles.webContainer as any)]}
      {...(IS_WEB ? { className: 'glass-panel' } : {})}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.titleIcon}>📊</Text>
            <Text style={styles.cardTitle}>Attendance Overview</Text>
          </View>
          <Text style={styles.cardSubtitle}>Academic session 2024-25</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/students/attendance')}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Full Log</Text>
          <Text style={styles.actionBtnArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Main Charts Area: Donut on Left, Subject Bars on Right */}
      <View style={styles.bodyGrid}>
        {/* Left: Interactive Donut */}
        <View style={styles.donutSection}>
          <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {IS_WEB ? (
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
              >
                <defs>
                  <linearGradient id="attendedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Background track (Absent ring) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />

                {/* Absent slice */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                  opacity={hoveredSlice === 'absent' ? 1 : 0.8}
                  style={{ transition: 'opacity 0.2s ease' }}
                  onMouseEnter={() => setHoveredSlice('absent')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />

                {/* Attended slice */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="url(#attendedGrad)"
                  strokeWidth={strokeWidth + 2}
                  strokeDasharray={circumference}
                  strokeDashoffset={attendedOffset}
                  strokeLinecap="round"
                  filter="url(#glowEffect)"
                  opacity={hoveredSlice === 'attended' ? 1 : 0.95}
                  style={{
                    transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredSlice('attended')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              </svg>
            ) : (
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderColor: '#4F46E5',
                  position: 'absolute',
                }}
              />
            )}

            {/* Donut Center Display */}
            <View style={styles.donutCenterContent}>
              <Text style={styles.donutCenterPct}>{overallPct}%</Text>
              <Text style={styles.donutCenterLabel}>Present</Text>
              <View
                style={[
                  styles.donutStatusBadge,
                  { backgroundColor: overallPct >= 75 ? '#ECFDF5' : '#FEF2F2' },
                ]}
              >
                <Text
                  style={[
                    styles.donutStatusText,
                    { color: overallPct >= 75 ? '#047857' : '#B91C1C' },
                  ]}
                >
                  {attendance.statusText}
                </Text>
              </View>
            </View>
          </View>

          {/* Slices Legend */}
          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendItem,
                hoveredSlice === 'attended' && styles.legendItemActive,
              ]}
            >
              <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
              <Text style={styles.legendLabel}>Attended</Text>
              <Text style={styles.legendValue}>{attendedPct}%</Text>
            </View>

            <View
              style={[
                styles.legendItem,
                hoveredSlice === 'absent' && styles.legendItemActive,
              ]}
            >
              <View style={[styles.legendDot, { backgroundColor: '#F43F5E' }]} />
              <Text style={styles.legendLabel}>Absent</Text>
              <Text style={styles.legendValue}>{absentPct}%</Text>
            </View>
          </View>

          <Text style={styles.daysBreakdown}>
            {attendance.presentDays} days present of {attendance.totalDays} academic sessions
          </Text>
        </View>

        {/* Right: Subject-wise Breakdown */}
        <View style={styles.subjectsSection}>
          <View style={styles.subjectsHeader}>
            <Text style={styles.subjectsTitle}>SUBJECT-WISE ATTENDANCE</Text>
            <Text style={styles.subjectsRequirement}>Target: 75% Min</Text>
          </View>

          <View style={styles.subjectList}>
            {attendance.subjects.map((sub, index) => {
              const isWarning = sub.percentage < 75 || sub.warning;
              const barColor = isWarning
                ? '#EF4444'
                : sub.percentage >= 90
                ? '#10B981'
                : '#4F46E5';

              return (
                <View key={sub.name || index} style={styles.subjectRow}>
                  <View style={styles.subjectInfoRow}>
                    <View style={styles.subjectNameWrap}>
                      <Text style={styles.subjectName}>{sub.name}</Text>
                      <Text style={styles.subjectCode}>{sub.code}</Text>
                    </View>

                    <View style={styles.subjectPctWrap}>
                      {isWarning && <Text style={styles.subWarnIcon}>⚠️</Text>}
                      <Text
                        style={[
                          styles.subjectPct,
                          { color: isWarning ? '#EF4444' : '#0F172A' },
                        ]}
                      >
                        {sub.percentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress track */}
                  <View style={styles.subjectTrack}>
                    <View
                      style={[
                        styles.subjectFill,
                        {
                          width: `${Math.min(100, Math.max(0, sub.percentage))}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                    {/* 75% threshold guide marker */}
                    <View style={styles.thresholdMarker} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Threshold Warning Banner (Required by Section 5) */}
      {warningSubjects.length > 0 && (
        <View style={styles.warningAlertBox}>
          <Text style={styles.warningAlertIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningAlertTitle}>
              {warningSubjects.map(s => s.name).join(', ')} attendance is below 75%!
            </Text>
            <Text style={styles.warningAlertBody}>
              University regulations require a minimum 75% attendance for examination eligibility. Please consult your course instructor.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 24,
    flex: 1,
  },
  webContainer: {
    animation: 'fadeIn 0.7s ease-out',
  } as any,
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  actionBtnArrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  bodyGrid: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  donutSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    flex: 1,
    paddingVertical: 8,
  },
  donutCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  donutCenterPct: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  donutCenterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -2,
    marginBottom: 4,
  },
  donutStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  donutStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  legendItemActive: {
    backgroundColor: '#F1F5F9',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  daysBreakdown: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  subjectsSection: {
    flex: 1.4,
    minWidth: 260,
    justifyContent: 'center',
  },
  subjectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  subjectsRequirement: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  subjectList: {
    gap: 12,
  },
  subjectRow: {},
  subjectInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  subjectNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  subjectCode: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  subjectPctWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subWarnIcon: {
    fontSize: 11,
  },
  subjectPct: {
    fontSize: 13,
    fontWeight: '700',
  },
  subjectTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  subjectFill: {
    height: '100%',
    borderRadius: 4,
  },
  thresholdMarker: {
    position: 'absolute',
    left: '75%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  warningAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
  },
  warningAlertIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  warningAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  warningAlertBody: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B91C1C',
    lineHeight: 16,
  },
});
