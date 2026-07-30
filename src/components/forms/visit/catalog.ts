/**
 * Catálogos del wizard de visita (portados de la maqueta `.context`).
 * Las `key` son slugs seguros para usarse como nombres de campo en
 * react-hook-form y como claves JSON en el backend; `label` es lo que ve el
 * usuario. Reutilizado por los pasos del formulario y por el informe (paso 8).
 */

export type EstadoBRMN = 'b' | 'r' | 'm' | 'n';
export type SegSiNo = 'si' | 'no';
export type SegSiNoNa = 'si' | 'no' | 'na';

export interface CriterioDef {
  key: string;
  label: string;
}

export interface PillOption {
  v: EstadoBRMN;
  label: string;
}

export interface SegOption {
  v: SegSiNoNa;
  label: string;
}

// ── Sensores (paso 2) ───────────────────────────────────────────────────────
export const SENSOR_TYPES: CriterioDef[] = [
  { key: 'temp', label: 'Temperatura' },
  { key: 'pres', label: 'Presión estática' },
  { key: 'hum', label: 'Humedad' },
  { key: 'co2', label: 'CO2' },
  { key: 'amm', label: 'Amoníaco' },
];

// ── Estado físico del equipo (paso 2) ───────────────────────────────────────
export const ESTADO_CRITERIOS: CriterioDef[] = [
  { key: 'pantalla', label: 'Pantalla' },
  { key: 'teclado', label: 'Teclado / botones' },
  { key: 'gabinete', label: 'Gabinete' },
  { key: 'cableado', label: 'Cableado eléctrico' },
  { key: 'fuente', label: 'Fuente de alimentación' },
];

// ── Tablero (paso 3) ────────────────────────────────────────────────────────
export const TABLERO_FISICO_CRITERIOS: CriterioDef[] = [
  { key: 'limpieza', label: 'Limpieza' },
  { key: 'humedad', label: 'Humedad' },
  { key: 'corrosion', label: 'Corrosión' },
  { key: 'orden', label: 'Orden' },
];

export const OTROS_EQUIPOS_ITEMS: CriterioDef[] = [
  { key: 'dimmer', label: 'DIMMER' },
  { key: 'rdt5', label: 'RDT-5' },
  { key: 'rswrsu', label: 'RSW/RSU' },
  { key: 'backup', label: 'BACKUP' },
];

// ── Variables (paso 4) ──────────────────────────────────────────────────────
export const PRUEBA_EMERGENCIA_CRITERIOS: CriterioDef[] = [
  { key: 'alarma_sonora', label: 'Alarma sonora' },
  { key: 'alarma_visual', label: 'Alarma visual' },
  { key: 'desarme_cortina', label: 'Desarme de cortina' },
  { key: 'ventilacion_forzada', label: 'Ventilación forzada' },
  { key: 'backup', label: 'Backup' },
  { key: 'temperatura_alta', label: 'Temperatura alta' },
  { key: 'presion_alta', label: 'Presión alta' },
];

export interface MedAmbientalDef extends CriterioDef {
  unit: string;
}

export const MED_AMBIENTALES_CRITERIOS: MedAmbientalDef[] = [
  { key: 'presSellamiento', label: 'Presión estática (sellamiento)', unit: 'IN.H2O' },
  { key: 'presVentMinima', label: 'Presión estática (ventilación mínima)', unit: 'IN.H2O' },
  { key: 'velAire', label: 'Velocidad de aire promedio', unit: 'm/s' },
  { key: 'intensidadLuz', label: 'Intensidad de luz', unit: 'lux' },
];

// ── Opciones de estado ──────────────────────────────────────────────────────
export const PILL_BRM: PillOption[] = [
  { v: 'b', label: 'BUENO' },
  { v: 'r', label: 'REGULAR' },
  { v: 'm', label: 'MALO' },
];
export const PILL_BRMN: PillOption[] = [...PILL_BRM, { v: 'n', label: 'N/A' }];
export const PILL_BM: PillOption[] = [
  { v: 'b', label: 'BUENO' },
  { v: 'm', label: 'MALO' },
];

export const SEG_SINO: SegOption[] = [
  { v: 'si', label: 'SÍ' },
  { v: 'no', label: 'NO' },
];
export const SEG_SINONA: SegOption[] = [...SEG_SINO, { v: 'na', label: 'N/A' }];

// ── Prioridad de actividades recomendadas ───────────────────────────────────
export type Prioridad = 'alta' | 'media' | 'baja';
export interface PrioridadOption {
  v: Prioridad;
  label: string;
}
export const PILL_PRIORIDAD: PrioridadOption[] = [
  { v: 'alta', label: 'ALTA' },
  { v: 'media', label: 'MEDIA' },
  { v: 'baja', label: 'BAJA' },
];
export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

// ── Momento de instalación de repuestos identificados ───────────────────────
export type MomentoRepuesto = 'inmediato' | 'programado' | 'seguimiento';
export interface MomentoOption {
  v: MomentoRepuesto;
  label: string;
}
export const PILL_MOMENTO: MomentoOption[] = [
  { v: 'inmediato', label: 'INMEDIATO' },
  { v: 'programado', label: 'PROGRAMADO' },
  { v: 'seguimiento', label: 'SEGUIMIENTO' },
];
export const MOMENTO_LABEL: Record<MomentoRepuesto, string> = {
  inmediato: 'Inmediato',
  programado: 'Programado',
  seguimiento: 'Seguimiento',
};

// ── Mapas de presentación (informe) ─────────────────────────────────────────
export const STATUS_LABEL: Record<string, string> = {
  b: 'Bueno',
  r: 'Regular',
  m: 'Malo',
  n: 'No aplica',
};

export const SEG_LABEL: Record<string, string> = { si: 'Sí', no: 'No', na: 'N/A' };

export const narrativeKeys = [
  'objetivos',
  'alcance',
  'actividades',
  'resultados',
  'conclusiones',
  'recomendaciones',
] as const;
