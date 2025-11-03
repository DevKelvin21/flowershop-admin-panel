import { useCallback, useEffect, useState } from 'react';
import type { AuthService } from '../auth/auth.service';
import type { AuthUser } from '../shared/models/auth';

export function useAuth(authService: AuthService) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authService]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const authUser = await authService.signIn(email, password);
      setUser(authUser);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(errorMessage);
    }
  }, [authService, email, password]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const authUser = await authService.signUp(email, password);
      setUser(authUser);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario.';
      setError(errorMessage);
    }
  }, [authService, email, password]);

  const handleLogout = useCallback(async () => {
    setError(null);
    
    try {
      await authService.signOut();
      setUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión.';
      setError(errorMessage);
    }
  }, [authService]);

  const toggleRegisterMode = useCallback(() => {
    setIsRegister(prev => !prev);
    setError(null);
  }, []);

  return {
    // State
    user,
    loading,
    error,
    email,
    password,
    isRegister,
    
    // Setters
    setEmail,
    setPassword,
    setIsRegister,
    
    // Handlers
    handleLogin,
    handleRegister,
    handleLogout,
    toggleRegisterMode,
    
    // Utility
    clearError: () => setError(null),
  };
}

