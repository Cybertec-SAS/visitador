import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { farmsApi } from '@/api/farms';
import { clientsApi } from '@/api/clients';
import { FarmForm } from '@/components/forms/FarmForm';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import type { Client, Farm } from '@/types/api';
import type { FarmFormValues } from '@/schemas';
import axios from 'axios';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';

export function FarmFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id') ? Number(searchParams.get('client_id')) : undefined;
  const isEdit = !!id;

  const [farm, setFarm] = useState<Farm | undefined>();
  const [clients, setClients] = useState<Client[]>([]);
  const [preselectedClient, setPreselectedClient] = useState<Client | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const promises: Promise<void>[] = [
      clientsApi.list(1, { per_page: 200 }).then((res) => setClients(res.data)),
    ];

    if (id) {
      promises.push(farmsApi.get(Number(id)).then((res) => setFarm(res.data)));
    }

    if (preselectedClientId) {
      promises.push(clientsApi.get(preselectedClientId).then((res) => setPreselectedClient(res.data)));
    }

    Promise.all(promises)
      .catch(() => {
        sileo.error({ title: 'Error al cargar datos' });
        navigate('/farms');
      })
      .finally(() => setIsLoading(false));
  }, [id, preselectedClientId, navigate]);

  const handleSubmit = async (data: FarmFormValues) => {
    setIsSaving(true);
    try {
      if (isEdit && id) {
        await farmsApi.update(Number(id), data);
        sileo.success({ title: 'Granja actualizada' });
        navigate(`/farms/${id}`);
      } else {
        const res = await farmsApi.create(data);
        sileo.success({ title: '¡Granja creada! Ahora agrega galpones y sistemas.' });
        navigate(`/farms/${res.data.id}?new=1`);
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

  // Resolves the client for the breadcrumb: editing → farm.client, creating → preselectedClient
  const contextClient = isEdit ? farm?.client : preselectedClient;

  const breadcrumbItems = (() => {
    if (isEdit && contextClient) {
      return [
        { label: 'Clientes', to: '/clients' },
        { label: contextClient.razon_social, to: `/clients/${contextClient.id}` },
        { label: farm?.nombre ?? 'Granja', to: `/farms/${id}` },
        { label: 'Editar' },
      ];
    }
    if (isEdit) {
      return [
        { label: 'Granjas', to: '/farms' },
        { label: farm?.nombre ?? 'Granja', to: `/farms/${id}` },
        { label: 'Editar' },
      ];
    }
    if (contextClient) {
      return [
        { label: 'Clientes', to: '/clients' },
        { label: contextClient.razon_social, to: `/clients/${contextClient.id}` },
        { label: 'Nueva granja' },
      ];
    }
    return [
      { label: 'Clientes', to: '/clients' },
      { label: 'Nueva granja' },
    ];
  })();

  return (
    <div className="space-y-4 max-w-2xl">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-logo grid place-items-center bg-primary-soft shrink-0">
          <HiOutlineOfficeBuilding className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-heading m-0">
            {isEdit ? 'Editar granja' : 'Nueva granja'}
          </h2>
          <p className="text-[13px] text-muted m-0">
            {isEdit
              ? `Modifica los datos de ${farm?.nombre ?? 'esta granja'}`
              : 'Paso 2 de 3 · Cliente → Granja → Galpones y sistemas'}
          </p>
        </div>
      </div>

      {/* Flow hint – only on create */}
      {!isEdit && clients.length > 0 && (
        <div className="border border-primary/20 rounded-control p-3.5 bg-primary-soft/40 flex items-start gap-3">
          <span className="text-[13px] text-primary leading-relaxed">
            💡 <strong>Paso 2 de 3:</strong> Ingresa los datos técnicos de la granja. Después podrás agregar
            galpones con sus dimensiones y los sistemas instalados en cada uno.
          </span>
        </div>
      )}

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

      <FarmForm
        onSubmit={handleSubmit}
        clients={clients}
        defaultValues={farm}
        preselectedClientId={preselectedClientId}
        isLoading={isSaving}
      />
    </div>
  );
}
