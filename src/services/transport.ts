import { api } from './api';

export interface TransportRoute {
  id: string;
  name: string;
  start_time: string;
  is_active: boolean;
  vehicle_reg?: string;
  stop_count: number;
}

export interface RouteStop {
  id: string;
  stop_name: string;
  stop_order: number;
  arrival_time: string;
}

export interface MyAssignment {
  assigned: boolean;
  route_id?: string;
  route_name?: string;
  pickup_stop?: string;
  academic_year?: string;
}

export const getTransportRoutes = (): Promise<TransportRoute[]> =>
  api.get<TransportRoute[]>('/transport/routes');

export const getRouteStops = (routeId: string): Promise<RouteStop[]> =>
  api.get<RouteStop[]>(`/transport/routes/${routeId}/stops`);

export const getMyTransportAssignment = (): Promise<MyAssignment> =>
  api.get<MyAssignment>('/transport/my-assignment');
