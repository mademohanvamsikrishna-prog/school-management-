import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  style?: ViewStyle;
  showBack?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  avatarUrl,
  style,
  showBack,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.name?.trim() || '';
  const firstName = userName.split(' ')[0] || '';
  const initial = (firstName[0] || userName[0] || 'P').toUpperCase();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.notification}>
          <Text style={styles.bell}>🔔</Text>
          <View style={styles.badge} />
        </View>
        {userName ? (
          <View style={styles.userPill}>
            <View style={styles.initialAvatar}>
              <Text style={styles.initialText}>{initial}</Text>
            </View>
            <Text style={styles.userNameText} numberOfLines={1}>{userName}</Text>
          </View>
        ) : avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    ...SHADOWS.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SIZES.sm,
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textDark,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.textDark,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  notification: {
    position: 'relative',
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  bell: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
  },
  initialAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    includeFontPadding: false,
  },
  userNameText: {
    ...FONTS.body2,
    color: COLORS.textDark,
    fontWeight: '600',
    fontSize: 13,
  },
});
