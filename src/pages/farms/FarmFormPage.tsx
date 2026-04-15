import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { farmsApi } from '@/api/farms';
import { clientsApi } from '@/api/clients';
import { FarmForm } from '@/components/forms/FarmForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Client, Farm } from '@/types/api';
import type { FarmFormValues } from '@/schemas';
import axios from 'axios';

export function FarmFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [farm, setFarm] = useState<Farm | undefined>();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const promises: Promise<void>[] = [
      clientsApi.list(1).then((res) => {
        // Fetch all clients for the select
        setClients(res.data);
      }),
    ];

    if (id) {
      promises.push(
        farmsApi.get(Number(id)).then((res) => {
          setFarm(res.data);
        }),
      );
    }

    Promise.all(promises)
      .catch(() => {
        sileo.error({ title: 'Error al cargar datos' });
        navigate('/farms');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (data: FarmFormValues) => {
    setIsSaving(true);
    try {
      if (isEdit && id) {
        await farmsApi.update(Number(id), data);
        sileo.success({ title: 'Granja actualizada' });
      } else {
        await farmsApi.create(data);
        sileo.success({ title: 'Granja creada' });
      }
      navigate('/farms');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const errors = error.response.data.errors;
        const messages = Object.values(errors).flat() as string[];
        messages.forEach((msg) => sileo.error({ title: msg }));
      } else {
        sileo.error({ title: 'Error al guardar la granja' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner className="mt-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {isEdit ? 'Editar granja' : 'Nueva granja'}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <FarmForm onSubmit={handleSubmit} clients={clients} defaultValues={farm} isLoading={isSaving} />
      </div>
    </div>
  );
}
