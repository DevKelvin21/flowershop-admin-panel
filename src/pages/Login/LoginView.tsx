import { ErrorMessage } from '../../components/ErrorMessage';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface LoginViewProps {
    onLogin: (e: React.FormEvent) => void;
    onRegister: (e: React.FormEvent) => void;
    onToggleRegisterMode: () => void;
    error: string | null;
    email: string;
    password: string;
    isRegister: boolean;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    loading: boolean;
}

export function LoginView({ onLogin, onRegister, onToggleRegisterMode, error, email, password, isRegister, setEmail, setPassword, loading }: LoginViewProps) {

    if (loading) return <LoadingSpinner />;
    if (error && !loading) return <ErrorMessage error={error} />;

    return (
        <div className="flex flex-col items-center gap-4 my-16">
            <h2 className="text-2xl font-bold text-rose-700">{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h2>
            <form className="flex flex-col gap-3 w-72" onSubmit={isRegister ? onRegister : onLogin}>
                <input
                    type="email"
                    className="border border-rose-200 rounded px-3 py-2"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    className="border border-rose-200 rounded px-3 py-2"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <button
                    type="submit"
                    className="px-6 py-3 bg-rose-600 text-white rounded text-lg"
                >
                    {isRegister ? 'Registrarse' : 'Iniciar sesión'}
                </button>
            </form>
            <button
                className="text-rose-700 underline mt-2"
                onClick={onToggleRegisterMode}
            >
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
        </div>
    );
}
