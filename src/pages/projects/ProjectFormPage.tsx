import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectsApi } from '@/api/projects';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import type { Client, Farm, ProjectStatus } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { HiOutlineChevronLeft } from 'react-icons/hi';

const schema = z.object({
  client_id: z.coerce.number().int().positive('Selecciona un cliente'),
  farm_id: z.coerce.number().int().positive('Selecciona una granja'),
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

interface FormValues {
  client_id: number;
  farm_id: number;
  name: string;
  code?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [clients, setClients] = useState<Client[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { status: 'draft' },
  });

  const selectedClientId = watch('client_id');

  useEffect(() => {
    async function loadData() {
      try {
        const clientsData = await clientsApi.list(1).then((r) => r.data);
        setClients(clientsData);
        if (isEdit) {
          const res = await projectsApi.get(Number(id));
          const p = res.data;
          setValue('client_id', p.client_id);
          setValue('farm_id', p.farm_id);
          setValue('name', p.name);
          setValue('code', p.code);
          setValue('status', p.status);
          setValue('start_date', p.start_date);
          setValue('end_date', p.end_date);
          setValue('description', p.description);
          const farmsData = await farmsApi.list(1).then((r) => r.data);
          setFarms(farmsData);
        }
      } catch {
        sileo.error({ title: 'Error al cargar datos' });
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [id, isEdit, setValue]);

  useEffect(() => {
    if (!selectedClientId) return;
    farmsApi.list(1, { client_id: selectedClientId }).then((r) => setFarms(r.data)).catch(() => {});
  }, [selectedClientId]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        code: values.code || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        description: values.description || null,
      };
      if (isEdit) {
        await projectsApi.update(Number(id), payload);
        sileo.success({ title: 'Proyecto actualizado' });
        navigate(`/projects/${id}`);
      } else {
        const res = await projectsApi.create(payload as Parameters<typeof projectsApi.create>[0]);
        sileo.success({ title: 'Proyecto creado' });
        navigate(`/projects/${res.data.id}`);
      }
    } catch {
      sileo.error({ title: 'Error al guardar el proyecto' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <LoadingSpinner className="mt-12" />;

  return (
    <div className="max-w-2xl">
      <Link
        to={isEdit ? `/projects/${id}` : '/projects'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline mb-5"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        {isEdit ? 'Volver al proyecto' : 'Volver a proyectos'}
      </Link>

      <div className="border border-line rounded-section bg-white p-5">
        <h2 className="text-[20px] font-bold text-heading m-0 mb-5">
          {isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Cliente *</label>
              <select
                {...register('client_id', { valueAsNumber: true })}
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </select>
              {errors.client_id && <p className="text-danger text-[12px] mt-1">{errors.client_id.message}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Granja *</label>
              <select
                {...register('farm_id', { valueAsNumber: true })}
                disabled={!selectedClientId}
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">Selecciona una granja</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
              {errors.farm_id && <p className="text-danger text-[12px] mt-1">{errors.farm_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Nombre *</label>
              <input
                {...register('name')}
                placeholder="Montaje Galpones 9–12"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
              {errors.name && <p className="text-danger text-[12px] mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Código</label>
              <input
                {...register('code')}
                placeholder="PROY-2026-001"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Estado</label>
            <select
              {...register('status')}
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
            >
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Fecha inicio</label>
              <input
                {...register('start_date')}
                type="date"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Fecha fin</label>
              <input
                {...register('end_date')}
                type="date"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Descripción</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Descripción del proyecto..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/projects/${id}` : '/projects')}
              className="rounded-btn px-5 py-2.5 text-sm font-semibold text-heading border border-line hover:bg-input-bg transition-colors cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-btn px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
