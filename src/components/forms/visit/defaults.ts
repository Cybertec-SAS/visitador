import type { VisitFormValues } from '@/schemas';
import type { Visit } from '@/types/api';
import {
  SENSOR_TYPES,
  ESTADO_CRITERIOS,
  TABLERO_FISICO_CRITERIOS,
  OTROS_EQUIPOS_ITEMS,
  PRUEBA_EMERGENCIA_CRITERIOS,
  MED_AMBIENTALES_CRITERIOS,
  type EstadoBRMN,
} from './catalog';

function estadoRecord(criterios: { key: string }[], initial: EstadoBRMN): Record<string, EstadoBRMN> {
  return Object.fromEntries(criterios.map((c) => [c.key, initial]));
}

/** Valores iniciales completos para RHF (todos los paths existen). */
export function createEmptyVisit(preset?: { client_id?: number }): VisitFormValues {
  return {
    type: 'diagnostico_tecnico',
    client_id: preset?.client_id ?? 0,
    farm_id: 0,
    galpon_id: 0,
    fecha: new Date().toISOString().slice(0, 10),
    num_aves: null,
    dia_lote: null,
    status: 'draft',
    cliente_nombre: null,
    granja_nombre: null,
    galpon_numero: null,
    ubicacion: null,
    total_galpones: null,
    contacto: { adm_nombre: null, adm_cel: null, vet_nombre: null, vet_cel: null, correo: null },
    control: {
      marca: null,
      modelo: null,
      serial: null,
      version: null,
      volt_ac: null,
      volt_dc: null,
      sensores: Object.fromEntries(
        SENSOR_TYPES.map((s) => [s.key, { instalados: null, detectados: null, estado: 'b' as EstadoBRMN }]),
      ),
      lecturas: { temp: null, hum: null, pres: null, co2: null, amm: null },
      estado_fisico: estadoRecord(ESTADO_CRITERIOS, 'b'),
      observaciones: null,
    },
    tablero: {
      fisico: estadoRecord(TABLERO_FISICO_CRITERIOS, 'b'),
      obs_fisico: null,
      otros_equipos: estadoRecord(OTROS_EQUIPOS_ITEMS, 'b'),
      obs_otros_equipos: null,
      mediciones: { l1l2: null, l2l3: null, l1l3: null, l1n: null, l2n: null, l3n: null },
      termografia: { temp_max: null, puntos_calientes: null, obs: null },
    },
    variables: {
      prueba_emergencia: Object.fromEntries(
        PRUEBA_EMERGENCIA_CRITERIOS.map((c) => [c.key, 'no' as const]),
      ),
      obs_prueba_emergencia: null,
      termostatos: { instalados: null, operativos: null },
      obs_termostatos: null,
      med_ambientales: Object.fromEntries(
        MED_AMBIENTALES_CRITERIOS.map((c) => [c.key, { valor: null, estado: 'n' as EstadoBRMN }]),
      ),
      obs_med_ambientales: null,
    },
    ventilacion: {
      extractores: { marca: null, cantidad: null, estado: 'b' },
      panel_humedo: { estado_general: 'b', moja_uniforme: 'si', estado_bomba: 'b' },
      inlets: { velocidad: null, cantidad: null, estado: 'b' },
      tunel: { n_puertas: null, longitud: null, estado: 'b' },
      nebulizacion: { estado: 'b' },
      ventiladores: { estado: 'b' },
      observaciones: null,
    },
    mecanicos: {
      comedero: { longitud: null, n_lineas: null, estado: 'b' },
      bebedero: {
        longitud: null,
        n_lineas: null,
        estado_panel_hidraulico: 'b',
        estado_filtro: 'b',
        estado_dosatron: 'b',
      },
      alimentacion: { n_silos: null, n_lineas: null, estado: 'b' },
      observaciones: null,
      cierre: { recibe_nombre: null, realiza_nombre: null, recibe_firma: null, realiza_firma: null },
    },
    evidencia: { fotos: [] },
    informe: {
      objetivos: null,
      alcance: null,
      actividades: null,
      resultados: null,
      conclusiones: null,
      recomendaciones: null,
    },
  };
}

/** Mapea una visita existente (backend/mock) a los valores del formulario. */
export function visitToFormValues(visit: Visit): VisitFormValues {
  const empty = createEmptyVisit();
  // Fusión superficial + secciones: la visita guardada ya trae la forma completa.
  return {
    ...empty,
    ...visit,
    contacto: { ...empty.contacto, ...visit.contacto },
    control: { ...empty.control, ...visit.control },
    tablero: { ...empty.tablero, ...visit.tablero },
    variables: { ...empty.variables, ...visit.variables },
    ventilacion: { ...empty.ventilacion, ...visit.ventilacion },
    mecanicos: { ...empty.mecanicos, ...visit.mecanicos },
    evidencia: { fotos: visit.evidencia?.fotos ?? [] },
    informe: { ...empty.informe, ...visit.informe },
  } as VisitFormValues;
}
