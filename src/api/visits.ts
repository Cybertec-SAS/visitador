import apiClient from './client';
import type { Visit, VisitFormData, VisitUpdateData, VisitStatus, PaginatedResponse, SingleResponse } from '@/types/api';

export const visitsApi = {
  list(params?: {
    client_id?: number;
    farm_id?: number;
    visit_type_id?: number;
    status?: string;
    assigned_to?: number;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Visit>> {
    return apiClient.get('/visits', { params }).then((r) => r.data);
  },

  get(id: number): Promise<SingleResponse<Visit>> {
    return apiClient.get(`/visits/${id}`).then((r) => r.data);
  },

  create(data: VisitFormData): Promise<SingleResponse<Visit>> {
    return apiClient.post('/visits', data).then((r) => r.data);
  },

  update(id: number, data: VisitUpdateData): Promise<SingleResponse<Visit>> {
    return apiClient.put(`/visits/${id}`, data).then((r) => r.data);
  },

  updateStatus(id: number, status: VisitStatus): Promise<SingleResponse<Visit>> {
    return apiClient.patch(`/visits/${id}/status`, { status }).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visits/${id}`).then(() => undefined);
  },
};
