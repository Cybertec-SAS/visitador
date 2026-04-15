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
          transformator_capacity_kva: defaultValues.transformator_capacity_kva ?? undefined,
          access_ways: defaultValues.access_ways ?? undefined,
          observations: defaultValues.observations ?? undefined,
          farm_voltage: defaultValues.farm_voltage ?? undefined,
          farm_electric_current: defaultValues.farm_electric_current ?? undefined,
          have_own_transformator: defaultValues.have_own_transformator ?? undefined,
          is_transformator_feeds_other_installations: defaultValues.is_transformator_feeds_other_installations ?? undefined,
          distance_to_neighbor_boundary_m: defaultValues.distance_to_neighbor_boundary_m != null
            ? Number(defaultValues.distance_to_neighbor_boundary_m)
            : undefined,
          transformator_are_feeding_installations: defaultValues.transformator_are_feeding_installations ?? undefined,
          neighboring_properties_notes: defaultValues.neighboring_properties_notes ?? undefined,
          have_easy_access_for_trailer: defaultValues.have_easy_access_for_trailer ?? undefined,
          staff_availability: defaultValues.staff_availability ?? undefined,
          has_storage_warehouse: defaultValues.has_storage_warehouse ?? undefined,
          how_many_warehouses: defaultValues.how_many_warehouses ?? undefined,
        }
      : undefined,
  });

  const inputClass = 'w-full min-h-12.5 border border-line rounded-control px-3.75 py-3.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder';
  const labelClass = 'text-[13px] font-bold text-label';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4.5">
      {/* Basic info */}
      <fieldset className="border border-line rounded-section p-4.5 bg-white">
        <legend className="text-base font-semibold text-heading px-2">Información básica</legend>
        <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
          <div>
            <label className={labelClass}>Cliente</label>
            <select {...register('client_id', { setValueAs: (v) => (v === '' ? 0 : Number(v)) })} className={inputClass} disabled={!!defaultValues}>
              <option value="">Seleccionar cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.client_id && <p className="mt-1 text-[13px] text-danger">{errors.client_id.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nombre de la granja</label>
            <input {...register('nombre')} className={inputClass} />
            {errors.nombre && <p className="mt-1 text-[13px] text-danger">{errors.nombre.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Electrical */}
      <fieldset className="border border-line rounded-section p-4.5 bg-white">
        <legend className="text-base font-semibold text-heading px-2">Información eléctrica</legend>
        <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
          <div>
            <label className={labelClass}>Voltaje</label>
              <select {...register('farm_voltage', { setValueAs: (v) => (v === '' ? undefined : v) })} className={inputClass}>
              <option value="">Sin especificar</option>
              <option value="110V">110V</option>
              <option value="220V">220V</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Corriente eléctrica</label>
              <select {...register('farm_electric_current', { setValueAs: (v) => (v === '' ? undefined : v) })} className={inputClass}>
              <option value="">Sin especificar</option>
              <option value="monophase">Monofásica</option>
              <option value="biphase">Bifásica</option>
              <option value="triphase">Trifásica</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Capacidad transformador (KVA)</label>
            <input type="number" min={0} {...register('transformator_capacity_kva', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })} className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="have_own_transformator" {...register('have_own_transformator')} className="rounded accent-primary" />
            <label htmlFor="have_own_transformator" className="text-sm text-heading">Transformador propio</label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="is_transformator_feeds" {...register('is_transformator_feeds_other_installations')} className="rounded accent-primary" />
            <label htmlFor="is_transformator_feeds" className="text-sm text-heading">Alimenta otras instalaciones</label>
          </div>
          <div>
            <label className={labelClass}>Instalaciones que alimenta</label>
            <input {...register('transformator_are_feeding_installations')} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* Access & infrastructure */}
      <fieldset className="border border-line rounded-section p-4.5 bg-white">
        <legend className="text-base font-semibold text-heading px-2">Acceso e infraestructura</legend>
        <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
          <div>
            <label className={labelClass}>Vías de acceso</label>
            <input {...register('access_ways')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Distancia a lindero vecino (m)</label>
            <input type="number" min={0} step="0.01" {...register('distance_to_neighbor_boundary_m', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Notas propiedades vecinas</label>
            <input {...register('neighboring_properties_notes')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cantidad de bodegas</label>
            <input type="number" min={0} {...register('how_many_warehouses', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })} className={inputClass} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="have_easy_access_for_trailer" {...register('have_easy_access_for_trailer')} className="rounded accent-primary" />
            <label htmlFor="have_easy_access_for_trailer" className="text-sm text-heading">Acceso fácil para tráiler</label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="staff_availability" {...register('staff_availability')} className="rounded accent-primary" />
            <label htmlFor="staff_availability" className="text-sm text-heading">Personal disponible</label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="has_storage_warehouse" {...register('has_storage_warehouse')} className="rounded accent-primary" />
            <label htmlFor="has_storage_warehouse" className="text-sm text-heading">Tiene bodega</label>
          </div>
        </div>
      </fieldset>

      {/* Observations */}
      <div>
        <label className={labelClass}>Observaciones</label>
        <textarea {...register('observations')} rows={3} className={`${inputClass} min-h-[90px]`} />
      </div>

      <div className="flex gap-3 flex-wrap max-[640px]:flex-col">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-btn px-4.5 py-3.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {isLoading ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear granja'}
        </button>
      </div>
    </form>
  );
}
