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

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('farm_id', { setValueAs: (v) => Number(v) })} />
      {errors.farm_id && <p className="text-sm text-red-600">{errors.farm_id.message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Guardar georreferencia'}
        </button>
      </div>
    </form>
  );
}
