/**
 * Admin section layout.
 * Only 'admin' role may access these screens.
 * All other users are redirected to their own home screen by AuthGuard.
 */
import { Stack } from 'expo-router';
import { AuthGuard } from '../../components/guards/AuthGuard';

export default function AdminLayout() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  );
}
