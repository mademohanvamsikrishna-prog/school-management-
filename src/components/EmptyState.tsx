import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '📦',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
  },
  icon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  description: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
