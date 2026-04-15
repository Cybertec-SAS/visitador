import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmSchema, type FarmFormValues } from '@/schemas';
import type { Client, Farm } from '@/types/api';

interface FarmFormProps {
  onSubmit: (data: FarmFormValues) => Promise<void>;
  clients: Client[];
  defaultValues?: Farm;
  isLoading: boolean;
}

export function FarmForm({ onSubmit, clients, defaultValues, isLoading }: FarmFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: defaultValues
      ? {
          client_id: defaultValues.client_id,
          nombre: defaultValues.nombre,
          transformator_capacity_kva: defaultValues.transformator_capacity_kva,
          access_ways: defaultValues.access_ways,
          observations: defaultValues.observations,
          farm_voltage: defaultValues.farm_voltage,
          farm_electric_current: defaultValues.farm_electric_current,
          have_own_transformator: defaultValues.have_own_transformator,
          is_transformator_feeds_other_installations: defaultValues.is_transformator_feeds_other_installations,
          distance_to_neighbor_boundary_m: defaultValues.distance_to_neighbor_boundary_m ? Number(defaultValues.distance_to_neighbor_boundary_m) : null,
          transformator_are_feeding_installations: defaultValues.transformator_are_feeding_installations,
          neighboring_properties_notes: defaultValues.neighboring_properties_notes,
          have_easy_access_for_trailer: defaultValues.have_easy_access_for_trailer,
          staff_availability: defaultValues.staff_availability,
          has_storage_warehouse: defaultValues.has_storage_warehouse,
          how_many_warehouses: defaultValues.how_many_warehouses,
        }
      : undefined,
  });

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-2">Información básica</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Cliente</label>
            <select {...register('client_id')} className={inputClass} disabled={!!defaultValues}>
              <option value="">Seleccionar cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nombre de la granja</label>
            <input {...register('nombre')} className={inputClass} />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Electrical */}
      <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-2">Información eléctrica</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Voltaje</label>
            <select {...register('farm_voltage')} className={inputClass}>
              <option value="">Sin especificar</option>
              <option value="110V">110V</option>
              <option value="220V">220V</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Corriente eléctrica</label>
            <select {...register('farm_electric_current')} className={inputClass}>
              <option value="">Sin especificar</option>
              <option value="monophase">Monofásica</option>
              <option value="biphase">Bifásica</option>
              <option value="triphase">Trifásica</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Capacidad transformador (KVA)</label>
            <input type="number" min={0} {...register('transformator_capacity_kva')} className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="have_own_transformator" {...register('have_own_transformator')} className="rounded" />
            <label htmlFor="have_own_transformator" className="text-sm text-gray-700 dark:text-gray-300">Transformador propio</label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="is_transformator_feeds" {...register('is_transformator_feeds_other_installations')} className="rounded" />
            <label htmlFor="is_transformator_feeds" className="text-sm text-gray-700 dark:text-gray-300">Alimenta otras instalaciones</label>
          </div>
          <div>
            <label className={labelClass}>Instalaciones que alimenta</label>
            <input {...register('transformator_are_feeding_installations')} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Access & infrastructure */}
      <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <legend className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-2">Acceso e infraestructura</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vías de acceso</label>
            <input {...register('access_ways')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Distancia a lindero vecino (m)</label>
            <input type="number" min={0} step="0.01" {...register('distance_to_neighbor_boundary_m')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Notas propiedades vecinas</label>
            <input {...register('neighboring_properties_notes')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cantidad de bodegas</label>
            <input type="number" min={0} {...register('how_many_warehouses')} className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="have_easy_access_for_trailer" {...register('have_easy_access_for_trailer')} className="rounded" />
            <label htmlFor="have_easy_access_for_trailer" className="text-sm text-gray-700 dark:text-gray-300">Acceso fácil para tráiler</label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="staff_availability" {...register('staff_availability')} className="rounded" />
            <label htmlFor="staff_availability" className="text-sm text-gray-700 dark:text-gray-300">Personal disponible</label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="has_storage_warehouse" {...register('has_storage_warehouse')} className="rounded" />
            <label htmlFor="has_storage_warehouse" className="text-sm text-gray-700 dark:text-gray-300">Tiene bodega</label>
          </div>
        </div>
      </fieldset>

      {/* Observations */}
      <div>
        <label className={labelClass}>Observaciones</label>
        <textarea {...register('observations')} rows={3} className={inputClass} />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear granja'}
        </button>
      </div>
    </form>
  );
}
