import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { visitsApi } from '@/api/visits';
import { farmsApi } from '@/api/farms';
import { structuresApi } from '@/api/structures';
import { visitMaterialRequestsApi } from '@/api/visitMaterialRequests';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlinePrinter,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineSave,
  HiOutlinePencil,
} from 'react-icons/hi';
import type { Visit, Farm, Structure, FarmContact, VisitMaterialRequest } from '@/types/api';

// ── Equipment checklist ───────────────────────────────────────────────────────

const EQUIPOS_LIST = [
  'Comedero', 'Bebedero', 'Cortina', 'Sistema de Alimentación', 'Silos',
  'Estructura', 'Malla', 'Falso Techo', 'Extractores', 'Inlets',
  'Portones', 'Sistema Eléctrico', 'Panel Húmedo', 'Calefacción', 'Nebulizadores',
];

// ── Galpón technical data schema ──────────────────────────────────────────────

interface GalponTecnico {
  tipo_encasetamiento: string;
  tipo_estructura: string;
  estado_estructura: string;
  largo: string; ancho: string;
  altura_central: string; altura_lateral: string; altura_muro_lateral: string;
  bodegas_internas: boolean; bodegas_externas: boolean;
  punto_electrico: string; panel_electrico: string;
  techo_refuerzo: boolean; techo_refuerzo_donde: string;
  subdividido: boolean;
  num_cerchas: string; dist_cerchas: string;
  num_correas: string; dist_correas: string;
  desnivel: boolean; desnivel_cuanto: string; desnivel_hacia: string;
  panel_agua: string; entrada_agua: string; altura_tanque: string;
  refuerzo_tolva: boolean; refuerzo_motores: boolean; refuerzo_malacate: boolean;
  tanques_agua: boolean; num_tanques: string; cap_tanque: string;
  gas: boolean; num_gas: string; dist_gas: string; cap_gas: string;
  planchas_silos: boolean; num_silos: string; dist_planchas: string;
  planchas_ancho: string; planchas_largo: string; planchas_espesor: string;
  observaciones: string;
}

