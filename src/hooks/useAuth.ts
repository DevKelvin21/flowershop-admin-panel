import { useCallback, useEffect, useState } from 'react';
import type { AuthService } from '../auth/auth.service';
import type { AuthUser } from '../shared/models/auth';

/**
 * Hook for managing authentication state and operations
 * Focused solely on authentication concerns, not form UI
 */
export function useAuth(authService: AuthService) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authService]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const authUser = await authService.signIn(email, password);
      setUser(authUser);
      return authUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(errorMessage);
      throw err;
    }
  }, [authService]);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const authUser = await authService.signUp(email, password);
      setUser(authUser);
      return authUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario.';
      setError(errorMessage);
      throw err;
    }
  }, [authService]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authService.signOut();
      setUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión.';
      setError(errorMessage);
      throw err;
    }
  }, [authService]);

  return {
    // State
    user,
    loading,
    error,

    // Actions
    signIn,
    signUp,
    signOut,

    // Utility
    clearError: () => setError(null),
  };
}

