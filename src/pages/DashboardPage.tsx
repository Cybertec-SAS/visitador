import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { clientsApi } from '@/api/clients';
import { farmsApi } from '@/api/farms';

interface Stats {
  clients: number;
  farms: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ clients: 0, farms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clientsApi.list(1, { per_page: 1 }),
      farmsApi.list(1, { per_page: 1 }),
    ])
      .then(([clients, farms]) => {
        setStats({
          clients: clients.meta?.total ?? clients.data.length,
          farms: farms.meta?.total ?? farms.data.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const userName = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <div className="space-y-5">
      {/* Hero operativo */}
      <div className="relative overflow-hidden rounded-panel bg-heading p-6 text-white shadow-panel">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/40 blur-3xl pointer-events-none" />

        <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Inicio por acciones
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              ¿Qué vas a gestionar hoy, {userName}?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Elige la acción principal y entra directamente al flujo: registro de clientes, granjas, galpones y sistemas.
            </p>
          </div>

          <div className="rounded-section border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-wide text-blue-100">Búsqueda rápida</p>
            <div className="mt-3 flex rounded-control bg-white p-1.5">
              <input
                className="min-w-0 flex-1 rounded-btn px-3 py-2 text-sm font-semibold text-heading outline-none bg-transparent"
                placeholder="Cliente, granja o NIT..."
              />
              <button className="rounded-btn bg-primary px-4 py-2 text-sm font-black text-white hover:bg-primary-hover transition-colors">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de acción principal */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Registrar cliente */}
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
                  <p className="text-sm font-bold text-muted">Granja / ubicación / contactos</p>
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

        {/* Granjas y galpones */}
        <article className="group overflow-hidden rounded-panel border border-line bg-surface shadow-panel transition hover:-translate-y-1">
          <div className="h-2 bg-emerald-500 rounded-t-panel" />
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-section bg-emerald-50 text-2xl">
                🏗️
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                Infraestructura
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-black text-heading">Granjas</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Gestiona granjas, agrega galpones con sus dimensiones y registra los sistemas instalados en cada uno.
            </p>

            <div className="mt-4 rounded-section bg-input-bg p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted">Flujo de gestión</p>
              <div className="mt-3 grid gap-2">
                <Link
                  to="/farms"
                  className="flex items-center justify-between rounded-action bg-surface px-4 py-3 text-sm font-black text-heading shadow-sm border border-line hover:border-emerald-300 hover:bg-emerald-50 transition-colors no-underline"
                >
                  Ver todas las granjas <span>→</span>
                </Link>
                <Link
                  to="/farms/new"
                  className="flex items-center justify-between rounded-action bg-surface px-4 py-3 text-sm font-black text-heading shadow-sm border border-line hover:border-emerald-300 hover:bg-emerald-50 transition-colors no-underline"
                >
                  Registrar nueva granja <span>→</span>
                </Link>
              </div>
            </div>

            <Link
              to="/farms"
              className="mt-4 flex w-full items-center justify-between rounded-btn bg-emerald-600 px-5 py-3 text-sm font-black text-white no-underline hover:bg-emerald-700 transition-colors"
            >
              Ir a granjas <span>→</span>
            </Link>
          </div>
        </article>

        {/* Clientes */}
        <article className="group overflow-hidden rounded-panel border border-line bg-surface shadow-panel transition hover:-translate-y-1">
          <div className="h-2 bg-violet-500 rounded-t-panel" />
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-section bg-violet-50 text-2xl">
                👥
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                Clientes
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-black text-heading">Clientes</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Consulta y gestiona el directorio de clientes con sus granjas, contactos y datos de negocio asociados.
            </p>

            <div className="mt-4 rounded-section bg-input-bg p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted">Acciones rápidas</p>
              <div className="mt-3 grid gap-2">
                <Link
                  to="/clients"
                  className="flex items-center justify-between rounded-action bg-surface px-4 py-3 text-sm font-black text-heading shadow-sm border border-line hover:border-violet-300 hover:bg-violet-50 transition-colors no-underline"
                >
                  Ver todos los clientes <span>→</span>
                </Link>
                <Link
                  to="/clients/new"
                  className="flex items-center justify-between rounded-action bg-surface px-4 py-3 text-sm font-black text-heading shadow-sm border border-line hover:border-violet-300 hover:bg-violet-50 transition-colors no-underline"
                >
                  Registrar nuevo cliente <span>→</span>
                </Link>
              </div>
            </div>

            <Link
              to="/clients"
              className="mt-4 flex w-full items-center justify-between rounded-btn bg-violet-600 px-5 py-3 text-sm font-black text-white no-underline hover:bg-violet-700 transition-colors"
            >
              Ir a clientes <span>→</span>
            </Link>
          </div>
        </article>
      </div>

      {/* Indicadores */}
      <section className="rounded-panel border border-line bg-surface p-5 shadow-panel">
        <p className="text-xs font-black uppercase tracking-wide text-muted">Resumen rápido</p>
        <h3 className="mt-1 text-xl font-black text-heading">Indicadores de operación</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 max-w-sm">
          <Link to="/clients" className="rounded-section bg-input-bg p-4 no-underline hover:bg-primary-soft/30 transition-colors">
            <p className="text-3xl font-black text-heading">{loading ? '–' : stats.clients}</p>
            <p className="mt-1 text-xs font-bold text-muted">Clientes activos</p>
          </Link>
          <Link to="/farms" className="rounded-section bg-input-bg p-4 no-underline hover:bg-primary-soft/30 transition-colors">
            <p className="text-3xl font-black text-heading">{loading ? '–' : stats.farms}</p>
            <p className="mt-1 text-xs font-bold text-muted">Granjas registradas</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
