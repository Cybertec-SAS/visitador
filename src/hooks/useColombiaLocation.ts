import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchDepartments,
  fetchCitiesByDepartment,
  type ColombiaDepartment,
  type ColombiaCity,
} from '@/api/colombiaApi';

interface UseColombiaLocationReturn {
  departments: ColombiaDepartment[];
  cities: ColombiaCity[];
  loadingDepartments: boolean;
  loadingCities: boolean;
  selectedDepartmentId: number | null;
  setSelectedDepartmentId: (id: number | null) => void;
  /** Set the selected department by name. Safe to call before departments load. */
  setDepartmentByName: (name: string | null | undefined) => void;
}

export function useColombiaLocation(initialDepartmentName?: string): UseColombiaLocationReturn {
  const [departments, setDepartments] = useState<ColombiaDepartment[]>([]);
  const [cities, setCities] = useState<ColombiaCity[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  // Holds a pending department name to be resolved once departments are loaded
  const pendingName = useRef<string | null>(initialDepartmentName ?? null);

  const resolveName = useCallback((name: string | null | undefined, data: ColombiaDepartment[]) => {
    if (!name) return;
    const match = data.find((d) => d.name.toLowerCase() === name.toLowerCase());
    if (match) setSelectedDepartmentId(match.id);
  }, []);

  useEffect(() => {
    setLoadingDepartments(true);
    fetchDepartments()
      .then((data) => {
        setDepartments(data);
        if (pendingName.current) {
          resolveName(pendingName.current, data);
          pendingName.current = null;
        }
      })
      .catch(() => {/* silently fail */})
      .finally(() => setLoadingDepartments(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDepartmentId == null) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    fetchCitiesByDepartment(selectedDepartmentId)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [selectedDepartmentId]);

  const setDepartmentByName = useCallback((name: string | null | undefined) => {
    if (!name) { setSelectedDepartmentId(null); return; }
    if (departments.length > 0) {
      resolveName(name, departments);
    } else {
      // Departments not yet loaded — store for later
      pendingName.current = name;
    }
  }, [departments, resolveName]);

  return {
    departments,
    cities,
    loadingDepartments,
    loadingCities,
    selectedDepartmentId,
    setSelectedDepartmentId,
    setDepartmentByName,
  };
}
