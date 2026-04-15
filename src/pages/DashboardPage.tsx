import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardList,
  HiOutlineArrowRight,
  HiOutlineUserAdd,
  HiOutlinePlus,
  HiOutlineChevronRight,
} from 'react-icons/hi';

export function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">
          Hola, {firstName} 👋
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Aquí tienes un resumen rápido de tu sistema.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-3.5">
        <Link
          to="/clients/new"
          className="flex items-center gap-4 border-2 border-primary rounded-section p-5 bg-primary text-white no-underline hover:bg-primary-hover transition-colors group"
        >
          <div className="w-12 h-12 rounded-logo grid place-items-center bg-white/20 shrink-0">
            <HiOutlineUserAdd className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <strong className="block text-[15px]">Crear nuevo cliente</strong>
            <span className="text-[13px] opacity-75">Primer paso del flujo</span>
          </div>
          <HiOutlineChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/farms/new"
          className="flex items-center gap-4 border border-line rounded-section p-4 bg-white text-heading no-underline hover:border-primary/40 hover:bg-primary-soft transition-colors group"
        >
          <div className="w-12 h-12 rounded-logo grid place-items-center bg-primary-soft shrink-0">
            <HiOutlinePlus className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <strong className="block text-[15px]">Crear nueva granja</strong>
            <span className="text-[13px] text-muted">Necesitas un cliente previo</span>
          </div>
          <HiOutlineChevronRight className="w-5 h-5 text-muted group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Flujo visual */}
      <div className="border border-line rounded-section p-4 bg-white">
        <p className="text-[13px] font-semibold text-muted uppercase tracking-wide mb-3">
          Flujo de trabajo
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 border border-primary/20 rounded-action px-4 py-3 bg-primary-soft">
            <HiOutlineUserGroup className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-primary m-0">1. Cliente</p>
              <p className="text-[11px] text-muted m-0">Razón social + NIT</p>
            </div>
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-muted shrink-0" />
          <div className="flex items-center gap-3 border border-line rounded-action px-4 py-3">
            <HiOutlineOfficeBuilding className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-heading m-0">2. Granja</p>
              <p className="text-[11px] text-muted m-0">Datos eléctricos</p>
            </div>
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-muted shrink-0" />
          <div className="flex items-center gap-3 border border-line rounded-action px-4 py-3">
            <HiOutlineClipboardList className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-heading m-0">3. Contactos</p>
              <p className="text-[11px] text-muted m-0">Personal de la granja</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 min-[640px]:grid-cols-3 gap-3.5">
        {[
          {
            to: '/clients',
            icon: HiOutlineUserGroup,
            label: 'Clientes',
            desc: 'Ver y gestionar todos los clientes registrados',
          },
          {
            to: '/farms',
            icon: HiOutlineOfficeBuilding,
            label: 'Granjas',
            desc: 'Administrar granjas y su infraestructura eléctrica',
          },
          {
            to: '/clients',
            icon: HiOutlineClipboardList,
            label: 'Contactos',
            desc: 'Contactos asociados a cada granja',
          },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col gap-3 border border-line rounded-section p-4 bg-white no-underline hover:border-primary/30 hover:shadow-panel transition-all group"
          >
            <div className="w-11 h-11 rounded-logo grid place-items-center bg-primary-soft">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-heading m-0 flex items-center gap-1.5">
                {label}
                <HiOutlineArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-[13px] text-muted mt-1 m-0">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
