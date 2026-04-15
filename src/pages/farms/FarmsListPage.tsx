import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { farmsApi } from '@/api/farms';
import type { Farm, PaginationMeta } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Granjas</h1>
        <button
          onClick={() => navigate('/farms/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nueva granja
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : farms.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No hay granjas registradas.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Voltaje</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Corriente</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {farms.map((farm) => (
                <tr key={farm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <Link to={`/farms/${farm.id}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                      {farm.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {farm.client ? (
                      <Link to={`/clients/${farm.client.id}`} className="hover:underline">
                        {farm.client.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{farm.farm_voltage ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{farm.farm_electric_current ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/farms/${farm.id}/edit`)}
                      className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(farm)}
                      className="text-sm text-red-600 hover:underline dark:text-red-400"
                    >
                      Eliminar
                    </button>
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
