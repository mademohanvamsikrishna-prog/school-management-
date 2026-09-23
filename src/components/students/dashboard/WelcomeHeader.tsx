import React from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../../constants/theme';
import { StudentDashboardData } from '../../../services/studentDashboard';

interface WelcomeHeaderProps {
  student: StudentDashboardData['student'];
  onProfilePress?: () => void;
}

const IS_WEB = Platform.OS === 'web';

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ student, onProfilePress }) => {
  return (
    <View
      style={[styles.container, IS_WEB && (styles.webContainer as any)]}
      {...(IS_WEB ? { className: 'glass-panel' } : {})}
    >
      {/* Decorative gradient blur backdrop circles on web */}
      {IS_WEB && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-30px',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              filter: 'blur(10px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: '20%',
              width: '140px',
              height: '140px',
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%, rgba(14, 165, 233, 0) 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              filter: 'blur(8px)',
            }}
          />
        </>
      )}

      <View style={styles.contentRow}>
        {/* Left: Avatar with layered 3D glow & scale animation */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onProfilePress}
          style={[
            styles.avatarWrapper,
            IS_WEB && ({ animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' } as any),
          ]}
        >
          <View style={styles.avatarRing}>
            {student.avatar ? (
              <Image source={{ uri: student.avatar }} style={styles.avatarImage as any} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{student.firstName[0] || 'S'}</Text>
              </View>
            )}
          </View>
          <View style={styles.onlineBadge} />
        </TouchableOpacity>

        {/* Center: Greeting & Info */}
        <View
          style={[
            styles.infoCol,
            IS_WEB && ({ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' } as any),
          ]}
        >
          <View style={styles.topPillRow}>
            <View style={styles.datePill}>
              <Text style={styles.datePillIcon}>📅</Text>
              <Text style={styles.datePillText}>{student.currentDate}</Text>
            </View>
            <View style={styles.academicPill}>
              <Text style={styles.academicPillDot}>●</Text>
              <Text style={styles.academicPillText}>AY {student.academicYear}</Text>
            </View>
          </View>

          <Text style={styles.greetingTitle}>{student.greeting}</Text>
          <Text style={styles.greetingSubtitle}>Here&apos;s your academic overview for today.</Text>

          {/* Academic meta badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.metaBadge, styles.classBadge]}>
              <Text style={styles.metaBadgeIcon}>🏫</Text>
              <Text style={styles.metaBadgeText}>{student.class}</Text>
            </View>

            <View style={[styles.metaBadge, styles.sectionBadge]}>
              <Text style={styles.metaBadgeIcon}>📌</Text>
              <Text style={styles.metaBadgeText}>Sec {student.section}</Text>
            </View>

            <View style={[styles.metaBadge, styles.rollBadge]}>
              <Text style={styles.metaBadgeIcon}>🆔</Text>
              <Text style={styles.metaBadgeText}>Roll #{student.rollNumber}</Text>
            </View>

            <View style={[styles.metaBadge, styles.statusBadge]}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusBadgeText}>Active Standing</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  webContainer: {
    animation: 'fadeIn 0.5s ease-out',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
  } as any,
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    backgroundColor: '#EEF2FF',
    borderWidth: 2.5,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E0E7FF',
  },
  avatarFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    minWidth: 260,
  },
  topPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  datePillIcon: {
    fontSize: 12,
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  academicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  academicPillDot: {
    fontSize: 8,
    color: '#4F46E5',
  },
  academicPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  classBadge: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  sectionBadge: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  rollBadge: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  metaBadgeIcon: {
    fontSize: 12,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  statusDot: {
    fontSize: 8,
    color: '#10B981',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
});
