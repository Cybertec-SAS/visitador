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
import { StructuresListPage } from '@/pages/structures/StructuresListPage';
import { StructureDetailPage } from '@/pages/structures/StructureDetailPage';
import { StructureFormPage } from '@/pages/structures/StructureFormPage';
import { VisitsListPage } from '@/pages/visits/VisitsListPage';
import { VisitFormPage } from '@/pages/visits/VisitFormPage';
import { VisitDetailPage } from '@/pages/visits/VisitDetailPage';
import { VisitCapturePage } from '@/pages/visits/VisitCapturePage';
import { VisitaInicialPage } from '@/pages/visits/VisitaInicialPage';
import { ProjectsListPage } from '@/pages/projects/ProjectsListPage';
import { ProjectFormPage } from '@/pages/projects/ProjectFormPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';

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
      // Structures
      { path: 'structures', element: <StructuresListPage /> },
      { path: 'structures/new', element: <StructureFormPage /> },
      { path: 'structures/:id', element: <StructureDetailPage /> },
      { path: 'structures/:id/edit', element: <StructureFormPage /> },
      // Visits
      { path: 'visits', element: <VisitsListPage /> },
      { path: 'visits/new', element: <VisitFormPage /> },
      { path: 'visits/:id', element: <VisitDetailPage /> },
      { path: 'visits/:id/edit', element: <VisitFormPage /> },
      { path: 'visits/:id/capture', element: <VisitCapturePage /> },
      { path: 'visits/:id/visita-inicial', element: <VisitaInicialPage /> },
      // Projects
      { path: 'projects', element: <ProjectsListPage /> },
      { path: 'projects/new', element: <ProjectFormPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'projects/:id/edit', element: <ProjectFormPage /> },
    ],
  },
]);
