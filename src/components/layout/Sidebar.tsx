import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { sileo } from 'sileo';
import { useNavigate } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineSearch, HiOutlineUserAdd, HiOutlinePlus, HiOutlineLogout } from 'react-icons/hi';
import type { IconType } from 'react-icons';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems: { to: string; label: string; subtitle: string; icon: IconType; end: boolean }[] = [
  { to: '/', label: 'Dashboard', subtitle: 'Vista general', icon: HiOutlineViewGrid, end: true },
  { to: '/clients', label: 'Clientes', subtitle: 'Ver todos los clientes', icon: HiOutlineUserGroup, end: false },
  { to: '/farms', label: 'Granjas', subtitle: 'Ver todas las granjas', icon: HiOutlineOfficeBuilding, end: false },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      sileo.success({ title: 'Sesión cerrada correctamente' });
      navigate('/login');
    } catch {
      sileo.error({ title: 'Error al cerrar sesión' });
    }
  };

  return (
    <aside
      className={`
        flex flex-col gap-4.5 bg-surface border border-line p-5.5 shadow-panel
        fixed inset-y-0 left-0 z-40 w-[320px] overflow-y-auto
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        min-[980px]:static min-[980px]:w-auto min-[980px]:z-auto
        min-[980px]:translate-x-0 min-[980px]:overflow-visible
        min-[980px]:rounded-panel
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-logo bg-primary text-white grid place-items-center font-extrabold text-lg">
          V
        </div>
        <div>
          <h1 className="text-xl font-bold m-0">Visitador</h1>
          <p className="mt-1 text-sm text-muted">Flujo simple: cliente → granja</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 border border-line rounded-search px-4 py-3.5 bg-white">
        <HiOutlineSearch className="w-5 h-5 text-muted shrink-0" />
        <input
          type="text"
          placeholder="Buscar cliente o granja"
          className="border-none outline-none w-full text-[15px] bg-transparent text-heading placeholder:text-placeholder"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3">
        <Link
          to="/clients/new"
          onClick={onClose}
          className="border border-primary rounded-action p-4.5 bg-primary text-white flex items-center justify-between no-underline"
        >
          <div>
            <strong className="block text-base mb-1">Nuevo cliente</strong>
            <span className="text-[13px] opacity-80">Primer paso obligatorio</span>
          </div>
          <div className="w-10.5 h-10.5 rounded-logo grid place-items-center bg-white/16 text-white shrink-0 ml-3.5">
            <HiOutlineUserAdd className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/farms/new"
          onClick={onClose}
          className="border border-line rounded-action p-4.5 bg-white flex items-center justify-between no-underline text-heading hover:border-primary/30 transition-colors"
        >
          <div>
            <strong className="block text-base mb-1">Nueva granja</strong>
            <span className="text-[13px] text-muted">Requiere un cliente</span>
          </div>
          <div className="w-10.5 h-10.5 rounded-logo grid place-items-center bg-primary-soft text-primary shrink-0 ml-3.5">
            <HiOutlinePlus className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="border-t border-line pt-1.5 grid gap-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `block py-3.5 border-b border-line no-underline transition-colors ${
                isActive ? 'text-primary' : 'text-heading hover:text-primary'
              }`
            }
          >
            <strong className="flex items-center gap-2 text-[15px] mb-1"><item.icon className="w-4.5 h-4.5" /> {item.label}</strong>
            <span className="text-[13px] text-muted">{item.subtitle}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User card */}
      <div className="border border-line rounded-action p-4 grid gap-2.5 bg-white">
        <strong className="text-[15px]">{user?.name ?? 'Usuario'}</strong>
        <span className="text-[13px] text-muted">Usuario activo</span>
        <button
          onClick={handleLogout}
          className="mt-1.5 border-none bg-primary text-white p-3 rounded-xl font-bold cursor-pointer hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
