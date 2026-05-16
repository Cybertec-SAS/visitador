import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import { ClientForm } from '@/components/forms/ClientForm';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Client } from '@/types/api';
import type { ClientFormValues } from '@/schemas';
import axios from 'axios';
import { HiOutlineUserGroup } from 'react-icons/hi';

export function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [client, setClient] = useState<Client | undefined>();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      clientsApi
        .get(Number(id))
        .then((res) => setClient(res.data))
        .catch(() => {
          sileo.error({ title: 'Cliente no encontrado' });
          navigate('/clients');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, navigate]);

  const handleSubmit = async (data: ClientFormValues) => {
    setIsSaving(true);
    try {
      if (isEdit && id) {
        await clientsApi.update(Number(id), data);
        sileo.success({ title: 'Cliente actualizado' });
        navigate(`/clients/${id}`);
      } else {
        const res = await clientsApi.create(data);
        sileo.success({ title: '¡Cliente creado! Ahora agrega su granja.' });
        navigate(`/clients/${res.data.id}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const errors = error.response.data.errors;
        const messages = Object.values(errors).flat() as string[];
        messages.forEach((msg) => sileo.error({ title: msg }));
      } else {
        sileo.error({ title: 'Error al guardar el cliente' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner className="mt-12" />;

  const breadcrumbItems = isEdit && client
    ? [
        { label: 'Clientes', to: '/clients' },
        { label: client.razon_social, to: `/clients/${client.id}` },
        { label: 'Editar' },
      ]
    : [
        { label: 'Clientes', to: '/clients' },
        { label: 'Nuevo cliente' },
      ];

  return (
    <div className="space-y-4 max-w-2xl">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-logo grid place-items-center bg-primary-soft shrink-0">
          <HiOutlineUserGroup className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-heading m-0">
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <p className="text-[13px] text-muted m-0">
            {isEdit
              ? `Modifica los datos de ${client?.razon_social ?? 'este cliente'}`
              : 'Paso 1 de 3 · Cliente → Granja → Galpones y sistemas'}
          </p>
        </div>
      </div>

      {!isEdit && (
        <div className="border border-primary/20 rounded-control p-3.5 bg-primary-soft/40 flex items-start gap-3">
          <span className="text-[13px] text-primary leading-relaxed">
            💡 <strong>Paso 1 de 3:</strong> Registra el cliente con su razón social y contacto. Después
            crearás la granja con datos técnicos, y dentro de cada granja agregarás los galpones y
            los sistemas instalados en ellos.
          </span>
        </div>
      )}

      <ClientForm onSubmit={handleSubmit} defaultValues={client} isLoading={isSaving} />
    </div>
  );
}
