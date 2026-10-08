import api from './client';
import type { AuthResponse, User } from '../types';

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
  runMatch: async (requestId: number) => {
    const { data } = await api.post(`/api/matching/${requestId}`);
    return data;
  },
};

export const bookingApi = {
  createBooking: async (payload: { request_id: number; provider_id: number; vehicle_id: number }) => {
    const { data } = await api.post('/api/bookings', payload);
    return data;
  },
  listBookings: async () => {
    const { data } = await api.get('/api/bookings');
    return data;
  },
  getBooking: async (id: number) => {
    const { data } = await api.get(`/api/bookings/${id}`);
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

export const vehicleApi = {
  list: async (params?: object) => {
    const { data } = await api.get('/api/vehicles', { params });
    return data;
  },
  create: async (payload: object) => {
    const { data } = await api.post('/api/vehicles', payload);
    return data;
  },
  update: async (id: number, payload: object) => {
    const { data } = await api.put(`/api/vehicles/${id}`, payload);
    return data;
  },
};

export const providerApi = {
  list: async () => {
    const { data } = await api.get('/api/providers');
    return data;
  },
  get: async (id: number) => {
    const { data } = await api.get(`/api/providers/${id}`);
    return data;
  },
};

export const analyticsApi = {
  admin: async () => {
    const { data } = await api.get('/api/analytics/admin');
    return data;
  },
  business: async () => {
    const { data } = await api.get('/api/analytics/business');
    return data;
  },
  fleet: async () => {
    const { data } = await api.get('/api/analytics/fleet');
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
