import apiClient from './client';
import type { VisitMeasurement, VisitMeasurementFormData, SingleResponse } from '@/types/api';

export const visitMeasurementsApi = {
  list(visitId: number): Promise<VisitMeasurement[]> {
    return apiClient.get(`/visits/${visitId}/measurements`).then((r) => r.data);
  },

  create(visitId: number, data: Omit<VisitMeasurementFormData, 'visit_id'>): Promise<SingleResponse<VisitMeasurement>> {
    return apiClient.post(`/visits/${visitId}/measurements`, data).then((r) => r.data);
  },

  update(id: number, data: Partial<VisitMeasurementFormData>): Promise<SingleResponse<VisitMeasurement>> {
    return apiClient.put(`/visit-measurements/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/visit-measurements/${id}`).then(() => undefined);
  },
};
