import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { ApiResponse } from '../common/types/api.types';

export const analyticsService = {
  async getOverview(): Promise<{
    users: { total: number; active: number };
    credits: { total: number; byStatus: Record<string, number> };
    savings: { totalBalance: number };
    sessions: { active: number };
    logins: { last24h: number };
  }> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.analytics.overview);
    return response.data.data!;
  },
};


