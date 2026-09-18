import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StudentDashboardData } from '../../../services/studentDashboard';

interface AssignmentChartProps {
  assignments: StudentDashboardData['assignments'];
}

const IS_WEB = Platform.OS === 'web';

export const AssignmentChart: React.FC<AssignmentChartProps> = ({ assignments }) => {
  const router = useRouter();
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const { completed, pending, overdue, submitted, total, urgentTitle } = assignments;

  // Geometry for SVG Donut
  const size = 150;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentages and stroke offsets
  const safeTotal = Math.max(1, total);
  const compPct = Math.round((completed / safeTotal) * 100);
  const submPct = Math.round((submitted / safeTotal) * 100);
  const pendPct = Math.round((pending / safeTotal) * 100);
  const overPct = Math.max(0, 100 - compPct - submPct - pendPct);

  const compOffset = circumference - (compPct / 100) * circumference;
  const submOffset = circumference - ((compPct + submPct) / 100) * circumference;
  const pendOffset = circumference - ((compPct + submPct + pendPct) / 100) * circumference;

  const categories = [
    { key: 'completed', label: 'Completed', count: completed, pct: compPct, color: '#10B981', bg: '#ECFDF5' },
    { key: 'submitted', label: 'Submitted', count: submitted, pct: submPct, color: '#0284C7', bg: '#F0F9FF' },
    { key: 'pending',   label: 'Pending',   count: pending,   pct: pendPct, color: '#F59E0B', bg: '#FFFBEB' },
    { key: 'overdue',   label: 'Overdue',   count: overdue,   pct: overPct, color: '#EF4444', bg: '#FEF2F2' },
  ];

  return (
    <View
      style={[styles.container, IS_WEB && (styles.webContainer as any)]}
      {...(IS_WEB ? { className: 'glass-panel' } : {})}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.titleIcon}>📋</Text>
            <Text style={styles.cardTitle}>Assignment Statistics</Text>
          </View>
          <Text style={styles.cardSubtitle}>Current coursework & lab submissions</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/students/assignments')}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Open All</Text>
          <Text style={styles.actionBtnArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Charts + Legend Row */}
      <View style={styles.contentRow}>
        {/* Left: Donut Chart */}
        <View style={styles.chartCol}>
          <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {IS_WEB ? (
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
              >
                {/* Background track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />

                {/* Overdue slice (bottom layer) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                  opacity={hoveredSegment === 'overdue' ? 1 : 0.85}
                  onMouseEnter={() => setHoveredSegment('overdue')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* Pending slice */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={pendOffset}
                  opacity={hoveredSegment === 'pending' ? 1 : 0.85}
                  onMouseEnter={() => setHoveredSegment('pending')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* Submitted slice */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={submOffset}
                  opacity={hoveredSegment === 'submitted' ? 1 : 0.85}
                  onMouseEnter={() => setHoveredSegment('submitted')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* Completed slice (topmost) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={strokeWidth + 1}
                  strokeDasharray={circumference}
                  strokeDashoffset={compOffset}
                  strokeLinecap="round"
                  opacity={hoveredSegment === 'completed' ? 1 : 0.95}
                  style={{ transition: 'all 0.5s ease' }}
                  onMouseEnter={() => setHoveredSegment('completed')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              </svg>
            ) : (
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderColor: '#10B981',
                  position: 'absolute',
                }}
              />
            )}

            {/* Center Display */}
            <View style={styles.centerContent}>
              <Text style={styles.centerVal}>{total}</Text>
              <Text style={styles.centerLabel}>Assignments</Text>
              <Text style={styles.centerCompPct}>{compPct}% Done</Text>
            </View>
          </View>
        </View>

        {/* Right: Legend Breakdown Grid */}
        <View style={styles.legendCol}>
          <View style={styles.legendGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.8}
                onPress={() => router.push('/students/assignments')}
                style={[
                  styles.legendCard,
                  { backgroundColor: cat.bg },
                  hoveredSegment === cat.key && styles.legendCardHover,
                ]}
              >
                <View style={styles.legendTop}>
                  <View style={[styles.statusDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </View>
                <View style={styles.legendBottom}>
                  <Text style={[styles.catCount, { color: cat.color }]}>{cat.count}</Text>
                  <Text style={styles.catPct}>{cat.pct}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Urgent assignment callout */}
          {overdue > 0 || pending > 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/students/assignments')}
              style={styles.urgentNotice}
            >
              <Text style={styles.urgentIcon}>⏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.urgentTitle}>Upcoming Deadline</Text>
                <Text style={styles.urgentText}>{urgentTitle || 'Pending assignment due soon'}</Text>
              </View>
              <Text style={styles.urgentAction}>Submit →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
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
    animation: 'fadeIn 0.9s ease-out',
  },
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  chartCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 170,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerVal: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -2,
  },
  centerCompPct: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  legendCol: {
    flex: 1,
    minWidth: 240,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  legendCard: {
    flex: 1,
    minWidth: 110,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  legendCardHover: {
    borderColor: 'rgba(79, 70, 229, 0.4)',
    transform: [{ scale: 1.02 }],
  },
  legendTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  legendBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  catCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  catPct: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  urgentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
  },
  urgentIcon: {
    fontSize: 16,
  },
  urgentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  urgentText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '500',
  },
  urgentAction: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
});
