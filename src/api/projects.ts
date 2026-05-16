import apiClient from './client';
import type { Project, ProjectFormData, PaginatedResponse, SingleResponse } from '@/types/api';
import { normalizePayload } from './payloadTransforms';

export const projectsApi = {
  list: async (page = 1, extra?: { client_id?: number; farm_id?: number; per_page?: number }): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects', {
      params: { page, ...extra },
    });
    return response.data;
  },

  get: async (id: number): Promise<SingleResponse<Project>> => {
    const response = await apiClient.get<SingleResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: ProjectFormData): Promise<SingleResponse<Project>> => {
    const response = await apiClient.post<SingleResponse<Project>>('/projects', normalizePayload(data));
    return response.data;
  },

  update: async (id: number, data: Partial<ProjectFormData>): Promise<SingleResponse<Project>> => {
    const response = await apiClient.patch<SingleResponse<Project>>(`/projects/${id}`, normalizePayload(data));
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
