import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, SafeAreaView,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getLeaveTypes, applyForLeave, getMyLeaveRequests } from '../../services/leave';

const STATUS_COLOR: Record<string, string> = {
  approved: COLORS.success,
  rejected: COLORS.error,
  pending: COLORS.warning,
  cancelled: COLORS.textSecondary,
};

export default function LeaveScreen() {
  const { data: leaveTypes } = useApi(getLeaveTypes);
  const { data: requests, loading, refetch } = useApi(getMyLeaveRequests);

  const [view, setView] = useState<'list' | 'apply'>('list');
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!selectedType || !startDate || !endDate || !reason.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert('Invalid Date', 'Use YYYY-MM-DD format.');
      return;
    }
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    setSubmitting(true);
    try {
      await applyForLeave({ leave_type_id: selectedType, start_date: startDate, end_date: endDate, days_count: days, reason });
      Alert.alert('Success', 'Leave request submitted.');
      setView('list');
      setStartDate(''); setEndDate(''); setReason(''); setSelectedType('');
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Leave Management" />
      <View style={styles.tabs}>
        {(['list', 'apply'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, view === tab && styles.activeTab]} onPress={() => setView(tab)}>
            <Text style={[styles.tabText, view === tab && styles.activeTabText]}>
              {tab === 'list' ? 'My Requests' : 'Apply Leave'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {view === 'list' ? (
        loading ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} /> :
        <FlatList
          data={requests || []}
          keyExtractor={r => r.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="No leave requests" description="You haven't applied for any leave yet." icon="📅" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] || COLORS.border }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>{item.start} → {item.end} ({item.days} days)</Text>
            </View>
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.formContent}>
          <Text style={styles.label}>Leave Type</Text>
          <View style={styles.typeRow}>
            {(leaveTypes || []).map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeChip, selectedType === t.id && styles.typeChipActive]}
                onPress={() => setSelectedType(t.id)}
              >
                <Text style={[styles.typeChipText, selectedType === t.id && styles.typeChipTextActive]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2026-09-10" placeholderTextColor={COLORS.textSecondary} />
          <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2026-09-12" placeholderTextColor={COLORS.textSecondary} />
          <Text style={styles.label}>Reason</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reason} onChangeText={setReason} placeholder="Explain your leave reason..." placeholderTextColor={COLORS.textSecondary} multiline numberOfLines={4} />
          <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleApply} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Leave Request</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, padding: SIZES.md, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontWeight: '600' },
  center: { flex: 1 },
  listContent: { padding: SIZES.md },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardSubtitle: { color: COLORS.textSecondary, fontSize: 13 },
  formContent: { padding: SIZES.md, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: SIZES.md },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.sm, padding: SIZES.sm, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.card },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { fontSize: 13, color: COLORS.text },
  typeChipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: COLORS.primary, padding: SIZES.md, borderRadius: SIZES.sm, alignItems: 'center', marginTop: SIZES.lg },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
