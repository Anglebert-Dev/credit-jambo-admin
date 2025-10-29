import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../common/types/api.types';

export const savingsService = {
  async getAnalytics(): Promise<{ totalBalance: number; totalAccounts: number; depositsCount: number; withdrawalsCount: number }> {
    const response = await api.get<ApiResponse<{ totalBalance: number; totalAccounts: number; depositsCount: number; withdrawalsCount: number }>>(
      API_ENDPOINTS.savings.analytics
    );
    return response.data.data!;
  },
};

