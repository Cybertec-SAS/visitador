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

// Structure
export type StructureStatus = 'active' | 'inactive' | 'under_construction' | 'retired';

export interface Structure {
  id: number;
  farm_id: number;
  parent_structure_id: number | null;
  structure_type: string;
  name: string;
  code: string | null;
  status: StructureStatus;
  description: string | null;
  dimensions_json: Record<string, unknown> | null;
  technical_attributes_json: Record<string, unknown> | null;
  observations: string | null;
  sort_order: number;
  parent?: Structure | null;
  children?: Structure[];
  farm?: Farm;
  created_at: string;
  updated_at: string;
}

export interface StructureFormData {
  farm_id: number;
  parent_structure_id?: number | null;
  structure_type: string;
  name: string;
  code?: string | null;
  status?: StructureStatus;
  description?: string | null;
  observations?: string | null;
  sort_order?: number;
  dimensions_json?: Record<string, unknown> | null;
  technical_attributes_json?: Record<string, unknown> | null;
}

// Visit Type
export type VisitTypeCategory = 'report' | 'service' | 'inspection' | 'project_followup';

export interface VisitType {
  id: number;
  code: string;
  name: string;
  category: VisitTypeCategory;
  template_key: string | null;
  is_active: boolean;
}

// Visit
export type VisitStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'signed' | 'closed' | 'cancelled';
export type VisitSource = 'native' | 'migrated_report_and_run' | 'imported_pdf';

export interface Visit {
  id: number;
  client_id: number;
  farm_id: number;
  visit_type_id: number;
  created_by: number;
  assigned_to: number | null;
  title: string;
  subject: string | null;
  status: VisitStatus;
  started_at: string | null;
  ended_at: string | null;
  report_date: string | null;
  city: string | null;
  department: string | null;
  context: string | null;
  development: string | null;
  general_observations: string | null;
  conclusions: string | null;
  internal_notes: string | null;
  source: VisitSource;
  external_reference: string | null;
  visit_type?: VisitType;
  client?: Client;
  farm?: Farm;
  creator?: User;
  assignee?: User | null;
  structures?: VisitStructure[];
  participants?: VisitParticipant[];
  signatures?: VisitSignature[];
  findings?: VisitFinding[];
  commitments?: VisitCommitment[];
  media?: VisitMedia[];
  system_reviews?: VisitSystemReview[];
  measurements?: VisitMeasurement[];
  material_requests?: VisitMaterialRequest[];
  created_at: string;
  updated_at: string;
}

export interface VisitFormData {
  client_id: number;
  farm_id: number;
  visit_type_id: number;
  assigned_to?: number | null;
  title: string;
  subject?: string | null;
  status?: VisitStatus;
  started_at?: string | null;
  ended_at?: string | null;
  report_date?: string | null;
  city?: string | null;
  department?: string | null;
  context?: string | null;
  development?: string | null;
  general_observations?: string | null;
  conclusions?: string | null;
  internal_notes?: string | null;
}

export interface VisitUpdateData {
  assigned_to?: number | null;
  title?: string;
  subject?: string | null;
  status?: VisitStatus;
  context?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  report_date?: string | null;
  city?: string | null;
  department?: string | null;
  development?: string | null;
  general_observations?: string | null;
  conclusions?: string | null;
  internal_notes?: string | null;
}

// Visit Structure
export type VisitStructureRole = 'primary' | 'secondary' | 'affected' | 'inspected' | 'intervened';

export interface VisitStructure {
  id: number;
  visit_id: number;
  structure_id: number;
  role: VisitStructureRole;
  notes: string | null;
  structure?: Structure;
}

export interface VisitStructureFormData {
  visit_id: number;
  structure_id: number;
  role?: VisitStructureRole;
  notes?: string | null;
}

// Visit Participant
export type VisitParticipantType = 'internal' | 'client' | 'contractor' | 'other';

