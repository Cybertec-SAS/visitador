import apiClient from './client';
import type {
  FarmContact,
  FarmContactFormData,
  PaginatedResponse,
  SingleResponse,
} from '@/types/api';
import { normalizePayload } from './payloadTransforms';

export const farmContactsApi = {
  list: async (page = 1): Promise<PaginatedResponse<FarmContact>> => {
    const response = await apiClient.get<PaginatedResponse<FarmContact>>(
      '/farm-contacts',
      { params: { page } },
    );
    return response.data;
  },

  get: async (id: number): Promise<SingleResponse<FarmContact>> => {
    const response = await apiClient.get<SingleResponse<FarmContact>>(
      `/farm-contacts/${id}`,
    );
    return response.data;
  },

  create: async (
    data: FarmContactFormData,
  ): Promise<SingleResponse<FarmContact>> => {
    const response = await apiClient.post<SingleResponse<FarmContact>>(
      '/farm-contacts',
      normalizePayload(data),
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Omit<FarmContactFormData, 'farm_id'>>,
  ): Promise<SingleResponse<FarmContact>> => {
    const response = await apiClient.put<SingleResponse<FarmContact>>(
      `/farm-contacts/${id}`,
      normalizePayload(data),
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/farm-contacts/${id}`);
  },
};
