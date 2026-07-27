import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const clientSchema = z.object({
  razon_social: z.string().min(1, 'La razón social es requerida').max(255),
  nit: z.string().min(1, 'El NIT es requerido').max(255),
  email: z.string().min(1, 'El email es requerido').email('Email inválido').max(255),
  phone_number: z.string().min(1, 'El teléfono es requerido').max(50),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const farmSchema = z.object({
  client_id: z.number().min(1, 'El cliente es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  transformator_capacity_kva: z.number().min(0).optional(),
  access_ways: z.string().max(500).optional(),
  observations: z.string().max(5000).optional(),
  farm_voltage: z.enum(['110V', '220V', '440V']).optional(),
  farm_electric_current: z.enum(['monophase', 'biphase', 'triphase']).optional(),
  have_own_transformator: z.boolean().optional(),
  is_transformator_feeds_other_installations: z.boolean().optional(),
  transformator_are_feeding_installations: z.string().max(500).optional(),
  have_easy_access_for_trailer: z.boolean().optional(),
  staff_availability: z.boolean().optional(),
  has_storage_warehouse: z.boolean().optional(),
  how_many_warehouses: z.number().min(0).optional(),
  total_galpones: z.number().min(0).optional(),
});

export type FarmFormValues = z.infer<typeof farmSchema>;

export const georreferenceSchema = z.object({
  farm_id: z.number().min(1, 'La granja es requerida'),
  address: z.string().max(500).optional(),
  town: z.string().max(255).optional(),
  department: z.string().max(255).optional(),
  map_url_reference: z.string().max(1000).optional(),
});

export type GeorreferenceFormValues = z.infer<typeof georreferenceSchema>;

export const farmContactSchema = z.object({
  farm_id: z.number().min(1, 'La granja es requerida'),
  type: z.enum(['administrador', 'veterinario', 'encargado', 'otro'], {
    error: 'El tipo es requerido',
  }),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  email: z.string().email('Email inválido').max(255).optional(),
  phone: z.string().max(50).optional(),
});

export type FarmContactFormValues = z.infer<typeof farmContactSchema>;

// ── Galpon ────────────────────────────────────────────────────────────────────

const galponDimensionsSchema = z.object({
  largo_m: z.number({ error: 'Ingresa un número' }).min(0).optional(),
  ancho_m: z.number({ error: 'Ingresa un número' }).min(0).optional(),
  altura_canal_m: z.number({ error: 'Ingresa un número' }).min(0).optional(),
  altura_cumbrera_m: z.number({ error: 'Ingresa un número' }).min(0).optional(),
});

export const galponSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  code: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  dimensions_json: galponDimensionsSchema.optional(),
  technical_attributes_json: z
    .object({
      tipo_estructura: z.string().max(255).optional(),
      tipo_cubierta: z.string().max(255).optional(),
    })
    .optional(),
  observations: z.string().max(5000).optional(),
});

export type GalponFormValues = z.infer<typeof galponSchema>;

// ── Galpon System ─────────────────────────────────────────────────────────────

export const galponSystemSchema = z.object({
  system_id: z.number().min(1, 'Selecciona un sistema'),
  quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
  notes: z.string().max(5000).optional(),
  technical_attributes_json: z
    .object({
      capacidad: z.string().max(255).optional(),
    })
    .optional(),
});

export type GalponSystemFormValues = z.infer<typeof galponSystemSchema>;

// ── Project ───────────────────────────────────────────────────────────────────

export const projectSchema = z.object({
  client_id: z.number().min(1, 'El cliente es requerido'),
  farm_id: z.number().min(1, 'La granja es requerida'),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  code: z.string().min(1, 'El código es requerido').max(100),
  tipo: z.enum(['SOLUCION TOTAL', 'AMBIENTE CONTROLADO', 'AMBIENTE ABIERTO'], {
    error: 'Selecciona un tipo',
  }),
  linea: z.enum(
    ['AVICULTURA: LEVANTE Y PRODUCCION', 'AVICULTURA: ENGORDE DE POLLO', 'PORCICULTURA', 'BOVINO'],
    { error: 'Selecciona una línea' },
  ),
  status: z.string().default('active'),
  description: z.string().max(5000).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// ── Visita ──────────────────────────────────────────────────────────────────

const estadoBRMN = z.enum(['b', 'r', 'm', 'n']);
const segSiNo = z.enum(['si', 'no']);
const segSiNoNa = z.enum(['si', 'no', 'na']);
const num = z.number().nullable().optional();
const txt = z.string().nullable().optional();

const sensorSchema = z.object({
  instalados: num,
  detectados: num,
  estado: estadoBRMN.default('b'),
});

export const visitSchema = z.object({
  type: z.literal('diagnostico_tecnico').default('diagnostico_tecnico'),

  // Paso 1 — obligatorios
  client_id: z.number().min(1, 'El cliente es requerido'),
  farm_id: z.number().min(1, 'La granja es requerida'),
  galpon_id: z.number().min(1, 'El galpón es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  num_aves: num,
  dia_lote: num,
  status: z.enum(['draft', 'completed']).default('draft'),
  // Snapshots de nombres (para informe y listado sin depender de include)
  cliente_nombre: txt,
  granja_nombre: txt,
  galpon_numero: txt,
  ubicacion: txt,
  total_galpones: num,
  contacto: z.object({
    adm_nombre: txt,
    adm_cel: txt,
    vet_nombre: txt,
    vet_cel: txt,
    correo: txt,
  }),

  // Paso 2 — control y automatización
  control: z.object({
    marca: txt,
    modelo: txt,
    serial: txt,
    version: txt,
    volt_ac: num,
    volt_dc: num,
    sensores: z.record(z.string(), sensorSchema),
    lecturas: z.object({ temp: num, hum: num, pres: num, co2: num, amm: num }),
    estado_fisico: z.record(z.string(), estadoBRMN),
    observaciones: txt,
  }),

  // Paso 3 — tablero
  tablero: z.object({
    fisico: z.record(z.string(), estadoBRMN),
    obs_fisico: txt,
    otros_equipos: z.record(z.string(), estadoBRMN),
    obs_otros_equipos: txt,
    mediciones: z.object({ l1l2: num, l2l3: num, l1l3: num, l1n: num, l2n: num, l3n: num }),
    termografia: z.object({
      temp_max: num,
      puntos_calientes: segSiNo.nullable().optional(),
      obs: txt,
    }),
  }),

  // Paso 4 — variables
  variables: z.object({
    prueba_emergencia: z.record(z.string(), segSiNo),
    obs_prueba_emergencia: txt,
    termostatos: z.object({ instalados: num, operativos: num }),
    obs_termostatos: txt,
    med_ambientales: z.record(
      z.string(),
      z.object({ valor: num, estado: estadoBRMN.default('n') }),
    ),
    obs_med_ambientales: txt,
  }),

  // Paso 5 — ventilación
  ventilacion: z.object({
    extractores: z.object({ marca: txt, cantidad: num, estado: estadoBRMN.default('b') }),
    panel_humedo: z.object({
      estado_general: estadoBRMN.default('b'),
      moja_uniforme: segSiNoNa.default('si'),
      estado_bomba: estadoBRMN.default('b'),
    }),
    inlets: z.object({ velocidad: num, cantidad: num, estado: estadoBRMN.default('b') }),
    tunel: z.object({ n_puertas: num, longitud: num, estado: estadoBRMN.default('b') }),
    nebulizacion: z.object({ estado: estadoBRMN.default('b') }),
    ventiladores: z.object({ estado: estadoBRMN.default('b') }),
    observaciones: txt,
  }),

  // Paso 6 — mecánicos
  mecanicos: z.object({
    comedero: z.object({ longitud: num, n_lineas: num, estado: estadoBRMN.default('b') }),
    bebedero: z.object({
      longitud: num,
      n_lineas: num,
      estado_panel_hidraulico: estadoBRMN.default('b'),
      estado_filtro: estadoBRMN.default('b'),
      estado_dosatron: estadoBRMN.default('b'),
    }),
    alimentacion: z.object({ n_silos: num, n_lineas: num, estado: estadoBRMN.default('b') }),
    observaciones: txt,
    cierre: z.object({
      recibe_nombre: txt,
      realiza_nombre: txt,
      recibe_firma: txt,
      realiza_firma: txt,
    }),
  }),

  // Paso 7 — evidencia
  evidencia: z.object({
    fotos: z.array(
      z.object({ id: z.string(), url: z.string(), descripcion: txt }),
    ),
  }),

  // Paso 8 — informe
  informe: z.object({
    objetivos: txt,
    alcance: txt,
    actividades: txt,
    resultados: txt,
    conclusiones: txt,
    recomendaciones: txt,
  }),
});

export type VisitFormValues = z.infer<typeof visitSchema>;
