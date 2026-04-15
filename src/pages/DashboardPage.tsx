import { useAuth } from '@/context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Bienvenido, <span className="font-medium">{user?.name}</span>
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl">👥</div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Clientes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona los clientes del sistema</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl">🏡</div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Granjas</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Administra las granjas registradas</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl">📋</div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Contactos</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Contactos asociados a granjas</p>
        </div>
      </div>
    </div>
  );
}
