/**
 * AnimatedFeature.tsx
 * Desktop branding feature row with staggered entrance animation.
 * Extracted from src/app/index.tsx.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { loginStyles as styles } from './loginStyles';

interface AnimatedFeatureProps {
  icon: string;
  text: string;
  /** Delay in ms before the entrance animation begins. */
  delay: number;
}

export function AnimatedFeature({ icon, text, delay }: AnimatedFeatureProps) {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-40)).current;
  const scale     = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }, 900 + delay);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureRow,
        { opacity, transform: [{ translateX }, { scale }] },
      ]}
    >
      <View style={styles.featureIcon}>
        <Text style={styles.featureCheck}>{icon}</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
}
