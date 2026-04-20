import apiClient from './client';
import type { Structure, StructureFormData, SingleResponse } from '@/types/api';

export const structuresApi = {
  list(params?: { farm_id?: number; status?: string; parent_only?: boolean }): Promise<Structure[]> {
    return apiClient.get('/structures', { params }).then((r) => r.data);
  },

  get(id: number): Promise<SingleResponse<Structure>> {
    return apiClient.get(`/structures/${id}`).then((r) => r.data);
  },

  create(data: StructureFormData): Promise<SingleResponse<Structure>> {
    return apiClient.post('/structures', data).then((r) => r.data);
  },

  update(id: number, data: Partial<StructureFormData>): Promise<SingleResponse<Structure>> {
    return apiClient.put(`/structures/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/structures/${id}`).then(() => undefined);
  },
};
