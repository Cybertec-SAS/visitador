import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClientsListPage } from '@/pages/clients/ClientsListPage';
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage';
import { ClientFormPage } from '@/pages/clients/ClientFormPage';
import { FarmsListPage } from '@/pages/farms/FarmsListPage';
import { FarmDetailPage } from '@/pages/farms/FarmDetailPage';
import { FarmFormPage } from '@/pages/farms/FarmFormPage';
import { VisitsListPage } from '@/pages/visits/VisitsListPage';
import { VisitTypePage } from '@/pages/visits/VisitTypePage';
import { VisitFormPage } from '@/pages/visits/VisitFormPage';
import { VisitDetailPage } from '@/pages/visits/VisitDetailPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      // Clients
      { path: 'clients', element: <ClientsListPage /> },
      { path: 'clients/new', element: <ClientFormPage /> },
      { path: 'clients/:id', element: <ClientDetailPage /> },
      { path: 'clients/:id/edit', element: <ClientFormPage /> },
      // Farms
      { path: 'farms', element: <FarmsListPage /> },
      { path: 'farms/new', element: <FarmFormPage /> },
      { path: 'farms/:id', element: <FarmDetailPage /> },
      { path: 'farms/:id/edit', element: <FarmFormPage /> },
      // Visits
      { path: 'visits', element: <VisitsListPage /> },
      { path: 'visits/new', element: <VisitTypePage /> },
      { path: 'visits/new/diagnostico', element: <VisitFormPage /> },
      { path: 'visits/:id', element: <VisitDetailPage /> },
      { path: 'visits/:id/edit', element: <VisitFormPage /> },
    ],
  },
]);
