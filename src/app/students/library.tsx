import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { browseBooks, getMyIssues } from '../../services/library';

export default function LibraryScreen() {
  const [view, setView] = useState<'browse' | 'issues'>('browse');
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: books, loading: booksLoading } = useApi(
    () => browseBooks(searchQuery || undefined),
    [searchQuery]
  );
  const { data: issues, loading: issuesLoading } = useApi(getMyIssues);

  const STATUS_COLOR: Record<string, string> = {
    issued: COLORS.primary,
    returned: COLORS.success,
    overdue: COLORS.error,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Library" />
      <View style={styles.tabs}>
        {(['browse', 'issues'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, view === tab && styles.activeTab]} onPress={() => setView(tab)}>
            <Text style={[styles.tabText, view === tab && styles.activeTabText]}>
              {tab === 'browse' ? '📚 Browse' : '🔖 My Books'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === 'browse' ? (
        <>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by title or author..."
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="search"
              onSubmitEditing={() => setSearchQuery(search)}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={() => setSearchQuery(search)}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
          {booksLoading ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} /> : (
            <FlatList
              data={books || []}
              keyExtractor={b => b.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<EmptyState title="No books found" description="Try a different search term." icon="📖" />}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    {item.category_name && <Text style={styles.bookCategory}>{item.category_name}</Text>}
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.availText, { color: item.available_copies > 0 ? COLORS.success : COLORS.error }]}>
                      {item.available_copies}/{item.total_copies}
                    </Text>
                    <Text style={styles.availLabel}>available</Text>
                  </View>
                </View>
              )}
            />
          )}
        </>
      ) : (
        issuesLoading ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} /> : (
          <FlatList
            data={issues || []}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState title="No issued books" description="You haven't borrowed any books." icon="📚" />}
            renderItem={({ item }) => (
              <View style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <Text style={styles.bookTitle} numberOfLines={1}>{item.book_title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] || COLORS.border }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.issueDetail}>Issued: {item.issued_date} | Due: {item.due_date}</Text>
                {item.returned_date && <Text style={styles.issueDetail}>Returned: {item.returned_date}</Text>}
                {item.fine_amount > 0 && (
                  <Text style={[styles.issueDetail, { color: COLORS.error }]}>Fine: ₹{item.fine_amount}</Text>
                )}
              </View>
            )}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, padding: SIZES.md, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontWeight: '600' },
  searchRow: { flexDirection: 'row', padding: SIZES.md, gap: SIZES.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.sm, padding: SIZES.sm, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.card },
  searchBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, borderRadius: SIZES.sm, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  listContent: { padding: SIZES.md },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  cardLeft: { flex: 1, marginRight: SIZES.sm },
  cardRight: { alignItems: 'center' },
  bookTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  bookAuthor: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  bookCategory: { fontSize: 11, color: COLORS.primary, marginTop: 4 },
  availText: { fontSize: 18, fontWeight: 'bold' },
  availLabel: { fontSize: 10, color: COLORS.textSecondary },
  issueCard: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  issueDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
