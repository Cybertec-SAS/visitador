import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import type { Project, PaginationMeta } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCollection } from 'react-icons/hi';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', active: 'Activo', paused: 'Pausado',
  completed: 'Completado', cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500', active: 'bg-green-50 text-green-700',
  paused: 'bg-amber-50 text-amber-700', completed: 'bg-primary-soft text-primary',
  cancelled: 'bg-red-50 text-red-500',
};

export function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await projectsApi.list({ page: p });
      setProjects(res.data);
      setMeta(res.meta);
    } catch {
      sileo.error({ title: 'Error al cargar proyectos' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(page); }, [page, fetchProjects]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(deleteTarget.id);
      sileo.success({ title: 'Proyecto eliminado' });
      setDeleteTarget(null);
      fetchProjects(page);
    } catch {
      sileo.error({ title: 'Error al eliminar el proyecto' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">Proyectos</h2>
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-2 rounded-btn px-4.5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : projects.length === 0 ? (
        <div className="border border-line rounded-section bg-white py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-soft grid place-items-center">
            <HiOutlineCollection className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-heading m-0">No hay proyectos aún</h3>
            <p className="text-[13px] text-muted mt-1.5">Crea proyectos de montaje vinculados a granjas</p>
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Crear proyecto
          </button>
        </div>
      ) : (
        <div className="border border-line rounded-section bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-input-bg">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Nombre</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label max-[768px]:hidden">Cliente</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label max-[768px]:hidden">Granja</th>
                <th className="text-left px-4 py-3 font-bold text-[13px] text-label">Estado</th>
                <th className="text-right px-4 py-3 font-bold text-[13px] text-label">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-primary-soft/30">
                  <td className="px-4 py-3">
                    <Link to={`/projects/${p.id}`} className="text-primary hover:underline font-medium text-[13px]">
                      {p.name}
                    </Link>
                    {p.code && <p className="text-[11px] text-muted m-0 mt-0.5">{p.code}</p>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-heading max-[768px]:hidden">{p.client?.razon_social ?? '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-heading max-[768px]:hidden">{p.farm?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/projects/${p.id}/edit`)}
                        className="w-8 h-8 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
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
        title="Eliminar proyecto"
        message={`¿Eliminar el proyecto "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
