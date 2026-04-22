const BASE_URL = 'https://api-colombia.com/api/v1';

export interface ColombiaDepartment {
  id: number;
  name: string;
}

export interface ColombiaCity {
  id: number;
  name: string;
}

export async function fetchDepartments(): Promise<ColombiaDepartment[]> {
  const res = await fetch(`${BASE_URL}/Department`);
  if (!res.ok) throw new Error('Error al cargar departamentos');
  const data: ColombiaDepartment[] = await res.json();
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCitiesByDepartment(departmentId: number): Promise<ColombiaCity[]> {
  const res = await fetch(`${BASE_URL}/Department/${departmentId}/cities`);
  if (!res.ok) throw new Error('Error al cargar municipios');
  const data: ColombiaCity[] = await res.json();
  return data.sort((a, b) => a.name.localeCompare(b.name));
}
