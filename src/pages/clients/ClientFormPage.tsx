import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import { ClientForm } from '@/components/forms/ClientForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Client } from '@/types/api';
import type { ClientFormValues } from '@/schemas';
import axios from 'axios';

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
      } else {
        await clientsApi.create(data);
        sileo.success({ title: 'Cliente creado' });
      }
      navigate('/clients');
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <ClientForm onSubmit={handleSubmit} defaultValues={client} isLoading={isSaving} />
      </div>
    </div>
  );
}
