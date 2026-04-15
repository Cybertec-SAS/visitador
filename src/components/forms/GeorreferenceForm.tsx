import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { georreferenceSchema, type GeorreferenceFormValues } from '@/schemas';
import type { FarmGeorreference } from '@/types/api';

interface GeorreferenceFormProps {
  farmId: number;
  onSubmit: (data: GeorreferenceFormValues) => Promise<void>;
  defaultValues?: FarmGeorreference;
  isLoading: boolean;
}

export function GeorreferenceForm({ farmId, onSubmit, defaultValues, isLoading }: GeorreferenceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeorreferenceFormValues>({
    resolver: zodResolver(georreferenceSchema),
    defaultValues: defaultValues
      ? {
          farm_id: defaultValues.farm_id,
          address: defaultValues.address ?? undefined,
          town: defaultValues.town ?? undefined,
          department: defaultValues.department ?? undefined,
          map_url_reference: defaultValues.map_url_reference ?? undefined,
        }
      : { farm_id: farmId },
  });

  const inputClass = 'w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder';
  const labelClass = 'text-[13px] font-bold text-label';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
      <input type="hidden" {...register('farm_id', { setValueAs: (v) => Number(v) })} />
      {errors.farm_id && <p className="text-[13px] text-danger">{errors.farm_id.message}</p>}

      <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
        <div>
          <label className={labelClass}>Dirección</label>
          <input {...register('address')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Municipio</label>
          <input {...register('town')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Departamento</label>
          <input {...register('department')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>URL referencia mapa</label>
          <input {...register('map_url_reference')} className={inputClass} />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-btn px-4.5 py-3.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {isLoading ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Guardar georreferencia'}
        </button>
      </div>
    </form>
  );
}
