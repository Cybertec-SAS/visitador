import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import type { Client } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    clientsApi
      .get(Number(id))
      .then((res) => setClient(res.data))
      .catch(() => {
        sileo.error({ title: 'Cliente no encontrado' });
        navigate('/clients');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!client) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/clients" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← Volver a clientes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{client.name}</h1>
        </div>
        <button
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Editar
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Razón Social</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{client.razon_social}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{client.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Teléfono</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{client.phone_number}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Creado</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">
              {new Date(client.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Farms list */}
      {client.farms && client.farms.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Granjas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.farms.map((farm) => (
              <Link
                key={farm.id}
                to={`/farms/${farm.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{farm.nombre}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {farm.farm_voltage ?? 'Sin voltaje'} · {farm.farm_electric_current ?? 'Sin corriente'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
