import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  razon_social: z.string().min(1, 'La razón social es requerida').max(255),
  email: z.string().min(1, 'El email es requerido').email('Email inválido').max(255),
  phone_number: z.string().min(1, 'El teléfono es requerido').max(50),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const farmSchema = z.object({
  client_id: z.coerce.number().min(1, 'El cliente es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  transformator_capacity_kva: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.coerce.number().min(0).optional(),
  ),
  access_ways: z.string().max(500).optional(),
  observations: z.string().max(5000).optional(),
  farm_voltage: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['110V', '220V']).optional(),
  ),
  farm_electric_current: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['monophase', 'biphase', 'triphase']).optional(),
  ),
  have_own_transformator: z.boolean().optional(),
  is_transformator_feeds_other_installations: z.boolean().optional(),
  distance_to_neighbor_boundary_m: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.coerce.number().min(0).optional(),
  ),
  transformator_are_feeding_installations: z.string().max(500).optional(),
  neighboring_properties_notes: z.string().max(500).optional(),
  have_easy_access_for_trailer: z.boolean().optional(),
  staff_availability: z.boolean().optional(),
  has_storage_warehouse: z.boolean().optional(),
  how_many_warehouses: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.coerce.number().min(0).optional(),
  ),
});

export type FarmFormValues = z.infer<typeof farmSchema>;

export const georreferenceSchema = z.object({
  farm_id: z.coerce.number().min(1, 'La granja es requerida'),
  address: z.string().max(500).optional(),
  town: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
  map_url_reference: z.string().max(1000).optional(),
});

export type GeorreferenceFormValues = z.infer<typeof georreferenceSchema>;

export const farmContactSchema = z.object({
  farm_id: z.coerce.number().min(1, 'La granja es requerida'),
  type: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(['administrador', 'veterinario', 'encargado', 'otro'], {
      error: 'El tipo es requerido',
    }),
  ),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  email: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().email('Email inválido').max(255).optional(),
  ),
  phone: z.string().max(50).optional(),
});

export type FarmContactFormValues = z.infer<typeof farmContactSchema>;
