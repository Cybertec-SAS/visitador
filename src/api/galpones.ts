import apiClient from './client';
import type { Galpon, GalponFormData, SingleResponse } from '@/types/api';
import { normalizePayload } from './payloadTransforms';

export const galponesPorGranjaApi = {
  list: async (farmId: number): Promise<SingleResponse<Galpon[]>> => {
    const response = await apiClient.get<SingleResponse<Galpon[]>>(`/farms/${farmId}/galpones`);
    return response.data;
  },

  create: async (farmId: number, data: GalponFormData): Promise<SingleResponse<Galpon>> => {
    const response = await apiClient.post<SingleResponse<Galpon>>(
      `/farms/${farmId}/galpones`,
      normalizePayload(data),
    );
    return response.data;
  },
};

export const galponesApi = {
  update: async (galponId: number, data: Partial<GalponFormData>): Promise<SingleResponse<Galpon>> => {
    const response = await apiClient.patch<SingleResponse<Galpon>>(
      `/galpones/${galponId}`,
      normalizePayload(data),
    );
    return response.data;
  },

  delete: async (galponId: number): Promise<void> => {
    await apiClient.delete(`/galpones/${galponId}`);
  },
};
