import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StudentsHeroBanner: React.FC = () => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>My Students</Text>
        <Text style={styles.subtitle}>
          View and manage students in your assigned classes.
        </Text>
      </View>
      <View style={styles.illustrationWrap}>
        <Text style={{ fontSize: 36 }}>🎓👨‍🏫✨</Text>
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
    paddingHorizontal: 28,
    paddingVertical: 24,
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
    fontSize: 40,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 6,
  },
  illustrationWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
});
