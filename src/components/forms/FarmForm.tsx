import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmSchema, type FarmFormValues } from '@/schemas';
import type { Client, Farm } from '@/types/api';
import {
  HiOutlineUserGroup,
  HiOutlineLightningBolt,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineCheck,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineCog,
  HiOutlineAnnotation,
} from 'react-icons/hi';

interface FarmFormProps {
  onSubmit: (data: FarmFormValues) => Promise<void>;
  clients: Client[];
  defaultValues?: Farm;
  preselectedClientId?: number;
  isLoading: boolean;
}

const STEPS = [
  {
    title: 'Cliente & Granja',
    description: 'Vinculación básica',
    icon: HiOutlineUserGroup,
    requiredFields: ['client_id', 'nombre'] as (keyof FarmFormValues)[],
  },
  {
    title: 'Sistema eléctrico',
    description: 'Voltaje y transformador',
    icon: HiOutlineLightningBolt,
    requiredFields: [] as (keyof FarmFormValues)[],
  },
  {
    title: 'Infraestructura',
    description: 'Acceso y bodegas',
    icon: HiOutlineHome,
    requiredFields: [] as (keyof FarmFormValues)[],
  },
  {
    title: 'Resumen',
    description: 'Revisa y confirma',
    icon: HiOutlineClipboardList,
    requiredFields: [] as (keyof FarmFormValues)[],
  },
];

