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
          email: defaultValues.email,
          phone: defaultValues.phone,
        }
      : { farm_id: farmId },
  });

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('farm_id')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tipo</label>
          <select {...register('type')} className={inputClass}>
            <option value="">Seleccionar...</option>
            <option value="administrador">Administrador</option>
            <option value="veterinario">Veterinario</option>
            <option value="encargado">Encargado</option>
            <option value="otro">Otro</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Nombre</label>
          <input {...register('name')} className={inputClass} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" {...register('email')} className={inputClass} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input {...register('phone')} className={inputClass} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Agregar contacto'}
        </button>
      </div>
    </form>
  );
}
