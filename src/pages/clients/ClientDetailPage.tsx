import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import { visitsApi } from '@/api/visits';
import { structuresApi } from '@/api/structures';
import { projectsApi } from '@/api/projects';
import type { Client, Farm, Visit, Structure, Project } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { sileo } from 'sileo';
import { getStructureTypeName } from '@/constants/structureTypes';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePencil,
  HiOutlineOfficeBuilding,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlinePlus,
  HiOutlineClipboardList,
  HiOutlineHome,
  HiOutlineClock,
  HiOutlineCollection,
} from 'react-icons/hi';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:       { label: 'Borrador',    color: 'bg-gray-100 text-gray-600' },
  scheduled:   { label: 'Programada', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En progreso',color: 'bg-yellow-100 text-yellow-700' },
  completed:   { label: 'Completada', color: 'bg-green-100 text-green-700' },
  signed:      { label: 'Firmada',    color: 'bg-purple-100 text-purple-700' },
  closed:      { label: 'Cerrada',    color: 'bg-gray-100 text-gray-500' },
  cancelled:   { label: 'Cancelada',  color: 'bg-red-100 text-red-500' },
};

const PROJECT_STATUS: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Borrador',   color: 'bg-gray-100 text-gray-600' },
  active:    { label: 'Activo',     color: 'bg-green-100 text-green-700' },
  paused:    { label: 'Pausado',    color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelado',  color: 'bg-red-100 text-red-500' },
};