export interface VisitParticipant {
  id: number;
  visit_id: number;
  farm_contact_id: number | null;
  user_id: number | null;
  participant_type: VisitParticipantType;
  name: string;
  role_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface VisitParticipantFormData {
  visit_id: number;
  farm_contact_id?: number | null;
  user_id?: number | null;
  participant_type: VisitParticipantType;
  name: string;
  role_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

// Visit Signature
export type VisitSignatureType = 'insumma' | 'client' | 'delegate' | 'contractor';

export interface VisitSignature {
  id: number;
  visit_id: number;
  signed_by_name: string;
  signed_by_role: string | null;
  signed_by_type: VisitSignatureType;
  signature_file_path: string | null;
  signed_at: string | null;
  notes: string | null;
}

export interface VisitSignatureFormData {
  visit_id: number;
  signed_by_name: string;
  signed_by_role?: string | null;
  signed_by_type: VisitSignatureType;
  signature_file_path?: string | null;
  signed_at?: string | null;
  notes?: string | null;
}

// Visit Finding
export type FindingCategory = 'civil' | 'metallic' | 'electrical' | 'mechanical' | 'operational' | 'commercial' | 'quality' | 'safety' | 'other';
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface VisitFinding {
  id: number;
  visit_id: number;
  structure_id: number | null;
  section: string | null;
  category: FindingCategory;
  severity: FindingSeverity | null;
  title: string;
  description: string;
  recommendation: string | null;
  is_blocking: boolean;
  sort_order: number;
  structure?: Structure | null;
}

export interface VisitFindingFormData {
  visit_id: number;
  structure_id?: number | null;
  section?: string | null;
  category: FindingCategory;
  severity?: FindingSeverity | null;
  title: string;
  description: string;
  recommendation?: string | null;
  is_blocking?: boolean;
  sort_order?: number;
}

// Visit Commitment
export type CommitmentResponsibleType = 'insumma' | 'client' | 'contractor' | 'shared';
export type CommitmentStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface VisitCommitment {
  id: number;
  visit_id: number;
  structure_id: number | null;
  description: string;
  responsible_type: CommitmentResponsibleType;
  responsible_user_id: number | null;
  responsible_name: string | null;
  due_date: string | null;
  status: CommitmentStatus;
  completion_notes: string | null;
  structure?: Structure | null;
  responsible_user?: User | null;
}

export interface VisitCommitmentFormData {
  visit_id: number;
  structure_id?: number | null;
  description: string;
  responsible_type: CommitmentResponsibleType;
  responsible_user_id?: number | null;
  responsible_name?: string | null;
  due_date?: string | null;
  status?: CommitmentStatus;
  completion_notes?: string | null;
}

// Visit Media
export type MediaType = 'image' | 'video' | 'audio' | 'document';
export type MediaPhase = 'before' | 'during' | 'after' | 'evidence' | 'finding' | 'training' | 'delivery';

export interface MediaAnnotation {
  id: number;
  title: string | null;
  caption: string | null;
  sequence_label: string | null;
  phase: MediaPhase | null;
}

export interface VisitMedia {
  id: number;
  visit_id: number;
  structure_id: number | null;
  uploaded_by: number;
  media_type: MediaType;
  storage_disk: string;
  bucket: string | null;
  path_original: string;
  path_processed: string | null;
  mime_type: string | null;
  extension: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  captured_at: string | null;
  latitude: string | null;
  longitude: string | null;
  sort_order: number;
  structure?: Structure | null;
  uploader?: User;
  annotations?: MediaAnnotation[];
}

// Systems Catalog
export interface SystemCatalog {
  id: number;
  code: string;
  name: string;
  category: string;
  is_active?: boolean;
}

// Visit System Review
export type SystemReviewStatus = 'ok' | 'warning' | 'critical' | 'not_applicable';

export interface VisitSystemReview {
  id: number;
  visit_id: number;
  structure_id: number | null;
  system_id: number;
  status: SystemReviewStatus;
  summary: string | null;
  recommendation: string | null;
  system?: SystemCatalog;
  structure?: Structure | null;
}

export interface VisitSystemReviewFormData {
  visit_id: number;
  structure_id?: number | null;
  system_id: number;
  status: SystemReviewStatus;
  summary?: string | null;
  recommendation?: string | null;
}

// Visit Measurement
export interface VisitMeasurement {
  id: number;
  visit_id: number;
  structure_id: number | null;
  measurement_type: string;
  label: string;
  value: string;
  unit: string;
  notes: string | null;
  structure?: Structure | null;
}

export interface VisitMeasurementFormData {
  visit_id: number;
  structure_id?: number | null;
  measurement_type: string;
  label: string;
  value: number;
  unit: string;
  notes?: string | null;
}

// Visit Material Request
export interface VisitMaterialRequest {
  id: number;
  visit_id: number;
  structure_id: number | null;
  system_id: number | null;
  item_code: string | null;
  description: string;
  unit: string;
  requested_quantity: string;
  notes: string | null;
  system?: SystemCatalog | null;
  structure?: Structure | null;
}

export interface VisitMaterialRequestFormData {
  visit_id: number;
  structure_id?: number | null;
  system_id?: number | null;
  item_code?: string | null;
  description: string;
  unit: string;
  requested_quantity: number;
  notes?: string | null;
}

// Project
export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Project {
  id: number;
  client_id: number;
  farm_id: number;
  name: string;
  code: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  client?: Client;
  farm?: Farm;
  structures?: Structure[];
  progress_reports?: ProgressReport[];
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  client_id: number;
  farm_id: number;
  name: string;
  code?: string | null;
  status?: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

// Progress Report
export interface ProgressReport {
  id: number;
  project_id: number;
  visit_id: number | null;
  report_number: number;
  cutoff_date: string;
  start_date: string;
  end_date: string;
  weighted_progress_percent: string;
  scheduled_progress_percent: string;
  difference_percent: string;
  contract_days: number | null;
  elapsed_days: number | null;
  remaining_days: number | null;
  notes: string | null;
  project?: Project;
  items?: ProgressReportItem[];
  curve_points?: ProgressCurvePoint[];
}

export interface ProgressReportItem {
  id: number;
  section_name: string;
  activity_code: string | null;
  activity_name: string;
  status: string;
  advance_percent: string;
  pending_percent: string;
  structure?: Structure | null;
}

export interface ProgressCurvePoint {
  date: string;
  projected_percent: string;
  actual_percent: string;
}
