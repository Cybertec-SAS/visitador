import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineArrowRight,
  HiOutlineLightningBolt,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineCalendar,
} from 'react-icons/hi';
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

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  const [showStartModal, setShowStartModal] = useState(false);
  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayStr();
    visitsApi.list({ per_page: 10 }).then((res) => {
      const all = res.data;
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

  const activeVisits = todayVisits;

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">
            Hola, {firstName} 👋
          </h2>
          <p className="mt-1 text-sm text-muted">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Hero CTA */}
        <button
          type="button"
          onClick={() => setShowStartModal(true)}
          className="w-full flex items-center gap-4 bg-primary hover:bg-primary-hover text-white rounded-section p-5 transition-colors group shadow-sm"
        >
          <div className="w-14 h-14 rounded-logo grid place-items-center bg-white/20 shrink-0">
            <HiOutlineLightningBolt className="w-7 h-7" />
          </div>
          <div className="flex-1 text-left">
            <strong className="block text-lg">+ Iniciar visita</strong>
            <span className="text-sm opacity-80">Captura hallazgos, compromisos y mediciones</span>
          </div>
          <HiOutlineChevronRight className="w-6 h-6 opacity-70 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Today's visits */}
        {!loading && activeVisits.length > 0 && (
          <div className="border border-line rounded-section bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center gap-2">
              <HiOutlineCalendar className="w-4 h-4 text-primary" />
              <p className="text-[13px] font-semibold text-muted uppercase tracking-wide m-0">
                Visitas de hoy ({activeVisits.length})
              </p>
            </div>
            <div className="divide-y divide-line">
              {activeVisits.map((v) => (
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[v.status]?.color}`}>
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
              <button
                type="button"
                onClick={() => setShowStartModal(true)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Inicia la primera visita
              </button>
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_LABELS[v.status]?.color}`}>
                    {STATUS_LABELS[v.status]?.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Admin shortcuts */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { to: '/clients', icon: HiOutlineUserGroup, label: 'Clientes' },
            { to: '/farms', icon: HiOutlineOfficeBuilding, label: 'Granjas' },
            { to: '/visits', icon: HiOutlineClipboardList, label: 'Todas las visitas' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 border border-line rounded-section p-3 bg-white no-underline hover:border-primary/30 hover:bg-primary-soft transition-all"
            >
              <div className="w-9 h-9 rounded-logo grid place-items-center bg-primary-soft">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-heading text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {showStartModal && <StartVisitModal onClose={() => setShowStartModal(false)} />}
    </>
  );
}
