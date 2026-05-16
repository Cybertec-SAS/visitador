import apiClient from './client';
import type { GalponSystem, GalponSystemFormData, SingleResponse } from '@/types/api';
import { normalizePayload } from './payloadTransforms';

export const galponSystemsApi = {
  create: async (galponId: number, data: GalponSystemFormData): Promise<SingleResponse<GalponSystem>> => {
    const response = await apiClient.post<SingleResponse<GalponSystem>>(
      `/galpones/${galponId}/systems`,
      normalizePayload(data),
    );
    return response.data;
  },

  update: async (id: number, data: Partial<GalponSystemFormData>): Promise<SingleResponse<GalponSystem>> => {
    const response = await apiClient.patch<SingleResponse<GalponSystem>>(
      `/galpon-systems/${id}`,
      normalizePayload(data),
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/galpon-systems/${id}`);
  },
};
