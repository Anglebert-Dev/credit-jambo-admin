export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/admin/auth/login',
    logout: '/admin/auth/logout',
    refresh: '/admin/auth/refresh',
  },
  users: {
    list: '/admin/users',
    details: (id: string) => `/admin/users/${id}`,
    updateStatus: (id: string) => `/admin/users/${id}/status`,
    delete: (id: string) => `/admin/users/${id}`,
    profile: '/admin/users/profile',
    updateProfile: '/admin/users/profile',
    changePassword: '/admin/users/password',
  },
  savings: {
    analytics: '/admin/savings/analytics',
  },
  credit: {
    requests: '/admin/credit/requests',
    requestById: (id: string) => `/admin/credit/requests/${id}`,
    approve: (id: string) => `/admin/credit/requests/${id}/approve`,
    reject: (id: string) => `/admin/credit/requests/${id}/reject`,
  },
  notifications: {
    list: '/admin/notifications',
    markAsRead: (id: string) => `/admin/notifications/${id}/read`,
  },
  analytics: {
    overview: '/admin/analytics/overview',
  },
} as const;

