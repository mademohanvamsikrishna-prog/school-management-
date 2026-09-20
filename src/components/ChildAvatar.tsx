import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ChildAvatarProps {
  name?: string;
  size?: number;
  fontSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'solid' | 'subtle' | 'gray';
}

const PALETTES: Array<{ bg: string; text: string; subtleBg: string; subtleText: string }> = [
  { bg: '#4F46E5', text: '#FFFFFF', subtleBg: '#EEF2FF', subtleText: '#4F46E5' }, // Indigo (e.g., A)
  { bg: '#0D9488', text: '#FFFFFF', subtleBg: '#CCFBF1', subtleText: '#0F766E' }, // Teal (e.g., R)
  { bg: '#2563EB', text: '#FFFFFF', subtleBg: '#DBEAFE', subtleText: '#1D4ED8' }, // Blue
  { bg: '#7C3AED', text: '#FFFFFF', subtleBg: '#F3E8FF', subtleText: '#6D28D9' }, // Purple
  { bg: '#D97706', text: '#FFFFFF', subtleBg: '#FEF3C7', subtleText: '#B45309' }, // Amber
  { bg: '#DB2777', text: '#FFFFFF', subtleBg: '#FCE7F3', subtleText: '#BE185D' }, // Pink
  { bg: '#059669', text: '#FFFFFF', subtleBg: '#D1FAE5', subtleText: '#047857' }, // Emerald
];

export function getChildInitial(name?: string): string {
  if (!name || typeof name !== 'string') return 'C';
  const trimmed = name.trim();
  return (trimmed[0] || 'C').toUpperCase();
}

export function getChildColor(name?: string) {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

export const ChildAvatar: React.FC<ChildAvatarProps> = ({
  name = 'Child',
  size = 40,
  fontSize,
  style,
  textStyle,
  variant = 'solid',
}) => {
  const initial = getChildInitial(name);
  const palette = getChildColor(name);
  const calculatedFontSize = fontSize || Math.round(size * 0.44);

  let bg = palette.bg;
  let textColor = palette.text;

  if (variant === 'subtle') {
    bg = palette.subtleBg;
    textColor = palette.subtleText;
  } else if (variant === 'gray') {
    bg = '#E2E8F0';
    textColor = '#334155';
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initialText,
          {
            fontSize: calculatedFontSize,
            color: textColor,
            lineHeight: Math.round(calculatedFontSize * 1.15),
          },
          textStyle,
        ]}
      >
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
