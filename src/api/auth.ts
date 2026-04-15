import apiClient from './client';
import type { LoginRequest, LoginResponse, LogoutResponse, User } from '@/types/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', data);
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>('/logout');
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/me');
    return response.data;
  },
};
