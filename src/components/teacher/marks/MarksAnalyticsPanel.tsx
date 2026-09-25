import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SubjectPerf {
  subjectName: string;
  average: number;
}

interface TopPerformer {
  id: string;
  name: string;
  rollNumber: string;
  scorePct: number;
  grade: string;
}

interface GradeDistItem {
  grade: string;
  count: number;
  percentage: number;
}

interface RecentExamItem {
  id: string;
  name: string;
  className: string;
  date: string;
  status: 'Published' | 'Draft' | 'Scheduled';
}

interface MarksAnalyticsPanelProps {
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  totalStudents: number;
  subjectPerformances: SubjectPerf[];
  gradeDistributions: GradeDistItem[];
  topPerformers: TopPerformer[];
  recentExams?: RecentExamItem[];
}

export const MarksAnalyticsPanel: React.FC<MarksAnalyticsPanelProps> = ({
  classAverage,
  highestScore,
  lowestScore,
  passRate,
  totalStudents,
  subjectPerformances,
  gradeDistributions,
  topPerformers,
  recentExams = [
    { id: '1', name: 'Mid-Term Examination', className: 'Class 10-A', date: 'Sep 24, 2026', status: 'Published' },
    { id: '2', name: 'Unit Test 2', className: 'Class 10-A', date: 'Aug 15, 2026', status: 'Published' },
    { id: '3', name: 'Final Semester Exam', className: 'Class 10-A', date: 'Oct 10, 2026', status: 'Scheduled' },
  ],
}) => {
  return (
    <View style={styles.container}>
      {/* 1. CLASS PERFORMANCE GAUGE CARD (Part 14) */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>CLASS PERFORMANCE</Text>

        <View style={styles.gaugeCenter}>
          <View style={styles.gaugeCircleOuter}>
            <View style={styles.gaugeCircleInner}>
              <Text style={styles.gaugeValueText}>
                {totalStudents > 0 ? `${classAverage.toFixed(1)}%` : '0.0%'}
              </Text>
              <Text style={styles.gaugeLabelText}>Class Average</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Highest</Text>
            <Text style={[styles.metricVal, { color: '#10B981' }]}>{highestScore}%</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Lowest</Text>
            <Text style={[styles.metricVal, { color: '#EF4444' }]}>{lowestScore}%</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Pass Rate</Text>
            <Text style={[styles.metricVal, { color: '#7C3AED' }]}>{passRate.toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      {/* 2. SUBJECT PERFORMANCE BAR CARD (Part 15) */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>SUBJECT PERFORMANCE</Text>
        <View style={styles.subjectList}>
          {subjectPerformances.length === 0 ? (
            <Text style={styles.emptyText}>No subject performance data available</Text>
          ) : (
            subjectPerformances.map((sub, idx) => {
              const barWidth = `${Math.min(100, Math.max(0, sub.average))}%` as `${number}%`;
              const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
              const color = colors[idx % colors.length];

              return (
                <View key={sub.subjectName} style={styles.subjectItem}>
                  <View style={styles.subjectMetaRow}>
                    <Text style={styles.subjectName}>{sub.subjectName}</Text>
                    <Text style={styles.subjectAvg}>{sub.average.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: barWidth, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* 3. GRADE DISTRIBUTION CARD (Part 16) */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitle}>GRADE DISTRIBUTION</Text>
          <Text style={styles.totalBadgeText}>{totalStudents} Students</Text>
        </View>
        <View style={styles.distList}>
          {gradeDistributions.length === 0 ? (
            <Text style={styles.emptyText}>No grade distribution data available</Text>
          ) : (
            gradeDistributions.map((g) => {
              const barWidth = `${Math.min(100, Math.max(0, g.percentage))}%` as `${number}%`;
              return (
                <View key={g.grade} style={styles.distItem}>
                  <View style={styles.gradeBox}>
                    <Text style={styles.gradeBoxText}>{g.grade}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.distTrack}>
                      <View style={[styles.distBar, { width: barWidth }]} />
                    </View>
                  </View>
                  <Text style={styles.distCountText}>
                    {g.count} ({g.percentage.toFixed(0)}%)
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* 4. TOP PERFORMERS CARD (Part 17) */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitle}>TOP PERFORMERS</Text>
          <Text style={{ fontSize: 16 }}>🏆</Text>
        </View>

        <View style={styles.performersList}>
          {topPerformers.length === 0 ? (
            <Text style={styles.emptyText}>No rankings calculated yet</Text>
          ) : (
            topPerformers.slice(0, 3).map((tp, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const bgColors = ['#FEF3C7', '#F1F5F9', '#FFEDD5'];

              return (
                <View key={tp.id} style={styles.performerItem}>
                  <View style={[styles.rankMedal, { backgroundColor: bgColors[idx] }]}>
                    <Text style={{ fontSize: 14 }}>{medals[idx]}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.performerName} numberOfLines={1}>
                      {tp.name}
                    </Text>
                    <Text style={styles.performerSub}>Roll #{tp.rollNumber} • Grade {tp.grade}</Text>
                  </View>

                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{tp.scorePct.toFixed(1)}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* 5. RECENT RESULTS CARD (Part 18) */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>RECENT RESULTS</Text>
        <View style={styles.recentList}>
          {recentExams.map((ex) => (
            <View key={ex.id} style={styles.recentItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{ex.name}</Text>
                <Text style={styles.recentSub}>
                  {ex.className} • {ex.date}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  ex.status === 'Published'
                    ? styles.statusPublished
                    : ex.status === 'Draft'
                    ? styles.statusDraft
                    : styles.statusScheduled,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    ex.status === 'Published'
                      ? styles.statusPublishedText
                      : ex.status === 'Draft'
                      ? styles.statusDraftText
                      : styles.statusScheduledText,
                  ]}
                >
                  {ex.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 16,
  },
  gaugeCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  gaugeCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gaugeCircleInner: {
    alignItems: 'center',
  },
  gaugeValueText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  gaugeLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  subjectList: {
    gap: 14,
  },
  subjectItem: {
    gap: 6,
  },
  subjectMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  subjectAvg: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  distList: {
    gap: 10,
  },
  distItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradeBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBoxText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  distTrack: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  distBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 5,
  },
  distCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    minWidth: 60,
    textAlign: 'right',
  },
  performersList: {
    gap: 12,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  rankMedal: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  performerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  scoreBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  recentSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPublished: { backgroundColor: '#D1FAE5' },
  statusPublishedText: { color: '#059669', fontSize: 11, fontWeight: '800' },
  statusDraft: { backgroundColor: '#FEF3C7' },
  statusDraftText: { color: '#D97706', fontSize: 11, fontWeight: '800' },
  statusScheduled: { backgroundColor: '#EFF6FF' },
  statusScheduledText: { color: '#2563EB', fontSize: 11, fontWeight: '800' },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
