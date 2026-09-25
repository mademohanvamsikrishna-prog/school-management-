import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ClassesTeachingBannerProps {
  onExploreTeachingTools: () => void;
}

export const ClassesTeachingBanner: React.FC<ClassesTeachingBannerProps> = ({
  onExploreTeachingTools,
}) => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.leftInfo}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>💡 TEACHER PRODUCTIVITY & TOOLS</Text>
        </View>
        <Text style={styles.bannerTitle}>Create Better Learning Experiences</Text>
        <Text style={styles.bannerSubtitle}>
          Manage your classes, track progress, assign homework, and engage with your students more effectively.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={onExploreTeachingTools}
        activeOpacity={0.85}
      >
        <Text style={styles.exploreBtnText}>Explore Teaching Tools →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  leftInfo: {
    flex: 1,
    minWidth: 280,
  },
  badgeRow: {
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    maxWidth: 580,
  },
  exploreBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
