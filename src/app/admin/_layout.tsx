/**
 * Admin section layout.
 * Only 'admin' role may access these screens.
 * Includes the persistent AdminSidebar for Web layout.
 */
import React from 'react';
import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
  const IS_WEB = Platform.OS === 'web';

  if (IS_WEB) {
    return (
      <AuthGuard allowedRoles={['admin']}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#F7FAFF' }}>
          <AdminSidebar />
          <View style={{ flex: 1, overflow: 'hidden' }}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['admin']}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  );
}
