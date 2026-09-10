import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, SafeAreaView, ScrollView,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SIZES } from '../../constants/theme';
import { useApi } from '../../hooks/useApi';
import { getFoodMenu, placeOrder, getMyOrders } from '../../services/foodcourt';

export default function FoodCourtScreen() {
  const [view, setView] = useState<'menu' | 'cart' | 'orders'>('menu');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [ordering, setOrdering] = useState(false);

  const { data: menu, loading } = useApi(getFoodMenu);
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useApi(getMyOrders);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = (menu || []).reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);

  const addToCart = (itemId: string) => setCart(c => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }));
  const removeFromCart = (itemId: string) => setCart(c => {
    if (!c[itemId]) return c;
    const updated = { ...c };
    if (updated[itemId] <= 1) delete updated[itemId]; else updated[itemId]--;
    return updated;
  });

  const handleOrder = async () => {
    if (cartCount === 0) return;
    Alert.alert('Confirm Order', `Total: ₹${cartTotal.toFixed(2)}\nPlace order?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Order', onPress: async () => {
          setOrdering(true);
          try {
            const items = Object.entries(cart).map(([food_item_id, quantity]) => ({ food_item_id, quantity }));
            await placeOrder(items);
            setCart({});
            setView('orders');
            refetchOrders();
            Alert.alert('Order Placed!', 'Your order has been submitted.');
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setOrdering(false);
          }
        }
      }
    ]);
  };

  const STATUS_COLOR: Record<string, string> = {
    pending: COLORS.warning,
    confirmed: COLORS.primary,
    preparing: COLORS.info,
    ready: COLORS.success,
    delivered: COLORS.success,
    cancelled: COLORS.error,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Food Court" />
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, view === 'menu' && styles.activeTab]} onPress={() => setView('menu')}>
          <Text style={[styles.tabText, view === 'menu' && styles.activeTabText]}>🍽️ Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, view === 'cart' && styles.activeTab]} onPress={() => setView('cart')}>
          <Text style={[styles.tabText, view === 'cart' && styles.activeTabText]}>🛒 Cart {cartCount > 0 ? `(${cartCount})` : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, view === 'orders' && styles.activeTab]} onPress={() => setView('orders')}>
          <Text style={[styles.tabText, view === 'orders' && styles.activeTabText]}>📦 Orders</Text>
        </TouchableOpacity>
      </View>

      {view === 'menu' && (
        loading ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} /> :
        <FlatList
          data={menu || []}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="Menu unavailable" description="No items available right now." icon="🍽️" />}
          renderItem={({ item }) => (
            <View style={styles.menuCard}>
              <View style={styles.menuLeft}>
                <View style={styles.menuTitleRow}>
                  <Text style={styles.menuName}>{item.name}</Text>
                  {item.is_vegetarian && <Text style={styles.vegTag}>🟢 Veg</Text>}
                </View>
                {item.category_name && <Text style={styles.categoryText}>{item.category_name}</Text>}
                <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.qtyRow}>
                {cart[item.id] ? (
                  <>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{cart[item.id]}</Text>
                  </>
                ) : null}
                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item.id)}>
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {view === 'cart' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {cartCount === 0 ? (
            <EmptyState title="Cart empty" description="Add items from the menu." icon="🛒" />
          ) : (
            <>
              {(menu || []).filter(i => !!cart[i.id]).map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <Text style={styles.menuName}>{item.name}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
                    <Text style={styles.qtyNum}>{cart[item.id]}</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item.id)}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
                  </View>
                  <Text style={styles.priceText}>₹{(cart[item.id] * item.price).toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₹{cartTotal.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={[styles.orderBtn, ordering && styles.orderBtnDisabled]} onPress={handleOrder} disabled={ordering}>
                {ordering ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>Place Order</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {view === 'orders' && (
        ordersLoading ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} /> :
        <FlatList
          data={orders || []}
          keyExtractor={o => o.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState title="No orders" description="You haven't placed any orders." icon="📦" />}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] || COLORS.border }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.priceText}>₹{item.total_amount.toFixed(2)}</Text>
              {item.notes && <Text style={styles.noteText}>Note: {item.notes}</Text>}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, padding: SIZES.sm, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontWeight: '600' },
  listContent: { padding: SIZES.md, paddingBottom: 40 },
  menuCard: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  menuLeft: { flex: 1 },
  menuTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  vegTag: { fontSize: 11 },
  categoryText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  priceText: { fontSize: 15, color: COLORS.primary, fontWeight: 'bold', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, color: COLORS.text, fontWeight: 'bold' },
  qtyNum: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  cartItem: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
  totalAmount: { fontSize: 17, fontWeight: 'bold', color: COLORS.primary },
  orderBtn: { backgroundColor: COLORS.primary, padding: SIZES.md, borderRadius: SIZES.sm, alignItems: 'center', marginTop: SIZES.sm },
  orderBtnDisabled: { opacity: 0.5 },
  orderBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  orderCard: { backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 14, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  noteText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
});
