import apiClient from './client';
import type { SystemCatalog, PaginatedResponse } from '@/types/api';

export const systemsCatalogApi = {
  list: async (): Promise<PaginatedResponse<SystemCatalog>> => {
    const response = await apiClient.get<PaginatedResponse<SystemCatalog>>('/systems-catalog', {
      params: { per_page: 100 },
    });
    return response.data;
  },
};
