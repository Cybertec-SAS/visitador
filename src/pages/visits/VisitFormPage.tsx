import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { visitsApi } from '@/api/visits';
import { clientsApi } from '@/api/clients';
import { VisitForm } from '@/components/forms/visit/VisitForm';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Client, Visit } from '@/types/api';
import type { VisitFormValues } from '@/schemas';
import { HiOutlineLocationMarker } from 'react-icons/hi';

export function VisitFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [visit, setVisit] = useState<Visit | undefined>();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const promises: Promise<void>[] = [
      clientsApi.list(1, { per_page: 200 }).then((res) => setClients(res.data)),
    ];
    if (id) {
      promises.push(visitsApi.get(Number(id)).then((res) => setVisit(res.data)));
    }
    Promise.all(promises)
      .catch(() => {
        sileo.error({ title: 'Error al cargar datos' });
        navigate('/visits');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (data: VisitFormValues) => {
    setIsSaving(true);
    try {
      if (isEdit && id) {
        await visitsApi.update(Number(id), data);
        sileo.success({ title: 'Visita actualizada' });
        navigate(`/visits/${id}`);
      } else {
        const res = await visitsApi.create(data);
        sileo.success({ title: '¡Visita registrada!' });
        navigate(`/visits/${res.data.id}`);
      }
    } catch {
      sileo.error({ title: 'Error al guardar la visita' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner className="mt-12" />;

  const breadcrumbItems = isEdit
    ? [
        { label: 'Visitas', to: '/visits' },
        { label: visit?.granja_nombre ?? 'Visita', to: `/visits/${id}` },
        { label: 'Editar' },
      ]
    : [
        { label: 'Visitas', to: '/visits' },
        { label: 'Nueva visita', to: '/visits/new' },
        { label: 'Diagnóstico técnico' },
      ];

  return (
    <div className="space-y-4 max-w-4xl">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-logo grid place-items-center bg-field-soft shrink-0">
          <HiOutlineLocationMarker className="w-6 h-6 text-field" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-heading m-0">
            {isEdit ? 'Editar visita' : 'Diagnóstico técnico'}
          </h2>
          <p className="text-[13px] text-muted m-0">
            {isEdit
              ? `Modifica los datos de la visita`
              : 'Registra la visita técnica paso a paso para generar el informe final'}
          </p>
        </div>
      </div>

      <VisitForm
        onSubmit={handleSubmit}
        clients={clients}
        defaultValues={visit}
        isLoading={isSaving}
      />
    </div>
  );
}
