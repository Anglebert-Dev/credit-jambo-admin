import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { UserProfile, UpdateProfileDto, ChangePasswordDto } from '../common/types/user.types';
import type { PaginatedResponse } from '../common/types/api.types';
import type { ApiResponse } from '../common/types/api.types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>(
      API_ENDPOINTS.users.profile
    );
    return response.data.data!;
  },

  async list(params: { page: number; limit: number; role?: string; status?: string; email?: string; sortBy?: string; order?: 'asc' | 'desc'; }): Promise<PaginatedResponse<any>> {
    const response = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.users.list,
      { params }
    );
    return response.data;
  },

  async details(id: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      API_ENDPOINTS.users.details(id)
    );
    return response.data.data!;
  },

  async updateStatus(id: string, status: string): Promise<any> {
    const response = await api.patch<ApiResponse<any>>(
      API_ENDPOINTS.users.updateStatus(id),
      { status }
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.users.delete(id));
  },

  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const response = await api.put<ApiResponse<UserProfile>>(
      API_ENDPOINTS.users.updateProfile,
      data
    );
    return response.data.data!;
  },

  async changePassword(data: ChangePasswordDto): Promise<void> {
    await api.patch(API_ENDPOINTS.users.changePassword, data);
  },
};

