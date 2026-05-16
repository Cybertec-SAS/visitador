import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { galponSchema, type GalponFormValues } from '@/schemas';
import type { Galpon } from '@/types/api';
import {
  HiOutlineOfficeBuilding,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';

interface GalponFormProps {
  onSubmit: (data: GalponFormValues) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Galpon;
  isLoading: boolean;
}

export function GalponForm({ onSubmit, onCancel, defaultValues, isLoading }: GalponFormProps) {
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GalponFormValues>({
    resolver: zodResolver(galponSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          code: defaultValues.code ?? undefined,
          status: defaultValues.status,
          dimensions_json: {
            largo_m: defaultValues.dimensions_json?.largo_m ?? undefined,
            ancho_m: defaultValues.dimensions_json?.ancho_m ?? undefined,
            altura_canal_m: defaultValues.dimensions_json?.altura_canal_m ?? undefined,
            altura_cumbrera_m: defaultValues.dimensions_json?.altura_cumbrera_m ?? undefined,
          },
          technical_attributes_json: {
            tipo_estructura: defaultValues.technical_attributes_json?.tipo_estructura ?? undefined,
            tipo_cubierta: defaultValues.technical_attributes_json?.tipo_cubierta ?? undefined,
          },
          observations: defaultValues.observations ?? undefined,
        }
      : { status: 'active' },
  });

  const inputClass =
    'w-full border border-line rounded-control px-3 py-2.5 bg-input-bg text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-placeholder transition-colors';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-line">
        <div className="w-7 h-7 rounded-lg grid place-items-center bg-primary-soft shrink-0">
          <HiOutlineOfficeBuilding className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[14px] font-semibold text-heading m-0">
          {isEdit ? 'Editar galpón' : 'Nuevo galpón'}
        </h4>
      </div>

      {/* Nombre y código */}
      <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
        <div>
          <label className="text-[12px] font-semibold text-label block mb-1">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="Ej: GALPON 1"
            autoFocus={!isEdit}
            className={inputClass}
          />
          {errors.name && (
            <p className="text-[11px] text-danger mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-[12px] font-semibold text-label block mb-1">Código</label>
          <input
            {...register('code')}
            placeholder="Ej: GAL-01"
            className={inputClass}
          />
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="text-[12px] font-semibold text-label block mb-1">Estado</label>
        <select {...register('status')} className={inputClass}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      {/* Atributos técnicos */}
      <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
        <div>
          <label className="text-[12px] font-semibold text-label block mb-1">Tipo estructura</label>
          <input
            {...register('technical_attributes_json.tipo_estructura')}
            placeholder="Ej: CONVENCIONAL"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-label block mb-1">Tipo cubierta</label>
          <input
            {...register('technical_attributes_json.tipo_cubierta')}
            placeholder="Ej: DOS AGUAS"
            className={inputClass}
          />
        </div>
      </div>

      {/* Dimensiones */}
      <div>
        <p className="text-[12px] font-semibold text-label mb-1.5">Dimensiones</p>
        <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
          <div>
            <label className="text-[11px] text-muted block mb-1">Largo (m)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 100"
              {...register('dimensions_json.largo_m', {
                setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
              })}
              className={inputClass}
            />
            {errors.dimensions_json?.largo_m && (
              <p className="text-[11px] text-danger mt-1">{errors.dimensions_json.largo_m.message}</p>
            )}
          </div>
          <div>
            <label className="text-[11px] text-muted block mb-1">Ancho (m)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 12"
              {...register('dimensions_json.ancho_m', {
                setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
              })}
              className={inputClass}
            />
            {errors.dimensions_json?.ancho_m && (
              <p className="text-[11px] text-danger mt-1">{errors.dimensions_json.ancho_m.message}</p>
            )}
          </div>
          <div>
            <label className="text-[11px] text-muted block mb-1">Altura canal (m)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 2.8"
              {...register('dimensions_json.altura_canal_m', {
                setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
              })}
              className={inputClass}
            />
            {errors.dimensions_json?.altura_canal_m && (
              <p className="text-[11px] text-danger mt-1">{errors.dimensions_json.altura_canal_m.message}</p>
            )}
          </div>
          <div>
            <label className="text-[11px] text-muted block mb-1">Altura cumbrera (m)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 4.2"
              {...register('dimensions_json.altura_cumbrera_m', {
                setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
              })}
              className={inputClass}
            />
            {errors.dimensions_json?.altura_cumbrera_m && (
              <p className="text-[11px] text-danger mt-1">{errors.dimensions_json.altura_cumbrera_m.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="text-[12px] font-semibold text-label block mb-1">Observaciones</label>
        <textarea
          {...register('observations')}
          rows={2}
          placeholder="Notas sobre el galpón..."
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
          className="flex items-center gap-1.5 rounded-btn px-4 py-2 text-[13px] font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer border-none"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <HiOutlineCheck className="w-3.5 h-3.5" />
              {isEdit ? 'Actualizar' : 'Crear galpón'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
