import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StudentDashboardData } from '../../../services/studentDashboard';

interface RankCardProps {
  rank: StudentDashboardData['rank'];
}

const IS_WEB = Platform.OS === 'web';

export const RankCard: React.FC<RankCardProps> = ({ rank }) => {
  const router = useRouter();

  const { current, totalStudents, percentile, trend, trendImproved, history } = rank;

  // Mini sparkline geometry for rank progression (lower number is higher on chart!)
  const width = 280;
  const height = 54;
  const paddingX = 24;
  const paddingY = 12;

  const minRank = Math.min(...history.map(h => h.rank), current);
  const maxRank = Math.max(...history.map(h => h.rank), current);
  const rankRange = Math.max(1, maxRank - minRank);

  // Inverted Y: rank 12 is at the top (smaller Y), rank 18 is at the bottom (larger Y)
  const points = history.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, history.length - 1)) * (width - 2 * paddingX);
    const normalized = (item.rank - minRank) / rankRange;
    const y = paddingY + normalized * (height - 2 * paddingY);
    return { ...item, x, y };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push('/students/results')}
      style={[styles.container, IS_WEB && (styles.webContainer as any)]}
      {...(IS_WEB ? { className: 'glass-panel glass-card-hover' } : {})}
    >
      {/* 3D gradient aura corner glow */}
      {IS_WEB && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.12) 0%, rgba(255,255,255,0) 70%)',
            borderTopRightRadius: '20px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.titleIcon}>🏆</Text>
          <View>
            <Text style={styles.cardTitle}>Class Standing & Rank</Text>
            <Text style={styles.cardSubtitle}>Based on overall percentile</Text>
          </View>
        </View>

        <View style={styles.percentileBadge}>
          <Text style={styles.percentileText}>Top {100 - percentile}%</Text>
        </View>
      </View>

      {/* Main Stats Row */}
      <View style={styles.mainRow}>
        {/* Left: Big Rank */}
        <View style={styles.rankLeft}>
          <View style={styles.rankNumberRow}>
            <Text style={styles.rankHash}>#</Text>
            <Text style={styles.rankNumber}>{current}</Text>
            <Text style={styles.rankTotal}>/ {totalStudents}</Text>
          </View>
          <Text style={styles.rankCaption}>Students in Section</Text>

          <View
            style={[
              styles.trendPill,
              { backgroundColor: trendImproved ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <Text
              style={[
                styles.trendPillText,
                { color: trendImproved ? '#047857' : '#B91C1C' },
              ]}
            >
              {trend} this semester
            </Text>
          </View>
        </View>

        {/* Right: Progression Trend Sparkline */}
        <View style={styles.sparklineCol}>
          <Text style={styles.sparklineTitle}>RANK PROGRESSION</Text>

          <View style={styles.sparklineWrapper}>
            {IS_WEB ? (
              <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="rankLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>

                {/* Connecting Polyline */}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="url(#rankLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Nodes with Rank Numbers */}
                {points.map((p, idx) => {
                  const isLatest = idx === points.length - 1;
                  return (
                    <g key={p.semester}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isLatest ? 5.5 : 4}
                        fill={isLatest ? '#4F46E5' : '#FFFFFF'}
                        stroke={isLatest ? '#818CF8' : '#94A3B8'}
                        strokeWidth="2"
                      />
                      <text
                        x={p.x}
                        y={p.y - 7}
                        fontSize="10"
                        fontWeight={isLatest ? '800' : '600'}
                        fill={isLatest ? '#4F46E5' : '#64748B'}
                        textAnchor="middle"
                      >
                        #{p.rank}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <View style={styles.mobileHistoryRow}>
                {history.map((h, i) => (
                  <Text key={h.semester} style={styles.mobileHistoryText}>
                    {h.semester}: #{h.rank} {i < history.length - 1 ? '→ ' : ''}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Step chain text: 18 → 15 → 14 → 12 */}
          <View style={styles.stepChainRow}>
            {history.map((h, idx) => (
              <React.Fragment key={h.semester}>
                <Text
                  style={[
                    styles.stepNode,
                    idx === history.length - 1 && styles.stepNodeActive,
                  ]}
                >
                  #{h.rank}
                </Text>
                {idx < history.length - 1 && (
                  <Text style={styles.stepArrow}>→</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    position: 'relative',
    overflow: 'hidden',
  },
  webContainer: {
    animation: 'fadeIn 1s ease-out',
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
  percentileBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  percentileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
  },
  rankLeft: {
    minWidth: 160,
  },
  rankNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  rankHash: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4F46E5',
  },
  rankNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  rankTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  rankCaption: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  trendPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sparklineCol: {
    flex: 1,
    minWidth: 260,
  },
  sparklineTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sparklineWrapper: {
    height: 54,
    width: '100%',
  },
  mobileHistoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  mobileHistoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  stepChainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  stepNode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepNodeActive: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },
  stepArrow: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
  },
});