const defaultGalpon = (): GalponTecnico => ({
  tipo_encasetamiento: '', tipo_estructura: '', estado_estructura: '',
  largo: '', ancho: '', altura_central: '', altura_lateral: '', altura_muro_lateral: '',
  bodegas_internas: false, bodegas_externas: false,
  punto_electrico: '', panel_electrico: '',
  techo_refuerzo: false, techo_refuerzo_donde: '', subdividido: false,
  num_cerchas: '', dist_cerchas: '', num_correas: '', dist_correas: '',
  desnivel: false, desnivel_cuanto: '', desnivel_hacia: '',
  panel_agua: '', entrada_agua: '', altura_tanque: '',
  refuerzo_tolva: false, refuerzo_motores: false, refuerzo_malacate: false,
  tanques_agua: false, num_tanques: '', cap_tanque: '',
  gas: false, num_gas: '', dist_gas: '', cap_gas: '',
  planchas_silos: false, num_silos: '', dist_planchas: '',
  planchas_ancho: '', planchas_largo: '', planchas_espesor: '',
  observaciones: '',
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const field = (label: string, value: string) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-muted uppercase tracking-wide print:text-[9px]">{label}</span>
    <span className="text-[13px] text-heading font-medium print:text-[11px] print:border-b print:border-gray-400 print:min-h-4.5">
      {value || '—'}
    </span>
  </div>
);

const yesNo = (label: string, value: boolean | null | undefined) => (
  <div className="flex items-center justify-between gap-2 py-1 border-b border-line last:border-none">
    <span className="text-[13px] text-heading print:text-[11px]">{label}</span>
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} print:bg-transparent print:border print:border-gray-400 print:px-3`}>
      {value === null || value === undefined ? '—' : value ? 'SÍ' : 'NO'}
    </span>
  </div>
);

// ── Section accordion ─────────────────────────────────────────────────────────

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-line rounded-section bg-white overflow-hidden print:border-gray-400 print:rounded-none print:break-inside-avoid">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left print:hidden"
      >
        <span className="text-[14px] font-bold text-heading uppercase tracking-wide">{title}</span>
        {open ? <HiOutlineChevronUp className="w-4 h-4 text-muted" /> : <HiOutlineChevronDown className="w-4 h-4 text-muted" />}
      </button>
      <div className="hidden print:block px-4 py-2 border-b border-gray-400 bg-gray-100">
        <span className="text-[11px] font-bold uppercase tracking-wide">{title}</span>
      </div>
      {open && <div className="px-4 py-4 border-t border-line print:hidden">{children}</div>}
      <div className="hidden print:block px-4 py-4">{children}</div>
    </div>
  );
}

// ── Inline text/boolean input ─────────────────────────────────────────────────

const inp = 'w-full border border-line rounded-control px-3 py-2 text-sm bg-input-bg text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary print:hidden';
const pval = 'print:text-[11px] print:border-b print:border-gray-400 print:min-h-4.5 hidden print:block';

// ── Galpón section ────────────────────────────────────────────────────────────

function GalponSection({ structure, galpon, onChange, onSave, saving }: {
  structure: Structure;
  galpon: GalponTecnico;
  onChange: (g: GalponTecnico) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [open, setOpen] = useState(false);
  const s = (k: keyof GalponTecnico, v: string | boolean) => onChange({ ...galpon, [k]: v });

  const row = (label: string, key: keyof GalponTecnico, placeholder?: string) => (
    <div>
      <label className="block text-[11px] text-muted uppercase tracking-wide mb-1 print:hidden">{label}</label>
      <input value={String(galpon[key] ?? '')} onChange={(e) => s(key, e.target.value)}
        placeholder={placeholder} className={inp} />
      <div className={pval}>{field(label, String(galpon[key] ?? ''))}</div>
    </div>
  );

  const tog = (label: string, key: keyof GalponTecnico) => (
    <label className="flex items-center justify-between gap-2 cursor-pointer py-1 border-b border-line last:border-none print:hidden">
      <span className="text-[13px] text-heading">{label}</span>
      <input type="checkbox" checked={Boolean(galpon[key])} onChange={(e) => s(key, e.target.checked)}
        className="sr-only peer" />
      <div className="relative w-9 h-5 bg-line rounded-full transition-colors peer-checked:bg-primary after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-4 shrink-0" />
    </label>
  );

  const sel = (label: string, key: keyof GalponTecnico, opts: { v: string; l: string }[]) => (
    <div>
      <label className="block text-[11px] text-muted uppercase tracking-wide mb-1 print:hidden">{label}</label>
      <select value={String(galpon[key] ?? '')} onChange={(e) => s(key, e.target.value)} className={inp}>
        <option value="">—</option>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <div className={pval}>{field(label, opts.find((o) => o.v === galpon[key])?.l ?? String(galpon[key] ?? ''))}</div>
    </div>
  );

  return (
    <div className="border border-line rounded-section overflow-hidden bg-white print:border-gray-400 print:rounded-none print:break-inside-avoid">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 print:hidden">
        <span className="font-semibold text-heading">Galpón: {structure.name}</span>
        {open ? <HiOutlineChevronUp className="w-4 h-4 text-muted" /> : <HiOutlineChevronDown className="w-4 h-4 text-muted" />}
      </button>
      <div className="hidden print:block px-4 py-2 bg-gray-50 border-b border-gray-400">
        <span className="text-[12px] font-bold uppercase">Galpón: {structure.name}</span>
      </div>

      {open && (
        <div className="px-4 py-4 border-t border-line space-y-5 print:hidden">
          {/* Tipo encasetamiento */}
          {sel('Tipo de encasetamiento', 'tipo_encasetamiento', [
            { v: 'pollo_engorde', l: 'Pollo Engorde' },
            { v: 'reproductora', l: 'Reproductora' },
            { v: 'ponedora_comercial', l: 'Ponedora Comercial' },
          ])}

          {/* Dimensiones */}
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Dimensiones (metros)</p>
            <div className="grid grid-cols-2 gap-2 max-[480px]:grid-cols-1">
              {row('Largo', 'largo', 'ej: 120')}
              {row('Ancho', 'ancho', 'ej: 12')}
              {row('Altura Central', 'altura_central', 'ej: 4.5')}
              {row('Altura Lateral', 'altura_lateral', 'ej: 2.8')}
              {row('Altura Muro Lateral', 'altura_muro_lateral', 'ej: 1.5')}
            </div>
          </div>

          {/* Estructura */}
          <div className="grid grid-cols-2 gap-2 max-[480px]:grid-cols-1">
            {sel('Tipo de estructura', 'tipo_estructura', [{ v: 'metalica', l: 'Metálica' }, { v: 'madera', l: 'Madera' }])}
            {row('Estado de la estructura', 'estado_estructura', 'ej: Bueno')}
          </div>
          <div>
            {tog('Bodegas internas', 'bodegas_internas')}
            {tog('Bodegas externas', 'bodegas_externas')}
          </div>

          {/* Ubicaciones eléctricas */}
          <div className="grid grid-cols-2 gap-2 max-[480px]:grid-cols-1">
            {sel('Punto eléctrico', 'punto_electrico', [{ v: 'cabeza', l: 'Cabeza' }, { v: 'culata', l: 'Culata' }, { v: 'centro', l: 'Centro' }])}
            {sel('Panel eléctrico', 'panel_electrico', [{ v: 'cabeza', l: 'Cabeza' }, { v: 'culata', l: 'Culata' }, { v: 'centro', l: 'Centro' }])}
          </div>

          {/* Techo */}
          {tog('Techo necesita refuerzos', 'techo_refuerzo')}
          {galpon.techo_refuerzo && row('¿Dónde necesita refuerzo?', 'techo_refuerzo_donde')}
          {tog('Galpón subdividido por gradas/vigas', 'subdividido')}

          {/* Cerchas y correas */}
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Distancia entre cerchas y correas</p>
            <div className="grid grid-cols-2 gap-2 max-[480px]:grid-cols-1">
              {row('Número de cerchas', 'num_cerchas')}
              {row('Distancia entre cerchas (m)', 'dist_cerchas')}
              {row('Número de correas', 'num_correas')}
              {row('Distancia entre correas (m)', 'dist_correas')}
            </div>
          </div>

          {/* Desnivel */}
          {tog('Se encontró desnivel', 'desnivel')}
          {galpon.desnivel && (
            <div className="grid grid-cols-2 gap-2">
              {row('¿Cuánto? (cm)', 'desnivel_cuanto')}
              {row('¿Hacia dónde?', 'desnivel_hacia')}
            </div>
          )}

          {/* Agua */}
          <div className="grid grid-cols-2 gap-2 max-[480px]:grid-cols-1">
            {sel('Panel de agua', 'panel_agua', [{ v: 'cabeza', l: 'Cabeza' }, { v: 'culata', l: 'Culata' }, { v: 'centro', l: 'Centro' }])}
            {sel('Entrada de agua', 'entrada_agua', [{ v: 'cabeza', l: 'Cabeza' }, { v: 'culata', l: 'Culata' }, { v: 'centro', l: 'Centro' }])}
          </div>
          {row('Altura del tanque (m)', 'altura_tanque')}

          {/* Refuerzos */}
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Requerimiento de refuerzos</p>
            {tog('Tolva', 'refuerzo_tolva')}
            {tog('Motores', 'refuerzo_motores')}
            {tog('Malacate', 'refuerzo_malacate')}
          </div>

          {/* Instalaciones agua */}
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Instalaciones de agua</p>
            {tog('Tiene tanques de agua', 'tanques_agua')}
            {galpon.tanques_agua && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {row('Cuántos tanques', 'num_tanques')}
                {row('Capacidad del tanque (L)', 'cap_tanque')}
              </div>
            )}
          </div>

          {/* Gas */}
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Instalaciones de gas</p>
            {tog('Tiene reservas de gas', 'gas')}
            {galpon.gas && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {row('Cuántos tanques', 'num_gas')}
                {row('Distancia al galpón (m)', 'dist_gas')}
                {row('Capacidad cilindros', 'cap_gas')}
              </div>
            )}
          </div>

          {/* Silos */}
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Instalación de silos</p>
            {tog('Tiene planchas para silos', 'planchas_silos')}
            {galpon.planchas_silos && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {row('Cuántos silos', 'num_silos')}
                {row('Distancia planchas (m)', 'dist_planchas')}
                {row('Ancho plancha (m)', 'planchas_ancho')}
                {row('Largo plancha (m)', 'planchas_largo')}
                {row('Espesor plancha (m)', 'planchas_espesor')}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-[11px] text-muted uppercase tracking-wide mb-1">Observaciones del galpón</label>
            <textarea value={galpon.observaciones} onChange={(e) => s('observaciones', e.target.value)}
              rows={3} placeholder="Anotaciones relevantes para este galpón..."
              className="w-full border border-line rounded-control px-3 py-2 text-sm bg-input-bg text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <button type="button" disabled={saving} onClick={onSave}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-btn py-2.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors">
            <HiOutlineSave className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar datos del galpón'}
          </button>
        </div>
      )}

      {/* Print version — always visible when printing */}
      <div className="hidden print:block px-4 py-3 space-y-3">
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[11px]">
          <div><b>Tipo encasetamiento:</b> {galpon.tipo_encasetamiento || '—'}</div>
          <div><b>Estructura:</b> {galpon.tipo_estructura || '—'}</div>
          <div><b>Estado:</b> {galpon.estado_estructura || '—'}</div>
        </div>
        <table className="w-full text-[10px] border-collapse">
          <thead><tr className="bg-gray-100">
            {['Largo','Ancho','Altura Central','Altura Lateral','Altura Muro Lat.'].map((h) => (
              <th key={h} className="border border-gray-400 px-1 py-0.5 text-left">{h}</th>
            ))}
          </tr></thead>
          <tbody><tr>
            {[galpon.largo, galpon.ancho, galpon.altura_central, galpon.altura_lateral, galpon.altura_muro_lateral].map((v, i) => (
              <td key={i} className="border border-gray-400 px-1 py-1">{v || '—'}</td>
            ))}
          </tr></tbody>
        </table>
        <div className="grid grid-cols-2 gap-x-4 text-[10px]">
          <div><b>Punto eléctrico:</b> {galpon.punto_electrico || '—'}</div>
          <div><b>Panel eléctrico:</b> {galpon.panel_electrico || '—'}</div>
          <div><b>Cerchas:</b> {galpon.num_cerchas} · {galpon.dist_cerchas}m</div>
          <div><b>Correas:</b> {galpon.num_correas} · {galpon.dist_correas}m</div>
          <div><b>Desnivel:</b> {galpon.desnivel ? `${galpon.desnivel_cuanto}cm → ${galpon.desnivel_hacia}` : 'NO'}</div>
          <div><b>Panel agua:</b> {galpon.panel_agua || '—'} · Entrada: {galpon.entrada_agua || '—'}</div>
        </div>
        {galpon.observaciones && (
          <div className="text-[10px]"><b>Obs:</b> {galpon.observaciones}</div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function VisitaInicialPage() {
  const { id } = useParams<{ id: string }>();
  const visitId = Number(id);

  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [materialRequests, setMaterialRequests] = useState<VisitMaterialRequest[]>([]);

  // Equipment checklist state (derived from material requests)
  const [equipos, setEquipos] = useState<Set<string>>(new Set());
  const [savingEquipos, setSavingEquipos] = useState(false);
  const [savingHospedaje, setSavingHospedaje] = useState(false);

  // Hospedaje fields
  const [hospedaje, setHospedaje] = useState({
    lugar_hospedaje: false,
    servicios_primarios: false,
    lugar_alimentacion: false,
    donde_alimentacion: '',
    observaciones_hospedaje: '',
    galpones_total: '',
    galpones_cotizar: '',
  });

  // Per-galpón data: structureId → GalponTecnico
  const [galponData, setGalponData] = useState<Record<number, GalponTecnico>>({});
  const [savingGalpon, setSavingGalpon] = useState<Record<number, boolean>>({});

  const adminContact = farm?.contacts?.find((c: FarmContact) => c.type === 'administrador');
  const vetContact = farm?.contacts?.find((c: FarmContact) => c.type === 'veterinario');

  useEffect(() => {
    async function load() {
      try {
        const [visitRes, materialsRes] = await Promise.all([
          visitsApi.get(visitId),
          visitMaterialRequestsApi.list(visitId),
        ]);
        const v = visitRes.data;
        setVisit(v);

        const [farmRes, structsRes] = await Promise.all([
          farmsApi.get(v.farm_id),
          structuresApi.list({ farm_id: v.farm_id }),
        ]);
        setFarm(farmRes.data);
        setStructures(structsRes.filter((s) => !s.parent_structure_id));

        // Init per-galpón data from existing technical_attributes_json
        const initial: Record<number, GalponTecnico> = {};
        for (const s of structsRes) {
          const ta = s.technical_attributes_json as Partial<GalponTecnico> | null;
          const dj = s.dimensions_json as Record<string, string> | null;
          initial[s.id] = {
            ...defaultGalpon(),
            ...(ta ?? {}),
            largo: dj?.largo ?? '',
            ancho: dj?.ancho ?? '',
            altura_central: dj?.altura_central ?? '',
            altura_lateral: dj?.altura_lateral ?? '',
            altura_muro_lateral: dj?.altura_muro_lateral ?? '',
          };
        }
        setGalponData(initial);

        // Init equipment checklist from material requests
        const materials = Array.isArray(materialsRes) ? materialsRes : (materialsRes as { data: VisitMaterialRequest[] }).data ?? [];
        setMaterialRequests(materials);
        const checked = new Set(
          materials
            .filter((m) => EQUIPOS_LIST.includes(m.description ?? ''))
            .map((m) => m.description ?? ''),
        );
        setEquipos(checked);

        // Restore hospedaje from visit.context if previously saved
        try {
          const saved = v.context ? JSON.parse(v.context) : null;
          if (saved?.__visita_inicial_hospedaje) setHospedaje(saved.__visita_inicial_hospedaje);
        } catch { /* not JSON, ignore */ }
      } catch {
        sileo.error({ title: 'Error al cargar la visita' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [visitId]);

  // ── Save hospedaje ──────────────────────────────────────────────────────────

  const handleSaveHospedaje = async () => {
    setSavingHospedaje(true);
    try {
      await visitsApi.update(visitId, {
        context: JSON.stringify({ __visita_inicial_hospedaje: hospedaje }),
      });
      sileo.success({ title: 'Hospedaje guardado' });
    } catch {
      sileo.error({ title: 'Error al guardar hospedaje' });
    } finally {
      setSavingHospedaje(false);
    }
  };

  // ── Save equipment checklist ────────────────────────────────────────────────

  const handleSaveEquipos = async () => {
    setSavingEquipos(true);
    try {
      // Delete existing checklist items
      const toDelete = materialRequests.filter((m) => EQUIPOS_LIST.includes(m.description ?? ''));
      await Promise.all(toDelete.map((m) => visitMaterialRequestsApi.delete(m.id)));
      // Create new ones for checked items
      await Promise.all(
        Array.from(equipos).map((equipo) =>
          visitMaterialRequestsApi.create(visitId, {
            description: equipo,
            requested_quantity: 1,
            unit: 'unidad',
          }),
        ),
      );
      sileo.success({ title: 'Equipos guardados' });
    } catch {
      sileo.error({ title: 'Error al guardar equipos' });
    } finally {
      setSavingEquipos(false);
    }
  };

  // ── Save galpón data ─────────────────────────────────────────────────────────

  const handleSaveGalpon = async (structureId: number) => {
    setSavingGalpon((prev) => ({ ...prev, [structureId]: true }));
    const g = galponData[structureId];
    try {
      const { largo, ancho, altura_central, altura_lateral, altura_muro_lateral, ...technical } = g;
      await structuresApi.update(structureId, {
        dimensions_json: { largo, ancho, altura_central, altura_lateral, altura_muro_lateral },
        technical_attributes_json: technical as Record<string, unknown>,
      });
      sileo.success({ title: `Galpón guardado` });
    } catch {
      sileo.error({ title: 'Error al guardar el galpón' });
    } finally {
      setSavingGalpon((prev) => ({ ...prev, [structureId]: false }));
    }
  };

  const voltageLabel: Record<string, string> = { '110V': '110 V', '220V': '220 V' };
  const currentLabel: Record<string, string> = {
    monophase: 'Monofásica', biphase: 'Bifásica', triphase: 'Trifásica',
  };

  if (loading) return <LoadingSpinner className="mt-12" />;
  if (!visit || !farm) return <p className="text-muted p-6">Visita no encontrada.</p>;

  return (
    <>
      {/* ── Print CSS ── */}
      <style>{`
        @media print {
          body { font-family: Arial, sans-serif; font-size: 11px; }
          .no-print { display: none !important; }
          .print-header { display: block !important; }
        }
      `}</style>

      <div className="max-w-2xl space-y-4">
        {/* ── Nav bar ── */}
        <div className="flex items-center justify-between no-print">
          <Link to={`/visits/${visitId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary no-underline">
            <HiOutlineChevronLeft className="w-4 h-4" /> Volver a la visita
          </Link>
          <div className="flex gap-2">
            <Link to={`/farms/${farm.id}/edit`}
              className="flex items-center gap-1 text-xs text-muted border border-line rounded-btn px-3 py-2 hover:bg-input-bg no-underline">
              <HiOutlinePencil className="w-3.5 h-3.5" /> Editar granja
            </Link>
            <button type="button" onClick={() => window.print()}
              className="flex items-center gap-2 bg-primary text-white rounded-btn px-4 py-2 text-sm font-semibold hover:bg-primary-hover transition-colors">
              <HiOutlinePrinter className="w-4 h-4" /> Imprimir / PDF
            </button>
          </div>
        </div>

        {/* ── Print header ── */}
        <div className="hidden print:block border border-gray-400 p-3 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] uppercase font-bold">INSUMMA BG · MANUAL DE PROCESOS OPERATIVOS</p>
              <p className="text-[9px]">GESTIÓN LOGÍSTICA · LOGÍSTICA DE EQUIPOS · MPO-R-01-02-01-12</p>
            </div>
            <div className="text-right">
              <p className="text-[9px]">VERSIÓN: 5.0</p>
              <p className="text-[9px]">{visit.report_date ?? new Date().toLocaleDateString('es-CO')}</p>
            </div>
          </div>
          <p className="text-center text-[12px] font-bold mt-2 uppercase">Acta Técnica de Visita Inicial a Granja</p>
        </div>

        {/* ── Title (screen) ── */}
        <div className="no-print">
          <h2 className="text-xl font-bold text-heading m-0">Visita Inicial</h2>
          <p className="text-sm text-muted mt-0.5">{visit.title}</p>
        </div>

        {/* ── 1. Información General ── */}
        <Section title="Información general de la granja" defaultOpen>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-[480px]:grid-cols-1">
            {field('Nombre del cliente / Razón social', farm.client?.razon_social ?? visit.client?.razon_social ?? '')}
            {field('Nombre de la granja', farm.nombre)}
            {field('Ubicación', [farm.georreference?.address, farm.georreference?.town, farm.georreference?.department].filter(Boolean).join(', '))}
            <div className="col-span-2 max-[480px]:col-span-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-muted uppercase tracking-wide mb-1 print:hidden">Total galpones en la granja</label>
                  <input value={hospedaje.galpones_total} onChange={(e) => setHospedaje((h) => ({ ...h, galpones_total: e.target.value }))}
                    placeholder="ej: 8" className={inp} />
                  <div className={pval}>{field('Total galpones', hospedaje.galpones_total)}</div>
                </div>
                <div>
                  <label className="block text-[11px] text-muted uppercase tracking-wide mb-1 print:hidden">Galpones a cotizar</label>
                  <input value={hospedaje.galpones_cotizar} onChange={(e) => setHospedaje((h) => ({ ...h, galpones_cotizar: e.target.value }))}
                    placeholder="ej: 4" className={inp} />
                  <div className={pval}>{field('Galpones a cotizar', hospedaje.galpones_cotizar)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin */}
          <div className="mt-4 pt-4 border-t border-line">
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Administrador</p>
            <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
              {field('Nombre', adminContact?.name ?? '')}
              {field('Celular', adminContact?.phone ?? '')}
              {field('Correo', adminContact?.email ?? '')}
            </div>
          </div>

          {/* Vet */}
          <div className="mt-4 pt-4 border-t border-line">
            <p className="text-[11px] text-muted uppercase tracking-wide mb-2">Veterinario</p>
            <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
              {field('Nombre', vetContact?.name ?? '')}
              {field('Celular', vetContact?.phone ?? '')}
              {field('Correo', vetContact?.email ?? '')}
            </div>
          </div>
          {!adminContact && !vetContact && (
            <Link to={`/farms/${farm.id}`} className="mt-3 inline-block text-xs text-primary hover:underline no-print">
              + Agregar contactos a la granja
            </Link>
          )}
        </Section>

        {/* ── 2. Equipos a Instalar ── */}
        <Section title="Información de los equipos a instalar">
          <div className="grid grid-cols-3 gap-2 max-[480px]:grid-cols-2 print:grid-cols-5 print:gap-1">
            {EQUIPOS_LIST.map((equipo) => {
              const checked = equipos.has(equipo);
              return (
                <label key={equipo}
                  className={`flex items-center gap-2 border rounded-control px-2.5 py-2 cursor-pointer transition-colors print:hidden ${checked ? 'border-primary bg-primary-soft' : 'border-line bg-white hover:border-primary/40'}`}>
                  <input type="checkbox" checked={checked}
                    onChange={(e) => setEquipos((prev) => {
                      const next = new Set(prev);
                      e.target.checked ? next.add(equipo) : next.delete(equipo);
                      return next;
                    })}
                    className="sr-only" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {checked && <HiOutlineCheck className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[12px] font-medium text-heading">{equipo}</span>
                </label>
              );
            })}
          </div>
          {/* Print version */}
          <div className="hidden print:grid print:grid-cols-5 print:gap-1 print:text-[10px]">
            {EQUIPOS_LIST.map((equipo) => (
              <div key={equipo} className="flex items-center gap-1">
                <div className={`w-3 h-3 border border-gray-600 inline-flex items-center justify-center ${equipos.has(equipo) ? 'bg-gray-800' : ''}`}>
                  {equipos.has(equipo) && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span>{equipo}</span>
              </div>
            ))}
          </div>
          <button type="button" disabled={savingEquipos} onClick={handleSaveEquipos}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white rounded-btn py-2.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 no-print">
            <HiOutlineSave className="w-4 h-4" />
            {savingEquipos ? 'Guardando...' : 'Guardar selección'}
          </button>
        </Section>

        {/* ── 3. Instalaciones Eléctricas ── */}
        <Section title="Instalaciones eléctricas">
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-3 mb-3">
              {field('Voltaje', farm.farm_voltage ? voltageLabel[farm.farm_voltage] ?? farm.farm_voltage : '')}
              {field('Tipo de corriente', farm.farm_electric_current ? currentLabel[farm.farm_electric_current] ?? '' : '')}
              {field('Capacidad transformador (KVA)', farm.transformator_capacity_kva?.toString() ?? '')}
              {field('Instalaciones que alimenta', farm.transformator_are_feeding_installations ?? '')}
            </div>
            {yesNo('¿Tiene transformador propio?', farm.have_own_transformator)}
            {yesNo('¿El transformador alimenta otras instalaciones?', farm.is_transformator_feeds_other_installations)}
          </div>
          <Link to={`/farms/${farm.id}/edit`} className="mt-3 inline-block text-xs text-primary hover:underline no-print">
            Editar información eléctrica
          </Link>
        </Section>

        {/* ── 4. Accesos y Vecinos ── */}
        <Section title="Accesos y vecinos a la granja">
          <div className="space-y-1">
            {yesNo('¿Vías de fácil acceso para tractomulas?', farm.have_easy_access_for_trailer)}
            {yesNo('¿Facilidad para conseguir personal?', farm.staff_availability)}
            {yesNo('¿Bodegas para almacenar equipos?', farm.has_storage_warehouse)}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {field('Vías de acceso', farm.access_ways ?? '')}
            {field('N° bodegas', farm.how_many_warehouses?.toString() ?? '')}
            {field('Vecinos de la granja', farm.neighboring_properties_notes ?? '')}
            {field('Distancia sobre linderos', farm.distance_to_neighbor_boundary_m ? `${farm.distance_to_neighbor_boundary_m} m` : '')}
          </div>
          <Link to={`/farms/${farm.id}/edit`} className="mt-3 inline-block text-xs text-primary hover:underline no-print">
            Editar accesos y vecinos
          </Link>
        </Section>

        {/* ── 5. Hospedaje ── */}
        <Section title="Hospedaje de instaladores">
          <div className="space-y-1 print:hidden">
            {(['lugar_hospedaje', 'servicios_primarios', 'lugar_alimentacion'] as const).map((k) => {
              const labels: Record<string, string> = {
                lugar_hospedaje: '¿Lugar adecuado para hospedaje de instaladores?',
                servicios_primarios: '¿Tiene servicios primarios (agua, luz, baños)?',
                lugar_alimentacion: '¿Tiene lugar cercano para alimentación?',
              };
              return (
                <label key={k} className="flex items-center justify-between gap-2 cursor-pointer py-2 border-b border-line">
                  <span className="text-[13px] text-heading">{labels[k]}</span>
                  <input type="checkbox" checked={hospedaje[k]}
                    onChange={(e) => setHospedaje((h) => ({ ...h, [k]: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="relative w-9 h-5 bg-line rounded-full transition-colors peer-checked:bg-primary after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-4 shrink-0" />
                </label>
              );
            })}
            {hospedaje.lugar_alimentacion && (
              <div className="pt-2">
                <label className="block text-[11px] text-muted uppercase tracking-wide mb-1">¿Dónde?</label>
                <input value={hospedaje.donde_alimentacion}
                  onChange={(e) => setHospedaje((h) => ({ ...h, donde_alimentacion: e.target.value }))}
                  placeholder="Nombre o dirección del lugar" className={inp} />
              </div>
            )}
            <div className="pt-2">
              <label className="block text-[11px] text-muted uppercase tracking-wide mb-1">Observaciones</label>
              <textarea value={hospedaje.observaciones_hospedaje} rows={2}
                onChange={(e) => setHospedaje((h) => ({ ...h, observaciones_hospedaje: e.target.value }))}
                placeholder="Notas sobre hospedaje y servicios..."
                className="w-full border border-line rounded-control px-3 py-2 text-sm bg-input-bg text-heading outline-none focus:border-primary resize-none" />
            </div>
            <button type="button" disabled={savingHospedaje} onClick={handleSaveHospedaje}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-white rounded-btn py-2.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors">
              <HiOutlineSave className="w-4 h-4" />
              {savingHospedaje ? 'Guardando...' : 'Guardar hospedaje'}
            </button>
          </div>
          {/* Print version */}
          <div className="hidden print:block space-y-1">
            {yesNo('Lugar adecuado para hospedaje', hospedaje.lugar_hospedaje)}
            {yesNo('Servicios primarios (agua, luz, baños)', hospedaje.servicios_primarios)}
            {yesNo('Lugar cercano para alimentación', hospedaje.lugar_alimentacion)}
            {hospedaje.donde_alimentacion && field('¿Dónde?', hospedaje.donde_alimentacion)}
            {hospedaje.observaciones_hospedaje && field('Observaciones', hospedaje.observaciones_hospedaje)}
          </div>
        </Section>

        {/* ── 6. Por galpón ── */}
        {structures.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[14px] font-bold text-heading uppercase tracking-wide no-print">
              Información por galpón ({structures.length})
            </h3>
            <div className="hidden print:block border-b border-gray-600 pb-1 mb-2">
              <span className="text-[12px] font-bold uppercase">Información del Galpón</span>
            </div>
            {structures.map((s) => (
              <GalponSection
                key={s.id}
                structure={s}
                galpon={galponData[s.id] ?? defaultGalpon()}
                onChange={(g) => setGalponData((prev) => ({ ...prev, [s.id]: g }))}
                onSave={() => handleSaveGalpon(s.id)}
                saving={savingGalpon[s.id] ?? false}
              />
            ))}
          </div>
        )}

        {structures.length === 0 && (
          <div className="border border-line rounded-section bg-white p-5 text-center no-print">
            <p className="text-sm text-muted">No hay galpones registrados para esta granja.</p>
            <Link to={`/structures/new?farm_id=${farm.id}`}
              className="mt-2 inline-block text-sm text-primary hover:underline">
              + Agregar galpón
            </Link>
          </div>
        )}

        {/* ── Bottom print button ── */}
        <div className="flex justify-end pb-8 no-print">
          <button type="button" onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-white rounded-btn px-6 py-3 text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
            <HiOutlinePrinter className="w-5 h-5" /> Imprimir / Exportar PDF
          </button>
        </div>
      </div>
    </>
  );
}
