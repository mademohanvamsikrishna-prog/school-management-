import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StudentDashboardData } from '../../../services/studentDashboard';

interface AcademicChartProps {
  academics: StudentDashboardData['academics'];
}

const IS_WEB = Platform.OS === 'web';

export const AcademicChart: React.FC<AcademicChartProps> = ({ academics }) => {
  const router = useRouter();
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const history = academics.semesterHistory || [];

  // SVG Chart Geometry
  const width = 420;
  const height = 180;
  const paddingX = 45;
  const paddingY = 30;

  const minCgpa = 6.0;
  const maxCgpa = 10.0;

  // Calculate coordinates for points
  const points = history.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, history.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (item.cgpa - minCgpa) / (maxCgpa - minCgpa);
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { ...item, x, y };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = points.length > 0
    ? `${points[0].x},${height - paddingY} ${polylinePoints} ${points[points.length - 1].x},${height - paddingY}`
    : '';

  return (
    <View
      style={[styles.container, IS_WEB && (styles.webContainer as any)]}
      {...(IS_WEB ? { className: 'glass-panel' } : {})}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.titleIcon}>📈</Text>
            <Text style={styles.cardTitle}>Academic & CGPA Progression</Text>
          </View>
          <Text style={styles.cardSubtitle}>Semester-by-semester cumulative grade point</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/students/results')}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Full Report</Text>
          <Text style={styles.actionBtnArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Metric Highlights Strip */}
      <View style={styles.metricsStrip}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CURRENT CGPA</Text>
          <View style={styles.metricValRow}>
            <Text style={styles.metricVal}>{academics.cgpa}</Text>
            <Text style={styles.metricMax}>/ 10</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>PREVIOUS SEM</Text>
          <Text style={styles.metricValMuted}>{academics.prevSemesterCgpa}</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>GROWTH TREND</Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>{academics.cgpaTrend}</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>PERFORMANCE</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{academics.status}</Text>
          </View>
        </View>
      </View>

      {/* SVG Line Chart Container */}
      <View style={styles.chartWrapper}>
        {IS_WEB ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="cgpaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="cgpaLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>

              <filter id="lineShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[6, 7, 8, 9, 10].map((level) => {
              const normalizedY = (level - minCgpa) / (maxCgpa - minCgpa);
              const y = height - paddingY - normalizedY * (height - 2 * paddingY);
              return (
                <g key={level}>
                  <line
                    x1={paddingX - 10}
                    y1={y}
                    x2={width - paddingX + 10}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray={level === 10 ? '0' : '4 4'}
                  />
                  <text
                    x={paddingX - 16}
                    y={y + 3}
                    fill="#94A3B8"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {level.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Filled area gradient */}
            {areaPoints ? (
              <polygon
                points={areaPoints}
                fill="url(#cgpaAreaGrad)"
                style={{ transition: 'all 0.5s ease' }}
              />
            ) : null}

            {/* Polyline */}
            {polylinePoints ? (
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="url(#cgpaLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lineShadow)"
                style={{
                  strokeDasharray: 800,
                  strokeDashoffset: 0,
                  animation: 'drawStroke 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />
            ) : null}

            {/* Data Points */}
            {points.map((p, idx) => {
              const isHovered = activePoint === idx;
              return (
                <g
                  key={p.semester}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActivePoint(idx)}
                  onMouseLeave={() => setActivePoint(null)}
                >
                  {/* Outer glow ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 8 : 6}
                    fill="#FFFFFF"
                    stroke="#8B5CF6"
                    strokeWidth={isHovered ? 3.5 : 2.5}
                    style={{ transition: 'all 0.2s ease' }}
                  />

                  {/* Inner dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={2.5}
                    fill="#4F46E5"
                  />

                  {/* Bottom semester label */}
                  <text
                    x={p.x}
                    y={height - 8}
                    fill={isHovered ? '#4F46E5' : '#64748B'}
                    fontSize="11"
                    fontWeight={isHovered ? '700' : '600'}
                    textAnchor="middle"
                  >
                    {p.semester.replace('Semester', 'Sem')}
                  </text>

                  {/* CGPA tooltip badge */}
                  <g
                    transform={`translate(${p.x}, ${p.y - 14})`}
                    style={{
                      opacity: isHovered || idx === points.length - 1 ? 1 : 0.85,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <rect
                      x="-22"
                      y="-18"
                      width="44"
                      height="18"
                      rx="6"
                      fill={isHovered ? '#1E1B4B' : '#4F46E5'}
                    />
                    <text
                      x="0"
                      y="-5"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {p.cgpa}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        ) : (
          <View style={styles.mobileFallbackWrap}>
            {history.map(item => (
              <View key={item.semester} style={styles.mobileRow}>
                <Text style={styles.mobileSemText}>{item.semester}</Text>
                <Text style={styles.mobileCgpaText}>{item.cgpa} / 10</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom hint */}
      <View style={styles.footerRow}>
        <Text style={styles.footerNotice}>
          💡 CGPA is computed across all university examinations and accredited coursework.
        </Text>
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
    animation: 'fadeIn 0.8s ease-out',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: -0.4,
  },
  metricMax: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  metricValMuted: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  trendBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  tierBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  chartWrapper: {
    height: 190,
    width: '100%',
    position: 'relative',
    marginVertical: 4,
  },
  mobileFallbackWrap: {
    padding: 12,
    gap: 8,
  },
  mobileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileSemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  mobileCgpaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
    marginTop: 6,
  },
  footerNotice: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
