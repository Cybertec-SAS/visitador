import type { VisitFormValues } from '@/schemas';
import {
  SENSOR_TYPES,
  ESTADO_CRITERIOS,
  TABLERO_FISICO_CRITERIOS,
  OTROS_EQUIPOS_ITEMS,
  MED_AMBIENTALES_CRITERIOS,
  type EstadoBRMN,
} from './catalog';

export interface CriterioEstado {
  name: string;
  v: EstadoBRMN;
}

/** Reúne todos los criterios evaluados por sección (equivalente a buildReport). */
export function collectCriteria(v: VisitFormValues): {
  sec2: CriterioEstado[];
  sec3: CriterioEstado[];
  sec4: CriterioEstado[];
  sec5: CriterioEstado[];
  sec6: CriterioEstado[];
  combined: CriterioEstado[];
} {
  const sec2: CriterioEstado[] = [
    ...ESTADO_CRITERIOS.map((c) => ({ name: c.label, v: v.control.estado_fisico[c.key] ?? 'n' })),
    ...SENSOR_TYPES.map((s) => ({ name: s.label, v: v.control.sensores[s.key]?.estado ?? 'n' })),
  ];
  const sec3: CriterioEstado[] = [
    ...TABLERO_FISICO_CRITERIOS.map((c) => ({ name: c.label, v: v.tablero.fisico[c.key] ?? 'n' })),
    ...OTROS_EQUIPOS_ITEMS.map((c) => ({ name: c.label, v: v.tablero.otros_equipos[c.key] ?? 'n' })),
  ];
  const sec4: CriterioEstado[] = MED_AMBIENTALES_CRITERIOS.map((c) => ({
    name: c.label,
    v: v.variables.med_ambientales[c.key]?.estado ?? 'n',
  }));
  const sec5: CriterioEstado[] = [
    { name: 'Extractores', v: v.ventilacion.extractores.estado },
    { name: 'Inlets', v: v.ventilacion.inlets.estado },
    { name: 'Nebulización', v: v.ventilacion.nebulizacion.estado },
    { name: 'Panel húmedo (general)', v: v.ventilacion.panel_humedo.estado_general },
    { name: 'Panel húmedo (bomba)', v: v.ventilacion.panel_humedo.estado_bomba },
    { name: 'Túnel door', v: v.ventilacion.tunel.estado },
    { name: 'Ventiladores', v: v.ventilacion.ventiladores.estado },
  ];
  const sec6: CriterioEstado[] = [
    { name: 'Comedero automático', v: v.mecanicos.comedero.estado },
    { name: 'Estado panel hidráulico', v: v.mecanicos.bebedero.estado_panel_hidraulico },
    { name: 'Estado filtro', v: v.mecanicos.bebedero.estado_filtro },
    { name: 'Estado Dosatron', v: v.mecanicos.bebedero.estado_dosatron },
    { name: 'Sistema de alimentación', v: v.mecanicos.alimentacion.estado },
  ];
  return { sec2, sec3, sec4, sec5, sec6, combined: [...sec2, ...sec3, ...sec4, ...sec5, ...sec6] };
}

export interface CriteriaCounts {
  b: number;
  r: number;
  m: number;
  n: number;
  total: number;
  pctGood: number;
}

export function criteriaCounts(combined: CriterioEstado[]): CriteriaCounts {
  let b = 0,
    r = 0,
    m = 0,
    n = 0;
  combined.forEach((c) => {
    if (c.v === 'b') b++;
    else if (c.v === 'r') r++;
    else if (c.v === 'm') m++;
    else n++;
  });
  const total = b + r + m + n || 1;
  return { b, r, m, n, total, pctGood: Math.round((b / total) * 100) };
}

/* ── Narrativa auto-generada (idéntica a la maqueta) ───────────────────────── */
export function defaultNarrative(
  v: VisitFormValues,
  counts: CriteriaCounts,
  ctx: { granja: string; galponNumero: string },
): Record<string, string> {
  const galpon = ctx.galponNumero ? `galpón N° ${ctx.galponNumero}` : 'el galpón evaluado';
  const granja = ctx.granja || 'la granja visitada';
  const fecha = v.fecha || 'la fecha registrada';
  const diaLoteTxt = v.dia_lote ? `, día de lote ${v.dia_lote}` : '';
  const { b, r, m, total, pctGood } = counts;

  return {
    objetivos:
      `Evaluar el estado operativo de los sistemas de control, ventilación, alimentación e hidratación del ${galpon} ` +
      `en ${granja}, verificando su correcto funcionamiento y las condiciones ambientales del lote actual` +
      `${diaLoteTxt}, con el fin de identificar hallazgos que puedan afectar el bienestar animal o la eficiencia productiva.`,
    alcance:
      `La presente visita técnica cubrió la inspección del sistema de control y automatización, el tablero de potencia, ` +
      `las variables ambientales, los sistemas de ventilación y refrigeración, y los sistemas mecánicos de alimentación ` +
      `y bebederos del ${galpon} en ${granja}, realizada el ${fecha}. No se incluyen aspectos sanitarios ni de manejo zootécnico.`,
    actividades:
      `Durante la visita se revisaron los sensores instalados y su cobertura, se tomaron lecturas de temperatura, humedad, ` +
      `presión estática, CO2 y amoníaco, se inspeccionó el estado físico del tablero y otros equipos, se realizaron pruebas ` +
      `de emergencia y termografía, se evaluaron los sistemas de ventilación y los sistemas mecánicos de alimentación e ` +
      `hidratación, y se registró evidencia fotográfica de los hallazgos relevantes.`,
    resultados:
      `De los ${total} criterios técnicos evaluados durante la visita, ${b} (${pctGood}%) se encontraron en buen estado, ` +
      `${r} en estado regular y ${m} en estado malo. ` +
      (m > 0
        ? `Los hallazgos más críticos se concentran en los equipos y variables detallados en las secciones anteriores, particularmente aquellos marcados en estado malo.`
        : `No se identificaron equipos en estado crítico durante la evaluación.`),
    conclusiones:
      (pctGood >= 85
        ? `El ${galpon} en ${granja} presenta condiciones generales adecuadas para el desarrollo del lote actual, con la mayoría de los sistemas de control, ventilación y alimentación operando dentro de los parámetros esperados.`
        : pctGood >= 60
          ? `El ${galpon} en ${granja} presenta condiciones aceptables en general, aunque existen equipos y variables en estado regular o malo que deben ser corregidos para asegurar el desempeño óptimo del lote.`
          : `El ${galpon} en ${granja} presenta condiciones que requieren atención, con un número considerable de equipos y variables fuera de los parámetros esperados.`) +
      ` Esta visita permitió documentar de forma objetiva el estado actual de la infraestructura evaluada.`,
    recomendaciones:
      `Se recomienda dar seguimiento prioritario a los equipos y variables registrados en estado malo, y programar mantenimiento ` +
      `preventivo para los que se encuentran en estado regular. Así mismo, se sugiere verificar la calibración de los sensores ` +
      `instalados, mantener actualizado el registro fotográfico de hallazgos y coordinar una próxima visita de seguimiento para ` +
      `confirmar la implementación de las acciones correctivas aquí señaladas.`,
  };
}
