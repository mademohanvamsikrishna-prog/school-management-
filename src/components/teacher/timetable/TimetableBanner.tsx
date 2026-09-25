import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TimetableBanner: React.FC = () => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>My Timetable</Text>
        <Text style={styles.subtitle}>
          View your weekly teaching schedule and manage your classes.
        </Text>
      </View>
      <View style={styles.illustrationWrap}>
        <Text style={{ fontSize: 36 }}>📅🗓️✨</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  textWrap: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  illustrationWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
});
