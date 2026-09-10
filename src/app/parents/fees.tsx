import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { ChildSelector } from '../../components/ChildSelector';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getMyProfile } from '../../services/profile';
import { getStudentInvoices, simulatePayment } from '../../services/finance';

export default function FeesScreen() {
  const { data: profile, loading: profileLoading } = useApi(getMyProfile);
  const children = profile?.parent_profile?.children || [];
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  if (children.length > 0 && !selectedChildId) {
    setSelectedChildId(children[0].id);
  }

  const { data: invoices, loading: invoicesLoading, refetch } = useApi(
    async () => {
      if (!selectedChildId) return [];
      return getStudentInvoices(selectedChildId);
    },
    [selectedChildId]
  );

  const handlePay = async (invoiceId: string, amount: number) => {
    try {
      await simulatePayment(invoiceId, amount);
      Alert.alert('Payment Successful', 'Simulated payment completed.');
      refetch();
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Error processing payment');
    }
  };

  const loading = profileLoading || invoicesLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Fees & Payments" showBack />
      
      <View style={styles.container}>
        {children.length > 0 && (
          <ChildSelector 
            childrenList={children as any}
            selectedChildId={selectedChildId || ''}
            onSelectChild={setSelectedChildId} 
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: SIZES.xl}} />
        ) : (
          <FlatList
            data={invoices}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.invoiceCard}>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.amount}>₹{item.amount}</Text>
                  <Text style={[styles.status, { color: item.status === 'paid' ? COLORS.success : COLORS.error }]}>
                    Status: {item.status.toUpperCase()}
                  </Text>
                  <Text style={styles.due}>Due: {item.due_date}</Text>
                </View>
                {item.status !== 'paid' && (
                  <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item.id, item.amount)}>
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No invoices found.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.md },
  listContent: { paddingBottom: SIZES.xl, gap: SIZES.md },
  invoiceCard: {
    backgroundColor: '#fff', padding: SIZES.md, borderRadius: SIZES.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1
  },
  invoiceInfo: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  status: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  due: { fontSize: 12, color: COLORS.textLight },
  payButton: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: SIZES.sm },
  payButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: SIZES.xl },
});
