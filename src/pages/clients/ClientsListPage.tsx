import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import type { Client, PaginationMeta } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';

export function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchClients = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const response = await clientsApi.list(p);
      setClients(response.data);
      setMeta(response.meta);
    } catch {
      sileo.error({ title: 'Error al cargar clientes' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(page);
  }, [page, fetchClients]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await clientsApi.delete(deleteTarget.id);
      sileo.success({ title: 'Cliente eliminado correctamente' });
      setDeleteTarget(null);
      fetchClients(page);
    } catch {
      sileo.error({ title: 'Error al eliminar el cliente' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
        <button
          onClick={() => navigate('/clients/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuevo cliente
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No hay clientes registrados.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Razón Social</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Teléfono</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <Link to={`/clients/${client.id}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{client.razon_social}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{client.email}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{client.phone_number}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/clients/${client.id}/edit`)}
                      className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(client)}
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
        title="Eliminar cliente"
        message={`¿Estás seguro de eliminar a "${deleteTarget?.name}"? Se eliminarán todas sus granjas, georreferencias y contactos.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
