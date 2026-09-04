import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EmptyState } from './EmptyState';
import { COLORS } from '../constants/theme';

export default function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <EmptyState title="Coming Soon" description="This feature is under development." icon="🚧" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
