import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile } from '../../services/profile';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { data: profile, loading } = useApi(getMyProfile);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        await logout();
        router.replace('/');
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="My Profile" showBack />
      <View style={styles.container}>
        {loading || !profile ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginBottom: SIZES.md }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>
                  {profile.name?.trim().split(' ')[0]?.[0]?.toUpperCase() || 'P'}
                </Text>
              </View>
              <View>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.role}>{profile.role.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.detail}>✉️ {profile.email}</Text>
            
            {profile.parent_profile && (
              <>
                <Text style={styles.sectionTitle}>Parent Details</Text>
                <Text style={styles.detail}>Occupation: {profile.parent_profile.occupation || 'N/A'}</Text>
                <Text style={styles.detail}>Alt Phone: {profile.parent_profile.alternate_phone || 'N/A'}</Text>
              </>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.md, alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: SIZES.lg, borderRadius: SIZES.md, width: '100%', elevation: 2 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: SIZES.xs },
  role: { fontSize: 14, color: COLORS.primary, fontWeight: '600', marginBottom: SIZES.md },
  detail: { fontSize: 16, color: COLORS.text, marginBottom: SIZES.sm },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: SIZES.md, marginBottom: SIZES.sm, color: COLORS.textDark },
  logoutButton: { 
    marginTop: SIZES.xl, 
    backgroundColor: COLORS.error, 
    paddingVertical: SIZES.sm, 
    borderRadius: SIZES.radiusSm, 
    alignItems: 'center' 
  },
  logoutText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
