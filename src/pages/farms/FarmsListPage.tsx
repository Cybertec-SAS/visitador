import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmsApi } from '@/api/farms';
import type { Farm, PaginationMeta } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineOfficeBuilding, HiOutlinePlus } from 'react-icons/hi';

export function FarmsListPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Farm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchFarms = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const response = await farmsApi.list(p);
      setFarms(response.data);
      setMeta(response.meta);
    } catch {
      sileo.error({ title: 'Error al cargar granjas' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarms(page);
  }, [page, fetchFarms]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await farmsApi.delete(deleteTarget.id);
      sileo.success({ title: 'Granja eliminada correctamente' });
      setDeleteTarget(null);
      fetchFarms(page);
    } catch {
      sileo.error({ title: 'Error al eliminar la granja' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">Granjas</h2>
        <button
          onClick={() => navigate('/farms/new')}
          className="flex items-center gap-2 rounded-btn px-4.5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Nueva granja
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : farms.length === 0 ? (
        <div className="border border-line rounded-section bg-white py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-soft grid place-items-center">
            <HiOutlineOfficeBuilding className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-heading m-0">No hay granjas aún</h3>
            <p className="text-[13px] text-muted mt-1.5">Primero crea un cliente y luego agrega su granja</p>
          </div>
          <button
            onClick={() => navigate('/farms/new')}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Crear primera granja
          </button>
        </div>
      ) : (
        <div className="border border-line rounded-section bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Nombre</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Cliente</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Voltaje</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Corriente</th>
                <th className="text-right px-4 py-3 font-bold text-[13px] text-label">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {farms.map((farm) => (
                <tr key={farm.id} className="hover:bg-primary-soft/50">
                  <td className="px-4 py-3">
                    <Link to={`/farms/${farm.id}`} className="text-primary hover:underline">
                      {farm.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-heading">
                    {farm.client ? (
                      <Link to={`/clients/${farm.client.id}`} className="text-primary hover:underline">
                        {farm.client.razon_social}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-heading">{farm.farm_voltage ?? '—'}</td>
                  <td className="px-4 py-3 text-heading">{farm.farm_electric_current ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/farms/${farm.id}/edit`)}
                        title="Editar granja"
                        className="w-8 h-8 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(farm)}
                        title="Eliminar granja"
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
        title="Eliminar granja"
        message={`¿Estás seguro de eliminar "${deleteTarget?.nombre}"? Se eliminarán su georreferencia y contactos.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
