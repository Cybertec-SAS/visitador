import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { structuresApi } from '@/api/structures';
import { farmsApi } from '@/api/farms';
import { projectsApi } from '@/api/projects';
import type { Farm, Structure, StructureStatus } from '@/types/api';
import { STRUCTURE_TYPE_OPTIONS } from '@/constants/structureTypes';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheck,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineAnnotation,
  HiOutlineSwitchVertical,
  HiOutlineCamera,
  HiOutlinePhotograph,
  HiOutlineX,
} from 'react-icons/hi';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  farm_id: z.coerce.number().int().positive('Selecciona una granja'),
  parent_structure_id: z.coerce.number().int().nullable().optional(),
  structure_type: z.string().min(1, 'Selecciona el tipo de estructura'),
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'under_construction', 'retired']),
  description: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
  sort_order: z.coerce.number().int(),
});

interface FormValues {
  farm_id: number;
  parent_structure_id?: number | null;
  structure_type: string;
  name: string;
  code?: string | null;
  status: StructureStatus;
  description?: string | null;
  observations?: string | null;
  sort_order: number;
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: 'Identificación',
    description: 'Granja, tipo y nombre',
    icon: HiOutlineHome,
    fields: ['farm_id', 'structure_type', 'name'] as (keyof FormValues)[],
  },
  {
    title: 'Detalles',
    description: 'Estado y descripción',
    icon: HiOutlineAnnotation,
    fields: [] as (keyof FormValues)[],
  },
];

// ── FieldCard ─────────────────────────────────────────────────────────────────

interface FieldCardProps {
  icon: React.ElementType;
  label: string;
  hint?: string;
  required?: boolean;
  filled: boolean;
  error?: string;
  children: React.ReactNode;
}

