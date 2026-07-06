// ─────────────────────────────────────────────────────────────────────────────
// MOCK: módulo de visitas (entidad aún NO existe en el backend).
// Estructura propuesta — ajustar cuando se defina el flujo real.
// ─────────────────────────────────────────────────────────────────────────────

// Estados de una visita → label + clases de badge (tokens del tema del proyecto)
window.VISIT_STATUS = {
  programada: { label: 'Programada', classes: 'bg-primary-soft text-primary' },
  en_curso: { label: 'En curso', classes: 'bg-amber-50 text-amber-600' },
  completada: { label: 'Completada', classes: 'bg-field-soft text-field' },
  cancelada: { label: 'Cancelada', classes: 'bg-red-50 text-danger' },
};

// Tipos de visita (alineados con los tags de reportes del Dashboard)
window.VISIT_TYPES = {
  tecnica: 'Técnica',
  instalacion: 'Instalación',
  seguimiento: 'Seguimiento',
  novedad: 'Novedad',
};

window.MOCK_TECHNICIANS = [
  { id: 1, name: 'CARLOS MENDOZA' },
  { id: 2, name: 'JULIÁN RÍOS' },
  { id: 3, name: 'ANDREA PARRA' },
];

// Visitas — client_id/farm_id referencian clients-farms.mock.js
window.MOCK_VISITS = [
  {
    id: 1, code: 'VIS-2026-014', client_id: 1, farm_id: 11,
    client: 'AVÍCOLA EL PORVENIR S.A.S', farm: 'GRANJA EL PORVENIR',
    tipo: 'tecnica', fecha_programada: '2026-07-08', hora: '09:00',
    tecnico: 'CARLOS MENDOZA', estado: 'programada', galpones_count: 2,
  },
  {
    id: 2, code: 'VIS-2026-013', client_id: 2, farm_id: 21,
    client: 'INVERSIONES SANTA RITA LTDA', farm: 'GRANJA SANTA RITA',
    tipo: 'instalacion', fecha_programada: '2026-07-06', hora: '07:30',
    tecnico: 'JULIÁN RÍOS', estado: 'en_curso', galpones_count: 4,
  },
  {
    id: 3, code: 'VIS-2026-012', client_id: 3, farm_id: 31,
    client: 'GRUPO AVIAR DEL ORIENTE S.A', farm: 'GRANJA EL ROBLE',
    tipo: 'seguimiento', fecha_programada: '2026-07-02', hora: '10:00',
    tecnico: 'ANDREA PARRA', estado: 'completada', galpones_count: 2,
  },
  {
    id: 4, code: 'VIS-2026-011', client_id: 1, farm_id: 12,
    client: 'AVÍCOLA EL PORVENIR S.A.S', farm: 'GRANJA LA ESMERALDA',
    tipo: 'novedad', fecha_programada: '2026-06-30', hora: '14:00',
    tecnico: 'CARLOS MENDOZA', estado: 'completada', galpones_count: 1,
  },
  {
    id: 5, code: 'VIS-2026-010', client_id: 3, farm_id: 32,
    client: 'GRUPO AVIAR DEL ORIENTE S.A', farm: 'GRANJA MIRAFLORES',
    tipo: 'tecnica', fecha_programada: '2026-06-27', hora: '08:00',
    tecnico: 'JULIÁN RÍOS', estado: 'cancelada', galpones_count: 1,
  },
  {
    id: 6, code: 'VIS-2026-009', client_id: 2, farm_id: 21,
    client: 'INVERSIONES SANTA RITA LTDA', farm: 'GRANJA SANTA RITA',
    tipo: 'seguimiento', fecha_programada: '2026-06-24', hora: '11:00',
    tecnico: 'ANDREA PARRA', estado: 'completada', galpones_count: 3,
  },
  {
    id: 7, code: 'VIS-2026-008', client_id: 1, farm_id: 11,
    client: 'AVÍCOLA EL PORVENIR S.A.S', farm: 'GRANJA EL PORVENIR',
    tipo: 'instalacion', fecha_programada: '2026-06-19', hora: '07:00',
    tecnico: 'CARLOS MENDOZA', estado: 'completada', galpones_count: 3,
  },
  {
    id: 8, code: 'VIS-2026-007', client_id: 3, farm_id: 31,
    client: 'GRUPO AVIAR DEL ORIENTE S.A', farm: 'GRANJA EL ROBLE',
    tipo: 'tecnica', fecha_programada: '2026-06-15', hora: '09:30',
    tecnico: 'ANDREA PARRA', estado: 'completada', galpones_count: 2,
  },
];

// Meta de paginación estilo PaginatedResponse<T> (src/types/api.ts)
window.MOCK_PAGINATION = { page: 1, per_page: 8, total: 23, last_page: 3 };
