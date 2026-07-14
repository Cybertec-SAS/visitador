import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { sileo } from 'sileo';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlineDocumentReport,
  HiOutlineChevronDown,
  HiOutlinePlus,
  HiOutlineLogout,
  HiOutlineViewList,
} from 'react-icons/hi';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface SubItem {
  to: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

interface NavGroup {
  key: string;
  label: string;
  icon: React.ElementType;
  matchPrefix: string;
  disabled?: boolean;
  subItems: SubItem[];
}

interface Section {
  sectionLabel: string;
  color: string;
  groups: NavGroup[];
}

const sections: Section[] = [
  {
    sectionLabel: 'Registro',
    color: 'text-primary',
    groups: [
      {
        key: 'clientes',
        label: 'Clientes',
        icon: HiOutlineUserGroup,
        matchPrefix: '/clients',
        subItems: [
          { to: '/clients', label: 'Ver clientes', icon: HiOutlineViewList },
          { to: '/clients/new', label: 'Nuevo cliente', icon: HiOutlinePlus },
        ],
      },
    ],
  },
  {
    sectionLabel: 'Campo',
    color: 'text-field',
    groups: [
      {
        key: 'visitas',
        label: 'Visitas',
        icon: HiOutlineLocationMarker,
        matchPrefix: '/visits',
        subItems: [
          { to: '/visits/new', label: 'Programar visita', icon: HiOutlinePlus },
          { to: '/visits', label: 'Mis visitas', icon: HiOutlineViewList },
        ],
      },
    ],
  },
  {
    sectionLabel: 'Hallazgos',
    color: 'text-report',
    groups: [
      {
        key: 'reportes',
        label: 'Reportes',
        icon: HiOutlineDocumentReport,
        matchPrefix: '/reports',
        disabled: true,
        subItems: [
          { to: '/reports/new', label: 'Crear reporte', icon: HiOutlinePlus, disabled: true },
          { to: '/reports', label: 'Ver reportes', icon: HiOutlineViewList, disabled: true },
        ],
      },
    ],
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track which groups are expanded; open the active one by default
  const initialExpanded = new Set(
    sections.flatMap((s) =>
      s.groups
        .filter((g) => !g.disabled && location.pathname.startsWith(g.matchPrefix))
        .map((g) => g.key),
    ),
  );
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      sileo.success({ title: 'Sesión cerrada correctamente' });
      navigate('/login');
    } catch {
      sileo.error({ title: 'Error al cerrar sesión' });
    }
  };

  const initial = (user?.name ?? 'U')[0].toUpperCase();

  return (
    <aside
      className={`
        flex flex-col gap-4 bg-surface border border-line p-4 shadow-panel
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
      <div className="flex items-center gap-3 rounded-section bg-input-bg px-3 py-3">
        <div className="w-10 h-10 rounded-logo bg-primary text-white grid place-items-center font-black text-base shrink-0 shadow-sm">
          V
        </div>
        <div>
          <h1 className="text-[15px] font-black m-0 leading-tight text-heading">Visitador</h1>
          <p className="text-[11px] text-muted m-0 font-medium">Gestión técnica agropecuaria</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">

        {/* Inicio — simple, always visible */}
        <NavLink
          to="/"
          end
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-control no-underline transition-colors ${
              isActive ? 'bg-primary-soft text-primary font-bold' : 'text-heading hover:bg-input-bg'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <HiOutlineHome className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted'}`} />
              <span className="text-[13px] font-semibold">Inicio</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </>
          )}
        </NavLink>

        {/* Collapsible sections */}
        {sections.map((section) => (
          <div key={section.sectionLabel}>
            <p className={`text-[10px] font-black uppercase tracking-[0.16em] px-3 pt-3 pb-1 m-0 ${section.color}`}>
              {section.sectionLabel}
            </p>

            {section.groups.map((group) => {
              const isGroupActive = !group.disabled && location.pathname.startsWith(group.matchPrefix);
              const isOpen = expanded.has(group.key);
              const GroupIcon = group.icon;

              return (
                <div key={group.key}>
                  {/* Group header — toggles expand */}
                  <button
                    type="button"
                    disabled={group.disabled}
                    onClick={() => !group.disabled && toggle(group.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-control transition-colors border-none text-left
                      ${group.disabled
                        ? 'opacity-40 cursor-not-allowed bg-transparent'
                        : isGroupActive
                          ? 'bg-primary-soft cursor-pointer'
                          : 'hover:bg-input-bg cursor-pointer bg-transparent'
                      }`}
                  >
                    <GroupIcon
                      className={`w-4 h-4 shrink-0 ${
                        group.disabled ? 'text-muted' : isGroupActive ? 'text-primary' : 'text-muted'
                      }`}
                    />
                    <span
                      className={`text-[13px] font-semibold flex-1 ${
                        group.disabled ? 'text-muted' : isGroupActive ? 'text-primary' : 'text-heading'
                      }`}
                    >
                      {group.label}
                    </span>
                    {group.disabled ? (
                      <span className="text-[10px] font-black uppercase tracking-wide text-muted bg-input-bg rounded-full px-2 py-0.5">
                        Pronto
                      </span>
                    ) : (
                      <HiOutlineChevronDown
                        className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* Sub-items */}
                  {isOpen && !group.disabled && (
                    <div className="ml-3 pl-3 border-l border-line space-y-0.5 py-1">
                      {group.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        if (sub.disabled) {
                          return (
                            <div
                              key={sub.to}
                              className="flex items-center gap-2 px-3 py-2 rounded-control opacity-40 cursor-not-allowed"
                            >
                              <SubIcon className="w-3.5 h-3.5 shrink-0 text-muted" />
                              <span className="text-[12px] font-semibold text-muted">{sub.label}</span>
                            </div>
                          );
                        }
                        return (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            end
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-3 py-2 rounded-control no-underline transition-colors ${
                                isActive
                                  ? 'bg-primary text-white font-bold'
                                  : 'text-heading hover:bg-primary-soft/60 hover:text-primary'
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-muted'}`} />
                                <span className="text-[12px] font-semibold">{sub.label}</span>
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Quick action */}
      <Link
        to="/clients/new"
        onClick={onClose}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn bg-heading text-white no-underline text-[13px] font-black hover:opacity-80 transition-opacity"
      >
        <HiOutlinePlus className="w-4 h-4" />
        Registrar nuevo
      </Link>

      {/* User */}
      <div className="border-t border-line pt-3 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-logo grid place-items-center bg-primary text-white font-black text-sm shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-heading m-0 truncate">{user?.name ?? 'Usuario'}</p>
          <p className="text-[11px] text-muted m-0 truncate">{user?.email ?? ''}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-8 h-8 rounded-control grid place-items-center text-muted hover:bg-red-50 hover:text-danger transition-colors cursor-pointer border-none bg-transparent shrink-0"
        >
          <HiOutlineLogout className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
