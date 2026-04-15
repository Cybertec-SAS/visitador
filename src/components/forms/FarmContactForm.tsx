import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmContactSchema, type FarmContactFormValues } from '@/schemas';
import type { FarmContact } from '@/types/api';

interface FarmContactFormProps {
  farmId: number;
  onSubmit: (data: FarmContactFormValues) => Promise<void>;
  defaultValues?: FarmContact;
  isLoading: boolean;
  onCancel?: () => void;
}

export function FarmContactForm({ farmId, onSubmit, defaultValues, isLoading, onCancel }: FarmContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmContactFormValues>({
    resolver: zodResolver(farmContactSchema),
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

  const inputClass = 'w-full min-h-[50px] border border-line rounded-control px-[15px] py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder';
  const labelClass = 'text-[13px] font-bold text-label';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-[14px]">
      <input type="hidden" {...register('farm_id', { setValueAs: (v) => Number(v) })} />

      <div className="grid grid-cols-2 gap-[14px] max-[640px]:grid-cols-1">
        <div>
          <label className={labelClass}>Tipo</label>
          <select {...register('type', { setValueAs: (v) => (v === '' ? undefined : v) })} className={inputClass}>
            <option value="">Seleccionar...</option>
            <option value="administrador">Administrador</option>
            <option value="veterinario">Veterinario</option>
            <option value="encargado">Encargado</option>
            <option value="otro">Otro</option>
          </select>
          {errors.type && <p className="mt-1 text-[13px] text-danger">{errors.type.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Nombre</label>
          <input {...register('name')} className={inputClass} />
          {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" {...register('email', { setValueAs: (v) => (v === '' ? undefined : v) })} className={inputClass} />
          {errors.email && <p className="mt-1 text-[13px] text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input {...register('phone')} className={inputClass} />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-btn px-[18px] py-3.5 text-sm font-bold bg-white text-heading border border-line hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-btn px-[18px] py-3.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {isLoading ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Agregar contacto'}
        </button>
      </div>
    </form>
  );
}
