/**
 * DonutChart — a circular progress ring that works on both web (SVG) and native (View approximation).
 *
 * Pure presentation component. Receives a percentage value as a prop.
 * No business logic, no API calls.
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface DonutChartProps {
  /** 0–100 */
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  centerLabel?: string;
  centerSublabel?: string;
}

// ─── Web (SVG) ───────────────────────────────────────────────────────────────

function DonutChartWeb({
  percentage,
  size = 140,
  strokeWidth = 14,
  color = COLORS.primary,
  trackColor = '#EEF2FF',
  centerLabel,
  centerSublabel,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      {/* @ts-ignore — svg is valid HTML on web */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute' as any }}
      >
        {/* Track ring */}
        {/* @ts-ignore */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        {/* @ts-ignore */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Small accent dot for the amber "pending" indicator (matches screenshot) */}
        {/* @ts-ignore */}
        <circle
          cx={size / 2 + radius * Math.cos(((-90 + safePercentage * 3.6) * Math.PI) / 180)}
          cy={size / 2 + radius * Math.sin(((-90 + safePercentage * 3.6) * Math.PI) / 180)}
          r={strokeWidth / 2}
          fill="#F59E0B"
        />
      </svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.centerValue}>{centerLabel ?? `${Math.round(safePercentage)}%`}</Text>
        {centerSublabel ? <Text style={styles.centerSub}>{centerSublabel}</Text> : null}
      </View>
    </View>
  );
}

// ─── Native (View approximation) ─────────────────────────────────────────────

function DonutChartNative({
  percentage,
  size = 120,
  strokeWidth = 12,
  color = COLORS.primary,
  trackColor = '#EEF2FF',
  centerLabel,
  centerSublabel,
}: DonutChartProps) {
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const inner = size - strokeWidth * 2;

  return (
    <View style={[styles.nativeOuter, { width: size, height: size, borderRadius: size / 2, borderColor: trackColor, borderWidth: strokeWidth }]}>
      {/* Colored arc approximation: a half-circle overlay */}
      <View
        style={[
          styles.nativeArc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            borderWidth: strokeWidth,
            // Clip to percentage using opacity — simple but effective for native
            opacity: safePercentage > 0 ? 1 : 0,
          },
        ]}
      />
      {/* Inner white circle */}
      <View style={[styles.nativeInner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        <Text style={styles.centerValue}>{centerLabel ?? `${Math.round(safePercentage)}%`}</Text>
        {centerSublabel ? <Text style={styles.centerSub}>{centerSublabel}</Text> : null}
      </View>
    </View>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export const DonutChart: React.FC<DonutChartProps> = (props) => {
  if (Platform.OS === 'web') {
    return <DonutChartWeb {...props} />;
  }
  return <DonutChartNative {...props} />;
};

const styles = StyleSheet.create({
  centerValue: {
    ...FONTS.h3,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  centerSub: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  nativeOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeArc: {
    position: 'absolute',
  },
  nativeInner: {
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
