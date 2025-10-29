import { useAuthStore } from '../../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isInitialized, login, logout, setUser } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    setUser,
  };
};

