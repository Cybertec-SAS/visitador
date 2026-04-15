import apiClient from './client';
import type {
  FarmGeorreference,
  FarmGeorreferenceFormData,
  PaginatedResponse,
  SingleResponse,
} from '@/types/api';

export const georreferencesApi = {
  list: async (page = 1): Promise<PaginatedResponse<FarmGeorreference>> => {
    const response = await apiClient.get<PaginatedResponse<FarmGeorreference>>(
      '/farm-georreferences',
      { params: { page } },
    );
    return response.data;
  },

  get: async (id: number): Promise<SingleResponse<FarmGeorreference>> => {
    const response = await apiClient.get<SingleResponse<FarmGeorreference>>(
      `/farm-georreferences/${id}`,
    );
    return response.data;
  },

  create: async (
    data: FarmGeorreferenceFormData,
  ): Promise<SingleResponse<FarmGeorreference>> => {
    const response = await apiClient.post<SingleResponse<FarmGeorreference>>(
      '/farm-georreferences',
      data,
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<FarmGeorreferenceFormData, 'farm_id'>>,
  ): Promise<SingleResponse<FarmGeorreference>> => {
    const response = await apiClient.put<SingleResponse<FarmGeorreference>>(
      `/farm-georreferences/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/farm-georreferences/${id}`);
  },
};
