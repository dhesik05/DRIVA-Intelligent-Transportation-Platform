// DRIVA TypeScript types — Synchronized with PostgreSQL backend and Pydantic schemas

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
  owner_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  city?: string;
  service_areas?: string;
  total_vehicles: number;
  available_vehicles?: number;
  assigned_vehicles?: number;
  completed_deliveries: number;
  provider_rating: number;
  reliability_score: number;
  success_rate?: number;
  verification_status?: string;
  is_active: boolean;
}

export interface Driver {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  license_number?: string;
  license_type?: string;
  experience_years: number;
  rating: number;
  total_deliveries: number;
  successful_deliveries: number;
  is_available: boolean;
  current_location?: string;
  provider_id?: number;
  assigned_vehicle_id?: number;
  vehicle_registration?: string;
  assigned_vehicle_reg?: string;
  provider_name?: string;
}

export interface Vehicle {
  id: number;
  owner_id: number;
  provider_id?: number;
  driver_id?: number;
  registration_number?: string;
  vehicle_number: string;
  vehicle_type: string;
  make?: string;
  model?: string;
  manufacture_year?: number;
  fuel_type: FuelType;
  capacity_kg: number;
  volume_m3?: number;
  capacity_volume_m3?: number;
  length_ft?: number;
  width_ft?: number;
  height_ft?: number;
  current_location?: string;
  home_location?: string;
  status: VehicleStatus;
  availability?: boolean;
  vehicle_age_years?: number;
  vehicle_age?: number;
  mileage?: number;
  efficiency?: number;
  fuel_efficiency?: number;
  rating?: number;
  total_deliveries?: number;
  successful_deliveries?: number;
  insurance_expiry?: string;
  fitness_expiry?: string;
  last_service_date?: string;
  driver_name?: string;
  driver_phone?: string;
  provider_name?: string;
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
  cargo_dimensions?: string;
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
  driva_fee_rate?: number;
  driva_service_fee?: number;
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

export interface DeliveryItem {
  id: number;
  request_id: number;
  booking_id: number;
  pickup_location: string;
  destination: string;
  cargo_type: string;
  cargo_weight_kg: number;
  status: string;
  quoted_price: number;
  estimated_eta_hours: number;
  match_score?: number;
  driva_service_fee?: number;
  vehicle?: {
    id: number;
    type: string;
    registration: string;
  };
  driver?: {
    id: number;
    name: string;
    phone: string;
  };
  provider?: {
    id: number;
    name: string;
  };
  pickup_time?: string;
  delivered_time?: string;
  created_at: string;
}

// ──────────────────────────────────────────
// Role-specific Dashboard Interfaces
// ──────────────────────────────────────────

export interface BusinessDashboardData {
  role: 'BUSINESS_OWNER';
  business_name: string;
  contact_person?: string;
  total_requests: number;
  active_shipments: number;
  active_deliveries?: number;
  completed_deliveries: number;
  total_spend: number;
  avg_transport_cost: number;
  avg_cost_per_delivery?: number;
  avg_match_score: number;
  recent_requests: Array<{
    id: number;
    pickup_location: string;
    destination: string;
    cargo_type: string;
    cargo_weight_kg: number;
    cargo_volume_m3?: number;
    estimated_distance_km?: number;
    priority: string;
    status: string;
    created_at?: string;
  }>;
  trend_data?: any[];
  carrier_performance?: any[];
}

export interface FleetDashboardData {
  role: 'FLEET_OWNER';
  company_name: string;
  owner_name?: string;
  city?: string;
  total_vehicles: number;
  available_vehicles: number;
  assigned_vehicles: number;
  in_transit: number;
  maintenance_vehicles?: number;
  offline_vehicles?: number;
  ev_vehicles: number;
  diesel_vehicles: number;
  petrol_vehicles: number;
  total_drivers: number;
  available_drivers: number;
  fleet_utilization: number;
  completed_deliveries: number;
  gross_earnings: number;
  driva_service_fee: number;
  net_earnings: number;
  chart_data: Array<{
    type: string;
    total: number;
    active: number;
    util: string;
  }>;
}

export interface AgencyDashboardData {
  role: 'LOGISTICS_AGENCY';
  agency_name: string;
  contact_person?: string;
  active_requests: number;
  available_capacity: number;
  partner_carriers: number;
  active_shipments: number;
  completed_shipments: number;
  total_volume: number;
  agency_revenue: number;
  driva_service_fee: number;
  reliability_score: number;
}

export interface DriverDashboardData {
  role: 'DRIVER';
  driver_name: string;
  license_number: string;
  experience_years: number;
  rating: number;
  is_available: boolean;
  current_location: string;
  assigned_vehicle: {
    type: string;
    registration: string;
    capacity_kg: number;
    fuel_type: string;
  };
  todays_jobs: number;
  active_delivery?: {
    booking_id: number;
    request_id: number;
    origin: string;
    destination: string;
    cargo_type: string;
    cargo_weight_kg: number;
    status: string;
    quoted_price: number;
    eta_hours: number;
    payout: number;
  };
  completed_jobs: number;
  gross_earnings: number;
}

export interface AdminDashboardData {
  role: 'ADMIN';
  total_users: number;
  total_businesses: number;
  total_fleet_owners: number;
  total_agencies: number;
  total_drivers: number;
  total_vehicles: number;
  available_vehicles: number;
  assigned_vehicles: number;
  in_transit_vehicles: number;
  maintenance_vehicles?: number;
  offline_vehicles?: number;
  pending_requests: number;
  active_deliveries: number;
  completed_deliveries: number;
  total_bookings: number;
  total_transport_value: number;
  driva_service_fee: number;
  avg_match_score: number;
  avg_eta_hours: number;
  active_providers: number;
  total_gmv?: number;
  driva_revenue?: number;
  avg_booking_value?: number;
  trend_data?: any[];
  carrier_performance?: any[];
}

export type DashboardSummary =
  | BusinessDashboardData
  | FleetDashboardData
  | AgencyDashboardData
  | DriverDashboardData
  | AdminDashboardData;

// Legacy aliases
export type BusinessAnalytics = BusinessDashboardData;
export type AdminAnalytics = AdminDashboardData;
