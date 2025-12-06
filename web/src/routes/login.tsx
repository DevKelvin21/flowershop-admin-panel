import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import { LoginView } from '../pages/Login/LoginView';
import { useAuth } from '../hooks/useAuth';
import { useLoginForm } from '../hooks/useLoginForm';
import { authService } from '../services';

export const Route = createFileRoute('/login')({
  component: LoginRoute,
});

function LoginRoute() {
  const { signIn, signUp, error, loading, user } = useAuth(authService);
  const navigate = useNavigate();
  const { email, password, isRegister, setEmail, setPassword, toggleRegisterMode } = useLoginForm();

  useEffect(() => {
    if (user) {
      navigate({ to: '/', replace: true });
    }
  }, [user, navigate]);

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
