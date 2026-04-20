import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { visitsApi } from '@/api/visits';
import { visitTypesApi } from '@/api/visitTypes';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import type { VisitType, Client, Farm, VisitStatus } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { HiOutlineChevronLeft } from 'react-icons/hi';

const schema = z.object({
  client_id: z.coerce.number().int().positive('Selecciona un cliente'),
  farm_id: z.coerce.number().int().positive('Selecciona una granja'),
  visit_type_id: z.coerce.number().int().positive('Selecciona el tipo de visita'),
  title: z.string().min(1, 'El título es requerido'),
  subject: z.string().nullable().optional(),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'signed', 'closed', 'cancelled']),
  report_date: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  development: z.string().nullable().optional(),
  general_observations: z.string().nullable().optional(),
  conclusions: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
});

interface FormValues {
  client_id: number;
  farm_id: number;
  visit_type_id: number;
  title: string;
  subject?: string | null;
  status: VisitStatus;
  report_date?: string | null;
  city?: string | null;
  department?: string | null;
  context?: string | null;
  development?: string | null;
  general_observations?: string | null;
  conclusions?: string | null;
  internal_notes?: string | null;
}

export function VisitFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
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
    defaultValues: { status: 'draft' },
  });

  const selectedClientId = watch('client_id');

  useEffect(() => {
    async function loadData() {
      try {
        const [typesData, clientsData] = await Promise.all([
          visitTypesApi.list(),
          clientsApi.list(1).then((r) => r.data),
        ]);
        setVisitTypes(typesData);
        setClients(clientsData);

        if (isEdit) {
          const res = await visitsApi.get(Number(id));
          const v = res.data;
          setValue('client_id', v.client_id);
          setValue('farm_id', v.farm_id);
          setValue('visit_type_id', v.visit_type_id);
          setValue('title', v.title);
          setValue('subject', v.subject);
          setValue('status', v.status);
          setValue('report_date', v.report_date);
          setValue('city', v.city);
          setValue('department', v.department);
          setValue('context', v.context);
          setValue('development', v.development);
          setValue('general_observations', v.general_observations);
          setValue('conclusions', v.conclusions);
          setValue('internal_notes', v.internal_notes);

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
        subject: values.subject || null,
        report_date: values.report_date || null,
        city: values.city || null,
        department: values.department || null,
        context: values.context || null,
        development: values.development || null,
        general_observations: values.general_observations || null,
        conclusions: values.conclusions || null,
        internal_notes: values.internal_notes || null,
      };

      if (isEdit) {
        await visitsApi.update(Number(id), payload);
        sileo.success({ title: 'Visita actualizada' });
        navigate(`/visits/${id}`);
      } else {
        const res = await visitsApi.create(payload as Parameters<typeof visitsApi.create>[0]);
        sileo.success({ title: 'Visita creada' });
        navigate(`/visits/${res.data.id}`);
      }
    } catch {
      sileo.error({ title: 'Error al guardar la visita' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <LoadingSpinner className="mt-12" />;

  return (
    <div className="max-w-2xl">
      <Link
        to={isEdit ? `/visits/${id}` : '/visits'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline mb-5"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        {isEdit ? 'Volver a la visita' : 'Volver a visitas'}
      </Link>

      <div className="border border-line rounded-section bg-white p-5">
        <h2 className="text-[20px] font-bold text-heading m-0 mb-5">
          {isEdit ? 'Editar visita' : 'Nueva visita'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Client */}
          {!isEdit && (
            <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
              <div>
                <label className="block text-[13px] font-semibold text-label mb-1.5">Cliente *</label>
                <select
                  {...register('client_id', { valueAsNumber: true })}
                  className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.razon_social}</option>
                  ))}
                </select>
                {errors.client_id && <p className="text-danger text-[12px] mt-1">{errors.client_id.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-label mb-1.5">Granja *</label>
                <select
                  {...register('farm_id', { valueAsNumber: true })}
                  className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
                  disabled={!selectedClientId}
                >
                  <option value="">Selecciona una granja</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
                {errors.farm_id && <p className="text-danger text-[12px] mt-1">{errors.farm_id.message}</p>}
              </div>
            </div>
          )}

          {/* Visit type */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Tipo de visita *</label>
            <select
              {...register('visit_type_id', { valueAsNumber: true })}
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
            >
              <option value="">Selecciona un tipo</option>
              {visitTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.visit_type_id && <p className="text-danger text-[12px] mt-1">{errors.visit_type_id.message}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Título *</label>
            <input
              {...register('title')}
              placeholder="Ej: Visita técnico-comercial — Granja Norte"
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
            />
            {errors.title && <p className="text-danger text-[12px] mt-1">{errors.title.message}</p>}
          </div>

          {/* Status + Date */}
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Estado</label>
              <select
                {...register('status')}
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading bg-white focus:outline-none focus:border-primary"
              >
                <option value="draft">Borrador</option>
                <option value="scheduled">Programada</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="signed">Firmada</option>
                <option value="closed">Cerrada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Fecha del informe</label>
              <input
                {...register('report_date')}
                type="date"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* City + Department */}
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Ciudad</label>
              <input
                {...register('city')}
                placeholder="Bogotá"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-label mb-1.5">Departamento</label>
              <input
                {...register('department')}
                placeholder="Cundinamarca"
                className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Context */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Contexto</label>
            <textarea
              {...register('context')}
              rows={3}
              placeholder="Contexto narrativo de la visita..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Development */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Desarrollo de actividades</label>
            <textarea
              {...register('development')}
              rows={3}
              placeholder="Describe las actividades realizadas..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Observaciones generales</label>
            <textarea
              {...register('general_observations')}
              rows={3}
              placeholder="Observaciones generales de la visita..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Conclusions */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">Conclusiones</label>
            <textarea
              {...register('conclusions')}
              rows={2}
              placeholder="Conclusiones del informe..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Internal notes */}
          <div>
            <label className="block text-[13px] font-semibold text-label mb-1.5">
              Notas internas
              <span className="text-[11px] text-muted font-normal ml-1.5">(no se imprimen en PDF)</span>
            </label>
            <textarea
              {...register('internal_notes')}
              rows={2}
              placeholder="Notas para uso interno..."
              className="w-full border border-line rounded-control px-3 py-2.5 text-[14px] text-heading focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/visits/${id}` : '/visits')}
              className="rounded-btn px-5 py-2.5 text-sm font-semibold text-heading border border-line hover:bg-input-bg transition-colors cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-btn px-5 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
