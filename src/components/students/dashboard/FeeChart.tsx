import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StudentDashboardData } from '../../../services/studentDashboard';

interface FeeChartProps {
  fees: StudentDashboardData['fees'];
}

const IS_WEB = Platform.OS === 'web';

function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

export const FeeChart: React.FC<FeeChartProps> = ({ fees }) => {
  const router = useRouter();
  const [hoveredSection, setHoveredSection] = useState<'paid' | 'remaining' | null>(null);

  const { total, paid, remaining, percentagePaid, currency, recentInvoiceTitle } = fees;

  // Donut geometry
  const size = 150;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const paidOffset = circumference - (percentagePaid / 100) * circumference;

  return (
    <View
      style={[styles.container, IS_WEB && (styles.webContainer as any)]}
      {...(IS_WEB ? { className: 'glass-panel' } : {})}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.titleIcon}>💳</Text>
            <Text style={styles.cardTitle}>Fee Breakdown & Dues</Text>
          </View>
          <Text style={styles.cardSubtitle}>Academic Year 2024-2025</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/students/fees')}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Invoices</Text>
          <Text style={styles.actionBtnArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content: Donut + Fee Breakdown */}
      <View style={styles.contentRow}>
        {/* Left: Animated Donut */}
        <View style={styles.chartCol}>
          <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {IS_WEB ? (
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
              >
                <defs>
                  <linearGradient id="paidFeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Track (Remaining dues) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth={strokeWidth}
                />

                {/* Remaining circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                  opacity={hoveredSection === 'remaining' ? 1 : 0.8}
                  onMouseEnter={() => setHoveredSection('remaining')}
                  onMouseLeave={() => setHoveredSection(null)}
                />

                {/* Paid circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="url(#paidFeeGrad)"
                  strokeWidth={strokeWidth + 2}
                  strokeDasharray={circumference}
                  strokeDashoffset={paidOffset}
                  strokeLinecap="round"
                  opacity={hoveredSection === 'paid' ? 1 : 0.95}
                  style={{
                    transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredSection('paid')}
                  onMouseLeave={() => setHoveredSection(null)}
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
              <Text style={styles.centerPct}>{percentagePaid}%</Text>
              <Text style={styles.centerLabel}>Paid</Text>
              <View style={styles.clearBadge}>
                <Text style={styles.clearBadgeText}>
                  {remaining === 0 ? 'Fully Cleared' : 'Installment Due'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right: Breakdown Cards */}
        <View style={styles.breakdownCol}>
          {/* Total fees */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>TOTAL ACADEMIC FEES</Text>
            <Text style={styles.totalAmountVal}>{formatCurrency(total, currency)}</Text>
          </View>

          {/* Paid vs Remaining tiles */}
          <View style={styles.tilesRow}>
            <View
              style={[
                styles.tile,
                styles.paidTile,
                hoveredSection === 'paid' && styles.tileActive,
              ]}
            >
              <View style={styles.tileHeader}>
                <View style={[styles.tileDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.tileLabel}>Paid</Text>
              </View>
              <Text style={[styles.tileAmount, { color: '#047857' }]}>
                {formatCurrency(paid, currency)}
              </Text>
              <Text style={styles.tileSub}>{percentagePaid}% of Total</Text>
            </View>

            <View
              style={[
                styles.tile,
                styles.remainingTile,
                hoveredSection === 'remaining' && styles.tileActive,
              ]}
            >
              <View style={styles.tileHeader}>
                <View style={[styles.tileDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.tileLabel}>Remaining</Text>
              </View>
              <Text style={[styles.tileAmount, { color: '#B45309' }]}>
                {formatCurrency(remaining, currency)}
              </Text>
              <Text style={styles.tileSub}>{100 - percentagePaid}% Balance</Text>
            </View>
          </View>

          {/* Pay dues quick button */}
          {remaining > 0 && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/students/fees')}
              style={styles.payNowBtn}
            >
              <Text style={styles.payNowIcon}>⚡</Text>
              <Text style={styles.payNowText}>Pay Pending Fees ({formatCurrency(remaining, currency)})</Text>
            </TouchableOpacity>
          )}
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
  centerPct: {
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
  clearBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  clearBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5',
  },
  breakdownCol: {
    flex: 1,
    minWidth: 240,
    gap: 10,
  },
  amountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  totalAmountVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  paidTile: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  remainingTile: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  tileActive: {
    transform: [{ scale: 1.02 }],
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tileDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  tileAmount: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tileSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  payNowIcon: {
    fontSize: 14,
  },
  payNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
