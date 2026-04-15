import { useAuth } from '@/context/AuthContext';
import { HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineClipboardList } from 'react-icons/hi';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[28px] font-bold text-heading m-0 max-[640px]:text-2xl">Dashboard</h2>
        <p className="mt-1.5 text-sm text-muted">
          Bienvenido, <span className="font-medium">{user?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 min-[640px]:grid-cols-3 gap-3.5">
        <div className="border border-line rounded-section p-4.5 bg-white">
          <HiOutlineUserGroup className="w-8 h-8 text-primary" />
          <h3 className="mt-2 text-base font-semibold text-heading">Clientes</h3>
          <p className="text-[13px] text-muted">Gestiona los clientes del sistema</p>
        </div>
        <div className="border border-line rounded-section p-4.5 bg-white">
          <HiOutlineOfficeBuilding className="w-8 h-8 text-primary" />
          <h3 className="mt-2 text-base font-semibold text-heading">Granjas</h3>
          <p className="text-[13px] text-muted">Administra las granjas registradas</p>
        </div>
        <div className="border border-line rounded-section p-4.5 bg-white">
          <HiOutlineClipboardList className="w-8 h-8 text-primary" />
          <h3 className="mt-2 text-base font-semibold text-heading">Contactos</h3>
          <p className="text-[13px] text-muted">Contactos asociados a granjas</p>
        </div>
      </div>
    </div>
  );
}
