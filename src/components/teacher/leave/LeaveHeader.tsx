import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LeaveHeaderProps {
  onNewRequestClick: () => void;
}

export const LeaveHeader: React.FC<LeaveHeaderProps> = ({ onNewRequestClick }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Left side: Icon + Titles */}
      <View style={styles.leftGroup}>
        <View style={styles.iconCircle}>
          <Text style={styles.headerIcon}>🗓️</Text>
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.mainTitle}>Leave Applications</Text>
          <Text style={styles.subTitle}>
            Manage your leave requests, check balances and track approvals
          </Text>
        </View>
      </View>

      {/* Right side: Primary Action Button */}
      <TouchableOpacity
        style={styles.newRequestBtn}
        onPress={onNewRequestClick}
        activeOpacity={0.85}
      >
        <Text style={styles.plusIcon}>＋</Text>
        <Text style={styles.newRequestText}>New Leave Request</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 16,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    minWidth: 280,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  headerIcon: {
    fontSize: 24,
  },
  titleWrap: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  newRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  newRequestText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