const STRUCT_STATUS: Record<string, { label: string; color: string }> = {
  active:             { label: 'Activo',          color: 'bg-green-100 text-green-700' },
  inactive:           { label: 'Inactivo',         color: 'bg-gray-100 text-gray-500' },
  under_construction: { label: 'En construcción',  color: 'bg-amber-100 text-amber-700' },
  retired:            { label: 'Retirado',         color: 'bg-red-50 text-red-500' },
};

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [structuresByFarm, setStructuresByFarm] = useState<Record<number, Structure[]>>({});
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedFarms, setExpandedFarms] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const clientId = Number(id);

    Promise.all([
      clientsApi.get(clientId),
      farmsApi.list(1, { client_id: clientId, per_page: 100 }),
      visitsApi.list({ client_id: clientId, per_page: 5 }),
      projectsApi.list({ client_id: clientId, per_page: 100 }),
    ])
      .then(async ([clientRes, farmsRes, visitsRes, projectsRes]) => {
        setClient(clientRes.data);
        const farmList = farmsRes.data.filter((f) => f.client_id === clientId);
        setFarms(farmList);
        setRecentVisits(visitsRes.data.filter((v) => v.client_id === clientId));
        setProjects((projectsRes.data ?? []).filter((p) => p.client_id === clientId));

        // Load structures for all farms in parallel
        const structEntries = await Promise.all(
          farmList.map((f) =>
            structuresApi.list({ farm_id: f.id }).then((ss) => [f.id, ss] as [number, Structure[]])
          )
        );
        setStructuresByFarm(Object.fromEntries(structEntries));
      })
      .catch(() => {
        sileo.error({ title: 'Cliente no encontrado' });
        navigate('/clients');
      })
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const toggleFarm = (farmId: number) =>
    setExpandedFarms((prev) => {
      const next = new Set(prev);
      next.has(farmId) ? next.delete(farmId) : next.add(farmId);
      return next;
    });

  if (isLoading) return <LoadingSpinner className="mt-12" />;
  if (!client) return null;

  const initials = client.razon_social
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const totalStructures = Object.values(structuresByFarm).reduce((sum, ss) => sum + ss.length, 0);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Back nav */}
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors no-underline"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Volver a clientes
      </Link>

      {/* Header card */}
      <div className="border border-line rounded-section p-4 bg-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-logo grid place-items-center bg-primary text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold text-heading m-0 truncate">{client.razon_social}</h2>
          <p className="text-[13px] text-muted mt-0.5 m-0">NIT: {client.nit}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[12px] text-muted">{farms.length} granja{farms.length !== 1 ? 's' : ''}</span>
            <span className="text-muted text-[10px]">·</span>
            <span className="text-[12px] text-muted">{totalStructures} estructura{totalStructures !== 1 ? 's' : ''}</span>
            <span className="text-muted text-[10px]">·</span>
            <span className="text-[12px] text-muted">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</span>
            <span className="text-muted text-[10px]">·</span>
            <span className="text-[12px] text-muted">{recentVisits.length > 0 ? `${recentVisits.length}+ visitas` : 'Sin visitas'}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none shrink-0"
        >
          <HiOutlinePencil className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* Info grid */}
      <div className="border border-line rounded-section p-4 bg-white">
        <p className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-4 m-0">Información del cliente</p>
        <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          {[
            { icon: HiOutlineIdentification, label: 'NIT', value: client.nit },
            { icon: HiOutlineMail, label: 'Email', value: client.email },
            { icon: HiOutlinePhone, label: 'Teléfono', value: client.phone_number },
            { icon: HiOutlineCalendar, label: 'Creado', value: new Date(client.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg grid place-items-center bg-primary-soft shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[12px] text-muted m-0">{label}</p>
                <p className="text-[14px] font-medium text-heading m-0 mt-0.5">{value ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Granjas y estructuras ── */}
      <div className="border border-line rounded-section bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0">
                Granjas
                {farms.length > 0 && <span className="ml-1.5 text-[12px] font-normal text-muted">({farms.length})</span>}
              </h3>
              <p className="text-[12px] text-muted m-0">{totalStructures} estructura{totalStructures !== 1 ? 's' : ''} en total</p>
            </div>
          </div>
          <Link
            to={`/farms/new?client_id=${client.id}`}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-btn px-3 py-1.5 no-underline transition-colors"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Nueva granja
          </Link>
        </div>

        {farms.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center px-4">
            <HiOutlineOfficeBuilding className="w-8 h-8 text-muted" />
            <p className="text-[13px] text-muted m-0">Este cliente no tiene granjas registradas</p>
            <Link
              to={`/farms/new?client_id=${client.id}`}
              className="flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors no-underline"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Crear primera granja
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {farms.map((farm) => {
              const structs = structuresByFarm[farm.id] ?? [];
              const isExpanded = expandedFarms.has(farm.id);

              return (
                <div key={farm.id}>
                  {/* Farm row */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <Link
                      to={`/farms/${farm.id}`}
                      className="w-9 h-9 rounded-logo grid place-items-center bg-primary-soft shrink-0 no-underline"
                    >
                      <HiOutlineOfficeBuilding className="w-4.5 h-4.5 text-primary" />
                    </Link>
                    <Link
                      to={`/farms/${farm.id}`}
                      className="flex-1 min-w-0 no-underline group"
                    >
                      <p className="text-[14px] font-semibold text-heading m-0 truncate group-hover:text-primary transition-colors">
                        {farm.nombre}
                      </p>
                      <p className="text-[12px] text-muted m-0">
                        {structs.length} estructura{structs.length !== 1 ? 's' : ''}
                        {farm.georreference?.town ? ` · ${farm.georreference.town}` : ''}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/structures/new?farm_id=${farm.id}`}
                        title="Nueva estructura"
                        className="w-7 h-7 rounded-lg grid place-items-center text-primary bg-primary-soft hover:bg-primary hover:text-white transition-colors no-underline"
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" />
                      </Link>
                      {structs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleFarm(farm.id)}
                          className="w-7 h-7 rounded-lg grid place-items-center text-muted bg-input-bg hover:bg-line transition-colors border-none cursor-pointer"
                          title={isExpanded ? 'Ocultar estructuras' : 'Ver estructuras'}
                        >
                          <HiOutlineChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Structures — expandible */}
                  {isExpanded && structs.length > 0 && (
                    <div className="border-t border-line bg-gray-50/60 divide-y divide-line">
                      {structs.map((s) => {
                        const ss = STRUCT_STATUS[s.status] ?? STRUCT_STATUS.active;
                        return (
                          <Link
                            key={s.id}
                            to={`/structures/${s.id}`}
                            className="flex items-center gap-3 pl-14 pr-4 py-2.5 hover:bg-gray-100 no-underline group transition-colors"
                          >
                            <HiOutlineHome className="w-3.5 h-3.5 text-muted shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] font-medium text-heading group-hover:text-primary transition-colors">
                                {s.name}
                              </span>
                              {s.code && (
                                <span className="ml-2 text-[11px] font-mono text-muted bg-white px-1.5 py-0.5 rounded border border-line">
                                  {s.code}
                                </span>
                              )}
                              <span className="ml-2 text-[11px] text-muted">{getStructureTypeName(s.structure_type)}</span>
                            </div>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ss.color}`}>
                              {ss.label}
                            </span>
                          </Link>
                        );
                      })}
                      <Link
                        to={`/structures/new?farm_id=${farm.id}`}
                        className="flex items-center gap-2 pl-14 pr-4 py-2.5 text-[12px] text-primary font-semibold hover:bg-gray-100 no-underline transition-colors"
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" />
                        Agregar estructura a {farm.nombre}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Proyectos ── */}
      <div className="border border-line rounded-section bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
              <HiOutlineCollection className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0">
                Proyectos
                {projects.length > 0 && <span className="ml-1.5 text-[12px] font-normal text-muted">({projects.length})</span>}
              </h3>
              <p className="text-[12px] text-muted m-0">Solo de este cliente</p>
            </div>
          </div>
          <Link
            to={`/projects/new?client_id=${client.id}`}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-btn px-3 py-1.5 no-underline transition-colors"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Nuevo proyecto
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
            <HiOutlineCollection className="w-7 h-7 text-muted" />
            <p className="text-[13px] text-muted m-0">Sin proyectos registrados para este cliente</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {projects.map((p) => {
              const st = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.draft;
              return (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 no-underline group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-heading truncate m-0 group-hover:text-primary transition-colors">
                      {p.name}
                    </p>
                    <p className="text-[12px] text-muted m-0 truncate">
                      {p.code ? `${p.code} · ` : ''}{p.farm?.nombre ?? '—'}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>
                    {st.label}
                  </span>
                  <HiOutlineChevronRight className="w-4 h-4 text-muted shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Visitas recientes ── */}
      <div className="border border-line rounded-section bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary-soft shrink-0">
              <HiOutlineClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0">Visitas recientes</h3>
              <p className="text-[12px] text-muted m-0">Solo de este cliente</p>
            </div>
          </div>
          <Link
            to={`/visits/new?client_id=${id}`}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-btn px-3 py-1.5 no-underline transition-colors"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            Nueva visita
          </Link>
        </div>

        {recentVisits.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
            <HiOutlineClock className="w-7 h-7 text-muted" />
            <p className="text-[13px] text-muted m-0">Sin visitas registradas para este cliente</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recentVisits.map((v) => {
              const st = STATUS_LABELS[v.status] ?? STATUS_LABELS.draft;
              return (
                <Link
                  key={v.id}
                  to={['in_progress', 'scheduled'].includes(v.status) ? `/visits/${v.id}/capture` : `/visits/${v.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 no-underline group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-heading truncate m-0 group-hover:text-primary transition-colors">
                      {v.title}
                    </p>
                    <p className="text-[12px] text-muted m-0 truncate">
                      {v.farm?.nombre ?? '—'} · {v.report_date ?? '—'}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>
                    {st.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
