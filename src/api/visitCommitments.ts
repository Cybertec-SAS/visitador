import apiClient from './client';
import type { VisitCommitment, VisitCommitmentFormData, SingleResponse } from '@/types/api';

export const visitCommitmentsApi = {
  list(visitId: number, params?: { status?: string; responsible_type?: string }): Promise<VisitCommitment[]> {
    return apiClient.get(`/visits/${visitId}/commitments`, { params }).then((r) => r.data);
  },

  // Vista global de compromisos (dashboard/supervisor)
  listAll(params?: { status?: string; responsible_type?: string; responsible_user_id?: number; due_before?: string }): Promise<VisitCommitment[]> {
    return apiClient.get('/commitments', { params }).then((r) => r.data);
  },

  create(visitId: number, data: Omit<VisitCommitmentFormData, 'visit_id'>): Promise<SingleResponse<VisitCommitment>> {
    return apiClient.post(`/visits/${visitId}/commitments`, data).then((r) => r.data);
  },

  update(id: number, data: Partial<VisitCommitmentFormData>): Promise<SingleResponse<VisitCommitment>> {
    return apiClient.put(`/visit-commitments/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visit-commitments/${id}`).then(() => undefined);
  },
};
