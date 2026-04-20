import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { structuresApi } from '@/api/structures';
import { farmsApi } from '@/api/farms';
import type { Structure, Farm } from '@/types/api';
import { getStructureTypeName } from '@/constants/structureTypes';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { sileo } from 'sileo';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineHome,
  HiOutlineChevronRight,
} from 'react-icons/hi';

const statusLabel: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  under_construction: 'En construcción',
  retired: 'Retirado',
};

const statusColor: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  under_construction: 'bg-amber-50 text-amber-700',
  retired: 'bg-red-50 text-red-500',
};

export function StructuresListPage() {
  const [searchParams] = useSearchParams();
  const farmIdParam = searchParams.get('farm_id');
  const navigate = useNavigate();

  const [structures, setStructures] = useState<Structure[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Structure | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStructures = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { farm_id?: number; parent_only?: boolean } = { parent_only: true };
      if (farmIdParam) params.farm_id = Number(farmIdParam);
      const data = await structuresApi.list(params);
      setStructures(data);
    } catch {
      sileo.error({ title: 'Error al cargar estructuras' });
    } finally {
      setIsLoading(false);
    }
  }, [farmIdParam]);

  useEffect(() => {
    fetchStructures();
    if (farmIdParam) {
      farmsApi.get(Number(farmIdParam)).then((r) => setFarm(r.data)).catch(() => {});
    }
  }, [fetchStructures, farmIdParam]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await structuresApi.delete(deleteTarget.id);
      sileo.success({ title: 'Estructura eliminada' });
      setDeleteTarget(null);
      fetchStructures();
    } catch {
      sileo.error({ title: 'Error al eliminar la estructura' });
    } finally {
      setIsDeleting(false);
    }
  };

  const newHref = farmIdParam ? `/structures/new?farm_id=${farmIdParam}` : '/structures/new';

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">Estructuras</h2>
          {farm && <p className="text-[13px] text-muted mt-0.5">Granja: {farm.nombre}</p>}
        </div>
        <button
          onClick={() => navigate(newHref)}
          className="flex items-center gap-2 rounded-btn px-4.5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Nueva estructura
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : structures.length === 0 ? (
        <div className="border border-line rounded-section bg-white py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-soft grid place-items-center">
            <HiOutlineHome className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-heading m-0">No hay estructuras aún</h3>
            <p className="text-[13px] text-muted mt-1.5">Agrega galpones, silos y otras instalaciones</p>
          </div>
          <button
            onClick={() => navigate(newHref)}
            className="flex items-center gap-2 rounded-btn px-5 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Crear estructura
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {structures.map((s) => (
            <div key={s.id} className="border border-line rounded-section bg-white overflow-hidden">
              {/* Parent row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-logo bg-primary-soft grid place-items-center shrink-0">
                  <HiOutlineHome className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/structures/${s.id}`}
                    className="font-semibold text-heading hover:text-primary transition-colors no-underline text-[14px]"
                  >
                    {s.name}
                  </Link>
                  <p className="text-[12px] text-muted m-0 mt-0.5">
                    {getStructureTypeName(s.structure_type)} {s.code ? `· ${s.code}` : ''}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {statusLabel[s.status] ?? s.status}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate(`/structures/${s.id}/edit`)}
                    title="Editar"
                    className="w-8 h-8 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    title="Eliminar"
                    className="w-8 h-8 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              {s.children && s.children.length > 0 && (
                <div className="border-t border-line divide-y divide-line">
                  {s.children.map((child) => (
                    <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 pl-12 bg-input-bg">
                      <HiOutlineChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium text-heading">{child.name}</span>
                        <span className="text-[12px] text-muted ml-2">{getStructureTypeName(child.structure_type)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => navigate(`/structures/${child.id}/edit`)}
                          className="w-7 h-7 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors cursor-pointer border-none"
                        >
                          <HiOutlinePencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(child)}
                          className="w-7 h-7 rounded-lg grid place-items-center text-danger bg-red-50 hover:bg-danger hover:text-white transition-colors cursor-pointer border-none"
                        >
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar estructura"
        message={`¿Eliminar "${deleteTarget?.name}"? Las sub-estructuras quedarán sin padre.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
