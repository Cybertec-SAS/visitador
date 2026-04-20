import apiClient from './client';
import type { Project, ProjectFormData, ProgressReport, PaginatedResponse, SingleResponse } from '@/types/api';

export const projectsApi = {
  list(params?: {
    client_id?: number;
    farm_id?: number;
    status?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Project>> {
    return apiClient.get('/projects', { params }).then((r) => r.data);
  },

  get(id: number): Promise<SingleResponse<Project>> {
    return apiClient.get(`/projects/${id}`).then((r) => r.data);
  },

  create(data: ProjectFormData): Promise<SingleResponse<Project>> {
    return apiClient.post('/projects', data).then((r) => r.data);
  },

  update(id: number, data: Partial<ProjectFormData>): Promise<SingleResponse<Project>> {
    return apiClient.put(`/projects/${id}`, data).then((r) => r.data);
  },

  delete(id: number): Promise<void> {
    return apiClient.delete(`/projects/${id}`).then(() => undefined);
  },

  addStructure(projectId: number, structureId: number): Promise<void> {
    return apiClient.post(`/projects/${projectId}/structures`, { structure_id: structureId }).then(() => undefined);
  },
};

export const progressReportsApi = {
  list(projectId: number): Promise<ProgressReport[]> {
    return apiClient.get(`/projects/${projectId}/progress-reports`).then((r) => r.data);
  },

  get(id: number): Promise<SingleResponse<ProgressReport>> {
    return apiClient.get(`/progress-reports/${id}`).then((r) => r.data);
  },

  create(projectId: number, data: Omit<ProgressReport, 'id' | 'project' | 'items' | 'curve_points'>): Promise<SingleResponse<ProgressReport>> {
    return apiClient.post(`/projects/${projectId}/progress-reports`, data).then((r) => r.data);
  },

  update(id: number, data: Partial<ProgressReport>): Promise<SingleResponse<ProgressReport>> {
    return apiClient.put(`/progress-reports/${id}`, data).then((r) => r.data);
  },
};
