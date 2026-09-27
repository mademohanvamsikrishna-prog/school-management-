import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircularProgress } from './CircularProgress';

export interface LeaveBalances {
  sickRemaining: number;
  sickTotal: number;
  casualRemaining: number;
  casualTotal: number;
  pendingCount: number;
  personalUsed: number;
  personalTotal: number;
}

interface LeaveBalanceCardsProps {
  balances: LeaveBalances;
}

export const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({ balances }) => {
  const sickPercent = Math.round((balances.sickRemaining / balances.sickTotal) * 100);
  const casualPercent = Math.round((balances.casualRemaining / balances.casualTotal) * 100);
  const pendingPercent = balances.pendingCount > 0 ? Math.min(100, balances.pendingCount * 33) : 0;
  const personalPercent = Math.round((balances.personalUsed / balances.personalTotal) * 100);

  const CARDS = [
    {
      id: 'sick',
      title: 'Sick Leave',
      value: `${balances.sickRemaining} / ${balances.sickTotal}`,
      subtext: 'remaining',
      icon: '🩺',
      progress: sickPercent,
      theme: {
        accent: '#10B981',
        iconBg: '#ECFDF5',
        iconBorder: '#A7F3D0',
        track: '#E2E8F0',
        bg: '#FFFFFF',
        pillBg: '#ECFDF5',
        pillText: '#065F46',
      },
    },
    {
      id: 'casual',
      title: 'Casual Leave',
      value: `${balances.casualRemaining} / ${balances.casualTotal}`,
      subtext: 'remaining',
      icon: '🌴',
      progress: casualPercent,
      theme: {
        accent: '#F59E0B',
        iconBg: '#FFFBEB',
        iconBorder: '#FDE68A',
        track: '#E2E8F0',
        bg: '#FFFFFF',
        pillBg: '#FFFBEB',
        pillText: '#92400E',
      },
    },
    {
      id: 'pending',
      title: 'Pending Requests',
      value: `${balances.pendingCount}`,
      subtext: 'awaiting approval',
      icon: '⏳',
      progress: pendingPercent || 40,
      theme: {
        accent: '#8B5CF6',
        iconBg: '#F5F3FF',
        iconBorder: '#DDD6FE',
        track: '#E2E8F0',
        bg: '#FFFFFF',
        pillBg: '#F5F3FF',
        pillText: '#5B21B6',
      },
    },
    {
      id: 'personal',
      title: 'Personal Leave',
      value: `${balances.personalUsed} / ${balances.personalTotal}`,
      subtext: 'used',
      icon: '📄',
      progress: personalPercent,
      theme: {
        accent: '#3B82F6',
        iconBg: '#EFF6FF',
        iconBorder: '#BFDBFE',
        track: '#E2E8F0',
        bg: '#FFFFFF',
        pillBg: '#EFF6FF',
        pillText: '#1E40AF',
      },
    },
  ];

  return (
    <View style={styles.gridContainer}>
      {CARDS.map((card) => (
        <View key={card.id} style={[styles.card, { backgroundColor: card.theme.bg }]}>
          {/* Top Row: Icon container + Circular Progress */}
          <View style={styles.topRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: card.theme.iconBg, borderColor: card.theme.iconBorder },
              ]}
            >
              <Text style={styles.iconText}>{card.icon}</Text>
            </View>

            <CircularProgress
              progress={card.progress}
              size={56}
              strokeWidth={5}
              color={card.theme.accent}
              backgroundColor={card.theme.track}
            />
          </View>

          {/* Bottom Info */}
          <View style={styles.infoSection}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <View style={styles.valueRow}>
              <Text style={styles.cardValue}>{card.value}</Text>
              <View style={[styles.pillBadge, { backgroundColor: card.theme.pillBg }]}>
                <Text style={[styles.pillText, { color: card.theme.pillText }]}>
                  {card.subtext}
                </Text>
              </View>
            </View>
          </View>

          {/* Subtle Decorative Background Accent */}
          <View
            style={[
              styles.cornerShape,
              { borderColor: card.theme.iconBorder, opacity: 0.35 },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minWidth: 240,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  infoSection: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    flexWrap: 'wrap',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cornerShape: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
  },
});