export function FarmForm({ onSubmit, clients, defaultValues, preselectedClientId, isLoading }: FarmFormProps) {
  const [step, setStep] = useState(0);
  const isEdit = !!defaultValues;
  const isClientLocked = isEdit || !!preselectedClientId;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    mode: 'onTouched',
    defaultValues: defaultValues
      ? {
          client_id: defaultValues.client_id,
          nombre: defaultValues.nombre,
          transformator_capacity_kva: defaultValues.transformator_capacity_kva ?? undefined,
          access_ways: defaultValues.access_ways ?? undefined,
          observations: defaultValues.observations ?? undefined,
          farm_voltage: defaultValues.farm_voltage ?? undefined,
          farm_electric_current: defaultValues.farm_electric_current ?? undefined,
          have_own_transformator: defaultValues.have_own_transformator ?? undefined,
          is_transformator_feeds_other_installations:
            defaultValues.is_transformator_feeds_other_installations ?? undefined,
          transformator_are_feeding_installations:
            defaultValues.transformator_are_feeding_installations ?? undefined,
          have_easy_access_for_trailer:
            defaultValues.have_easy_access_for_trailer ?? undefined,
          staff_availability: defaultValues.staff_availability ?? undefined,
          has_storage_warehouse: defaultValues.has_storage_warehouse ?? undefined,
          how_many_warehouses: defaultValues.how_many_warehouses ?? undefined,
          total_galpones: defaultValues.total_galpones ?? undefined,
          galpones_a_cotizar: defaultValues.galpones_a_cotizar ?? undefined,
        }
      : preselectedClientId
        ? { client_id: preselectedClientId }
        : undefined,
  });

  const values = watch();

  const handleNext = async () => {
    const fields = STEPS[step].requiredFields;
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const inputClass =
    'w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';

  const selectedClient = clients.find((c) => c.id === Number(values.client_id));

  // Count filled optional fields for progress
  const optionalFilled = [
    values.farm_voltage,
    values.farm_electric_current,
    values.transformator_capacity_kva,
    values.access_ways,
    values.total_galpones,
    values.galpones_a_cotizar,
    values.observations,
  ].filter((v) => v !== undefined && v !== '' && v !== null).length;

  const requiredFilled = values.client_id && values.nombre ? 2 : values.client_id || values.nombre ? 1 : 0;
  const totalFilled = requiredFilled + optionalFilled;
  const progressPct = Math.min((totalFilled / 9) * 100, 100);

  const voltageLabel: Record<string, string> = { '110V': '110V', '220V': '220V', '440V': '440V' };
  const currentLabel: Record<string, string> = {
    monophase: 'Monofásica',
    biphase: 'Bifásica',
    triphase: 'Trifásica',
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
      {/* ── Step indicator ── */}
      <div className="border border-line rounded-section p-4 bg-white space-y-3">
        <div className="flex items-center gap-0 overflow-x-auto pb-1 w-fit max-w-full">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={i} className="flex items-center shrink-0 last:shrink">
                <button
                  type="button"
                  onClick={() => { if (isDone) setStep(i); }}
                  disabled={!isDone}
                  className={`flex items-center gap-2 rounded-control px-2.5 py-2 transition-colors border-none ${
                    isActive
                      ? 'bg-primary-soft cursor-default'
                      : isDone
                        ? 'hover:bg-primary-soft/60 cursor-pointer bg-transparent'
                        : 'opacity-35 cursor-default bg-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 transition-colors ${
                      isDone || isActive ? 'bg-primary text-white' : 'bg-input-bg text-muted'
                    }`}
                  >
                    {isDone ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden min-[560px]:block">
                    <p className={`text-[12px] font-semibold m-0 ${isActive ? 'text-primary' : isDone ? 'text-heading' : 'text-muted'}`}>
                      {s.title}
                    </p>
                    <p className="text-[11px] text-muted m-0">{s.description}</p>
                  </div>
                  {/* Mobile: step number */}
                  <span className={`text-[12px] font-bold min-[560px]:hidden ${isActive ? 'text-primary' : isDone ? 'text-heading' : 'text-muted'}`}>
                    {i + 1}
                  </span>
                </button>

                {i < STEPS.length - 1 && (
                  <div className="w-6 mx-1 shrink-0">
                    <div className="h-0.5 bg-line rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: isDone ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-muted">
              Paso {step + 1} de {STEPS.length} — {STEPS[step].title}
            </span>
            <span className="text-[12px] font-semibold text-primary">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="border border-line rounded-section p-4 bg-white space-y-3">

        {/* ── STEP 0: Cliente & Granja ── */}
        {step === 0 && (
          <div className="space-y-3">
            <StepHeader
              icon={HiOutlineUserGroup}
              title="Cliente y nombre de la granja"
              desc="Estos datos son obligatorios para continuar"
            />

            <div>
              <label className="text-[13px] font-semibold text-label block mb-1.5">
                Cliente <span className="text-danger">*</span>
              </label>
              {isClientLocked ? (
                <div className="flex items-center gap-3 border border-primary/30 bg-primary-soft/30 rounded-control px-3.75 py-3">
                  <HiOutlineUserGroup className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-heading m-0 truncate">
                      {clients.find((c) => c.id === Number(values.client_id))?.razon_social ?? '—'}
                    </p>
                    <p className="text-[11px] text-muted m-0">
                      {isEdit ? 'No se puede cambiar al editar' : 'Cliente pre-seleccionado'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <HiOutlineUserGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
                    <select
                      {...register('client_id', { setValueAs: (v) => (v === '' ? 0 : Number(v)) })}
                      className={`${inputClass} pl-10 appearance-none`}
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.razon_social} — {c.nit}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.client_id && (
                    <p className="text-[12px] text-danger mt-1.5">{errors.client_id.message}</p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="text-[13px] font-semibold text-label block mb-1.5">
                Nombre de la granja <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <HiOutlineOfficeBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted pointer-events-none" />
                <input
                  {...register('nombre')}
                  placeholder="Ej: Granja El Porvenir"
                  autoFocus={!isEdit}
                  className={`${inputClass} pl-10`}
                />
              </div>
              {errors.nombre && (
                <p className="text-[12px] text-danger mt-1.5">{errors.nombre.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 1: Eléctrico ── */}
        {step === 1 && (
          <div className="space-y-3">
            <StepHeader
              icon={HiOutlineLightningBolt}
              title="Sistema eléctrico"
              desc="Activa cada opción para revelar los campos relacionados"
            />

            {/* Voltaje y corriente — siempre visibles */}
            <div className="grid grid-cols-2 gap-3.5 max-[580px]:grid-cols-1">
              <div>
                <label className="text-[13px] font-semibold text-label block mb-1.5">Voltaje</label>
                <select
                  {...register('farm_voltage', { setValueAs: (v) => (v === '' ? undefined : v) })}
                  className={inputClass}
                >
                  <option value="">Sin especificar</option>
                  <option value="110V">110V</option>
                  <option value="220V">220V</option>
                  <option value="440V">440V</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-label block mb-1.5">
                  Corriente eléctrica
                </label>
                <select
                  {...register('farm_electric_current', { setValueAs: (v) => (v === '' ? undefined : v) })}
                  className={inputClass}
                >
                  <option value="">Sin especificar</option>
                  <option value="monophase">Monofásica</option>
                  <option value="biphase">Bifásica</option>
                  <option value="triphase">Trifásica</option>
                </select>
              </div>
            </div>

            {/* Switch cards con progressive disclosure */}
            <div className="space-y-2">
              {/* Transformador propio */}
              <div className={`border rounded-control overflow-hidden transition-colors ${values.have_own_transformator ? 'border-primary/40 bg-primary-soft/30' : 'border-line bg-white'}`}>
                <div className="px-4 py-3">
                  <ToggleField
                    id="have_own_transformator"
                    label="Tiene transformador propio"
                    {...register('have_own_transformator')}
                  />
                </div>
                {values.have_own_transformator && (
                  <div className="px-4 pb-3 border-t border-primary/20">
                    <label className="text-[13px] font-semibold text-label block mb-1.5 mt-3">
                      Capacidad del transformador (KVA)
                    </label>
                    <div className="relative">
                      <HiOutlineCog className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                      <input
                        type="number"
                        min={0}
                        placeholder="Ej: 50"
                        {...register('transformator_capacity_kva', {
                          setValueAs: (v) => (v === '' ? undefined : Number(v)),
                        })}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Alimenta otras instalaciones */}
              <div className={`border rounded-control overflow-hidden transition-colors ${values.is_transformator_feeds_other_installations ? 'border-primary/40 bg-primary-soft/30' : 'border-line bg-white'}`}>
                <div className="px-4 py-3">
                  <ToggleField
                    id="is_transformator_feeds"
                    label="El transformador alimenta otras instalaciones"
                    {...register('is_transformator_feeds_other_installations')}
                  />
                </div>
                {values.is_transformator_feeds_other_installations && (
                  <div className="px-4 pb-3 border-t border-primary/20">
                    <label className="text-[13px] font-semibold text-label block mb-1.5 mt-3">
                      ¿Qué instalaciones alimenta?
                    </label>
                    <input
                      {...register('transformator_are_feeding_installations')}
                      placeholder="Ej: Galpones, oficinas, vivienda..."
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Infraestructura ── */}
        {step === 2 && (
          <div className="space-y-3">
            <StepHeader
              icon={HiOutlineHome}
              title="Acceso e infraestructura"
              desc="Activa cada opción para revelar los campos relacionados"
            />

            {/* Switch cards with progressive disclosure */}
            <div className="space-y-2">
              {/* Tractomula access */}
              <div className={`border rounded-control overflow-hidden transition-colors ${values.have_easy_access_for_trailer ? 'border-primary/40 bg-primary-soft/30' : 'border-line bg-white'}`}>
                <div className="px-4 py-3">
                  <ToggleField
                    id="have_easy_access_for_trailer"
                    label="Acceso fácil para tractomula"
                    {...register('have_easy_access_for_trailer')}
                  />
                </div>
                {values.have_easy_access_for_trailer && (
                  <div className="px-4 pb-3 border-t border-primary/20">
                    <label className="text-[12px] font-semibold text-label block mb-1.5 mt-3">
                      Describe las vías de acceso
                    </label>
                    <div className="relative">
                      <HiOutlineLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                      <input
                        {...register('access_ways')}
                        placeholder="Ej: Carretera pavimentada 2km hasta la entrada"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Staff availability */}
              <div className={`border rounded-control px-4 py-3 transition-colors ${values.staff_availability ? 'border-primary/40 bg-primary-soft/30' : 'border-line bg-white'}`}>
                <ToggleField
                  id="staff_availability"
                  label="Se puede conseguir personal no menor de edad para ayudar en la instalación"
                  {...register('staff_availability')}
                />
              </div>

              {/* Storage warehouse */}
              <div className={`border rounded-control overflow-hidden transition-colors ${values.has_storage_warehouse ? 'border-primary/40 bg-primary-soft/30' : 'border-line bg-white'}`}>
                <div className="px-4 py-3">
                  <ToggleField
                    id="has_storage_warehouse"
                    label="Tiene bodega de almacenamiento"
                    {...register('has_storage_warehouse')}
                  />
                </div>
                {values.has_storage_warehouse && (
                  <div className="px-4 pb-3 border-t border-primary/20">
                    <label className="text-[12px] font-semibold text-label block mb-1.5 mt-3">
                      ¿Cuántas bodegas tiene?
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Ej: 2"
                      {...register('how_many_warehouses', {
                        setValueAs: (v) => (v === '' ? undefined : Number(v)),
                      })}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-[580px]:grid-cols-1">
              <div>
                <label className="text-[13px] font-semibold text-label block mb-1.5">
                  Total galpones
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ej: 2"
                  {...register('total_galpones', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                  })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-label block mb-1.5">
                  Galpones a cotizar
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ej: 2"
                  {...register('galpones_a_cotizar', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                  })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Resumen ── */}
        {step === 3 && (
          <div className="space-y-3">
            <StepHeader
              icon={HiOutlineClipboardList}
              title="Resumen y confirmación"
              desc="Revisa los datos antes de guardar"
            />

            <div className="space-y-3">
              {/* Card: básico */}
              <SummaryCard
                icon={HiOutlineUserGroup}
                title="Cliente & Granja"
                onEdit={() => setStep(0)}
                items={[
                  { label: 'Cliente', value: selectedClient?.razon_social ?? '—' },
                  { label: 'Granja', value: values.nombre || '—' },
                ]}
              />

              {/* Card: eléctrico */}
              <SummaryCard
                icon={HiOutlineLightningBolt}
                title="Sistema eléctrico"
                onEdit={() => setStep(1)}
                items={[
                  { label: 'Voltaje', value: values.farm_voltage ? voltageLabel[values.farm_voltage] : 'No especificado' },
                  { label: 'Corriente', value: values.farm_electric_current ? currentLabel[values.farm_electric_current] : 'No especificado' },
                  { label: 'Capacidad (KVA)', value: values.transformator_capacity_kva?.toString() ?? 'No especificado' },
                  { label: 'Transformador propio', value: values.have_own_transformator ? 'Sí' : 'No' },
                ]}
              />

              {/* Card: infraestructura */}
              <SummaryCard
                icon={HiOutlineHome}
                title="Infraestructura"
                onEdit={() => setStep(2)}
                items={[
                  { label: 'Vías de acceso', value: values.access_ways || 'No especificado' },
                  { label: 'Acceso tráiler', value: values.have_easy_access_for_trailer ? 'Sí' : 'No' },
                  { label: 'Personal disponible', value: values.staff_availability ? 'Sí' : 'No' },
                  { label: 'Tiene bodega', value: values.has_storage_warehouse ? 'Sí' : 'No' },
                  { label: 'N° bodegas', value: values.how_many_warehouses?.toString() ?? 'No especificado' },
                  { label: 'Total galpones', value: values.total_galpones?.toString() ?? 'No especificado' },
                  { label: 'Galpones a cotizar', value: values.galpones_a_cotizar?.toString() ?? 'No especificado' },
                ]}
              />
            </div>

            {/* Observaciones */}
            <div>
              <label className="text-[13px] font-semibold text-label block mb-1.5">
                Observaciones adicionales
              </label>
              <div className="relative">
                <HiOutlineAnnotation className="absolute left-3.5 top-3.5 w-4 h-4 text-muted pointer-events-none" />
                <textarea
                  {...register('observations')}
                  rows={3}
                  placeholder="Notas adicionales sobre la granja..."
                  className={`${inputClass} pl-10 min-h-22.5 resize-none`}
                />
              </div>
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
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
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
            disabled={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer border-none"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <HiOutlineCheck className="w-4 h-4" />
                {isEdit ? 'Actualizar granja' : 'Crear granja'}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

// ── StepHeader ───────────────────────────────────────────────────────────────
function StepHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-line">
      <div className="w-9 h-9 rounded-logo grid place-items-center bg-primary-soft shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-heading m-0">{title}</h3>
        <p className="text-[13px] text-muted m-0">{desc}</p>
      </div>
    </div>
  );
}

// ── ToggleField ──────────────────────────────────────────────────────────────
import { forwardRef } from 'react';

interface ToggleFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

const ToggleField = forwardRef<HTMLInputElement, ToggleFieldProps>(
  ({ id, label, ...props }, ref) => (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-3 cursor-pointer group"
    >
      <span className="text-[13px] text-heading">{label}</span>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        {...props}
        className="sr-only peer"
      />
      <div className="relative w-10 h-5.5 bg-line rounded-full transition-colors peer-checked:bg-primary shrink-0 after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:w-4.5 after:h-4.5 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-4.5" />
    </label>
  ),
);
ToggleField.displayName = 'ToggleField';

// ── SummaryCard ──────────────────────────────────────────────────────────────
function SummaryCard({
  icon: Icon,
  title,
  items,
  onEdit,
}: {
  icon: React.ElementType;
  title: string;
  items: { label: string; value: string }[];
  onEdit: () => void;
}) {
  return (
    <div className="border border-line rounded-control p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-[13px] font-semibold text-heading">{title}</span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-[12px] text-primary hover:underline font-medium cursor-pointer border-none bg-transparent"
        >
          Editar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-[480px]:grid-cols-1">
        {items.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[11px] text-muted m-0">{label}</p>
            <p className="text-[13px] font-medium text-heading m-0 truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
