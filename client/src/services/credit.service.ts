import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse, PaginatedResponse } from '../common/types/api.types';

export const creditService = {
  async list(params: { page: number; limit: number; status?: string; sortBy?: string; order?: 'asc' | 'desc' }): Promise<PaginatedResponse<any>> {
    const response = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.credit.requests,
      { params }
    );
    return response.data;
  },

  async details(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      API_ENDPOINTS.credit.requestById(id)
    );
    return response.data.data!;
  },

  async approve(id: string): Promise<any> {
    const response = await api.patch<ApiResponse<any>>(
      API_ENDPOINTS.credit.approve(id)
    );
    return response.data.data!;
  },

  async reject(id: string, reason: string): Promise<any> {
    const response = await api.patch<ApiResponse<any>>(
      API_ENDPOINTS.credit.reject(id),
      { reason }
    );
    return response.data.data!;
  },
};

