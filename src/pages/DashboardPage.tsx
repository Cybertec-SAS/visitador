import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineArrowRight,
  HiOutlineLightningBolt,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlinePlus,
} from 'react-icons/hi';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';
import { visitsApi } from '@/api/visits';
import { StartVisitModal } from '@/components/visits/StartVisitModal';
import type { Visit } from '@/types/api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En progreso', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  signed: { label: 'Firmada', color: 'bg-purple-100 text-purple-700' },
  closed: { label: 'Cerrada', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-500' },
};

const todayStr = () => new Date().toISOString().slice(0, 10);

type GuideStep = 'client' | 'farm' | 'visit';

interface StepState {
  clientCount: number;
  farmCount: number;
  visitCount: number;
  loaded: boolean;
}

function GuideCard({
  stepNum,
  icon: Icon,
  title,
  description,
  cta,
  ctaTo,
  ctaOnClick,
  status,
  badge,
  locked,
}: {
  stepNum: number;
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
  ctaTo?: string;
  ctaOnClick?: () => void;
  status: 'done' | 'active' | 'locked';
  badge?: string;
  locked?: boolean;
}) {
  const isActive = status === 'active';
  const isDone = status === 'done';

  const cardClass = [
    'relative rounded-2xl border transition-all',
    isDone ? 'border-green-200 bg-green-50/40' : '',
    isActive ? 'border-blue-300 bg-white shadow-md ring-2 ring-blue-100' : '',
    locked ? 'border-gray-100 bg-gray-50 opacity-60' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ActionEl = ctaTo ? Link : 'button';
  const actionProps = ctaTo
    ? { to: ctaTo }
    : { type: 'button' as const, onClick: ctaOnClick };

  return (
    <div className={cardClass}>
      {/* Step number connector line */}
      <div className="flex gap-4 p-4 pb-3">
        {/* Left column: number + line */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={[
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
              isDone ? 'bg-green-500 text-white' : '',
              isActive ? 'bg-blue-600 text-white' : '',
              locked ? 'bg-gray-200 text-gray-400' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isDone ? <HiOutlineCheckCircle className="w-5 h-5" /> : stepNum}
          </div>
        </div>

        {/* Right column: content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon
                className={[
                  'w-4 h-4 shrink-0',
                  isDone ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              <p
                className={[
                  'font-semibold text-sm m-0',
                  isDone ? 'text-green-800' : isActive ? 'text-blue-900' : 'text-gray-400',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {title}
              </p>
            </div>
            {badge && (
              <span
                className={[
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                  isDone ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {badge}
              </span>
            )}
          </div>

          <p
            className={[
              'text-xs mt-1 m-0',
              isDone ? 'text-green-700' : isActive ? 'text-gray-500' : 'text-gray-400',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {description}
          </p>

          {!locked && (
            // @ts-ignore
            <ActionEl
              {...actionProps}
              className={[
                'mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg no-underline transition-colors',
                isDone
                  ? 'bg-white border border-green-200 text-green-700 hover:bg-green-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isDone ? (
                <>
                  <HiOutlinePlus className="w-3.5 h-3.5" /> {cta}
                </>
              ) : (
                <>
                  {cta} <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </ActionEl>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  const [showStartModal, setShowStartModal] = useState(false);
  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<StepState>({
    clientCount: 0,
    farmCount: 0,
    visitCount: 0,
    loaded: false,
  });

  useEffect(() => {
    const today = todayStr();
    Promise.all([
      clientsApi.list(1, { per_page: 1 }),
      farmsApi.list(1, { per_page: 1 }),
      visitsApi.list({ per_page: 10 }),
    ]).then(([clients, farms, visits]) => {
      const all = visits.data;
      setSteps({
        clientCount: clients.meta?.total ?? clients.data.length,
        farmCount: farms.meta?.total ?? farms.data.length,
        visitCount: all.length,
        loaded: true,
      });
      setTodayVisits(
        all.filter(
          (v) =>
            ['scheduled', 'in_progress'].includes(v.status) &&
            (!v.report_date || v.report_date === today),
        ),
      );
      setRecentVisits(all.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const hasClients = steps.clientCount > 0;
  const hasFarms = steps.farmCount > 0;
  const hasVisits = steps.visitCount > 0;

  // Determine the current active step


  const getStepStatus = (step: GuideStep): 'done' | 'active' | 'locked' => {
    if (step === 'client') return hasClients ? 'done' : 'active';
    if (step === 'farm') {
      if (!hasClients) return 'locked';
      return hasFarms ? 'done' : 'active';
    }
    // visit
    if (!hasClients || !hasFarms) return 'locked';
    return 'active';
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-[26px] font-bold text-heading m-0 max-[640px]:text-2xl">
            Hola, {firstName} 👋
          </h2>
          <p className="mt-1 text-sm text-muted">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        {/* Guided workflow */}
        {steps.loaded && (
          <div className="bg-white border border-line rounded-section overflow-hidden">
            <div className="px-4 py-3 border-b border-line">
              <p className="text-[13px] font-semibold text-muted uppercase tracking-wide m-0">
                ¿Por dónde empezar?
              </p>
              <p className="text-xs text-muted mt-0.5 m-0">
                Sigue este orden para crear tu primera visita
              </p>
            </div>

            <div className="p-3 space-y-2">
              {/* Step 1 – Cliente */}
              <GuideCard
                stepNum={1}
                icon={HiOutlineUserGroup}
                title="Registrar cliente"
                description={
                  hasClients
                    ? `${steps.clientCount} cliente${steps.clientCount > 1 ? 's' : ''} registrado${steps.clientCount > 1 ? 's' : ''}`
                    : 'Agrega la empresa o persona propietaria de la granja'
                }
                cta={hasClients ? 'Nuevo cliente' : 'Crear primer cliente'}
                ctaTo="/clients/new"
                status={getStepStatus('client')}
                badge={hasClients ? `${steps.clientCount}` : undefined}
              />

              {/* Connector */}
              <div className="flex justify-start pl-[26px]">
                <div className="w-0.5 h-3 bg-gray-200 rounded-full ml-[14px]" />
              </div>

              {/* Step 2 – Granja */}
              <GuideCard
                stepNum={2}
                icon={HiOutlineOfficeBuilding}
                title="Registrar granja"
                description={
                  hasFarms
                    ? `${steps.farmCount} granja${steps.farmCount > 1 ? 's' : ''} registrada${steps.farmCount > 1 ? 's' : ''}`
                    : 'Agrega la granja o predio donde se realizará la visita'
                }
                cta={hasFarms ? 'Nueva granja' : 'Crear primera granja'}
                ctaTo="/farms/new"
                status={getStepStatus('farm')}
                badge={hasFarms ? `${steps.farmCount}` : undefined}
                locked={!hasClients}
              />

              {/* Connector */}
              <div className="flex justify-start pl-[26px]">
                <div className="w-0.5 h-3 bg-gray-200 rounded-full ml-[14px]" />
              </div>

              {/* Step 3 – Visita */}
              <GuideCard
                stepNum={3}
                icon={HiOutlineClipboardList}
                title="Iniciar visita"
                description={
                  hasVisits
                    ? `${steps.visitCount} visita${steps.visitCount > 1 ? 's' : ''} registrada${steps.visitCount > 1 ? 's' : ''}`
                    : 'Selecciona cliente, granja y tipo de reporte para comenzar'
                }
                cta={hasVisits ? 'Nueva visita' : 'Iniciar primera visita'}
                ctaOnClick={() => setShowStartModal(true)}
                status={getStepStatus('visit')}
                badge={hasVisits ? `${steps.visitCount}` : undefined}
                locked={!hasClients || !hasFarms}
              />
            </div>

            {/* CTA principal si todo está listo */}
            {hasClients && hasFarms && (
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={() => setShowStartModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl py-3 text-sm font-semibold transition-colors shadow-sm"
                >
                  <HiOutlineLightningBolt className="w-4 h-4" />
                  Iniciar visita ahora
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading placeholder */}
        {!steps.loaded && (
          <div className="bg-white border border-line rounded-section p-6 text-center">
            <p className="text-sm text-muted">Cargando...</p>
          </div>
        )}

        {/* Today's visits */}
        {!loading && todayVisits.length > 0 && (
          <div className="border border-line rounded-section bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center gap-2">
              <HiOutlineCalendar className="w-4 h-4 text-primary" />
              <p className="text-[13px] font-semibold text-muted uppercase tracking-wide m-0">
                Visitas de hoy ({todayVisits.length})
              </p>
            </div>
            <div className="divide-y divide-line">
              {todayVisits.map((v) => (
                <Link
                  key={v.id}
                  to={`/visits/${v.id}/capture`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 no-underline group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-heading truncate m-0">{v.title}</p>
                    <p className="text-xs text-muted truncate m-0">
                      {v.farm?.nombre ?? '—'} · {v.client?.razon_social ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[v.status]?.color}`}
                    >
                      {STATUS_LABELS[v.status]?.label}
                    </span>
                    <HiOutlineArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent visits */}
        {(hasVisits || !steps.loaded) && (
          <div className="border border-line rounded-section bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiOutlineClock className="w-4 h-4 text-muted" />
                <p className="text-[13px] font-semibold text-muted uppercase tracking-wide m-0">
                  Visitas recientes
                </p>
              </div>
              <Link to="/visits" className="text-xs text-primary hover:underline">
                Ver todas
              </Link>
            </div>

            {loading ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted">Cargando...</p>
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted">No hay visitas aún.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {recentVisits.map((v) => (
                  <Link
                    key={v.id}
                    to={
                      ['in_progress', 'scheduled'].includes(v.status)
                        ? `/visits/${v.id}/capture`
                        : `/visits/${v.id}`
                    }
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 no-underline group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-heading truncate m-0">{v.title}</p>
                      <p className="text-xs text-muted truncate m-0">
                        {v.farm?.nombre ?? '—'} · {v.report_date ?? '—'}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_LABELS[v.status]?.color}`}
                    >
                      {STATUS_LABELS[v.status]?.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick access links */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { to: '/clients', icon: HiOutlineUserGroup, label: 'Clientes' },
            { to: '/farms', icon: HiOutlineOfficeBuilding, label: 'Granjas' },
            { to: '/visits', icon: HiOutlineClipboardList, label: 'Visitas' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-1.5 px-2 py-3 bg-white border border-line rounded-xl no-underline hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl grid place-items-center bg-primary-soft">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[12px] font-semibold text-heading m-0">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {showStartModal && <StartVisitModal onClose={() => setShowStartModal(false)} />}
    </>
  );
}
