import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface DashboardSectionProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  actionText,
  onAction,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {actionText && (
          <Text style={styles.actionText} onPress={onAction}>
            {actionText}
          </Text>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.textDark,
  },
  actionText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: SIZES.md,
  },
});
