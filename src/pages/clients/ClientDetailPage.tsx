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
      <div className="flex items-center justify-between mb-5">
        <div>
          <Link to="/clients" className="text-sm text-primary hover:underline">
            ← Volver a clientes
          </Link>
          <h2 className="text-[28px] font-bold text-heading m-0 mt-1 max-[640px]:text-2xl">{client.razon_social}</h2>
        </div>
        <button
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          className="rounded-btn px-4.5 py-3.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          Editar
        </button>
      </div>

      <div className="border border-line rounded-section p-4.5 bg-white">
        <dl className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
          <div>
            <dt className="text-[13px] text-muted">NIT</dt>
            <dd className="font-medium text-heading">{client.nit}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Email</dt>
            <dd className="font-medium text-heading">{client.email}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Teléfono</dt>
            <dd className="font-medium text-heading">{client.phone_number}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Creado</dt>
            <dd className="font-medium text-heading">
              {new Date(client.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Farms list */}
      {client.farms && client.farms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base font-semibold text-heading mb-3.5">Granjas</h3>
          <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
            {client.farms.map((farm) => (
              <Link
                key={farm.id}
                to={`/farms/${farm.id}`}
                className="block border border-line rounded-action p-4 hover:border-primary/30 transition-colors no-underline"
              >
                <h3 className="font-medium text-heading">{farm.nombre}</h3>
                <p className="text-[13px] text-muted mt-1">
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
