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
  const { data: profile, loading, error } = useApi(getMyProfile);
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
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <View style={styles.card}>
            <Text style={[styles.detail, { color: COLORS.error }]}>{error.message}</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
              <Text style={styles.logoutText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        ) : !profile ? (
          <View style={styles.card}>
            <Text style={styles.detail}>Profile not found.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.role}>{profile.role.toUpperCase()}</Text>
            <Text style={styles.detail}>{profile.email}</Text>
            
            {profile.teacher_profile && (
              <>
                <Text style={styles.sectionTitle}>Employment Details</Text>
                <Text style={styles.detail}>Emp ID: {profile.teacher_profile.employee_id}</Text>
                <Text style={styles.detail}>Department: {profile.teacher_profile.department}</Text>
                <Text style={styles.detail}>Designation: {profile.teacher_profile.designation}</Text>
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
