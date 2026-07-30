import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { visitsApi } from '@/api/visits';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { VisitReport } from '@/components/forms/visit/VisitReport';
import { visitToFormValues } from '@/components/forms/visit/defaults';
import { sileo } from 'sileo';
import type { Visit } from '@/types/api';
import { HiOutlinePencil, HiOutlinePrinter } from 'react-icons/hi';

export function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<Visit | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    visitsApi
      .get(Number(id))
      .then((res) => setVisit(res.data))
      .catch(() => {
        sileo.error({ title: 'Visita no encontrada' });
        navigate('/visits');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!visit) return null;

  const values = visitToFormValues(visit);
  const ctx = {
    clienteNombre: visit.cliente_nombre ?? '',
    granjaNombre: visit.granja_nombre ?? '',
    galponNumero: visit.galpon_numero ?? '',
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="print:hidden space-y-4">
        <Breadcrumb
          items={[{ label: 'Visitas', to: '/visits' }, { label: visit.granja_nombre ?? 'Visita' }]}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[22px] font-bold text-heading m-0">Informe de visita</h2>
            <p className="text-[13px] text-muted m-0">
              {visit.granja_nombre || 'Granja'} · {visit.fecha}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-semibold text-heading border border-line bg-white hover:bg-input-bg transition-colors cursor-pointer"
            >
              <HiOutlinePrinter className="w-4 h-4" />
              Imprimir / PDF
            </button>
            <button
              onClick={() => navigate(`/visits/${visit.id}/edit`)}
              className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
            >
              <HiOutlinePencil className="w-4 h-4" />
              Editar visita
            </button>
          </div>
        </div>
      </div>

      <VisitReport values={values} ctx={ctx} />
    </div>
  );
}
