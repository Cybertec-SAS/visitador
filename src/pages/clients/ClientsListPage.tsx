import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import type { Client, PaginationMeta } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup, HiOutlineUserAdd } from 'react-icons/hi';

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
          className="flex items-center gap-2 rounded-btn px-4.5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          <HiOutlineUserAdd className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : clients.length === 0 ? (
        <div className="border border-line rounded-section bg-white py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-soft grid place-items-center">
            <HiOutlineUserGroup className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-heading m-0">No hay clientes aún</h3>
            <p className="text-[13px] text-muted mt-1.5">Crea tu primer cliente para comenzar el flujo</p>
          </div>
          <button
            onClick={() => navigate('/clients/new')}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            <HiOutlineUserAdd className="w-4 h-4" />
            Crear primer cliente
          </button>
        </div>
      ) : (
        <div className="border border-line rounded-section bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Razón Social</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">NIT</th>
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
                      {client.razon_social}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-heading">{client.nit}</td>
                  <td className="px-4 py-3 text-heading">{client.email}</td>
                  <td className="px-4 py-3 text-heading">{client.phone_number}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                        title="Editar cliente"
                        className="w-8 h-8 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(client)}
                        title="Eliminar cliente"
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
        title="Eliminar cliente"
        message={`¿Estás seguro de eliminar a "${deleteTarget?.razon_social}"? Se eliminarán todas sus granjas, georreferencias y contactos.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
