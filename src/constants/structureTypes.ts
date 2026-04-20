export const STRUCTURE_TYPE_OPTIONS: { code: string; name: string }[] = [
  { code: 'galpon',          name: 'Galpón' },
  { code: 'silo',            name: 'Silo' },
  { code: 'extractor',       name: 'Extractor' },
  { code: 'panel_humedo',    name: 'Panel Húmedo' },
  { code: 'cuarto_de_aguas', name: 'Cuarto de Aguas' },
  { code: 'bodega',          name: 'Bodega' },
  { code: 'oficina',         name: 'Oficina' },
  { code: 'otro',            name: 'Otro' },
];

export const STRUCTURE_TYPE_NAME: Record<string, string> = Object.fromEntries(
  STRUCTURE_TYPE_OPTIONS.map(({ code, name }) => [code, name])
);

export function getStructureTypeName(code: string): string {
  return STRUCTURE_TYPE_NAME[code] ?? code;
}
