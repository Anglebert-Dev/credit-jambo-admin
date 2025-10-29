import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ROUTES } from '../config/routes.config';
import { PrivateRoute } from './PrivateRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Loader } from '../common/components/Loader';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const UsersPage = lazy(() => import('../pages/users/UsersPage'));
const UserDetailsPage = lazy(() => import('../pages/users/UserDetailsPage'));
const CreditsPage = lazy(() => import('../pages/credits/CreditsPage'));
const CreditDetailsPage = lazy(() => import('../pages/credits/CreditDetailsPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader fullScreen size="lg" />}>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />

          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.USERS}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_DETAILS(':id')}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <UserDetailsPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
    
          <Route
            path={ROUTES.CREDITS}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <CreditsPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CREDIT_DETAILS(':id')}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <CreditDetailsPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.PROFILE}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

