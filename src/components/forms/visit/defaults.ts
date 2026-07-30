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
    procesos_operativos: {
      falso_techo: { color: null, tipo_cortina: null, estado: 'b', observaciones: null },
      cortina_lateral: {
        estado: 'b',
        suspension: null,
        cortavientos: null,
        sellamiento: null,
        cortina: null,
        observaciones: null,
      },
      aislamiento: { puntos_calientes: 'no', tipo: null, estado: 'b', observaciones: null },
      turbo_calefactores: { cantidad: null, estado: 'b', observaciones: null },
      sistema_pesaje: {
        operativo: 'si',
        celdas_pesaje: 'b',
        rsw: 'si',
        rsu: 'si',
        observaciones: null,
      },
      iluminacion: {
        dimerizable: 'no',
        referencia_bombillo: null,
        iluminarias_operativas: null,
        observaciones: null,
      },
      sistema_comunicacion: { operativo: 'si', observaciones: null },
    },
    hallazgos: [],
    actividades_recomendadas: [],
    repuestos_identificados: [],
    observaciones_generales: null,
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
    procesos_operativos: {
      ...empty.procesos_operativos,
      ...visit.procesos_operativos,
      falso_techo: { ...empty.procesos_operativos.falso_techo, ...visit.procesos_operativos?.falso_techo },
      cortina_lateral: {
        ...empty.procesos_operativos.cortina_lateral,
        ...visit.procesos_operativos?.cortina_lateral,
      },
      aislamiento: { ...empty.procesos_operativos.aislamiento, ...visit.procesos_operativos?.aislamiento },
      turbo_calefactores: {
        ...empty.procesos_operativos.turbo_calefactores,
        ...visit.procesos_operativos?.turbo_calefactores,
      },
      sistema_pesaje: { ...empty.procesos_operativos.sistema_pesaje, ...visit.procesos_operativos?.sistema_pesaje },
      iluminacion: { ...empty.procesos_operativos.iluminacion, ...visit.procesos_operativos?.iluminacion },
      sistema_comunicacion: {
        ...empty.procesos_operativos.sistema_comunicacion,
        ...visit.procesos_operativos?.sistema_comunicacion,
      },
    },
    hallazgos: visit.hallazgos ?? [],
    actividades_recomendadas: visit.actividades_recomendadas ?? [],
    repuestos_identificados: visit.repuestos_identificados ?? [],
    observaciones_generales: visit.observaciones_generales ?? null,
    informe: { ...empty.informe, ...visit.informe },
  } as VisitFormValues;
}
