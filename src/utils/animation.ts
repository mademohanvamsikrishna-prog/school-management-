import { Platform } from 'react-native';

/**
 * Returns true on native (iOS/Android), false on web.
 * Use this instead of hardcoding `useNativeDriver: true` to avoid
 * the "RCTAnimation module is missing" warning on Expo Web.
 */
export const nativeDriver = Platform.OS !== 'web';
