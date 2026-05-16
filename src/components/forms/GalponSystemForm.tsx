import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { galponSystemSchema, type GalponSystemFormValues } from '@/schemas';
import type { GalponSystem, SystemCatalog } from '@/types/api';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface GalponSystemFormProps {
  onSubmit: (data: GalponSystemFormValues) => Promise<void>;
  onCancel: () => void;
  catalog: SystemCatalog[];
  defaultValues?: GalponSystem;
  isLoading: boolean;
}

export function GalponSystemForm({
  onSubmit,
  onCancel,
  catalog,
  defaultValues,
  isLoading,
}: GalponSystemFormProps) {
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GalponSystemFormValues>({
    resolver: zodResolver(galponSystemSchema),
    defaultValues: defaultValues
      ? {
          system_id: defaultValues.system_id,
          quantity: defaultValues.quantity,
          notes: defaultValues.notes ?? undefined,
          technical_attributes_json: defaultValues.technical_attributes_json
            ? { capacidad: String((defaultValues.technical_attributes_json as Record<string, unknown>).capacidad ?? '') }
            : undefined,
        }
      : undefined,
  });

  const inputClass =
    'w-full border border-line rounded-control px-3 py-2.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Sistema */}
      <div>
        <label className="text-[12px] font-semibold text-label block mb-1">
          Sistema <span className="text-danger">*</span>
        </label>
        <select
          {...register('system_id', { setValueAs: (v) => (v === '' ? 0 : Number(v)) })}
          className={`${inputClass} appearance-none`}
        >
          <option value="">Seleccionar sistema...</option>
          {catalog.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.system_id && (
          <p className="text-[11px] text-danger mt-1">{errors.system_id.message}</p>
        )}
      </div>

      {/* Cantidad y capacidad */}
      <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
        <div>
          <label className="text-[12px] font-semibold text-label block mb-1">
            Cantidad <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            min={1}
            placeholder="Ej: 10"
            {...register('quantity', {
              setValueAs: (v) => (v === '' ? 0 : Number(v)),
            })}
            className={inputClass}
          />
          {errors.quantity && (
            <p className="text-[11px] text-danger mt-1">{errors.quantity.message}</p>
          )}
        </div>
        <div>
          <label className="text-[12px] font-semibold text-label block mb-1">Capacidad</label>
          <input
            {...register('technical_attributes_json.capacidad')}
            placeholder="Ej: 36 PULGADAS"
            className={inputClass}
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="text-[12px] font-semibold text-label block mb-1">Notas</label>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Observaciones del sistema..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-[13px] font-semibold text-muted border border-line bg-white hover:bg-input-bg transition-colors cursor-pointer"
        >
          <HiOutlineX className="w-3.5 h-3.5" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-btn px-4 py-2 text-[13px] font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <HiOutlineCheck className="w-3.5 h-3.5" />
              {isEdit ? 'Actualizar' : 'Agregar sistema'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
