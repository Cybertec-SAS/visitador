import apiClient from './client';
import type {
  Farm,
  FarmFormData,
  PaginatedResponse,
  SingleResponse,
} from '@/types/api';

export const farmsApi = {
  list: async (page = 1, extra?: { client_id?: number; per_page?: number }): Promise<PaginatedResponse<Farm>> => {
    const response = await apiClient.get<PaginatedResponse<Farm>>('/farms', {
      params: { page, ...extra },
    });
    return response.data;
  },

  get: async (id: number): Promise<SingleResponse<Farm>> => {
    const response = await apiClient.get<SingleResponse<Farm>>(`/farms/${id}`);
    return response.data;
  },

  create: async (data: FarmFormData): Promise<SingleResponse<Farm>> => {
    const response = await apiClient.post<SingleResponse<Farm>>('/farms', data);
    return response.data;
  },

  update: async (id: number, data: Partial<FarmFormData>): Promise<SingleResponse<Farm>> => {
    const response = await apiClient.patch<SingleResponse<Farm>>(`/farms/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/farms/${id}`);
  },
};
