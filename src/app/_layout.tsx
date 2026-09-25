import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { Platform, LogBox } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { wakeServer } from '../services/auth';

// react-native-reanimated emits this warning internally on Expo Web
// because the native RCTAnimation module doesn't exist in a browser context.
// This is expected behaviour on web — suppress the noise.
if (Platform.OS === 'web') {
  LogBox.ignoreLogs(['Animated: `useNativeDriver` is not supported']);
}

export default function RootLayout() {
  useEffect(() => {
    // Pre-warm the free-tier Railway/Render server as early as possible.
    // Must be inside useEffect (not module top-level) to avoid React #418
    // hydration mismatch — fetch behaves differently during SSR vs client.
    wakeServer();
  }, []);

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}