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

// Pre-warm the free-tier Railway/Render server as early as possible.
// This fires a lightweight GET /wake request so the cold-start completes
// before the user reaches the login screen and clicks "Login".
wakeServer();

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}