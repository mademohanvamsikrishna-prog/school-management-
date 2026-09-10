/**
 * LoginBackground.tsx
 * Renders the three animated background bubbles on the login screen.
 * Accepts pre-created Animated.Values so the parent controls their timing.
 */
import { Animated } from 'react-native';
import { loginStyles as styles } from './loginStyles';

interface LoginBackgroundProps {
  bubble1: Animated.Value;
  bubble2: Animated.Value;
  bubble3: Animated.Value;
}

export function LoginBackground({ bubble1, bubble2, bubble3 }: LoginBackgroundProps) {
  return (
    <>
      <Animated.View
        style={[styles.bubble1, { transform: [{ translateY: bubble1 }] }]}
      />
      <Animated.View
        style={[styles.bubble2, { transform: [{ translateY: bubble2 }] }]}
      />
      <Animated.View
        style={[styles.bubble3, { transform: [{ translateY: bubble3 }] }]}
      />
    </>
  );
}
