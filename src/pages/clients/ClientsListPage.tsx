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
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">Clientes</h2>
        <button
          onClick={() => navigate('/clients/new')}
          className="rounded-btn px-[18px] py-3.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          + Nuevo cliente
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No hay clientes registrados.
        </div>
      ) : (
        <div className="border border-line rounded-section bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Nombre</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Razón Social</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Email</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Teléfono</th>
                <th className="text-right px-4 py-3 font-bold text-[13px] text-label">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-primary-soft/50">
                  <td className="px-4 py-3">
                    <Link to={`/clients/${client.id}`} className="text-primary hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-heading">{client.razon_social}</td>
                  <td className="px-4 py-3 text-heading">{client.email}</td>
                  <td className="px-4 py-3 text-heading">{client.phone_number}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/clients/${client.id}/edit`)}
                      className="text-sm text-primary hover:underline mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(client)}
                      className="text-sm text-danger hover:underline"
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
