import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { structuresApi } from '@/api/structures';
import { farmsApi } from '@/api/farms';
import type { Farm, Structure, StructureStatus } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { HiOutlineChevronLeft } from 'react-icons/hi';

const schema = z.object({
  farm_id: z.coerce.number().int().positive('Selecciona una granja'),
  parent_structure_id: z.coerce.number().int().nullable().optional(),
  structure_type: z.string().min(1, 'Ingresa el tipo de estructura'),
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'under_construction', 'retired']),
  description: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
  sort_order: z.coerce.number().int(),
});

interface FormValues {
  farm_id: number;
  parent_structure_id?: number | null;
  structure_type: string;
  name: string;
  code?: string | null;
  status: StructureStatus;
  description?: string | null;
  observations?: string | null;
  sort_order: number;
}

import { STRUCTURE_TYPE_OPTIONS } from '@/constants/structureTypes';

export function StructureFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const farmIdParam = searchParams.get('farm_id');
  const navigate = useNavigate();
  const isEdit = !!id;

  const [farms, setFarms] = useState<Farm[]>([]);
  const [parentStructures, setParentStructures] = useState<Structure[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { status: 'active', sort_order: 0 },
  });

  const selectedFarmId = watch('farm_id');

  useEffect(() => {
    async function loadData() {
      try {
        const farmsRes = await farmsApi.list(1);
        setFarms(farmsRes.data);

        if (isEdit) {
          const res = await structuresApi.get(Number(id));
          const s = res.data;
          setValue('farm_id', s.farm_id);
          setValue('parent_structure_id', s.parent_structure_id ?? undefined);
          setValue('structure_type', s.structure_type);
          setValue('name', s.name);
          setValue('code', s.code);
          setValue('status', s.status);
          setValue('description', s.description);
          setValue('observations', s.observations);
          setValue('sort_order', s.sort_order);
        } else if (farmIdParam) {
          setValue('farm_id', Number(farmIdParam));
        }
      } catch {
        sileo.error({ title: 'Error al cargar datos' });
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [id, isEdit, farmIdParam, setValue]);

  useEffect(() => {
    if (!selectedFarmId) return;
    structuresApi.list({ farm_id: selectedFarmId, parent_only: true })
      .then((data) => setParentStructures(data))
      .catch(() => {});
  }, [selectedFarmId]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        parent_structure_id: values.parent_structure_id || null,
        code: values.code || null,
        description: values.description || null,
        observations: values.observations || null,
      };
      if (isEdit) {
        await structuresApi.update(Number(id), payload);
        sileo.success({ title: 'Estructura actualizada' });
      } else {
        await structuresApi.create(payload as Parameters<typeof structuresApi.create>[0]);
        sileo.success({ title: 'Estructura creada' });
      }
      navigate(farmIdParam ? `/structures?farm_id=${farmIdParam}` : '/structures');
    } catch {
      sileo.error({ title: 'Error al guardar la estructura' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <LoadingSpinner className="mt-12" />;

  return (
    <div className="max-w-2xl">
      <Link
        to={farmIdParam ? `/structures?farm_id=${farmIdParam}` : '/structures'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline mb-5"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a estructuras
      </Link>

      <div className="border border-line rounded-section bg-white p-5">
        <h2 className="text-[20px] font-bold text-heading m-0 mb-5">
          {isEdit ? 'Editar estructura' : 'Nueva estructura'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Farm */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Granja *</label>
            <select
              {...register('farm_id', { valueAsNumber: true })}
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
            >
              <option value="">Selecciona una granja</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
            {errors.farm_id && <p className="text-danger text-[12px] mt-1">{errors.farm_id.message}</p>}
          </div>

          {/* Parent structure */}
          {parentStructures.length > 0 && (
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Estructura padre (opcional)</label>
              <select
                {...register('parent_structure_id', { setValueAs: (v) => v === '' ? null : Number(v) })}
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
              >
                <option value="">Sin estructura padre</option>
                {parentStructures.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Type + Name */}
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Tipo *</label>
              <select
                {...register('structure_type')}
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
              >
                <option value="">Selecciona un tipo</option>
                {STRUCTURE_TYPE_OPTIONS.map(({ code, name }) => (

                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              {errors.structure_type && <p className="text-danger text-[12px] mt-1">{errors.structure_type.message}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Nombre *</label>
              <input
                {...register('name')}
                placeholder="Ej: Galpón 10"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
              {errors.name && <p className="text-danger text-[12px] mt-1">{errors.name.message}</p>}
            </div>
          </div>

          {/* Code + Status */}
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Código</label>
              <input
                {...register('code')}
                placeholder="Ej: G10"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Estado</label>
              <select
                {...register('status')}
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="under_construction">En construcción</option>
                <option value="retired">Retirado</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Descripción</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Descripción de la estructura..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Observaciones</label>
            <textarea
              {...register('observations')}
              rows={2}
              placeholder="Observaciones adicionales..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Orden</label>
            <input
              {...register('sort_order', { valueAsNumber: true })}
              type="number"
              defaultValue={0}
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(farmIdParam ? `/structures?farm_id=${farmIdParam}` : '/structures')}
              className="rounded-btn px-5 py-2.5 text-sm font-semibold text-heading border border-line hover:bg-input-bg transition-colors cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-btn px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear estructura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
