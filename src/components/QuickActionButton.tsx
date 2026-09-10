import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

interface QuickActionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  title,
  icon,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.sm,
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    ...SHADOWS.small,
  },
  icon: {
    fontSize: 26,
    marginBottom: SIZES.sm,
  },
  title: {
    ...FONTS.caption,
    color: COLORS.textDark,
    textAlign: 'center',
    fontWeight: '600',
  },
});
