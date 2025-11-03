import { LoginView } from '../components/LoginView';
import { useAuth } from '../hooks/useAuth';
import { useLoginForm } from '../hooks/useLoginForm';
import { authService } from '../services';
import { useCallback } from 'react';

/**
 * Container component for Login page
 * Separates authentication logic from presentation
 */
export function LoginPage() {
  /**
   * Authentication logic: sign in and sign up
   * Error handling and loading state are managed by the useAuth hook
   */
  const { signIn, signUp, error, loading } = useAuth(authService);

  /**
   * Login form state: email, password, isRegister, setEmail, setPassword, toggleRegisterMode
   */
  const { email, password, isRegister, setEmail, setPassword, toggleRegisterMode } = useLoginForm();

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  }, [signIn, email, password]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password);
  }, [signUp, email, password]);

  return (
    <LoginView
      onLogin={handleLogin}
      onRegister={handleRegister}
      onToggleRegisterMode={toggleRegisterMode}
      error={error}
      email={email}
      password={password}
      isRegister={isRegister}
      setEmail={setEmail}
      setPassword={setPassword}
      loading={loading}
    />
  );
}
