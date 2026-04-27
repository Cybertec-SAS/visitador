import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { useColombiaLocation } from '@/hooks/useColombiaLocation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { visitsApi } from '@/api/visits';
import { visitTypesApi } from '@/api/visitTypes';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import type { VisitType, Client, Farm, VisitStatus } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheck,
  HiOutlineClipboardList,
  HiOutlineLocationMarker,
  HiOutlineAnnotation,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
} from 'react-icons/hi';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  client_id: z.coerce.number().int().positive('Selecciona un cliente'),
  farm_id: z.coerce.number().int().positive('Selecciona una granja'),
  visit_type_id: z.coerce.number().int().positive('Selecciona el tipo de visita'),
  title: z.string().min(1, 'El título es requerido'),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'signed', 'closed', 'cancelled']),
  report_date: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  development: z.string().nullable().optional(),
  general_observations: z.string().nullable().optional(),
  conclusions: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
});

interface FormValues {
  client_id: number;
  farm_id: number;
  visit_type_id: number;
  title: string;
  status: VisitStatus;
  report_date?: string | null;
  city?: string | null;
  department?: string | null;
  subject?: string | null;
  context?: string | null;
  development?: string | null;
  general_observations?: string | null;
  conclusions?: string | null;
  internal_notes?: string | null;
}

