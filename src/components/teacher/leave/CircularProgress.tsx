import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface CircularProgressProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 54,
  strokeWidth = 5,
  color,
  backgroundColor = '#F1F5F9',
  children,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * clampedProgress) / 100;

  if (Platform.OS === 'web') {
    return (
      <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <View style={styles.innerContent}>
          {children || (
            <Text style={[styles.progressText, { color }]}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Native fallback
  return (
    <View style={[styles.nativeCircle, { width: size, height: size, borderColor: color, borderWidth: strokeWidth }]}>
      <View style={styles.innerContent}>
        {children || (
          <Text style={[styles.progressText, { color }]}>
            {Math.round(clampedProgress)}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '800',
  },
  nativeCircle: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
