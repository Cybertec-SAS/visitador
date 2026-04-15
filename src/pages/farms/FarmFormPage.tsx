import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { farmsApi } from '@/api/farms';
import { clientsApi } from '@/api/clients';
import { FarmForm } from '@/components/forms/FarmForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Client, Farm } from '@/types/api';
import type { FarmFormValues } from '@/schemas';
import axios from 'axios';
import { HiOutlineChevronLeft, HiOutlineOfficeBuilding } from 'react-icons/hi';

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
        navigate(`/farms/${id}`);
      } else {
        const res = await farmsApi.create(data);
        sileo.success({ title: '¡Granja creada! Agrega contactos y georreferencia.' });
        navigate(`/farms/${res.data.id}`);
      }
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
    <div className="space-y-4 max-w-2xl">
      {/* Back nav */}
      <Link
        to={isEdit && id ? `/farms/${id}` : '/farms'}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        {isEdit ? 'Volver a la granja' : 'Volver a granjas'}
      </Link>

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-logo grid place-items-center bg-primary-soft shrink-0">
          <HiOutlineOfficeBuilding className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-heading m-0">
            {isEdit ? `Editar granja` : 'Nueva granja'}
          </h2>
          <p className="text-[13px] text-muted m-0">
            {isEdit
              ? `Modifica los datos de ${farm?.nombre ?? 'esta granja'}`
              : 'Paso 2 del flujo · Completa en 4 pasos guiados'}
          </p>
        </div>
      </div>

      {/* No clients warning */}
      {!isEdit && clients.length === 0 && (
        <div className="border border-orange-200 rounded-control p-3.5 bg-orange-50 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[13px] text-orange-700">
            ⚠️ No hay clientes registrados. Debes crear un cliente primero.
          </span>
          <Link
            to="/clients/new"
            className="text-[13px] font-bold text-orange-700 hover:underline no-underline shrink-0"
          >
            Crear cliente →
          </Link>
        </div>
      )}

      <FarmForm onSubmit={handleSubmit} clients={clients} defaultValues={farm} isLoading={isSaving} />
    </div>
  );
}