// ── Steps config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: 'Identificación',
    description: 'Cliente, granja y tipo',
    icon: HiOutlineClipboardList,
    fields: ['client_id', 'farm_id', 'visit_type_id', 'title'] as (keyof FormValues)[],
  },
  {
    title: 'Ubicación',
    description: 'Lugar, fecha y estado',
    icon: HiOutlineLocationMarker,
    fields: [] as (keyof FormValues)[],
  },
  {
    title: 'Narrativa',
    description: 'Contexto y observaciones',
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

export function VisitFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id') ? Number(searchParams.get('client_id')) : undefined;
  const navigate = useNavigate();
  const isEdit = !!id;

  const [step, setStep] = useState(0);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Prevents the client-change effect from resetting farms during initial edit load
  const skipFarmsEffect = useRef(isEdit);
  // Prevents location auto-fill from overriding the visit's own city/department on edit load
  const skipLocationAutoFill = useRef(isEdit);

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { status: 'draft' },
    mode: 'onTouched',
  });

  const values = watch();
  const selectedClientId = values.client_id;

  const {
    departments,
    cities,
    loadingDepartments,
    loadingCities,
    selectedDepartmentId,
    setSelectedDepartmentId,
    setDepartmentByName,
  } = useColombiaLocation();

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = Number(e.target.value) || null;
    const dept = departments.find((d) => d.id === deptId);
    setSelectedDepartmentId(deptId);
    setValue('department', dept?.name ?? null);
    setValue('city', null);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('city', e.target.value || null);
  };

  // Progress: count filled required fields (client, farm, type, title)
  const requiredFilled = [values.client_id, values.farm_id, values.visit_type_id, values.title].filter(Boolean).length;
  const progressPct = Math.round((requiredFilled / 4) * 100);

  useEffect(() => {
    async function loadData() {
      // Load visit types and clients independently so one failure doesn't block the other
      const [typesRes, clientsRes] = await Promise.allSettled([
        visitTypesApi.list(),
        clientsApi.list(1, { per_page: 100 }).then((r) => r.data),
      ]);
      if (typesRes.status === 'fulfilled') setVisitTypes(typesRes.value);
      else sileo.error({ title: 'No se pudieron cargar los tipos de visita' });

      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value);
      else sileo.error({ title: 'No se pudieron cargar los clientes' });

      if (isEdit) {
        try {
          const res = await visitsApi.get(Number(id));
          const v = res.data;
          setValue('client_id', v.client_id);
          setValue('farm_id', v.farm_id);
          setValue('visit_type_id', v.visit_type_id);
          setValue('title', v.title);
          setValue('subject', v.subject);
          setValue('status', v.status);
          setValue('report_date', v.report_date);
          setValue('city', v.city);
          setValue('department', v.department);
          setDepartmentByName(v.department);
          setValue('context', v.context);
          setValue('development', v.development);
          setValue('general_observations', v.general_observations);
          setValue('conclusions', v.conclusions);
          setValue('internal_notes', v.internal_notes);
          const farmsData = await farmsApi.list(1, { client_id: v.client_id, per_page: 100 }).then((r) => r.data.filter((f) => f.client_id === v.client_id));
          setFarms(farmsData);
        } catch {
          sileo.error({ title: 'No se pudo cargar la visita' });
        }
      }

      if (!isEdit && preselectedClientId) {
        setValue('client_id', preselectedClientId);
      }
      setIsLoadingData(false);
      // Allow the client-change effect and location auto-fill to run from now on
      skipFarmsEffect.current = false;
      skipLocationAutoFill.current = false;
    }
    loadData();
  }, [id, isEdit, setValue]);

  useEffect(() => {
    if (skipFarmsEffect.current) return;
    if (!selectedClientId) { setFarms([]); return; }
    if (!isEdit) setValue('farm_id', undefined as unknown as number);
    farmsApi.list(1, { client_id: selectedClientId, per_page: 100 }).then((r) => setFarms(r.data.filter((f) => f.client_id === selectedClientId))).catch(() => {});
  }, [selectedClientId]);

  const selectedFarmId = values.farm_id;
  const selectedVisitTypeId = values.visit_type_id;

  // Auto-fill city/department from farm georreference when farm changes
  useEffect(() => {
    if (skipLocationAutoFill.current) return;
    if (!selectedFarmId) return;
    farmsApi.get(Number(selectedFarmId)).then((res) => {
      const farm = res.data;
      const geo = farm.georreference;
      if (geo?.department) {
        setDepartmentByName(geo.department);
        setValue('department', geo.department);
      }
      if (geo?.town) {
        setValue('city', geo.town);
      }
    }).catch(() => {});
  }, [selectedFarmId]);

  // Auto-generate title when farm + visit type are selected and title is still empty
  useEffect(() => {
    if (!selectedFarmId || !selectedVisitTypeId) return;
    if (values.title) return;
    const type = visitTypes.find((t) => t.id === Number(selectedVisitTypeId));
    const farm = farms.find((f) => f.id === Number(selectedFarmId));
    if (type && farm) setValue('title', `${type.name} – ${farm.nombre}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFarmId, selectedVisitTypeId]);

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
        subject: values.subject || null,
        report_date: values.report_date || null,
        city: values.city || null,
        department: values.department || null,
        context: values.context || null,
        development: values.development || null,
        general_observations: values.general_observations || null,
        conclusions: values.conclusions || null,
        internal_notes: values.internal_notes || null,
      };
      if (isEdit) {
        await visitsApi.update(Number(id), payload);
        sileo.success({ title: 'Visita actualizada' });
        navigate(`/visits/${id}`);
      } else {
        const res = await visitsApi.create(payload as Parameters<typeof visitsApi.create>[0]);
        const created = (res as { data?: { id: number } }).data ?? (res as unknown as { id: number });
        sileo.success({ title: 'Visita creada' });
        navigate(`/visits/${created.id}`);
      }
    } catch {
      sileo.error({ title: 'Error al guardar la visita' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  const selectedType = visitTypes.find((t) => t.id === Number(values.visit_type_id));
  const selectedClient = clients.find((c) => c.id === Number(values.client_id));
  const selectedFarm = farms.find((f) => f.id === Number(values.farm_id));

  if (isLoadingData) return <LoadingSpinner className="mt-12" />;

  return (
    <div className="max-w-2xl">
      <Link
        to={isEdit ? `/visits/${id}` : '/visits'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline mb-5"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        {isEdit ? 'Volver a la visita' : 'Volver a visitas'}
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
                <h3 className="text-[15px] font-semibold text-heading m-0">¿Qué visita vas a registrar?</h3>
                <p className="text-[13px] text-muted m-0">Vincula la visita a un cliente, granja y tipo</p>
              </div>

              <FieldCard icon={HiOutlineUserGroup} label="Cliente" hint="¿A quién pertenece esta visita?" required filled={!!values.client_id} error={errors.client_id?.message}>
                {preselectedClientId && selectedClient ? (
                  <div className="border border-primary/40 bg-primary-soft/30 rounded-control px-3.5 py-2.5 text-[14px] font-semibold text-heading">
                    {selectedClient.razon_social}
                    <span className="ml-2 text-[11px] font-normal text-muted">NIT {selectedClient.nit}</span>
                  </div>
                ) : (
                  <select {...register('client_id', { valueAsNumber: true })} className={selectClass} autoFocus>
                    <option value="">Selecciona un cliente</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                  </select>
                )}
              </FieldCard>

              <FieldCard icon={HiOutlineOfficeBuilding} label="Granja" hint="Instalación que se va a visitar" required filled={!!values.farm_id} error={errors.farm_id?.message}>
                <select {...register('farm_id', { valueAsNumber: true })} className={selectClass} disabled={!selectedClientId}>
                  <option value="">{selectedClientId ? 'Selecciona una granja' : 'Primero selecciona un cliente'}</option>
                  {farms.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
              </FieldCard>

              <FieldCard icon={HiOutlineTag} label="Tipo de visita" hint="Categoría del reporte técnico" required filled={!!values.visit_type_id} error={errors.visit_type_id?.message}>
                <select {...register('visit_type_id', { valueAsNumber: true })} className={selectClass}>
                  <option value="">Selecciona un tipo</option>
                  {visitTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </FieldCard>

              <FieldCard icon={HiOutlineDocumentText} label="Título" hint="Nombre descriptivo del informe" required filled={!!values.title} error={errors.title?.message}>
                <input
                  {...register('title')}
                  placeholder={`Ej: ${selectedType ? selectedType.name : 'Visita técnica'} — ${selectedFarm ? selectedFarm.nombre : 'Granja Norte'}`}
                  className={inputClass}
                />
              </FieldCard>
            </div>
          )}

          {/* Step 1 — Ubicación & Estado */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-[15px] font-semibold text-heading m-0">¿Cuándo y dónde?</h3>
                <p className="text-[13px] text-muted m-0">Fecha, lugar y estado actual de la visita</p>
              </div>

              {/* Context summary */}
              <div className="border border-primary/20 rounded-control p-3 bg-primary-soft/40 space-y-1.5">
                <p className="text-[11px] font-bold text-primary m-0 uppercase tracking-wide">Visita en curso</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <p className="text-[12px] text-heading m-0"><span className="text-muted">Cliente: </span>{selectedClient?.razon_social ?? '—'}</p>
                  <p className="text-[12px] text-heading m-0"><span className="text-muted">Granja: </span>{selectedFarm?.nombre ?? '—'}</p>
                  <p className="text-[12px] text-heading m-0"><span className="text-muted">Tipo: </span>{selectedType?.name ?? '—'}</p>
                </div>
              </div>

              <FieldCard icon={HiOutlineCalendar} label="Fecha del informe" hint="Día en que se realiza la visita" filled={!!values.report_date}>
                <input {...register('report_date')} type="date" className={inputClass} />
              </FieldCard>

              <div className="grid grid-cols-2 gap-3 max-[540px]:grid-cols-1">
                <FieldCard icon={HiOutlineLocationMarker} label="Departamento" hint="Departamento" filled={!!values.department}>
                  <select
                    value={selectedDepartmentId ?? ''}
                    onChange={handleDepartmentChange}
                    disabled={loadingDepartments}
                    className={`${selectClass} appearance-none`}
                  >
                    <option value="">
                      {loadingDepartments ? 'Cargando...' : 'Selecciona departamento'}
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </FieldCard>
                <FieldCard icon={HiOutlineLocationMarker} label="Municipio" hint="Ciudad donde está la granja" filled={!!values.city}>
                  <select
                    value={values.city ?? ''}
                    onChange={handleCityChange}
                    disabled={!selectedDepartmentId || loadingCities}
                    className={`${selectClass} appearance-none disabled:opacity-50`}
                  >
                    <option value="">
                      {loadingCities
                        ? 'Cargando...'
                        : !selectedDepartmentId
                        ? 'Primero selecciona departamento'
                        : 'Selecciona municipio'}
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </FieldCard>
              </div>

              <FieldCard icon={HiOutlineClipboardList} label="Estado" hint="Situación actual del informe" filled={!!values.status}>
                <select {...register('status')} className={selectClass}>
                  <option value="draft">Borrador — aún en edición</option>
                  <option value="scheduled">Programada — fecha confirmada</option>
                  <option value="in_progress">En progreso — visita activa</option>
                  <option value="completed">Completada — actividad finalizada</option>
                  <option value="signed">Firmada — con firma del cliente</option>
                  <option value="closed">Cerrada — archivada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </FieldCard>
            </div>
          )}

          {/* Step 2 — Narrativa */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-[15px] font-semibold text-heading m-0">Contenido del informe</h3>
                <p className="text-[13px] text-muted m-0">Describe el desarrollo técnico de la visita. Todos los campos son opcionales.</p>
              </div>

              <FieldCard icon={HiOutlineAnnotation} label="Contexto" hint="Antecedentes o motivo de la visita" filled={!!values.context}>
                <textarea {...register('context')} rows={3} placeholder="¿Por qué se realizó esta visita? ¿Qué situación la originó?" className={`${inputClass} resize-none`} />
              </FieldCard>

              <FieldCard icon={HiOutlineAnnotation} label="Desarrollo de actividades" hint="¿Qué se hizo durante la visita?" filled={!!values.development}>
                <textarea {...register('development')} rows={3} placeholder="Describe paso a paso las actividades realizadas..." className={`${inputClass} resize-none`} />
              </FieldCard>

              <FieldCard icon={HiOutlineAnnotation} label="Observaciones generales" hint="Situaciones relevantes encontradas" filled={!!values.general_observations}>
                <textarea {...register('general_observations')} rows={3} placeholder="Hallazgos o situaciones a destacar..." className={`${inputClass} resize-none`} />
              </FieldCard>

              <FieldCard icon={HiOutlineCheck} label="Conclusiones" hint="Cierre y recomendaciones del informe" filled={!!values.conclusions}>
                <textarea {...register('conclusions')} rows={2} placeholder="Síntesis de la visita y próximos pasos..." className={`${inputClass} resize-none`} />
              </FieldCard>

              <FieldCard icon={HiOutlineAnnotation} label="Notas internas" hint="No se imprimen en el PDF final" filled={!!values.internal_notes}>
                <textarea {...register('internal_notes')} rows={2} placeholder="Comentarios privados del equipo técnico..." className={`${inputClass} resize-none bg-amber-50/50`} />
              </FieldCard>
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
                  {isEdit ? 'Actualizar visita' : 'Crear visita'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
