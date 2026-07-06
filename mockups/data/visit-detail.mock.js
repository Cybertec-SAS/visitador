// ─────────────────────────────────────────────────────────────────────────────
// MOCK: detalle de una visita individual (vista de detalle).
// Corresponde a VIS-2026-013 de visits.mock.js — visita "en curso" para
// mostrar el checklist de ejecución a medio completar.
// ─────────────────────────────────────────────────────────────────────────────
window.MOCK_VISIT_DETAIL = {
  id: 2,
  code: 'VIS-2026-013',
  estado: 'en_curso',
  tipo: 'instalacion',
  fecha_programada: '2026-07-06',
  hora: '07:30',
  tecnico: { id: 2, name: 'JULIÁN RÍOS' },
  acompanante: 'PEDRO GÓMEZ (ADMINISTRADOR)',
  notificar_cliente: true,
  llegada_at: '07:42',
  observations: 'LLEVAR ESCALERA DE 6M. EL CLIENTE SOLICITA REVISAR TAMBIÉN EL TABLERO ELÉCTRICO PRINCIPAL.',

  client: { id: 2, razon_social: 'INVERSIONES SANTA RITA LTDA', nit: '830987654-1' },
  farm: {
    id: 21,
    nombre: 'GRANJA SANTA RITA',
    town: 'PEREIRA',
    department: 'RISARALDA',
    address: 'VEREDA LA FLORIDA KM 8 VÍA CERRITOS',
  },

  // Checklist de ejecución (patrón del banner guiado de FarmDetailPage ?new=1)
  checklist: [
    { key: 'programacion', label: 'Programación confirmada', hint: 'Fecha y técnico asignados', done: true },
    { key: 'llegada', label: 'Llegada registrada', hint: 'Hora de ingreso a la granja', done: true },
    { key: 'galpones', label: 'Galpones revisados', hint: '2 de 4 completados', done: false },
    { key: 'informe', label: 'Informe generado', hint: 'Resumen y hallazgos de la visita', done: false },
  ],

  // Galpones incluidos en el alcance de la visita
  galpones: [
    {
      id: 211, name: 'GALPÓN PRINCIPAL', code: 'SR-01', revision: 'revisado', revisado_at: '08:15',
      sistemas: [
        { name: 'COMEDEROS AUTOMÁTICOS', quantity: 4, estado: 'ok', notas: 'FUNCIONANDO CORRECTAMENTE' },
        { name: 'BEBEDEROS NIPLE', quantity: 6, estado: 'atencion', notas: 'FUGA EN LÍNEA 3, REQUIERE EMPAQUE' },
      ],
      notas: 'ESTRUCTURA EN BUEN ESTADO GENERAL.',
    },
    {
      id: 212, name: 'GALPÓN AUXILIAR', code: 'SR-02', revision: 'revisado', revisado_at: '09:30',
      sistemas: [
        { name: 'VENTILADORES TÚNEL', quantity: 8, estado: 'ok', notas: '' },
      ],
      notas: '',
    },
    {
      id: 213, name: 'GALPÓN CRÍA', code: 'SR-03', revision: 'pendiente', revisado_at: null,
      sistemas: [],
      notas: '',
    },
    {
      id: 214, name: 'GALPÓN ENGORDE', code: 'SR-04', revision: 'pendiente', revisado_at: null,
      sistemas: [],
      notas: '',
    },
  ],

  // Hallazgos registrados durante la visita (anticipa el módulo Reportes)
  hallazgos: [
    {
      id: 1, severidad: 'media', galpon: 'GALPÓN PRINCIPAL',
      titulo: 'FUGA EN LÍNEA DE BEBEDEROS',
      descripcion: 'LA LÍNEA 3 DE BEBEDEROS NIPLE PRESENTA FUGA CONSTANTE. SE REQUIERE CAMBIO DE EMPAQUE Y REVISIÓN DEL REGULADOR DE PRESIÓN.',
    },
    {
      id: 2, severidad: 'baja', galpon: 'GALPÓN AUXILIAR',
      titulo: 'CORTINA LATERAL DESGASTADA',
      descripcion: 'DESGASTE EN LA CORTINA DEL COSTADO NORTE. NO COMPROMETE LA OPERACIÓN, PROGRAMAR CAMBIO EN PRÓXIMA VISITA.',
    },
  ],
};

// Metadatos de severidad de hallazgos → badge
window.FINDING_SEVERITY = {
  alta: { label: 'Alta', classes: 'bg-red-50 text-danger' },
  media: { label: 'Media', classes: 'bg-report-soft text-report' },
  baja: { label: 'Baja', classes: 'bg-amber-50 text-amber-600' },
};
