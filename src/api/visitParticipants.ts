import apiClient from './client';
import type { VisitParticipant, VisitParticipantFormData, SingleResponse } from '@/types/api';

export const visitParticipantsApi = {
  list(visitId: number): Promise<VisitParticipant[]> {
    return apiClient.get(`/visits/${visitId}/participants`).then((r) => r.data);
  },

  create(visitId: number, data: Omit<VisitParticipantFormData, 'visit_id'>): Promise<SingleResponse<VisitParticipant>> {
    return apiClient.post(`/visits/${visitId}/participants`, data).then((r) => r.data);
  },

  update(id: number, data: Partial<VisitParticipantFormData>): Promise<SingleResponse<VisitParticipant>> {
    return apiClient.put(`/visit-participants/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visit-participants/${id}`).then(() => undefined);
  },
};
