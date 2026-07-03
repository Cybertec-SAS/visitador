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

export interface Client {
  id: number;
  name?: string;
  razon_social: string;
  nit: string;
  email: string;
  phone_number: string;
  farms?: Farm[];
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  razon_social: string;
  nit: string;
  email: string;
  phone_number: string;
}

export type FarmVoltage = '110V' | '220V' | '440V';
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
  transformator_are_feeding_installations: string | null;
  have_easy_access_for_trailer: boolean | null;
  staff_availability: boolean | null;
  has_storage_warehouse: boolean | null;
  how_many_warehouses: number | null;
  total_galpones: number | null;
  client?: Client;
  georreference?: FarmGeorreference | null;
  contacts?: FarmContact[];
  galpones?: Galpon[];
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
  transformator_are_feeding_installations?: string | null;
  have_easy_access_for_trailer?: boolean | null;
  staff_availability?: boolean | null;
  has_storage_warehouse?: boolean | null;
  how_many_warehouses?: number | null;
  total_galpones?: number | null;
}

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

// ── Systems Catalog ───────────────────────────────────────────────────────────

export interface SystemCatalog {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
}

// ── Galpon ────────────────────────────────────────────────────────────────────

export interface GalponDimensions {
  largo_m: number | null;
  ancho_m: number | null;
  altura_canal_m: number | null;
  altura_cumbrera_m: number | null;
}

export interface GalponTechnicalAttributes {
  tipo_estructura?: string | null;
  tipo_cubierta?: string | null;
  [key: string]: unknown;
}

export interface GalponSystem {
  id: number;
  system_id: number;
  quantity: number;
  notes: string | null;
  technical_attributes_json?: Record<string, unknown> | null;
  system?: SystemCatalog;
}

export interface Galpon {
  id: number;
  farm_id: number;
  name: string;
  code: string | null;
  status: 'active' | 'inactive';
  dimensions_json: GalponDimensions | null;
  technical_attributes_json: GalponTechnicalAttributes | null;
  observations: string | null;
  systems?: GalponSystem[];
  created_at: string;
  updated_at: string;
}

export interface GalponFormData {
  name: string;
  code?: string | null;
  status: 'active' | 'inactive';
  dimensions_json?: Partial<GalponDimensions> | null;
  technical_attributes_json?: GalponTechnicalAttributes | null;
  observations?: string | null;
}

export interface GalponSystemFormData {
  system_id: number;
  quantity: number;
  notes?: string | null;
  technical_attributes_json?: Record<string, unknown> | null;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type ProjectTipo = 'SOLUCION TOTAL' | 'AMBIENTE CONTROLADO' | 'AMBIENTE ABIERTO';
export type ProjectLinea =
  | 'AVICULTURA: LEVANTE Y PRODUCCION'
  | 'AVICULTURA: ENGORDE DE POLLO'
  | 'PORCICULTURA'
  | 'BOVINO';

export interface Project {
  id: number;
  client_id: number;
  farm_id: number;
  name: string;
  code: string;
  tipo: ProjectTipo;
  linea: ProjectLinea;
  status: string;
  description: string | null;
  client?: Client;
  farm?: Farm;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  client_id: number;
  farm_id: number;
  name: string;
  code: string;
  tipo: ProjectTipo;
  linea: ProjectLinea;
  status: string;
  description?: string | null;
}
