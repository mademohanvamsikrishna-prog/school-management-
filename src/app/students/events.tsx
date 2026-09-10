import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { EventCard } from '../../components/EventCard';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getEvents } from '../../services/events';

export default function EventsScreen() {
  const { data: events, loading, error } = useApi(() => getEvents(false));

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="School Events" showBack />
      
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <Text style={styles.errorText}>{error.message}</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <EventCard {...item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No events found.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SIZES.md,
  },
  listContent: {
    paddingBottom: SIZES.xl,
    gap: SIZES.md,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.md,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: SIZES.xl,
  }
});
