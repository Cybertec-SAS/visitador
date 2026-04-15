import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmContactSchema, type FarmContactFormValues } from '@/schemas';
import type { FarmContact } from '@/types/api';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCheck,
  HiOutlineBriefcase,
  HiOutlineHeart,
  HiOutlineKey,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';

interface FarmContactFormProps {
  farmId: number;
  onSubmit: (data: FarmContactFormValues) => Promise<void>;
  defaultValues?: FarmContact;
  isLoading: boolean;
  onCancel?: () => void;
}

const CONTACT_TYPES = [
  {
    value: 'administrador',
    label: 'Administrador',
    icon: HiOutlineBriefcase,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    activeColor: 'bg-primary text-white border-primary',
  },
  {
    value: 'veterinario',
    label: 'Veterinario',
    icon: HiOutlineHeart,
    color: 'text-green-600 bg-green-50 border-green-200',
    activeColor: 'bg-primary text-white border-primary',
  },
  {
    value: 'encargado',
    label: 'Encargado',
    icon: HiOutlineKey,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    activeColor: 'bg-primary text-white border-primary',
  },
  {
    value: 'otro',
    label: 'Otro',
    icon: HiOutlineQuestionMarkCircle,
    color: 'text-muted bg-input-bg border-line',
    activeColor: 'bg-primary text-white border-primary',
  },
] as const;

export function FarmContactForm({
  farmId,
  onSubmit,
  defaultValues,
  isLoading,
  onCancel,
}: FarmContactFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FarmContactFormValues>({
    resolver: zodResolver(farmContactSchema),
    mode: 'onChange',
    defaultValues: defaultValues
      ? {
          farm_id: defaultValues.farm_id,
          type: defaultValues.type,
          name: defaultValues.name,
          email: defaultValues.email ?? undefined,
          phone: defaultValues.phone ?? undefined,
        }
      : { farm_id: farmId },
  });

  const values = watch();

  const filled = [values.type, values.name, values.email, values.phone].filter(Boolean).length;
  const required = [values.type, values.name].filter(Boolean).length;
  const progressPct = (filled / 4) * 100;

  const inputClass =
    'w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input type="hidden" {...register('farm_id', { setValueAs: (v) => Number(v) })} />

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-muted">
            {required < 2 ? 'Completa los campos obligatorios' : 'Datos del contacto'}
          </span>
          <span className="text-[12px] font-semibold text-primary">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Type selector – visual cards */}
      <div>
        <label className="text-[13px] font-semibold text-label block mb-2">
          Tipo de contacto <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">
          {CONTACT_TYPES.map(({ value, label, icon: Icon, activeColor, color }) => {
            const isSelected = values.type === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue('type', value as FarmContactFormValues['type'], {
                    shouldValidate: true,
                  })
                }
                className={`flex flex-col items-center gap-1.5 p-3 rounded-control border transition-all cursor-pointer ${
                  isSelected ? activeColor : `${color} hover:opacity-80`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[12px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
        {/* Hidden input for RHF registration */}
        <input type="hidden" {...register('type')} />
        {errors.type && (
          <p className="text-[12px] text-danger mt-1.5">{errors.type.message}</p>
        )}
      </div>

      {/* Name + Email + Phone */}
      <div className="grid grid-cols-2 gap-3.5 max-[580px]:grid-cols-1">
        <div className="col-span-2 max-[580px]:col-span-1">
          <label className="text-[13px] font-semibold text-label block mb-1.5">
            Nombre completo <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              {...register('name')}
              placeholder="Ej: Carlos Ramírez"
              autoFocus
              className={`${inputClass} pl-10`}
            />
          </div>
          {errors.name && (
            <p className="text-[12px] text-danger mt-1.5">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-[13px] font-semibold text-label block mb-1.5">Email</label>
          <div className="relative">
            <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="email"
              {...register('email', { setValueAs: (v) => (v === '' ? undefined : v) })}
              placeholder="correo@ejemplo.com"
              className={`${inputClass} pl-10`}
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-danger mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-[13px] font-semibold text-label block mb-1.5">Teléfono</label>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              {...register('phone')}
              placeholder="+57 310 000 0000"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-btn px-4 py-2.5 text-sm font-semibold text-muted border border-line bg-white hover:bg-input-bg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-btn px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <HiOutlineCheck className="w-4 h-4" />
              {defaultValues ? 'Actualizar contacto' : 'Agregar contacto'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
