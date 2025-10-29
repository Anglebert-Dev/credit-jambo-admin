export const ROUTES = {
  LOGIN: '/login',

  DASHBOARD: '/dashboard',
  USERS: '/users',
  USER_DETAILS: (id: string) => `/users/${id}`,
  CREDITS: '/credits',
  CREDIT_DETAILS: (id: string) => `/credits/${id}`,
  
  NOTIFICATIONS: '/notifications',
  
  PROFILE: '/profile',
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.CREDITS,
  ROUTES.NOTIFICATIONS,
  ROUTES.PROFILE,
];

