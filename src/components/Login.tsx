import { useEffect, useState } from 'react';
import { auth } from '../db/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

function Login() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError('Error al cerrar sesión.');
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-center gap-2 my-8">
        <img src={user.photoURL || ''} alt={user.displayName ? `${user.displayName}'s avatar` : 'User avatar'} className="w-16 h-16 rounded-full" />
        <div className="text-lg font-semibold">{user.displayName || user.email}</div>
        <button className="px-4 py-2 bg-rose-600 text-white rounded" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 my-16">
      <h2 className="text-2xl font-bold text-rose-700">{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h2>
      <form className="flex flex-col gap-3 w-72" onSubmit={isRegister ? handleRegister : handleLogin}>
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
        onClick={() => setIsRegister(r => !r)}
      >
        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
}

export default Login;
