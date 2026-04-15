import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormValues } from '@/schemas';
import type { Client } from '@/types/api';
import {
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCheck,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
} from 'react-icons/hi';

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => Promise<void>;
  defaultValues?: Client;
  isLoading: boolean;
}

const STEPS = [
  {
    title: 'Identificación',
    description: 'Datos legales del cliente',
    icon: HiOutlineOfficeBuilding,
    fields: ['razon_social', 'nit'] as const,
  },
  {
    title: 'Contacto',
    description: 'Información de contacto',
    icon: HiOutlinePhone,
    fields: ['email', 'phone_number'] as const,
  },
];

export function ClientForm({ onSubmit, defaultValues, isLoading }: ClientFormProps) {
  const [step, setStep] = useState(0);
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
    defaultValues: defaultValues
      ? {
          razon_social: defaultValues.razon_social,
          nit: defaultValues.nit,
          email: defaultValues.email,
          phone_number: defaultValues.phone_number,
        }
      : undefined,
  });

  const values = watch();

  const handleNext = async () => {
    const fields = STEPS[step].fields;
    const valid = await trigger([...fields]);
    if (valid) setStep((s) => s + 1);
  };

  const inputClass =
    'w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';

  const isLastStep = step === STEPS.length - 1;

  // Count how many of the 4 required fields are filled
  const filled = [values.razon_social, values.nit, values.email, values.phone_number].filter(
    Boolean,
  ).length;
  const progressPct = (filled / 4) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      {/* ── Step indicator ── */}
      <div className="border border-line rounded-section p-4 bg-white space-y-3">
        {/* Steps row */}
        <div className="flex items-center gap-0 w-fit">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={i} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isDone) setStep(i);
                  }}
                  disabled={!isDone}
                  className={`flex items-center gap-2.5 rounded-control px-3 py-2 transition-colors border-none ${
                    isActive
                      ? 'bg-primary-soft cursor-default'
                      : isDone
                        ? 'hover:bg-primary-soft/60 cursor-pointer bg-transparent'
                        : 'opacity-40 cursor-default bg-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-logo grid place-items-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-primary text-white'
                        : isActive
                          ? 'bg-primary text-white'
                          : 'bg-input-bg text-muted'
                    }`}
                  >
                    {isDone ? <HiOutlineCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="text-left hidden min-[480px]:block">
                    <p
                      className={`text-[13px] font-semibold m-0 ${isActive ? 'text-primary' : isDone ? 'text-heading' : 'text-muted'}`}
                    >
                      {s.title}
                    </p>
                    <p className="text-[11px] text-muted m-0">{s.description}</p>
                  </div>
                </button>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className="w-16 mx-2 shrink-0">
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
            <span className="text-[12px] text-muted">Completado</span>
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
      <div className="border border-line rounded-section p-4 bg-white space-y-3 pt-3">
        {/* Step 0 – Identificación */}
        {step === 0 && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-[15px] font-semibold text-heading m-0">Datos legales</h3>
              <p className="text-[13px] text-muted m-0">
                Ingresa la razón social y el NIT del cliente
              </p>
            </div>

            <FieldCard
              icon={HiOutlineOfficeBuilding}
              label="Razón Social"
              hint="Nombre legal de la empresa"
              required
              filled={!!values.razon_social}
              error={errors.razon_social?.message}
            >
              <input
                {...register('razon_social')}
                placeholder="Ej: Empresa Agropecuaria S.A.S"
                autoFocus
                className={inputClass}
              />
            </FieldCard>

            <FieldCard
              icon={HiOutlineIdentification}
              label="NIT"
              hint="Número de identificación tributaria"
              required
              filled={!!values.nit}
              error={errors.nit?.message}
            >
              <input
                {...register('nit')}
                placeholder="Ej: 900123456-7"
                className={inputClass}
              />
            </FieldCard>
          </div>
        )}

        {/* Step 1 – Contacto */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-[15px] font-semibold text-heading m-0">Información de contacto</h3>
              <p className="text-[13px] text-muted m-0">
                ¿Cómo nos comunicamos con este cliente?
              </p>
            </div>

            <FieldCard
              icon={HiOutlineMail}
              label="Email"
              hint="Correo electrónico corporativo"
              required
              filled={!!values.email}
              error={errors.email?.message}
            >
              <input
                {...register('email')}
                type="email"
                placeholder="correo@empresa.com"
                autoFocus
                className={inputClass}
              />
            </FieldCard>

            <FieldCard
              icon={HiOutlinePhone}
              label="Teléfono"
              hint="Número de contacto principal"
              required
              filled={!!values.phone_number}
              error={errors.phone_number?.message}
            >
              <input
                {...register('phone_number')}
                placeholder="Ej: +57 310 123 4567"
                className={inputClass}
              />
            </FieldCard>

            {/* Mini resumen del paso anterior */}
            <div className="border border-primary/20 rounded-control p-3.5 bg-primary-soft space-y-1">
              <p className="text-[12px] font-semibold text-primary m-0 uppercase tracking-wide">
                Paso anterior
              </p>
              <p className="text-[13px] text-heading m-0">
                <span className="text-muted">Razón social: </span>
                {values.razon_social || '—'}
              </p>
              <p className="text-[13px] text-heading m-0">
                <span className="text-muted">NIT: </span>
                {values.nit || '—'}
              </p>
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
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <HiOutlineCheck className="w-4 h-4" />
                {isEdit ? 'Actualizar cliente' : 'Guardar cliente'}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

// ── Shared FieldCard sub-component ──────────────────────────────────────────
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
    <div
      className={`border rounded-control p-3 transition-colors ${
        error
          ? 'border-danger/50 bg-red-50/40'
          : filled
            ? 'border-primary/30 bg-primary-soft/30'
            : 'border-line bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 transition-colors ${
              filled ? 'bg-primary text-white' : 'bg-input-bg text-muted'
            }`}
          >
            {filled ? <HiOutlineCheck className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
          </div>
          <div>
            <span className="text-[13px] font-semibold text-label">
              {label}
              {required && <span className="text-danger ml-0.5">*</span>}
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
