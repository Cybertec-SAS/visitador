import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { visitsApi } from '@/api/visits';
import type { Visit, PaginationMeta } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLocationMarker,
  HiOutlinePlus,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const TYPE_LABEL: Record<string, string> = { diagnostico_tecnico: 'Diagnóstico técnico' };

function StatusBadge({ status }: { status: Visit['status'] }) {
  const done = status === 'completed';
  return (
    <span
      className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${
        done ? 'text-field bg-field-soft' : 'text-report bg-report-soft'
      }`}
    >
      {done ? 'Completada' : 'Borrador'}
    </span>
  );
}

export function VisitsListPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Visit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchVisits = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const response = await visitsApi.list(p);
      setVisits(response.data);
      setMeta(response.meta);
    } catch {
      sileo.error({ title: 'Error al cargar visitas' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits(page);
  }, [page, fetchVisits]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await visitsApi.delete(deleteTarget.id);
      sileo.success({ title: 'Visita eliminada correctamente' });
      setDeleteTarget(null);
      fetchVisits(page);
    } catch {
      sileo.error({ title: 'Error al eliminar la visita' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">Mis visitas</h2>
        <button
          onClick={() => navigate('/visits/new')}
          className="flex items-center gap-2 rounded-btn px-4.5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Nueva visita
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : visits.length === 0 ? (
        <div className="border border-line rounded-section bg-white py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-field-soft grid place-items-center">
            <HiOutlineLocationMarker className="w-8 h-8 text-field" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-heading m-0">No hay visitas aún</h3>
            <p className="text-[13px] text-muted mt-1.5">Programa tu primera visita técnica para comenzar</p>
          </div>
          <button
            onClick={() => navigate('/visits/new')}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Nueva visita
          </button>
        </div>
      ) : (
        <div className="border border-line rounded-section bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Granja</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Cliente</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Galpón</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Tipo</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Fecha</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Estado</th>
                <th className="text-right px-4 py-3 font-bold text-[13px] text-label">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-primary-soft/50">
                  <td className="px-4 py-3">
                    <Link to={`/visits/${visit.id}`} className="text-primary hover:underline">
                      {visit.granja_nombre || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-heading">{visit.cliente_nombre || '—'}</td>
                  <td className="px-4 py-3 text-heading">{visit.galpon_numero || '—'}</td>
                  <td className="px-4 py-3 text-heading">{TYPE_LABEL[visit.type] ?? visit.type}</td>
                  <td className="px-4 py-3 text-heading">{visit.fecha || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={visit.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/visits/${visit.id}`)}
                        title="Ver informe"
                        className="w-8 h-8 rounded-lg grid place-items-center text-field bg-field-soft hover:bg-field hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlineDocumentText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/visits/${visit.id}/edit`)}
                        title="Editar visita"
                        className="w-8 h-8 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(visit)}
                        title="Eliminar visita"
                        className="w-8 h-8 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar visita"
        message={`¿Estás seguro de eliminar la visita de "${deleteTarget?.granja_nombre ?? 'esta granja'}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
