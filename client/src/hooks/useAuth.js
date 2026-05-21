import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, loading, error, loginWithGoogle, loginWithEmail, signUpWithEmail, logout, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

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
