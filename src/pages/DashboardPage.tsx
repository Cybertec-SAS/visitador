import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-panel bg-heading p-6 text-white shadow-panel">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/40 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-blue-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Inicio por acciones
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            ¿Qué vas a gestionar hoy, {userName}?
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Elige la acción principal y entra directamente al flujo.
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid gap-4 xl:grid-cols-3">

        {/* Registrar */}
        <article className="group overflow-hidden rounded-panel border border-line bg-surface shadow-panel transition hover:-translate-y-1">
          <div className="h-2 bg-primary rounded-t-panel" />
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-section bg-primary-soft text-2xl text-primary">
                ＋
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary">
                Base maestra
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-black text-heading">Registrar</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Crea la estructura mínima antes de operar: cliente, granja, contacto, ubicación y datos técnicos.
            </p>

            <div className="mt-4 rounded-section bg-input-bg p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted">Ruta sugerida</p>
              <div className="mt-3 space-y-3">
                <div className="flex gap-3 items-center">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-white">1</span>
                  <p className="text-sm font-bold text-heading">Cliente / razón social / NIT</p>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-black text-primary">2</span>
                  <p className="text-sm font-bold text-muted">Granja / estructura / ubicación</p>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-black text-primary">3</span>
                  <p className="text-sm font-bold text-muted">Galpones y sistemas instalados</p>
                </div>
              </div>
            </div>

            <Link
              to="/clients/new"
              className="mt-4 flex w-full items-center justify-between rounded-btn bg-primary px-5 py-3 text-sm font-black text-white no-underline hover:bg-primary-hover transition-colors group-hover:bg-primary-hover"
            >
              Iniciar flujo de registro <span>→</span>
            </Link>
          </div>
        </article>

        {/* Visitas */}
        <article className="group overflow-hidden rounded-panel border border-line bg-surface shadow-panel transition hover:-translate-y-1">
          <div className="h-2 bg-field rounded-t-panel" />
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-section bg-field-soft text-2xl">
                📍
              </div>
              <span className="rounded-full bg-field-soft px-3 py-1 text-xs font-black text-field">
                Campo
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-black text-heading">Visitas</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Planea, ejecuta y cierra visitas técnicas con evidencias, georreferencia, novedades y compromisos asociados.
            </p>

            <div className="mt-4 rounded-section bg-input-bg p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted">Opciones del flujo</p>
              <div className="mt-3 grid gap-2">
                <Link
                  to="/visits/new"
                  className="flex items-center justify-between rounded-action bg-surface px-4 py-3 text-sm font-black text-heading shadow-sm border border-line no-underline hover:border-field hover:text-field transition-colors"
                >
                  Nueva visita <span>→</span>
                </Link>
                <Link
                  to="/visits"
                  className="flex items-center justify-between rounded-action bg-surface px-4 py-3 text-sm font-black text-heading shadow-sm border border-line no-underline hover:border-field hover:text-field transition-colors"
                >
                  Mis visitas <span>→</span>
                </Link>
              </div>
            </div>

            <Link
              to="/visits/new"
              className="mt-4 flex w-full items-center justify-between rounded-btn bg-field px-5 py-3 text-sm font-black text-white no-underline hover:bg-field-hover transition-colors group-hover:bg-field-hover"
            >
              Iniciar flujo de visitas <span>→</span>
            </Link>
          </div>
        </article>

        {/* Reportes */}
        <article className="group overflow-hidden rounded-panel border border-line bg-surface shadow-panel transition hover:-translate-y-1">
          <div className="h-2 bg-report rounded-t-panel" />
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-section bg-report-soft text-2xl">
                ▤
              </div>
              <span className="rounded-full bg-report-soft px-3 py-1 text-xs font-black text-report">
                Hallazgos
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-black text-heading">Reportes</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Registra hallazgos, recomendaciones, compromisos, evidencias y seguimiento técnico por cliente o granja.
            </p>

            <div className="mt-4 rounded-section bg-input-bg p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted">Tipos de reporte</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Técnico', 'Novedad', 'Compromiso', 'Seguimiento'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface px-3 py-2 text-xs font-black text-muted shadow-sm border border-line"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              disabled
              className="mt-4 flex w-full items-center justify-between rounded-btn bg-report px-5 py-3 text-sm font-black text-white opacity-50 cursor-not-allowed"
            >
              Crear reporte técnico <span>→</span>
            </button>
          </div>
        </article>

      </div>
    </div>
  );
}
