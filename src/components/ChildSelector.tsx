import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { Student } from '../types/models';

interface ChildSelectorProps {
  childrenList: Student[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
  style?: ViewStyle;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  childrenList,
  selectedChildId,
  onSelectChild,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>My Children</Text>
      <View style={styles.list}>
        {childrenList.map((child) => {
          const isSelected = child.id === selectedChildId;
          return (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childCard,
                isSelected && styles.selectedCard,
              ]}
              onPress={() => onSelectChild(child.id)}
            >
              <Image source={{ uri: child.avatarUrl }} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={[styles.name, isSelected && styles.selectedText]}>
                  {child.name}
                </Text>
                <Text style={[styles.className, isSelected && styles.selectedText]}>
                  {child.className}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  list: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: SIZES.md,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.sm,
    borderRadius: SIZES.radius,
    flex: 1,
    ...SHADOWS.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SIZES.sm,
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
  },
  name: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  className: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
  },
  selectedText: {
    color: COLORS.primary,
  },
});
