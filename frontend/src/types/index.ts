// DRIVA TypeScript types — matches backend Pydantic schemas

export type UserRole = 'BUSINESS_OWNER' | 'FLEET_OWNER' | 'LOGISTICS_AGENCY' | 'DRIVER' | 'ADMIN';
export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'IN_TRANSIT' | 'MAINTENANCE' | 'OFFLINE';
export type FuelType = 'EV' | 'PETROL' | 'DIESEL';
export type RequestStatus = 'PENDING' | 'MATCHING' | 'MATCHED' | 'BOOKED' | 'CANCELLED';
export type BookingStatus = 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'VEHICLE_ARRIVED' | 'PICKUP_COMPLETED' | 'IN_TRANSIT' | 'NEAR_DESTINATION' | 'DELIVERED' | 'CANCELLED';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Provider {
  id: number;
  user_id: number;
  company_name: string;
  service_areas?: string;
  total_vehicles: number;
  completed_deliveries: number;
  provider_rating: number;
  reliability_score: number;
  is_active: boolean;
}

export interface Vehicle {
  id: number;
  owner_id: number;
  provider_id?: number;
  vehicle_number: string;
  vehicle_type: string;
  fuel_type: FuelType;
  capacity_kg: number;
  capacity_volume_m3?: number;
  vehicle_age_years: number;
  efficiency: number;
  current_location?: string;
  status: VehicleStatus;
  is_active: boolean;
}

export interface TransportRequest {
  id: number;
  business_id: number;
  pickup_location: string;
  destination: string;
  cargo_type: string;
  cargo_weight_kg: number;
  cargo_volume_m3?: number;
  vehicle_type_preference?: string;
  deadline?: string;
  priority: Priority;
  status: RequestStatus;
  estimated_distance_km?: number;
  created_at: string;
}

export interface MatchOption {
  rank: number;
  provider_id: number;
  provider_name: string;
  provider_rating?: number;
  provider_reliability: number;
  operating_route?: string;
  is_available?: boolean;

  vehicle_id: number;
  vehicle_name?: string;
  vehicle_type: string;
  vehicle_number?: string;
  fuel_type: string;
  capacity_kg: number;
  driver_experience?: number;
  current_location?: string;

  // Cargo Fit & Dimensions
  cargo_weight_kg?: number;
  cargo_volume_m3?: number;
  usable_length_m?: number;
  usable_width_m?: number;
  usable_height_m?: number;
  usable_volume_m3?: number;
  weight_utilization_pct?: number;
  volume_utilization_pct?: number;
  dimension_fit?: boolean;
  deadline_met?: boolean;

  // Predictions
  predicted_cost: number;
  predicted_eta_hours: number;
  suitability_score: number;

  // Decision Factors
  match_score: number;
  route_score: number;
  cost_score: number;
  eta_score: number;
  capacity_score: number;
  dimension_fit_score?: number;
  availability_score: number;
}

export interface MatchResponse {
  request_id: number;
  pickup: string;
  destination: string;
  cargo_type?: string;
  cargo_weight_kg: number;
  cargo_length_m?: number;
  cargo_width_m?: number;
  cargo_height_m?: number;
  cargo_volume_m3?: number;
  deadline_hours?: number;
  priority?: Priority;
  options: MatchOption[];
  recommended?: MatchOption;
  groq_explanation?: string;
}

export interface Booking {
  id: number;
  request_id: number;
  provider_id: number;
  vehicle_id?: number;
  driver_id?: number;
  quoted_price: number;
  estimated_eta_hours: number;
  match_score?: number;
  status: BookingStatus;
  commission_rate: number;
  driva_commission?: number;
  created_at: string;
  updated_at: string;
  provider?: Provider;
  vehicle?: Vehicle;
  request?: TransportRequest;
}

export type BookingWithDetails = Booking;

export interface TrackingUpdate {
  status: string;
  location?: string;
  notes?: string;
  timestamp: string;
}

export interface TrackingData {
  booking_id: number;
  current_status: string;
  pickup_location: string;
  destination: string;
  updates: TrackingUpdate[];
}

export interface AdminAnalytics {
  total_users: number;
  total_businesses: number;
  total_fleet_owners: number;
  total_agencies: number;
  total_drivers: number;
  total_vehicles: number;
  total_bookings: number;
  total_gmv: number;
  driva_revenue: number;
  avg_match_score: number;
  avg_booking_value: number;
  active_providers: number;
}

export interface BusinessAnalytics {
  total_requests: number;
  active_deliveries: number;
  completed_deliveries: number;
  total_spend: number;
  avg_cost_per_delivery: number;
  recent_requests: TransportRequest[];
}
