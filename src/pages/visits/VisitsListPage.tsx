import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { visitsApi } from '@/api/visits';
import type { Visit, PaginationMeta } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClipboardList,
  HiOutlineFilter,
} from 'react-icons/hi';

const statusLabel: Record<string, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  in_progress: 'En progreso',
  completed: 'Completada',
  signed: 'Firmada',
  closed: 'Cerrada',
  cancelled: 'Cancelada',
};

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  scheduled: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
  signed: 'bg-primary-soft text-primary',
  closed: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-red-50 text-red-500',
};

export function VisitsListPage() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Visit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchVisits = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page: p, per_page: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await visitsApi.list(params);
      setVisits(res.data);
      setMeta(res.meta);
    } catch {
      sileo.error({ title: 'Error al cargar visitas' });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchVisits(page);
  }, [page, fetchVisits]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await visitsApi.delete(deleteTarget.id);
      sileo.success({ title: 'Visita eliminada' });
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
        <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">Visitas</h2>
        <button
          onClick={() => navigate('/visits/new')}
          className="flex items-center gap-2 rounded-btn px-4.5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Nueva visita
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <HiOutlineFilter className="w-4 h-4 text-muted shrink-0" />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-line rounded-control px-3 py-2 text-[13px] text-heading bg-white focus:outline-none focus:border-primary"
        >
          <option value="">Todos los estados</option>
          {Object.entries(statusLabel).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : visits.length === 0 ? (
        <div className="border border-line rounded-section bg-white py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-soft grid place-items-center">
            <HiOutlineClipboardList className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-heading m-0">No hay visitas aún</h3>
            <p className="text-[13px] text-muted mt-1.5">Crea tu primera visita técnica</p>
          </div>
          <button
            onClick={() => navigate('/visits/new')}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Crear primera visita
          </button>
        </div>
      ) : (
        <div className="border border-line rounded-section bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Título</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label max-[768px]:hidden">Tipo</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label max-[768px]:hidden">Granja</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Estado</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label max-[640px]:hidden">Fecha</th>
                <th className="text-right px-4 py-3 font-bold text-[13px] text-label">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-primary-soft/30">
                  <td className="px-4 py-3">
                    <Link to={`/visits/${v.id}`} className="text-primary hover:underline font-medium text-[13px]">
                      {v.title}
                    </Link>
                    {v.client && (
                      <p className="text-[11px] text-muted m-0 mt-0.5">{v.client.razon_social}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-heading max-[768px]:hidden">
                    {v.visit_type?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-heading max-[768px]:hidden">
                    {v.farm?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor[v.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {statusLabel[v.status] ?? v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted max-[640px]:hidden">
                    {v.report_date ? new Date(v.report_date).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/visits/${v.id}/edit`)}
                        title="Editar"
                        className="w-8 h-8 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(v)}
                        title="Eliminar"
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
        message={`¿Eliminar "${deleteTarget?.title}"? Se eliminarán todos sus hallazgos, compromisos y evidencias.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
