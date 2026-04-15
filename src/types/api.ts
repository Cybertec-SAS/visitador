// API pagination types
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// Auth
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LogoutResponse {
  message: string;
}

// Client
export interface Client {
  id: number;
  name: string;
  razon_social: string;
  email: string;
  phone_number: string;
  farms?: Farm[];
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  razon_social: string;
  email: string;
  phone_number: string;
}

// Farm
export type FarmVoltage = '110V' | '220V';
export type FarmElectricCurrent = 'monophase' | 'biphase' | 'triphase';

export interface Farm {
  id: number;
  client_id: number;
  nombre: string;
  transformator_capacity_kva: number | null;
  access_ways: string | null;
  observations: string | null;
  farm_voltage: FarmVoltage | null;
  farm_electric_current: FarmElectricCurrent | null;
  have_own_transformator: boolean | null;
  is_transformator_feeds_other_installations: boolean | null;
  distance_to_neighbor_boundary_m: string | null;
  transformator_are_feeding_installations: string | null;
  neighboring_properties_notes: string | null;
  have_easy_access_for_trailer: boolean | null;
  staff_availability: boolean | null;
  has_storage_warehouse: boolean | null;
  how_many_warehouses: number | null;
  client?: Client;
  georreference?: FarmGeorreference | null;
  contacts?: FarmContact[];
  created_at: string;
  updated_at: string;
}

export interface FarmFormData {
  client_id: number;
  nombre: string;
  transformator_capacity_kva?: number | null;
  access_ways?: string | null;
  observations?: string | null;
  farm_voltage?: FarmVoltage | null;
  farm_electric_current?: FarmElectricCurrent | null;
  have_own_transformator?: boolean | null;
  is_transformator_feeds_other_installations?: boolean | null;
  distance_to_neighbor_boundary_m?: number | null;
  transformator_are_feeding_installations?: string | null;
  neighboring_properties_notes?: string | null;
  have_easy_access_for_trailer?: boolean | null;
  staff_availability?: boolean | null;
  has_storage_warehouse?: boolean | null;
  how_many_warehouses?: number | null;
}

// Farm Georreference
export interface FarmGeorreference {
  id: number;
  farm_id: number;
  address: string | null;
  town: string | null;
  department: string | null;
  map_url_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmGeorreferenceFormData {
  farm_id: number;
  address?: string | null;
  town?: string | null;
  department?: string | null;
  map_url_reference?: string | null;
}

// Farm Contact
export type FarmContactType = 'administrador' | 'veterinario' | 'encargado' | 'otro';

export interface FarmContact {
  id: number;
  farm_id: number;
  type: FarmContactType;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmContactFormData {
  farm_id: number;
  type: FarmContactType;
  name: string;
  email?: string | null;
  phone?: string | null;
}
