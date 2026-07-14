import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { wizardInput } from '@/components/ui/wizard';
import { CriteriaDonut } from './CriteriaDonut';
import { collectCriteria, criteriaCounts, type CriterioEstado } from './report';
import { STATUS_LABEL, SEG_LABEL } from './catalog';
import type { VisitFormValues } from '@/schemas';

export interface VisitReportCtx {
  clienteNombre: string;
  granjaNombre: string;
  galponNumero: string;
}

const BADGE_STYLE: Record<string, string> = {
  b: 'text-field bg-field-soft',
  r: 'text-report bg-report-soft',
  m: 'text-danger bg-red-50',
  n: 'text-muted bg-input-bg',
};

const dash = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v));
const withUnit = (v: unknown, u: string) =>
  v === null || v === undefined || v === '' ? '—' : `${v} ${u}`;
const join = (parts: unknown[]) => parts.filter(Boolean).join(' · ') || '—';

function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-line last:border-0">
      <span className="text-[12px] text-muted">{label}</span>
      <span className="text-[13px] font-medium text-heading text-right break-words">{value}</span>
    </div>
  );
}

function StatusGrid({ items }: { items: CriterioEstado[] }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 gap-1.5 max-[480px]:grid-cols-1 mt-1.5">
      {items.map((c, i) => (
        <div key={i} className="flex items-center justify-between gap-2 border border-line rounded-control px-2.5 py-1.5">
          <span className="text-[12px] text-heading truncate">{c.name}</span>
          <span
            className={`text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0 ${BADGE_STYLE[c.v]}`}
          >
            {STATUS_LABEL[c.v]}
          </span>
        </div>
      ))}
    </div>
  );
}

