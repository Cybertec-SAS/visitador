import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { sileo } from 'sileo';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineCollection,
  HiOutlineUserAdd,
  HiOutlinePlus,
  HiOutlineLogout,
} from 'react-icons/hi';
import type { IconType } from 'react-icons';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navSections: {
  label?: string;
  items: { to: string; label: string; icon: IconType; end: boolean }[];
}[] = [
  {
    items: [
      { to: '/', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/clients', label: 'Clientes', icon: HiOutlineUserGroup, end: false },
      { to: '/farms', label: 'Granjas', icon: HiOutlineOfficeBuilding, end: false },
      { to: '/structures', label: 'Estructuras', icon: HiOutlineHome, end: false },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { to: '/visits', label: 'Visitas', icon: HiOutlineClipboardList, end: false },
      { to: '/projects', label: 'Proyectos', icon: HiOutlineCollection, end: false },
    ],
  },
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
        flex flex-col gap-3 bg-surface border border-line p-4 shadow-panel
        fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        min-[980px]:sticky min-[980px]:top-5 min-[980px]:self-start
        min-[980px]:max-h-[calc(100vh-40px)] min-[980px]:overflow-y-auto
        min-[980px]:w-auto min-[980px]:z-auto
        min-[980px]:translate-x-0 min-[980px]:rounded-panel
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-9 h-9 rounded-logo bg-primary text-white grid place-items-center font-extrabold text-base shrink-0">
          V
        </div>
        <div>
          <h1 className="text-[15px] font-bold m-0 leading-tight">Visitador</h1>
          <p className="text-[11px] text-muted m-0">Gestión técnica de campo</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-1.5">
        <Link
          to="/visits/new"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-control bg-primary text-white no-underline hover:bg-primary-hover transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4 shrink-0" />
          <span className="text-[13px] font-semibold">Nueva visita</span>
        </Link>
        <Link
          to="/clients/new"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-control border border-line bg-white text-heading no-underline hover:border-primary/30 hover:bg-primary-soft/50 transition-colors"
        >
          <HiOutlineUserAdd className="w-4 h-4 text-primary shrink-0" />
          <span className="text-[13px] font-semibold">Nuevo cliente</span>
        </Link>
      </div>

      <div className="border-t border-line" />

      {/* Navigation sections */}
      <nav className="space-y-3">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 mb-1">
                {section.label}
              </p>
            )}
            <div className="grid gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-control no-underline transition-colors ${
                      isActive
                        ? 'bg-primary-soft text-primary'
                        : 'text-heading hover:bg-primary-soft/50 hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`} />
                      <span className="text-[13px] font-semibold">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      {/* User row */}
      <div className="border-t border-line pt-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-logo grid place-items-center bg-primary text-white font-bold text-sm shrink-0">
          {(user?.name ?? 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-heading m-0 truncate">{user?.name ?? 'Usuario'}</p>
          <p className="text-[11px] text-muted m-0 truncate">{user?.email ?? ''}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:bg-red-50 hover:text-danger transition-colors cursor-pointer border-none bg-transparent shrink-0"
        >
          <HiOutlineLogout className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
