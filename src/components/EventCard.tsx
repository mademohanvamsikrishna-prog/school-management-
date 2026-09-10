import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { StatusBadge } from './StatusBadge';

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  style?: ViewStyle;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  time,
  location,
  type,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <StatusBadge status={type} type="info" />
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.detailText}>{date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.icon}>⏰</Text>
          <Text style={styles.detailText}>{time}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.detailText}>{location}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  title: {
    ...FONTS.h4,
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.sm,
  },
  details: {
    gap: SIZES.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  icon: {
    fontSize: 14,
  },
  detailText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
});
