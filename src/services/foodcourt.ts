import { api } from './api';

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  is_vegetarian: boolean;
  category_name?: string;
}

export interface FoodOrderItemIn {
  food_item_id: string;
  quantity: number;
}

export interface FoodOrder {
  id: string;
  status: string;
  total_amount: number;
  notes?: string;
}

export const getFoodMenu = (available_only = true): Promise<FoodItem[]> =>
  api.get<FoodItem[]>(`/food/menu?available_only=${available_only}`);

export const placeOrder = (items: FoodOrderItemIn[], notes?: string): Promise<FoodOrder> =>
  api.post<FoodOrder>('/food/orders', { items, notes });

export const getMyOrders = (): Promise<FoodOrder[]> =>
  api.get<FoodOrder[]>('/food/orders/mine');
