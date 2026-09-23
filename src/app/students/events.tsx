/**
 * Student Events — Upcoming & past school events with category filter.
 * Replaces the 3-line PlaceholderScreen.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { getEvents } from '../../services/events';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  green: '#10B981', greenBg: '#ECFDF5',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  red: '#EF4444', redBg: '#FEF2F2',
  purple: '#7C3AED', purpleBg: '#F5F3FF',
  cyan: '#0891B2', cyanBg: '#ECFEFF',
};

type FilterType = 'all' | 'upcoming' | 'past';

const CAT_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  exam:       { bg: '#FEE2E2', text: '#DC2626', icon: '✍️' },
  sports:     { bg: '#DCFCE7', text: '#16A34A', icon: '⚽' },
  cultural:   { bg: '#F3E8FF', text: '#7E22CE', icon: '🎭' },
  holiday:    { bg: '#FEF3C7', text: '#D97706', icon: '🎉' },
  academic:   { bg: '#DBEAFE', text: '#1D4ED8', icon: '📚' },
  meeting:    { bg: '#CFFAFE', text: '#0E7490', icon: '🤝' },
  default:    { bg: '#F1F5F9', text: '#475569', icon: '📅' },
};

function getCatStyle(type?: string) {
  if (!type) return CAT_COLORS.default;
  const k = Object.keys(CAT_COLORS).find(k => type.toLowerCase().includes(k));
  return k ? CAT_COLORS[k] : CAT_COLORS.default;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return d; }
}

function isUpcoming(d: string) {
  return new Date(d) >= new Date();
}

export default function StudentEventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data ?? []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = events.filter(e => {
    if (filter === 'upcoming') return isUpcoming(e.event_date ?? e.date ?? '');
    if (filter === 'past')     return !isUpcoming(e.event_date ?? e.date ?? '');
    return true;
  });

  const FILTERS: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All Events', icon: '📋' },
    { key: 'upcoming', label: 'Upcoming', icon: '⏰' },
    { key: 'past', label: 'Past', icon: '📁' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>STUDENT / EVENTS</Text>
          <Text style={s.title}>School Events</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={load}>
          <Text style={{ color: P.indigo, fontWeight: '700', fontSize: 13 }}>⟳</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={s.tabs}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.tab, filter === f.key && s.tabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={{ fontSize: 13 }}>{f.icon}</Text>
            <Text style={[s.tabLabel, filter === f.key && s.tabLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={P.indigo} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.id ?? String(i)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 52 }}>🗓️</Text>
              <Text style={s.emptyTitle}>No Events Found</Text>
              <Text style={s.emptySub}>Check back later for upcoming school events.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const cat = getCatStyle(item.event_type ?? item.category ?? item.type);
            const upcoming = isUpcoming(item.event_date ?? item.date ?? '');
            return (
              <View style={[s.eventCard, !upcoming && s.pastCard]}>
                {/* Left date strip */}
                <View style={[s.dateStrip, { backgroundColor: upcoming ? P.indigo : '#94A3B8' }]}>
                  <Text style={s.dateDay}>
                    {new Date(item.event_date ?? item.date ?? '').getDate() || '?'}
                  </Text>
                  <Text style={s.dateMon}>
                    {MONTHS[new Date(item.event_date ?? item.date ?? '').getMonth()] ?? '—'}
                  </Text>
                </View>

                {/* Content */}
                <View style={s.eventContent}>
                  <View style={s.eventTop}>
                    <Text style={s.eventTitle} numberOfLines={1}>{item.title ?? item.name}</Text>
                    {upcoming && <View style={s.upcomingBadge}><Text style={s.upcomingText}>UPCOMING</Text></View>}
                  </View>
                  {item.description && (
                    <Text style={s.eventDesc} numberOfLines={2}>{item.description}</Text>
                  )}
                  <View style={s.eventMeta}>
                    {(item.event_type ?? item.category) && (
                      <View style={[s.catBadge, { backgroundColor: cat.bg }]}>
                        <Text style={{ fontSize: 11 }}>{cat.icon}</Text>
                        <Text style={[s.catText, { color: cat.text }]}>{item.event_type ?? item.category}</Text>
                      </View>
                    )}
                    {(item.location ?? item.venue) && (
                      <View style={s.locRow}>
                        <Text style={{ fontSize: 11 }}>📍</Text>
                        <Text style={s.locText} numberOfLines={1}>{item.location ?? item.venue}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  breadcrumb: { fontSize: 10, fontWeight: '700', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '800', color: P.text },
  refreshBtn: { backgroundColor: P.indigoBg, width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C7D2FE' },
  tabs: { flexDirection: 'row', gap: 8, padding: 14, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: P.bg, borderWidth: 1, borderColor: P.border },
  tabActive: { backgroundColor: P.indigoBg, borderColor: P.indigo },
  tabLabel: { fontSize: 12, fontWeight: '600', color: P.textSec },
  tabLabelActive: { color: P.indigo },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: P.text },
  emptySub: { fontSize: 13, color: P.textSec, textAlign: 'center', paddingHorizontal: 30 },
  eventCard: { flexDirection: 'row', backgroundColor: P.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: P.border, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  pastCard: { opacity: 0.7 },
  dateStrip: { width: 56, alignItems: 'center', justifyContent: 'center', padding: 12, gap: 2 },
  dateDay: { color: '#FFF', fontSize: 22, fontWeight: '800', lineHeight: 26 },
  dateMon: { color: '#FFF', fontSize: 11, fontWeight: '600', opacity: 0.9 },
  eventContent: { flex: 1, padding: 14 },
  eventTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 4 },
  eventTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: P.text },
  upcomingBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  upcomingText: { fontSize: 9, fontWeight: '800', color: '#15803D' },
  eventDesc: { fontSize: 12, color: P.textSec, lineHeight: 18, marginBottom: 8 },
  eventMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  catText: { fontSize: 11, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locText: { fontSize: 11, color: P.textSec, maxWidth: 140 },
});
