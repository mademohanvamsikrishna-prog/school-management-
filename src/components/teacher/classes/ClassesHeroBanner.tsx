import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ClassesHeroBanner: React.FC = () => {
  return (
    <View style={styles.heroContainer}>
      {/* Left Content */}
      <View style={styles.leftContent}>
        <View style={styles.badgeRow}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTagText}>ACADEMIC SESSION 2025–2026</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>My Classes</Text>
        <Text style={styles.heroSubtitle}>
          Manage your assigned classes, view students, subjects, timetable and class activities in one unified workspace.
        </Text>
      </View>

      {/* Right Illustration & Motivational Quote */}
      <View style={styles.rightContent}>
        {/* Soft Illustrated Classroom Badge */}
        <View style={styles.illustrationCard}>
          <View style={styles.illustrationVisual}>
            <Text style={styles.illustrationArt}>👩‍🏫 📚 📐 🎒 🏫</Text>
          </View>
          <View style={styles.quoteCard}>
            <Text style={styles.quoteIcon}>✨</Text>
            <View>
              <Text style={styles.quoteText}>&ldquo;Great classes create</Text>
              <Text style={styles.quoteTextBold}>great learners.&rdquo;</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    minHeight: 145,
  },
  leftContent: {
    flex: 1,
    minWidth: 320,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C3AED',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
    maxWidth: 560,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  illustrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  illustrationVisual: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  illustrationArt: {
    fontSize: 22,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 6,
  },
  quoteIcon: {
    fontSize: 18,
  },
  quoteText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 16,
  },
  quoteTextBold: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '800',
    fontStyle: 'normal',
    lineHeight: 16,
  },
});
