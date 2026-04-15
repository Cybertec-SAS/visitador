import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import type { Client } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { HiOutlineChevronLeft, HiOutlinePencil, HiOutlineOfficeBuilding, HiOutlineMail, HiOutlinePhone, HiOutlineIdentification, HiOutlineCalendar, HiOutlinePlus } from 'react-icons/hi';

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

  const initials = client.razon_social
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Back nav */}
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a clientes
      </Link>

      {/* Header card */}
      <div className="border border-line rounded-section p-4 bg-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-logo grid place-items-center bg-primary text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold text-heading m-0 truncate">{client.razon_social}</h2>
          <p className="text-[13px] text-muted mt-0.5">NIT: {client.nit}</p>
        </div>
        <button
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none shrink-0"
        >
          <HiOutlinePencil className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* Info grid */}
      <div className="border border-line rounded-section p-4 bg-white">
        <p className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-4">Información del cliente</p>
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
                <p className="text-[14px] font-medium text-heading m-0 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farms section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold text-heading m-0 flex items-center gap-2">
            <HiOutlineOfficeBuilding className="w-5 h-5 text-primary" />
            Granjas ({client.farms?.length ?? 0})
          </h3>
          <button
            onClick={() => navigate('/farms/new')}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer border-none bg-transparent"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Nueva granja
          </button>
        </div>

        {client.farms && client.farms.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
            {client.farms.map((farm) => (
              <Link
                key={farm.id}
                to={`/farms/${farm.id}`}
                className="flex items-center gap-3 border border-line rounded-action p-4 hover:border-primary/30 hover:bg-primary-soft/30 transition-colors no-underline group"
              >
                <div className="w-10 h-10 rounded-logo grid place-items-center bg-primary-soft shrink-0">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-heading m-0 text-[14px] truncate">{farm.nombre}</h4>
                  <p className="text-[12px] text-muted mt-0.5 m-0">
                    {farm.farm_voltage ?? 'Sin voltaje'} · {farm.farm_electric_current ?? 'Sin corriente'}
                  </p>
                </div>
                <HiOutlineChevronLeft className="w-4 h-4 text-muted rotate-180 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line rounded-section py-10 flex flex-col items-center gap-3 text-center">
            <HiOutlineOfficeBuilding className="w-8 h-8 text-muted" />
            <p className="text-[13px] text-muted m-0">Este cliente no tiene granjas aún</p>
            <button
              onClick={() => navigate('/farms/new')}
              className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Agregar granja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
