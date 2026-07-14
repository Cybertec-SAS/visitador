import apiClient from './client';
import type {
  Visit,
  VisitFormData,
  PaginatedResponse,
  SingleResponse,
} from '@/types/api';

/**
 * API de visitas. A diferencia de clients/farms, el payload NO pasa por
 * `normalizePayload`: el backend guarda las secciones (contacto, control,
 * informe, etc.) verbatim, y ese helper uppercasea strings recursivamente
 * (rompería los enums `b/r/m/n`, `si/no/na` y el texto libre). Ver
 * `docs/visitas-backend.md` §7 (Diferencias vs. contrato).
 */
export const visitsApi = {
  list: async (
    page = 1,
    extra?: { client_id?: number; farm_id?: number; status?: string; type?: string; per_page?: number },
  ): Promise<PaginatedResponse<Visit>> => {
    const response = await apiClient.get<PaginatedResponse<Visit>>('/visits', {
      params: { page, ...extra },
    });
    return response.data;
  },

  get: async (id: number): Promise<SingleResponse<Visit>> => {
    const response = await apiClient.get<SingleResponse<Visit>>(`/visits/${id}`);
    return response.data;
  },

  create: async (data: VisitFormData): Promise<SingleResponse<Visit>> => {
    const response = await apiClient.post<SingleResponse<Visit>>('/visits', data);
    return response.data;
  },

  update: async (id: number, data: Partial<VisitFormData>): Promise<SingleResponse<Visit>> => {
    const response = await apiClient.patch<SingleResponse<Visit>>(`/visits/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/visits/${id}`);
  },
};
