import apiClient from './client';
import type { VisitStructure, VisitStructureFormData, SingleResponse } from '@/types/api';

export const visitStructuresApi = {
  list(visitId: number): Promise<VisitStructure[]> {
    return apiClient.get(`/visits/${visitId}/structures`).then((r) => r.data);
  },

  create(visitId: number, data: { structure_id: number; role?: VisitStructureFormData['role']; notes?: string | null }): Promise<SingleResponse<VisitStructure>> {
    return apiClient.post(`/visits/${visitId}/structures`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visit-structures/${id}`).then(() => undefined);
  },
};
