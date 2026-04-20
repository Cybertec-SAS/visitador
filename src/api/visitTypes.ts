import apiClient from './client';
import type { VisitType } from '@/types/api';

export const visitTypesApi = {
  list(): Promise<VisitType[]> {
    return apiClient.get('/visit-types').then((r) => r.data);
  },
};
