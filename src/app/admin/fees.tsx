/**
 * Admin Fees Management — Full fee oversight for Principal.
 *
 * Features:
 *  - Summary KPI cards (total, collected, outstanding, overdue)
 *  - Status filter tabs: All / Pending / Paid / Overdue
 *  - Invoice list with student name, amount, due date, status badge
 *  - Collection rate progress bar
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Platform,
} from 'react-native';
import { getAdminFees, AdminFeesOverview, AdminFeeInvoice } from '../../services/admin';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  green: '#10B981', greenBg: '#ECFDF5',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  red: '#EF4444', redBg: '#FEF2F2',
};

type StatusFilter = 'all' | 'pending' | 'paid' | 'overdue';

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  paid:    { bg: '#DCFCE7', text: '#15803D', label: 'PAID' },
  pending: { bg: '#FEF3C7', text: '#D97706', label: 'PENDING' },
  overdue: { bg: '#FEE2E2', text: '#DC2626', label: 'OVERDUE' },
  default: { bg: '#F1F5F9', text: '#64748B', label: 'UNKNOWN' },
};

function SummaryCard({ label, value, icon, color, bg }: { label: string; value: string; icon: string; color: string; bg: string }) {
  return (
    <View style={[sc.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <View style={[sc.icon, { backgroundColor: bg }]}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  card: { flex: 1, minWidth: 140, backgroundColor: P.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: P.border, alignItems: 'center', gap: 6, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  icon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '600', color: P.textSec, textAlign: 'center' },
});

export default function AdminFeesScreen() {
  const [data, setData] = useState<AdminFeesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const load = useCallback(async (f?: StatusFilter) => {
    setLoading(true);
    try {
      const result = await getAdminFees(f === 'all' ? undefined : f);
      setData(result);
    } catch (e) {
      console.warn('Fees load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const summary = data?.summary;
  const invoices = data?.invoices ?? [];
  const collectionRate = summary?.collection_rate ?? 0;

  const TABS: { key: StatusFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'pending', label: 'Pending', icon: '⏳' },
    { key: 'paid', label: 'Paid', icon: '✅' },
    { key: 'overdue', label: 'Overdue', icon: '🚨' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>ADMIN / FINANCE</Text>
          <Text style={s.title}>Fee Management</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={() => load(filter)}>
          <Text style={{ color: P.indigo, fontWeight: '700', fontSize: 13 }}>⟳ Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={P.indigo} />
          <Text style={{ color: P.textSec, fontSize: 14 }}>Loading fee data...</Text>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={s.summaryRow}>
            <SummaryCard label="Total Invoiced" value={`₹${(summary?.total_invoiced ?? 0).toLocaleString('en-IN')}`} icon="🧾" color={P.indigo} bg={P.indigoBg} />
            <SummaryCard label="Collected" value={`₹${(summary?.total_collected ?? 0).toLocaleString('en-IN')}`} icon="✅" color={P.green} bg={P.greenBg} />
            <SummaryCard label="Pending" value={`₹${(summary?.total_pending ?? 0).toLocaleString('en-IN')}`} icon="⏳" color={P.amber} bg={P.amberBg} />
            <SummaryCard label="Overdue" value={`₹${(summary?.total_overdue ?? 0).toLocaleString('en-IN')}`} icon="🚨" color={P.red} bg={P.redBg} />
          </View>

          {/* Collection Rate Bar */}
          <View style={s.rateCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontWeight: '700', color: P.text, fontSize: 14 }}>Collection Rate</Text>
              <Text style={{ fontWeight: '800', color: P.green, fontSize: 14 }}>{collectionRate}%</Text>
            </View>
            <View style={{ height: 12, backgroundColor: P.border, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ width: `${collectionRate}%` as any, height: 12, backgroundColor: P.green, borderRadius: 6 }} />
            </View>
            <Text style={{ fontSize: 11, color: P.textMuted, marginTop: 6 }}>
              {summary?.total_invoices ?? 0} total invoices
            </Text>
          </View>

          {/* Filter Tabs */}
          <View style={s.tabs}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, filter === tab.key && s.tabActive]}
                onPress={() => setFilter(tab.key)}
              >
                <Text style={s.tabIcon}>{tab.icon}</Text>
                <Text style={[s.tabLabel, filter === tab.key && s.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Invoice List */}
          <FlatList
            data={invoices}
            keyExtractor={i => i.id}
            contentContainerStyle={s.list}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={{ fontSize: 40 }}>💳</Text>
                <Text style={{ color: P.textSec, fontSize: 15, fontWeight: '600', marginTop: 8 }}>No invoices found</Text>
              </View>
            }
            renderItem={({ item }: { item: AdminFeeInvoice }) => {
              const st = STATUS_STYLE[item.status] ?? STATUS_STYLE.default;
              return (
                <View style={s.invoiceCard}>
                  <View style={s.invoiceLeft}>
                    <Text style={s.invoiceName}>{item.student_name}</Text>
                    <Text style={s.invoiceTitle}>{item.title}</Text>
                    <Text style={s.invoiceDue}>Due: {item.due_date}</Text>
                  </View>
                  <View style={s.invoiceRight}>
                    <Text style={s.invoiceAmt}>₹{item.amount.toLocaleString('en-IN')}</Text>
                    <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                      <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border },
  breadcrumb: { fontSize: 10, fontWeight: '700', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '800', color: P.text },
  refreshBtn: { backgroundColor: P.indigoBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#C7D2FE' },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, paddingBottom: 0 },
  rateCard: { margin: 16, backgroundColor: P.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: P.border },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: P.bg, borderWidth: 1, borderColor: P.border },
  tabActive: { backgroundColor: P.indigoBg, borderColor: P.indigo },
  tabIcon: { fontSize: 13 },
  tabLabel: { fontSize: 12, fontWeight: '600', color: P.textSec },
  tabLabelActive: { color: P.indigo },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60 },
  invoiceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: P.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: P.border, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1 },
  invoiceLeft: { flex: 1 },
  invoiceName: { fontSize: 14, fontWeight: '700', color: P.text, marginBottom: 2 },
  invoiceTitle: { fontSize: 12, color: P.textSec, marginBottom: 2 },
  invoiceDue: { fontSize: 11, color: P.textMuted },
  invoiceRight: { alignItems: 'flex-end', gap: 6 },
  invoiceAmt: { fontSize: 16, fontWeight: '800', color: P.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
