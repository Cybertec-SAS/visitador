// ─────────────────────────────────────────────────────────────────────────────
// MOCK: jerarquía Client → Farm → Galpon (ver src/types/api.ts)
// Datos ficticios para alimentar los mockups del módulo de visitas.
// Strings en UPPERCASE emulando normalizePayload() del backend.
// ─────────────────────────────────────────────────────────────────────────────
window.MOCK_CLIENTS = [
  {
    id: 1,
    razon_social: 'AVÍCOLA EL PORVENIR S.A.S',
    nit: '900123456-7',
    farms: [
      {
        id: 11,
        nombre: 'GRANJA EL PORVENIR',
        town: 'FUSAGASUGÁ',
        department: 'CUNDINAMARCA',
        galpones: [
          { id: 111, name: 'GALPÓN NORTE', code: 'GP-01', status: 'active' },
          { id: 112, name: 'GALPÓN SUR', code: 'GP-02', status: 'active' },
          { id: 113, name: 'GALPÓN LEVANTE', code: 'GP-03', status: 'inactive' },
        ],
      },
      {
        id: 12,
        nombre: 'GRANJA LA ESMERALDA',
        town: 'SILVANIA',
        department: 'CUNDINAMARCA',
        galpones: [
          { id: 121, name: 'GALPÓN A', code: 'GA-01', status: 'active' },
          { id: 122, name: 'GALPÓN B', code: 'GA-02', status: 'active' },
        ],
      },
    ],
  },
  {
    id: 2,
    razon_social: 'INVERSIONES SANTA RITA LTDA',
    nit: '830987654-1',
    farms: [
      {
        id: 21,
        nombre: 'GRANJA SANTA RITA',
        town: 'PEREIRA',
        department: 'RISARALDA',
        galpones: [
          { id: 211, name: 'GALPÓN PRINCIPAL', code: 'SR-01', status: 'active' },
          { id: 212, name: 'GALPÓN AUXILIAR', code: 'SR-02', status: 'active' },
          { id: 213, name: 'GALPÓN CRÍA', code: 'SR-03', status: 'active' },
          { id: 214, name: 'GALPÓN ENGORDE', code: 'SR-04', status: 'active' },
        ],
      },
    ],
  },
  {
    id: 3,
    razon_social: 'GRUPO AVIAR DEL ORIENTE S.A',
    nit: '901555222-3',
    farms: [
      {
        id: 31,
        nombre: 'GRANJA EL ROBLE',
        town: 'PIEDECUESTA',
        department: 'SANTANDER',
        galpones: [
          { id: 311, name: 'GALPÓN 1', code: 'RB-01', status: 'active' },
          { id: 312, name: 'GALPÓN 2', code: 'RB-02', status: 'active' },
        ],
      },
      {
        id: 32,
        nombre: 'GRANJA MIRAFLORES',
        town: 'LEBRIJA',
        department: 'SANTANDER',
        galpones: [
          { id: 321, name: 'GALPÓN ÚNICO', code: 'MF-01', status: 'active' },
        ],
      },
    ],
  },
];
