import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface StatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'default',
  style,
}) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: `${COLORS.success}20`, text: COLORS.success };
      case 'warning':
        return { bg: `${COLORS.warning}20`, text: COLORS.warning };
      case 'error':
        return { bg: `${COLORS.error}20`, text: COLORS.error };
      case 'info':
        return { bg: `${COLORS.info}20`, text: COLORS.info };
      default:
        return { bg: COLORS.border, text: COLORS.textSecondary };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusRound,
    alignSelf: 'flex-start',
  },
  text: {
    ...FONTS.caption,
    fontWeight: '600',
  },
});
