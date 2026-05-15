import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import type { Client, Farm } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePencil,
  HiOutlineOfficeBuilding,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlinePlus,
} from 'react-icons/hi';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const clientId = Number(id);

    Promise.all([
      clientsApi.get(clientId),
      farmsApi.list(1, { client_id: clientId, per_page: 100 }),
    ])
      .then(([clientRes, farmsRes]) => {
        setClient(clientRes.data);
        setFarms(farmsRes.data.filter((farm) => farm.client_id === clientId));
      })
      .catch(() => {
        sileo.error({ title: 'Cliente no encontrado' });
        navigate('/clients');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!client) return null;

  const initials = client.razon_social
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-4 max-w-3xl">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a clientes
      </Link>

      <div className="border border-line rounded-section p-4 bg-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-logo grid place-items-center bg-primary text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold text-heading m-0 truncate">{client.razon_social}</h2>
          <p className="text-[13px] text-muted mt-0.5 m-0">NIT: {client.nit}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[12px] text-muted">{farms.length} granja{farms.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none shrink-0"
        >
          <HiOutlinePencil className="w-4 h-4" />
          Editar
        </button>
      </div>

      <div className="border border-line rounded-section p-4 bg-white">
        <p className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-4 m-0">Información del cliente</p>
        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          {[
            { icon: HiOutlineIdentification, label: 'NIT', value: client.nit },
            { icon: HiOutlineMail, label: 'Email', value: client.email },
            { icon: HiOutlinePhone, label: 'Teléfono', value: client.phone_number },
            { icon: HiOutlineCalendar, label: 'Creado', value: new Date(client.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg grid place-items-center bg-primary-soft shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[12px] text-muted m-0">{label}</p>
                <p className="text-[14px] font-medium text-heading m-0 mt-0.5">{value ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-line rounded-section bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0">
                Granjas
                {farms.length > 0 && <span className="ml-1.5 text-[12px] font-normal text-muted">({farms.length})</span>}
              </h3>
              <p className="text-[12px] text-muted m-0">Granjas registradas para este cliente</p>
            </div>
          </div>
          <Link
            to={`/farms/new?client_id=${client.id}`}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-btn px-3 py-1.5 no-underline transition-colors"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Nueva granja
          </Link>
        </div>

        {farms.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center px-4">
            <HiOutlineOfficeBuilding className="w-8 h-8 text-muted" />
            <p className="text-[13px] text-muted m-0">Este cliente no tiene granjas registradas</p>
            <Link
              to={`/farms/new?client_id=${client.id}`}
              className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors no-underline"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Crear primera granja
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {farms.map((farm) => (
              <Link
                key={farm.id}
                to={`/farms/${farm.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors no-underline"
              >
                <div className="w-9 h-9 rounded-logo grid place-items-center bg-primary-soft shrink-0">
                  <HiOutlineOfficeBuilding className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-heading m-0 truncate">{farm.nombre}</p>
                  <p className="text-[12px] text-muted m-0">
                    {farm.georreference?.town ? farm.georreference.town : 'Sin municipio registrado'}
                  </p>
                </div>
                <HiOutlineChevronRight className="w-4 h-4 text-muted shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}