function FieldCard({ icon: Icon, label, hint, required, filled, error, children }: FieldCardProps) {
  return (
    <div className={`border rounded-control p-3 transition-colors ${
      error ? 'border-danger/50 bg-red-50/40' : filled ? 'border-primary/30 bg-primary-soft/30' : 'border-line bg-white'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 transition-colors ${filled ? 'bg-primary text-white' : 'bg-input-bg text-muted'}`}>
            {filled ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
          </div>
          <div>
            <span className="text-[13px] font-semibold text-label">
              {label}{required && <span className="text-danger ml-0.5">*</span>}
            </span>
            {hint && <p className="text-[11px] text-muted m-0 leading-tight">{hint}</p>}
          </div>
        </div>
      </div>
      {children}
      {error && <p className="text-[12px] text-danger mt-1.5 m-0">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full min-h-11 border border-line rounded-control px-3.5 py-3 bg-input-bg text-[14px] text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';
const selectClass = `${inputClass} bg-white`;

// ── Main ──────────────────────────────────────────────────────────────────────

export function StructureFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const farmIdParam = searchParams.get('farm_id');
  const projectIdParam = searchParams.get('project_id') ? Number(searchParams.get('project_id')) : undefined;
  const navigate = useNavigate();
  const isEdit = !!id;

  const [step, setStep] = useState(0);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [parentStructures, setParentStructures] = useState<Structure[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Observations photo state
  const [obsRequiresPhoto, setObsRequiresPhoto] = useState(false);
  const [obsPhotoDataUrl, setObsPhotoDataUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { status: 'active', sort_order: 0 },
    mode: 'onTouched',
  });

  const values = watch();
  const selectedFarmId = values.farm_id;

  const requiredFilled = [values.farm_id, values.structure_type, values.name].filter(Boolean).length;
  const progressPct = Math.round((requiredFilled / 3) * 100);

  useEffect(() => {
    async function loadData() {
      try {
        const farmsRes = await farmsApi.list(1, { per_page: 100 });
        setFarms(farmsRes.data);
        if (isEdit) {
          const s = await structuresApi.get(Number(id));
          setValue('farm_id', s.farm_id);
          setValue('parent_structure_id', s.parent_structure_id ?? undefined);
          setValue('structure_type', s.structure_type);
          setValue('name', s.name);
          setValue('code', s.code);
          setValue('status', s.status);
          setValue('description', s.description);
          setValue('observations', s.observations);
          const ta = s.technical_attributes_json as Record<string, unknown> | null;
          if (ta?.observations_requires_photo) setObsRequiresPhoto(true);
          if (typeof ta?.observations_photo_data === 'string') setObsPhotoDataUrl(ta.observations_photo_data);
          setValue('sort_order', s.sort_order);
        } else if (farmIdParam) {
          setValue('farm_id', Number(farmIdParam));
        }
      } catch (err) {
        const msg = (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message
          ?? (err as Error)?.message
          ?? 'Error desconocido';
        console.error('[StructureFormPage] loadData error:', err);
        sileo.error({ title: 'Error al cargar datos', description: msg });
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [id, isEdit, farmIdParam, setValue]);

  useEffect(() => {
    if (!selectedFarmId) return;
    structuresApi.list({ farm_id: selectedFarmId, parent_only: true })
      .then((data) => setParentStructures(data))
      .catch(() => {});
  }, [selectedFarmId]);

  const handleNext = async () => {
    const fields = STEPS[step].fields;
    const valid = fields.length === 0 || await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        parent_structure_id: values.parent_structure_id || null,
        code: values.code || null,
        description: values.description || null,
        observations: values.observations || null,
        technical_attributes_json: {
          observations_requires_photo: obsRequiresPhoto,
          ...(obsRequiresPhoto && obsPhotoDataUrl ? { observations_photo_data: obsPhotoDataUrl } : {}),
        },
      };
      if (isEdit) {
        await structuresApi.update(Number(id), payload);
        sileo.success({ title: 'Estructura actualizada' });
        navigate(projectIdParam ? `/projects/${projectIdParam}` : farmIdParam ? `/structures?farm_id=${farmIdParam}` : '/structures');
      } else {
        const created = await structuresApi.create(payload as Parameters<typeof structuresApi.create>[0]);
        const newId = created?.data?.id ?? (created as unknown as Structure)?.id;
        if (projectIdParam && newId) {
          await projectsApi.addStructure(projectIdParam, newId).catch(() => {});
        }
        sileo.success({ title: projectIdParam ? 'Estructura creada y asociada al proyecto' : 'Estructura creada' });
        navigate(projectIdParam ? `/projects/${projectIdParam}` : farmIdParam ? `/structures?farm_id=${farmIdParam}` : '/structures');
      }
    } catch {
      sileo.error({ title: 'Error al guardar la estructura' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;
  const selectedFarm = farms.find((f) => f.id === Number(values.farm_id));
  const selectedTypeName = STRUCTURE_TYPE_OPTIONS.find((t) => t.code === values.structure_type)?.name;

  if (isLoadingData) return <LoadingSpinner className="mt-12" />;

  return (
    <div className="max-w-2xl">
      <Link
        to={farmIdParam ? `/structures?farm_id=${farmIdParam}` : '/structures'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline mb-5"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a estructuras
      </Link>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">

        {/* ── Step indicator ── */}
        <div className="border border-line rounded-section p-4 bg-white space-y-3">
          <div className="flex items-center gap-0 w-fit">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={i} className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => { if (isDone) setStep(i); }}
                    disabled={!isDone}
                    className={`flex items-center gap-2.5 rounded-control px-3 py-2 transition-colors border-none ${
                      isActive ? 'bg-primary-soft cursor-default'
                        : isDone ? 'hover:bg-primary-soft/60 cursor-pointer bg-transparent'
                        : 'opacity-40 cursor-default bg-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-logo grid place-items-center shrink-0 transition-colors ${
                      isDone || isActive ? 'bg-primary text-white' : 'bg-input-bg text-muted'
                    }`}>
                      {isDone ? <HiOutlineCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="text-left hidden min-[480px]:block">
                      <p className={`text-[13px] font-semibold m-0 ${isActive ? 'text-primary' : isDone ? 'text-heading' : 'text-muted'}`}>
                        {s.title}
                      </p>
                      <p className="text-[11px] text-muted m-0">{s.description}</p>
                    </div>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="w-12 mx-1 shrink-0">
                      <div className="h-0.5 bg-line rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: isDone ? '100%' : '0%' }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-muted">Datos requeridos</span>
              <span className="text-[12px] font-semibold text-primary">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-line rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* ── Step content ── */}
        <div className="border border-line rounded-section p-4 bg-white space-y-3">

          {/* Step 0 — Identificación */}
          {step === 0 && (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-[15px] font-semibold text-heading m-0">¿Qué estructura vas a registrar?</h3>
                <p className="text-[13px] text-muted m-0">Indica la granja, el tipo de instalación y su nombre</p>
              </div>

              <FieldCard icon={HiOutlineOfficeBuilding} label="Granja" hint="¿A qué granja pertenece?" required filled={!!values.farm_id} error={errors.farm_id?.message}>
                <select {...register('farm_id', { valueAsNumber: true })} className={selectClass} autoFocus>
                  <option value="">Selecciona una granja</option>
                  {farms.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
              </FieldCard>

              <FieldCard icon={HiOutlineTag} label="Tipo de estructura" hint="Categoría de la instalación" required filled={!!values.structure_type} error={errors.structure_type?.message}>
                <select {...register('structure_type')} className={selectClass}>
                  <option value="">Selecciona un tipo</option>
                  {STRUCTURE_TYPE_OPTIONS.map(({ code, name }) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </FieldCard>

              <FieldCard icon={HiOutlineHome} label="Nombre" hint="Identificación única dentro de la granja" required filled={!!values.name} error={errors.name?.message}>
                <input
                  {...register('name')}
                  placeholder={`Ej: ${selectedTypeName ?? 'Galpón'} 10`}
                  className={inputClass}
                />
              </FieldCard>

              <FieldCard icon={HiOutlineTag} label="Código" hint="Código corto de referencia (opcional)" filled={!!values.code}>
                <input {...register('code')} placeholder="Ej: G10" className={inputClass} />
              </FieldCard>
            </div>
          )}

          {/* Step 1 — Detalles */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-[15px] font-semibold text-heading m-0">Detalles de la estructura</h3>
                <p className="text-[13px] text-muted m-0">Estado operativo, relación con otras estructuras y notas</p>
              </div>

              {/* Summary del paso anterior */}
              <div className="border border-primary/20 rounded-control p-3 bg-primary-soft/40 space-y-1">
                <p className="text-[11px] font-bold text-primary m-0 uppercase tracking-wide">Estructura</p>
                <p className="text-[13px] text-heading m-0">
                  <span className="text-muted">Granja: </span>{selectedFarm?.nombre ?? '—'}
                  <span className="text-muted ml-3">Tipo: </span>{selectedTypeName ?? '—'}
                  <span className="text-muted ml-3">Nombre: </span>{values.name || '—'}
                </p>
              </div>

              <FieldCard icon={HiOutlineSwitchVertical} label="Estado" hint="Condición operativa actual" filled={!!values.status}>
                <select {...register('status')} className={selectClass}>
                  <option value="active">Activo — en operación normal</option>
                  <option value="inactive">Inactivo — fuera de servicio</option>
                  <option value="under_construction">En construcción — en obras</option>
                  <option value="retired">Retirado — desmantelado</option>
                </select>
              </FieldCard>

              {parentStructures.length > 0 && (
                <FieldCard icon={HiOutlineHome} label="Estructura padre" hint="Si es una sub-estructura, indica el contenedor" filled={!!values.parent_structure_id}>
                  <select
                    {...register('parent_structure_id', { setValueAs: (v) => v === '' ? null : Number(v) })}
                    className={selectClass}
                  >
                    <option value="">Sin estructura padre</option>
                    {parentStructures.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </FieldCard>
              )}

              <FieldCard icon={HiOutlineAnnotation} label="Descripción" hint="Características generales de la instalación" filled={!!values.description}>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Describe brevemente la estructura..."
                  className={`${inputClass} resize-none`}
                />
              </FieldCard>

              {/* Observaciones con opción de foto */}
              <div className={`border rounded-control p-3 transition-colors ${
                obsRequiresPhoto ? 'border-amber-300 bg-amber-50/40' : values.observations ? 'border-primary/30 bg-primary-soft/30' : 'border-line bg-white'
              }`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 transition-colors ${
                      obsRequiresPhoto ? 'bg-amber-500 text-white' : values.observations ? 'bg-primary text-white' : 'bg-input-bg text-muted'
                    }`}>
                      {obsRequiresPhoto ? <HiOutlineCamera className="w-3.5 h-3.5" /> : values.observations ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <HiOutlineAnnotation className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-[13px] font-semibold text-label">Observaciones</span>
                      <p className="text-[11px] text-muted m-0 leading-tight">Notas técnicas adicionales</p>
                    </div>
                  </div>
                  {/* Toggle "Requiere foto" */}
                  <label htmlFor="obs-requires-photo" className="flex items-center gap-2 cursor-pointer shrink-0">
                    <span className={`text-[11px] font-semibold transition-colors ${obsRequiresPhoto ? 'text-amber-600' : 'text-muted'}`}>
                      {obsRequiresPhoto ? 'Con foto' : 'Requiere foto'}
                    </span>
                    <input
                      id="obs-requires-photo"
                      type="checkbox"
                      checked={obsRequiresPhoto}
                      onChange={(e) => {
                        setObsRequiresPhoto(e.target.checked);
                        if (!e.target.checked) setObsPhotoDataUrl(null);
                      }}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-line rounded-full transition-colors peer-checked:bg-amber-500 shrink-0 after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-4" />
                  </label>
                </div>

                {/* Textarea */}
                <textarea
                  {...register('observations')}
                  rows={obsRequiresPhoto ? 2 : 3}
                  placeholder={obsRequiresPhoto ? 'Describe lo que debe quedar documentado en la foto...' : 'Condiciones especiales, restricciones...'}
                  className={`${inputClass} resize-none`}
                />

                {/* Photo section — visible when toggle is ON */}
                {obsRequiresPhoto && (
                  <div className="mt-3 space-y-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setObsPhotoDataUrl(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />

                    {obsPhotoDataUrl ? (
                      <div className="relative rounded-control overflow-hidden border border-amber-200">
                        <img
                          src={obsPhotoDataUrl}
                          alt="Foto de observación"
                          className="w-full max-h-52 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="flex items-center gap-1 bg-black/60 text-white text-[11px] font-semibold px-2 py-1 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
                          >
                            <HiOutlineCamera className="w-3.5 h-3.5" />
                            Cambiar
                          </button>
                          <button
                            type="button"
                            onClick={() => setObsPhotoDataUrl(null)}
                            className="flex items-center gap-1 bg-red-500/80 text-white text-[11px] font-semibold px-2 py-1 rounded-lg backdrop-blur-sm hover:bg-red-600 transition-colors"
                          >
                            <HiOutlineX className="w-3.5 h-3.5" />
                            Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-amber-300 rounded-control py-5 text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <HiOutlinePhotograph className="w-7 h-7 opacity-70" />
                        <span className="text-[13px] font-semibold">Tomar o adjuntar foto</span>
                        <span className="text-[11px] text-amber-500">Cámara o galería de imágenes</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 rounded-btn px-4 py-3 text-sm font-semibold text-muted hover:text-heading border border-line bg-white hover:bg-input-bg transition-colors cursor-pointer"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          ) : <div />}

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
            >
              Siguiente
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(onSubmit)()}
              className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer border-none"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <HiOutlineCheck className="w-4 h-4" />
                  {isEdit ? 'Actualizar estructura' : 'Crear estructura'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
