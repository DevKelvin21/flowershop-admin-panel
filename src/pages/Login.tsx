import { LoginView } from '../components/LoginView';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services';

export function LoginPage() {
  const { email, password, isRegister, error, setEmail, setPassword, handleLogin, handleRegister, toggleRegisterMode, loading } = useAuth(authService);

  return <LoginView onLogin={handleLogin} onRegister={handleRegister} onToggleRegisterMode={toggleRegisterMode} error={error} email={email} password={password} isRegister={isRegister} setEmail={setEmail} setPassword={setPassword} loading={loading} />;
}