function ObsBox({ text }: { text?: string | null }) {
  return (
    <div className="text-[13px] text-heading bg-input-bg border border-line rounded-control p-3 whitespace-pre-line">
      {text || 'Sin observaciones registradas.'}
    </div>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wide text-muted mt-3 mb-1">{children}</div>;
}

function RSection({ num, title, children }: { num?: number; title: string; children: ReactNode }) {
  return (
    <section className="border border-line rounded-section p-4 bg-white space-y-1">
      <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-line">
        {num !== undefined && (
          <span className="w-6 h-6 rounded-lg grid place-items-center bg-primary text-white text-[12px] font-bold shrink-0">
            {num}
          </span>
        )}
        <h3 className="text-[15px] font-bold text-heading m-0">{title}</h3>
      </div>
      {children}
    </section>
  );
}

/** Campo de narrativa: editable (register) dentro del wizard, texto en modo lectura. */
function NarrativeField({
  name,
  value,
  editable,
}: {
  name: keyof VisitFormValues['informe'];
  value?: string | null;
  editable: boolean;
}) {
  const methods = useFormContext<VisitFormValues>();
  if (editable && methods) {
    return (
      <textarea
        {...methods.register(`informe.${name}` as const)}
        rows={3}
        className={`${wizardInput} resize-y min-h-20`}
      />
    );
  }
  return <p className="text-[13px] text-heading leading-relaxed whitespace-pre-line m-0">{value || '—'}</p>;
}

interface VisitReportProps {
  values: VisitFormValues;
  ctx: VisitReportCtx;
  /** true dentro del wizard (narrativa editable). */
  editableNarrative?: boolean;
}

export function VisitReport({ values: v, ctx, editableNarrative = false }: VisitReportProps) {
  const sections = collectCriteria(v);
  const counts = criteriaCounts(sections.combined);
  const { b, r, m, n, total, pctGood } = counts;
  const pct = (x: number) => Math.round((x / total) * 100) + '%';

  const tableroObs = [
    v.tablero.obs_fisico && `Tablero: ${v.tablero.obs_fisico}`,
    v.tablero.obs_otros_equipos && `Otros equipos: ${v.tablero.obs_otros_equipos}`,
    v.tablero.termografia.obs && `Termografía: ${v.tablero.termografia.obs}`,
  ]
    .filter(Boolean)
    .join('\n');

  const variablesObs = [
    v.variables.obs_prueba_emergencia && `Prueba de emergencia: ${v.variables.obs_prueba_emergencia}`,
    v.variables.obs_termostatos && `Termostatos: ${v.variables.obs_termostatos}`,
    v.variables.obs_med_ambientales && `Mediciones ambientales: ${v.variables.obs_med_ambientales}`,
  ]
    .filter(Boolean)
    .join('\n');

  const ma = v.variables.med_ambientales;
  const peValues = Object.values(v.variables.prueba_emergencia);
  const peSi = peValues.filter((x) => x === 'si').length;

  return (
    <div className="space-y-3" id="visit-report">
      {/* Header */}
      <div className="border border-line rounded-section p-4 bg-white flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[18px] font-bold text-heading m-0">
            Informe de diagnóstico · Ambiente controlado
          </h2>
          <p className="text-[13px] text-muted m-0">
            {ctx.granjaNombre || 'Granja sin nombre'} · {v.fecha || 'Fecha sin definir'}
          </p>
        </div>
        <div className="text-right text-[11px] text-muted">
          <div>Versión <span className="font-semibold text-heading">1.0</span></div>
          <div>Página <span className="font-semibold text-heading">1 de 1</span></div>
        </div>
      </div>

      {/* Resumen */}
      <div className="border border-line rounded-section p-4 bg-white grid grid-cols-[auto_1fr] gap-5 items-center max-[640px]:grid-cols-1">
        <div className="flex flex-col items-center gap-2">
          <CriteriaDonut counts={counts} />
          <span className="text-[11px] text-muted">
            {total} criterio{total === 1 ? '' : 's'} evaluado{total === 1 ? '' : 's'}
          </span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 max-[480px]:grid-cols-2">
            {[
              { k: 'b', label: 'Bueno', num: b },
              { k: 'r', label: 'Regular', num: r },
              { k: 'm', label: 'Malo', num: m },
              { k: 'n', label: 'N/A', num: n },
            ].map((s) => (
              <div key={s.k} className={`rounded-control p-2.5 text-center ${BADGE_STYLE[s.k]}`}>
                <div className="text-[20px] font-black leading-none">{s.num}</div>
                <div className="text-[11px] font-bold">{pct(s.num)}</div>
                <div className="text-[11px]">{s.label}</div>
              </div>
            ))}
          </div>
          <div
            className={`text-[13px] rounded-control p-3 border ${
              pctGood >= 85
                ? 'border-field/30 bg-field-soft text-field'
                : pctGood >= 60
                  ? 'border-report/30 bg-report-soft text-report'
                  : 'border-danger/30 bg-red-50 text-danger'
            }`}
          >
            <b>{pctGood}%</b> de los {total} criterios evaluados se encuentran en buen estado.
            {m > 0 && ` Se identificaron ${m} criterio${m === 1 ? '' : 's'} en estado malo que requiere${m === 1 ? '' : 'n'} atención prioritaria.`}
            {r > 0 && ` ${r} criterio${r === 1 ? '' : 's'} en estado regular a monitorear.`}
          </div>
        </div>
      </div>

      {/* Introducción */}
      <RSection title="Introducción">
        <SubTitle>Objetivos</SubTitle>
        <NarrativeField name="objetivos" value={v.informe.objetivos} editable={editableNarrative} />
        <SubTitle>Alcance</SubTitle>
        <NarrativeField name="alcance" value={v.informe.alcance} editable={editableNarrative} />
        <SubTitle>Actividades realizadas</SubTitle>
        <NarrativeField name="actividades" value={v.informe.actividades} editable={editableNarrative} />
      </RSection>

      {/* 1. Información general */}
      <RSection num={1} title="Información general">
        <DataRow label="Cliente / razón social" value={dash(ctx.clienteNombre)} />
        <DataRow label="Granja" value={dash(ctx.granjaNombre)} />
        <DataRow label="Ubicación" value={dash(v.ubicacion)} />
        <DataRow label="Fecha de visita" value={dash(v.fecha)} />
        <DataRow label="Total galpones / N° galpón" value={`${dash(v.total_galpones)} / N° ${dash(ctx.galponNumero)}`} />
        <DataRow label="Número de aves" value={withUnit(v.num_aves, 'aves')} />
        <DataRow label="Día de lote" value={v.dia_lote ? `Día ${v.dia_lote}` : '—'} />
        <SubTitle>Contactos</SubTitle>
        <DataRow label="Administrador" value={join([v.contacto.adm_nombre, v.contacto.adm_cel])} />
        <DataRow label="Veterinario" value={join([v.contacto.vet_nombre, v.contacto.vet_cel])} />
        <DataRow label="Correo electrónico" value={dash(v.contacto.correo)} />
      </RSection>

      {/* 2. Control */}
      <RSection num={2} title="Control y automatización">
        <DataRow label="Controlador (marca / modelo)" value={join([v.control.marca, v.control.modelo])} />
        <DataRow label="Serial" value={dash(v.control.serial)} />
        <DataRow label="Versión software" value={dash(v.control.version)} />
        <DataRow
          label="Voltaje AC / DC"
          value={v.control.volt_ac || v.control.volt_dc ? `${dash(v.control.volt_ac)} V AC / ${dash(v.control.volt_dc)} V DC` : '—'}
        />
        <DataRow label="Temperatura" value={withUnit(v.control.lecturas.temp, '°C')} />
        <DataRow label="Humedad relativa" value={withUnit(v.control.lecturas.hum, '%')} />
        <DataRow label="Presión estática" value={withUnit(v.control.lecturas.pres, 'in.H2O')} />
        <DataRow label="CO2" value={withUnit(v.control.lecturas.co2, 'ppm')} />
        <DataRow label="Amoníaco" value={withUnit(v.control.lecturas.amm, 'ppm')} />
        <SubTitle>Estado del equipo y sensores</SubTitle>
        <StatusGrid items={sections.sec2} />
        <SubTitle>Observaciones</SubTitle>
        <ObsBox text={v.control.observaciones} />
      </RSection>

      {/* 3. Tablero */}
      <RSection num={3} title="Tablero de potencia y control">
        <DataRow
          label="L1-L2 / L2-L3 / L1-L3"
          value={v.tablero.mediciones.l1l2 || v.tablero.mediciones.l2l3 || v.tablero.mediciones.l1l3 ? `${dash(v.tablero.mediciones.l1l2)} / ${dash(v.tablero.mediciones.l2l3)} / ${dash(v.tablero.mediciones.l1l3)} V` : '—'}
        />
        <DataRow
          label="L1-N / L2-N / L3-N"
          value={v.tablero.mediciones.l1n || v.tablero.mediciones.l2n || v.tablero.mediciones.l3n ? `${dash(v.tablero.mediciones.l1n)} / ${dash(v.tablero.mediciones.l2n)} / ${dash(v.tablero.mediciones.l3n)} V` : '—'}
        />
        <DataRow label="Temperatura máxima" value={withUnit(v.tablero.termografia.temp_max, '°C')} />
        <DataRow label="Puntos calientes" value={v.tablero.termografia.puntos_calientes ? SEG_LABEL[v.tablero.termografia.puntos_calientes] : '—'} />
        <SubTitle>Estado del tablero y otros equipos</SubTitle>
        <StatusGrid items={sections.sec3} />
        <SubTitle>Observaciones</SubTitle>
        <ObsBox text={tableroObs} />
      </RSection>

      {/* 4. Variables */}
      <RSection num={4} title="Toma de variables">
        <DataRow
          label="Termostatos instalados / operativos"
          value={v.variables.termostatos.instalados || v.variables.termostatos.operativos ? `${dash(v.variables.termostatos.instalados)} / ${dash(v.variables.termostatos.operativos)}` : '—'}
        />
        <DataRow
          label="Prueba de emergencia"
          value={peValues.length ? `${peSi} de ${peValues.length} en SÍ` : '—'}
        />
        <DataRow label="Presión estática (sellamiento)" value={withUnit(ma.presSellamiento?.valor, 'IN.H2O')} />
        <DataRow label="Presión estática (vent. mínima)" value={withUnit(ma.presVentMinima?.valor, 'IN.H2O')} />
        <DataRow label="Velocidad de aire promedio" value={withUnit(ma.velAire?.valor, 'm/s')} />
        <DataRow label="Intensidad de luz" value={withUnit(ma.intensidadLuz?.valor, 'lux')} />
        <SubTitle>Estado de mediciones ambientales</SubTitle>
        <StatusGrid items={sections.sec4} />
        <SubTitle>Observaciones</SubTitle>
        <ObsBox text={variablesObs} />
      </RSection>

      {/* 5. Ventilación */}
      <RSection num={5} title="Ventilación y refrigeración">
        <DataRow label="Extractores (marca / cantidad)" value={join([v.ventilacion.extractores.marca, v.ventilacion.extractores.cantidad])} />
        <DataRow
          label="Inlets (velocidad / cantidad)"
          value={v.ventilacion.inlets.velocidad || v.ventilacion.inlets.cantidad ? `${dash(v.ventilacion.inlets.velocidad)} m/s / ${dash(v.ventilacion.inlets.cantidad)}` : '—'}
        />
        <DataRow
          label="Túnel door (N° puertas / longitud)"
          value={v.ventilacion.tunel.n_puertas || v.ventilacion.tunel.longitud ? `${dash(v.ventilacion.tunel.n_puertas)} / ${dash(v.ventilacion.tunel.longitud)}` : '—'}
        />
        <DataRow label="Moja uniforme" value={SEG_LABEL[v.ventilacion.panel_humedo.moja_uniforme] ?? '—'} />
        <SubTitle>Estado de equipos</SubTitle>
        <StatusGrid items={sections.sec5} />
        <SubTitle>Observaciones</SubTitle>
        <ObsBox text={v.ventilacion.observaciones} />
      </RSection>

      {/* 6. Mecánicos */}
      <RSection num={6} title="Sistemas mecánicos">
        <DataRow
          label="Comedero automático (longitud / líneas)"
          value={v.mecanicos.comedero.longitud || v.mecanicos.comedero.n_lineas ? `${dash(v.mecanicos.comedero.longitud)} / ${dash(v.mecanicos.comedero.n_lineas)}` : '—'}
        />
        <DataRow
          label="Bebedero automático (longitud / líneas)"
          value={v.mecanicos.bebedero.longitud || v.mecanicos.bebedero.n_lineas ? `${dash(v.mecanicos.bebedero.longitud)} / ${dash(v.mecanicos.bebedero.n_lineas)}` : '—'}
        />
        <DataRow
          label="Sistema de alimentación (silos / líneas)"
          value={v.mecanicos.alimentacion.n_silos || v.mecanicos.alimentacion.n_lineas ? `${dash(v.mecanicos.alimentacion.n_silos)} / ${dash(v.mecanicos.alimentacion.n_lineas)}` : '—'}
        />
        <SubTitle>Estado de equipos</SubTitle>
        <StatusGrid items={sections.sec6} />
        <SubTitle>Observaciones</SubTitle>
        <ObsBox text={v.mecanicos.observaciones} />
      </RSection>

      {/* 7. Evidencia */}
      <RSection num={7} title="Evidencia fotográfica">
        {v.evidencia.fotos.length === 0 ? (
          <ObsBox text="No se registraron fotografías durante la visita." />
        ) : (
          <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-2">
            {v.evidencia.fotos.map((f) => (
              <div key={f.id} className="border border-line rounded-control overflow-hidden bg-white">
                <img src={f.url} alt="" className="w-full h-28 object-cover" />
                <div className="text-[11px] text-muted p-2">{f.descripcion || 'Sin descripción.'}</div>
              </div>
            ))}
          </div>
        )}
      </RSection>

      {/* Resultados / conclusiones / recomendaciones */}
      <RSection title="Resultados, conclusiones y recomendaciones">
        <SubTitle>Resultados</SubTitle>
        <NarrativeField name="resultados" value={v.informe.resultados} editable={editableNarrative} />
        <SubTitle>Conclusiones</SubTitle>
        <NarrativeField name="conclusiones" value={v.informe.conclusiones} editable={editableNarrative} />
        <SubTitle>Recomendaciones</SubTitle>
        <NarrativeField name="recomendaciones" value={v.informe.recomendaciones} editable={editableNarrative} />
      </RSection>

      {/* Cierre */}
      <RSection title="Cierre de la visita">
        <DataRow label="Recibe" value={join([v.mecanicos.cierre.recibe_nombre, v.mecanicos.cierre.recibe_firma])} />
        <DataRow label="Realiza" value={join([v.mecanicos.cierre.realiza_nombre, v.mecanicos.cierre.realiza_firma])} />
      </RSection>
    </div>
  );
}
