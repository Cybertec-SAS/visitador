import apiClient from './client';
import type { VisitMaterialRequest, VisitMaterialRequestFormData, SingleResponse } from '@/types/api';

export const visitMaterialRequestsApi = {
  list(visitId: number): Promise<VisitMaterialRequest[]> {
    return apiClient.get(`/visits/${visitId}/material-requests`).then((r) => r.data);
  },

  create(visitId: number, data: Omit<VisitMaterialRequestFormData, 'visit_id'>): Promise<SingleResponse<VisitMaterialRequest>> {
    return apiClient.post(`/visits/${visitId}/material-requests`, data).then((r) => r.data);
  },

  update(id: number, data: Partial<VisitMaterialRequestFormData>): Promise<SingleResponse<VisitMaterialRequest>> {
    return apiClient.put(`/visit-material-requests/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visit-material-requests/${id}`).then(() => undefined);
  },
};
