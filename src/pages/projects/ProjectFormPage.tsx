import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectsApi } from '@/api/projects';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import type { Client, Farm, ProjectStatus } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheck,
  HiOutlineCollection,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineCalendar,
  HiOutlineAnnotation,
  HiOutlineSwitchVertical,
} from 'react-icons/hi';

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  client_id: z.coerce.number().int().positive('Selecciona un cliente'),
  farm_id: z.coerce.number().int().positive('Selecciona una granja'),
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

interface FormValues {
  client_id: number;
  farm_id: number;
  name: string;
  code?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: 'Identificación',
    description: 'Cliente, granja y nombre',
    icon: HiOutlineCollection,
    fields: ['client_id', 'farm_id', 'name'] as (keyof FormValues)[],
  },
  {
    title: 'Detalles',
    description: 'Estado, fechas y descripción',
    icon: HiOutlineCalendar,
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

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [step, setStep] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const skipFarmsEffect = useRef(isEdit);

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { status: 'draft' },
    mode: 'onTouched',
  });

  const values = watch();
  const selectedClientId = values.client_id;

  const requiredFilled = [values.client_id, values.farm_id, values.name].filter(Boolean).length;
  const progressPct = Math.round((requiredFilled / 3) * 100);

  useEffect(() => {
    async function loadData() {
      try {
        const clientsData = await clientsApi.list(1, { per_page: 100 }).then((r) => r.data);
        setClients(clientsData);
        if (isEdit) {
          const res = await projectsApi.get(Number(id));
          const p = res.data;
          setValue('client_id', p.client_id);
          setValue('farm_id', p.farm_id);
          setValue('name', p.name);
          setValue('code', p.code);
          setValue('status', p.status);
          setValue('start_date', p.start_date);
          setValue('end_date', p.end_date);
          setValue('description', p.description);
          const farmsData = await farmsApi.list(1, { client_id: p.client_id, per_page: 100 }).then((r) => r.data);
          setFarms(farmsData);
        }
      } catch {
        sileo.error({ title: 'Error al cargar datos' });
      } finally {
        setIsLoadingData(false);
        skipFarmsEffect.current = false;
      }
    }
    loadData();
  }, [id, isEdit, setValue]);

  useEffect(() => {
    if (skipFarmsEffect.current) return;
    if (!selectedClientId) { setFarms([]); return; }
    if (!isEdit) setValue('farm_id', undefined as unknown as number);
    farmsApi.list(1, { client_id: selectedClientId, per_page: 100 }).then((r) => setFarms(r.data)).catch(() => {});
  }, [selectedClientId]);

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
        code: values.code || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        description: values.description || null,
      };
      if (isEdit) {
        await projectsApi.update(Number(id), payload);
        sileo.success({ title: 'Proyecto actualizado' });
        navigate(`/projects/${id}`);
      } else {
        const res = await projectsApi.create(payload as Parameters<typeof projectsApi.create>[0]);
        sileo.success({ title: 'Proyecto creado' });
        navigate(`/projects/${res.data.id}`);
      }
    } catch {
      sileo.error({ title: 'Error al guardar el proyecto' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;
  const selectedClient = clients.find((c) => c.id === Number(values.client_id));
  const selectedFarm = farms.find((f) => f.id === Number(values.farm_id));

  if (isLoadingData) return <LoadingSpinner className="mt-12" />;

  return (
    <div className="max-w-2xl">
      <Link
        to={isEdit ? `/projects/${id}` : '/projects'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline mb-5"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        {isEdit ? 'Volver al proyecto' : 'Volver a proyectos'}
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
                <h3 className="text-[15px] font-semibold text-heading m-0">¿Qué proyecto vas a registrar?</h3>
                <p className="text-[13px] text-muted m-0">Vincula el proyecto a un cliente y granja</p>
              </div>

              <FieldCard icon={HiOutlineUserGroup} label="Cliente" hint="Propietario del proyecto" required filled={!!values.client_id} error={errors.client_id?.message}>
                <select {...register('client_id', { valueAsNumber: true })} className={selectClass} autoFocus>
                  <option value="">Selecciona un cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                </select>
              </FieldCard>

              <FieldCard icon={HiOutlineOfficeBuilding} label="Granja" hint="Instalación donde se ejecuta el proyecto" required filled={!!values.farm_id} error={errors.farm_id?.message}>
                <select {...register('farm_id', { valueAsNumber: true })} className={selectClass} disabled={!selectedClientId}>
                  <option value="">{selectedClientId ? 'Selecciona una granja' : 'Primero selecciona un cliente'}</option>
                  {farms.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
              </FieldCard>

              <FieldCard icon={HiOutlineCollection} label="Nombre del proyecto" hint="Título descriptivo del proyecto" required filled={!!values.name} error={errors.name?.message}>
                <input
                  {...register('name')}
                  placeholder={`Ej: Montaje Galpones — ${selectedFarm?.nombre ?? 'Granja Norte'}`}
                  className={inputClass}
                />
              </FieldCard>

              <FieldCard icon={HiOutlineTag} label="Código" hint="Referencia interna del proyecto (opcional)" filled={!!values.code}>
                <input {...register('code')} placeholder="Ej: PROY-2026-001" className={inputClass} />
              </FieldCard>
            </div>
          )}

          {/* Step 1 — Detalles */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-[15px] font-semibold text-heading m-0">Detalles del proyecto</h3>
                <p className="text-[13px] text-muted m-0">Estado, cronograma y descripción</p>
              </div>

              {/* Resumen */}
              <div className="border border-primary/20 rounded-control p-3 bg-primary-soft/40 space-y-1">
                <p className="text-[11px] font-bold text-primary m-0 uppercase tracking-wide">Proyecto</p>
                <p className="text-[13px] text-heading m-0">
                  <span className="text-muted">Cliente: </span>{selectedClient?.razon_social ?? '—'}
                  <span className="text-muted ml-3">Granja: </span>{selectedFarm?.nombre ?? '—'}
                </p>
                <p className="text-[13px] font-semibold text-heading m-0">{values.name || '—'}</p>
              </div>

              <FieldCard icon={HiOutlineSwitchVertical} label="Estado" hint="Fase actual del proyecto" filled={!!values.status}>
                <select {...register('status')} className={selectClass}>
                  <option value="draft">Borrador — en planeación</option>
                  <option value="active">Activo — en ejecución</option>
                  <option value="paused">Pausado — detenido temporalmente</option>
                  <option value="completed">Completado — entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </FieldCard>

              <div className="grid grid-cols-2 gap-3 max-[540px]:grid-cols-1">
                <FieldCard icon={HiOutlineCalendar} label="Fecha de inicio" hint="Inicio de actividades" filled={!!values.start_date}>
                  <input {...register('start_date')} type="date" className={inputClass} />
                </FieldCard>
                <FieldCard icon={HiOutlineCalendar} label="Fecha de fin" hint="Entrega estimada" filled={!!values.end_date}>
                  <input {...register('end_date')} type="date" className={inputClass} />
                </FieldCard>
              </div>

              <FieldCard icon={HiOutlineAnnotation} label="Descripción" hint="Alcance y objetivos del proyecto" filled={!!values.description}>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe el alcance, objetivos y consideraciones del proyecto..."
                  className={`${inputClass} resize-none`}
                />
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
                  {isEdit ? 'Actualizar proyecto' : 'Crear proyecto'}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
