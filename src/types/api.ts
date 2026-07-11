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

// ── Visitas ─────────────────────────────────────────────────────────────────

export type EstadoBRMN = 'b' | 'r' | 'm' | 'n';
export type SegSiNo = 'si' | 'no';
export type SegSiNoNa = 'si' | 'no' | 'na';

/** Tipo de visita. Hoy sólo `diagnostico_tecnico` está activo (la maqueta). */
export type VisitType = 'diagnostico_tecnico';

export type VisitStatus = 'draft' | 'completed';

export interface VisitContacto {
  adm_nombre?: string | null;
  adm_cel?: string | null;
  vet_nombre?: string | null;
  vet_cel?: string | null;
  correo?: string | null;
}

export interface VisitSensor {
  instalados?: number | null;
  detectados?: number | null;
  estado: EstadoBRMN;
}

export interface VisitControl {
  marca?: string | null;
  modelo?: string | null;
  serial?: string | null;
  version?: string | null;
  volt_ac?: number | null;
  volt_dc?: number | null;
  /** key de SENSOR_TYPES → medición */
  sensores: Record<string, VisitSensor>;
  lecturas: {
    temp?: number | null;
    hum?: number | null;
    pres?: number | null;
    co2?: number | null;
    amm?: number | null;
  };
  /** key de ESTADO_CRITERIOS → estado */
  estado_fisico: Record<string, EstadoBRMN>;
  observaciones?: string | null;
}

export interface VisitTablero {
  /** key de TABLERO_FISICO_CRITERIOS → estado */
  fisico: Record<string, EstadoBRMN>;
  obs_fisico?: string | null;
  /** key de OTROS_EQUIPOS_ITEMS → estado */
  otros_equipos: Record<string, EstadoBRMN>;
  obs_otros_equipos?: string | null;
  mediciones: {
    l1l2?: number | null;
    l2l3?: number | null;
    l1l3?: number | null;
    l1n?: number | null;
    l2n?: number | null;
    l3n?: number | null;
  };
  termografia: {
    temp_max?: number | null;
    puntos_calientes?: SegSiNo | null;
    obs?: string | null;
  };
}

export interface VisitVariables {
  /** key de PRUEBA_EMERGENCIA_CRITERIOS → si/no */
  prueba_emergencia: Record<string, SegSiNo>;
  obs_prueba_emergencia?: string | null;
  termostatos: { instalados?: number | null; operativos?: number | null };
  obs_termostatos?: string | null;
  /** key de MED_AMBIENTALES_CRITERIOS → {valor, estado} */
  med_ambientales: Record<string, { valor?: number | null; estado: EstadoBRMN }>;
  obs_med_ambientales?: string | null;
}

export interface VisitVentilacion {
  extractores: { marca?: string | null; cantidad?: number | null; estado: EstadoBRMN };
  panel_humedo: {
    estado_general: EstadoBRMN;
    moja_uniforme: SegSiNoNa;
    estado_bomba: EstadoBRMN;
  };
  inlets: { velocidad?: number | null; cantidad?: number | null; estado: EstadoBRMN };
  tunel: { n_puertas?: number | null; longitud?: number | null; estado: EstadoBRMN };
  nebulizacion: { estado: EstadoBRMN };
  ventiladores: { estado: EstadoBRMN };
  observaciones?: string | null;
}

export interface VisitMecanicos {
  comedero: { longitud?: number | null; n_lineas?: number | null; estado: EstadoBRMN };
  bebedero: {
    longitud?: number | null;
    n_lineas?: number | null;
    estado_panel_hidraulico: EstadoBRMN;
    estado_filtro: EstadoBRMN;
    estado_dosatron: EstadoBRMN;
  };
  alimentacion: { n_silos?: number | null; n_lineas?: number | null; estado: EstadoBRMN };
  observaciones?: string | null;
  cierre: {
    recibe_nombre?: string | null;
    realiza_nombre?: string | null;
    recibe_firma?: string | null;
    realiza_firma?: string | null;
  };
}

export interface VisitFoto {
  id: string;
  /** dataURL mientras es mock; URL del archivo cuando exista backend de subida */
  url: string;
  descripcion?: string | null;
}

export interface VisitInforme {
  objetivos?: string | null;
  alcance?: string | null;
  actividades?: string | null;
  resultados?: string | null;
  conclusiones?: string | null;
  recomendaciones?: string | null;
}

export interface VisitFormData {
  type: VisitType;
  client_id: number;
  farm_id: number;
  galpon_id: number;
  fecha: string;
  num_aves?: number | null;
  dia_lote?: number | null;
  status?: VisitStatus;
  // Snapshot de la granja/contactos al momento de la visita (para el informe)
  cliente_nombre?: string | null;
  granja_nombre?: string | null;
  galpon_numero?: string | null;
  ubicacion?: string | null;
  total_galpones?: number | null;
  contacto: VisitContacto;
  // Secciones (columnas JSON en backend)
  control: VisitControl;
  tablero: VisitTablero;
  variables: VisitVariables;
  ventilacion: VisitVentilacion;
  mecanicos: VisitMecanicos;
  evidencia: { fotos: VisitFoto[] };
  informe: VisitInforme;
}

export interface Visit extends VisitFormData {
  id: number;
  status: VisitStatus;
  client?: Client;
  farm?: Farm;
  created_at: string;
  updated_at: string;
}
