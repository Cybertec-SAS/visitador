import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { structuresApi } from '@/api/structures';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { sileo } from 'sileo';
import { getStructureTypeName } from '@/constants/structureTypes';
import type { Structure } from '@/types/api';
import {
  HiOutlineChevronLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineHome,
  HiOutlineTag,
  HiOutlineAnnotation,
  HiOutlineCheck,
  HiOutlineCamera,
  HiOutlinePhotograph,
  HiOutlineOfficeBuilding,
  HiOutlineCollection,
  HiOutlineCube,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineSave,
  HiOutlineClock,
} from 'react-icons/hi';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ObservationEntry {
  id: string;
  text: string;
  requires_photo: boolean;
  photo_data: string | null;
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  active:             { label: 'Activo',          color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  inactive:           { label: 'Inactivo',         color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
  under_construction: { label: 'En construcción',  color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  retired:            { label: 'Retirado',         color: 'bg-red-50 text-red-500',      dot: 'bg-red-400' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Observation log panel ─────────────────────────────────────────────────────

function ObservationLog({
  structureId,
  initialEntries,
  onSaved,
}: {
  structureId: number;
  initialEntries: ObservationEntry[];
  onSaved: (entries: ObservationEntry[]) => void;
}) {
  const [entries, setEntries] = useState<ObservationEntry[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New entry state
  const [text, setText] = useState('');
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setText('');
    setRequiresPhoto(false);
    setPhotoData(null);
    setShowForm(false);
  };

  const persist = async (next: ObservationEntry[]) => {
    const ta = await structuresApi.get(structureId).then(
      (s) => (s.technical_attributes_json as Record<string, unknown> | null) ?? {}
    );
    await structuresApi.update(structureId, {
      technical_attributes_json: { ...ta, observation_log: next },
    });
    setEntries(next);
    onSaved(next);
  };

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const entry: ObservationEntry = {
        id: crypto.randomUUID(),
        text: text.trim(),
        requires_photo: requiresPhoto,
        photo_data: requiresPhoto ? photoData : null,
        created_at: new Date().toISOString(),
      };
      await persist([entry, ...entries]);
      resetForm();
      sileo.success({ title: 'Observación guardada' });
    } catch {
      sileo.error({ title: 'Error al guardar la observación' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    setDeletingId(entryId);
    try {
      await persist(entries.filter((e) => e.id !== entryId));
      sileo.success({ title: 'Observación eliminada' });
    } catch {
      sileo.error({ title: 'Error al eliminar' });
    } finally {
      setDeletingId(null);
    }
  };

  const handlePhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-line rounded-section bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <HiOutlineAnnotation className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-semibold text-heading m-0">
            Observaciones
            {entries.length > 0 && (
              <span className="ml-1.5 text-[12px] font-normal text-muted">({entries.length})</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); }}
          className={`flex items-center gap-1.5 text-[13px] font-semibold rounded-btn px-3 py-1.5 border-none cursor-pointer transition-colors ${
            showForm
              ? 'text-muted bg-input-bg hover:bg-line'
              : 'text-primary bg-primary-soft hover:bg-primary hover:text-white'
          }`}
        >
          {showForm ? <><HiOutlineX className="w-3.5 h-3.5" /> Cancelar</> : <><HiOutlinePlus className="w-3.5 h-3.5" /> Agregar</>}
        </button>
      </div>

      {/* New entry form */}
      {showForm && (
        <div className="px-4 py-4 border-b border-line bg-primary-soft/10 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Describe la observación, condición o hallazgo..."
            className="w-full border border-line rounded-control px-3 py-2.5 text-sm bg-white text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder:text-placeholder"
          />

          {/* Toggle requiere foto */}
          <div className={`border rounded-control overflow-hidden transition-colors ${requiresPhoto ? 'border-amber-300 bg-amber-50/40' : 'border-line bg-white'}`}>
            <div className="px-3 py-2.5">
              <label htmlFor="new-obs-photo-toggle" className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <HiOutlineCamera className={`w-4 h-4 ${requiresPhoto ? 'text-amber-500' : 'text-muted'}`} />
                  <span className={`text-[13px] font-medium ${requiresPhoto ? 'text-amber-700' : 'text-heading'}`}>
                    {requiresPhoto ? 'Con foto adjunta' : 'Adjuntar foto'}
                  </span>
                </div>
                <input
                  id="new-obs-photo-toggle"
                  type="checkbox"
                  checked={requiresPhoto}
                  onChange={(e) => { setRequiresPhoto(e.target.checked); if (!e.target.checked) setPhotoData(null); }}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-line rounded-full transition-colors peer-checked:bg-amber-500 shrink-0 after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-4" />
              </label>
            </div>
            {requiresPhoto && (
              <div className="px-3 pb-3 border-t border-amber-200">
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handlePhoto(e.target.files[0]); }}
                />
                {photoData ? (
                  <div className="mt-2 relative rounded-control overflow-hidden border border-amber-200">
                    <img src={photoData} alt="preview" className="w-full max-h-44 object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => photoRef.current?.click()}
                        className="flex items-center gap-1 bg-black/60 text-white text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
                      >
                        <HiOutlineCamera className="w-3.5 h-3.5" /> Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoData(null)}
                        className="flex items-center gap-1 bg-red-500/80 text-white text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <HiOutlineX className="w-3.5 h-3.5" /> Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="mt-2 w-full flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-amber-300 rounded-control py-4 text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <HiOutlinePhotograph className="w-6 h-6 opacity-70" />
                    <span className="text-[12px] font-semibold">Tomar o adjuntar foto</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={saving || !text.trim()}
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary text-white rounded-btn px-4 py-2.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-none cursor-pointer"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><HiOutlineSave className="w-4 h-4" /> Guardar observación</>
            )}
          </button>
        </div>
      )}

      {/* Entries list */}
      {entries.length === 0 && !showForm ? (
        <div className="px-4 py-8 text-center">
          <HiOutlineAnnotation className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-[13px] text-muted m-0">Sin observaciones registradas</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3 text-[13px] text-primary font-semibold hover:underline border-none bg-transparent cursor-pointer"
          >
            + Agregar la primera observación
          </button>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {entries.map((entry) => (
            <div key={entry.id} className="px-4 py-4 space-y-2 group">
              {/* Entry header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatDate(entry.created_at)}</span>
                  {entry.requires_photo && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <HiOutlineCamera className="w-3 h-3" />
                        Con foto
                      </span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  disabled={deletingId === entry.id}
                  onClick={() => handleDelete(entry.id)}
                  className="w-6 h-6 rounded grid place-items-center text-muted hover:text-danger hover:bg-red-50 transition-colors border-none cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                  title="Eliminar observación"
                >
                  {deletingId === entry.id
                    ? <span className="w-3 h-3 border border-muted border-t-transparent rounded-full animate-spin" />
                    : <HiOutlineTrash className="w-3.5 h-3.5" />
                  }
                </button>
              </div>

              {/* Text */}
              <p className="text-[14px] text-heading m-0 leading-relaxed">{entry.text}</p>

              {/* Photo */}
              {entry.photo_data && (
                <div className="rounded-control overflow-hidden border border-amber-200">
                  <img src={entry.photo_data} alt="Foto adjunta" className="w-full max-h-52 object-cover" />
                  <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1.5 m-0 flex items-center gap-1.5">
                    <HiOutlinePhotograph className="w-3.5 h-3.5" />
                    Foto adjunta
                  </p>
                </div>
              )}
              {entry.requires_photo && !entry.photo_data && (
                <div className="border-2 border-dashed border-amber-200 rounded-control px-3 py-2 flex items-center gap-2 text-amber-400">
                  <HiOutlineCamera className="w-3.5 h-3.5 shrink-0" />
                  <p className="text-[12px] m-0">Foto pendiente</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function StructureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [children, setChildren] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [observationLog, setObservationLog] = useState<ObservationEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    structuresApi.get(Number(id))
      .then((s) => {
        setStructure(s);
        const ta = s.technical_attributes_json as Record<string, unknown> | null;
        const log = Array.isArray(ta?.observation_log) ? (ta!.observation_log as ObservationEntry[]) : [];
        setObservationLog(log);
        if (!s.parent_structure_id) {
          return structuresApi.list({ farm_id: s.farm_id }).then((all) =>
            setChildren(all.filter((c) => c.parent_structure_id === s.id))
          );
        }
      })
      .catch(() => {
        sileo.error({ title: 'Estructura no encontrada' });
        navigate('/structures');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!structure) return;
    setIsDeleting(true);
    try {
      await structuresApi.delete(structure.id);
      sileo.success({ title: 'Estructura eliminada' });
      navigate(structure.farm_id ? `/farms/${structure.farm_id}` : '/structures');
    } catch {
      sileo.error({ title: 'Error al eliminar la estructura' });
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!structure) return null;

  const status = STATUS_META[structure.status] ?? { label: structure.status, color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
  const typeName = getStructureTypeName(structure.structure_type);
  const ta = structure.technical_attributes_json as Record<string, unknown> | null;
  const obsRequiresPhoto = Boolean(ta?.observations_requires_photo);
  const obsPhotoData = typeof ta?.observations_photo_data === 'string' ? ta.observations_photo_data : null;
  const dims = structure.dimensions_json as Record<string, string> | null;
  const hasDimensions = dims && Object.values(dims).some(Boolean);

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Back nav */}
      <Link
        to={structure.farm_id ? `/farms/${structure.farm_id}` : '/structures'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        {structure.farm ? `Volver a ${structure.farm.nombre}` : 'Volver a estructuras'}
      </Link>

      {/* Header */}
      <div className="border border-line rounded-section p-4 bg-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-logo grid place-items-center bg-primary-soft shrink-0">
          <HiOutlineHome className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[22px] font-bold text-heading m-0 truncate">{structure.name}</h2>
            {structure.code && (
              <span className="text-[12px] font-mono text-muted bg-input-bg px-2 py-0.5 rounded border border-line shrink-0">
                {structure.code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[13px] text-muted">{typeName}</span>
            <span className="text-muted">·</span>
            <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          {structure.farm && (
            <Link
              to={`/farms/${structure.farm_id}`}
              className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline no-underline mt-0.5"
            >
              <HiOutlineOfficeBuilding className="w-3.5 h-3.5" />
              {structure.farm.nombre}
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Link
            to={`/structures/${structure.id}/edit`}
            className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-[13px] font-semibold bg-primary text-white hover:bg-primary-hover transition-colors no-underline"
          >
            <HiOutlinePencil className="w-3.5 h-3.5" />
            Editar
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-[13px] font-semibold bg-red-50 text-danger hover:bg-danger hover:text-white transition-colors border-none cursor-pointer"
          >
            <HiOutlineTrash className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Estructura padre */}
      {structure.parent && (
        <div className="border border-line rounded-section p-3.5 bg-white flex items-center gap-3">
          <HiOutlineCollection className="w-4 h-4 text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted uppercase tracking-wide m-0">Estructura padre</p>
            <Link
              to={`/structures/${structure.parent.id}`}
              className="text-[14px] font-semibold text-primary hover:underline no-underline"
            >
              {structure.parent.name}
            </Link>
          </div>
        </div>
      )}

      {/* Descripción */}
      {structure.description && (
        <div className="border border-line rounded-section p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineAnnotation className="w-4 h-4 text-primary" />
            <p className="text-[13px] font-semibold text-heading m-0">Descripción</p>
          </div>
          <p className="text-[14px] text-heading m-0 leading-relaxed">{structure.description}</p>
        </div>
      )}

      {/* Dimensiones */}
      {hasDimensions && (
        <div className="border border-line rounded-section p-4 bg-white">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-line">
            <HiOutlineCube className="w-4 h-4 text-primary" />
            <p className="text-[13px] font-semibold text-heading m-0">Dimensiones</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 max-[480px]:grid-cols-1">
            {Object.entries(dims!).map(([k, v]) =>
              v ? (
                <div key={k}>
                  <p className="text-[11px] text-muted uppercase tracking-wide m-0">{k.replace(/_/g, ' ')}</p>
                  <p className="text-[14px] font-medium text-heading m-0 mt-0.5">{v} m</p>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Observación principal del formulario (legacy) */}
      {(structure.observations || obsRequiresPhoto) && (
        <div className={`border rounded-section p-4 bg-white ${obsRequiresPhoto ? 'border-amber-200' : 'border-line'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {obsRequiresPhoto
                ? <HiOutlineCamera className="w-4 h-4 text-amber-500" />
                : <HiOutlineAnnotation className="w-4 h-4 text-primary" />
              }
              <p className="text-[13px] font-semibold text-heading m-0">Observación del formulario</p>
            </div>
            {obsRequiresPhoto && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                <HiOutlineCamera className="w-3 h-3" /> Requiere foto
              </span>
            )}
          </div>
          {structure.observations && (
            <p className="text-[14px] text-heading m-0 leading-relaxed">{structure.observations}</p>
          )}
          {obsPhotoData && (
            <div className="mt-3 rounded-control overflow-hidden border border-amber-200">
              <img src={obsPhotoData} alt="Foto de la observación" className="w-full max-h-64 object-cover" />
              <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1.5 m-0 flex items-center gap-1.5">
                <HiOutlinePhotograph className="w-3.5 h-3.5" /> Foto adjunta
              </p>
            </div>
          )}
          {obsRequiresPhoto && !obsPhotoData && (
            <div className="mt-3 border-2 border-dashed border-amber-200 rounded-control px-4 py-3 flex items-center gap-2 text-amber-500">
              <HiOutlineCamera className="w-4 h-4 shrink-0" />
              <p className="text-[12px] m-0">Foto pendiente — edita la estructura para adjuntarla</p>
            </div>
          )}
        </div>
      )}

      {/* Registro de observaciones */}
      <ObservationLog
        structureId={structure.id}
        initialEntries={observationLog}
        onSaved={setObservationLog}
      />

      {/* Sub-estructuras */}
      {children.length > 0 && (
        <div className="border border-line rounded-section bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div className="flex items-center gap-2">
              <HiOutlineTag className="w-4 h-4 text-primary" />
              <p className="text-[13px] font-semibold text-heading m-0">
                Sub-estructuras <span className="text-muted font-normal">({children.length})</span>
              </p>
            </div>
            <Link
              to={`/structures/new?farm_id=${structure.farm_id}&parent=${structure.id}`}
              className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline no-underline"
            >
              + Agregar
            </Link>
          </div>
          <div className="divide-y divide-line">
            {children.map((child) => {
              const cs = STATUS_META[child.status] ?? STATUS_META.active;
              return (
                <Link
                  key={child.id}
                  to={`/structures/${child.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 no-underline group transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg grid place-items-center bg-primary-soft shrink-0">
                    <HiOutlineHome className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-heading m-0 truncate">{child.name}</p>
                    <p className="text-[11px] text-muted m-0">{getStructureTypeName(child.structure_type)}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cs.color}`}>
                    {cs.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="border border-line rounded-section p-4 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineCheck className="w-4 h-4 text-muted" />
          <p className="text-[13px] font-semibold text-muted m-0 uppercase tracking-wide">Registro</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 max-[480px]:grid-cols-1">
          <div>
            <p className="text-[11px] text-muted m-0">Creado</p>
            <p className="text-[13px] font-medium text-heading m-0 mt-0.5">
              {new Date(structure.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted m-0">Última actualización</p>
            <p className="text-[13px] font-medium text-heading m-0 mt-0.5">
              {new Date(structure.updated_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Eliminar estructura"
        message={`¿Estás seguro de eliminar "${structure.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
