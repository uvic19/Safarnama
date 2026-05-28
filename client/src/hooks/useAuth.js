import { useAuthStore } from '../stores/authStore';

/**
 * Reads auth state from the Zustand store.
 * The auth listener is initialized once in main.jsx; this hook is purely reactive.
 */
export function useAuth() {
  const { user, loading, error, loginWithGoogle, loginWithEmail, signUpWithEmail, logout } = useAuthStore();

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout,
    isAuthenticated: !!user,
  };
}

