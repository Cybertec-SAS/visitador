import apiClient from './client';
import type { VisitSystemReview, VisitSystemReviewFormData, SystemCatalog, SingleResponse } from '@/types/api';

export const visitSystemReviewsApi = {
  list(visitId: number, params?: { structure_id?: number }): Promise<VisitSystemReview[]> {
    return apiClient.get(`/visits/${visitId}/system-reviews`, { params }).then((r) => r.data);
  },

  create(visitId: number, data: Omit<VisitSystemReviewFormData, 'visit_id'>): Promise<SingleResponse<VisitSystemReview>> {
    return apiClient.post(`/visits/${visitId}/system-reviews`, data).then((r) => r.data);
  },

  update(id: number, data: Partial<VisitSystemReviewFormData>): Promise<SingleResponse<VisitSystemReview>> {
    return apiClient.put(`/visit-system-reviews/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visit-system-reviews/${id}`).then(() => undefined);
  },
};

export const systemsCatalogApi = {
  list(params?: { category?: string; is_active?: boolean }): Promise<SystemCatalog[]> {
    return apiClient.get('/systems-catalog', { params }).then((r) => r.data);
  },
};
