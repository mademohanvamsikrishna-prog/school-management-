import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../../../constants/theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'purple' | 'neutral';
  icon: string;
  colorScheme: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple';
  visualIndicator?: {
    type: 'progress' | 'trend' | 'gauge';
    progressPct?: number;
    trendText?: string;
    trendPositive?: boolean;
    secondaryText?: string;
  };
  animationDelay?: number;
  onPress?: () => void;
}

const COLOR_MAP = {
  indigo: {
    accent: '#4F46E5',
    iconBg: '#EEF2FF',
    borderHover: 'rgba(79, 70, 229, 0.4)',
    glow: 'rgba(79, 70, 229, 0.12)',
    badgeBg: '#EEF2FF',
    badgeText: '#4338CA',
  },
  emerald: {
    accent: '#10B981',
    iconBg: '#ECFDF5',
    borderHover: 'rgba(16, 185, 129, 0.4)',
    glow: 'rgba(16, 185, 129, 0.12)',
    badgeBg: '#ECFDF5',
    badgeText: '#047857',
  },
  amber: {
    accent: '#F59E0B',
    iconBg: '#FFFBEB',
    borderHover: 'rgba(245, 158, 11, 0.4)',
    glow: 'rgba(245, 158, 11, 0.12)',
    badgeBg: '#FEF3C7',
    badgeText: '#B45309',
  },
  cyan: {
    accent: '#0284C7',
    iconBg: '#F0F9FF',
    borderHover: 'rgba(2, 132, 199, 0.4)',
    glow: 'rgba(2, 132, 199, 0.12)',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
  },
  purple: {
    accent: '#8B5CF6',
    iconBg: '#F5F3FF',
    borderHover: 'rgba(139, 92, 246, 0.4)',
    glow: 'rgba(139, 92, 246, 0.12)',
    badgeBg: '#EDE9FE',
    badgeText: '#6D28D9',
  },
};

const IS_WEB = Platform.OS === 'web';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  badgeText,
  badgeType = 'info',
  icon,
  colorScheme,
  visualIndicator,
  animationDelay = 0,
  onPress,
}) => {
  const colors = COLOR_MAP[colorScheme] || COLOR_MAP.indigo;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        IS_WEB && (styles.webContainer as any),
        IS_WEB && ({
          animation: `slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${animationDelay}s forwards`,
          opacity: 0,
          animationFillMode: 'forwards',
        } as any),
      ]}
      {...(IS_WEB ? { className: 'glass-panel glass-card-hover' } : {})}
    >
      {/* 3D gradient aura corner glow on web */}
      {IS_WEB && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '90px',
            height: '90px',
            background: `radial-gradient(circle at top right, ${colors.glow} 0%, rgba(255,255,255,0) 70%)`,
            borderTopRightRadius: '16px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header: Icon & Category title */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>

        <View style={[styles.iconBox, { backgroundColor: colors.iconBg }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      </View>

      {/* Big Value Row */}
      <View style={styles.valueRow}>
        <Text style={[styles.valueText, { color: '#0F172A' }]}>
          {value}
        </Text>
        {unit ? <Text style={styles.unitText}>{unit}</Text> : null}

        {badgeText && (
          <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.badgeText, { color: colors.badgeText }]}>{badgeText}</Text>
          </View>
        )}
      </View>

      {/* Visual Indicator: Progress Bar or Trend */}
      {visualIndicator && (
        <View style={styles.indicatorContainer}>
          {visualIndicator.type === 'progress' && (
            <>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.max(0, visualIndicator.progressPct ?? 0))}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
              {visualIndicator.secondaryText && (
                <View style={styles.indicatorMetaRow}>
                  <Text style={styles.indicatorSecondaryText}>{visualIndicator.secondaryText}</Text>
                  <Text style={[styles.indicatorPctText, { color: colors.accent }]}>
                    {visualIndicator.progressPct}%
                  </Text>
                </View>
              )}
            </>
          )}

          {visualIndicator.type === 'trend' && (
            <View style={styles.trendRow}>
              <View
                style={[
                  styles.trendPill,
                  {
                    backgroundColor: visualIndicator.trendPositive !== false ? '#ECFDF5' : '#FEF2F2',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.trendPillText,
                    {
                      color: visualIndicator.trendPositive !== false ? '#047857' : '#B91C1C',
                    },
                  ]}
                >
                  {visualIndicator.trendText}
                </Text>
              </View>
              {visualIndicator.secondaryText && (
                <Text style={styles.trendSecondaryText}>{visualIndicator.secondaryText}</Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Subtle bottom arrow hint on web */}
      <View style={styles.footerRow}>
        <Text style={styles.viewDetailsText}>View details</Text>
        <Text style={styles.arrowIcon}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    minWidth: 200,
  },
  webContainer: {
    boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
  } as any,
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  indicatorContainer: {
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  indicatorMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorSecondaryText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  indicatorPctText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trendSecondaryText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
});
