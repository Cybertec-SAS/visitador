import apiClient from './client';
import type { VisitFinding, VisitFindingFormData, SingleResponse } from '@/types/api';

export const visitFindingsApi = {
  list(visitId: number): Promise<VisitFinding[]> {
    return apiClient.get(`/visits/${visitId}/findings`).then((r) => r.data);
  },

  create(visitId: number, data: Omit<VisitFindingFormData, 'visit_id'>): Promise<SingleResponse<VisitFinding>> {
    return apiClient.post(`/visits/${visitId}/findings`, data).then((r) => r.data);
  },

  update(id: number, data: Partial<VisitFindingFormData>): Promise<SingleResponse<VisitFinding>> {
    return apiClient.put(`/visit-findings/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visit-findings/${id}`).then(() => undefined);
  },
};
