import apiClient from './client';
import type {
  Client,
  ClientFormData,
  PaginatedResponse,
  SingleResponse,
} from '@/types/api';

export const clientsApi = {
  list: async (page = 1): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients', {
      params: { page },
    });
    return response.data;
  },

  get: async (id: number): Promise<SingleResponse<Client>> => {
    const response = await apiClient.get<SingleResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: ClientFormData): Promise<SingleResponse<Client>> => {
    const response = await apiClient.post<SingleResponse<Client>>('/clients', data);
    return response.data;
  },

  update: async (id: number, data: Partial<ClientFormData>): Promise<SingleResponse<Client>> => {
    const response = await apiClient.put<SingleResponse<Client>>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};
