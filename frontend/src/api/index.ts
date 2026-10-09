import api from './client';
import type {
  AuthResponse, User, Vehicle, Driver, Provider, TransportRequest,
  Booking, MatchResponse, DeliveryItem, BusinessDashboardData,
  FleetDashboardData, AgencyDashboardData, DriverDashboardData,
  AdminDashboardData
} from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/login/json', { email, password });
    return data;
  },

  register: async (payload: {
    name: string; email: string; phone?: string; password: string; role: string;
  }): Promise<User> => {
    const { data } = await api.post<User>('/api/auth/register', payload);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/api/auth/me');
    return data;
  },
};

export const dashboardApi = {
  summary: async () => {
    const { data } = await api.get('/api/dashboard/summary');
    return data;
  },
  business: async (): Promise<BusinessDashboardData> => {
    const { data } = await api.get<BusinessDashboardData>('/api/dashboard/business');
    return data;
  },
  fleet: async (): Promise<FleetDashboardData> => {
    const { data } = await api.get<FleetDashboardData>('/api/dashboard/fleet');
    return data;
  },
  agency: async (): Promise<AgencyDashboardData> => {
    const { data } = await api.get<AgencyDashboardData>('/api/dashboard/agency');
    return data;
  },
  driver: async (): Promise<DriverDashboardData> => {
    const { data } = await api.get<DriverDashboardData>('/api/dashboard/driver');
    return data;
  },
  admin: async (): Promise<AdminDashboardData> => {
    const { data } = await api.get<AdminDashboardData>('/api/dashboard/admin');
    return data;
  },
};

export const transportApi = {
  createRequest: async (payload: object) => {
    const { data } = await api.post('/api/transport-requests', payload);
    return data;
  },
  listRequests: async () => {
    const { data } = await api.get('/api/transport-requests');
    return data;
  },
  getRequest: async (id: number) => {
    const { data } = await api.get(`/api/transport-requests/${id}`);
    return data;
  },
};

export const matchingApi = {
  runMatch: async (requestId: number): Promise<MatchResponse> => {
    const { data } = await api.post<MatchResponse>(`/api/matching/${requestId}`);
    return data;
  },
  getResults: async (requestId: number): Promise<MatchResponse> => {
    const { data } = await api.get<MatchResponse>(`/api/matching/${requestId}/results`);
    return data;
  },
};

export const bookingApi = {
  createBooking: async (payload: { request_id: number; provider_id: number; vehicle_id: number }): Promise<Booking> => {
    const { data } = await api.post<Booking>('/api/bookings', payload);
    return data;
  },
  listBookings: async (): Promise<Booking[]> => {
    const { data } = await api.get<Booking[]>('/api/bookings');
    return data;
  },
  getBooking: async (id: number): Promise<Booking> => {
    const { data } = await api.get<Booking>(`/api/bookings/${id}`);
    return data;
  },
  updateStatus: async (id: number, status: string, location?: string, notes?: string) => {
    const { data } = await api.put(`/api/bookings/${id}/status`, { status, location, notes });
    return data;
  },
  getTracking: async (id: number) => {
    const { data } = await api.get(`/api/bookings/${id}/tracking`);
    return data;
  },
};

export const deliveryApi = {
  list: async (activeOnly?: boolean): Promise<DeliveryItem[]> => {
    const { data } = await api.get<DeliveryItem[]>('/api/deliveries', {
      params: activeOnly ? { active_only: true } : undefined,
    });
    return data;
  },
};

export const vehicleApi = {
  list: async (params?: object): Promise<Vehicle[]> => {
    const { data } = await api.get<Vehicle[]>('/api/vehicles', { params });
    return data;
  },
  get: async (id: number): Promise<Vehicle> => {
    const { data } = await api.get<Vehicle>(`/api/vehicles/${id}`);
    return data;
  },
  create: async (payload: object): Promise<Vehicle> => {
    const { data } = await api.post<Vehicle>('/api/vehicles', payload);
    return data;
  },
  update: async (id: number, payload: object): Promise<Vehicle> => {
    const { data } = await api.put<Vehicle>(`/api/vehicles/${id}`, payload);
    return data;
  },
  toggleAvailability: async (id: number, availability?: boolean): Promise<Vehicle> => {
    const { data } = await api.put<Vehicle>(`/api/vehicles/${id}/availability`, { availability });
    return data;
  },
  assignDriver: async (id: number, driverId: number): Promise<Vehicle> => {
    const { data } = await api.put<Vehicle>(`/api/vehicles/${id}/assign-driver`, { driver_id: driverId });
    return data;
  },
};

export const driverApi = {
  list: async (params?: object): Promise<Driver[]> => {
    const { data } = await api.get<Driver[]>('/api/drivers', { params });
    return data;
  },
  get: async (id: number): Promise<Driver> => {
    const { data } = await api.get<Driver>(`/api/drivers/${id}`);
    return data;
  },
  create: async (payload: object): Promise<Driver> => {
    const { data } = await api.post<Driver>('/api/drivers', payload);
    return data;
  },
  update: async (id: number, payload: object): Promise<Driver> => {
    const { data } = await api.put<Driver>(`/api/drivers/${id}`, payload);
    return data;
  },
};

export const providerApi = {
  list: async (): Promise<Provider[]> => {
    const { data } = await api.get<Provider[]>('/api/providers');
    return data;
  },
  listFleetOwners: async (): Promise<Provider[]> => {
    const { data } = await api.get<Provider[]>('/api/fleet-owners');
    return data;
  },
  listAgencies: async (): Promise<Provider[]> => {
    const { data } = await api.get<Provider[]>('/api/agencies');
    return data;
  },
  get: async (id: number): Promise<Provider> => {
    const { data } = await api.get<Provider>(`/api/providers/${id}`);
    return data;
  },
};

export const analyticsApi = {
  admin: async (): Promise<AdminDashboardData> => {
    const { data } = await api.get<AdminDashboardData>('/api/analytics/admin');
    return data;
  },
  business: async (): Promise<BusinessDashboardData> => {
    const { data } = await api.get<BusinessDashboardData>('/api/analytics/business');
    return data;
  },
  fleet: async (): Promise<FleetDashboardData> => {
    const { data } = await api.get<FleetDashboardData>('/api/analytics/fleet');
    return data;
  },
};

export const aiApi = {
  explain: async (requestId: number) => {
    const { data } = await api.post('/api/ai/explain-recommendation', { request_id: requestId });
    return data;
  },
  chat: async (message: string, contextRequestId?: number) => {
    const { data } = await api.post('/api/ai/assistant', {
      message,
      context_request_id: contextRequestId,
    });
    return data;
  },
};

export const ratingApi = {
  submit: async (payload: {
    booking_id: number; overall_rating: number;
    timeliness_rating?: number; cost_rating?: number;
    service_rating?: number; comment?: string;
  }) => {
    const { data } = await api.post('/api/ratings', payload);
    return data;
  },
};
