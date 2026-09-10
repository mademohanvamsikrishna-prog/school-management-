/**
 * RoleButton.tsx
 * Animated role-selection pill used on the login screen.
 * Extracted from src/app/index.tsx for reusability and readability.
 */
import { useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { loginStyles as styles } from './loginStyles';

interface RoleButtonProps {
  icon: string;
  title: string;
  selected: boolean;
  onPress: () => void;
}

export function RoleButton({ icon, title, selected, onPress }: RoleButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[styles.roleButton, selected && styles.roleSelected]}
      >
        <Text style={[styles.roleIcon, selected && styles.roleIconSelected]}>
          {icon}
        </Text>

        <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
          {title}
        </Text>

        {selected && (
          <View style={styles.selectedCheck}>
            <Text style={styles.selectedCheckText}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
